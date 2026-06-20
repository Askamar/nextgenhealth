import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
    id: string;
    type: ToastType;
    title: string;
    message?: string;
    duration?: number;
}

interface ToastContextType {
    toasts: Toast[];
    showToast: (type: ToastType, title: string, message?: string, duration?: number) => void;
    success: (title: string, message?: string) => void;
    error: (title: string, message?: string) => void;
    warning: (title: string, message?: string) => void;
    info: (title: string, message?: string) => void;
    removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const removeToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const showToast = useCallback((type: ToastType, title: string, message?: string, duration: number = 4000) => {
        const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        setToasts(prev => [...prev, { id, type, title, message, duration }]);

        if (duration > 0) {
            setTimeout(() => removeToast(id), duration);
        }
    }, [removeToast]);

    const success = useCallback((title: string, message?: string) => {
        showToast('success', title, message);
    }, [showToast]);

    const error = useCallback((title: string, message?: string) => {
        showToast('error', title, message, 6000); // Errors stay longer
    }, [showToast]);

    const warning = useCallback((title: string, message?: string) => {
        showToast('warning', title, message, 5000);
    }, [showToast]);

    const info = useCallback((title: string, message?: string) => {
        showToast('info', title, message);
    }, [showToast]);

    return (
        <ToastContext.Provider value={{ toasts, showToast, success, error, warning, info, removeToast }}>
            {children}
            <ToastContainer toasts={toasts} onRemove={removeToast} />
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within ToastProvider');
    }
    return context;
};

// Toast Container Component
const ToastContainer = ({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: string) => void }) => {
    return (
        <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
            {toasts.map(toast => (
                <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
            ))}
        </div>
    );
};

// Individual Toast Item
const ToastItem = ({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) => {
    const [isExiting, setIsExiting] = useState(false);

    const handleRemove = () => {
        setIsExiting(true);
        setTimeout(() => onRemove(toast.id), 300);
    };

    const config = {
        success: {
            icon: CheckCircle,
            bg: 'bg-green-50 dark:bg-green-900/30',
            border: 'border-green-200 dark:border-green-800',
            iconColor: 'text-green-500',
            titleColor: 'text-green-800 dark:text-green-200'
        },
        error: {
            icon: XCircle,
            bg: 'bg-red-50 dark:bg-red-900/30',
            border: 'border-red-200 dark:border-red-800',
            iconColor: 'text-red-500',
            titleColor: 'text-red-800 dark:text-red-200'
        },
        warning: {
            icon: AlertTriangle,
            bg: 'bg-amber-50 dark:bg-amber-900/30',
            border: 'border-amber-200 dark:border-amber-800',
            iconColor: 'text-amber-500',
            titleColor: 'text-amber-800 dark:text-amber-200'
        },
        info: {
            icon: Info,
            bg: 'bg-blue-50 dark:bg-blue-900/30',
            border: 'border-blue-200 dark:border-blue-800',
            iconColor: 'text-blue-500',
            titleColor: 'text-blue-800 dark:text-blue-200'
        }
    };

    const { icon: Icon, bg, border, iconColor, titleColor } = config[toast.type];

    return (
        <div
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-lg backdrop-blur-sm transition-all duration-300 ${bg} ${border} ${isExiting
                    ? 'opacity-0 translate-x-full'
                    : 'opacity-100 translate-x-0 animate-slide-in'
                }`}
        >
            <Icon className={`${iconColor} shrink-0 mt-0.5`} size={20} />
            <div className="flex-1 min-w-0">
                <p className={`font-semibold text-sm ${titleColor}`}>{toast.title}</p>
                {toast.message && (
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">{toast.message}</p>
                )}
            </div>
            <button
                onClick={handleRemove}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors shrink-0"
            >
                <X size={16} />
            </button>

            {/* Progress bar */}
            {toast.duration && toast.duration > 0 && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/5 dark:bg-white/10 rounded-b-xl overflow-hidden">
                    <div
                        className={`h-full ${iconColor.replace('text-', 'bg-')} animate-progress`}
                        style={{
                            animationDuration: `${toast.duration}ms`,
                            animationTimingFunction: 'linear'
                        }}
                    />
                </div>
            )}

            <style>{`
                @keyframes slide-in {
                    from {
                        opacity: 0;
                        transform: translateX(100%);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
                .animate-slide-in {
                    animation: slide-in 0.3s ease-out;
                }
                @keyframes progress {
                    from { width: 100%; }
                    to { width: 0%; }
                }
                .animate-progress {
                    animation: progress linear forwards;
                }
            `}</style>
        </div>
    );
};
