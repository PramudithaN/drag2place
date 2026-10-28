'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBoardStore } from '@/lib/store';
import { X, Navigation } from 'lucide-react';

export const CanvasMinimap: React.FC = () => {
  const {
    showMinimap,
    toggleMinimap,
    getActiveCards,
    currentBoard,
    setPan,
  } = useBoardStore();

  const cards = getActiveCards();

  if (!showMinimap) return null;

  // Compute bounding box of all cards or default
  const minX = cards.length > 0 ? Math.min(...cards.map((c) => c.x)) - 100 : -500;
  const maxX = cards.length > 0 ? Math.max(...cards.map((c) => c.x + c.width)) + 100 : 1500;
  const minY = cards.length > 0 ? Math.min(...cards.map((c) => c.y)) - 100 : -300;
  const maxY = cards.length > 0 ? Math.max(...cards.map((c) => c.y + c.height)) + 100 : 1200;

  const totalWidth = Math.max(maxX - minX, 1000);
  const totalHeight = Math.max(maxY - minY, 800);

  const mapWidth = 180;
  const mapHeight = 110;

  const scale = Math.min(mapWidth / totalWidth, mapHeight / totalHeight);

  // Viewport rect calculation in minimap space
  const viewWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;
  const viewHeight = typeof window !== 'undefined' ? window.innerHeight : 800;

  const curZoom = currentBoard.zoom || 1;
  const curPan = currentBoard.pan;

  // World coordinates of visible viewport:
  // screen (0, 0) -> canvas: -pan.x, -pan.y
  // screen (w, h) -> canvas: w/zoom - pan.x, h/zoom - pan.y
  const viewWorldLeft = -curPan.x;
  const viewWorldTop = -curPan.y;
  const viewWorldWidth = viewWidth / curZoom;
  const viewWorldHeight = viewHeight / curZoom;

  const viewMiniX = (viewWorldLeft - minX) * scale;
  const viewMiniY = (viewWorldTop - minY) * scale;
  const viewMiniW = viewWorldWidth * scale;
  const viewMiniH = viewWorldHeight * scale;

  const handleMinimapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Convert click in minimap to world coordinates
    const targetWorldX = minX + clickX / scale;
    const targetWorldY = minY + clickY / scale;

    // Center viewport onto that world coordinate
    const newPanX = viewWidth / (2 * curZoom) - targetWorldX;
    const newPanY = viewHeight / (2 * curZoom) - targetWorldY;

    setPan({ x: Math.round(newPanX), y: Math.round(newPanY) });
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 10 }}
        className="fixed bottom-20 sm:bottom-20 right-3 sm:right-6 z-40 p-2 bg-[#FAF8F5]/95 dark:bg-[#1C1A17]/95 backdrop-blur-md border border-[#E7E0D4] dark:border-[#33302A] rounded-2xl shadow-xl select-none"
      >
        <div className="flex items-center justify-between pb-1.5 border-b border-stone-200/60 dark:border-stone-800/60 mb-1.5 text-stone-500">
          <div className="flex items-center gap-1 text-[10px] font-mono font-semibold tracking-wider uppercase text-stone-600 dark:text-stone-300">
            <Navigation size={11} className="text-amber-600 dark:text-amber-400" />
            <span>Radar ({cards.length} cards)</span>
          </div>
          <button
            onClick={toggleMinimap}
            className="p-0.5 hover:bg-stone-200/60 dark:hover:bg-stone-800 rounded transition-colors text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
            title="Close Radar"
          >
            <X size={12} />
          </button>
        </div>

        {/* Radar Mini Canvas */}
        <div
          onClick={handleMinimapClick}
          style={{ width: `${mapWidth}px`, height: `${mapHeight}px` }}
          className="relative bg-stone-200/50 dark:bg-stone-900/60 rounded-xl overflow-hidden cursor-crosshair border border-stone-300/40 dark:border-stone-800"
        >
          {/* Card Thumbnails */}
          {cards.map((card) => {
            const x = (card.x - minX) * scale;
            const y = (card.y - minY) * scale;
            const w = Math.max(card.width * scale, 4);
            const h = Math.max(card.height * scale, 4);

            return (
              <div
                key={card.id}
                style={{
                  left: `${x}px`,
                  top: `${y}px`,
                  width: `${w}px`,
                  height: `${h}px`,
                }}
                className={`absolute rounded-xs border border-stone-400/30 ${
                  card.type === 'note'
                    ? 'bg-amber-400/60'
                    : card.type === 'todo'
                    ? 'bg-emerald-400/60'
                    : card.type === 'event'
                    ? 'bg-purple-400/60'
                    : card.type === 'code'
                    ? 'bg-stone-700/60'
                    : 'bg-stone-400/50'
                }`}
              />
            );
          })}

          {/* Current Camera Viewport indicator */}
          <div
            style={{
              left: `${viewMiniX}px`,
              top: `${viewMiniY}px`,
              width: `${Math.max(viewMiniW, 10)}px`,
              height: `${Math.max(viewMiniH, 10)}px`,
            }}
            className="absolute border-2 border-amber-600/90 dark:border-amber-400 bg-amber-500/15 rounded-sm pointer-events-none transition-all duration-75"
          />
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
