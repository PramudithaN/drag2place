'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useBoardStore } from '@/lib/store';
import { Bell, CloudOff, Sun, Moon, Search, Download, LogOut, User, ChevronDown } from 'lucide-react';
import { notificationService, AppNotification } from '@/lib/notifications';
import { getSupabase } from '@/lib/supabase/client';
import { NotificationCenter } from './NotificationCenter';
import { AuthModal } from './AuthModal';
import { BoardSwitcher } from './BoardSwitcher';
import { ExportModal } from './ExportModal';
import { CommandPalette } from './CommandPalette';
import { soundFx } from '@/lib/sound';

export const HeaderBar: React.FC = () => {
  const { activeTool, cancelConnecting, connectingFromCardId, theme, toggleTheme, openConfirmModal } = useBoardStore();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [currentUser, setCurrentUser] = useState<{ email?: string; id?: string } | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    if (!isProfileOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isProfileOpen]);

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

  // Listen to live Supabase login / logout state
  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setCurrentUser({ email: user.email, id: user.id });
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setCurrentUser({ email: session.user.email, id: session.user.id });
      } else {
        setCurrentUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    const supabase = getSupabase();
    if (!supabase) return;
    try {
      await supabase.auth.signOut();
      setCurrentUser(null);
      soundFx.playDrop();
      notificationService.trigger('Signed Out', 'You are now working in local offline mode.');
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  const handleSignOutClick = () => {
    setIsProfileOpen(false);
    openConfirmModal({
      title: 'Sign Out of Account?',
      message: 'Your boards and cards will remain saved on this computer, but automatic cloud backup will pause until you sign in again.',
      confirmText: 'Sign Out',
      cancelText: 'Stay Signed In',
      isDestructive: true,
      icon: 'logout',
      onConfirm: handleSignOut,
    });
  };

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
          <div className="flex items-center gap-2.5 px-4 py-2 bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900 rounded-full text-xs font-medium shadow-xl animate-bounce pointer-events-auto">
            <span>
              {connectingFromCardId
                ? 'Step 2: Click destination card to link'
                : 'Step 1: Click starting card'}
            </span>
            <button
              onClick={cancelConnecting}
              className="px-2 py-0.5 bg-stone-700 dark:bg-stone-300 hover:bg-stone-600 dark:hover:bg-stone-400 text-white dark:text-stone-900 rounded-full text-[10px] font-semibold"
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

          {/* User Profile / Sign In */}
          {currentUser ? (
            <div ref={profileRef} className="relative">
              {/* Profile button */}
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 p-1.5 px-2.5 bg-[#FAF8F5]/90 dark:bg-[#1C1A17]/90 hover:bg-[#F2ECE2] dark:hover:bg-[#2A2724] backdrop-blur-md border border-[#E7E0D4] dark:border-[#33302A] rounded-2xl text-xs text-stone-700 dark:text-stone-300 shadow-sm transition-colors group"
                title="Account profile"
              >
                <div className="w-5 h-5 rounded-lg bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900 flex items-center justify-center font-bold text-[10px] shrink-0 uppercase shadow-xs">
                  {currentUser.email ? currentUser.email[0] : <User size={11} />}
                </div>
                <span className="hidden sm:inline max-w-[130px] truncate text-[11px] font-medium font-sans text-stone-800 dark:text-stone-200">
                  {currentUser.email}
                </span>
                <ChevronDown
                  size={12}
                  className={`text-stone-400 group-hover:text-stone-700 dark:group-hover:text-stone-200 transition-transform duration-150 ${
                    isProfileOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Profile Dropdown Menu */}
              {isProfileOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 p-2 bg-[#FAF8F5] dark:bg-[#1C1A17] border border-[#E7E0D4] dark:border-[#33302A] rounded-2xl shadow-xl z-50 flex flex-col space-y-1">
                  <div className="px-2.5 py-1.5 border-b border-stone-200/70 dark:border-stone-800/70">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-stone-400 dark:text-stone-500">
                      Account
                    </div>
                    <div className="text-xs font-semibold text-stone-800 dark:text-stone-200 truncate mt-0.5" title={currentUser.email}>
                      {currentUser.email}
                    </div>
                  </div>

                  {/* Sign Out Button */}
                  <button
                    onClick={handleSignOutClick}
                    className="flex items-center gap-2 w-full p-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors text-left"
                    title="Sign Out of Cloud Account"
                  >
                    <LogOut size={13} />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => setIsAuthOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-[#FAF8F5]/90 dark:bg-[#1C1A17]/90 hover:bg-[#F2ECE2] dark:hover:bg-[#2A2724] backdrop-blur-md border border-[#E7E0D4] dark:border-[#33302A] rounded-2xl text-xs font-medium text-stone-700 dark:text-stone-300 shadow-sm transition-colors"
              title="Work is currently saved on this computer only. Click to back up your boards to the cloud."
            >
              <CloudOff size={14} className="text-stone-400 dark:text-stone-500" />
              <span>Save to Cloud</span>
              <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-stone-200/80 dark:bg-stone-800 rounded-md text-stone-800 dark:text-stone-200 ml-0.5">
                Sign In
              </span>
            </button>
          )}
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
