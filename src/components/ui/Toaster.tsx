import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { XIcon, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';

// Toast types
type ToastType = 'success' | 'error' | 'info' | 'warning';

// Toast interface
interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

// Context type
interface ToastContextType {
  toasts: Toast[];
  addToast: (message: string, type: ToastType, duration?: number) => void;
  removeToast: (id: string) => void;
}

// Create context
const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Toast provider
export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (message: string, type: ToastType, duration = 5000) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type, duration }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <Toaster />
    </ToastContext.Provider>
  );
};

// Hook to use toast
export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// Toast icons
const toastIcons = {
  success: <CheckCircle className="h-5 w-5 text-success-500" />,
  error: <AlertCircle className="h-5 w-5 text-error-500" />,
  info: <Info className="h-5 w-5 text-primary-500" />,
  warning: <AlertTriangle className="h-5 w-5 text-warning-500" />,
};

// Toast colors
const toastColors = {
  success: 'bg-success-50 dark:bg-success-900/20 border-success-200 dark:border-success-800',
  error: 'bg-error-50 dark:bg-error-900/20 border-error-200 dark:border-error-800',
  info: 'bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800',
  warning: 'bg-warning-50 dark:bg-warning-900/20 border-warning-200 dark:border-warning-800',
};

// Toast component
const ToastItem = ({ toast, onClose }: { toast: Toast; onClose: () => void }) => {
  useEffect(() => {
    if (toast.duration) {
      const timer = setTimeout(() => {
        onClose();
      }, toast.duration);
      
      return () => clearTimeout(timer);
    }
  }, [toast, onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
      className={`flex items-center w-full max-w-sm rounded-lg border shadow-md ${toastColors[toast.type]}`}
    >
      <div className="flex items-center p-4 w-full">
        <div className="shrink-0 mr-3">
          {toastIcons[toast.type]}
        </div>
        <div className="text-sm font-medium text-slate-900 dark:text-slate-100 flex-1">
          {toast.message}
        </div>
        <button
          onClick={onClose}
          className="ml-3 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
        >
          <XIcon className="h-5 w-5" />
        </button>
      </div>
    </motion.div>
  );
};

// Toaster component
export const Toaster = () => {
  // Create a mock context if we're using the component without a provider
  const [toasts, setToasts] = useState<Toast[]>([]);
  
  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };
  
  // Try to get context, use mock if not available
  const context = useContext(ToastContext);
  const { toasts: contextToasts = toasts, removeToast: contextRemoveToast = removeToast } = context || {};

  return createPortal(
    <div className="fixed bottom-0 right-0 z-50 p-4 space-y-4 w-full max-w-sm pointer-events-none">
      <AnimatePresence>
        {contextToasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastItem toast={toast} onClose={() => contextRemoveToast(toast.id)} />
          </div>
        ))}
      </AnimatePresence>
    </div>,
    document.body
  );
};

export default Toaster;