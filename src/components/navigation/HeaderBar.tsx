'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useBoardStore } from '@/lib/store';
import { Bell, CloudOff, Sun, Moon, Search, Download, Compass, HelpCircle, Menu, RefreshCw, Check, Filter } from 'lucide-react';
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
import { ProfileDropdown } from './ProfileDropdown';
import { MobileMenuDrawer } from './MobileMenuDrawer';
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
    showFilterBar,
    toggleFilterBar,
    activeFilterType,
    searchQuery,
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
  const hasHydratedRef = useRef(false);

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
          <BoardSwitcher onOpenModes={() => setIsModeOpen(true)} />

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
          {/* Spotlight Filter Bar Toggle */}
          <button
            onClick={toggleFilterBar}
            className={`flex items-center gap-1.5 p-2 px-3 backdrop-blur-md border rounded-2xl shadow-sm transition-colors text-xs font-medium cursor-pointer ${
              showFilterBar || activeFilterType !== 'all' || searchQuery.trim().length > 0
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-800 dark:text-amber-300'
                : 'bg-[#FAF8F5]/90 dark:bg-[#1C1A17]/90 hover:bg-[#F2ECE2] dark:hover:bg-[#2A2724] border-[#E7E0D4] dark:border-[#33302A] text-stone-600 dark:text-stone-300'
            }`}
            title="Toggle Card Spotlight & Type Filter (Ctrl + F)"
          >
            <Filter size={13} className={showFilterBar || activeFilterType !== 'all' || searchQuery.trim().length > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-stone-500'} />
            <span className="font-sans text-[11px]">Filter</span>
            {(activeFilterType !== 'all' || searchQuery.trim().length > 0) && (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            )}
          </button>

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
            <ProfileDropdown
              currentUser={currentUser}
              isSyncing={isSyncing}
              isOpen={isProfileOpen}
              onToggle={() => setIsProfileOpen(!isProfileOpen)}
              onClose={() => setIsProfileOpen(false)}
              onSignOut={handleSignOutClick}
            />
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
          <MobileMenuDrawer
            isOpen={isMobileMenuOpen}
            onClose={() => setIsMobileMenuOpen(false)}
            currentUser={currentUser}
            theme={theme}
            toggleTheme={toggleTheme}
            onSignOutClick={handleSignOutClick}
            onOpenAuth={() => setIsAuthOpen(true)}
            onOpenModes={() => setIsModeOpen(true)}
            onOpenExport={() => setIsExportOpen(true)}
            onOpenShortcuts={() => setIsShortcutsOpen(true)}
          />
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
      <CommandPalette isOpen={isCommandOpen} onClose={() => setIsCommandOpen(false)} onOpenModes={() => setIsModeOpen(true)} />
      <ModeSelectorModal isOpen={isModeOpen} onClose={() => setIsModeOpen(false)} />
      <ShortcutsModal isOpen={isShortcutsOpen} onClose={() => setIsShortcutsOpen(false)} />
      <OnboardingHint onOpenShortcuts={() => setIsShortcutsOpen(true)} />
    </>
  );
};
