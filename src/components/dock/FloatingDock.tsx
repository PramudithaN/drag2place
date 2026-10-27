'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { StickyNote, CheckSquare, Calendar, Image as ImageIcon, GitFork, Sparkles } from 'lucide-react';
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
      whileHover={{ scale: 1.18, y: -6 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`group relative flex flex-col items-center justify-center w-12 h-12 rounded-2xl transition-colors ${
        active
          ? 'bg-stone-800 text-stone-100 shadow-md'
          : 'bg-[#F2ECE2]/80 hover:bg-[#EBE2D4] text-stone-700 shadow-xs'
      }`}
    >
      {icon}
      {/* Tooltip */}
      <span className="absolute -top-9 opacity-0 group-hover:opacity-100 transition-all duration-150 px-2.5 py-1 text-[11px] font-sans font-medium text-stone-100 bg-stone-900/90 rounded-lg whitespace-nowrap shadow-md pointer-events-none">
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
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        className="flex items-center gap-2 p-2 bg-[#FAF8F5]/90 backdrop-blur-md border border-[#E7E0D4] rounded-3xl shadow-xl shadow-stone-900/5"
      >
        <DockItem
          icon={<StickyNote size={19} />}
          label="Note / Idea (N)"
          onClick={() => handleAdd('note')}
        />
        <DockItem
          icon={<CheckSquare size={19} />}
          label="To-Do List (T)"
          onClick={() => handleAdd('todo')}
        />
        <DockItem
          icon={<Calendar size={19} />}
          label="Event / Plan (E)"
          onClick={() => handleAdd('event')}
        />
        <DockItem
          icon={<ImageIcon size={19} />}
          label="Image / Moodboard (I)"
          onClick={() => handleAdd('image')}
        />

        <div className="w-[1px] h-6 bg-[#E0D8CC] mx-1" />

        <DockItem
          icon={<GitFork size={19} />}
          label="Connect Cards (C)"
          onClick={() => setActiveTool(activeTool === 'connect' ? 'select' : 'connect')}
          active={activeTool === 'connect'}
        />

        <div className="hidden sm:flex items-center pl-1 pr-2 text-[11px] font-serif italic text-stone-400">
          <Sparkles size={12} className="mr-1 text-amber-500" />
          Milanote space
        </div>
      </motion.div>
    </div>
  );
};
