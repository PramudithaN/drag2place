'use client';

import React, { useState, useRef } from 'react';
import { Card, CardStatus, NoteCardData, TodoCardData, EventCardData, ImageCardData, CodeCardData, PaletteCardData, MetricCardData, CommentCardData, LinkCardData } from '@/types/board';
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
import { AudioCard } from './AudioCard';
import { TableCard } from './TableCard';
import { CountdownCard } from './CountdownCard';
import { QuoteCard } from './QuoteCard';
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
  Music,
  Table,
  Timer,
  Quote,
  Plus,
  X as XIcon,
} from 'lucide-react';
import {
  CardType,
  AudioCardData,
  TableCardData,
  CountdownCardData,
  QuoteCardData,
} from '@/types/board';

const STATUS_META: Record<CardStatus, { label: string; badgeClass: string }> = {
  todo: { label: 'To Do', badgeClass: 'bg-stone-200/80 dark:bg-stone-800 text-stone-700 dark:text-stone-300' },
  in_progress: { label: 'In Progress', badgeClass: 'bg-amber-500/20 text-amber-800 dark:text-amber-300' },
  review: { label: 'In Review', badgeClass: 'bg-blue-500/20 text-blue-800 dark:text-blue-300' },
  done: { label: 'Done', badgeClass: 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-300' },
};

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
  audio: { icon: <Music size={12} className="text-amber-700 dark:text-amber-400" />, label: 'Audio' },
  table: { icon: <Table size={12} className="text-sky-700 dark:text-sky-400" />, label: 'Table' },
  countdown: { icon: <Timer size={12} className="text-rose-700 dark:text-rose-400" />, label: 'Countdown' },
  quote: { icon: <Quote size={12} className="text-amber-700 dark:text-amber-400" />, label: 'Quote' },
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
  audio: 'border-t-2 border-t-amber-500/80',
  table: 'border-t-2 border-t-sky-500/80',
  countdown: 'border-t-2 border-t-rose-500/80',
  quote: 'border-t-2 border-t-amber-600/70',
};

