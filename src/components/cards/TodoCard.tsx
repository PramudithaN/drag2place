'use client';

import React, { useState } from 'react';
import { TodoCardData, TodoItem } from '@/types/board';
import { Plus, Trash2, CheckCircle2, Circle } from 'lucide-react';
import { soundFx } from '@/lib/sound';
import confetti from 'canvas-confetti';

interface TodoCardProps {
  cardId: string;
  data: TodoCardData;
  onChange: (data: Partial<TodoCardData>) => void;
}

export const TodoCard: React.FC<TodoCardProps> = ({ data, onChange }) => {
  const [newItemText, setNewItemText] = useState('');

  const items = data.items || [];
  const completedCount = items.filter((i) => i.completed).length;
  const progressPercent = items.length > 0 ? Math.round((completedCount / items.length) * 100) : 0;

  const toggleItem = (itemId: string) => {
    const nextItems = items.map((item) => {
      if (item.id === itemId) {
        const nextState = !item.completed;
        if (nextState) {
          soundFx.playCheck();
        }
        return { ...item, completed: nextState };
      }
      return item;
    });

    onChange({ items: nextItems });

    const allDone = nextItems.length > 0 && nextItems.every((i) => i.completed);
    if (allDone) {
      soundFx.playChime();
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#D4A373', '#CCD5AE', '#E9EDC9', '#FAEDCD'],
      });
    }
  };

  const addItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemText.trim()) return;

    const newItem: TodoItem = {
      id: Math.random().toString(36).substring(2, 7),
      text: newItemText.trim(),
      completed: false,
    };

    soundFx.playDrop();
    onChange({ items: [...items, newItem] });
    setNewItemText('');
  };

  const removeItem = (itemId: string) => {
    onChange({ items: items.filter((i) => i.id !== itemId) });
  };

  const updateItemText = (itemId: string, text: string) => {
    onChange({
      items: items.map((i) => (i.id === itemId ? { ...i, text } : i)),
    });
  };

  return (
    <div className="flex flex-col h-full space-y-3">
      {/* Progress header */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 font-mono">
          <span>{completedCount} of {items.length} completed</span>
          <span>{progressPercent}%</span>
        </div>
        <div className="w-full h-1.5 bg-stone-200/70 dark:bg-stone-700/70 rounded-full overflow-hidden">
          <div
            className="h-full bg-stone-700 dark:bg-stone-200 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Todo items list */}
      <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 max-h-[360px] scrollbar-thin">
        {items.map((item) => (
          <div
            key={item.id}
            className="group flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-stone-500/5 dark:hover:bg-stone-400/10 transition-colors"
          >
            <button
              onClick={() => toggleItem(item.id)}
              className="flex-shrink-0 text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 transition-colors"
            >
              {item.completed ? (
                <CheckCircle2 size={17} className="text-stone-700 dark:text-stone-200 fill-stone-200 dark:fill-stone-700" />
              ) : (
                <Circle size={17} />
              )}
            </button>

            <input
              type="text"
              value={item.text}
              onChange={(e) => updateItemText(item.id, e.target.value)}
              className={`flex-1 text-sm bg-transparent outline-none transition-all ${
                item.completed
                  ? 'line-through text-stone-400 dark:text-stone-500 italic'
                  : 'text-stone-800 dark:text-stone-200'
              }`}
            />

            <button
              onClick={() => removeItem(item.id)}
              className="opacity-0 group-hover:opacity-100 p-1 text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 transition-opacity"
              title="Delete item"
            >
              <Trash2 size={13} />
            </button>
          </div>
        ))}
      </div>

      {/* Add new task input */}
      <form onSubmit={addItem} className="flex items-center gap-1.5 pt-2 border-t border-stone-200/60 dark:border-stone-700/60">
        <Plus size={15} className="text-stone-400 ml-1" />
        <input
          type="text"
          value={newItemText}
          onChange={(e) => setNewItemText(e.target.value)}
          placeholder="Add a task (press enter)..."
          className="flex-1 text-xs bg-transparent py-1 text-stone-800 dark:text-stone-200 placeholder-stone-400 dark:placeholder-stone-500 outline-none"
        />
      </form>
    </div>
  );
};
