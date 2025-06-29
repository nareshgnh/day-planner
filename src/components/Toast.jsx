// src/components/Toast.jsx
import React, { useState, useEffect } from "react";
import { CheckCircle2, X, AlertCircle, Info, AlertTriangle } from "lucide-react";

const Toast = ({ 
  message, 
  type = "success", 
  duration = 4000, 
  onClose, 
  isVisible 
}) => {
  const [isShowing, setIsShowing] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setIsShowing(true);
      setIsLeaving(false);
      
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      setIsShowing(false);
      onClose();
    }, 300);
  };

  const getToastStyles = () => {
    const baseStyles = "fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg backdrop-blur-sm border transition-all duration-300 transform";
    
    if (!isShowing) return `${baseStyles} translate-x-full opacity-0 scale-95`;
    if (isLeaving) return `${baseStyles} translate-x-full opacity-0 scale-95`;
    
    const activeStyles = `${baseStyles} translate-x-0 opacity-100 scale-100`;
    
    switch (type) {
      case "success":
        return `${activeStyles} bg-green-50/95 dark:bg-green-900/95 border-green-200 dark:border-green-700 text-green-800 dark:text-green-200`;
      case "error":
        return `${activeStyles} bg-red-50/95 dark:bg-red-900/95 border-red-200 dark:border-red-700 text-red-800 dark:text-red-200`;
      case "warning":
        return `${activeStyles} bg-yellow-50/95 dark:bg-yellow-900/95 border-yellow-200 dark:border-yellow-700 text-yellow-800 dark:text-yellow-200`;
      case "info":
        return `${activeStyles} bg-blue-50/95 dark:bg-blue-900/95 border-blue-200 dark:border-blue-700 text-blue-800 dark:text-blue-200`;
      default:
        return `${activeStyles} bg-gray-50/95 dark:bg-gray-800/95 border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200`;
    }
  };

  const getIcon = () => {
    const iconClass = "h-5 w-5 flex-shrink-0";
    switch (type) {
      case "success":
        return <CheckCircle2 className={`${iconClass} text-green-600 dark:text-green-400`} />;
      case "error":
        return <AlertCircle className={`${iconClass} text-red-600 dark:text-red-400`} />;
      case "warning":
        return <AlertTriangle className={`${iconClass} text-yellow-600 dark:text-yellow-400`} />;
      case "info":
        return <Info className={`${iconClass} text-blue-600 dark:text-blue-400`} />;
      default:
        return <Info className={`${iconClass} text-gray-600 dark:text-gray-400`} />;
    }
  };

  if (!isShowing && !isVisible) return null;

  return (
    <div className={getToastStyles()}>
      {getIcon()}
      <span className="font-medium text-sm flex-1">{message}</span>
      <button 
        onClick={handleClose}
        className="flex-shrink-0 ml-2 p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

// Toast Container Component
export const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-0 right-0 z-50 pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto mb-2">
          <Toast
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            isVisible={toast.isVisible}
            onClose={() => removeToast(toast.id)}
          />
        </div>
      ))}
    </div>
  );
};

// Hook for managing toasts
export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = "success", duration = 4000) => {
    const id = Date.now() + Math.random();
    const newToast = {
      id,
      message,
      type,
      duration,
      isVisible: true
    };
    
    setToasts(prev => [...prev, newToast]);
    return id;
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const showSuccess = (message, duration) => addToast(message, "success", duration);
  const showError = (message, duration) => addToast(message, "error", duration);
  const showWarning = (message, duration) => addToast(message, "warning", duration);
  const showInfo = (message, duration) => addToast(message, "info", duration);

  return {
    toasts,
    addToast,
    removeToast,
    showSuccess,
    showError,
    showWarning,
    showInfo
  };
};
