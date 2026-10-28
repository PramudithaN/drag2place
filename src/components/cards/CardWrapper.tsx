'use client';

import React, { useState, useRef } from 'react';
import { Card, NoteCardData, TodoCardData, EventCardData, ImageCardData, CodeCardData, PaletteCardData, MetricCardData, CommentCardData, LinkCardData } from '@/types/board';
import { useBoardStore } from '@/lib/store';
import { COLOR_CLASSES } from '@/lib/colors';
import { CardColorPicker } from './CardColorPicker';
import { TodoCard } from './TodoCard';
import { NoteCard } from './NoteCard';
import { EventCard } from './EventCard';
import { ImageCard } from './ImageCard';
import { CodeCard } from './CodeCard';
import { PaletteCard } from './PaletteCard';
import { MetricCard } from './MetricCard';
import { CommentCard } from './CommentCard';
import { LinkCard } from './LinkCard';
import {
  GripVertical,
  Trash2,
  GitCommit,
  Copy,
  StickyNote,
  CheckSquare,
  Calendar,
  Image as ImageIcon,
  Code2,
  Palette,
  TrendingUp,
  MessageSquare,
  Link2,
} from 'lucide-react';
import { CardType } from '@/types/board';

const CARD_TYPE_META: Record<CardType, { icon: React.ReactNode; label: string }> = {
  note: { icon: <StickyNote size={12} className="text-amber-700 dark:text-amber-400" />, label: 'Note' },
  todo: { icon: <CheckSquare size={12} className="text-emerald-700 dark:text-emerald-400" />, label: 'Checklist' },
  event: { icon: <Calendar size={12} className="text-purple-700 dark:text-purple-400" />, label: 'Event' },
  image: { icon: <ImageIcon size={12} className="text-sky-700 dark:text-sky-400" />, label: 'Media' },
  code: { icon: <Code2 size={12} className="text-stone-700 dark:text-stone-300" />, label: 'Code' },
  palette: { icon: <Palette size={12} className="text-rose-700 dark:text-rose-400" />, label: 'Palette' },
  metric: { icon: <TrendingUp size={12} className="text-blue-700 dark:text-blue-400" />, label: 'Metric' },
  comment: { icon: <MessageSquare size={12} className="text-amber-700 dark:text-amber-400" />, label: 'Pin' },
  link: { icon: <Link2 size={12} className="text-indigo-700 dark:text-indigo-400" />, label: 'Embed' },
};

const CARD_TYPE_ACCENTS: Record<CardType, string> = {
  note: 'border-t-2 border-t-amber-600/70',
  todo: 'border-t-2 border-t-emerald-600/70',
  event: 'border-t-2 border-t-amber-500/80',
  link: 'border-t-2 border-t-sky-500/80',
  palette: 'border-t-2 border-t-purple-500/80',
  metric: 'border-t-2 border-t-rose-500/80',
  code: 'border-t-2 border-t-stone-700/80',
  image: 'border-t-2 border-t-cyan-500/80',
  comment: 'border-t-2 border-t-amber-500/80',
};

interface CardWrapperProps {
  card: Card;
  zoom: number;
}

export const CardWrapper: React.FC<CardWrapperProps> = ({ card, zoom }) => {
  const {
    updateCardPosition,
    moveCards,
    updateCardSize,
    updateCardContent,
    updateCardColor,
    bringToFront,
    deleteCard,
    duplicateCard,
    selectedCardIds,
    selectCard,
    startConnecting,
    finishConnecting,
    cancelConnecting,
    activeTool,
    connectingFromCardId,
    openConfirmModal,
  } = useBoardStore();

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

    const isAlreadySelected = selectedCardIds.includes(card.id);
    let targetIds: string[];
    if (e.shiftKey) {
      selectCard(card.id, true);
      targetIds = isAlreadySelected
        ? selectedCardIds.filter((id) => id !== card.id)
        : [...selectedCardIds, card.id];
    } else if (isAlreadySelected && selectedCardIds.length > 1) {
      targetIds = selectedCardIds;
    } else {
      selectCard(card.id, false);
      targetIds = [card.id];
    }

    setIsDragging(true);

    const startMouseX = e.clientX;
    const startMouseY = e.clientY;
    const allCurrentCards = useBoardStore.getState().allCards;
    const initialPositions = allCurrentCards
      .filter((c) => targetIds.includes(c.id))
      .map((c) => ({ id: c.id, x: c.x, y: c.y }));

    document.body.style.cursor = 'grabbing';
    document.body.style.userSelect = 'none';

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = (moveEvent.clientX - startMouseX) / zoom;
      const deltaY = (moveEvent.clientY - startMouseY) / zoom;

      const deltas = initialPositions.map((pos) => ({
        id: pos.id,
        x: pos.x + deltaX,
        y: pos.y + deltaY,
      }));

      moveCards(deltas);
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
      className={`absolute select-none flex flex-col rounded-2xl border shadow-sm ${CARD_TYPE_ACCENTS[card.type] || ''} ${
        isDragging || isResizing
          ? 'transition-none cursor-grabbing shadow-2xl opacity-95 ring-2 ring-stone-800/40 dark:ring-stone-200/40'
          : 'transition-[box-shadow,border-color] duration-150 cursor-default'
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
        <div className="flex items-center gap-1.5 flex-1 mr-2 min-w-0">
          <GripVertical size={14} className="text-stone-400 shrink-0" />
          <div
            className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-stone-500/10 dark:bg-stone-400/10 shrink-0 text-[10px] font-mono font-medium text-stone-600 dark:text-stone-300 select-none"
            title={`Card type: ${CARD_TYPE_META[card.type]?.label || card.type}`}
          >
            {CARD_TYPE_META[card.type]?.icon}
            <span className="hidden sm:inline">{CARD_TYPE_META[card.type]?.label}</span>
          </div>
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

          {/* Duplicate card */}
          <button
            onClick={() => duplicateCard(card.id)}
            className="p-1 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-500/10 rounded-md transition-colors"
            title="Duplicate card (Ctrl+D)"
          >
            <Copy size={13} />
          </button>

          {/* Color palette picker */}
          <CardColorPicker
            currentColor={card.color}
            onSelectColor={(col) => updateCardColor(card.id, col)}
          />

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
        className="flex-1 p-3.5 overflow-hidden cursor-default"
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

      {/* Resizing handle on bottom right corner with tactile corner gripper */}
      <div
        onMouseDown={handleResizeStart}
        onTouchStart={handleTouchResizeStart}
        className="group/resize absolute bottom-1 right-1 w-5 h-5 cursor-nwse-resize flex items-end justify-end p-0.5 opacity-40 hover:!opacity-100 transition-opacity touch-none"
        title="Drag corner to resize card"
      >
        <svg
          width="10"
          height="10"
          viewBox="0 0 10 10"
          className="fill-stone-400 dark:fill-stone-500 group-hover/resize:fill-amber-600 dark:group-hover/resize:fill-amber-400 transition-colors pointer-events-none"
        >
          <circle cx="8.5" cy="8.5" r="1.1" />
          <circle cx="8.5" cy="4.5" r="1.1" />
          <circle cx="4.5" cy="8.5" r="1.1" />
          <circle cx="8.5" cy="0.5" r="1.1" />
          <circle cx="4.5" cy="4.5" r="1.1" />
          <circle cx="0.5" cy="8.5" r="1.1" />
        </svg>
      </div>
    </div>
  );
};
