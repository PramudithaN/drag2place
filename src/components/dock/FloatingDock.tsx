'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  StickyNote,
  CheckSquare,
  Calendar,
  Image as ImageIcon,
  GitFork,
  Code2,
  Palette,
  TrendingUp,
  Link2,
  FolderKanban,
  LayoutGrid,
  Search,
  X,
  Music,
  Table,
  Timer,
  Quote,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import { useBoardStore } from '@/lib/store';
import { CardType, WorkspaceMode } from '@/types/board';

export const MODE_PRIMARY_CARDS: Record<WorkspaceMode, CardType[]> = {
  developer: ['code', 'table', 'todo', 'link', 'metric', 'event'],
  designer: ['palette', 'image', 'link', 'note', 'comment', 'todo'],
  video_editor: ['image', 'audio', 'countdown', 'link', 'event', 'todo'],
  graphic_designer: ['palette', 'image', 'quote', 'note', 'link', 'event'],
  marketing: ['countdown', 'metric', 'table', 'link', 'note', 'todo'],
  influencer: ['countdown', 'image', 'metric', 'link', 'quote', 'todo'],
  product_manager: ['table', 'metric', 'todo', 'countdown', 'link', 'note'],
  architect: ['table', 'image', 'note', 'todo', 'metric', 'link'],
  music_producer: ['audio', 'note', 'todo', 'link', 'event', 'countdown'],
  author: ['note', 'quote', 'countdown', 'todo', 'event', 'link'],
};

const DEFAULT_PRIMARY_CARDS: CardType[] = ['note', 'todo', 'event', 'image', 'palette', 'metric', 'link'];

interface CardMetaDef {
  type: CardType;
  label: string;
  shortLabel: string;
  shortcut?: string;
  icon: React.ReactNode;
  category: 'Text & Writing' | 'Design & Media' | 'Engineering & Data' | 'Planning & Milestones';
  description: string;
}

const ALL_CARDS_META: Record<CardType, CardMetaDef> = {
  note: {
    type: 'note',
    label: 'Sticky Note',
    shortLabel: 'Note',
    shortcut: 'N',
    icon: <StickyNote className="w-4 h-4 text-amber-700 dark:text-amber-400" />,
    category: 'Text & Writing',
    description: 'Typography notes & rich ideas',
  },
  quote: {
    type: 'quote',
    label: 'Quote / Pullquote',
    shortLabel: 'Quote',
    icon: <Quote className="w-4 h-4 text-amber-600 dark:text-amber-300" />,
    category: 'Text & Writing',
    description: 'Pull-quote citations & design laws',
  },
  todo: {
    type: 'todo',
    label: 'Checklist / Tasks',
    shortLabel: 'Tasks',
    shortcut: 'T',
    icon: <CheckSquare className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />,
    category: 'Text & Writing',
    description: 'Interactive checklists & sprint todos',
  },
  comment: {
    type: 'comment',
    label: 'Pin Annotation',
    shortLabel: 'Pin',
    icon: <MessageSquare className="w-4 h-4 text-amber-600 dark:text-amber-400" />,
    category: 'Text & Writing',
    description: 'Sticky comment pins for reviews',
  },
  palette: {
    type: 'palette',
    label: 'Color Palette',
    shortLabel: 'Palette',
    shortcut: 'P',
    icon: <Palette className="w-4 h-4 text-purple-700 dark:text-purple-400" />,
    category: 'Design & Media',
    description: 'Color swatches & Pantone codes',
  },
  image: {
    type: 'image',
    label: 'Media / Moodboard',
    shortLabel: 'Media',
    shortcut: 'I',
    icon: <ImageIcon className="w-4 h-4 text-sky-700 dark:text-sky-400" />,
    category: 'Design & Media',
    description: 'High-res image & moodboard frames',
  },
  audio: {
    type: 'audio',
    label: 'Audio Visualizer',
    shortLabel: 'Audio',
    icon: <Music className="w-4 h-4 text-amber-600 dark:text-amber-400" />,
    category: 'Design & Media',
    description: 'Waveform visualizer & sound memos',
  },
  link: {
    type: 'link',
    label: 'Embed / Bookmark',
    shortLabel: 'Embed',
    icon: <Link2 className="w-4 h-4 text-indigo-700 dark:text-indigo-400" />,
    category: 'Design & Media',
    description: 'Live link previews & bookmarks',
  },
  code: {
    type: 'code',
    label: 'Code Snippet',
    shortLabel: 'Code',
    shortcut: 'C',
    icon: <Code2 className="w-4 h-4 text-stone-700 dark:text-stone-300" />,
    category: 'Engineering & Data',
    description: 'Multi-language syntax & JSON',
  },
  table: {
    type: 'table',
    label: 'Data Grid / Table',
    shortLabel: 'Table',
    icon: <Table className="w-4 h-4 text-sky-700 dark:text-sky-400" />,
    category: 'Engineering & Data',
    description: 'Editable columns, rows & backlog specs',
  },
  metric: {
    type: 'metric',
    label: 'KPI Metric',
    shortLabel: 'Metric',
    shortcut: 'M',
    icon: <TrendingUp className="w-4 h-4 text-rose-700 dark:text-rose-400" />,
    category: 'Planning & Milestones',
    description: 'Target progress & telemetry goals',
  },
  countdown: {
    type: 'countdown',
    label: 'Countdown Timer',
    shortLabel: 'Countdown',
    icon: <Timer className="w-4 h-4 text-rose-600 dark:text-rose-400" />,
    category: 'Planning & Milestones',
    description: 'Ticking countdown to launch day',
  },
  event: {
    type: 'event',
    label: 'Milestone / Event',
    shortLabel: 'Event',
    shortcut: 'E',
    icon: <Calendar className="w-4 h-4 text-purple-700 dark:text-purple-400" />,
    category: 'Planning & Milestones',
    description: 'Calendar event & scheduled reminders',
  },
};

