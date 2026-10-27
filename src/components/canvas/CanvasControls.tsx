'use client';

import React from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Grid, Volume2, VolumeX } from 'lucide-react';
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
  } = useBoardStore();

  const zoomPercent = Math.round(currentBoard.zoom * 100);

  return (
    <div className="fixed bottom-6 right-6 z-40 flex items-center gap-1.5 p-1.5 bg-[#F9F7F3]/90 backdrop-blur-md border border-[#E7E1D7] rounded-2xl shadow-lg text-stone-700">
      <button
        onClick={() => setZoom(currentBoard.zoom - 0.15)}
        className="p-2 rounded-xl hover:bg-[#EFE9DF] transition-colors text-stone-600 hover:text-stone-900"
        title="Zoom Out"
      >
        <ZoomOut size={16} />
      </button>

      <button
        onClick={() => setZoom(1)}
        className="px-2 py-1 text-xs font-mono font-medium hover:bg-[#EFE9DF] rounded-lg transition-colors text-stone-700"
        title="Reset Zoom to 100%"
      >
        {zoomPercent}%
      </button>

      <button
        onClick={() => setZoom(currentBoard.zoom + 0.15)}
        className="p-2 rounded-xl hover:bg-[#EFE9DF] transition-colors text-stone-600 hover:text-stone-900"
        title="Zoom In"
      >
        <ZoomIn size={16} />
      </button>

      <div className="w-[1px] h-4 bg-[#E0D8CD] mx-0.5" />

      <button
        onClick={resetView}
        className="p-2 rounded-xl hover:bg-[#EFE9DF] transition-colors text-stone-600 hover:text-stone-900"
        title="Recenter Canvas"
      >
        <RotateCcw size={16} />
      </button>

      <button
        onClick={() => setSnapToGrid(!snapToGrid)}
        className={`p-2 rounded-xl transition-colors ${
          snapToGrid
            ? 'bg-[#E5DEC3] text-stone-900 font-semibold shadow-xs'
            : 'hover:bg-[#EFE9DF] text-stone-500 hover:text-stone-900'
        }`}
        title={`Snap to Grid (${snapToGrid ? 'Active' : 'Off'})`}
      >
        <Grid size={16} />
      </button>

      <button
        onClick={() => setSoundEnabled(!soundEnabled)}
        className={`p-2 rounded-xl transition-colors ${
          soundEnabled
            ? 'text-stone-600 hover:text-stone-900 hover:bg-[#EFE9DF]'
            : 'text-stone-400 hover:bg-[#EFE9DF]'
        }`}
        title={soundEnabled ? 'Mute Interaction Sounds' : 'Unmute Sounds'}
      >
        {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
      </button>
    </div>
  );
};
