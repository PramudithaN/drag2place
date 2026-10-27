'use client';

import React, { useEffect, useRef } from 'react';
import { MessageSquare, StickyNote, CheckSquare, Code2, Link2, RotateCcw } from 'lucide-react';

interface CanvasContextMenuProps {
  x: number;
  y: number;
  onAddComment: () => void;
  onAddNote: () => void;
  onAddTodo: () => void;
  onAddCode: () => void;
  onAddLink: () => void;
  onResetView: () => void;
  onClose: () => void;
}

export const CanvasContextMenu: React.FC<CanvasContextMenuProps> = ({
  x,
  y,
  onAddComment,
  onAddNote,
  onAddTodo,
  onAddCode,
  onAddLink,
  onResetView,
  onClose,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Viewport bounds clamp
  const menuWidth = 220;
  const menuHeight = 250;
  const windowWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;
  const windowHeight = typeof window !== 'undefined' ? window.innerHeight : 800;

  const safeX = Math.min(Math.max(12, x), windowWidth - menuWidth - 12);
  const safeY = Math.min(Math.max(12, y), windowHeight - menuHeight - 12);

  return (
    <>
      {/* Invisible backdrop to capture clicks outside */}
      <div
        className="fixed inset-0 z-50 cursor-default"
        onMouseDown={onClose}
        onContextMenu={(e) => {
          e.preventDefault();
          onClose();
        }}
      />

      {/* Sleek Floating Context Menu */}
      <div
        ref={menuRef}
        style={{ left: `${safeX}px`, top: `${safeY}px` }}
        onMouseDown={(e) => e.stopPropagation()}
        className="fixed z-50 w-56 p-1.5 bg-[#FAF8F5]/95 dark:bg-[#1C1A17]/95 backdrop-blur-xl border border-[#E7E0D4] dark:border-[#33302A] rounded-2xl shadow-2xl text-stone-700 dark:text-stone-200 select-none animate-in fade-in zoom-in-95 duration-100 font-sans"
      >
        {/* Primary Action: Add Comment Pin */}
        <button
          type="button"
          onClick={() => {
            onAddComment();
            onClose();
          }}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-amber-900 dark:text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 active:scale-[0.98] transition-all cursor-pointer group"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center shadow-xs">
              <MessageSquare size={12} className="stroke-[2.5]" />
            </div>
            <span>Add Comment Here</span>
          </div>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-800 dark:text-amber-300">
            Pin
          </span>
        </button>

        <div className="my-1.5 border-t border-stone-200/60 dark:border-stone-800/60" />

        {/* Quick Card Creation Options */}
        <div className="space-y-0.5">
          <button
            type="button"
            onClick={() => {
              onAddNote();
              onClose();
            }}
            className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-200/60 dark:hover:bg-stone-800/60 transition-colors cursor-pointer"
          >
            <StickyNote size={14} className="text-stone-500 dark:text-stone-400" />
            <span>Sticky Note</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onAddTodo();
              onClose();
            }}
            className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-200/60 dark:hover:bg-stone-800/60 transition-colors cursor-pointer"
          >
            <CheckSquare size={14} className="text-stone-500 dark:text-stone-400" />
            <span>Checklist</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onAddCode();
              onClose();
            }}
            className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-200/60 dark:hover:bg-stone-800/60 transition-colors cursor-pointer"
          >
            <Code2 size={14} className="text-stone-500 dark:text-stone-400" />
            <span>Code Snippet</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onAddLink();
              onClose();
            }}
            className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-200/60 dark:hover:bg-stone-800/60 transition-colors cursor-pointer"
          >
            <Link2 size={14} className="text-stone-500 dark:text-stone-400" />
            <span>Link Bookmark</span>
          </button>
        </div>

        <div className="my-1.5 border-t border-stone-200/60 dark:border-stone-800/60" />

        {/* Canvas Utilities */}
        <button
          type="button"
          onClick={() => {
            onResetView();
            onClose();
          }}
          className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-[11px] font-medium text-stone-500 dark:text-stone-400 hover:bg-stone-200/60 dark:hover:bg-stone-800/60 transition-colors cursor-pointer"
        >
          <RotateCcw size={13} />
          <span>Reset Canvas View</span>
        </button>
      </div>
    </>
  );
};
