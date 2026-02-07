/**
 * Toast notification utility
 * Wrapper around react-hot-toast with consistent styling
 */

import toast from 'react-hot-toast';

const toastOptions = {
  // Dark theme styling to match TIMAP design
  style: {
    background: '#1f2937', // gray-800
    color: '#fff',
    border: '1px solid #374151', // gray-700
    borderRadius: '0.75rem',
    padding: '12px 16px',
    fontSize: '14px',
    fontWeight: '600'
  },
  success: {
    iconTheme: {
      primary: '#10B981', // green-500
      secondary: '#000'
    }
  },
  error: {
    iconTheme: {
      primary: '#EF4444', // red-500
      secondary: '#000'
    },
    duration: 4000
  }
};

export const showToast = {
  /**
   * Show success toast notification
   */
  success: (message: string) => {
    return toast.success(message, toastOptions);
  },

  /**
   * Show error toast notification
   */
  error: (message: string) => {
    return toast.error(message, toastOptions);
  },

  /**
   * Show loading toast notification
   */
  loading: (message: string) => {
    return toast.loading(message, toastOptions);
  },

  /**
   * Show info/default toast notification
   */
  info: (message: string) => {
    return toast(message, toastOptions);
  },

  /**
   * Dismiss a specific toast by ID
   */
  dismiss: (toastId?: string) => {
    toast.dismiss(toastId);
  },

  /**
   * Dismiss all toasts
   */
  dismissAll: () => {
    toast.dismiss();
  }
};
