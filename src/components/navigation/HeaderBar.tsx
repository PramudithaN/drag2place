'use client';

import React, { useState, useEffect } from 'react';
import { useBoardStore } from '@/lib/store';
import { Bell, Cloud, CloudOff } from 'lucide-react';
import { notificationService, AppNotification } from '@/lib/notifications';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { NotificationCenter } from './NotificationCenter';
import { AuthModal } from './AuthModal';

export const HeaderBar: React.FC = () => {
  const { currentBoard, cards, activeTool, cancelConnecting } = useBoardStore();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const unsub = notificationService.subscribe((items: AppNotification[]) => {
      setUnreadCount(items.filter((i) => !i.read).length);
    });
    return unsub;
  }, []);

  return (
    <>
      <header className="fixed top-4 left-6 right-6 z-40 flex items-center justify-between pointer-events-none">
        {/* Brand & Board title */}
        <div className="flex items-center gap-3.5 p-2 px-4 bg-[#FAF8F5]/95 backdrop-blur-md border border-[#E7E0D4] rounded-2xl shadow-sm pointer-events-auto">
          <div className="flex items-center gap-2.5">
            <div
              style={{ fontFamily: 'var(--font-oregon), "Oregon LDO", Georgia, serif' }}
              className="w-6 h-6 rounded-lg bg-stone-900 text-stone-100 flex items-center justify-center font-bold text-sm shadow-xs"
            >
              D
            </div>
            <span
              style={{ fontFamily: 'var(--font-oregon), "Oregon LDO", Georgia, serif' }}
              className="font-bold text-lg tracking-wide text-stone-900 select-none"
            >
              Drag2Place
            </span>
          </div>

          <div className="w-[1px] h-4 bg-stone-300" />

          <div className="flex items-center gap-1.5 text-xs text-stone-600">
            <span
              style={{ fontFamily: 'var(--font-oregon), "Oregon LDO", Georgia, serif' }}
              className="font-semibold text-stone-800 text-sm"
            >
              {currentBoard.title}
            </span>
            <span className="text-[11px] font-mono text-stone-400">({cards.length} cards)</span>
          </div>
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
          {/* Notification bell */}
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="relative p-2.5 bg-[#FAF8F5]/90 hover:bg-[#F2ECE2] backdrop-blur-md border border-[#E7E0D4] rounded-2xl text-stone-700 shadow-sm transition-colors"
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
            className="flex items-center gap-1.5 px-3 py-2 bg-[#FAF8F5]/90 hover:bg-[#F2ECE2] backdrop-blur-md border border-[#E7E0D4] rounded-2xl text-xs font-medium text-stone-700 shadow-sm transition-colors"
          >
            {isSupabaseConfigured ? (
              <>
                <Cloud size={14} className="text-emerald-700" />
                <span>Supabase Ready</span>
              </>
            ) : (
              <>
                <CloudOff size={14} className="text-stone-400" />
                <span>Guest / Cloud Sync</span>
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
    </>
  );
};
