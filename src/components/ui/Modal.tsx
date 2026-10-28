'use client';

import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useIsMounted } from '@/lib/useIsMounted';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '5xl';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  size?: ModalSize;
  className?: string;
  overlayClassName?: string;
  ariaLabel?: string;
  showCloseButton?: boolean;
  closeOnBackdropClick?: boolean;
  closeOnEscape?: boolean;
}

const SIZE_CLASSES: Record<ModalSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '5xl': 'max-w-5xl',
};

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  size = 'md',
  className = '',
  overlayClassName = '',
  ariaLabel = 'Modal dialog',
  showCloseButton = false,
  closeOnBackdropClick = true,
  closeOnEscape = true,
}) => {
  const mounted = useIsMounted();

  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (closeOnEscape && e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, closeOnEscape, onClose]);

  if (!isOpen || !mounted) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (closeOnBackdropClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  const dialogMaxWidth = SIZE_CLASSES[size] || SIZE_CLASSES.md;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
      className={`fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-2.5 sm:p-4 md:p-6 bg-stone-900/50 dark:bg-black/70 backdrop-blur-xs animate-in fade-in duration-150 ${overlayClassName}`}
      onClick={handleBackdropClick}
      onWheel={(e) => e.stopPropagation()}
    >
      <div
        className={`relative w-full ${dialogMaxWidth} my-auto max-h-[calc(100dvh-1.5rem)] sm:max-h-[88dvh] bg-[#FAF8F5] dark:bg-[#1C1A17] border border-[#E7E0D4] dark:border-[#33302A] rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden text-stone-900 dark:text-stone-100 ${className}`}
        onClick={(e) => e.stopPropagation()}
        onWheel={(e) => e.stopPropagation()}
      >
        {showCloseButton && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 sm:top-5 sm:right-5 p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-xl hover:bg-stone-200/50 dark:hover:bg-stone-800 transition-colors cursor-pointer z-10"
            title="Close (Esc)"
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        )}
        {children}
      </div>
    </div>,
    document.body
  );
};
