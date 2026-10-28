'use client';

import React from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Grid, Volume2, VolumeX, Sun, Moon } from 'lucide-react';
import { useBoardStore } from '@/lib/store';

export const CanvasControls: React.FC = () => {
  const {
    currentBoard,
    setZoom,
    resetView,
    snapToGrid,
    setSnapToGrid,
    soundEnabled,
    setSoundEnabled,
    theme,
    toggleTheme,
  } = useBoardStore();

  const zoomPercent = Math.round(currentBoard.zoom * 100);

  return (
    <div
      data-controls="true"
      className="fixed bottom-[calc(4.75rem+env(safe-area-inset-bottom,0px))] right-3 sm:bottom-6 sm:right-6 z-40 flex items-center gap-1 sm:gap-1.5 p-1 sm:p-1.5 bg-[#F9F7F3]/95 dark:bg-[#1E1C19]/95 backdrop-blur-md border border-[#E7E1D7] dark:border-[#33302A] rounded-xl sm:rounded-2xl shadow-lg text-stone-700 dark:text-stone-300"
    >
      <button
        onClick={() => setZoom(currentBoard.zoom - 0.15)}
        className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl hover:bg-[#EFE9DF] dark:hover:bg-[#2A2724] transition-colors text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100"
        title="Zoom Out"
      >
        <ZoomOut size={15} />
      </button>

      <button
        onClick={() => setZoom(1)}
        className="px-1.5 sm:px-2 py-0.5 sm:py-1 text-[11px] sm:text-xs font-mono font-medium hover:bg-[#EFE9DF] dark:hover:bg-[#2A2724] rounded-md sm:rounded-lg transition-colors text-stone-700 dark:text-stone-200"
        title="Reset Zoom to 100%"
      >
        {zoomPercent}%
      </button>

      <button
        onClick={() => setZoom(currentBoard.zoom + 0.15)}
        className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl hover:bg-[#EFE9DF] dark:hover:bg-[#2A2724] transition-colors text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100"
        title="Zoom In"
      >
        <ZoomIn size={15} />
      </button>

      <div className="w-[1px] h-3.5 sm:h-4 bg-[#E0D8CD] dark:bg-[#38342E] mx-0.5" />

      <button
        onClick={resetView}
        className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl hover:bg-[#EFE9DF] dark:hover:bg-[#2A2724] transition-colors text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100"
        title="Recenter Canvas"
      >
        <RotateCcw size={15} />
      </button>

      <button
        onClick={() => setSnapToGrid(!snapToGrid)}
        className={`hidden xs:flex p-1.5 sm:p-2 rounded-lg sm:rounded-xl transition-colors ${
          snapToGrid
            ? 'bg-[#E5DEC3] dark:bg-stone-700 text-stone-900 dark:text-stone-100 font-semibold shadow-xs'
            : 'hover:bg-[#EFE9DF] dark:hover:bg-[#2A2724] text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
        }`}
        title={`Snap to Grid (${snapToGrid ? 'Active' : 'Off'})`}
      >
        <Grid size={15} />
      </button>

      <button
        onClick={() => setSoundEnabled(!soundEnabled)}
        className={`hidden xs:flex p-1.5 sm:p-2 rounded-lg sm:rounded-xl transition-colors ${
          soundEnabled
            ? 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-[#EFE9DF] dark:hover:bg-[#2A2724]'
            : 'text-stone-400 dark:text-stone-500 hover:bg-[#EFE9DF] dark:hover:bg-[#2A2724]'
        }`}
        title={soundEnabled ? 'Mute Interaction Sounds' : 'Unmute Sounds'}
      >
        {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
      </button>

      <div className="hidden xs:block w-[1px] h-3.5 sm:h-4 bg-[#E0D8CD] dark:bg-[#38342E] mx-0.5" />

      {/* Dark / Light Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl hover:bg-[#EFE9DF] dark:hover:bg-[#2A2724] transition-colors text-amber-600 dark:text-amber-400"
        title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      >
        {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
      </button>
    </div>
  );
};
