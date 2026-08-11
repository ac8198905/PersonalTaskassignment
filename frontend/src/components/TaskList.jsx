import TaskCard from './TaskCard';

/**
 * TaskList — Kanban board with 3 status columns: To Do, In Progress, Done.
 * Supports HTML5 native drag and drop for status changes.
 */

const COLUMNS = [
  {
    key: 'todo',
    label: 'To Do',
    icon: '📋',
  },
  {
    key: 'in_progress',
    label: 'In Progress',
    icon: '▶️',
  },
  {
    key: 'done',
    label: 'Done',
    icon: '✅',
  },
];

export default function TaskList({
  tasks,
  activeFilter,
  onStatusChange,
  onEdit,
  onDelete,
  updatingTaskId,
  deletingTaskId,
}) {
  if (tasks.length === 0 && !activeFilter) {
    return (
      <div className="empty-state" id="empty-state">
        <div className="empty-state__icon">📝</div>
        <h3 className="empty-state__title">Your task list is empty</h3>
        <p className="empty-state__subtitle">Create your first task to get started.</p>
      </div>
    );
  }

  if (tasks.length === 0 && activeFilter) {
    return (
      <div className="empty-state" id="empty-state">
        <div className="empty-state__icon">🔍</div>
        <h3 className="empty-state__title">No tasks found for this filter</h3>
        <p className="empty-state__subtitle">Try selecting a different status filter.</p>
      </div>
    );
  }

  const grouped = {
    todo: [],
    in_progress: [],
    done: [],
  };
  
  tasks.forEach((task) => {
    if (grouped[task.status]) {
      grouped[task.status].push(task);
    }
  });

  const columnsToShow = activeFilter
    ? COLUMNS.filter((col) => col.key === activeFilter)
    : COLUMNS;

  // --- Drag and Drop Handlers ---
  const handleDrop = (e, newStatus) => {
    e.preventDefault();
    
    try {
      const dataStr = e.dataTransfer.getData('text/plain');
      if (!dataStr) return;
      
      const { taskId, sourceStatus } = JSON.parse(dataStr);
      
      // Only update if it actually moved to a different column
      if (taskId && sourceStatus !== newStatus) {
        onStatusChange(taskId, newStatus);
      }
    } catch (err) {
      console.error('Error parsing drag data:', err);
    }
  };

  return (
    <div
      className="kanban-board"
      id="kanban-board"
      style={activeFilter ? { gridTemplateColumns: '1fr' } : undefined}
    >
      {columnsToShow.map((col) => (
        <div key={col.key} className={`kanban-column kanban-column--${col.key}`}>
          <div className="kanban-column__header">
            <span className="kanban-column__header-icon">{col.icon}</span>
            <span>{col.label}</span>
            <span className="kanban-column__header-count">({grouped[col.key].length})</span>
          </div>

          <div 
            className="kanban-column__body"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, col.key)}
            style={{ minHeight: '150px' }} // Ensure there's always space to drop
          >
            {grouped[col.key].length === 0 ? (
              <div className="kanban-column__empty">No tasks here yet</div>
            ) : (
              grouped[col.key].map((task) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  onStatusChange={onStatusChange}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  isUpdating={updatingTaskId === task._id}
                  isDeleting={deletingTaskId === task._id}
                />
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
