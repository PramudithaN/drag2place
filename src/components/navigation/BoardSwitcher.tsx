'use client';

import React, { useState, useRef } from 'react';
import { useBoardStore } from '@/lib/store';
import { useClickOutside } from '@/lib/useClickOutside';
import { ChevronDown, Plus, Trash2, Check, Layout, Edit2, Compass, X } from 'lucide-react';
import { ModeSelectorModal } from './ModeSelectorModal';

interface BoardSwitcherProps {
  onOpenModes?: () => void;
}

export const BoardSwitcher: React.FC<BoardSwitcherProps> = ({ onOpenModes }) => {
  const {
    boards,
    activeBoardId,
    currentBoard,
    switchBoard,
    createBoard,
    updateBoardTitle,
    deleteBoard,
    allCards,
  } = useBoardStore();

  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isModeModalOpen, setIsModeModalOpen] = useState(false);
  const [editingTitle, setEditingTitle] = useState(currentBoard.title);
  const [newBoardName, setNewBoardName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [deletingBoardId, setDeletingBoardId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useClickOutside(
    menuRef,
    () => {
      setIsOpen(false);
      setIsCreating(false);
      setDeletingBoardId(null);
    },
    isOpen || isCreating || Boolean(deletingBoardId)
  );

  const handleSaveTitle = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (editingTitle.trim()) {
      updateBoardTitle(activeBoardId, editingTitle.trim());
      setIsEditing(false);
    }
  };

  const handleCreateNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (newBoardName.trim()) {
      createBoard(newBoardName.trim());
      setNewBoardName('');
      setIsCreating(false);
      setIsOpen(false);
      setDeletingBoardId(null);
    }
  };

  const activeCardsCount = allCards.filter((c) => c.boardId === activeBoardId).length;

  return (
    <div className="relative" ref={menuRef}>
      {/* Board Title Trigger */}
      <div className="flex items-center gap-1.5 text-xs text-stone-600 dark:text-stone-400">
        {isEditing ? (
          <form onSubmit={handleSaveTitle} className="flex items-center gap-1">
            <input
              type="text"
              autoFocus
              value={editingTitle}
              onChange={(e) => setEditingTitle(e.target.value)}
              onBlur={() => handleSaveTitle()}
              className="px-1.5 py-0.5 text-sm font-oregon font-semibold bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-600 rounded text-stone-900 dark:text-stone-100 outline-none"
            />
            <button
              type="submit"
              className="p-1 text-emerald-600 hover:text-emerald-700"
              title="Save"
            >
              <Check size={14} />
            </button>
          </form>
        ) : (
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-1.5 px-1.5 sm:px-2 py-1 rounded-lg hover:bg-stone-500/10 transition-colors group text-left cursor-pointer max-w-full"
            title={`Active Workspace: ${currentBoard.title} (${activeCardsCount} ${activeCardsCount === 1 ? 'card' : 'cards'})`}
          >
            <span className="font-oregon font-semibold text-stone-800 dark:text-stone-200 text-xs sm:text-sm max-w-[85px] xs:max-w-[130px] sm:max-w-[180px] md:max-w-none truncate">
              {currentBoard.title}
            </span>
            <span
              title={`${activeCardsCount} ${activeCardsCount === 1 ? 'card' : 'cards'} on this board`}
              className="hidden sm:inline text-[11px] font-mono text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-300"
            >
              ({activeCardsCount} {activeCardsCount === 1 ? 'card' : 'cards'})
            </span>
            <ChevronDown size={13} className="text-stone-400 group-hover:text-stone-700 dark:group-hover:text-stone-200 transition-transform shrink-0" />
          </button>
        )}
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          onWheel={(e) => e.stopPropagation()}
          className="absolute left-0 top-full mt-2 w-64 max-w-[calc(100vw-2rem)] p-2 bg-[#FAF8F5] dark:bg-[#1C1A17] border border-[#E7E0D4] dark:border-[#33302A] rounded-2xl shadow-xl z-50 flex flex-col space-y-1"
        >
          <div className="flex items-center justify-between px-2 py-1 text-[11px] font-mono uppercase tracking-wider text-stone-400 dark:text-stone-500 border-b border-stone-200 dark:border-stone-800">
            <span>Workspaces</span>
            <button
              onClick={() => {
                setEditingTitle(currentBoard.title);
                setIsEditing(true);
                setIsOpen(false);
              }}
              className="flex items-center gap-1 hover:text-stone-800 dark:hover:text-stone-200 text-[10px]"
              title="Rename active board"
            >
              <Edit2 size={10} /> Rename
            </button>
          </div>

          {/* Boards List */}
          <div className="max-h-56 overflow-y-auto space-y-0.5 py-1 scrollbar-thin">
            {boards.map((b) => {
              const count = allCards.filter((c) => c.boardId === b.id).length;
              const isActive = b.id === activeBoardId;
              const isConfirmingDelete = deletingBoardId === b.id;

              return (
                <div
                  key={b.id}
                  onClick={() => {
                    if (isConfirmingDelete) return;
                    switchBoard(b.id);
                    setIsOpen(false);
                    setDeletingBoardId(null);
                  }}
                  className={`group flex items-center justify-between p-2 rounded-xl text-xs cursor-pointer transition-colors ${
                    isActive
                      ? 'bg-stone-800 dark:bg-stone-100 text-stone-100 dark:text-stone-900 font-semibold'
                      : 'hover:bg-stone-200/60 dark:hover:bg-stone-800/60 text-stone-700 dark:text-stone-300'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate min-w-0">
                    <Layout size={13} className="shrink-0" />
                    <span className="font-oregon truncate">{b.title}</span>
                  </div>

                  {isConfirmingDelete ? (
                    <div
                      className="flex items-center gap-1 shrink-0 ml-2 animate-in fade-in duration-100"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span className="text-[10px] text-rose-600 dark:text-rose-500 font-sans font-semibold select-none">
                        Delete?
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          deleteBoard(b.id);
                          setDeletingBoardId(null);
                        }}
                        className="px-2 py-0.5 rounded-md bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold shadow-xs cursor-pointer transition-colors"
                        title={`Confirm delete workspace "${b.title}"`}
                      >
                        Yes
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          setDeletingBoardId(null);
                        }}
                        className={`p-1 rounded-md cursor-pointer transition-colors ${
                          isActive
                            ? 'text-stone-600 hover:text-stone-900 hover:bg-stone-200'
                            : 'text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-200/60 dark:hover:bg-stone-700'
                        }`}
                        title="Cancel"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      <span
                        className="text-[10px] opacity-60 font-mono"
                        title={`${count} ${count === 1 ? 'card' : 'cards'} on this board`}
                      >
                        {count} {count === 1 ? 'card' : 'cards'}
                      </span>
                      {boards.length > 1 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            setDeletingBoardId(b.id);
                          }}
                          className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                            isActive
                              ? 'text-stone-400 hover:text-rose-600 dark:text-stone-500 dark:hover:text-rose-600 hover:bg-rose-100/60 dark:hover:bg-rose-200/60'
                              : 'text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-100/60 dark:hover:bg-rose-950/40'
                          }`}
                          title={`Delete workspace "${b.title}"`}
                          aria-label={`Delete workspace "${b.title}"`}
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Create New Board Form */}
          {isCreating ? (
            <form onSubmit={handleCreateNew} className="pt-1 border-t border-stone-200 dark:border-stone-800">
              <input
                type="text"
                autoFocus
                value={newBoardName}
                onChange={(e) => setNewBoardName(e.target.value)}
                placeholder="Board name..."
                className="w-full text-xs p-1.5 mb-1.5 bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg text-stone-800 dark:text-stone-200 outline-none"
              />
              <div className="flex items-center gap-1">
                <button
                  type="submit"
                  className="flex-1 py-1 bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900 rounded-lg text-xs font-semibold"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-2 py-1 text-xs text-stone-500 hover:text-stone-800 dark:hover:text-stone-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="pt-1 border-t border-stone-200 dark:border-stone-800 space-y-0.5">
              <button
                onClick={() => {
                  setIsCreating(true);
                  setDeletingBoardId(null);
                }}
                className="flex items-center gap-1.5 w-full p-2 text-xs font-medium text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-200/50 dark:hover:bg-stone-800/50 rounded-xl transition-colors"
              >
                <Plus size={13} />
                <span>Create Blank Board</span>
              </button>

              <button
                onClick={() => {
                  setIsOpen(false);
                  if (onOpenModes) {
                    onOpenModes();
                  } else {
                    setIsModeModalOpen(true);
                  }
                }}
                className="flex items-center gap-1.5 w-full p-2 text-xs font-medium text-amber-800 dark:text-amber-300 hover:bg-amber-100/60 dark:hover:bg-amber-950/40 rounded-xl transition-colors"
              >
                <Compass size={13} />
                <span>Start from Mode Template...</span>
              </button>
            </div>
          )}
        </div>
      )}

      <ModeSelectorModal isOpen={isModeModalOpen} onClose={() => setIsModeModalOpen(false)} />
    </div>
  );
};
