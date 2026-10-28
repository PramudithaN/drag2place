'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Card, CommentCardData } from '@/types/board';
import { useBoardStore } from '@/lib/store';
import { MessageSquare, Check, X, Trash2, Clock } from 'lucide-react';
import { soundFx } from '@/lib/sound';

interface CanvasCommentPinProps {
  card: Card;
  zoom: number;
}

export const CanvasCommentPin: React.FC<CanvasCommentPinProps> = ({ card, zoom }) => {
  const { updateCardPosition, updateCardContent, deleteCard, bringToFront } = useBoardStore();

  const data = (card.content as CommentCardData) || {
    author: 'Reviewer',
    text: '',
    resolved: false,
    createdAt: new Date().toISOString(),
  };

  const isResolved = data.resolved || false;
  // Automatically open newly created comments if text is empty
  const [isOpen, setIsOpen] = useState(!data.text);
  const [isDragging, setIsDragging] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && !data.text) {
      textareaRef.current?.focus();
    }
  }, [isOpen, data.text]);

  // Dragging the pin
  const handleDragStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    bringToFront(card.id);
    setIsDragging(true);

    const startMouseX = e.clientX;
    const startMouseY = e.clientY;
    const startCardX = card.x;
    const startCardY = card.y;

    document.body.style.cursor = 'grabbing';

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = (moveEvent.clientX - startMouseX) / zoom;
      const deltaY = (moveEvent.clientY - startMouseY) / zoom;
      const newX = Math.round(startCardX + deltaX);
      const newY = Math.round(startCardY + deltaY);

      if (pinRef.current) {
        pinRef.current.style.transform = `translate3d(${newX}px, ${newY}px, 0px)`;
      }
    };

    const handleMouseUp = (upEvent: MouseEvent) => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'default';
      setIsDragging(false);

      const deltaX = (upEvent.clientX - startMouseX) / zoom;
      const deltaY = (upEvent.clientY - startMouseY) / zoom;

      // Only update if actually moved
      if (Math.abs(deltaX) > 2 || Math.abs(deltaY) > 2) {
        updateCardPosition(card.id, Math.round(startCardX + deltaX), Math.round(startCardY + deltaY));
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // Touch dragging the pin on mobile
  const handleTouchDragStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    e.stopPropagation();
    bringToFront(card.id);
    setIsDragging(true);

    const touch = e.touches[0];
    const startTouchX = touch.clientX;
    const startTouchY = touch.clientY;
    const startCardX = card.x;
    const startCardY = card.y;

    let deltaX = 0;
    let deltaY = 0;

    const handleTouchMove = (moveEvent: TouchEvent) => {
      if (moveEvent.touches.length !== 1) return;
      if (moveEvent.cancelable) {
        moveEvent.preventDefault();
      }
      const curTouch = moveEvent.touches[0];
      deltaX = (curTouch.clientX - startTouchX) / zoom;
      deltaY = (curTouch.clientY - startTouchY) / zoom;
      const newX = Math.round(startCardX + deltaX);
      const newY = Math.round(startCardY + deltaY);

      if (pinRef.current) {
        pinRef.current.style.transform = `translate3d(${newX}px, ${newY}px, 0px)`;
      }
    };

    const handleTouchEnd = () => {
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchcancel', handleTouchEnd);
      setIsDragging(false);

      if (Math.abs(deltaX) > 2 || Math.abs(deltaY) > 2) {
        updateCardPosition(card.id, Math.round(startCardX + deltaX), Math.round(startCardY + deltaY));
      }
    };

    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);
    window.addEventListener('touchcancel', handleTouchEnd);
  };

  const handleToggleResolve = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundFx.playCheck();
    updateCardContent(card.id, {
      ...data,
      resolved: !isResolved,
    });
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundFx.playCheck();
    deleteCard(card.id);
  };

  const authorInitial = (data.author || 'U').charAt(0).toUpperCase();

  return (
    <div
      ref={pinRef}
      data-comment-pin="true"
      style={{
        transform: `translate3d(${card.x}px, ${card.y}px, 0px)`,
        zIndex: isOpen ? 9999 : isDragging ? 9998 : card.zIndex + 100,
      }}
      className="absolute top-0 left-0 select-none pointer-events-auto"
      onWheel={(e) => {
        if (!e.ctrlKey && !e.metaKey) {
          e.stopPropagation();
        }
      }}
    >
      {/* The Pin Marker (Click to toggle balloon, Drag to reposition) */}
      <div className="relative group">
        <div
          onMouseDown={handleDragStart}
          onTouchStart={handleTouchDragStart}
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
          className={`relative flex items-center justify-center w-8 h-8 rounded-full shadow-lg shadow-black/20 ring-2 transition-transform cursor-grab active:cursor-grabbing touch-none ${
            isDragging ? 'scale-110 ring-4' : 'hover:scale-110'
          } ${
            isResolved
              ? 'bg-emerald-600 ring-emerald-300 text-white'
              : 'bg-amber-600 ring-white dark:ring-stone-900 text-white'
          }`}
          title={isResolved ? 'Resolved comment (Click to view)' : 'Canvas comment (Click to open)'}
        >
          {isResolved ? (
            <Check size={14} className="stroke-[3]" />
          ) : (
            <span className="text-xs font-bold font-oregon">{authorInitial}</span>
          )}

          {/* Pointer tail on bottom */}
          <div
            className={`absolute -bottom-1 left-2.5 w-2 h-2 rotate-45 ${
              isResolved ? 'bg-emerald-600' : 'bg-amber-600'
            }`}
          />
        </div>
      </div>

      {/* Floating Comment Popover Balloon */}
      {isOpen && (
        <div
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          className="absolute left-10 top-0 w-72 bg-[#FAF8F5] dark:bg-[#1C1A17] border border-[#E7E0D4] dark:border-[#33302A] rounded-2xl shadow-2xl p-3 flex flex-col space-y-2.5 font-sans animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-stone-200/70 dark:border-stone-800/70">
            <div className="flex items-center gap-2">
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0 ${
                  isResolved ? 'bg-emerald-600' : 'bg-amber-600'
                }`}
              >
                {authorInitial}
              </div>
              <input
                type="text"
                value={data.author}
                onChange={(e) =>
                  updateCardContent(card.id, {
                    ...data,
                    author: e.target.value,
                  })
                }
                placeholder="Author name..."
                className="text-xs font-semibold text-stone-800 dark:text-stone-200 bg-transparent border-none focus:outline-hidden w-28 truncate"
              />
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleToggleResolve}
                className={`px-2 py-0.5 rounded-full text-[10px] font-medium transition-colors ${
                  isResolved
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                    : 'bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300'
                }`}
              >
                {isResolved ? 'Resolved' : 'Resolve'}
              </button>

              <button
                type="button"
                onClick={handleDelete}
                className="p-1 text-stone-400 hover:text-rose-500 rounded transition-colors"
                title="Delete comment"
              >
                <Trash2 size={12} />
              </button>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded transition-colors"
                title="Collapse pin"
              >
                <X size={12} />
              </button>
            </div>
          </div>

          {/* Comment Message */}
          <textarea
            ref={textareaRef}
            value={data.text}
            onChange={(e) =>
              updateCardContent(card.id, {
                ...data,
                text: e.target.value,
              })
            }
            placeholder="Write a comment or feedback on this area..."
            className={`w-full bg-transparent text-xs text-stone-800 dark:text-stone-200 placeholder-stone-400 border-none resize-none focus:outline-hidden leading-relaxed ${
              isResolved ? 'line-through text-stone-400 dark:text-stone-500' : ''
            }`}
            rows={3}
          />

          {/* Footer Timestamp */}
          <div className="flex items-center justify-between text-[10px] font-mono text-stone-400 pt-1 border-t border-stone-200/50 dark:border-stone-800/50">
            <div className="flex items-center gap-1">
              <MessageSquare size={10} />
              <span>Canvas Pin</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock size={10} />
              <span>{data.createdAt ? new Date(data.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
