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
    <div className="fixed bottom-6 right-6 z-40 flex items-center gap-1.5 p-1.5 bg-[#F9F7F3]/90 dark:bg-[#1E1C19]/90 backdrop-blur-md border border-[#E7E1D7] dark:border-[#33302A] rounded-2xl shadow-lg text-stone-700 dark:text-stone-300">
      <button
        onClick={() => setZoom(currentBoard.zoom - 0.15)}
        className="p-2 rounded-xl hover:bg-[#EFE9DF] dark:hover:bg-[#2A2724] transition-colors text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100"
        title="Zoom Out"
      >
        <ZoomOut size={16} />
      </button>

      <button
        onClick={() => setZoom(1)}
        className="px-2 py-1 text-xs font-mono font-medium hover:bg-[#EFE9DF] dark:hover:bg-[#2A2724] rounded-lg transition-colors text-stone-700 dark:text-stone-200"
        title="Reset Zoom to 100%"
      >
        {zoomPercent}%
      </button>

      <button
        onClick={() => setZoom(currentBoard.zoom + 0.15)}
        className="p-2 rounded-xl hover:bg-[#EFE9DF] dark:hover:bg-[#2A2724] transition-colors text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100"
        title="Zoom In"
      >
        <ZoomIn size={16} />
      </button>

      <div className="w-[1px] h-4 bg-[#E0D8CD] dark:bg-[#38342E] mx-0.5" />

      <button
        onClick={resetView}
        className="p-2 rounded-xl hover:bg-[#EFE9DF] dark:hover:bg-[#2A2724] transition-colors text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100"
        title="Recenter Canvas"
      >
        <RotateCcw size={16} />
      </button>

      <button
        onClick={() => setSnapToGrid(!snapToGrid)}
        className={`p-2 rounded-xl transition-colors ${
          snapToGrid
            ? 'bg-[#E5DEC3] dark:bg-stone-700 text-stone-900 dark:text-stone-100 font-semibold shadow-xs'
            : 'hover:bg-[#EFE9DF] dark:hover:bg-[#2A2724] text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
        }`}
        title={`Snap to Grid (${snapToGrid ? 'Active' : 'Off'})`}
      >
        <Grid size={16} />
      </button>

      <button
        onClick={() => setSoundEnabled(!soundEnabled)}
        className={`p-2 rounded-xl transition-colors ${
          soundEnabled
            ? 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-[#EFE9DF] dark:hover:bg-[#2A2724]'
            : 'text-stone-400 dark:text-stone-500 hover:bg-[#EFE9DF] dark:hover:bg-[#2A2724]'
        }`}
        title={soundEnabled ? 'Mute Interaction Sounds' : 'Unmute Sounds'}
      >
        {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
      </button>

      <div className="w-[1px] h-4 bg-[#E0D8CD] dark:bg-[#38342E] mx-0.5" />

      {/* Dark / Light Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="p-2 rounded-xl hover:bg-[#EFE9DF] dark:hover:bg-[#2A2724] transition-colors text-amber-600 dark:text-amber-400"
        title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      >
        {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
      </button>
    </div>
  );
};