interface DockItemProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  active?: boolean;
  onHover?: () => void;
  onLeave?: () => void;
}

const DockItem: React.FC<DockItemProps> = ({
  icon,
  label,
  onClick,
  active,
  onHover,
  onLeave,
}) => {
  return (
    <motion.button
      whileHover={{ scale: 1.15, y: -4 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      title={label}
      className={`group relative flex flex-col items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl shrink-0 transition-colors ${
        active
          ? 'bg-stone-800 dark:bg-stone-100 text-stone-100 dark:text-stone-900 shadow-md ring-2 ring-stone-900 dark:ring-stone-100'
          : 'bg-[#F2ECE2]/80 dark:bg-[#25221E]/80 hover:bg-[#EBE2D4] dark:hover:bg-[#2F2C27] text-stone-700 dark:text-stone-300 shadow-xs'
      }`}
    >
      {icon}
    </motion.button>
  );
};

interface ActiveTooltip {
  label: string;
  description?: string;
  shortcut?: string;
  icon?: React.ReactNode;
}

export const FloatingDock: React.FC = () => {
  const {
    addCard,
    addSection,
    activeTool,
    setActiveTool,
    currentBoard,
    allSections,
    selectedSectionId,
    activeBoardId,
  } = useBoardStore();

  const [showCatalog, setShowCatalog] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const [activeTooltip, setActiveTooltip] = useState<ActiveTooltip | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Determine active mode and primary cards
  const activeMode = currentBoard?.mode || 'developer';
  const primaryTypes = MODE_PRIMARY_CARDS[activeMode] || DEFAULT_PRIMARY_CARDS;

  // Selected section detection for visual feedback
  const targetSection = selectedSectionId
    ? allSections.find((s) => s.id === selectedSectionId && s.boardId === activeBoardId)
    : null;

  const handleAdd = (type: CardType) => {
    addCard(type);
    setShowCatalog(false);
  };

  // Close catalog on outside click
  useEffect(() => {
    if (!showCatalog) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setShowCatalog(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowCatalog(false);
    };

    window.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [showCatalog]);

  const allTypes = Object.keys(ALL_CARDS_META) as CardType[];
  const filteredTypes = allTypes.filter((t) => {
    const meta = ALL_CARDS_META[t];
    const q = searchFilter.toLowerCase().trim();
    if (!q) return true;
    return (
      meta.label.toLowerCase().includes(q) ||
      meta.category.toLowerCase().includes(q) ||
      meta.description.toLowerCase().includes(q)
    );
  });

  return (
    <div
      data-dock="true"
      className="fixed bottom-3 sm:bottom-6 left-1/2 -translate-x-1/2 z-40 max-w-[calc(100vw-1.5rem)] pb-[env(safe-area-inset-bottom,0px)]"
    >
      {/* "+ More Cards" Popover Catalog */}
      <AnimatePresence>
        {showCatalog && (
          <motion.div
            ref={popoverRef}
            initial={{ opacity: 0, y: 14, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.96 }}
            transition={{ duration: 0.16 }}
            className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 w-[340px] sm:w-[460px] bg-[#FAF8F5]/95 dark:bg-[#1C1A17]/95 backdrop-blur-xl border border-[#E7E0D4] dark:border-[#33302A] rounded-2xl shadow-2xl p-3 z-50 text-stone-800 dark:text-stone-100"
          >
            {/* Popover Header */}
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#E7E0D4] dark:border-[#33302A]">
              <div className="flex items-center gap-1.5">
                <LayoutGrid size={15} className="text-amber-600 dark:text-amber-400" />
                <span className="text-xs font-semibold tracking-wide uppercase font-mono text-stone-700 dark:text-stone-300">
                  Card Catalog ({allTypes.length} Types)
                </span>
              </div>
              <button
                onClick={() => setShowCatalog(false)}
                className="p-1 rounded-lg hover:bg-stone-200/60 dark:hover:bg-stone-800 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors"
              >
                <X size={14} />
              </button>
            </div>

            {/* Target Section Indicator Banner */}
            {targetSection && (
              <div className="mb-2.5 px-2.5 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center gap-2 text-xs text-amber-800 dark:text-amber-300">
                <Sparkles size={13} className="shrink-0 text-amber-600 dark:text-amber-400" />
                <span className="truncate">
                  Target: <strong>{targetSection.title}</strong> (will place inside cleanly)
                </span>
              </div>
            )}

            {/* Search Input */}
            <div className="relative mb-3">
              <Search
                size={14}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none"
              />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Search all card types..."
                autoFocus
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#F2ECE2]/70 dark:bg-[#25221E]/70 border border-[#E0D8CC] dark:border-[#38342E] rounded-xl outline-none focus:ring-1 focus:ring-amber-500 text-stone-800 dark:text-stone-100 placeholder:text-stone-400 font-sans"
              />
            </div>

            {/* Catalog Grid */}
            <div className="grid grid-cols-2 gap-1.5 max-h-[300px] overflow-y-auto scrollbar-thin pr-1">
              {filteredTypes.map((type) => {
                const meta = ALL_CARDS_META[type];
                const isPrimaryInMode = primaryTypes.includes(type);

                return (
                  <button
                    key={type}
                    onClick={() => handleAdd(type)}
                    className="flex items-start gap-2.5 p-2 rounded-xl text-left bg-[#F8F4EE]/60 dark:bg-[#221F1B]/60 hover:bg-[#EFE7DC] dark:hover:bg-[#2B2722] border border-[#E7E0D4]/70 dark:border-[#33302A]/70 hover:border-amber-500/40 transition-all group"
                  >
                    <div className="p-1.5 rounded-lg bg-white dark:bg-stone-800 shadow-xs shrink-0 group-hover:scale-110 transition-transform">
                      {meta.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-medium text-stone-800 dark:text-stone-100 truncate">
                          {meta.label}
                        </span>
                        {isPrimaryInMode && (
                          <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-700 dark:text-amber-300 font-mono shrink-0">
                            dock
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-stone-500 dark:text-stone-400 line-clamp-1 mt-0.5">
                        {meta.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Dock Dynamic HUD Tooltip (Always 100% visible, never clipped by overflow) */}
      <AnimatePresence>
        {activeTooltip && !showCatalog && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.12 }}
            className="absolute -top-12 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-stone-900/95 dark:bg-stone-100/95 text-stone-100 dark:text-stone-900 shadow-2xl backdrop-blur-md border border-stone-700/50 dark:border-stone-300/50 pointer-events-none z-50 whitespace-nowrap"
          >
            <div className="flex items-center gap-1.5 font-sans font-bold text-xs">
              {activeTooltip.icon}
              <span>{activeTooltip.label}</span>
            </div>
            {activeTooltip.shortcut && (
              <kbd className="px-1.5 py-0.5 text-[9px] font-mono font-bold bg-stone-800 dark:bg-stone-200 text-amber-400 dark:text-amber-700 rounded shadow-xs">
                {activeTooltip.shortcut}
              </kbd>
            )}
            {activeTooltip.description && (
              <span className="text-[11px] text-stone-300 dark:text-stone-600 font-sans font-normal border-l border-stone-700 dark:border-stone-300 pl-2">
                {activeTooltip.description}
              </span>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Floating Dock Bar */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        className="flex items-center gap-1.5 sm:gap-2 p-1.5 sm:p-2 bg-[#FAF8F5]/90 dark:bg-[#1C1A17]/90 backdrop-blur-md border border-[#E7E0D4] dark:border-[#33302A] rounded-2xl sm:rounded-3xl shadow-xl shadow-stone-900/5 dark:shadow-black/20 overflow-x-auto scrollbar-none touch-pan-x max-w-full"
      >
        {/* Render Curated Primary Cards for Active Workspace Mode */}
        {primaryTypes.map((type) => {
          const meta = ALL_CARDS_META[type];
          if (!meta) return null;

          return (
            <DockItem
              key={type}
              icon={meta.icon}
              label={meta.label}
              onClick={() => handleAdd(type)}
              onHover={() =>
                setActiveTooltip({
                  label: meta.label,
                  description: meta.description,
                  shortcut: meta.shortcut,
                  icon: meta.icon,
                })
              }
              onLeave={() => setActiveTooltip(null)}
            />
          );
        })}

        {/* "+ More Cards" Popover Trigger */}
        <DockItem
          icon={<LayoutGrid className="w-4 h-4 sm:w-[18px] sm:h-[18px] text-amber-700 dark:text-amber-400" />}
          label="More Card Types (+)"
          onClick={() => setShowCatalog(!showCatalog)}
          active={showCatalog}
          onHover={() =>
            setActiveTooltip({
              label: 'More Card Types (+)',
              description: 'Browse all 13 card categories & custom types',
              icon: <LayoutGrid className="w-3.5 h-3.5 text-amber-500" />,
            })
          }
          onLeave={() => setActiveTooltip(null)}
        />

        {/* Section Frame tool */}
        <DockItem
          icon={<FolderKanban className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />}
          label={targetSection ? `Target: "${targetSection.title}"` : 'Section Frame'}
          onClick={() => addSection('New Section')}
          active={Boolean(targetSection)}
          onHover={() =>
            setActiveTooltip({
              label: targetSection ? `Target: "${targetSection.title}"` : 'Section Frame',
              description: targetSection
                ? 'Adding cards inside this active section'
                : 'Group & contain cards into visual zones',
              icon: <FolderKanban className="w-3.5 h-3.5 text-amber-500" />,
            })
          }
          onLeave={() => setActiveTooltip(null)}
        />

        <div className="w-[1px] h-5 sm:h-6 bg-[#E0D8CC] dark:bg-[#38342E] mx-0.5 sm:mx-1 shrink-0" />

        {/* Connect Cards tool */}
        <DockItem
          icon={<GitFork className="w-4 h-4 sm:w-[19px] sm:h-[19px]" />}
          label="Connect Cards"
          onClick={() => setActiveTool(activeTool === 'connect' ? 'select' : 'connect')}
          active={activeTool === 'connect'}
          onHover={() =>
            setActiveTooltip({
              label: 'Connect Cards',
              description: 'Draw curved arrows to connect cards',
              icon: <GitFork className="w-3.5 h-3.5 text-amber-500" />,
            })
          }
          onLeave={() => setActiveTooltip(null)}
        />

        {/* Drag2Place Brand space tag */}
        <div className="hidden lg:flex items-center pl-1 pr-2 text-[11px] font-oregon text-stone-500 dark:text-stone-400 font-semibold tracking-wide select-none shrink-0">
          <Image
            src="/drag2placeLogo.png"
            alt="Drag2Place Logo"
            width={16}
            height={16}
            className="rounded-md mr-1.5 object-contain"
          />
          Drag2Place space
        </div>
      </motion.div>
    </div>
  );
};
