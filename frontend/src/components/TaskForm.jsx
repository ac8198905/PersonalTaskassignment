import { useState } from 'react';

/**
 * TaskForm — modal form matching the reference design.
 * Has a close (×) button in the header, inline priority/status/dueDate row.
 */

const INITIAL_FORM = {
  title: '',
  description: '',
  priority: 'medium',
  status: 'todo',
  dueDate: '',
};

export default function TaskForm({ task, onSubmit, onClose, isSubmitting }) {
  const isEditing = Boolean(task);

  const [form, setForm] = useState(() => {
    if (task) {
      return {
        title: task.title || '',
        description: task.description || '',
        priority: task.priority || 'medium',
        status: task.status || 'todo',
        dueDate: task.dueDate ? task.dueDate.slice(0, 10) : '',
      };
    }
    return { ...INITIAL_FORM };
  });

  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!form.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (form.title.trim().length > 200) {
      newErrors.title = 'Title cannot exceed 200 characters';
    }
    if (form.description.trim().length > 2000) {
      newErrors.description = 'Description cannot exceed 2000 characters';
    }
    if (form.dueDate) {
      const parsed = new Date(form.dueDate);
      if (isNaN(parsed.getTime())) {
        newErrors.dueDate = 'Invalid date';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    const taskData = {
      title: form.title.trim(),
      description: form.description.trim(),
      priority: form.priority,
      status: form.status,
      dueDate: form.dueDate || null,
    };
    onSubmit(taskData);
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="form-overlay" onClick={handleOverlayClick} id="task-form-overlay">
      <div className="form-container" role="dialog" aria-modal="true">
        {/* Header with close button */}
        <div className="form-container__header">
          <h2 className="form-container__title">
            📋 {isEditing ? 'Edit Task' : 'Create Task'}
          </h2>
          <button
            className="form-container__close"
            onClick={onClose}
            aria-label="Close"
            id="form-close-btn"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          {/* Title */}
          <div className="form-group">
            <label className="form-group__label form-group__label--required" htmlFor="task-title">
              Title
            </label>
            <input
              id="task-title"
              name="title"
              type="text"
              className="form-group__input"
              value={form.title}
              onChange={handleChange}
              placeholder="What needs to be done?"
              maxLength={200}
              autoFocus
            />
            {errors.title && <p className="form-group__error">{errors.title}</p>}
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-group__label" htmlFor="task-description">Description</label>
            <input
              id="task-description"
              name="description"
              type="text"
              className="form-group__input"
              value={form.description}
              onChange={handleChange}
              placeholder="Add details..."
              maxLength={2000}
            />
            {errors.description && <p className="form-group__error">{errors.description}</p>}
          </div>

          {/* Priority, Status, Due Date — 3-column row */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-group__label" htmlFor="task-priority">Priority</label>
              <select
                id="task-priority"
                name="priority"
                className="form-group__select"
                value={form.priority}
                onChange={handleChange}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-group__label" htmlFor="task-status">Status</label>
              <select
                id="task-status"
                name="status"
                className="form-group__select"
                value={form.status}
                onChange={handleChange}
              >
                <option value="todo">Todo</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-group__label" htmlFor="task-due-date">Due Date</label>
              <input
                id="task-due-date"
                name="dueDate"
                type="date"
                className="form-group__input"
                value={form.dueDate}
                onChange={handleChange}
              />
              {errors.dueDate && <p className="form-group__error">{errors.dueDate}</p>}
            </div>
          </div>

          {/* Actions */}
          <div className="form-actions">
            <button
              type="submit"
              className="btn btn--primary"
              disabled={isSubmitting}
              id="form-submit-btn"
            >
              {isSubmitting
                ? (isEditing ? 'Updating...' : 'Creating...')
                : (isEditing ? 'Update Task' : 'Create Task')
              }
            </button>
            <button
              type="button"
              className="btn btn--secondary"
              onClick={onClose}
              disabled={isSubmitting}
              id="form-cancel-btn"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
