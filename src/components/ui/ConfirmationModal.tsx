'use client';

import React, { useEffect } from 'react';
import { useBoardStore } from '@/lib/store';
import { Modal } from './Modal';
import { Trash2, LogOut, AlertTriangle, X } from 'lucide-react';

export const ConfirmationModal: React.FC = () => {
  const { confirmModal, closeConfirmModal } = useBoardStore();

  useEffect(() => {
    if (!confirmModal) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        confirmModal.onConfirm();
        closeConfirmModal();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [confirmModal, closeConfirmModal]);

  if (!confirmModal) return null;

  const {
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    isDestructive = false,
    icon = 'alert',
    onConfirm,
  } = confirmModal;

  const handleConfirm = () => {
    onConfirm();
    closeConfirmModal();
  };

  const getIcon = () => {
    switch (icon) {
      case 'trash':
        return (
          <div className="w-10 h-10 rounded-2xl bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
            <Trash2 size={20} />
          </div>
        );
      case 'logout':
        return (
          <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <LogOut size={20} />
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 rounded-2xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 flex items-center justify-center shrink-0">
            <AlertTriangle size={20} />
          </div>
        );
    }
  };

  return (
    <Modal
      isOpen={Boolean(confirmModal)}
      onClose={closeConfirmModal}
      size="sm"
      ariaLabel={title}
      className="p-5 sm:p-6 space-y-4"
    >
      <button
        type="button"
        onClick={closeConfirmModal}
        className="absolute top-4 right-4 p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-lg transition-colors cursor-pointer"
        title="Dismiss"
        aria-label="Dismiss modal"
      >
        <X size={16} />
      </button>

      <div className="flex items-start gap-3.5">
        {getIcon()}
        <div className="space-y-1">
          <h3 className="text-base font-oregon font-bold text-stone-900 dark:text-stone-100 tracking-wide">
            {title}
          </h3>
          <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed font-sans">
            {message}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-200/60 dark:border-stone-800/60">
        <button
          type="button"
          onClick={closeConfirmModal}
          className="px-3.5 py-2 text-xs font-medium text-stone-600 dark:text-stone-300 hover:bg-stone-200/60 dark:hover:bg-stone-800/60 rounded-xl transition-colors cursor-pointer"
        >
          {cancelText}
        </button>
        <button
          type="button"
          autoFocus
          onClick={handleConfirm}
          className={`px-4 py-2 text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer ${
            isDestructive
              ? 'bg-rose-600 hover:bg-rose-700 text-white'
              : 'bg-stone-800 hover:bg-stone-900 text-stone-100 dark:bg-stone-100 dark:hover:bg-white dark:text-stone-900'
          }`}
        >
          {confirmText}
        </button>
      </div>
    </Modal>
  );
};
