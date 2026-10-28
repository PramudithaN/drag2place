'use client';

import React, { useState, useEffect } from 'react';
import { CountdownCardData } from '@/types/board';
import { Calendar } from 'lucide-react';

interface CountdownCardProps {
  cardId: string;
  data: CountdownCardData;
  onChange: (data: Partial<CountdownCardData>) => void;
}

export const CountdownCard: React.FC<CountdownCardProps> = ({ data, onChange }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isPassed: false,
  });

  const targetDateStr = data.targetDate || '';

  useEffect(() => {
    if (!targetDateStr) return;

    const calculateTime = () => {
      const target = new Date(targetDateStr).getTime();
      const now = Date.now();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isPassed: true });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / 1000 / 60) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeLeft({ days, hours, minutes, seconds, isPassed: false });
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000);
    return () => clearInterval(timer);
  }, [targetDateStr]);

  return (
    <div className="flex flex-col h-full justify-between space-y-3 p-1">
      {/* Countdown Digits */}
      <div className="grid grid-cols-4 gap-1.5 text-center">
        <div className="p-2 rounded-xl bg-stone-500/5 dark:bg-stone-400/5 border border-stone-200/50 dark:border-stone-800/50">
          <span className="block text-2xl font-mono font-bold text-stone-800 dark:text-stone-100">
            {timeLeft.days}
          </span>
          <span className="text-[10px] font-mono text-stone-400 uppercase tracking-wider">Days</span>
        </div>
        <div className="p-2 rounded-xl bg-stone-500/5 dark:bg-stone-400/5 border border-stone-200/50 dark:border-stone-800/50">
          <span className="block text-2xl font-mono font-bold text-stone-800 dark:text-stone-100">
            {timeLeft.hours}
          </span>
          <span className="text-[10px] font-mono text-stone-400 uppercase tracking-wider">Hours</span>
        </div>
        <div className="p-2 rounded-xl bg-stone-500/5 dark:bg-stone-400/5 border border-stone-200/50 dark:border-stone-800/50">
          <span className="block text-2xl font-mono font-bold text-stone-800 dark:text-stone-100">
            {timeLeft.minutes}
          </span>
          <span className="text-[10px] font-mono text-stone-400 uppercase tracking-wider">Mins</span>
        </div>
        <div className="p-2 rounded-xl bg-stone-500/5 dark:bg-stone-400/5 border border-stone-200/50 dark:border-stone-800/50">
          <span className="block text-2xl font-mono font-bold text-amber-600 dark:text-amber-400">
            {timeLeft.seconds}
          </span>
          <span className="text-[10px] font-mono text-stone-400 uppercase tracking-wider">Secs</span>
        </div>
      </div>

      {timeLeft.isPassed && (
        <div className="text-center py-1 rounded-lg bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 font-semibold text-xs animate-pulse">
          🎉 Milestone Reached!
        </div>
      )}

      {/* Target Date Picker & Description */}
      <div className="space-y-1.5 pt-1 border-t border-stone-200/50 dark:border-stone-800/50">
        <div className="flex items-center gap-1.5 px-2 py-1 bg-white/60 dark:bg-stone-800/60 rounded-lg border border-stone-200/60 dark:border-stone-700/60 text-xs">
          <Calendar size={13} className="text-stone-400 shrink-0" />
          <input
            type="datetime-local"
            value={targetDateStr}
            onChange={(e) => onChange({ targetDate: e.target.value })}
            className="w-full bg-transparent border-none outline-none text-stone-700 dark:text-stone-300 font-mono text-xs"
          />
        </div>

        <input
          type="text"
          value={data.description || ''}
          onChange={(e) => onChange({ description: e.target.value })}
          placeholder="Launch event notes or objective..."
          className="w-full text-xs bg-transparent border-none outline-none text-stone-500 dark:text-stone-400 placeholder:text-stone-400 italic"
        />
      </div>
    </div>
  );
};
