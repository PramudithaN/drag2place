'use client';

import React, { useEffect, useRef } from 'react';
import {
  MessageSquare,
  StickyNote,
  CheckSquare,
  Code2,
  Link2,
  Calendar,
  Image as ImageIcon,
  Palette,
  TrendingUp,
  RotateCcw,
  Maximize2,
  LayoutGrid,
  FolderKanban,
} from 'lucide-react';

interface CanvasContextMenuProps {
  x: number;
  y: number;
  onAddComment: () => void;
  onAddSection: () => void;
  onAddNote: () => void;
  onAddTodo: () => void;
  onAddCode: () => void;
  onAddLink: () => void;
  onAddEvent: () => void;
  onAddImage: () => void;
  onAddPalette: () => void;
  onAddMetric: () => void;
  onFitToScreen: () => void;
  onTidyUp: () => void;
  onResetView: () => void;
  onClose: () => void;
}

export const CanvasContextMenu: React.FC<CanvasContextMenuProps> = ({
  x,
  y,
  onAddComment,
  onAddSection,
  onAddNote,
  onAddTodo,
  onAddCode,
  onAddLink,
  onAddEvent,
  onAddImage,
  onAddPalette,
  onAddMetric,
  onFitToScreen,
  onTidyUp,
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
  const menuWidth = 240;
  const menuHeight = 440;
  const windowWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;
  const windowHeight = typeof window !== 'undefined' ? window.innerHeight : 800;

  const safeX = Math.min(Math.max(12, x), windowWidth - menuWidth - 12);
  const safeY = Math.min(Math.max(12, y), windowHeight - menuHeight - 12);

  return (
    <>
      {/* Invisible backdrop to capture clicks / touches outside */}
      <div
        className="fixed inset-0 z-50 cursor-default"
        onMouseDown={onClose}
        onTouchStart={onClose}
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
        className="fixed z-50 w-60 p-1.5 bg-[#FAF8F5]/95 dark:bg-[#1C1A17]/95 backdrop-blur-xl border border-[#E7E0D4] dark:border-[#33302A] rounded-2xl shadow-2xl text-stone-700 dark:text-stone-200 select-none animate-in fade-in zoom-in-95 duration-100 font-sans"
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
            <span>Add Review Pin</span>
          </div>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-800 dark:text-amber-300">
            Pin
          </span>
        </button>

        <div className="my-1.5 border-t border-stone-200/60 dark:border-stone-800/60" />

        {/* Quick Card Creation Options */}
        <div className="space-y-0.5 max-h-64 overflow-y-auto pr-0.5 scrollbar-thin">
          <button
            type="button"
            onClick={() => {
              onAddSection();
              onClose();
            }}
            className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-200/60 dark:hover:bg-stone-800/60 transition-colors cursor-pointer"
          >
            <FolderKanban size={14} className="text-amber-700 dark:text-amber-400" />
            <span>Section Frame (Group Cards)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onAddNote();
              onClose();
            }}
            className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-200/60 dark:hover:bg-stone-800/60 transition-colors cursor-pointer"
          >
            <StickyNote size={14} className="text-amber-600 dark:text-amber-400" />
            <span>Sticky Note (N)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onAddTodo();
              onClose();
            }}
            className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-200/60 dark:hover:bg-stone-800/60 transition-colors cursor-pointer"
          >
            <CheckSquare size={14} className="text-emerald-600 dark:text-emerald-400" />
            <span>Checklist (T)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onAddEvent();
              onClose();
            }}
            className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-200/60 dark:hover:bg-stone-800/60 transition-colors cursor-pointer"
          >
            <Calendar size={14} className="text-purple-600 dark:text-purple-400" />
            <span>Milestone Event (E)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onAddImage();
              onClose();
            }}
            className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-200/60 dark:hover:bg-stone-800/60 transition-colors cursor-pointer"
          >
            <ImageIcon size={14} className="text-sky-600 dark:text-sky-400" />
            <span>Image / Moodboard (I)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onAddCode();
              onClose();
            }}
            className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-200/60 dark:hover:bg-stone-800/60 transition-colors cursor-pointer"
          >
            <Code2 size={14} className="text-stone-600 dark:text-stone-400" />
            <span>Code Snippet (C)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onAddLink();
              onClose();
            }}
            className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-200/60 dark:hover:bg-stone-800/60 transition-colors cursor-pointer"
          >
            <Link2 size={14} className="text-indigo-600 dark:text-indigo-400" />
            <span>Link / Media Embed</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onAddPalette();
              onClose();
            }}
            className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-200/60 dark:hover:bg-stone-800/60 transition-colors cursor-pointer"
          >
            <Palette size={14} className="text-rose-600 dark:text-rose-400" />
            <span>Color Palette (P)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onAddMetric();
              onClose();
            }}
            className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-200/60 dark:hover:bg-stone-800/60 transition-colors cursor-pointer"
          >
            <TrendingUp size={14} className="text-blue-600 dark:text-blue-400" />
            <span>KPI Metric Goal (M)</span>
          </button>
        </div>

        <div className="my-1.5 border-t border-stone-200/60 dark:border-stone-800/60" />

        {/* Canvas Utilities */}
        <div className="space-y-0.5">
          <button
            type="button"
            onClick={() => {
              onFitToScreen();
              onClose();
            }}
            className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-[11px] font-medium text-stone-600 dark:text-stone-300 hover:bg-stone-200/60 dark:hover:bg-stone-800/60 transition-colors cursor-pointer"
          >
            <Maximize2 size={13} className="text-stone-500" />
            <span>Fit All Cards to Screen</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onTidyUp();
              onClose();
            }}
            className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-[11px] font-medium text-stone-600 dark:text-stone-300 hover:bg-stone-200/60 dark:hover:bg-stone-800/60 transition-colors cursor-pointer"
          >
            <LayoutGrid size={13} className="text-stone-500" />
            <span>Align 2D Grid (Horizontal & Vertical)</span>
          </button>

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
      </div>
    </>
  );
};
