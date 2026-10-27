'use client';

import React, { useState, useEffect } from 'react';
import { notificationService, AppNotification } from '@/lib/notifications';
import { Bell, CheckCheck, Trash2, Clock, X, Volume2 } from 'lucide-react';
import { soundFx } from '@/lib/sound';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    setPermission(notificationService.getPermissionStatus());
    const unsubscribe = notificationService.subscribe((items) => {
      setNotifications(items);
    });
    return unsubscribe;
  }, []);

  const handleRequestPermission = async () => {
    const status = await notificationService.requestPermission();
    setPermission(status);
    if (status === 'granted') {
      notificationService.trigger('Notifications Enabled', 'You will now receive timely sound & push reminders for events!');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed top-16 right-6 z-50 w-80 sm:w-96 bg-[#FDFBF7] border border-[#E8E2D6] rounded-2xl shadow-2xl p-4 flex flex-col space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-stone-200/60">
        <div className="flex items-center gap-2">
          <Bell size={16} className="text-stone-700" />
          <h3 className="text-sm font-semibold text-stone-800">Notifications & Alerts</h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100"
        >
          <X size={15} />
        </button>
      </div>

      {/* Permission banner */}
      {permission !== 'granted' && (
        <div className="p-2.5 bg-amber-50/80 border border-amber-200/80 rounded-xl flex items-center justify-between">
          <div className="text-[11px] text-amber-900 leading-tight">
            Enable browser push alerts to get notified even when this tab is backgrounded.
          </div>
          <button
            onClick={handleRequestPermission}
            className="px-2 py-1 text-[11px] font-medium bg-amber-700 text-white rounded-lg hover:bg-amber-800 shrink-0 ml-2"
          >
            Allow
          </button>
        </div>
      )}

      {/* Notifications list */}
      <div className="flex-1 max-h-72 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
        {notifications.length === 0 ? (
          <div className="py-8 text-center text-xs text-stone-400">
            <Clock size={20} className="mx-auto mb-1 stroke-1" />
            No active alerts or reminders
          </div>
        ) : (
          notifications.map((item) => (
            <div
              key={item.id}
              className={`p-2.5 rounded-xl border text-xs transition-colors ${
                item.read
                  ? 'bg-stone-50/50 border-stone-200/60 text-stone-500'
                  : 'bg-white border-stone-200 text-stone-800 shadow-xs'
              }`}
            >
              <div className="font-semibold text-stone-900">{item.title}</div>
              <div className="text-[11px] text-stone-600 mt-0.5 leading-snug">{item.message}</div>
              <div className="flex items-center justify-between mt-2 pt-1 text-[10px] text-stone-400 font-mono">
                <span>{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                {!item.read && (
                  <button
                    onClick={() => notificationService.markAsRead(item.id)}
                    className="hover:text-stone-800"
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
      <div className="flex items-center justify-between pt-2 border-t border-stone-200/60 text-xs text-stone-500">
        <button
          onClick={() => {
            soundFx.playChime();
          }}
          className="flex items-center gap-1 hover:text-stone-800"
        >
          <Volume2 size={13} /> Test sound
        </button>

        <div className="flex items-center gap-3">
          {notifications.length > 0 && (
            <button
              onClick={() => notificationService.clearAll()}
              className="flex items-center gap-1 hover:text-rose-600"
            >
              <Trash2 size={13} /> Clear
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
