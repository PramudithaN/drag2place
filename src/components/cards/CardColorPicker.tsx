'use client';

import React, { useState, useRef } from 'react';
import { CardColor } from '@/types/board';
import { COLOR_CLASSES, COLOR_PALETTE } from '@/lib/colors';
import { useClickOutside } from '@/lib/useClickOutside';
import { Palette } from 'lucide-react';

interface CardColorPickerProps {
  currentColor: CardColor;
  onSelectColor: (color: CardColor) => void;
}

export const CardColorPicker: React.FC<CardColorPickerProps> = ({
  currentColor,
  onSelectColor,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useClickOutside(menuRef, () => setIsOpen(false), isOpen);

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="p-1 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-500/10 rounded-md transition-colors cursor-pointer"
        title="Change card color"
        aria-label="Change card color"
      >
        <Palette size={13} />
      </button>

      {isOpen && (
        <div
          className="absolute right-0 top-full mt-1 z-50 flex gap-1 p-1.5 bg-[#FAF7F2] dark:bg-[#25221E] border border-stone-300 dark:border-stone-700 rounded-xl shadow-lg"
          onClick={(e) => e.stopPropagation()}
        >
          {COLOR_PALETTE.map((col) => (
            <button
              type="button"
              key={col}
              onClick={() => {
                onSelectColor(col);
                setIsOpen(false);
              }}
              className={`w-4 h-4 rounded-full border border-stone-300 dark:border-stone-600 transition-transform hover:scale-125 cursor-pointer ${
                COLOR_CLASSES[col].bg
              } ${currentColor === col ? 'ring-2 ring-stone-700 dark:ring-stone-200' : ''}`}
              title={col}
              aria-label={`Set color to ${col}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
