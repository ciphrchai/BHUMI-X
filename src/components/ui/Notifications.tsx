import { useEffect, useState } from 'react';
import { CheckCircle, AlertTriangle, Info, XCircle, X } from 'lucide-react';

// Mocking appStore for components - in a real app this would import from store
type ToastType = 'success' | 'error' | 'warning' | 'info';
interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

// Temporary local state until store is connected
export default function Notifications() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Auto-dismiss functionality
  useEffect(() => {
    if (toasts.length === 0) return;
    
    const timer = setTimeout(() => {
      setToasts(prev => prev.slice(1));
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [toasts]);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const getIcon = (type: ToastType) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      case 'error': return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'info': return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <div className="fixed top-16 right-4 z-50 flex flex-col gap-2 max-w-sm w-full">
      {toasts.map(toast => (
        <div 
          key={toast.id}
          className="bg-white border border-gray-200 shadow-lg rounded-lg p-4 flex items-start gap-3 transform transition-all duration-300 ease-in-out animate-in slide-in-from-right"
        >
          <div className="flex-shrink-0 mt-0.5">
            {getIcon(toast.type)}
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-medium text-gray-900">{toast.title}</h4>
            {toast.message && (
              <p className="text-sm text-gray-500 mt-1">{toast.message}</p>
            )}
          </div>
          <button 
            onClick={() => removeToast(toast.id)}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
