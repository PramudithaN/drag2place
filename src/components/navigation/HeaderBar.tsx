'use client';

import React, { useState, useEffect } from 'react';
import { useBoardStore } from '@/lib/store';
import { Bell, Cloud, CloudOff, Sun, Moon, Search, Download } from 'lucide-react';
import { notificationService, AppNotification } from '@/lib/notifications';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { NotificationCenter } from './NotificationCenter';
import { AuthModal } from './AuthModal';
import { BoardSwitcher } from './BoardSwitcher';
import { ExportModal } from './ExportModal';
import { CommandPalette } from './CommandPalette';

export const HeaderBar: React.FC = () => {
  const { activeTool, cancelConnecting, theme, toggleTheme } = useBoardStore();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const unsub = notificationService.subscribe((items: AppNotification[]) => {
      setUnreadCount(items.filter((i) => !i.read).length);
    });
    return unsub;
  }, []);

  // Keyboard shortcut Ctrl+K or Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <header className="fixed top-4 left-6 right-6 z-40 flex items-center justify-between pointer-events-none">
        {/* Brand & Multi-Board Switcher */}
        <div className="flex items-center gap-3.5 p-2 px-4 bg-[#FAF8F5]/95 dark:bg-[#1C1A17]/95 backdrop-blur-md border border-[#E7E0D4] dark:border-[#33302A] rounded-2xl shadow-sm pointer-events-auto">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900 flex items-center justify-center font-oregon font-bold text-sm shadow-xs">
              D
            </div>
            <span className="font-oregon font-bold text-lg tracking-wide text-stone-900 dark:text-stone-100 select-none">
              Drag2Place
            </span>
          </div>

          <div className="w-[1px] h-4 bg-stone-300 dark:bg-stone-700" />

          {/* Multi-Board Dropdown */}
          <BoardSwitcher />
        </div>

        {/* Center mode status banner if connecting cards */}
        {activeTool === 'connect' && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-stone-900 text-stone-100 rounded-full text-xs font-medium shadow-lg animate-bounce pointer-events-auto">
            <span>Click any target card to draw arrow connection</span>
            <button
              onClick={cancelConnecting}
              className="px-1.5 py-0.5 bg-stone-700 hover:bg-stone-600 rounded-full text-[10px]"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Right controls */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Quick Search / Command Palette */}
          <button
            onClick={() => setIsCommandOpen(true)}
            className="flex items-center gap-2 p-2 px-3 bg-[#FAF8F5]/90 dark:bg-[#1C1A17]/90 hover:bg-[#F2ECE2] dark:hover:bg-[#2A2724] backdrop-blur-md border border-[#E7E0D4] dark:border-[#33302A] rounded-2xl text-stone-600 dark:text-stone-300 shadow-sm transition-colors text-xs"
            title="Search cards & actions (Ctrl + K)"
          >
            <Search size={14} />
            <span className="hidden sm:inline font-sans text-[11px] text-stone-500">Search</span>
            <kbd className="hidden sm:inline text-[9px] font-mono px-1 bg-stone-200/60 dark:bg-stone-800 rounded text-stone-400">
              Ctrl K
            </kbd>
          </button>

          {/* Export & Backup */}
          <button
            onClick={() => setIsExportOpen(true)}
            className="p-2.5 bg-[#FAF8F5]/90 dark:bg-[#1C1A17]/90 hover:bg-[#F2ECE2] dark:hover:bg-[#2A2724] backdrop-blur-md border border-[#E7E0D4] dark:border-[#33302A] rounded-2xl text-stone-700 dark:text-stone-300 shadow-sm transition-colors"
            title="Export image or backup board"
          >
            <Download size={16} />
          </button>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="p-2.5 bg-[#FAF8F5]/90 dark:bg-[#1C1A17]/90 hover:bg-[#F2ECE2] dark:hover:bg-[#2A2724] backdrop-blur-md border border-[#E7E0D4] dark:border-[#33302A] rounded-2xl text-stone-700 dark:text-stone-300 shadow-sm transition-colors"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} className="text-stone-700" />}
          </button>

          {/* Notification bell */}
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="relative p-2.5 bg-[#FAF8F5]/90 dark:bg-[#1C1A17]/90 hover:bg-[#F2ECE2] dark:hover:bg-[#2A2724] backdrop-blur-md border border-[#E7E0D4] dark:border-[#33302A] rounded-2xl text-stone-700 dark:text-stone-300 shadow-sm transition-colors"
            title="Notifications & Reminders"
          >
            <Bell size={16} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-600 text-white rounded-full text-[9px] font-mono font-bold flex items-center justify-center shadow-xs">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Supabase Cloud Auth Button */}
          <button
            onClick={() => setIsAuthOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#FAF8F5]/90 dark:bg-[#1C1A17]/90 hover:bg-[#F2ECE2] dark:hover:bg-[#2A2724] backdrop-blur-md border border-[#E7E0D4] dark:border-[#33302A] rounded-2xl text-xs font-medium text-stone-700 dark:text-stone-300 shadow-sm transition-colors"
          >
            {isSupabaseConfigured ? (
              <>
                <Cloud size={14} className="text-emerald-700 dark:text-emerald-400" />
                <span className="hidden sm:inline">Supabase Ready</span>
              </>
            ) : (
              <>
                <CloudOff size={14} className="text-stone-400 dark:text-stone-500" />
                <span className="hidden sm:inline">Sync</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Modals & Drawers */}
      <NotificationCenter isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={() => setIsAuthOpen(false)}
      />
      <ExportModal isOpen={isExportOpen} onClose={() => setIsExportOpen(false)} />
      <CommandPalette isOpen={isCommandOpen} onClose={() => setIsCommandOpen(false)} />
    </>
  );
};
