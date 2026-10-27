'use client';

import React, { useState, useRef } from 'react';
import { Card, CardColor, CardContent, NoteCardData, TodoCardData, EventCardData, ImageCardData } from '@/types/board';
import { useBoardStore } from '@/lib/store';
import { TodoCard } from './TodoCard';
import { NoteCard } from './NoteCard';
import { EventCard } from './EventCard';
import { ImageCard } from './ImageCard';
import { GripVertical, Trash2, GitCommit, Palette } from 'lucide-react';

interface CardWrapperProps {
  card: Card;
  zoom: number;
}

const COLOR_CLASSES: Record<CardColor, { bg: string; border: string; accent: string }> = {
  paper: { bg: 'bg-[#FFFFFF]', border: 'border-[#EBE6DE]', accent: 'text-stone-700' },
  cream: { bg: 'bg-[#FBF8F2]', border: 'border-[#EAE3D5]', accent: 'text-stone-800' },
  sage: { bg: 'bg-[#F2F6F1]', border: 'border-[#DEE7DD]', accent: 'text-emerald-900' },
  terracotta: { bg: 'bg-[#FDF3F0]', border: 'border-[#EFE1DC]', accent: 'text-orange-950' },
  amber: { bg: 'bg-[#FDF6E9]', border: 'border-[#EFE5D0]', accent: 'text-amber-950' },
  lavender: { bg: 'bg-[#F6F3FA]', border: 'border-[#E7E0F1]', accent: 'text-purple-950' },
  sky: { bg: 'bg-[#F1F6FA]', border: 'border-[#D9E6EF]', accent: 'text-sky-950' },
};

const COLOR_PALETTE: CardColor[] = ['paper', 'cream', 'sage', 'terracotta', 'amber', 'lavender', 'sky'];

