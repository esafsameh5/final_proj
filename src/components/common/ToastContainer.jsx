import React from "react";

function ToastContainer({ toasts, setToasts }) {
  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <div 
          key={toast.id} 
          className={`toast-notification ${toast.type} ${toast.hide ? 'hide' : ''}`} 
          onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
        >
          <div className="toast-icon">
            {toast.type === 'success' && '🟢'}
            {toast.type === 'error' && '🔴'}
            {toast.type === 'warning' && '⚠️'}
            {toast.type === 'info' && 'ℹ️'}
          </div>
          <div className="toast-message">{toast.message}</div>
        </div>
      ))}
    </div>
  );
}

export default ToastContainer;
