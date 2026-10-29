'use client';

import React from 'react';
import { useBoardStore } from '@/lib/store';
import { WORKSPACE_MODE_CONFIGS } from '@/lib/modes';

interface CanvasGridProps {
  pan: { x: number; y: number };
  zoom: number;
}

export const CanvasGrid: React.FC<CanvasGridProps> = ({ pan, zoom }) => {
  const { theme, currentBoard } = useBoardStore();
  const mode = currentBoard?.mode || 'developer';
  const modeConfig = WORKSPACE_MODE_CONFIGS[mode] || WORKSPACE_MODE_CONFIGS.developer;

  const gridSize = 24 * zoom;
  const offsetX = (pan.x * zoom) % gridSize;
  const offsetY = (pan.y * zoom) % gridSize;

  // Architectural drafting blueprint grid
  if (mode === 'architect') {
    const lineColor = theme === 'dark' ? 'rgba(38, 166, 154, 0.16)' : 'rgba(14, 116, 144, 0.18)';
    const majorLineColor = theme === 'dark' ? 'rgba(38, 166, 154, 0.32)' : 'rgba(14, 116, 144, 0.35)';
    const majorGrid = gridSize * 5;
    const majorOffsetX = (pan.x * zoom) % majorGrid;
    const majorOffsetY = (pan.y * zoom) % majorGrid;

    return (
      <div className="absolute inset-0 pointer-events-none transition-opacity duration-300">
        {/* Minor blueprint gridlines */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(to right, ${lineColor} 1px, transparent 1px), linear-gradient(to bottom, ${lineColor} 1px, transparent 1px)`,
            backgroundSize: `${gridSize}px ${gridSize}px`,
            backgroundPosition: `${offsetX}px ${offsetY}px`,
            opacity: Math.min(Math.max((zoom - 0.2) * 1.2, 0.25), 0.85),
          }}
        />
        {/* Major blueprint gridlines */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(to right, ${majorLineColor} 1.5px, transparent 1.5px), linear-gradient(to bottom, ${majorLineColor} 1.5px, transparent 1.5px)`,
            backgroundSize: `${majorGrid}px ${majorGrid}px`,
            backgroundPosition: `${majorOffsetX}px ${majorOffsetY}px`,
            opacity: Math.min(Math.max((zoom - 0.2) * 1.2, 0.35), 0.9),
          }}
        />
      </div>
    );
  }

  // Curated dot matrix for all other modes
  const dotColor = theme === 'dark' ? modeConfig.dotColorDark : modeConfig.dotColorLight;

  return (
    <div
      className="absolute inset-0 pointer-events-none transition-opacity duration-300"
      style={{
        backgroundImage: `radial-gradient(circle, ${dotColor} 1.25px, transparent 1.25px)`,
        backgroundSize: `${gridSize}px ${gridSize}px`,
        backgroundPosition: `${offsetX}px ${offsetY}px`,
        opacity: Math.min(Math.max((zoom - 0.2) * 1.2, 0.2), 0.85),
      }}
    />
  );
};
