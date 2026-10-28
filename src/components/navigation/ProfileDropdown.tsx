'use client';

import React, { useRef } from 'react';
import { useClickOutside } from '@/lib/useClickOutside';
import { User, RefreshCw, ChevronDown, LogOut } from 'lucide-react';

interface ProfileDropdownProps {
  currentUser: { email?: string; id?: string };
  isSyncing: boolean;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  onSignOut: () => void;
}

export const ProfileDropdown: React.FC<ProfileDropdownProps> = ({
  currentUser,
  isSyncing,
  isOpen,
  onToggle,
  onClose,
  onSignOut,
}) => {
  const profileRef = useRef<HTMLDivElement>(null);

  useClickOutside(profileRef, onClose, isOpen);

  return (
    <div ref={profileRef} className="relative">
      <button
        type="button"
        onClick={onToggle}
        className="flex items-center gap-2 p-1.5 px-2.5 bg-[#FAF8F5]/90 dark:bg-[#1C1A17]/90 hover:bg-[#F2ECE2] dark:hover:bg-[#2A2724] backdrop-blur-md border border-[#E7E0D4] dark:border-[#33302A] rounded-2xl text-xs text-stone-700 dark:text-stone-300 shadow-sm transition-colors group cursor-pointer"
        title="Account profile & cloud sync"
        aria-label="Account profile and cloud sync"
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
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
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
            type="button"
            onClick={onSignOut}
            className="flex items-center gap-2 w-full p-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors text-left cursor-pointer"
            title="Sign Out of Cloud Account"
          >
            <LogOut size={13} />
            <span>Sign Out</span>
          </button>
        </div>
      )}
    </div>
  );
};
