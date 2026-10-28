'use client';

import React, { useRef } from 'react';
import { useClickOutside } from '@/lib/useClickOutside';
import {
  CloudOff,
  Sun,
  Moon,
  Download,
  LogOut,
  Compass,
  HelpCircle,
  Check,
} from 'lucide-react';

interface MobileMenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: { email?: string; id?: string } | null;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  onSignOutClick: () => void;
  onOpenAuth: () => void;
  onOpenModes: () => void;
  onOpenExport: () => void;
  onOpenShortcuts: () => void;
}

export const MobileMenuDrawer: React.FC<MobileMenuDrawerProps> = ({
  isOpen,
  onClose,
  currentUser,
  theme,
  toggleTheme,
  onSignOutClick,
  onOpenAuth,
  onOpenModes,
  onOpenExport,
  onOpenShortcuts,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useClickOutside(menuRef, onClose, isOpen);

  if (!isOpen) return null;

  return (
    <div
      ref={menuRef}
      onWheel={(e) => e.stopPropagation()}
      className="absolute right-0 top-full mt-2 w-64 p-2 bg-[#FAF8F5] dark:bg-[#1C1A17] border border-[#E7E0D4] dark:border-[#33302A] rounded-2xl shadow-2xl z-50 flex flex-col space-y-1 font-sans text-stone-800 dark:text-stone-200"
    >
      {/* Account Status */}
      <div className="p-2 border-b border-stone-200/70 dark:border-stone-800/70 space-y-1">
        {currentUser ? (
          <div className="flex items-center justify-between">
            <div className="truncate">
              <div className="text-[10px] font-mono uppercase tracking-wider text-stone-400">Account</div>
              <div className="text-xs font-semibold truncate max-w-[140px]">{currentUser.email}</div>
            </div>
            <button
              type="button"
              onClick={() => {
                onClose();
                onSignOutClick();
              }}
              className="p-1.5 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg flex items-center gap-1 font-medium cursor-pointer"
            >
              <LogOut size={12} />
              <span>Exit</span>
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenAuth();
            }}
            className="w-full flex items-center justify-between p-2 rounded-xl bg-amber-500/15 text-amber-900 dark:text-amber-200 text-xs font-semibold cursor-pointer"
          >
            <span className="flex items-center gap-1.5">
              <CloudOff size={13} />
              <span>Sign In to Cloud Sync</span>
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20">Sync</span>
          </button>
        )}
      </div>

      {/* Navigation Options */}
      <button
        type="button"
        onClick={() => {
          onClose();
          onOpenModes();
        }}
        className="w-full flex items-center gap-2.5 p-2 rounded-xl hover:bg-stone-200/60 dark:hover:bg-stone-800/60 text-xs font-medium text-left cursor-pointer"
      >
        <Compass size={15} className="text-amber-600 dark:text-amber-400" />
        <span>Workspace Modes</span>
      </button>

      <button
        type="button"
        onClick={() => {
          onClose();
          onOpenExport();
        }}
        className="w-full flex items-center gap-2.5 p-2 rounded-xl hover:bg-stone-200/60 dark:hover:bg-stone-800/60 text-xs font-medium text-left cursor-pointer"
      >
        <Download size={15} className="text-stone-600 dark:text-stone-400" />
        <span>Export & Backup</span>
      </button>

      <button
        type="button"
        onClick={() => {
          onClose();
          onOpenShortcuts();
        }}
        className="w-full flex items-center gap-2.5 p-2 rounded-xl hover:bg-stone-200/60 dark:hover:bg-stone-800/60 text-xs font-medium text-left cursor-pointer"
      >
        <HelpCircle size={15} className="text-stone-600 dark:text-stone-400" />
        <span>Gestures & Shortcuts</span>
      </button>

      <button
        type="button"
        onClick={() => {
          toggleTheme();
        }}
        className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-stone-200/60 dark:hover:bg-stone-800/60 text-xs font-medium text-left cursor-pointer"
      >
        <span className="flex items-center gap-2.5">
          {theme === 'dark' ? <Sun size={15} className="text-amber-400" /> : <Moon size={15} className="text-stone-700" />}
          <span>{theme === 'dark' ? 'Light Theme' : 'Dark Theme'}</span>
        </span>
        <span className="text-[10px] font-mono text-stone-400 uppercase">{theme}</span>
      </button>

      {/* Status footer */}
      <div className="pt-1.5 px-2 border-t border-stone-200/70 dark:border-stone-800/70 flex items-center justify-between text-[10px] text-stone-400">
        <span>Status</span>
        <span className="flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400">
          <Check size={11} /> Saved Locally
        </span>
      </div>
    </div>
  );
};
