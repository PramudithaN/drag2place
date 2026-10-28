'use client';

import React, { useState, useSyncExternalStore } from 'react';
import { Sparkles, HelpCircle } from 'lucide-react';

interface OnboardingHintProps {
  onOpenShortcuts: () => void;
}

const emptySubscribe = () => () => {};

export const OnboardingHint: React.FC<OnboardingHintProps> = ({ onOpenShortcuts }) => {
  const [dismissed, setDismissed] = useState(false);

  const isFirstVisit = useSyncExternalStore(
    emptySubscribe,
    () => typeof window !== 'undefined' && !localStorage.getItem('drag2place_onboarded'),
    () => false
  );

  const handleDismiss = () => {
    setDismissed(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem('drag2place_onboarded', 'true');
    }
  };

  if (!isFirstVisit || dismissed) return null;

  return (
    <div className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom,0px))] sm:bottom-24 left-1/2 -translate-x-1/2 z-40 max-w-lg w-[94vw] sm:w-auto flex items-center justify-between gap-2 sm:gap-3 p-2 sm:p-2.5 px-3 sm:px-4 bg-[#FAF8F5]/95 dark:bg-[#1C1A17]/95 backdrop-blur-xl border border-amber-500/30 dark:border-amber-500/30 rounded-2xl shadow-xl shadow-stone-900/10 dark:shadow-black/30 animate-in fade-in slide-in-from-bottom-3 duration-300 font-sans select-none pointer-events-auto">
      {/* Onboarding hint text */}
      <div className="flex items-center gap-2 sm:gap-2.5 text-xs text-stone-800 dark:text-stone-200">
        <Sparkles size={16} className="text-amber-600 dark:text-amber-400 shrink-0" />
        <span className="leading-snug">
          <span className="hidden sm:inline">Press <kbd className="font-mono bg-stone-200/80 dark:bg-stone-800 px-1.5 py-0.5 rounded text-[10px] font-semibold text-stone-900 dark:text-stone-100">N</kbd> to add note, </span>
          <span className="sm:hidden font-medium">Tap dock to add, </span>
          <strong>drag</strong> to move, <span className="hidden sm:inline"><kbd className="font-mono bg-stone-200/80 dark:bg-stone-800 px-1.5 py-0.5 rounded text-[10px] font-semibold text-stone-900 dark:text-stone-100">Ctrl+K</kbd> to </span>search
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 ml-1 sm:ml-2">
        <button
          type="button"
          onClick={onOpenShortcuts}
          className="flex items-center gap-1 text-[11px] font-semibold text-amber-800 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-200 px-1.5 sm:px-2 py-1 rounded-lg hover:bg-amber-500/10 transition-colors cursor-pointer"
          title="View all shortcuts & gestures"
        >
          <HelpCircle size={13} />
          <span className="hidden xs:inline">Shortcuts</span>
        </button>

        <button
          type="button"
          onClick={handleDismiss}
          className="px-2 sm:px-2.5 py-1 bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-stone-100 dark:text-stone-900 rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
        >
          Got it
        </button>
      </div>
    </div>
  );
};
