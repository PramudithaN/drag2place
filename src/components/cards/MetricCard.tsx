'use client';

import React from 'react';
import { MetricCardData } from '@/types/board';
import { soundFx } from '@/lib/sound';
import { TrendingUp, Plus, Minus } from 'lucide-react';

interface MetricCardProps {
  cardId: string;
  data: MetricCardData;
  onChange: (data: MetricCardData) => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({ data, onChange }) => {
  const current = data.currentValue ?? 0;
  const target = data.targetValue || 1;
  const percentage = Math.min(100, Math.max(0, Math.round((current / target) * 100)));

  const handleAdjust = (delta: number) => {
    soundFx.playCheck();
    onChange({
      ...data,
      currentValue: Math.max(0, current + delta),
    });
  };

  return (
    <div className="flex flex-col h-full justify-between font-sans p-1">
      {/* Title & Subtitle */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <input
            type="text"
            value={data.title}
            onChange={(e) => onChange({ ...data, title: e.target.value })}
            placeholder="Metric Goal..."
            className="text-base font-oregon font-bold text-stone-900 dark:text-stone-100 bg-transparent border-none focus:outline-hidden truncate w-full"
          />
          <div className="p-1 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-500 shrink-0">
            <TrendingUp size={14} />
          </div>
        </div>

        <input
          type="text"
          value={data.subtitle || ''}
          onChange={(e) => onChange({ ...data, subtitle: e.target.value })}
          placeholder="Subtitle / Description..."
          className="text-xs text-stone-500 dark:text-stone-400 bg-transparent border-none focus:outline-hidden w-full truncate"
        />
      </div>

      {/* Main Counter Display */}
      <div className="my-auto py-2">
        <div className="flex items-baseline gap-2">
          <input
            type="number"
            value={current}
            onChange={(e) => onChange({ ...data, currentValue: Number(e.target.value) || 0 })}
            className="text-4xl font-mono font-bold text-stone-900 dark:text-stone-100 bg-transparent border-none focus:outline-hidden w-28"
          />
          <div className="text-sm font-mono text-stone-400 dark:text-stone-500">
            /
            <input
              type="number"
              value={target}
              onChange={(e) => onChange({ ...data, targetValue: Number(e.target.value) || 1 })}
              className="ml-1 w-20 text-sm font-mono text-stone-500 bg-transparent border-none focus:outline-hidden"
              title="Target Goal"
            />
          </div>
          {data.unit && (
            <span className="text-xs font-mono uppercase tracking-wider text-stone-400">
              {data.unit}
            </span>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mt-3 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-mono text-stone-500">
            <span>Progress</span>
            <span className="font-semibold text-stone-800 dark:text-stone-200">{percentage}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-stone-200 dark:bg-stone-800 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                percentage >= 100
                  ? 'bg-emerald-500'
                  : percentage >= 50
                  ? 'bg-amber-500'
                  : 'bg-sky-500'
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Quick Adjustment Buttons */}
      <div className="pt-2 border-t border-stone-200/60 dark:border-stone-800/60 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => handleAdjust(-10)}
            className="px-2 py-1 rounded-md text-[11px] font-mono text-stone-600 dark:text-stone-400 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 transition-colors"
            title="Subtract 10"
          >
            -10
          </button>
          <button
            type="button"
            onClick={() => handleAdjust(-1)}
            className="p-1 rounded-md text-stone-600 dark:text-stone-400 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 transition-colors"
            title="Subtract 1"
          >
            <Minus size={13} />
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => handleAdjust(1)}
            className="p-1 rounded-md text-stone-800 dark:text-stone-200 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 transition-colors font-medium"
            title="Add 1"
          >
            <Plus size={13} />
          </button>
          <button
            type="button"
            onClick={() => handleAdjust(10)}
            className="px-2 py-1 rounded-md text-[11px] font-mono text-stone-800 dark:text-stone-200 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 transition-colors font-medium"
            title="Add 10"
          >
            +10
          </button>
        </div>
      </div>
    </div>
  );
};
