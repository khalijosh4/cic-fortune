import { createContext, useContext, useState, useCallback } from "react";

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(({ type = "info", title, message, duration = 4000 }) => {
    const id = Math.random().toString(36).slice(2);
    setToasts(prev => [...prev, { id, type, title, message }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration);
  }, []);

  const toast = {
    success: (title, message) => addToast({ type: "success", title, message }),
    error:   (title, message) => addToast({ type: "error",   title, message }),
    warning: (title, message) => addToast({ type: "warning", title, message }),
    info:    (title, message) => addToast({ type: "info",    title, message }),
  };

  return (
    <ToastContext.Provider value={{ toast, toasts }}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
