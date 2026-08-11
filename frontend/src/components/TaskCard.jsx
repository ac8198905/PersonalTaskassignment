import { useState, useRef, useEffect } from 'react';

/**
 * TaskCard — card with checkbox, priority badge, three-dot menu.
 * Draggable to support HTML5 drag and drop status changes.
 */

const formatDate = (dateStr) => {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const isOverdue = (dueDate, status) => {
  if (!dueDate || status === 'done') return false;
  return new Date(dueDate) < new Date(new Date().toDateString());
};

export default function TaskCard({
  task,
  onStatusChange,
  onEdit,
  onDelete,
  isUpdating,
  isDeleting,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const menuRef = useRef(null);

  const isDone = task.status === 'done';
  const overdue = isOverdue(task.dueDate, task.status);

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [menuOpen]);

  // --- Drag handlers ---
  const handleDragStart = (e) => {
    // Prevent drag if clicking on an interactive element like a button
    if (e.target.closest('button')) {
      e.preventDefault();
      return;
    }

    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'move';
    
    // Standard text/plain is more reliable across browsers
    e.dataTransfer.setData('text/plain', JSON.stringify({
      taskId: task._id,
      sourceStatus: task.status
    }));
    
    // Optional: make the drag ghost slightly transparent
    setTimeout(() => {
      if (e.target.style) {
        e.target.style.opacity = '0.5';
      }
    }, 0);
  };

  const handleDragEnd = (e) => {
    setIsDragging(false);
    if (e.target.style) {
      e.target.style.opacity = '1';
    }
  };

  const handleCheckboxClick = () => {
    if (isDone) {
      onStatusChange(task._id, 'todo');
    } else {
      onStatusChange(task._id, 'done');
    }
  };

  const handleStatusMenuItem = (newStatus) => {
    setMenuOpen(false);
    onStatusChange(task._id, newStatus);
  };

  const handleEditClick = () => {
    setMenuOpen(false);
    onEdit(task);
  };

  const handleDeleteClick = () => {
    setMenuOpen(false);
    setShowConfirm(true);
  };

  const handleConfirmDelete = () => {
    setShowConfirm(false);
    onDelete(task._id);
  };

  return (
    <>
      <div
        className={`task-card task-card--${task.priority} ${isDone ? 'task-card--done-card' : ''} ${isDragging ? 'task-card--dragging' : ''}`}
        id={`task-card-${task._id}`}
        draggable={!isUpdating && !isDeleting && !menuOpen}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        style={{ 
          cursor: (isUpdating || isDeleting) ? 'wait' : 'grab',
          zIndex: menuOpen ? 100 : 1
        }}
      >
        {/* Header: checkbox + title + priority badge */}
        <div className="task-card__header">
          <button
            className={`task-card__checkbox ${isDone ? 'task-card__checkbox--checked' : ''}`}
            onClick={handleCheckboxClick}
            disabled={isUpdating}
            aria-label={isDone ? 'Mark as todo' : 'Mark as done'}
            id={`checkbox-${task._id}`}
          >
            {isDone && '✓'}
          </button>

          <div className="task-card__title-row">
            <h3 className="task-card__title">{task.title}</h3>
            <span className={`badge badge--${task.priority}`}>
              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
            </span>
          </div>
        </div>

        {/* Description */}
        {task.description && (
          <p className="task-card__description">{task.description}</p>
        )}

        {/* Due date */}
        {task.dueDate && (
          <div className={`task-card__meta ${overdue ? 'task-card__meta--overdue' : ''}`}>
            <span className="task-card__meta-item">
              📅 {overdue ? 'Overdue: ' : ''}{formatDate(task.dueDate)}
            </span>
          </div>
        )}

        {/* Footer: created date + three-dot menu */}
        <div className="task-card__footer">
          <span className="task-card__created">
            {isDone ? 'Completed' : 'Created'} {formatDate(task.createdAt)}
          </span>

          <div className="task-card__actions-row" ref={menuRef}>
            {isUpdating && (
              <span style={{ fontSize: '0.75rem', color: 'var(--accent-blue)' }}>Updating...</span>
            )}
            {isDeleting && (
              <span style={{ fontSize: '0.75rem', color: 'var(--danger)' }}>Deleting...</span>
            )}
            <button
              className="task-card__menu-btn"
              onClick={() => setMenuOpen(!menuOpen)}
              disabled={isUpdating || isDeleting}
              aria-label="Task options"
              id={`menu-btn-${task._id}`}
            >
              ⋯
            </button>

            {/* Dropdown menu */}
            {menuOpen && (
              <div className="task-card__dropdown" id={`dropdown-${task._id}`}>
                {/* Status changes */}
                {task.status !== 'todo' && (
                  <button className="task-card__dropdown-item" onClick={() => handleStatusMenuItem('todo')}>
                    📋 Move to Todo
                  </button>
                )}
                {task.status !== 'in_progress' && (
                  <button className="task-card__dropdown-item" onClick={() => handleStatusMenuItem('in_progress')}>
                    ▶️ Move to In Progress
                  </button>
                )}
                {task.status !== 'done' && (
                  <button className="task-card__dropdown-item" onClick={() => handleStatusMenuItem('done')}>
                    ✅ Mark as Done
                  </button>
                )}
                <div className="task-card__dropdown-divider" />
                <button className="task-card__dropdown-item" onClick={handleEditClick}>
                  ✏️ Edit
                </button>
                <button className="task-card__dropdown-item task-card__dropdown-item--danger" onClick={handleDeleteClick}>
                  🗑️ Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirm delete dialog */}
      {showConfirm && (
        <div className="confirm-overlay" onClick={() => setShowConfirm(false)} id="delete-confirm-overlay">
          <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
            <h3 className="confirm-dialog__title">Delete Task</h3>
            <p className="confirm-dialog__message">
              Are you sure you want to delete &ldquo;{task.title}&rdquo;? This cannot be undone.
            </p>
            <div className="confirm-dialog__actions">
              <button className="btn btn--secondary" onClick={() => setShowConfirm(false)} id="delete-cancel-btn">
                Cancel
              </button>
              <button className="btn btn--danger" onClick={handleConfirmDelete} id="delete-confirm-btn">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
