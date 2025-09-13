'use client'
import React, { createContext, useContext, useState } from 'react';
import { X, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { clsx } from 'clsx';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  description?: string;
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  toast: (options: { title: string; description?: string; variant?: 'success' | 'error' | 'warning' | 'info' }) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast = { ...toast, id };
    setToasts(prev => [...prev, newToast]);

    // Auto remove after duration
    const duration = toast.duration || 5000;
    setTimeout(() => removeToast(id), duration);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const toast = (options: { title: string; description?: string; variant?: 'success' | 'error' | 'warning' | 'info' }) => {
    addToast({
      type: options.variant || 'info',
      title: options.title,
      description: options.description,
      duration: 5000
    });
  };

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, toast }}>
      {children}
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export function Toaster() {
  const { toasts, removeToast } = useToast();

  const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertTriangle,
    info: CheckCircle,
  };

  const colors = {
    success: 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200',
    error: 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-200',
    info: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200',
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map(toast => {
        const Icon = icons[toast.type];
        return (
          <div
            key={toast.id}
            className={clsx(
              'max-w-sm w-full p-4 rounded-lg border shadow-lg',
              'animate-in slide-in-from-right duration-300',
              colors[toast.type]
            )}
          >
            <div className="flex items-start">
              <Icon className="h-5 w-5 mt-0.5 mr-3 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-medium text-sm">{toast.title}</p>
                {toast.description && (
                  <p className="text-sm mt-1 opacity-90">{toast.description}</p>
                )}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="ml-2 p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}