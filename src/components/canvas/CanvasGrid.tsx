'use client';

import React from 'react';
import { useBoardStore } from '@/lib/store';

interface CanvasGridProps {
  pan: { x: number; y: number };
  zoom: number;
}

export const CanvasGrid: React.FC<CanvasGridProps> = ({ pan, zoom }) => {
  const { theme } = useBoardStore();
  const gridSize = 24 * zoom;
  const offsetX = (pan.x * zoom) % gridSize;
  const offsetY = (pan.y * zoom) % gridSize;

  const dotColor = theme === 'dark' ? '#33302A' : '#D8D2C5';

  return (
    <div
      className="absolute inset-0 pointer-events-none transition-opacity duration-300"
      style={{
        backgroundImage: `radial-gradient(circle, ${dotColor} 1.2px, transparent 1.2px)`,
        backgroundSize: `${gridSize}px ${gridSize}px`,
        backgroundPosition: `${offsetX}px ${offsetY}px`,
        opacity: Math.min(Math.max((zoom - 0.2) * 1.2, 0.2), 0.8),
      }}
    />
  );
};
