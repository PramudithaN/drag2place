'use client';

import React from 'react';
import { EventCardData } from '@/types/board';
import { Calendar, Clock, MapPin, Bell } from 'lucide-react';
import { differenceInCalendarDays, parseISO, isPast } from 'date-fns';

interface EventCardProps {
  cardId: string;
  data: EventCardData;
  onChange: (data: Partial<EventCardData>) => void;
}

export const EventCard: React.FC<EventCardProps> = ({ data, onChange }) => {
  const countdown = React.useMemo(() => {
    if (!data.date) return null;
    try {
      const targetDate = parseISO(data.date);
      const diff = differenceInCalendarDays(targetDate, new Date());

      if (diff === 0) return 'Today';
      if (diff === 1) return 'Tomorrow';
      if (diff > 1) return `In ${diff} days`;
      if (isPast(targetDate)) return 'Past event';
      return null;
    } catch {
      return null;
    }
  }, [data.date]);

  return (
    <div className="flex flex-col h-full space-y-3">
      {/* Countdown pill */}
      {countdown && (
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-sans font-medium bg-stone-800 dark:bg-stone-200 text-stone-100 dark:text-stone-900 shadow-xs">
            <Clock size={11} /> {countdown}
          </span>
          {data.reminderMinutesBefore && (
            <span className="flex items-center gap-1 text-[11px] font-mono text-stone-500 dark:text-stone-400">
              <Bell size={11} className="text-amber-600 dark:text-amber-400" />
              {data.reminderMinutesBefore >= 60
                ? `${data.reminderMinutesBefore / 60}h before`
                : `${data.reminderMinutesBefore}m before`}
            </span>
          )}
        </div>
      )}

      {/* Date & Time selection */}
      <div className="grid grid-cols-2 gap-2">
        <div className="flex items-center gap-1.5 p-1.5 bg-stone-500/5 dark:bg-stone-800/40 rounded-lg border border-stone-200/50 dark:border-stone-700/50">
          <Calendar size={13} className="text-stone-400 shrink-0" />
          <input
            type="date"
            value={data.date || ''}
            onChange={(e) => onChange({ date: e.target.value })}
            className="w-full text-xs bg-transparent outline-none text-stone-800 dark:text-stone-200 font-mono"
          />
        </div>

        <div className="flex items-center gap-1.5 p-1.5 bg-stone-500/5 dark:bg-stone-800/40 rounded-lg border border-stone-200/50 dark:border-stone-700/50">
          <Clock size={13} className="text-stone-400 shrink-0" />
          <input
            type="time"
            value={data.startTime || ''}
            onChange={(e) => onChange({ startTime: e.target.value })}
            className="w-full text-xs bg-transparent outline-none text-stone-800 dark:text-stone-200 font-mono"
          />
        </div>
      </div>

      {/* Location */}
      <div className="flex items-center gap-1.5 p-1.5 bg-stone-500/5 dark:bg-stone-800/40 rounded-lg border border-stone-200/50 dark:border-stone-700/50">
        <MapPin size={13} className="text-stone-400 shrink-0" />
        <input
          type="text"
          value={data.location || ''}
          onChange={(e) => onChange({ location: e.target.value })}
          placeholder="Location or meeting link..."
          className="w-full text-xs bg-transparent outline-none text-stone-800 dark:text-stone-200 placeholder-stone-400 dark:placeholder-stone-500"
        />
      </div>

      {/* Description / Plans */}
      <textarea
        value={data.description || ''}
        onChange={(e) => onChange({ description: e.target.value })}
        placeholder="Add details, itinerary, or agenda..."
        rows={3}
        className="flex-1 w-full bg-transparent resize-none outline-none text-xs text-stone-700 dark:text-stone-300 placeholder-stone-400 dark:placeholder-stone-500 leading-relaxed scrollbar-thin"
      />

      {/* Reminder selector */}
      <div className="pt-2 border-t border-stone-200/50 dark:border-stone-700/50 flex items-center justify-between text-[11px] text-stone-500 dark:text-stone-400">
        <span className="flex items-center gap-1">
          <Bell size={12} /> Reminder:
        </span>
        <select
          value={data.reminderMinutesBefore || 15}
          onChange={(e) => onChange({ reminderMinutesBefore: Number(e.target.value) })}
          className="bg-transparent text-stone-700 dark:text-stone-200 text-[11px] outline-none font-medium cursor-pointer"
        >
          <option value={0} className="bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-200">At event time</option>
          <option value={15} className="bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-200">15 mins before</option>
          <option value={30} className="bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-200">30 mins before</option>
          <option value={60} className="bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-200">1 hour before</option>
          <option value={1440} className="bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-200">1 day before</option>
        </select>
      </div>
    </div>
  );
};
