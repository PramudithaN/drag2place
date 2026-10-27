'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useBoardStore } from '@/lib/store';
import { ChevronDown, Plus, Trash2, Check, Layout, Edit2 } from 'lucide-react';

export const BoardSwitcher: React.FC = () => {
  const {
    boards,
    activeBoardId,
    currentBoard,
    switchBoard,
    createBoard,
    updateBoardTitle,
    deleteBoard,
    allCards,
    openConfirmModal,
  } = useBoardStore();

  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingTitle, setEditingTitle] = useState(currentBoard.title);
  const [newBoardName, setNewBoardName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setIsCreating(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
            className="flex items-center gap-1 px-1.5 py-0.5 rounded-lg hover:bg-stone-500/10 transition-colors group text-left"
          >
            <span className="font-oregon font-semibold text-stone-800 dark:text-stone-200 text-sm">
              {currentBoard.title}
            </span>
            <span className="text-[11px] font-mono text-stone-400 dark:text-stone-500">
              ({activeCardsCount})
            </span>
            <ChevronDown size={13} className="text-stone-400 group-hover:text-stone-700 dark:group-hover:text-stone-200 transition-transform" />
          </button>
        )}
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-2 w-64 p-2 bg-[#FAF8F5] dark:bg-[#1C1A17] border border-[#E7E0D4] dark:border-[#33302A] rounded-2xl shadow-xl z-50 flex flex-col space-y-1">
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
          <div className="max-h-48 overflow-y-auto space-y-0.5 py-1 scrollbar-thin">
            {boards.map((b) => {
              const count = allCards.filter((c) => c.boardId === b.id).length;
              const isActive = b.id === activeBoardId;
              return (
                <div
                  key={b.id}
                  onClick={() => {
                    switchBoard(b.id);
                    setIsOpen(false);
                  }}
                  className={`group flex items-center justify-between p-2 rounded-xl text-xs cursor-pointer transition-colors ${
                    isActive
                      ? 'bg-stone-800 dark:bg-stone-100 text-stone-100 dark:text-stone-900 font-semibold'
                      : 'hover:bg-stone-200/60 dark:hover:bg-stone-800/60 text-stone-700 dark:text-stone-300'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <Layout size={13} className="shrink-0" />
                    <span className="font-oregon truncate">{b.title}</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    <span className="text-[10px] opacity-60 font-mono">
                      {count}
                    </span>
                    {boards.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openConfirmModal({
                            title: 'Delete Workspace?',
                            message: `Are you sure you want to permanently delete workspace "${b.title}" and its cards?`,
                            confirmText: 'Delete Workspace',
                            isDestructive: true,
                            icon: 'trash',
                            onConfirm: () => deleteBoard(b.id),
                          });
                        }}
                        className={`opacity-0 group-hover:opacity-100 p-0.5 rounded hover:text-rose-500 transition-opacity ${
                          isActive ? 'text-stone-300' : 'text-stone-400'
                        }`}
                        title="Delete board"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
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
            <button
              onClick={() => setIsCreating(true)}
              className="flex items-center gap-1.5 w-full p-2 text-xs font-medium text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-200/50 dark:hover:bg-stone-800/50 rounded-xl transition-colors border-t border-stone-200 dark:border-stone-800"
            >
              <Plus size={13} />
              <span>Create New Board</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
