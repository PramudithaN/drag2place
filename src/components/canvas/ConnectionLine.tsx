'use client';

import React, { useState } from 'react';
import { Card, Connection } from '@/types/board';
import { X } from 'lucide-react';

interface ConnectionLineProps {
  connection: Connection;
  fromCard: Card;
  toCard: Card;
  zoom: number;
  onDelete: (id: string) => void;
}

export const ConnectionLine: React.FC<ConnectionLineProps> = ({
  connection,
  fromCard,
  toCard,
  onDelete,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // Calculate center coordinates
  const fromCenterX = fromCard.x + fromCard.width / 2;
  const fromCenterY = fromCard.y + fromCard.height / 2;
  const toCenterX = toCard.x + toCard.width / 2;
  const toCenterY = toCard.y + toCard.height / 2;

  // Determine which edges to connect based on relative position
  const dx = toCenterX - fromCenterX;
  const dy = toCenterY - fromCenterY;

  let startX = fromCenterX;
  let startY = fromCenterY;
  let endX = toCenterX;
  let endY = toCenterY;

  if (Math.abs(dx) > Math.abs(dy)) {
    // Connect left/right edges
    if (dx > 0) {
      startX = fromCard.x + fromCard.width;
      endX = toCard.x;
    } else {
      startX = fromCard.x;
      endX = toCard.x + toCard.width;
    }
  } else {
    // Connect top/bottom edges
    if (dy > 0) {
      startY = fromCard.y + fromCard.height;
      endY = toCard.y;
    } else {
      startY = fromCard.y;
      endY = toCard.y + toCard.height;
    }
  }

  // Smooth cubic bezier control points
  const curvature = 0.45;
  const distance = Math.hypot(endX - startX, endY - startY);
  const cpOffset = Math.max(distance * curvature, 40);

  let cp1X = startX;
  let cp1Y = startY;
  let cp2X = endX;
  let cp2Y = endY;

  if (Math.abs(dx) > Math.abs(dy)) {
    cp1X = startX + (dx > 0 ? cpOffset : -cpOffset);
    cp2X = endX + (dx > 0 ? -cpOffset : cpOffset);
  } else {
    cp1Y = startY + (dy > 0 ? cpOffset : -cpOffset);
    cp2Y = endY + (dy > 0 ? -cpOffset : cpOffset);
  }

  const pathData = `M ${startX} ${startY} C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${endX} ${endY}`;

  // Midpoint for label and delete icon
  const midX = (startX + endX) / 2;
  const midY = (startY + endY) / 2;

  return (
    <g
      className="group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Invisible thicker stroke for easier hover & click */}
      <path
        d={pathData}
        fill="none"
        stroke="transparent"
        strokeWidth={24}
        className="pointer-events-stroke"
      />

      {/* Visible aesthetic connection path */}
      <path
        d={pathData}
        fill="none"
        stroke={isHovered ? '#8C7E72' : '#B8AFA6'}
        strokeWidth={isHovered ? 2.5 : 2}
        strokeDasharray={connection.style === 'dashed' ? '6,5' : undefined}
        markerEnd="url(#arrowhead)"
        className="transition-all duration-200"
      />

      {/* Connection label or delete button */}
      <foreignObject
        x={midX - 35}
        y={midY - 14}
        width={70}
        height={28}
        className="overflow-visible pointer-events-auto"
      >
        <div className="flex items-center justify-center h-full">
          {isHovered ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(connection.id);
              }}
              className="flex items-center justify-center w-6 h-6 rounded-full bg-[#EAE4DC] hover:bg-rose-100 text-stone-600 hover:text-rose-600 shadow-sm border border-stone-300 transition-all transform hover:scale-110"
              title="Remove connection"
            >
              <X size={12} />
            </button>
          ) : connection.label ? (
            <span className="px-2 py-0.5 text-[11px] font-sans font-medium text-stone-600 bg-[#F4EFEA] border border-[#E0D8CE] rounded-full shadow-xs backdrop-blur-xs select-none">
              {connection.label}
            </span>
          ) : null}
        </div>
      </foreignObject>
    </g>
  );
};
