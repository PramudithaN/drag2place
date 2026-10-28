'use client';

import React, { useEffect } from 'react';
import { X, Keyboard, MousePointer, PlusCircle, Command, Smartphone } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const shortcutSections = [
    {
      title: 'Mobile & Touchscreen Gestures',
      icon: <Smartphone size={14} className="text-purple-600 dark:text-purple-400" />,
      items: [
        { keys: ['1-Finger', 'Drag'], desc: 'Pan freely across the infinite canvas' },
        { keys: ['2-Finger', 'Pinch'], desc: 'Smoothly zoom in and out anchored to fingers' },
        { keys: ['Touch & Hold'], desc: 'Open spatial context menu to place comments & cards' },
        { keys: ['Drag Header'], desc: 'Move any card to a new spatial position' },
        { keys: ['Drag Corner'], desc: 'Resize card width & height on mobile' },
        { keys: ['Tap Dock Icon'], desc: 'Instantly spawn new card at current view' },
      ],
    },
    {
      title: 'Canvas Navigation',
      icon: <MousePointer size={14} className="text-amber-600 dark:text-amber-400" />,
      items: [
        { keys: ['Space', '+', 'Drag'], desc: 'Pan freely across the infinite canvas' },
        { keys: ['Ctrl', '+', 'Wheel'], desc: 'Precision zoom in and out anchored to cursor' },
        { keys: ['Right-Click'], desc: 'Open spatial context menu to place comment pins or notes' },
        { keys: ['Shift', '+', 'Click'], desc: 'Select multiple cards at once' },
      ],
    },
    {
      title: 'Quick Card Placement',
      icon: <PlusCircle size={14} className="text-emerald-600 dark:text-emerald-400" />,
      items: [
        { keys: ['N'], desc: 'Place a new Sticky Note' },
        { keys: ['T'], desc: 'Place a new Task Checklist' },
        { keys: ['C'], desc: 'Place a Code & JSON Snippet' },
        { keys: ['P'], desc: 'Place a Color Palette card' },
        { keys: ['M'], desc: 'Place a KPI Metric Goal' },
        { keys: ['E'], desc: 'Place a Milestone Event with countdown' },
        { keys: ['I'], desc: 'Place an Image / Moodboard item' },
      ],
    },
    {
      title: 'Global Actions & Search',
      icon: <Command size={14} className="text-sky-600 dark:text-sky-400" />,
      items: [
        { keys: ['Ctrl', 'K'], desc: 'Open Command Palette & full-workspace search' },
        { keys: ['Delete'], desc: 'Safely delete selected card(s)' },
        { keys: ['?'], desc: 'Toggle this keyboard shortcuts guide' },
        { keys: ['Esc'], desc: 'Dismiss popovers, context menus, or cancel tool' },
      ],
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/40 dark:bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
      onWheel={(e) => e.stopPropagation()}
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] bg-[#FAF8F5] dark:bg-[#1C1A17] border border-[#E7E0D4] dark:border-[#33302A] rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 flex flex-col space-y-4 sm:space-y-5 font-sans overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        onWheel={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-200/70 dark:border-stone-800/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-400 flex items-center justify-center">
              <Keyboard size={18} />
            </div>
            <div>
              <h2 className="text-base font-oregon font-bold text-stone-900 dark:text-stone-100">
                Shortcuts & Touch Gestures
              </h2>
              <p className="text-[11px] text-stone-500 dark:text-stone-400">
                Speed up your spatial workflow with quick triggers, keys, and mobile gestures.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-xl hover:bg-stone-200/50 dark:hover:bg-stone-800 transition-colors cursor-pointer"
            title="Close (Esc)"
          >
            <X size={16} />
          </button>
        </div>

        {/* Shortcuts Content */}
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1 scrollbar-thin">
          {shortcutSections.map((sec) => (
            <div key={sec.title} className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-stone-400 dark:text-stone-500 font-semibold px-1">
                {sec.icon}
                <span>{sec.title}</span>
              </div>

              <div className="bg-white/60 dark:bg-stone-900/50 border border-stone-200/60 dark:border-stone-800/60 rounded-2xl divide-y divide-stone-200/50 dark:divide-stone-800/50 overflow-hidden">
                {sec.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between px-3.5 py-2 text-xs">
                    <span className="text-stone-700 dark:text-stone-300 font-medium">
                      {item.desc}
                    </span>
                    <div className="flex items-center gap-1 shrink-0 ml-3">
                      {item.keys.map((k, ki) => (
                        <kbd
                          key={ki}
                          className={`font-mono text-[10px] font-semibold px-1.5 py-0.5 rounded shadow-2xs ${
                            k === '+'
                              ? 'text-stone-400 bg-transparent shadow-none px-0.5'
                              : 'bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 border border-stone-300/80 dark:border-stone-700'
                          }`}
                        >
                          {k}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-stone-200/60 dark:border-stone-800/60 flex items-center justify-between text-[11px] text-stone-400">
          <span>Tip: Hover over dock buttons anytime for quick key tooltips</span>
          <span className="font-mono text-[10px]">Press Esc to close</span>
        </div>
      </div>
    </div>
  );
};
