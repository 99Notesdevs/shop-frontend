// this is toast component
import { toast as sonnerToast, type ToastT } from "sonner";
import { type ReactNode } from "react";

type ToastVariant = 'default' | 'success' | 'error' | 'warning' | 'info';

type ToastOptions = {
  variant?: ToastVariant;
  duration?: number;
  position?: ToastT['position'];
  icon?: ReactNode;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
};

export const toast = {
  default: (message: string, options?: Omit<ToastOptions, 'variant'>) => {
    return sonnerToast(message, {
      ...options,
      className: 'bg-background text-foreground border',
    });
  },
  
  success: (message: string, options?: Omit<ToastOptions, 'variant'>) => {
    return sonnerToast.success(message, {
      ...options,
      className: 'bg-green-50 text-green-800 border-green-200',
    });
  },
  
  error: (message: string, options?: Omit<ToastOptions, 'variant'>) => {
    return sonnerToast.error(message, {
      ...options,
      className: 'bg-red-50 text-red-800 border-red-200',
    });
  },
  
  warning: (message: string, options?: Omit<ToastOptions, 'variant'>) => {
    return sonnerToast.warning(message, {
      ...options,
      className: 'bg-yellow-50 text-yellow-800 border-yellow-200',
    });
  },
  
  info: (message: string, options?: Omit<ToastOptions, 'variant'>) => {
    return sonnerToast.info(message, {
      ...options,
      className: 'bg-blue-50 text-blue-800 border-blue-200',
    });
  },
  
  loading: (message: string, options?: Omit<ToastOptions, 'variant'>) => {
    return sonnerToast.loading(message, {
      ...options,
      className: 'bg-gray-50 text-gray-800 border-gray-200',
    });
  },
  
  dismiss: (toastId?: string | number) => {
    sonnerToast.dismiss(toastId);
  },
  
  promise: sonnerToast.promise,
};

export { Toaster } from 'sonner';

export default toast;
