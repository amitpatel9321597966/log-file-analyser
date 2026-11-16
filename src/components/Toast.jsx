import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed top-4 inset-x-4 sm:top-auto sm:inset-x-auto sm:bottom-5 sm:right-5 z-50 flex flex-col gap-2 max-w-md pointer-events-none mx-auto sm:mx-0">
        {toasts.map((toast) => {
          const isSuccess = toast.type === 'success';
          const isError = toast.type === 'error';
          const isWarning = toast.type === 'warning';

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-soft-lg border transition-all duration-200 animate-in fade-in slide-in-from-bottom-2 ${
                isSuccess
                  ? 'bg-white border-green-200 text-slate-800'
                  : isError
                  ? 'bg-white border-red-200 text-slate-800'
                  : isWarning
                  ? 'bg-white border-amber-200 text-slate-800'
                  : 'bg-white border-slate-200 text-slate-800'
              }`}
            >
              {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />}
              {isError && <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />}
              {isWarning && <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />}
              {!isSuccess && !isError && !isWarning && <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />}

              <div className="flex-1 text-sm font-medium leading-snug">{toast.message}</div>
              
              <button
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-slate-600 transition-colors p-0.5 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    return { addToast: console.log };
  }
  return context;
}

