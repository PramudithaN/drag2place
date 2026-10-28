'use client';

import React, { useRef, useEffect, useMemo } from 'react';
import { useBoardStore } from '@/lib/store';
import { CardType } from '@/types/board';
import {
  Search,
  X,
  StickyNote,
  CheckSquare,
  Calendar,
  Link2,
  Image as ImageIcon,
  Code2,
  Palette,
  TrendingUp,
  Music,
  Table,
  Timer,
  Quote,
} from 'lucide-react';

interface FilterOption {
  type: CardType | 'all';
  label: string;
  icon?: React.ReactNode;
}

const FILTER_OPTIONS: FilterOption[] = [
  { type: 'all', label: 'All' },
  { type: 'note', label: 'Notes', icon: <StickyNote size={12} className="text-amber-700 dark:text-amber-400" /> },
  { type: 'todo', label: 'Tasks', icon: <CheckSquare size={12} className="text-emerald-700 dark:text-emerald-400" /> },
  { type: 'code', label: 'Code', icon: <Code2 size={12} className="text-stone-700 dark:text-stone-300" /> },
  { type: 'table', label: 'Tables', icon: <Table size={12} className="text-sky-700 dark:text-sky-400" /> },
  { type: 'audio', label: 'Audio', icon: <Music size={12} className="text-amber-700 dark:text-amber-400" /> },
  { type: 'image', label: 'Media', icon: <ImageIcon size={12} className="text-sky-700 dark:text-sky-400" /> },
  { type: 'palette', label: 'Palettes', icon: <Palette size={12} className="text-rose-700 dark:text-rose-400" /> },
  { type: 'metric', label: 'Metrics', icon: <TrendingUp size={12} className="text-blue-700 dark:text-blue-400" /> },
  { type: 'countdown', label: 'Timers', icon: <Timer size={12} className="text-rose-700 dark:text-rose-400" /> },
  { type: 'quote', label: 'Quotes', icon: <Quote size={12} className="text-amber-700 dark:text-amber-400" /> },
  { type: 'event', label: 'Events', icon: <Calendar size={12} className="text-purple-700 dark:text-purple-400" /> },
  { type: 'link', label: 'Embeds', icon: <Link2 size={12} className="text-indigo-700 dark:text-indigo-400" /> },
];

export const SpotlightFilterBar: React.FC = () => {
  const {
    activeFilterType,
    setFilterType,
    searchQuery,
    setSearchQuery,
    showFilterBar,
    toggleFilterBar,
    allCards,
    activeBoardId,
  } = useBoardStore();

  const inputRef = useRef<HTMLInputElement>(null);

  // Card counts per type
  const counts = useMemo(() => {
    const cards = (allCards || []).filter((c) => c.boardId === activeBoardId);
    const map: Record<string, number> = { all: cards.length };
    cards.forEach((c) => {
      map[c.type] = (map[c.type] || 0) + 1;
    });
    return map;
  }, [allCards, activeBoardId]);

  const hasActiveFilter = activeFilterType !== 'all' || searchQuery.trim().length > 0;

  // Global Ctrl+F / Cmd+F shortcut to focus search & open bar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        if (!showFilterBar) {
          toggleFilterBar();
        }
        setTimeout(() => inputRef.current?.focus(), 50);
      }
      if (e.key === 'Escape' && hasActiveFilter) {
        setSearchQuery('');
        setFilterType('all');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasActiveFilter, showFilterBar, toggleFilterBar, setSearchQuery, setFilterType]);

  // Hide completely when user closed it and no filter is actively running
  if (!showFilterBar && !hasActiveFilter) {
    return null;
  }

  return (
    <div
      data-controls="true"
      className="fixed top-[4.5rem] sm:top-20 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 p-1 bg-[#FAF8F5]/95 dark:bg-[#1C1A17]/95 backdrop-blur-md border border-[#E7E0D4] dark:border-[#33302A] rounded-2xl shadow-xl shadow-stone-900/10 dark:shadow-black/30 text-stone-700 dark:text-stone-300 select-none max-w-[95vw] overflow-x-auto scrollbar-none transition-all"
    >
      {/* Search Bar */}
      <div className="flex items-center gap-1.5 px-2 py-1 bg-white/70 dark:bg-stone-900/60 rounded-xl border border-stone-200/80 dark:border-stone-800 shrink-0">
        <Search size={13} className="text-stone-400 shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter cards or #tags..."
          className="w-28 sm:w-36 text-xs bg-transparent border-none outline-none text-stone-800 dark:text-stone-100 placeholder:text-stone-400 font-sans"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="p-0.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors"
            title="Clear search"
          >
            <X size={12} />
          </button>
        )}
      </div>

      <div className="w-px h-4 bg-stone-200 dark:bg-stone-800 mx-0.5 shrink-0" />

      {/* Filter Type Pills */}
      <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-0.5">
        {FILTER_OPTIONS.map((opt) => {
          const count = counts[opt.type] || 0;
          if (opt.type !== 'all' && count === 0) return null; // hide types not present on canvas

          const isSelected = activeFilterType === opt.type;

          return (
            <button
              key={opt.type}
              type="button"
              onClick={() => setFilterType(isSelected && opt.type !== 'all' ? 'all' : opt.type)}
              title={
                opt.type === 'all'
                  ? 'Show all cards'
                  : `Filter canvas to show only ${opt.label} (${count} cards)`
              }
              className={`flex items-center gap-1.5 px-2 py-1 rounded-xl text-xs font-medium transition-all shrink-0 cursor-pointer ${
                isSelected
                  ? 'bg-amber-600 dark:bg-amber-500 text-white shadow-xs font-semibold'
                  : 'hover:bg-stone-200/60 dark:hover:bg-stone-800/60 text-stone-600 dark:text-stone-300'
              }`}
            >
              {opt.icon}
              <span>{opt.label}</span>
              <span
                className={`text-[10px] px-1 py-0.2 rounded-full font-mono ${
                  isSelected
                    ? 'bg-white/20 text-white'
                    : 'bg-stone-200/70 dark:bg-stone-800 text-stone-500 dark:text-stone-400'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Clear All Filters Button */}
      {hasActiveFilter && (
        <button
          type="button"
          onClick={() => {
            setFilterType('all');
            setSearchQuery('');
          }}
          className="flex items-center gap-1 px-2 py-1 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors shrink-0 ml-1 font-medium"
          title="Reset filter & search (Esc)"
        >
          <X size={12} />
          <span>Reset</span>
        </button>
      )}

      {/* Dismiss Bar Button */}
      <button
        type="button"
        onClick={toggleFilterBar}
        className="p-1.5 hover:bg-stone-200/60 dark:hover:bg-stone-800 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-lg transition-colors ml-0.5 shrink-0"
        title="Hide filter bar (Ctrl + F)"
        aria-label="Hide filter bar"
      >
        <X size={13} />
      </button>
    </div>
  );
};
