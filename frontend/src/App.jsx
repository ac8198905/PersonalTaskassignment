import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchTasks, createTask, updateTask, deleteTask } from './services/taskApi';
import { useToast } from './components/ErrorMessage';
import LoadingState from './components/LoadingState';
import FilterBar from './components/FilterBar';
import TaskList from './components/TaskList';
import TaskForm from './components/TaskForm';

export default function App() {
  // ——— State ———
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & sorting
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [order, setOrder] = useState('desc');

  // Form
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Per-task request tracking
  const [updatingTaskId, setUpdatingTaskId] = useState(null);
  const [deletingTaskId, setDeletingTaskId] = useState(null);

  // Toast
  const { addToast, ToastContainer } = useToast();
  const addToastRef = useRef(addToast);
  addToastRef.current = addToast;

  const statusFilterRef = useRef(statusFilter);
  statusFilterRef.current = statusFilter;

  // ——— Load tasks (always fetch ALL for kanban view) ———
  const loadTasks = useCallback(async () => {
    try {
      setError(null);
      const params = {};
      // For kanban view, we need all tasks to group into columns
      // Only apply sort params, not status filter (we group client-side)
      if (sortBy) {
        params.sortBy = sortBy;
        params.order = order;
      }

      const result = await fetchTasks(params);
      setTasks(result.data);
    } catch (err) {
      setError(err.message);
      addToastRef.current('Unable to load tasks. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  }, [sortBy, order]);

  useEffect(() => {
    setLoading(true);
    loadTasks();
  }, [loadTasks]);

  // ——— Create task ———
  const handleCreate = async (taskData) => {
    setIsSubmitting(true);
    try {
      await createTask(taskData);
      await loadTasks();
      setShowForm(false);
      addToastRef.current('Task created successfully!', 'success');
    } catch (err) {
      addToastRef.current(err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ——— Update task (full edit) ———
  const handleUpdate = async (taskData) => {
    if (!editingTask) return;
    setIsSubmitting(true);
    try {
      const result = await updateTask(editingTask._id, taskData);
      setTasks((prev) =>
        prev.map((t) => (t._id === editingTask._id ? result.data : t))
      );
      setEditingTask(null);
      setShowForm(false);
      addToastRef.current('Task updated successfully!', 'success');
    } catch (err) {
      addToastRef.current(err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ——— Status change (inline / checkbox / menu) ———
  const handleStatusChange = async (taskId, newStatus) => {
    const previousTask = tasks.find((t) => t._id === taskId);
    if (!previousTask || previousTask.status === newStatus) return;

    setUpdatingTaskId(taskId);

    // Optimistic update — task moves to new column immediately
    setTasks((prev) =>
      prev.map((t) => (t._id === taskId ? { ...t, status: newStatus } : t))
    );

    try {
      const result = await updateTask(taskId, { status: newStatus });
      setTasks((prev) =>
        prev.map((t) => (t._id === taskId ? result.data : t))
      );
      addToastRef.current('Task updated successfully!', 'success');
    } catch (err) {
      // Rollback
      setTasks((prev) =>
        prev.map((t) => (t._id === taskId ? previousTask : t))
      );
      addToastRef.current(err.message, 'error');
    } finally {
      setUpdatingTaskId(null);
    }
  };

  // ——— Delete task ———
  const handleDelete = async (taskId) => {
    setDeletingTaskId(taskId);
    try {
      await deleteTask(taskId);
      setTasks((prev) => prev.filter((t) => t._id !== taskId));
      addToastRef.current('Task deleted successfully!', 'success');
    } catch (err) {
      addToastRef.current(err.message, 'error');
    } finally {
      setDeletingTaskId(null);
    }
  };

  // ——— Handlers ———
  const handleEditClick = (task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingTask(null);
  };

  const handleSortChange = (newSortBy, newOrder) => {
    setSortBy(newSortBy);
    setOrder(newOrder || 'desc');
  };

  // ——— Stats (computed from all tasks) ———
  const totalTasks = tasks.length;
  const inProgressCount = tasks.filter((t) => t.status === 'in_progress').length;
  const doneCount = tasks.filter((t) => t.status === 'done').length;

  // Filter tasks for display (kanban uses all, but filter can narrow)
  const displayTasks = statusFilter
    ? tasks.filter((t) => t.status === statusFilter)
    : tasks;

  return (
    <div className="app">
      <ToastContainer />

      {/* Header */}
      <header className="header">
        <div className="header__left">
          <div className="header__icon">✓</div>
          <div className="header__text">
            <h1>Personal Task Manager</h1>
            <p>Stay organized. Get things done.</p>
          </div>
        </div>
        <button
          className="btn btn--primary"
          onClick={() => { setEditingTask(null); setShowForm(true); }}
          id="new-task-btn"
        >
          ＋ New Task
        </button>
      </header>

      {/* Stats */}
      <div className="stats" id="stats-row">
        <div className="stat-card stat-card--total">
          <div className="stat-card__icon">📅</div>
          <div className="stat-card__info">
            <span className="stat-card__label">Total Tasks</span>
            <span className="stat-card__number">{totalTasks}</span>
          </div>
        </div>
        <div className="stat-card stat-card--progress">
          <div className="stat-card__icon">▶️</div>
          <div className="stat-card__info">
            <span className="stat-card__label">In Progress</span>
            <span className="stat-card__number">{inProgressCount}</span>
          </div>
        </div>
        <div className="stat-card stat-card--done">
          <div className="stat-card__icon">✅</div>
          <div className="stat-card__info">
            <span className="stat-card__label">Completed</span>
            <span className="stat-card__number">{doneCount}</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <FilterBar
        status={statusFilter}
        sortBy={sortBy}
        order={order}
        onStatusChange={setStatusFilter}
        onSortChange={handleSortChange}
      />

      {/* Main content */}
      {loading ? (
        <LoadingState />
      ) : error && tasks.length === 0 ? (
        <div className="empty-state" id="error-state">
          <div className="empty-state__icon">⚠️</div>
          <h3 className="empty-state__title">Unable to load tasks</h3>
          <p className="empty-state__subtitle">{error}</p>
          <button className="btn btn--primary" onClick={loadTasks} style={{ marginTop: '1rem' }}>
            Try Again
          </button>
        </div>
      ) : (
        <TaskList
          tasks={displayTasks}
          activeFilter={statusFilter}
          onStatusChange={handleStatusChange}
          onEdit={handleEditClick}
          onDelete={handleDelete}
          updatingTaskId={updatingTaskId}
          deletingTaskId={deletingTaskId}
        />
      )}

      {/* Task form modal */}
      {showForm && (
        <TaskForm
          task={editingTask}
          onSubmit={editingTask ? handleUpdate : handleCreate}
          onClose={handleFormClose}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
}
