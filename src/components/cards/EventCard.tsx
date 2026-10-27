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
  const [countdown, setCountdown] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!data.date) {
      setCountdown(null);
      return;
    }
    try {
      const targetDate = parseISO(data.date);
      const diff = differenceInCalendarDays(targetDate, new Date());

      if (diff === 0) setCountdown('Today ✨');
      else if (diff === 1) setCountdown('Tomorrow');
      else if (diff > 1) setCountdown(`In ${diff} days`);
      else if (isPast(targetDate)) setCountdown('Past event');
      else setCountdown(null);
    } catch {
      setCountdown(null);
    }
  }, [data.date]);

  return (
    <div className="flex flex-col h-full space-y-3">
      {/* Countdown pill */}
      {countdown && (
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-sans font-medium bg-stone-800 text-stone-100 shadow-xs">
            <Clock size={11} /> {countdown}
          </span>
          {data.reminderMinutesBefore && (
            <span className="flex items-center gap-1 text-[11px] font-mono text-stone-500">
              <Bell size={11} className="text-amber-600" />
              {data.reminderMinutesBefore >= 60
                ? `${data.reminderMinutesBefore / 60}h before`
                : `${data.reminderMinutesBefore}m before`}
            </span>
          )}
        </div>
      )}

      {/* Date & Time selection */}
      <div className="grid grid-cols-2 gap-2">
        <div className="flex items-center gap-1.5 p-1.5 bg-stone-500/5 rounded-lg border border-stone-200/50">
          <Calendar size={13} className="text-stone-400" />
          <input
            type="date"
            value={data.date || ''}
            onChange={(e) => onChange({ date: e.target.value })}
            className="w-full text-xs bg-transparent outline-none text-stone-800 font-mono"
          />
        </div>

        <div className="flex items-center gap-1.5 p-1.5 bg-stone-500/5 rounded-lg border border-stone-200/50">
          <Clock size={13} className="text-stone-400" />
          <input
            type="time"
            value={data.startTime || ''}
            onChange={(e) => onChange({ startTime: e.target.value })}
            className="w-full text-xs bg-transparent outline-none text-stone-800 font-mono"
          />
        </div>
      </div>

      {/* Location */}
      <div className="flex items-center gap-1.5 p-1.5 bg-stone-500/5 rounded-lg border border-stone-200/50">
        <MapPin size={13} className="text-stone-400 shrink-0" />
        <input
          type="text"
          value={data.location || ''}
          onChange={(e) => onChange({ location: e.target.value })}
          placeholder="Location or meeting link..."
          className="w-full text-xs bg-transparent outline-none text-stone-800 placeholder-stone-400"
        />
      </div>

      {/* Description / Plans */}
      <textarea
        value={data.description || ''}
        onChange={(e) => onChange({ description: e.target.value })}
        placeholder="Add details, itinerary, or agenda..."
        rows={3}
        className="flex-1 w-full bg-transparent resize-none outline-none text-xs text-stone-700 placeholder-stone-400 leading-relaxed scrollbar-thin"
      />

      {/* Reminder selector */}
      <div className="pt-2 border-t border-stone-200/50 flex items-center justify-between text-[11px] text-stone-500">
        <span className="flex items-center gap-1">
          <Bell size={12} /> Reminder:
        </span>
        <select
          value={data.reminderMinutesBefore || 15}
          onChange={(e) => onChange({ reminderMinutesBefore: Number(e.target.value) })}
          className="bg-transparent text-stone-700 text-[11px] outline-none font-medium cursor-pointer"
        >
          <option value={0}>At event time</option>
          <option value={15}>15 mins before</option>
          <option value={30}>30 mins before</option>
          <option value={60}>1 hour before</option>
          <option value={1440}>1 day before</option>
        </select>
      </div>
    </div>
  );
};
