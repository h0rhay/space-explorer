import React, { useEffect } from 'react';

interface ToastProps {
  message: string;
  title: string;
  onDismiss: () => void;
  autoDismissMs?: number;
}

const Toast: React.FC<ToastProps> = ({ message, title, onDismiss, autoDismissMs = 8000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, autoDismissMs);
    return () => clearTimeout(timer);
  }, [onDismiss, autoDismissMs]);

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-[fadeIn_0.3s_ease-out_forwards]">
      <div className="bg-custom-black/95 border border-custom-cyan/40 rounded-lg p-4 max-w-md shadow-lg backdrop-blur-sm">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <svg
              className="w-7 h-7 text-yellow-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-base font-dosis font-semibold text-white mb-1">
              {title}
            </p>
            <p className="text-base font-dosis text-custom-cyan/80">
              {message}
            </p>
          </div>
          <button
            onClick={onDismiss}
            className="flex-shrink-0 text-custom-cyan/60 hover:text-custom-cyan transition-colors"
            aria-label="Dismiss notification"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Toast;

