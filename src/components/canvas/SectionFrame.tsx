'use client';

import React, { useState, useRef } from 'react';
import { BoardSection, CardColor } from '@/types/board';
import { useBoardStore } from '@/lib/store';
import { FolderKanban, Trash2, GripHorizontal, Palette } from 'lucide-react';

const SECTION_COLOR_BG: Record<CardColor, string> = {
  paper: 'bg-stone-100/30 dark:bg-stone-900/20 border-stone-300 dark:border-stone-700',
  cream: 'bg-[#FDF8EE]/40 dark:bg-[#2A241B]/30 border-[#E8DEC7] dark:border-[#3D3325]',
  sage: 'bg-[#F0F6F2]/40 dark:bg-[#1A261C]/30 border-[#D5E3D8] dark:border-[#27382A]',
  terracotta: 'bg-[#FDF2ED]/40 dark:bg-[#2B1D19]/30 border-[#EED7CE] dark:border-[#422A23]',
  amber: 'bg-[#FCF6E8]/40 dark:bg-[#2C2417]/30 border-[#EFE1C4] dark:border-[#42341F]',
  lavender: 'bg-[#F6F2FC]/40 dark:bg-[#231A2D]/30 border-[#E4D8F4] dark:border-[#372648]',
  sky: 'bg-[#F0F6FB]/40 dark:bg-[#19242E]/30 border-[#D3E4F2] dark:border-[#253646]',
};

interface SectionFrameProps {
  section: BoardSection;
  zoom: number;
}

