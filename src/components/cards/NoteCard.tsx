'use client';

import React from 'react';
import { NoteCardData } from '@/types/board';

interface NoteCardProps {
  cardId: string;
  data: NoteCardData;
  onChange: (data: Partial<NoteCardData>) => void;
}

export const NoteCard: React.FC<NoteCardProps> = ({ data, onChange }) => {
  const fontFamilyClass =
    data.fontFamily === 'serif'
      ? 'font-serif'
      : data.fontFamily === 'mono'
      ? 'font-mono'
      : 'font-sans';

  const fontSizeClass =
    data.fontSize === 'sm'
      ? 'text-xs leading-relaxed'
      : data.fontSize === 'lg'
      ? 'text-base leading-relaxed'
      : 'text-sm leading-relaxed';

  return (
    <div className="flex flex-col h-full space-y-2">
      {/* Mini typography options */}
      <div className="flex items-center justify-between pb-1.5 border-b border-stone-200/50">
        <div className="flex items-center gap-1">
          <button
            onClick={() => onChange({ fontFamily: 'serif' })}
            className={`px-1.5 py-0.5 text-[10px] font-serif rounded transition-colors ${
              data.fontFamily === 'serif'
                ? 'bg-stone-800 text-stone-100 font-medium'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            Serif
          </button>
          <button
            onClick={() => onChange({ fontFamily: 'sans' })}
            className={`px-1.5 py-0.5 text-[10px] font-sans rounded transition-colors ${
              data.fontFamily === 'sans'
                ? 'bg-stone-800 text-stone-100 font-medium'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            Sans
          </button>
          <button
            onClick={() => onChange({ fontFamily: 'mono' })}
            className={`px-1.5 py-0.5 text-[10px] font-mono rounded transition-colors ${
              data.fontFamily === 'mono'
                ? 'bg-stone-800 text-stone-100 font-medium'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            Mono
          </button>
        </div>

        <div className="flex items-center gap-1 text-[10px] text-stone-400 font-mono">
          <button
            onClick={() => onChange({ fontSize: 'sm' })}
            className={`px-1 rounded ${data.fontSize === 'sm' ? 'text-stone-900 font-bold' : ''}`}
          >
            S
          </button>
          <button
            onClick={() => onChange({ fontSize: 'base' })}
            className={`px-1 rounded ${data.fontSize === 'base' ? 'text-stone-900 font-bold' : ''}`}
          >
            M
          </button>
          <button
            onClick={() => onChange({ fontSize: 'lg' })}
            className={`px-1 rounded ${data.fontSize === 'lg' ? 'text-stone-900 font-bold' : ''}`}
          >
            L
          </button>
        </div>
      </div>

      {/* Note body textarea */}
      <textarea
        value={data.body || ''}
        onChange={(e) => onChange({ body: e.target.value })}
        placeholder="Type note, ideas, journal, or thoughts..."
        className={`flex-1 w-full bg-transparent resize-none outline-none text-stone-800 placeholder-stone-400 ${fontFamilyClass} ${fontSizeClass} scrollbar-thin`}
      />
    </div>
  );
};
