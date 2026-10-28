'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBoardStore } from '@/lib/store';
import { CardColor } from '@/types/board';
import {
  AlignLeft,
  AlignRight,
  AlignStartVertical,
  AlignEndVertical,
  AlignCenterHorizontal,
  AlignHorizontalDistributeCenter,
  AlignVerticalDistributeCenter,
  Copy,
  Trash2,
  X,
  Palette,
  LayoutGrid,
} from 'lucide-react';

const PALETTE_COLORS: { id: CardColor; label: string; bg: string }[] = [
  { id: 'paper', label: 'Paper', bg: 'bg-[#FDFCFA] border-[#E8E2D9]' },
  { id: 'cream', label: 'Cream', bg: 'bg-[#FDFBF7] border-[#EFE8DC]' },
  { id: 'sage', label: 'Sage', bg: 'bg-[#F2F5F3] border-[#DFE7E2]' },
  { id: 'terracotta', label: 'Terracotta', bg: 'bg-[#FAF4F0] border-[#EFE1D6]' },
  { id: 'amber', label: 'Amber', bg: 'bg-[#FCF8EE] border-[#F4EACD]' },
  { id: 'lavender', label: 'Lavender', bg: 'bg-[#F7F5FA] border-[#EAE3F2]' },
  { id: 'sky', label: 'Sky', bg: 'bg-[#F3F7FA] border-[#DCE8F0]' },
];

