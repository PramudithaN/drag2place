'use client';

import React, { useState, useRef } from 'react';
import { Card, CardColor, NoteCardData, TodoCardData, EventCardData, ImageCardData, CodeCardData, PaletteCardData, MetricCardData, CommentCardData, LinkCardData } from '@/types/board';
import { useBoardStore } from '@/lib/store';
import { TodoCard } from './TodoCard';
import { NoteCard } from './NoteCard';
import { EventCard } from './EventCard';
import { ImageCard } from './ImageCard';
import { CodeCard } from './CodeCard';
import { PaletteCard } from './PaletteCard';
import { MetricCard } from './MetricCard';
import { CommentCard } from './CommentCard';
import { LinkCard } from './LinkCard';
import { GripVertical, Trash2, GitCommit, Palette } from 'lucide-react';

interface CardWrapperProps {
  card: Card;
  zoom: number;
}

const COLOR_CLASSES: Record<CardColor, { bg: string; border: string; accent: string }> = {
  paper: {
    bg: 'bg-[#FFFFFF] dark:bg-[#1D1B18]',
    border: 'border-[#EBE6DE] dark:border-[#2F2C27]',
    accent: 'text-stone-700 dark:text-stone-300',
  },
  cream: {
    bg: 'bg-[#FBF8F2] dark:bg-[#23201C]',
    border: 'border-[#EAE3D5] dark:border-[#332E27]',
    accent: 'text-stone-800 dark:text-stone-200',
  },
  sage: {
    bg: 'bg-[#F2F6F1] dark:bg-[#1C241D]',
    border: 'border-[#DEE7DD] dark:border-[#29362B]',
    accent: 'text-emerald-900 dark:text-emerald-200',
  },
  terracotta: {
    bg: 'bg-[#FDF3F0] dark:bg-[#281E1C]',
    border: 'border-[#EFE1DC] dark:border-[#3B2925]',
    accent: 'text-orange-950 dark:text-orange-200',
  },
  amber: {
    bg: 'bg-[#FDF6E9] dark:bg-[#28231A]',
    border: 'border-[#EFE5D0] dark:border-[#3C3322]',
    accent: 'text-amber-950 dark:text-amber-200',
  },
  lavender: {
    bg: 'bg-[#F6F3FA] dark:bg-[#241E2B]',
    border: 'border-[#E7E0F1] dark:border-[#382B45]',
    accent: 'text-purple-950 dark:text-purple-200',
  },
  sky: {
    bg: 'bg-[#F1F6FA] dark:bg-[#1B232A]',
    border: 'border-[#D9E6EF] dark:border-[#283745]',
    accent: 'text-sky-950 dark:text-sky-200',
  },
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
    cancelConnecting,
    activeTool,
    connectingFromCardId,
    openConfirmModal,
  } = useBoardStore();

  const [isColorMenuOpen, setIsColorMenuOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const isSelected = selectedCardIds.includes(card.id);
  const isConnectingOrigin = connectingFromCardId === card.id;
  const isConnectingTarget = activeTool === 'connect' && connectingFromCardId !== null && connectingFromCardId !== card.id;
  const isAwaitingOrigin = activeTool === 'connect' && connectingFromCardId === null;

  const cardRef = useRef<HTMLDivElement>(null);

  // Dragging logic
  const handleDragStart = (e: React.MouseEvent) => {
    // If in connect mode, don't drag; let click handler process connection
    if (activeTool === 'connect') return;

    e.stopPropagation();
    bringToFront(card.id);
    selectCard(card.id, e.shiftKey);
    setIsDragging(true);

    const startMouseX = e.clientX;
    const startMouseY = e.clientY;
    const startCardX = card.x;
    const startCardY = card.y;

    document.body.style.cursor = 'grabbing';
    document.body.style.userSelect = 'none';

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = (moveEvent.clientX - startMouseX) / zoom;
      const deltaY = (moveEvent.clientY - startMouseY) / zoom;
      const nextX = startCardX + deltaX;
      const nextY = startCardY + deltaY;

      if (cardRef.current) {
        cardRef.current.style.transform = `translate(${nextX}px, ${nextY}px)`;
      }
      updateCardPosition(card.id, nextX, nextY);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      useBoardStore.getState().saveBoardLocally();
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // Touch dragging logic for mobile / tablet
  const handleTouchDragStart = (e: React.TouchEvent) => {
    if (activeTool === 'connect') return;
    if (e.touches.length !== 1) return;

    e.stopPropagation();
    bringToFront(card.id);
    selectCard(card.id, false);
    setIsDragging(true);

    const touch = e.touches[0];
    const startTouchX = touch.clientX;
    const startTouchY = touch.clientY;
    const startCardX = card.x;
    const startCardY = card.y;

    let latestX = startCardX;
    let latestY = startCardY;

    const handleTouchMove = (moveEvent: TouchEvent) => {
      if (moveEvent.touches.length !== 1) return;
      if (moveEvent.cancelable) {
        moveEvent.preventDefault();
      }
      const curTouch = moveEvent.touches[0];
      const deltaX = (curTouch.clientX - startTouchX) / zoom;
      const deltaY = (curTouch.clientY - startTouchY) / zoom;
      latestX = startCardX + deltaX;
      latestY = startCardY + deltaY;

      if (cardRef.current) {
        cardRef.current.style.transform = `translate(${latestX}px, ${latestY}px)`;
      }
      updateCardPosition(card.id, latestX, latestY);
    };

    const handleTouchEnd = () => {
      setIsDragging(false);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchcancel', handleTouchEnd);
      useBoardStore.getState().saveBoardLocally();
    };

    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);
    window.addEventListener('touchcancel', handleTouchEnd);
  };

  // Touch resizing logic for mobile / tablet
  const handleTouchResizeStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    e.stopPropagation();
    bringToFront(card.id);
    setIsResizing(true);

    const touch = e.touches[0];
    const startTouchX = touch.clientX;
    const startTouchY = touch.clientY;
    const startWidth = card.width;
    const startHeight = card.height;

    let latestW = startWidth;
    let latestH = startHeight;

    const handleTouchMove = (moveEvent: TouchEvent) => {
      if (moveEvent.touches.length !== 1) return;
      if (moveEvent.cancelable) {
        moveEvent.preventDefault();
      }
      const curTouch = moveEvent.touches[0];
      const deltaW = (curTouch.clientX - startTouchX) / zoom;
      const deltaH = (curTouch.clientY - startTouchY) / zoom;

      latestW = Math.max(180, Math.round(startWidth + deltaW));
      latestH = Math.max(120, Math.round(startHeight + deltaH));

      updateCardSize(card.id, latestW, latestH);
    };

    const handleTouchEnd = () => {
      setIsResizing(false);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchcancel', handleTouchEnd);
      useBoardStore.getState().saveBoardLocally();
    };

    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);
    window.addEventListener('touchcancel', handleTouchEnd);
  };

  // Resizing logic
  const handleResizeStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    bringToFront(card.id);
    setIsResizing(true);

    const startMouseX = e.clientX;
    const startMouseY = e.clientY;
    const startWidth = card.width;
    const startHeight = card.height;

    document.body.style.cursor = 'nwse-resize';
    document.body.style.userSelect = 'none';

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaW = (moveEvent.clientX - startMouseX) / zoom;
      const deltaH = (moveEvent.clientY - startMouseY) / zoom;
      updateCardSize(card.id, startWidth + deltaW, startHeight + deltaH);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      useBoardStore.getState().saveBoardLocally();
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const colorStyle = COLOR_CLASSES[card.color] || COLOR_CLASSES.paper;

  const getCardTitle = () => {
    if ('title' in card.content) {
      return (card.content as NoteCardData | TodoCardData | EventCardData).title ?? '';
    }
    return (card.content as ImageCardData).caption || '';
  };

  const handleTitleChange = (newTitle: string) => {
    if (card.type === 'image') {
      updateCardContent(card.id, { caption: newTitle });
    } else {
      updateCardContent(card.id, { title: newTitle });
    }
  };

  const handleDeleteCard = (e: React.MouseEvent) => {
    e.stopPropagation();
    const title = getCardTitle() || (card.type === 'note' ? 'Untitled Note' : 'Untitled Card');
    openConfirmModal({
      title: 'Delete Card?',
      message: `Are you sure you want to permanently delete "${title}"? Any connecting arrows to this card will also be removed.`,
      confirmText: 'Delete Card',
      isDestructive: true,
      icon: 'trash',
      onConfirm: () => deleteCard(card.id),
    });
  };

  return (
    <div
      ref={cardRef}
      data-card="true"
      onClick={(e) => {
        e.stopPropagation();

        // Connect mode logic
        if (activeTool === 'connect') {
          if (connectingFromCardId === null) {
            // First card clicked -> start connection from this card!
            startConnecting(card.id);
          } else if (connectingFromCardId === card.id) {
            // Clicked origin card again -> cancel connection
            cancelConnecting();
          } else {
            // Second card clicked -> finish connection!
            finishConnecting(card.id);
          }
          return;
        }

        bringToFront(card.id);
        selectCard(card.id, e.shiftKey);
      }}
      style={{
        transform: `translate(${card.x}px, ${card.y}px)`,
        width: `${card.width}px`,
        height: `${card.height}px`,
        zIndex: isDragging ? 9999 : card.zIndex,
        willChange: isDragging ? 'transform' : 'auto',
      }}
      className={`absolute select-none flex flex-col rounded-2xl border shadow-sm ${
        isDragging || isResizing
          ? 'transition-none cursor-grabbing shadow-2xl opacity-95 ring-2 ring-stone-800/40 dark:ring-stone-200/40'
          : 'transition-[box-shadow,border-color] duration-150'
      } ${
        colorStyle.bg
      } ${colorStyle.border} ${
        isSelected
          ? 'ring-2 ring-stone-700/60 dark:ring-stone-300/60 shadow-lg'
          : 'hover:shadow-md hover:border-stone-400/50 dark:hover:border-stone-500/50'
      } ${
        isAwaitingOrigin
          ? 'hover:ring-2 hover:ring-amber-500/80 cursor-pointer'
          : ''
      } ${
        isConnectingTarget
          ? 'ring-2 ring-amber-500 ring-offset-2 animate-pulse cursor-pointer'
          : ''
      } ${
        isConnectingOrigin
          ? 'ring-2 ring-stone-900 dark:ring-stone-100 ring-offset-2 scale-[1.02]'
          : ''
      }`}
    >
      {/* Card Header & Toolbar */}
      <div
        onMouseDown={handleDragStart}
        onTouchStart={handleTouchDragStart}
        className="flex items-center justify-between px-3 py-2.5 cursor-grab active:cursor-grabbing border-b border-stone-200/50 dark:border-stone-800/50 rounded-t-2xl touch-none"
      >
        <div className="flex items-center gap-1.5 flex-1 mr-2">
          <GripVertical size={14} className="text-stone-400 shrink-0" />
          <input
            type="text"
            value={getCardTitle()}
            onChange={(e) => handleTitleChange(e.target.value)}
            onMouseDown={(e) => e.stopPropagation()}
            className="w-full text-sm font-oregon font-bold tracking-wide bg-transparent text-stone-800 dark:text-stone-100 outline-none truncate"
            placeholder={
              card.type === 'note'
                ? 'Untitled Note...'
                : card.type === 'todo'
                ? 'Checklist title...'
                : card.type === 'code'
                ? 'Code title...'
                : card.type === 'palette'
                ? 'Palette title...'
                : card.type === 'event'
                ? 'Event title...'
                : 'Card title...'
            }
          />
        </div>

        {/* Card actions */}
        <div className="flex items-center gap-0.5 shrink-0" onMouseDown={(e) => e.stopPropagation()}>
          {/* Connect button */}
          <button
            onClick={() => {
              if (isConnectingOrigin) {
                cancelConnecting();
              } else {
                startConnecting(card.id);
              }
            }}
            className={`p-1 rounded-md transition-colors ${
              isConnectingOrigin
                ? 'bg-amber-600 text-white font-bold ring-2 ring-amber-500 shadow-sm'
                : 'text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-500/10'
            }`}
            title={isConnectingOrigin ? 'Cancel connecting' : 'Connect arrow to another card'}
          >
            <GitCommit size={14} />
          </button>

          {/* Color palette toggle */}
          <div className="relative">
            <button
              onClick={() => setIsColorMenuOpen(!isColorMenuOpen)}
              className="p-1 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-500/10 rounded-md transition-colors"
              title="Change card color"
            >
              <Palette size={13} />
            </button>

            {isColorMenuOpen && (
              <div
                className="absolute right-0 top-full mt-1 z-50 flex gap-1 p-1.5 bg-[#FAF7F2] dark:bg-[#25221E] border border-stone-300 dark:border-stone-700 rounded-xl shadow-lg"
                onClick={(e) => e.stopPropagation()}
              >
                {COLOR_PALETTE.map((col) => (
                  <button
                    key={col}
                    onClick={() => {
                      updateCardColor(card.id, col);
                      setIsColorMenuOpen(false);
                    }}
                    className={`w-4 h-4 rounded-full border border-stone-300 dark:border-stone-600 transition-transform hover:scale-125 ${
                      COLOR_CLASSES[col].bg
                    } ${card.color === col ? 'ring-2 ring-stone-700 dark:ring-stone-200' : ''}`}
                    title={col}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Delete card */}
          <button
            onClick={handleDeleteCard}
            className="p-1 text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-md transition-colors"
            title="Delete card (Del or Backspace)"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Card Content Body */}
      <div
        className="flex-1 p-3.5 overflow-hidden"
        data-scrollable="true"
        onWheel={(e) => {
          if (!e.ctrlKey && !e.metaKey) {
            e.stopPropagation();
          }
        }}
      >
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
        {card.type === 'code' && (
          <CodeCard
            cardId={card.id}
            data={card.content as CodeCardData}
            onChange={(newData) => updateCardContent(card.id, newData)}
          />
        )}
        {card.type === 'palette' && (
          <PaletteCard
            cardId={card.id}
            data={card.content as PaletteCardData}
            onChange={(newData) => updateCardContent(card.id, newData)}
          />
        )}
        {card.type === 'metric' && (
          <MetricCard
            cardId={card.id}
            data={card.content as MetricCardData}
            onChange={(newData) => updateCardContent(card.id, newData)}
          />
        )}
        {card.type === 'comment' && (
          <CommentCard
            cardId={card.id}
            data={card.content as CommentCardData}
            onChange={(newData) => updateCardContent(card.id, newData)}
          />
        )}
        {card.type === 'link' && (
          <LinkCard
            cardId={card.id}
            data={card.content as LinkCardData}
            onChange={(newData) => updateCardContent(card.id, newData)}
          />
        )}
      </div>

      {/* Resizing handle on bottom right corner (enlarged hit target for mobile fingers) */}
      <div
        onMouseDown={handleResizeStart}
        onTouchStart={handleTouchResizeStart}
        className="absolute -bottom-1 -right-1 w-6 h-6 sm:w-4 sm:h-4 cursor-nwse-resize opacity-40 hover:opacity-100 transition-opacity flex items-center justify-center touch-none p-1"
        title="Resize card"
      >
        <div className="w-2 h-2 sm:w-1.5 sm:h-1.5 bg-stone-500 rounded-xs" />
      </div>
    </div>
  );
};
