'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { StickyNote, CheckSquare, Calendar, Image as ImageIcon, GitFork, Code2, Palette, TrendingUp, Link2 } from 'lucide-react';
import { useBoardStore } from '@/lib/store';
import { CardType } from '@/types/board';

interface DockItemProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  active?: boolean;
}

const DockItem: React.FC<DockItemProps> = ({ icon, label, onClick, active }) => {
  return (
    <motion.button
      whileHover={{ scale: 1.15, y: -4 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`group relative flex flex-col items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl shrink-0 transition-colors ${
        active
          ? 'bg-stone-800 dark:bg-stone-100 text-stone-100 dark:text-stone-900 shadow-md ring-2 ring-stone-900 dark:ring-stone-100'
          : 'bg-[#F2ECE2]/80 dark:bg-[#25221E]/80 hover:bg-[#EBE2D4] dark:hover:bg-[#2F2C27] text-stone-700 dark:text-stone-300 shadow-xs'
      }`}
    >
      {icon}
      {/* Tooltip on desktop only */}
      <span className="hidden sm:block absolute -top-9 opacity-0 group-hover:opacity-100 transition-all duration-150 px-2.5 py-1 text-[11px] font-sans font-medium text-stone-100 dark:text-stone-900 bg-stone-900/90 dark:bg-stone-100/90 rounded-lg whitespace-nowrap shadow-md pointer-events-none">
        {label}
      </span>
    </motion.button>
  );
};

export const FloatingDock: React.FC = () => {
  const { addCard, activeTool, setActiveTool } = useBoardStore();

  const handleAdd = (type: CardType) => {
    addCard(type);
  };

  return (
    <div
      data-dock="true"
      className="fixed bottom-3 sm:bottom-6 left-1/2 -translate-x-1/2 z-40 max-w-[calc(100vw-1.5rem)] pb-[env(safe-area-inset-bottom,0px)]"
    >
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        className="flex items-center gap-1.5 sm:gap-2 p-1.5 sm:p-2 bg-[#FAF8F5]/90 dark:bg-[#1C1A17]/90 backdrop-blur-md border border-[#E7E0D4] dark:border-[#33302A] rounded-2xl sm:rounded-3xl shadow-xl shadow-stone-900/5 dark:shadow-black/20 overflow-x-auto scrollbar-none touch-pan-x max-w-full"
      >
        <DockItem
          icon={<StickyNote className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />}
          label="Note / Idea (N)"
          onClick={() => handleAdd('note')}
        />
        <DockItem
          icon={<CheckSquare className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />}
          label="Checklist (T)"
          onClick={() => handleAdd('todo')}
        />
        <DockItem
          icon={<Code2 className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />}
          label="Code / JSON (C)"
          onClick={() => handleAdd('code')}
        />
        <DockItem
          icon={<Palette className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />}
          label="Color Palette (P)"
          onClick={() => handleAdd('palette')}
        />
        <DockItem
          icon={<TrendingUp className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />}
          label="KPI Metric (M)"
          onClick={() => handleAdd('metric')}
        />
        <DockItem
          icon={<Calendar className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />}
          label="Milestone (E)"
          onClick={() => handleAdd('event')}
        />
        <DockItem
          icon={<ImageIcon className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />}
          label="Media (I)"
          onClick={() => handleAdd('image')}
        />
        <DockItem
          icon={<Link2 className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />}
          label="Link Preview"
          onClick={() => handleAdd('link')}
        />

        <div className="w-[1px] h-5 sm:h-6 bg-[#E0D8CC] dark:bg-[#38342E] mx-0.5 sm:mx-1 shrink-0" />

        <DockItem
          icon={<GitFork className="w-4 h-4 sm:w-[19px] sm:h-[19px]" />}
          label="Connect Cards"
          onClick={() => setActiveTool(activeTool === 'connect' ? 'select' : 'connect')}
          active={activeTool === 'connect'}
        />

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
