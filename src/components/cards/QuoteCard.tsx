'use client';

import React from 'react';
import { QuoteCardData } from '@/types/board';
import { Quote as QuoteIcon } from 'lucide-react';

interface QuoteCardProps {
  cardId: string;
  data: QuoteCardData;
  onChange: (data: Partial<QuoteCardData>) => void;
}

export const QuoteCard: React.FC<QuoteCardProps> = ({ data, onChange }) => {
  return (
    <div className="flex flex-col h-full justify-between space-y-2 p-1">
      <div className="flex items-start gap-2">
        <QuoteIcon size={24} className="text-amber-600/40 dark:text-amber-400/40 shrink-0 mt-0.5" />
        <textarea
          value={data.quote}
          onChange={(e) => onChange({ quote: e.target.value })}
          placeholder="Enter a memorable quote, design principle, or testimonial..."
          rows={3}
          className="w-full bg-transparent resize-none border-none outline-none font-serif text-sm leading-relaxed text-stone-800 dark:text-stone-100 placeholder:text-stone-400 italic"
        />
      </div>

      <div className="flex items-center justify-end gap-2 pt-1 border-t border-stone-200/50 dark:border-stone-800/50 text-right">
        <span className="text-stone-400 text-xs font-serif">—</span>
        <div className="space-y-0.5">
          <input
            type="text"
            value={data.author}
            onChange={(e) => onChange({ author: e.target.value })}
            placeholder="Author / Speaker..."
            className="text-right text-xs font-semibold bg-transparent border-none outline-none text-stone-700 dark:text-stone-200"
          />
          <input
            type="text"
            value={data.citation || ''}
            onChange={(e) => onChange({ citation: e.target.value })}
            placeholder="Role, Book, or Source..."
            className="text-right text-[11px] font-mono bg-transparent border-none outline-none text-stone-400 dark:text-stone-500 block w-full"
          />
        </div>
      </div>
    </div>
  );
};
