'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useBoardStore } from '@/lib/store';
import { Search, StickyNote, CheckSquare, Calendar, Image as ImageIcon, Sun, Moon, ArrowRight, X, Compass } from 'lucide-react';
import { CardContent, NoteCardData, TodoCardData, EventCardData, ImageCardData } from '@/types/board';
import { ModeSelectorModal } from './ModeSelectorModal';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [isModeModalOpen, setIsModeModalOpen] = useState(false);
  const { allCards, boards, jumpToCard, addCard, toggleTheme, theme } = useBoardStore();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const handleClose = () => {
    setQuery('');
    onClose();
  };

  if (!isOpen) return null;

  // Filter cards matching query
  const getCardSearchText = (content: CardContent): string => {
    if ('title' in content) {
      const title = (content as NoteCardData | TodoCardData | EventCardData).title || '';
      const body = 'body' in content ? (content as NoteCardData).body || '' : '';
      const items = 'items' in content ? (content as TodoCardData).items.map((i) => i.text).join(' ') : '';
      const desc = 'description' in content ? (content as EventCardData).description || '' : '';
      return `${title} ${body} ${items} ${desc}`.toLowerCase();
    }
    return ((content as ImageCardData).caption || '').toLowerCase();
  };

  const matchingCards = query.trim()
    ? allCards.filter((card) => getCardSearchText(card.content).includes(query.toLowerCase()))
    : [];

  const handleSelectCard = (cardId: string) => {
    jumpToCard(cardId);
    handleClose();
  };

  const getCardIcon = (type: string) => {
    switch (type) {
      case 'todo':
        return <CheckSquare size={14} className="text-emerald-600 dark:text-emerald-400" />;
      case 'event':
        return <Calendar size={14} className="text-amber-600 dark:text-amber-400" />;
      case 'image':
        return <ImageIcon size={14} className="text-blue-600 dark:text-blue-400" />;
      default:
        return <StickyNote size={14} className="text-orange-600 dark:text-orange-400" />;
    }
  };

  const getCardTitle = (card: typeof allCards[0]) => {
    if ('title' in card.content) {
      return (card.content as NoteCardData | TodoCardData | EventCardData).title || 'Untitled Card';
    }
    return (card.content as ImageCardData).caption || 'Media item';
  };

  const getBoardTitle = (boardId: string) => {
    return boards.find((b) => b.id === boardId)?.title || 'Board';
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-12 sm:pt-24 bg-stone-900/40 dark:bg-black/60 backdrop-blur-xs p-3 sm:p-4"
      onClick={handleClose}
      onWheel={(e) => e.stopPropagation()}
    >
      <div
        className="relative w-full max-w-lg max-h-[85vh] bg-[#FAF8F5] dark:bg-[#1C1A17] border border-[#E6E0D4] dark:border-[#33302A] rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
        onWheel={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-stone-200 dark:border-stone-800">
          <Search size={18} className="text-stone-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search cards, tasks, notes, or run actions..."
            className="flex-1 bg-transparent text-sm text-stone-800 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 outline-none"
          />
          <button
            onClick={handleClose}
            className="p-1 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-lg"
          >
            <X size={16} />
          </button>
        </div>

        {/* Results / Commands */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1 scrollbar-thin">
          {query.trim() && (
            <>
              <div className="px-3 py-1 text-[10px] font-mono uppercase tracking-wider text-stone-400 dark:text-stone-500">
                Cards ({matchingCards.length})
              </div>
              {matchingCards.length === 0 ? (
                <div className="py-6 text-center text-xs text-stone-400">
                  No cards match &quot;{query}&quot;
                </div>
              ) : (
                matchingCards.map((card) => (
                  <button
                    key={card.id}
                    onClick={() => handleSelectCard(card.id)}
                    className="flex items-center justify-between w-full p-2.5 rounded-xl hover:bg-stone-200/60 dark:hover:bg-stone-800/60 text-left transition-colors group"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      {getCardIcon(card.type)}
                      <span className="text-xs font-medium text-stone-800 dark:text-stone-100 truncate">
                        {getCardTitle(card)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 text-[10px] text-stone-400 font-mono">
                      <span>{getBoardTitle(card.boardId)}</span>
                      <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </button>
                ))
              )}
            </>
          )}

          {/* Quick Actions */}
          <div className="px-3 py-1 pt-2 text-[10px] font-mono uppercase tracking-wider text-stone-400 dark:text-stone-500">
            Quick Actions
          </div>

          <button
            onClick={() => {
              addCard('note');
              handleClose();
            }}
            className="flex items-center gap-2.5 w-full p-2 rounded-xl hover:bg-stone-200/60 dark:hover:bg-stone-800/60 text-xs text-stone-700 dark:text-stone-300 transition-colors"
          >
            <StickyNote size={14} className="text-orange-500" />
            <span>Create New Note / Idea</span>
            <kbd className="ml-auto text-[10px] font-mono text-stone-400 bg-stone-100 dark:bg-stone-800 px-1.5 py-0.5 rounded">N</kbd>
          </button>

          <button
            onClick={() => {
              addCard('todo');
              handleClose();
            }}
            className="flex items-center gap-2.5 w-full p-2 rounded-xl hover:bg-stone-200/60 dark:hover:bg-stone-800/60 text-xs text-stone-700 dark:text-stone-300 transition-colors"
          >
            <CheckSquare size={14} className="text-emerald-500" />
            <span>Create New Checklist</span>
            <kbd className="ml-auto text-[10px] font-mono text-stone-400 bg-stone-100 dark:bg-stone-800 px-1.5 py-0.5 rounded">T</kbd>
          </button>

          <button
            onClick={() => {
              addCard('event');
              handleClose();
            }}
            className="flex items-center gap-2.5 w-full p-2 rounded-xl hover:bg-stone-200/60 dark:hover:bg-stone-800/60 text-xs text-stone-700 dark:text-stone-300 transition-colors"
          >
            <Calendar size={14} className="text-amber-500" />
            <span>Create New Event / Milestone</span>
            <kbd className="ml-auto text-[10px] font-mono text-stone-400 bg-stone-100 dark:bg-stone-800 px-1.5 py-0.5 rounded">E</kbd>
          </button>

          <button
            onClick={() => {
              toggleTheme();
              handleClose();
            }}
            className="flex items-center gap-2.5 w-full p-2 rounded-xl hover:bg-stone-200/60 dark:hover:bg-stone-800/60 text-xs text-stone-700 dark:text-stone-300 transition-colors"
          >
            {theme === 'dark' ? <Sun size={14} className="text-amber-400" /> : <Moon size={14} className="text-stone-600" />}
            <span>Toggle {theme === 'dark' ? 'Light' : 'Dark'} Mode</span>
          </button>

          <button
            onClick={() => {
              handleClose();
              setIsModeModalOpen(true);
            }}
            className="flex items-center gap-2.5 w-full p-2 rounded-xl hover:bg-stone-200/60 dark:hover:bg-stone-800/60 text-xs text-amber-800 dark:text-amber-300 transition-colors"
          >
            <Compass size={14} className="text-amber-600 dark:text-amber-400" />
            <span>Launch Workspace Mode / Headstarter...</span>
          </button>
        </div>

        {/* Footer with logo */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-stone-100/70 dark:bg-stone-900/70 border-t border-stone-200/70 dark:border-stone-800/70 text-[11px] text-stone-400 font-sans">
          <div className="flex items-center gap-1.5 font-oregon font-semibold text-stone-600 dark:text-stone-300">
            <Image
              src="/drag2placeLogo.png"
              alt="Drag2Place Logo"
              width={15}
              height={15}
              className="rounded-sm object-contain"
            />
            Drag2Place
          </div>
          <div className="flex items-center gap-2 text-[10px] font-mono">
            <span>Quick actions & search</span>
            <kbd className="px-1.5 py-0.5 bg-white dark:bg-stone-800 rounded border border-stone-300 dark:border-stone-700">ESC</kbd>
          </div>
        </div>
      </div>

      <ModeSelectorModal isOpen={isModeModalOpen} onClose={() => setIsModeModalOpen(false)} />
    </div>
  );
};
