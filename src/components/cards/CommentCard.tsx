'use client';

import React from 'react';
import { CommentCardData } from '@/types/board';
import { CheckCircle2, Circle, MessageSquare, Clock } from 'lucide-react';
import { soundFx } from '@/lib/sound';

interface CommentCardProps {
  cardId: string;
  data: CommentCardData;
  onChange: (data: CommentCardData) => void;
}

export const CommentCard: React.FC<CommentCardProps> = ({ data, onChange }) => {
  const isResolved = data.resolved || false;

  const handleToggleResolve = () => {
    soundFx.playCheck();
    onChange({
      ...data,
      resolved: !isResolved,
    });
  };

  return (
    <div className={`flex flex-col h-full justify-between font-sans transition-opacity ${isResolved ? 'opacity-70' : 'opacity-100'}`}>
      {/* Author & Status Header */}
      <div>
        <div className="flex items-center justify-between pb-2 border-b border-stone-200/70 dark:border-stone-800/70">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-amber-200/80 dark:bg-amber-800/60 text-amber-900 dark:text-amber-100 flex items-center justify-center text-[11px] font-bold font-oregon shrink-0 shadow-2xs">
              {(data.author || 'U').charAt(0).toUpperCase()}
            </div>
            <input
              type="text"
              value={data.author}
              onChange={(e) => onChange({ ...data, author: e.target.value })}
              placeholder="Your Name..."
              className="text-xs font-semibold text-stone-800 dark:text-stone-200 bg-transparent border-none focus:outline-hidden truncate w-28"
            />
          </div>

          <button
            type="button"
            onClick={handleToggleResolve}
            className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-sans font-medium transition-colors ${
              isResolved
                ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                : 'bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-400'
            }`}
            title={isResolved ? 'Mark as active' : 'Mark as resolved'}
          >
            {isResolved ? (
              <>
                <CheckCircle2 size={11} className="text-emerald-600 dark:text-emerald-400" />
                <span>Resolved</span>
              </>
            ) : (
              <>
                <Circle size={11} />
                <span>Active</span>
              </>
            )}
          </button>
        </div>

        {/* Comment Text */}
        <div className="pt-2.5">
          <textarea
            value={data.text}
            onChange={(e) => onChange({ ...data, text: e.target.value })}
            placeholder="Type your comment, feedback, or review note on this area..."
            className={`w-full bg-transparent text-xs text-stone-800 dark:text-stone-200 placeholder-stone-400 border-none resize-none focus:outline-hidden leading-relaxed ${
              isResolved ? 'line-through text-stone-400 dark:text-stone-500' : ''
            }`}
            rows={5}
          />
        </div>
      </div>

      {/* Footer Timestamp */}
      <div className="pt-2 border-t border-stone-200/60 dark:border-stone-800/60 flex items-center justify-between text-[10px] font-mono text-stone-400">
        <div className="flex items-center gap-1">
          <MessageSquare size={10} />
          <span>Canvas Comment</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock size={10} />
          <span>{data.createdAt ? new Date(data.createdAt).toLocaleDateString() : 'Just now'}</span>
        </div>
      </div>
    </div>
  );
};