export const MultiSelectActionBar: React.FC = () => {
  const {
    selectedCardIds,
    clearSelection,
    duplicateSelectedCards,
    alignSelectedCards,
    updateSelectedCardsColor,
    openConfirmModal,
    deleteCard,
  } = useBoardStore();

  const [showColorPicker, setShowColorPicker] = React.useState(false);

  const count = selectedCardIds.length;
  if (count < 2) return null;

  const handleDeleteSelected = () => {
    openConfirmModal({
      title: `Delete ${count} Cards?`,
      message: `Are you sure you want to permanently delete these ${count} selected cards? Any connecting arrows will also be removed.`,
      confirmText: `Delete ${count} Cards`,
      isDestructive: true,
      icon: 'trash',
      onConfirm: () => {
        selectedCardIds.forEach((id) => deleteCard(id));
      },
    });
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 20, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 20, opacity: 0, scale: 0.95 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        className="fixed bottom-20 sm:bottom-24 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-2 select-none"
      >
        {/* Quick Color Picker Popover */}
        {showColorPicker && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="flex items-center gap-1.5 p-1.5 bg-[#FAF8F5] dark:bg-[#1C1A17] border border-[#E7E0D4] dark:border-[#33302A] rounded-xl shadow-lg backdrop-blur-md"
          >
            {PALETTE_COLORS.map((col) => (
              <button
                key={col.id}
                onClick={() => {
                  updateSelectedCardsColor(col.id);
                  setShowColorPicker(false);
                }}
                className={`w-6 h-6 rounded-lg border cursor-pointer hover:scale-110 active:scale-95 transition-transform ${col.bg}`}
                title={`Set color: ${col.label}`}
                aria-label={`Set color ${col.label}`}
              />
            ))}
          </motion.div>
        )}

        {/* Main Floating Bar */}
        <div className="flex items-center gap-1 sm:gap-1.5 px-3 py-2 bg-[#FAF8F5]/95 dark:bg-[#1C1A17]/95 backdrop-blur-md border border-[#E7E0D4] dark:border-[#33302A] rounded-2xl shadow-xl shadow-stone-900/10 dark:shadow-black/30 text-stone-700 dark:text-stone-300">
          {/* Badge */}
          <div className="px-2 py-0.5 rounded-lg bg-stone-200/70 dark:bg-stone-800 text-xs font-mono font-medium text-stone-800 dark:text-stone-200 mr-1 shrink-0">
            {count} selected
          </div>

          <div className="w-px h-4 bg-stone-300 dark:bg-stone-700 mx-0.5" />

          {/* Alignment Tools */}
          <button
            onClick={() => alignSelectedCards('grid')}
            className="p-1.5 hover:bg-stone-200/60 dark:hover:bg-stone-800 rounded-lg transition-colors cursor-pointer text-amber-700 dark:text-amber-400"
            title="Align into 2D Grid (Horizontal & Vertical)"
            aria-label="Align into 2D Grid"
          >
            <LayoutGrid size={15} />
          </button>
          <button
            onClick={() => alignSelectedCards('left')}
            className="p-1.5 hover:bg-stone-200/60 dark:hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
            title="Align Left"
            aria-label="Align Left"
          >
            <AlignLeft size={15} />
          </button>
          <button
            onClick={() => alignSelectedCards('right')}
            className="p-1.5 hover:bg-stone-200/60 dark:hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
            title="Align Right"
            aria-label="Align Right"
          >
            <AlignRight size={15} />
          </button>
          <button
            onClick={() => alignSelectedCards('top')}
            className="p-1.5 hover:bg-stone-200/60 dark:hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
            title="Align Top"
            aria-label="Align Top"
          >
            <AlignStartVertical size={15} />
          </button>
          <button
            onClick={() => alignSelectedCards('bottom')}
            className="p-1.5 hover:bg-stone-200/60 dark:hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
            title="Align Bottom"
            aria-label="Align Bottom"
          >
            <AlignEndVertical size={15} />
          </button>
          <button
            onClick={() => alignSelectedCards('center-v')}
            className="p-1.5 hover:bg-stone-200/60 dark:hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
            title="Center Horizontally"
            aria-label="Center Horizontally"
          >
            <AlignCenterHorizontal size={15} />
          </button>
          <button
            onClick={() => alignSelectedCards('distribute-h')}
            className="p-1.5 hover:bg-stone-200/60 dark:hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
            title="Distribute Horizontally"
            aria-label="Distribute Horizontally"
          >
            <AlignHorizontalDistributeCenter size={15} />
          </button>
          <button
            onClick={() => alignSelectedCards('distribute-v')}
            className="p-1.5 hover:bg-stone-200/60 dark:hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
            title="Distribute Vertically"
            aria-label="Distribute Vertically"
          >
            <AlignVerticalDistributeCenter size={15} />
          </button>

          <div className="w-px h-4 bg-stone-300 dark:bg-stone-700 mx-0.5" />

          {/* Batch Color */}
          <button
            onClick={() => setShowColorPicker(!showColorPicker)}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              showColorPicker
                ? 'bg-amber-500/20 text-amber-700 dark:text-amber-400'
                : 'hover:bg-stone-200/60 dark:hover:bg-stone-800'
            }`}
            title="Batch Change Color"
            aria-label="Batch Change Color"
          >
            <Palette size={15} />
          </button>

          {/* Duplicate All */}
          <button
            onClick={() => duplicateSelectedCards()}
            className="p-1.5 hover:bg-stone-200/60 dark:hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
            title="Duplicate Selected (Ctrl+D)"
            aria-label="Duplicate Selected"
          >
            <Copy size={15} />
          </button>

          {/* Delete All */}
          <button
            onClick={handleDeleteSelected}
            className="p-1.5 hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg transition-colors cursor-pointer"
            title="Delete Selected (Del)"
            aria-label="Delete Selected"
          >
            <Trash2 size={15} />
          </button>

          <div className="w-px h-4 bg-stone-300 dark:bg-stone-700 mx-0.5" />

          {/* Deselect */}
          <button
            onClick={clearSelection}
            className="p-1.5 hover:bg-stone-200/60 dark:hover:bg-stone-800 rounded-lg transition-colors cursor-pointer text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
            title="Clear Selection (Esc)"
            aria-label="Clear Selection"
          >
            <X size={15} />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
