'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useBoardStore } from '@/lib/store';
import { Bell, CloudOff, Sun, Moon, Search, Download, LogOut, User, ChevronDown, Compass, RefreshCw, HelpCircle, Check, Menu } from 'lucide-react';
import { notificationService, AppNotification } from '@/lib/notifications';
import { getSupabase } from '@/lib/supabase/client';
import { NotificationCenter } from './NotificationCenter';
import { AuthModal } from './AuthModal';
import { BoardSwitcher } from './BoardSwitcher';
import { ExportModal } from './ExportModal';
import { CommandPalette } from './CommandPalette';
import { ModeSelectorModal } from './ModeSelectorModal';
import { ShortcutsModal } from './ShortcutsModal';
import { OnboardingHint } from './OnboardingHint';
import { soundFx } from '@/lib/sound';

export const HeaderBar: React.FC = () => {
  const {
    activeTool,
    cancelConnecting,
    connectingFromCardId,
    theme,
    toggleTheme,
    openConfirmModal,
    isSyncing,
    saveStatus,
  } = useBoardStore();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [isModeOpen, setIsModeOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [currentUser, setCurrentUser] = useState<{ email?: string; id?: string } | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const hasHydratedRef = useRef(false);

  // Close profile and mobile dropdown when clicking outside
  useEffect(() => {
    if (!isProfileOpen && !isMobileMenuOpen) return;
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (isProfileOpen && profileRef.current && !profileRef.current.contains(target)) {
        setIsProfileOpen(false);
      }
      if (isMobileMenuOpen && mobileMenuRef.current && !mobileMenuRef.current.contains(target)) {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isProfileOpen, isMobileMenuOpen]);

  useEffect(() => {
    const unsub = notificationService.subscribe((items: AppNotification[]) => {
      setUnreadCount(items.filter((i) => !i.read).length);
    });
    return unsub;
  }, []);

  // Keyboard shortcuts: Ctrl+K or Cmd+K for command palette, '?' for shortcuts guide
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isInput =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable);

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandOpen((prev) => !prev);
      } else if (e.key === '?' && !isInput && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        setIsShortcutsOpen((prev) => !prev);
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

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setCurrentUser({ email: session.user.email, id: session.user.id });
        if (event === 'SIGNED_IN' && !hasHydratedRef.current) {
          hasHydratedRef.current = true;
          soundFx.playChime();
          await useBoardStore.getState().hydrateFromSupabase();
          notificationService.trigger('Cloud Synced', 'Your boards are synchronized with your account.');
        }
      } else {
        setCurrentUser(null);
        hasHydratedRef.current = false;
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
      <header className="fixed top-3 left-3 right-3 sm:top-4 sm:left-6 sm:right-6 z-40 flex items-center justify-between pointer-events-none">
        {/* Brand & Multi-Board Switcher */}
        <div className="flex items-center gap-2 sm:gap-3.5 p-1.5 sm:p-2 px-2.5 sm:px-4 bg-[#FAF8F5]/95 dark:bg-[#1C1A17]/95 backdrop-blur-md border border-[#E7E0D4] dark:border-[#33302A] rounded-xl sm:rounded-2xl shadow-sm pointer-events-auto max-w-[calc(100vw-120px)] sm:max-w-none">
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            <Image
              src="/drag2placeLogo.png"
              alt="Drag2Place Logo"
              width={24}
              height={24}
              className="rounded-lg object-contain shadow-xs shrink-0"
              priority
            />
            <span className="hidden sm:inline font-oregon font-bold text-base sm:text-lg tracking-wide text-stone-900 dark:text-stone-100 select-none">
              Drag2Place
            </span>
          </div>

          <div className="w-[1px] h-4 bg-stone-300 dark:bg-stone-700 shrink-0" />

          {/* Multi-Board Dropdown */}
          <BoardSwitcher />

          <div className="hidden sm:block w-[1px] h-4 bg-stone-300 dark:bg-stone-700 shrink-0" />

          {/* Persistent Save Status Indicator */}
          <div
            className="hidden sm:flex items-center gap-1.5 text-[11px] font-medium select-none text-stone-500 dark:text-stone-400 shrink-0"
            title={
              currentUser
                ? saveStatus === 'saving'
                  ? 'Saving changes to local storage & cloud...'
                  : 'All changes saved locally & synced to cloud'
                : saveStatus === 'saving'
                  ? 'Saving changes to local storage...'
                  : 'All changes saved locally to this device'
            }
          >
            {saveStatus === 'saving' ? (
              <>
                <RefreshCw size={11} className="text-amber-500 animate-spin shrink-0" />
                <span className="text-amber-700 dark:text-amber-400 text-[11px]">Saving…</span>
              </>
            ) : (
              <>
                <Check size={12} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="text-stone-600 dark:text-stone-300 text-[11px]">Saved</span>
              </>
            )}
          </div>
        </div>

        {/* Center mode status banner if connecting cards */}
        {activeTool === 'connect' && (
          <div className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900 rounded-full text-[11px] sm:text-xs font-medium shadow-xl animate-bounce pointer-events-auto">
            <span>
              {connectingFromCardId
                ? 'Step 2: Tap target card'
                : 'Step 1: Tap starting card'}
            </span>
            <button
              onClick={cancelConnecting}
              className="px-2 py-0.5 bg-stone-700 dark:bg-stone-300 hover:bg-stone-600 dark:hover:bg-stone-400 text-white dark:text-stone-900 rounded-full text-[10px] font-semibold"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Desktop Right Controls (md+) */}
        <div className="hidden md:flex items-center gap-2 pointer-events-auto">
          {/* Quick Search / Command Palette */}
          <button
            onClick={() => setIsCommandOpen(true)}
            className="flex items-center gap-2 p-2 px-3 bg-[#FAF8F5]/90 dark:bg-[#1C1A17]/90 hover:bg-[#F2ECE2] dark:hover:bg-[#2A2724] backdrop-blur-md border border-[#E7E0D4] dark:border-[#33302A] rounded-2xl text-stone-600 dark:text-stone-300 shadow-sm transition-colors text-xs"
            title="Search cards & actions (Ctrl + K)"
          >
            <Search size={14} />
            <span className="font-sans text-[11px] text-stone-500">Search</span>
            <kbd className="text-[9px] font-mono px-1 bg-stone-200/60 dark:bg-stone-800 rounded text-stone-400">
              Ctrl K
            </kbd>
          </button>

          {/* Workspace Modes & Headstarters */}
          <button
            onClick={() => setIsModeOpen(true)}
            className="flex items-center gap-1.5 p-2 px-3 bg-[#FAF8F5]/90 dark:bg-[#1C1A17]/90 hover:bg-[#F2ECE2] dark:hover:bg-[#2A2724] backdrop-blur-md border border-[#E7E0D4] dark:border-[#33302A] rounded-2xl text-stone-700 dark:text-stone-300 shadow-sm transition-colors text-xs font-medium"
            title="Choose a workspace mode"
          >
            <Compass size={14} className="text-amber-600 dark:text-amber-400" />
            <span className="font-sans text-[11px] font-semibold text-stone-700 dark:text-stone-200">Modes</span>
          </button>

          {/* Export & Backup */}
          <button
            onClick={() => setIsExportOpen(true)}
            className="p-2.5 bg-[#FAF8F5]/90 dark:bg-[#1C1A17]/90 hover:bg-[#F2ECE2] dark:hover:bg-[#2A2724] backdrop-blur-md border border-[#E7E0D4] dark:border-[#33302A] rounded-2xl text-stone-700 dark:text-stone-300 shadow-sm transition-colors cursor-pointer"
            title="Export image or backup board"
          >
            <Download size={16} />
          </button>

          {/* Shortcuts & Help (?) */}
          <button
            onClick={() => setIsShortcutsOpen(true)}
            className="p-2.5 bg-[#FAF8F5]/90 dark:bg-[#1C1A17]/90 hover:bg-[#F2ECE2] dark:hover:bg-[#2A2724] backdrop-blur-md border border-[#E7E0D4] dark:border-[#33302A] rounded-2xl text-stone-700 dark:text-stone-300 shadow-sm transition-colors cursor-pointer"
            title="Keyboard shortcuts & gestures (?)"
            aria-label="Keyboard shortcuts"
          >
            <HelpCircle size={16} />
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
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 p-1.5 px-2.5 bg-[#FAF8F5]/90 dark:bg-[#1C1A17]/90 hover:bg-[#F2ECE2] dark:hover:bg-[#2A2724] backdrop-blur-md border border-[#E7E0D4] dark:border-[#33302A] rounded-2xl text-xs text-stone-700 dark:text-stone-300 shadow-sm transition-colors group cursor-pointer"
                title="Account profile & cloud sync"
              >
                <div className="relative">
                  <div className="w-5 h-5 rounded-lg bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900 flex items-center justify-center font-bold text-[10px] shrink-0 uppercase shadow-xs">
                    {currentUser.email ? currentUser.email[0] : <User size={11} />}
                  </div>
                  {isSyncing ? (
                    <RefreshCw size={8} className="absolute -bottom-0.5 -right-0.5 text-amber-500 animate-spin" />
                  ) : (
                    <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#1C1A17]" />
                  )}
                </div>
                <span className="max-w-[130px] truncate text-[11px] font-medium font-sans text-stone-800 dark:text-stone-200">
                  {currentUser.email}
                </span>
                <ChevronDown
                  size={12}
                  className={`text-stone-400 group-hover:text-stone-700 dark:group-hover:text-stone-200 transition-transform duration-150 ${
                    isProfileOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {isProfileOpen && (
                <div
                  onWheel={(e) => e.stopPropagation()}
                  className="absolute right-0 top-full mt-2 w-56 p-2 bg-[#FAF8F5] dark:bg-[#1C1A17] border border-[#E7E0D4] dark:border-[#33302A] rounded-2xl shadow-xl z-50 flex flex-col space-y-1"
                >
                  <div className="px-2.5 py-1.5 border-b border-stone-200/70 dark:border-stone-800/70 space-y-1">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-stone-400 dark:text-stone-500">
                      Account
                    </div>
                    <div className="text-xs font-semibold text-stone-800 dark:text-stone-200 truncate" title={currentUser.email}>
                      {currentUser.email}
                    </div>
                    <div className="flex items-center justify-between text-[11px] pt-1 text-stone-500 dark:text-stone-400">
                      <span>Cloud Sync</span>
                      <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" /> Active
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleSignOutClick}
                    className="flex items-center gap-2 w-full p-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors text-left cursor-pointer"
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
              type="button"
              onClick={() => setIsAuthOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-900 dark:text-amber-200 border border-amber-300/60 dark:border-amber-700/60 rounded-2xl text-xs font-medium shadow-xs transition-all active:scale-95 cursor-pointer group"
              title="Sign in to sync with cloud"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
              <div className="flex items-center gap-1.5">
                <CloudOff size={13} className="text-amber-600 dark:text-amber-400 shrink-0" />
                <span className="font-semibold">Offline Draft</span>
              </div>
              <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-amber-500/20 text-amber-900 dark:text-amber-100 rounded-md ml-0.5 group-hover:bg-amber-500/30">
                Sync
              </span>
            </button>
          )}
        </div>

        {/* Mobile Right Controls (< md) */}
        <div className="flex md:hidden items-center gap-1.5 pointer-events-auto relative">
          {/* Quick Search */}
          <button
            onClick={() => setIsCommandOpen(true)}
            className="p-2 bg-[#FAF8F5]/95 dark:bg-[#1C1A17]/95 hover:bg-[#F2ECE2] dark:hover:bg-[#2A2724] backdrop-blur-md border border-[#E7E0D4] dark:border-[#33302A] rounded-xl text-stone-700 dark:text-stone-300 shadow-sm transition-colors"
            title="Search cards"
            aria-label="Search cards"
          >
            <Search size={15} />
          </button>

          {/* Notification Bell */}
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="relative p-2 bg-[#FAF8F5]/95 dark:bg-[#1C1A17]/95 hover:bg-[#F2ECE2] dark:hover:bg-[#2A2724] backdrop-blur-md border border-[#E7E0D4] dark:border-[#33302A] rounded-xl text-stone-700 dark:text-stone-300 shadow-sm transition-colors"
            title="Notifications"
            aria-label="Notifications"
          >
            <Bell size={15} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-600 text-white rounded-full text-[8px] font-mono font-bold flex items-center justify-center shadow-xs">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 bg-[#FAF8F5]/95 dark:bg-[#1C1A17]/95 hover:bg-[#F2ECE2] dark:hover:bg-[#2A2724] backdrop-blur-md border border-[#E7E0D4] dark:border-[#33302A] rounded-xl text-stone-700 dark:text-stone-300 shadow-sm transition-colors"
            title="Menu & settings"
            aria-label="Menu & settings"
          >
            <Menu size={15} />
          </button>

          {/* Mobile Dropdown Menu */}
          {isMobileMenuOpen && (
            <div
              ref={mobileMenuRef}
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
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        handleSignOutClick();
                      }}
                      className="p-1.5 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg flex items-center gap-1 font-medium"
                    >
                      <LogOut size={12} />
                      <span>Exit</span>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setIsAuthOpen(true);
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-xl bg-amber-500/15 text-amber-900 dark:text-amber-200 text-xs font-semibold"
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
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsModeOpen(true);
                }}
                className="w-full flex items-center gap-2.5 p-2 rounded-xl hover:bg-stone-200/60 dark:hover:bg-stone-800/60 text-xs font-medium text-left"
              >
                <Compass size={15} className="text-amber-600 dark:text-amber-400" />
                <span>Workspace Modes</span>
              </button>

              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsExportOpen(true);
                }}
                className="w-full flex items-center gap-2.5 p-2 rounded-xl hover:bg-stone-200/60 dark:hover:bg-stone-800/60 text-xs font-medium text-left"
              >
                <Download size={15} className="text-stone-600 dark:text-stone-400" />
                <span>Export & Backup</span>
              </button>

              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsShortcutsOpen(true);
                }}
                className="w-full flex items-center gap-2.5 p-2 rounded-xl hover:bg-stone-200/60 dark:hover:bg-stone-800/60 text-xs font-medium text-left"
              >
                <HelpCircle size={15} className="text-stone-600 dark:text-stone-400" />
                <span>Gestures & Shortcuts</span>
              </button>

              <button
                onClick={() => {
                  toggleTheme();
                }}
                className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-stone-200/60 dark:hover:bg-stone-800/60 text-xs font-medium text-left"
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
      <ModeSelectorModal isOpen={isModeOpen} onClose={() => setIsModeOpen(false)} />
      <ShortcutsModal isOpen={isShortcutsOpen} onClose={() => setIsShortcutsOpen(false)} />
      <OnboardingHint onOpenShortcuts={() => setIsShortcutsOpen(true)} />
    </>
  );
};
