'use client';

import React, { useState, useEffect, useRef } from 'react';
import { notificationService, AppNotification } from '@/lib/notifications';
import { useClickOutside } from '@/lib/useClickOutside';
import { Bell, Trash2, Clock, X, Volume2, CheckCheck } from 'lucide-react';
import { soundFx } from '@/lib/sound';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [permission, setPermission] = useState<NotificationPermission>(() => notificationService.getPermissionStatus());
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = notificationService.subscribe((items) => {
      setNotifications(items);
    });
    return unsubscribe;
  }, []);

  // Click outside to close notification center
  useClickOutside(drawerRef, onClose, isOpen);

  const handleRequestPermission = async () => {
    const status = await notificationService.requestPermission();
    setPermission(status);
    if (status === 'granted') {
      notificationService.trigger('Notifications Enabled', 'You will now receive timely sound & push reminders for events!');
    }
  };

  const unreadCount = notifications.filter((item) => !item.read).length;

  const handleMarkAllAsRead = () => {
    notificationService.markAllAsRead();
    soundFx.playCheck();
  };

  if (!isOpen) return null;

  return (
    <div
      ref={drawerRef}
      onWheel={(e) => e.stopPropagation()}
      className="fixed top-14 sm:top-16 right-3 left-3 sm:left-auto sm:right-6 z-50 w-auto sm:w-96 max-w-[calc(100vw-1.5rem)] max-h-[80vh] bg-[#FDFBF7] dark:bg-[#1D1B18] border border-[#E8E2D6] dark:border-[#33302A] rounded-2xl shadow-2xl p-4 flex flex-col space-y-3 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-stone-200/60 dark:border-stone-800">
        <div className="flex items-center gap-2">
          <Bell size={16} className="text-stone-700 dark:text-stone-300" />
          <h3 className="text-sm font-semibold text-stone-800 dark:text-stone-100">Notifications & Alerts</h3>
          {unreadCount > 0 && (
            <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-amber-500/20 text-amber-700 dark:text-amber-400 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-amber-700 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 hover:bg-amber-500/10 rounded-lg transition-colors cursor-pointer"
              title="Mark all notifications as read"
            >
              <CheckCheck size={13} />
              <span>Mark all as read</span>
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
            title="Close notifications"
          >
            <X size={15} />
          </button>
        </div>
      </div>

      {/* Permission banner */}
      {permission !== 'granted' && (
        <div className="p-2.5 bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60 rounded-xl flex items-center justify-between">
          <div className="text-[11px] text-amber-900 dark:text-amber-200 leading-tight">
            Enable browser push alerts to get notified even when this tab is backgrounded.
          </div>
          <button
            onClick={handleRequestPermission}
            className="px-2 py-1 text-[11px] font-medium bg-amber-700 text-white rounded-lg hover:bg-amber-800 shrink-0 ml-2 cursor-pointer"
          >
            Allow
          </button>
        </div>
      )}

      {/* Notifications list */}
      <div className="flex-1 max-h-72 overflow-y-auto space-y-2 pr-1 scrollbar-thin overscroll-contain">
        {notifications.length === 0 ? (
          <div className="py-8 text-center text-xs text-stone-400 dark:text-stone-500">
            <Clock size={20} className="mx-auto mb-1 stroke-1" />
            No active alerts or reminders
          </div>
        ) : (
          notifications.map((item) => (
            <div
              key={item.id}
              className={`p-2.5 rounded-xl border text-xs transition-colors ${
                item.read
                  ? 'bg-stone-50/50 dark:bg-stone-900/40 border-stone-200/60 dark:border-stone-800 text-stone-500 dark:text-stone-400'
                  : 'bg-white dark:bg-[#25221E] border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-100 shadow-xs'
              }`}
            >
              <div className="font-semibold text-stone-900 dark:text-stone-100">{item.title}</div>
              <div className="text-[11px] text-stone-600 dark:text-stone-300 mt-0.5 leading-snug">{item.message}</div>
              <div className="flex items-center justify-between mt-2 pt-1 text-[10px] text-stone-400 dark:text-stone-500 font-mono">
                <span>{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                {!item.read && (
                  <button
                    onClick={() => {
                      notificationService.markAsRead(item.id);
                      soundFx.playCheck();
                    }}
                    className="hover:text-stone-800 dark:hover:text-stone-200 font-medium cursor-pointer"
                  >
                    Mark read
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer controls */}
      <div className="flex items-center justify-between pt-2 border-t border-stone-200/60 dark:border-stone-800 text-xs text-stone-500 dark:text-stone-400">
        <button
          onClick={() => {
            soundFx.playChime();
          }}
          className="flex items-center gap-1 hover:text-stone-800 dark:hover:text-stone-200 transition-colors cursor-pointer"
        >
          <Volume2 size={13} /> Test sound
        </button>

        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="flex items-center gap-1 text-stone-600 dark:text-stone-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors cursor-pointer"
              title="Mark all as read"
            >
              <CheckCheck size={13} /> Mark all read
            </button>
          )}
          {notifications.length > 0 && (
            <button
              onClick={() => {
                notificationService.clearAll();
                soundFx.playDrop();
              }}
              className="flex items-center gap-1 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
              title="Clear all notifications"
            >
              <Trash2 size={13} /> Clear
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
