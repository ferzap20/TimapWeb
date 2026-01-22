/**
 * Modal Component
 *
 * Reusable modal/dialog component with backdrop and animations.
 * Handles click-outside-to-close and escape key functionality.
 */

import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  showCloseButton?: boolean;
  actions?: React.ReactNode;
}

export function Modal({
  isOpen,
  onClose,
  children,
  title,
  showCloseButton = true,
  actions
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className="relative bg-gray-900 border-2 border-green-500 rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-slideUp"
      >
        {(title || showCloseButton || actions) && (
          <div className="flex items-center justify-between p-6 border-b border-gray-800">
            {title && (
              <h2 className="text-2xl font-bold text-white">{title}</h2>
            )}
            <div className="flex items-center gap-2 ml-auto">
              {actions}
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-white transition-colors p-1"
                  aria-label="Close modal"
                >
                  <X size={24} />
                </button>
              )}
            </div>
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