const CARD_TYPE_INFO: Record<CardType, { title: string; subtitle: string; desc: string; shortcut?: string }> = {
  note: {
    title: 'Sticky Note Card',
    subtitle: 'Text & Writing',
    desc: 'Rich typography thoughts, ideas & markdown scratchpad.',
    shortcut: 'N',
  },
  todo: {
    title: 'Checklist Task Card',
    subtitle: 'Sprint Tasks',
    desc: 'Interactive sprint tasks, checklists & confetti completion.',
    shortcut: 'T',
  },
  code: {
    title: 'Code Terminal Card',
    subtitle: 'Engineering & DevOps',
    desc: 'Syntax-highlighted code editor, JSON validator & formatting.',
    shortcut: 'C',
  },
  palette: {
    title: 'Color Palette Card',
    subtitle: 'Brand & Visual Design',
    desc: 'Hex swatches, Pantone color codes & WCAG contrast ratios.',
    shortcut: 'P',
  },
  metric: {
    title: 'KPI Metric Goal Card',
    subtitle: 'Planning & Telemetry',
    desc: 'Interactive target tracker, percentage progress & value counters.',
    shortcut: 'M',
  },
  event: {
    title: 'Milestone Event Card',
    subtitle: 'Calendar & Deadlines',
    desc: 'Dated calendar milestone, countdown tags & Google Calendar sync.',
    shortcut: 'E',
  },
  image: {
    title: 'Media Moodboard Card',
    subtitle: 'Design & Media',
    desc: 'Visual assets, artwork, moodboard images & lightbox viewer.',
    shortcut: 'I',
  },
  link: {
    title: 'Web Embed & Bookmark',
    subtitle: 'Bookmarks & Media',
    desc: 'Live OpenGraph link preview & interactive video/audio players.',
  },
  audio: {
    title: 'Audio Visualizer Card',
    subtitle: 'Sound Design & Memos',
    desc: 'Waveform audio player, time counter & sound memos.',
  },
  table: {
    title: 'Data Grid Table Card',
    subtitle: 'Data & Sprint Specs',
    desc: 'Editable columns and rows for backlog specs, tables & budgets.',
  },
  countdown: {
    title: 'Launch Countdown Card',
    subtitle: 'Timers & Launches',
    desc: 'Live ticking countdown (Days, Hours, Mins, Secs) to target date.',
  },
  quote: {
    title: 'Editorial Pull-Quote Card',
    subtitle: 'Principles & Citations',
    desc: 'Pull-quote citations, design principles & author attribution.',
  },
  comment: {
    title: 'Review Pin Note Card',
    subtitle: 'Spatial Review',
    desc: 'Spatial review pin for collaborator discussion & annotations.',
  },
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
    updateCardTags,
    updateCardStatus,
    setSearchQuery,
    activeFilterType,
    searchQuery,
    compactMode,
  } = useBoardStore();

  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [newTagInput, setNewTagInput] = useState('');

  const isSelected = selectedCardIds.includes(card.id);
  const isConnectingOrigin = connectingFromCardId === card.id;
  const isConnectingTarget = activeTool === 'connect' && connectingFromCardId !== null && connectingFromCardId !== card.id;
  const isAwaitingOrigin = activeTool === 'connect' && connectingFromCardId === null;

  const cardRef = useRef<HTMLDivElement>(null);

  // Spotlight Filter & Search Dimming
  const isDimmed = React.useMemo(() => {
    if (activeFilterType !== 'all' && card.type !== activeFilterType) {
      return true;
    }
    const q = searchQuery.trim().toLowerCase();
    if (!q) return false;

    const queryClean = q.replace(/^#/, '');
    if (card.tags?.some((t) => t.toLowerCase().includes(queryClean))) return false;
    if (card.status?.toLowerCase().includes(queryClean)) return false;

    const content = card.content;
    if (card.type === 'note' && (content as NoteCardData).body?.toLowerCase().includes(q)) return false;
    if (card.type === 'todo' && (content as TodoCardData).items?.some((it) => it.text.toLowerCase().includes(q))) return false;
    if (card.type === 'event' && (content as EventCardData).description?.toLowerCase().includes(q)) return false;
    if (card.type === 'link' && ((content as LinkCardData).url?.toLowerCase().includes(q) || (content as LinkCardData).description?.toLowerCase().includes(q))) return false;
    if (card.type === 'code' && ((content as CodeCardData).code?.toLowerCase().includes(q) || (content as CodeCardData).language?.toLowerCase().includes(q))) return false;
    if (card.type === 'comment' && (content as CommentCardData).text?.toLowerCase().includes(q)) return false;
    if ('title' in content && typeof content.title === 'string' && content.title.toLowerCase().includes(q)) return false;
    if ('caption' in content && typeof content.caption === 'string' && content.caption.toLowerCase().includes(q)) return false;
    return true;
  }, [card, activeFilterType, searchQuery]);

  // Dragging logic with smart magnetic alignment guides
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

      let finalDeltaX = deltaX;
      let finalDeltaY = deltaY;

      // Smart Magnetic Alignment Snapping (single card dragging)
      if (targetIds.length === 1 && !useBoardStore.getState().snapToGrid) {
        const candidateX = initialPositions[0].x + deltaX;
        const candidateY = initialPositions[0].y + deltaY;
        const otherCards = allCurrentCards.filter(
          (c) => c.boardId === card.boardId && c.id !== card.id
        );

        let snapGuideX: number | undefined;
        let snapGuideY: number | undefined;
        const SNAP_DIST = 8;

        const myCenter = candidateX + card.width / 2;
        const myRight = candidateX + card.width;

        for (const oc of otherCards) {
          const ocCenter = oc.x + oc.width / 2;
          const ocRight = oc.x + oc.width;

          if (Math.abs(candidateX - oc.x) < SNAP_DIST) {
            finalDeltaX = oc.x - initialPositions[0].x;
            snapGuideX = oc.x;
            break;
          }
          if (Math.abs(myCenter - ocCenter) < SNAP_DIST) {
            finalDeltaX = ocCenter - card.width / 2 - initialPositions[0].x;
            snapGuideX = ocCenter;
            break;
          }
          if (Math.abs(myRight - ocRight) < SNAP_DIST) {
            finalDeltaX = ocRight - card.width - initialPositions[0].x;
            snapGuideX = ocRight;
            break;
          }
        }

        const myCenterY = candidateY + card.height / 2;
        const myBottom = candidateY + card.height;

        for (const oc of otherCards) {
          const ocCenterY = oc.y + oc.height / 2;
          const ocBottom = oc.y + oc.height;

          if (Math.abs(candidateY - oc.y) < SNAP_DIST) {
            finalDeltaY = oc.y - initialPositions[0].y;
            snapGuideY = oc.y;
            break;
          }
          if (Math.abs(myCenterY - ocCenterY) < SNAP_DIST) {
            finalDeltaY = ocCenterY - card.height / 2 - initialPositions[0].y;
            snapGuideY = ocCenterY;
            break;
          }
          if (Math.abs(myBottom - ocBottom) < SNAP_DIST) {
            finalDeltaY = ocBottom - card.height - initialPositions[0].y;
            snapGuideY = ocBottom;
            break;
          }
        }

        useBoardStore.getState().setAlignmentGuides({
          vertical: snapGuideX,
          horizontal: snapGuideY,
        });
      }

      const deltas = initialPositions.map((pos) => ({
        id: pos.id,
        x: pos.x + finalDeltaX,
        y: pos.y + finalDeltaY,
      }));

      moveCards(deltas);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      useBoardStore.getState().setAlignmentGuides(null);
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
    if ('title' in card.content && typeof (card.content as { title?: unknown }).title === 'string') {
      return (card.content as { title: string }).title;
    }
    if (card.type === 'quote' && 'quote' in card.content) {
      const q = (card.content as QuoteCardData).quote;
      return q ? (q.length > 25 ? `${q.substring(0, 25)}…` : q) : 'Quote';
    }
    if (card.type === 'image' && 'caption' in card.content) {
      return (card.content as ImageCardData).caption || '';
    }
    return '';
  };

  const handleTitleChange = (newTitle: string) => {
    if (card.type === 'image') {
      updateCardContent(card.id, { caption: newTitle });
    } else if (card.type === 'quote') {
      updateCardContent(card.id, { quote: newTitle });
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

  const handleCycleStatus = (e: React.MouseEvent) => {
    e.stopPropagation();
    const sequence: CardStatus[] = ['todo', 'in_progress', 'review', 'done'];
    const currentIdx = card.status ? sequence.indexOf(card.status) : -1;
    const nextStatus = sequence[(currentIdx + 1) % sequence.length];
    updateCardStatus(card.id, nextStatus);
  };

  const handleAddTag = () => {
    const trimmed = newTagInput.trim().replace(/^#/, '');
    if (trimmed) {
      const existing = card.tags || [];
      if (!existing.includes(trimmed)) {
        updateCardTags(card.id, [...existing, trimmed]);
      }
    }
    setNewTagInput('');
    setIsAddingTag(false);
  };

  const handleRemoveTag = (e: React.MouseEvent, tagToRemove: string) => {
    e.stopPropagation();
    const existing = card.tags || [];
    updateCardTags(card.id, existing.filter((t) => t !== tagToRemove));
  };

  const hasSearchOrFilterActive = activeFilterType !== 'all' || searchQuery.trim().length > 0;

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
        height: compactMode ? '160px' : `${card.height}px`,
        zIndex: isDragging ? 9999 : card.zIndex,
        willChange: isDragging ? 'transform' : 'auto',
      }}
      className={`absolute select-none flex flex-col rounded-2xl border shadow-sm overflow-hidden ${CARD_TYPE_ACCENTS[card.type] || ''} ${
        isDragging || isResizing
          ? 'transition-none cursor-grabbing shadow-2xl opacity-95 ring-2 ring-stone-800/40 dark:ring-stone-200/40'
          : 'transition-all duration-200 cursor-default'
      } ${
        colorStyle.bg
      } ${colorStyle.border} ${
        isDimmed
          ? 'opacity-15 blur-[0.4px] pointer-events-none scale-[0.98]'
          : isSelected
          ? 'ring-2 ring-stone-700/60 dark:ring-stone-300/60 shadow-lg'
          : hasSearchOrFilterActive
          ? 'ring-2 ring-amber-500/80 shadow-md'
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
        className="flex items-center justify-between px-3 py-2 cursor-grab active:cursor-grabbing border-b border-stone-200/50 dark:border-stone-800/50 rounded-t-2xl touch-none"
      >
        <div className="flex items-center gap-1.5 flex-1 mr-2 min-w-0">
          {/* Tactile Drag Handle with Tooltip */}
          <div className="relative group/grip flex items-center shrink-0">
            <GripVertical size={14} className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200" />
            <div className="absolute left-0 bottom-full mb-1.5 hidden group-hover/grip:block z-50 pointer-events-none px-2 py-1 bg-stone-900/95 dark:bg-stone-100/95 text-stone-100 dark:text-stone-900 text-[10px] font-sans font-medium rounded-lg shadow-xl whitespace-nowrap border border-stone-700/40 dark:border-stone-300/40">
              Drag to move • Shift+Click to multi-select
            </div>
          </div>

          {/* Card Type Badge with Rich Instant Tooltip */}
          <div className="relative group/type flex items-center shrink-0">
            <div
              className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-stone-500/10 dark:bg-stone-400/10 text-[10px] font-mono font-medium text-stone-600 dark:text-stone-300 select-none cursor-help hover:bg-stone-500/20 transition-colors"
            >
              {CARD_TYPE_META[card.type]?.icon}
              <span className="font-semibold">{CARD_TYPE_META[card.type]?.label}</span>
            </div>

            {/* Instant Floating Card Type Tooltip */}
            <div className="absolute left-0 bottom-full mb-2 hidden group-hover/type:flex flex-col z-50 pointer-events-none w-56 p-2.5 bg-stone-900/95 dark:bg-stone-100/95 backdrop-blur-md text-stone-100 dark:text-stone-900 rounded-xl shadow-2xl border border-stone-700/50 dark:border-stone-300/50 text-left">
              <div className="flex items-center justify-between gap-1 pb-1 mb-1 border-b border-stone-800 dark:border-stone-200">
                <span className="text-xs font-bold font-sans">
                  {CARD_TYPE_INFO[card.type]?.title || card.type}
                </span>
                {CARD_TYPE_INFO[card.type]?.shortcut && (
                  <kbd className="px-1 py-0.2 text-[9px] font-mono font-bold bg-stone-800 dark:bg-stone-200 text-amber-400 dark:text-amber-700 rounded">
                    {CARD_TYPE_INFO[card.type]?.shortcut}
                  </kbd>
                )}
              </div>
              <p className="text-[10px] text-stone-300 dark:text-stone-600 leading-snug font-sans">
                {CARD_TYPE_INFO[card.type]?.desc}
              </p>
              <div className="mt-1.5 pt-1 border-t border-stone-800/80 dark:border-stone-200/80 flex items-center justify-between text-[9px] text-stone-400 dark:text-stone-500 font-mono">
                <span>{CARD_TYPE_INFO[card.type]?.subtitle}</span>
                <span>Type: {card.type}</span>
              </div>
            </div>
          </div>

          {/* Card Title with Tooltip on hover */}
          <div className="relative group/title flex-1 min-w-0 mr-1">
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
            {getCardTitle() && (
              <div className="absolute left-0 bottom-full mb-1.5 hidden group-hover/title:block z-50 pointer-events-none max-w-xs px-2.5 py-1 bg-stone-900/95 dark:bg-stone-100/95 text-stone-100 dark:text-stone-900 text-xs font-sans rounded-lg shadow-xl whitespace-nowrap overflow-hidden text-ellipsis border border-stone-700/40 dark:border-stone-300/40">
                {getCardTitle()}
              </div>
            )}
          </div>
        </div>

        {/* Card actions */}
        <div className="flex items-center gap-0.5 shrink-0" onMouseDown={(e) => e.stopPropagation()}>
          {/* Connect button with Tooltip */}
          <div className="relative group/connect">
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
            >
              <GitCommit size={14} />
            </button>
            <div className="absolute right-0 bottom-full mb-1.5 hidden group-hover/connect:block z-50 pointer-events-none px-2 py-1 bg-stone-900/95 dark:bg-stone-100/95 text-stone-100 dark:text-stone-900 text-[10px] font-sans font-medium rounded-lg shadow-xl whitespace-nowrap border border-stone-700/40 dark:border-stone-300/40">
              {isConnectingOrigin ? 'Cancel connecting' : 'Connect with arrow to another card'}
            </div>
          </div>

          {/* Duplicate card with Tooltip */}
          <div className="relative group/dup">
            <button
              onClick={() => duplicateCard(card.id)}
              className="p-1 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-500/10 rounded-md transition-colors"
            >
              <Copy size={13} />
            </button>
            <div className="absolute right-0 bottom-full mb-1.5 hidden group-hover/dup:block z-50 pointer-events-none px-2 py-1 bg-stone-900/95 dark:bg-stone-100/95 text-stone-100 dark:text-stone-900 text-[10px] font-sans font-medium rounded-lg shadow-xl whitespace-nowrap border border-stone-700/40 dark:border-stone-300/40">
              Duplicate card (Ctrl+D)
            </div>
          </div>

          {/* Color palette picker */}
          <CardColorPicker
            currentColor={card.color}
            onSelectColor={(col) => updateCardColor(card.id, col)}
          />

          {/* Delete card with Tooltip */}
          <div className="relative group/del">
            <button
              onClick={handleDeleteCard}
              className="p-1 text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-md transition-colors"
            >
              <Trash2 size={13} />
            </button>
            <div className="absolute right-0 bottom-full mb-1.5 hidden group-hover/del:block z-50 pointer-events-none px-2 py-1 bg-stone-900/95 dark:bg-stone-100/95 text-stone-100 dark:text-stone-900 text-[10px] font-sans font-medium rounded-lg shadow-xl whitespace-nowrap border border-stone-700/40 dark:border-stone-300/40">
              Delete card (Del / Backspace)
            </div>
          </div>
        </div>
      </div>

      {/* Category Tags & Status Badges Subheader */}
      <div
        onMouseDown={(e) => e.stopPropagation()}
        className="flex items-center flex-wrap gap-1 px-3 py-1 bg-stone-500/5 dark:bg-stone-400/5 border-b border-stone-200/40 dark:border-stone-800/40 text-[11px]"
      >
        {/* Status Pill with Tooltip */}
        <div className="relative group/status">
          <button
            type="button"
            onClick={handleCycleStatus}
            className={`px-1.5 py-0.5 rounded-md font-medium text-[10px] tracking-wide transition-colors cursor-pointer ${
              card.status
                ? STATUS_META[card.status].badgeClass
                : 'bg-stone-200/50 dark:bg-stone-800/50 text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            {card.status ? STATUS_META[card.status].label : '+ Status'}
          </button>
          <div className="absolute left-0 bottom-full mb-1.5 hidden group-hover/status:block z-50 pointer-events-none px-2 py-1 bg-stone-900/95 dark:bg-stone-100/95 text-stone-100 dark:text-stone-900 text-[10px] font-sans font-medium rounded-lg shadow-xl whitespace-nowrap border border-stone-700/40 dark:border-stone-300/40">
            Status: {card.status ? STATUS_META[card.status].label : 'None'} • Click to advance
          </div>
        </div>

        {/* Tag Badges */}
        {(card.tags || []).map((tag) => (
          <span
            key={tag}
            onClick={(e) => {
              e.stopPropagation();
              setSearchQuery(`#${tag}`);
            }}
            className="group/tag inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-stone-200/70 dark:bg-stone-800/80 text-stone-700 dark:text-stone-300 font-mono text-[10px] hover:bg-amber-500/20 hover:text-amber-800 dark:hover:text-amber-300 transition-colors cursor-pointer"
            title={`Filter by tag #${tag}`}
          >
            #{tag}
            <button
              type="button"
              onClick={(e) => handleRemoveTag(e, tag)}
              className="opacity-0 group-hover/tag:opacity-100 hover:text-rose-500 transition-opacity ml-0.5"
              title="Remove tag"
            >
              <XIcon size={10} />
            </button>
          </span>
        ))}

        {/* Add Tag Inline Form */}
        {isAddingTag ? (
          <div className="inline-flex items-center gap-1">
            <input
              type="text"
              value={newTagInput}
              onChange={(e) => setNewTagInput(e.target.value)}
              onBlur={handleAddTag}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddTag();
                if (e.key === 'Escape') setIsAddingTag(false);
              }}
              autoFocus
              placeholder="tag name..."
              className="w-16 px-1 py-0.2 text-[10px] font-mono rounded bg-white dark:bg-stone-800 border border-amber-500 outline-none text-stone-800 dark:text-stone-100"
            />
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsAddingTag(true)}
            className="inline-flex items-center gap-0.5 px-1 py-0.5 rounded text-[10px] text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-500/10 transition-colors cursor-pointer"
            title="Add tag"
          >
            <Plus size={10} />
            <span>Tag</span>
          </button>
        )}
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
        {card.type === 'audio' && (
          <AudioCard
            cardId={card.id}
            data={card.content as AudioCardData}
            onChange={(newData) => updateCardContent(card.id, newData)}
          />
        )}
        {card.type === 'table' && (
          <TableCard
            cardId={card.id}
            data={card.content as TableCardData}
            onChange={(newData) => updateCardContent(card.id, newData)}
          />
        )}
        {card.type === 'countdown' && (
          <CountdownCard
            cardId={card.id}
            data={card.content as CountdownCardData}
            onChange={(newData) => updateCardContent(card.id, newData)}
          />
        )}
        {card.type === 'quote' && (
          <QuoteCard
            cardId={card.id}
            data={card.content as QuoteCardData}
            onChange={(newData) => updateCardContent(card.id, newData)}
          />
        )}
      </div>

      {/* Resizing handle on bottom right corner with tactile corner gripper */}
      <div
        onMouseDown={handleResizeStart}
        onTouchStart={handleTouchResizeStart}
        className="group/resize absolute bottom-1 right-1 w-5 h-5 cursor-nwse-resize flex items-end justify-end p-0.5 opacity-40 hover:!opacity-100 transition-opacity touch-none"
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
        <div className="absolute right-full bottom-full mb-1 mr-1 hidden group-hover/resize:block z-50 pointer-events-none px-2 py-0.5 bg-stone-900/95 dark:bg-stone-100/95 text-stone-100 dark:text-stone-900 text-[10px] font-sans font-medium rounded-md shadow-lg whitespace-nowrap border border-stone-700/40 dark:border-stone-300/40">
          Drag to resize
        </div>
      </div>
    </div>
  );
};