export const CardWrapper: React.FC<CardWrapperProps> = ({ card, zoom }) => {
  const {
    updateCardPosition,
    updateCardSize,
    updateCardContent,
    updateCardColor,
    bringToFront,
    deleteCard,
    selectedCardIds,
    selectCard,
    startConnecting,
    finishConnecting,
    activeTool,
    connectingFromCardId,
  } = useBoardStore();

  const [isColorMenuOpen, setIsColorMenuOpen] = useState(false);
  const isSelected = selectedCardIds.includes(card.id);
  const isConnectingTarget = activeTool === 'connect' && connectingFromCardId !== null && connectingFromCardId !== card.id;
  const isConnectingOrigin = connectingFromCardId === card.id;

  const cardRef = useRef<HTMLDivElement>(null);

  // Dragging logic
  const handleDragStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    bringToFront(card.id);
    selectCard(card.id, e.shiftKey);

    const startMouseX = e.clientX;
    const startMouseY = e.clientY;
    const startCardX = card.x;
    const startCardY = card.y;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = (moveEvent.clientX - startMouseX) / zoom;
      const deltaY = (moveEvent.clientY - startMouseY) / zoom;
      updateCardPosition(card.id, startCardX + deltaX, startCardY + deltaY);
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      useBoardStore.getState().saveBoardLocally();
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // Resizing logic
  const handleResizeStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    bringToFront(card.id);

    const startMouseX = e.clientX;
    const startMouseY = e.clientY;
    const startWidth = card.width;
    const startHeight = card.height;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaW = (moveEvent.clientX - startMouseX) / zoom;
      const deltaH = (moveEvent.clientY - startMouseY) / zoom;
      updateCardSize(card.id, startWidth + deltaW, startHeight + deltaH);
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      useBoardStore.getState().saveBoardLocally();
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const colorStyle = COLOR_CLASSES[card.color] || COLOR_CLASSES.paper;

  // Title extraction & update helper
  const getCardTitle = () => {
    if ('title' in card.content) {
      return (card.content as NoteCardData | TodoCardData | EventCardData).title;
    }
    return (card.content as ImageCardData).caption || 'Media';
  };

  const handleTitleChange = (newTitle: string) => {
    if (card.type === 'image') {
      updateCardContent(card.id, { caption: newTitle });
    } else {
      updateCardContent(card.id, { title: newTitle });
    }
  };

  return (
    <div
      ref={cardRef}
      onClick={(e) => {
        e.stopPropagation();
        if (isConnectingTarget) {
          finishConnecting(card.id);
        } else {
          bringToFront(card.id);
          selectCard(card.id, e.shiftKey);
        }
      }}
      style={{
        transform: `translate(${card.x}px, ${card.y}px)`,
        width: `${card.width}px`,
        height: `${card.height}px`,
        zIndex: card.zIndex,
      }}
      className={`absolute select-none flex flex-col rounded-2xl border shadow-sm transition-[box-shadow,border-color] duration-150 ${
        colorStyle.bg
      } ${colorStyle.border} ${
        isSelected
          ? 'ring-2 ring-stone-700/60 shadow-lg'
          : 'hover:shadow-md hover:border-stone-400/50'
      } ${
        isConnectingTarget ? 'ring-2 ring-amber-500 ring-offset-2 animate-pulse cursor-crosshair' : ''
      } ${
        isConnectingOrigin ? 'ring-2 ring-stone-900 ring-offset-2' : ''
      }`}
    >
      {/* Card Header & Toolbar */}
      <div
        onMouseDown={handleDragStart}
        className="flex items-center justify-between px-3 py-2.5 cursor-grab active:cursor-grabbing border-b border-stone-200/50 rounded-t-2xl"
      >
        <div className="flex items-center gap-1.5 flex-1 mr-2">
          <GripVertical size={14} className="text-stone-400 shrink-0" />
          <input
            type="text"
            value={getCardTitle()}
            onChange={(e) => handleTitleChange(e.target.value)}
            onMouseDown={(e) => e.stopPropagation()}
            style={{ fontFamily: 'var(--font-oregon), "Oregon LDO", Georgia, serif' }} className="w-full text-sm font-bold tracking-wide bg-transparent text-stone-800 outline-none truncate"
            placeholder="Card title..."
          />
        </div>

        {/* Card actions */}
        <div className="flex items-center gap-0.5 shrink-0" onMouseDown={(e) => e.stopPropagation()}>
          {/* Milanote connect button */}
          <button
            onClick={() => startConnecting(card.id)}
            className={`p-1 rounded-md transition-colors ${
              isConnectingOrigin
                ? 'bg-stone-800 text-stone-100'
                : 'text-stone-400 hover:text-stone-700 hover:bg-stone-500/10'
            }`}
            title="Connect arrow to another card"
          >
            <GitCommit size={13} />
          </button>

          {/* Color palette toggle */}
          <div className="relative">
            <button
              onClick={() => setIsColorMenuOpen(!isColorMenuOpen)}
              className="p-1 text-stone-400 hover:text-stone-700 hover:bg-stone-500/10 rounded-md transition-colors"
              title="Change card color"
            >
              <Palette size={13} />
            </button>

            {isColorMenuOpen && (
              <div
                className="absolute right-0 top-full mt-1 z-50 flex gap-1 p-1.5 bg-[#FAF7F2] border border-stone-300 rounded-xl shadow-lg"
                onClick={(e) => e.stopPropagation()}
              >
                {COLOR_PALETTE.map((col) => (
                  <button
                    key={col}
                    onClick={() => {
                      updateCardColor(card.id, col);
                      setIsColorMenuOpen(false);
                    }}
                    className={`w-4 h-4 rounded-full border border-stone-300 transition-transform hover:scale-125 ${
                      COLOR_CLASSES[col].bg
                    } ${card.color === col ? 'ring-2 ring-stone-700' : ''}`}
                    title={col}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Delete card */}
          <button
            onClick={() => deleteCard(card.id)}
            className="p-1 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
            title="Delete card"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Card Content Body */}
      <div className="flex-1 p-3.5 overflow-hidden">
        {card.type === 'todo' && (
          <TodoCard
            cardId={card.id}
            data={card.content as TodoCardData}
            onChange={(newData) => updateCardContent(card.id, newData)}
          />
        )}
        {card.type === 'note' && (
          <NoteCard
            cardId={card.id}
            data={card.content as NoteCardData}
            onChange={(newData) => updateCardContent(card.id, newData)}
          />
        )}
        {card.type === 'event' && (
          <EventCard
            cardId={card.id}
            data={card.content as EventCardData}
            onChange={(newData) => updateCardContent(card.id, newData)}
          />
        )}
        {card.type === 'image' && (
          <ImageCard
            cardId={card.id}
            data={card.content as ImageCardData}
            onChange={(newData) => updateCardContent(card.id, newData)}
          />
        )}
      </div>

      {/* Resizing handle on bottom right corner */}
      <div
        onMouseDown={handleResizeStart}
        className="absolute bottom-1 right-1 w-3.5 h-3.5 cursor-nwse-resize opacity-20 hover:opacity-100 transition-opacity flex items-center justify-center"
        title="Resize"
      >
        <div className="w-1.5 h-1.5 bg-stone-500 rounded-xs" />
      </div>
    </div>
  );
};