export const SectionFrame: React.FC<SectionFrameProps> = ({ section, zoom }) => {
  const {
    updateSection,
    updateSectionPositionAndCards,
    deleteSection,
    openConfirmModal,
    selectedSectionId,
    selectSection,
    clearSelection,
    saveBoardLocally,
  } = useBoardStore();

  const isSelected = selectedSectionId === section.id;

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(section.title);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);

  const resizeStartRef = useRef<{ width: number; height: number; mouseX: number; mouseY: number }>({
    width: section.width,
    height: section.height,
    mouseX: 0,
    mouseY: 0,
  });

  const handleTitleSubmit = () => {
    setIsEditingTitle(false);
    if (titleValue.trim() && titleValue !== section.title) {
      updateSection(section.id, { title: titleValue.trim() });
    } else {
      setTitleValue(section.title);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    openConfirmModal({
      title: `Delete Section "${section.title}"?`,
      message: 'This will remove the section boundary frame. Cards inside this section will remain safely on your board.',
      confirmText: 'Delete Section',
      isDestructive: true,
      icon: 'trash',
      onConfirm: () => deleteSection(section.id),
    });
  };

  // High-performance, zero-delay dragging for mouse
  const handleDragStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDragging(true);

    const startMouseX = e.clientX;
    const startMouseY = e.clientY;
    const initialSectionX = section.x;
    const initialSectionY = section.y;

    // Snapshot cards inside this section once at drag start
    const allCards = useBoardStore.getState().allCards;
    const containedCards = allCards
      .filter((c) => {
        if (c.boardId !== section.boardId) return false;
        if (c.sectionId === section.id) return true;
        const centerX = c.x + c.width / 2;
        const centerY = c.y + c.height / 2;
        return (
          centerX >= section.x &&
          centerX <= section.x + section.width &&
          centerY >= section.y &&
          centerY <= section.y + section.height
        );
      })
      .map((c) => ({ id: c.id, x: c.x, y: c.y }));

    document.body.style.cursor = 'grabbing';
    document.body.style.userSelect = 'none';

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = (moveEvent.clientX - startMouseX) / zoom;
      const deltaY = (moveEvent.clientY - startMouseY) / zoom;

      updateSectionPositionAndCards(
        section.id,
        initialSectionX + deltaX,
        initialSectionY + deltaY,
        containedCards.map((c) => ({
          id: c.id,
          x: c.x + deltaX,
          y: c.y + deltaY,
        }))
      );
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      saveBoardLocally();
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // High-performance, zero-delay dragging for touch devices
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    e.stopPropagation();
    setIsDragging(true);

    const touch = e.touches[0];
    const startTouchX = touch.clientX;
    const startTouchY = touch.clientY;
    const initialSectionX = section.x;
    const initialSectionY = section.y;

    const allCards = useBoardStore.getState().allCards;
    const containedCards = allCards
      .filter((c) => {
        if (c.boardId !== section.boardId) return false;
        if (c.sectionId === section.id) return true;
        const centerX = c.x + c.width / 2;
        const centerY = c.y + c.height / 2;
        return (
          centerX >= section.x &&
          centerX <= section.x + section.width &&
          centerY >= section.y &&
          centerY <= section.y + section.height
        );
      })
      .map((c) => ({ id: c.id, x: c.x, y: c.y }));

    const handleTouchMove = (moveEvent: TouchEvent) => {
      if (moveEvent.touches.length !== 1) return;
      moveEvent.preventDefault();
      const currentTouch = moveEvent.touches[0];
      const deltaX = (currentTouch.clientX - startTouchX) / zoom;
      const deltaY = (currentTouch.clientY - startTouchY) / zoom;

      updateSectionPositionAndCards(
        section.id,
        initialSectionX + deltaX,
        initialSectionY + deltaY,
        containedCards.map((c) => ({
          id: c.id,
          x: c.x + deltaX,
          y: c.y + deltaY,
        }))
      );
    };

    const handleTouchEnd = () => {
      setIsDragging(false);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      saveBoardLocally();
    };

    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);
  };

  // Resizing section frame bounds with zero-delay feedback
  const handleResizeStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsResizing(true);
    resizeStartRef.current = {
      width: section.width,
      height: section.height,
      mouseX: e.clientX,
      mouseY: e.clientY,
    };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = (moveEvent.clientX - resizeStartRef.current.mouseX) / zoom;
      const deltaY = (moveEvent.clientY - resizeStartRef.current.mouseY) / zoom;

      const nextW = Math.max(300, resizeStartRef.current.width + deltaX);
      const nextH = Math.max(200, resizeStartRef.current.height + deltaY);

      updateSection(section.id, {
        width: Math.round(nextW),
        height: Math.round(nextH),
      });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      saveBoardLocally();
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const colorClass = SECTION_COLOR_BG[section.color || 'cream'];

  return (
    <div
      data-section="true"
      onClick={(e) => {
        e.stopPropagation();
        selectSection(section.id);
        clearSelection();
      }}
      style={{
        transform: `translate3d(${section.x}px, ${section.y}px, 0px)`,
        width: `${section.width}px`,
        height: `${section.height}px`,
        zIndex: isDragging ? 30 : 5,
        willChange: isDragging || isResizing ? 'transform' : 'auto',
      }}
      className={`absolute rounded-3xl border-2 select-none ${colorClass} ${
        isDragging || isResizing
          ? 'transition-none opacity-95 ring-2 ring-amber-500/50 shadow-xl'
          : 'transition-all duration-200'
      } ${
        isSelected
          ? 'border-amber-500/90 ring-2 ring-amber-500/70 border-solid shadow-xl'
          : 'border-dashed'
      }`}
    >
      {/* Section Header Bar */}
      <div
        onMouseDown={(e) => {
          selectSection(section.id);
          clearSelection();
          handleDragStart(e);
        }}
        onTouchStart={(e) => {
          selectSection(section.id);
          clearSelection();
          handleTouchStart(e);
        }}
        className={`group absolute -top-11 left-0 flex items-center gap-2 px-3 py-1.5 rounded-2xl backdrop-blur-md border shadow-sm text-stone-700 dark:text-stone-300 ${
          isDragging
            ? 'transition-none cursor-grabbing shadow-lg'
            : 'transition-all duration-200 cursor-grab active:cursor-grabbing hover:shadow-md'
        } ${
          isSelected
            ? 'bg-[#FAF8F5] dark:bg-[#1E1C19] border-amber-500 ring-2 ring-amber-500/40'
            : 'bg-[#FAF8F5]/90 dark:bg-[#1E1C19]/90 border-[#E5DFD5] dark:border-[#38332B]'
        }`}
      >
        <FolderKanban size={14} className="text-amber-700 dark:text-amber-400 shrink-0" />

        {isSelected && (
          <span
            className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-300 text-[10px] font-mono font-medium shrink-0 animate-in fade-in duration-200"
            title="Active section: new cards from the dock will automatically be added inside here"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            Active
          </span>
        )}

        {isEditingTitle ? (
          <input
            type="text"
            value={titleValue}
            onChange={(e) => setTitleValue(e.target.value)}
            onBlur={handleTitleSubmit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleTitleSubmit();
              if (e.key === 'Escape') {
                setTitleValue(section.title);
                setIsEditingTitle(false);
              }
            }}
            autoFocus
            className="px-1.5 py-0.5 text-xs font-semibold text-stone-800 dark:text-stone-100 bg-white dark:bg-stone-800 border border-amber-500 rounded-md outline-none focus:ring-1 focus:ring-amber-500"
          />
        ) : (
          <span
            onDoubleClick={(e) => {
              e.stopPropagation();
              setIsEditingTitle(true);
            }}
            title="Double-click to rename section"
            className="text-xs font-semibold tracking-wide text-stone-800 dark:text-stone-200 cursor-text select-text hover:text-amber-700 dark:hover:text-amber-400"
          >
            {section.title}
          </span>
        )}

        {/* Drag Gripper hint */}
        <GripHorizontal size={13} className="text-stone-400 dark:text-stone-500 ml-1" />

        {/* Color Palette Toggle */}
        <div className="relative">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowColorPicker(!showColorPicker);
            }}
            className="p-1 hover:bg-stone-200/60 dark:hover:bg-stone-800 rounded-md text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-100 transition-colors cursor-pointer"
            title="Change section frame tone"
          >
            <Palette size={12} />
          </button>

          {showColorPicker && (
            <div
              onMouseDown={(e) => e.stopPropagation()}
              className="absolute left-0 top-7 z-50 flex items-center gap-1 p-1 bg-[#FAF8F5] dark:bg-[#1E1C19] border border-stone-200 dark:border-stone-800 rounded-xl shadow-lg backdrop-blur-md"
            >
              {(['cream', 'sage', 'amber', 'sky', 'lavender', 'terracotta', 'paper'] as CardColor[]).map((c) => (
                <button
                  key={c}
                  onClick={() => {
                    updateSection(section.id, { color: c });
                    setShowColorPicker(false);
                  }}
                  className={`w-4 h-4 rounded-full border border-stone-300 dark:border-stone-700 hover:scale-125 transition-transform cursor-pointer ${
                    c === 'cream' ? 'bg-[#FDF8EE]' : c === 'sage' ? 'bg-[#F0F6F2]' : c === 'amber' ? 'bg-[#FCF6E8]' : c === 'sky' ? 'bg-[#F0F6FB]' : c === 'lavender' ? 'bg-[#F6F2FC]' : c === 'terracotta' ? 'bg-[#FDF2ED]' : 'bg-white'
                  }`}
                  title={c}
                />
              ))}
            </div>
          )}
        </div>

        {/* Delete Section */}
        <button
          type="button"
          onClick={handleDelete}
          className="p-1 hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400 rounded-md text-stone-400 dark:text-stone-500 transition-colors cursor-pointer"
          title="Delete Section Frame"
        >
          <Trash2 size={12} />
        </button>
      </div>

      {/* Frame Resize Gripper on Bottom-Right */}
      <div
        onMouseDown={handleResizeStart}
        className={`absolute bottom-2 right-2 w-6 h-6 flex items-center justify-center rounded-lg cursor-nwse-resize text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-300/40 dark:hover:bg-stone-700/40 transition-colors ${
          isResizing ? 'bg-amber-500/20 text-amber-600' : ''
        }`}
        title="Drag to resize section frame"
      >
        <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
          <circle cx="8" cy="8" r="1.2" />
          <circle cx="4" cy="8" r="1.2" />
          <circle cx="8" cy="4" r="1.2" />
        </svg>
      </div>
    </div>
  );
};
