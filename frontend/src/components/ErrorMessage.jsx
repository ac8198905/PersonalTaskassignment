import { useState, useCallback } from 'react';

/**
 * Toast notification system — pill-shaped toasts with icons.
 */
export function useToast() {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), duration);
  }, [removeToast]);

  const icons = { success: '✅', error: '⚠️', info: 'ℹ️' };

  function ToastContainer() {
    return (
      <div className="toast-container" id="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast toast--${toast.type}`} role="alert">
            <span className="toast__icon">{icons[toast.type] || 'ℹ️'}</span>
            <span>{toast.message}</span>
            <button
              className="toast__close"
              onClick={() => removeToast(toast.id)}
              aria-label="Dismiss"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    );
  }

  return { addToast, ToastContainer };
}
