'use client';

import React from 'react';
import { EventCardData } from '@/types/board';
import { Calendar, Clock, MapPin, Bell, CalendarPlus, Download } from 'lucide-react';
import { differenceInCalendarDays, parseISO, isPast } from 'date-fns';

interface EventCardProps {
  cardId: string;
  data: EventCardData;
  onChange: (data: Partial<EventCardData>) => void;
}

export const EventCard: React.FC<EventCardProps> = ({ cardId, data, onChange }) => {
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

  const handleAddToGoogleCalendar = () => {
    if (!data.date) return;
    const title = data.title || 'Untitled Event';
    const dateFormatted = data.date.replace(/-/g, '');
    let startIso = `${dateFormatted}`;
    let endIso = `${dateFormatted}`;

    if (data.startTime) {
      const timeFormatted = data.startTime.replace(/:/g, '') + '00';
      startIso = `${dateFormatted}T${timeFormatted}`;
      if (data.endTime) {
        const endTimeFormatted = data.endTime.replace(/:/g, '') + '00';
        endIso = `${dateFormatted}T${endTimeFormatted}`;
      } else {
        const [hours, mins] = data.startTime.split(':').map(Number);
        const endHour = (hours + 1) % 24;
        const pad = (n: number) => n.toString().padStart(2, '0');
        endIso = `${dateFormatted}T${pad(endHour)}${pad(mins)}00`;
      }
    }

    const gcalUrl = new URL('https://calendar.google.com/calendar/render');
    gcalUrl.searchParams.set('action', 'TEMPLATE');
    gcalUrl.searchParams.set('text', title);
    gcalUrl.searchParams.set('dates', `${startIso}/${endIso}`);
    if (data.description) gcalUrl.searchParams.set('details', data.description);
    if (data.location) gcalUrl.searchParams.set('location', data.location);

    window.open(gcalUrl.toString(), '_blank', 'noopener,noreferrer');
  };

  const handleDownloadIcs = () => {
    if (!data.date) return;
    const title = data.title || 'Event';
    const dateFormatted = data.date.replace(/-/g, '');
    let dtStart = dateFormatted;
    let dtEnd = dateFormatted;

    if (data.startTime) {
      dtStart = `${dateFormatted}T${data.startTime.replace(/:/g, '')}00`;
      const [hours, mins] = data.startTime.split(':').map(Number);
      const endHour = (hours + 1) % 24;
      const pad = (n: number) => n.toString().padStart(2, '0');
      dtEnd = `${dateFormatted}T${pad(endHour)}${pad(mins)}00`;
    }

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Drag2Place//Spatial Canvas//EN',
      'BEGIN:VEVENT',
      `UID:${cardId}@drag2place.app`,
      `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
      `DTSTART:${dtStart}`,
      `DTEND:${dtEnd}`,
      `SUMMARY:${title.replace(/\n/g, ' ')}`,
      data.description ? `DESCRIPTION:${data.description.replace(/\n/g, '\\n')}` : '',
      data.location ? `LOCATION:${data.location.replace(/\n/g, ' ')}` : '',
      'END:VEVENT',
      'END:VCALENDAR',
    ]
      .filter(Boolean)
      .join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${title.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'event'}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col h-full space-y-3">
      {/* Countdown pill & Actions */}
      <div className="flex items-center justify-between">
        {countdown ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-sans font-medium bg-stone-800 dark:bg-stone-200 text-stone-100 dark:text-stone-900 shadow-xs">
            <Clock size={11} /> {countdown}
          </span>
        ) : (
          <span className="text-[11px] font-mono text-stone-400">Date picker</span>
        )}

        <div className="flex items-center gap-1">
          {data.reminderMinutesBefore && (
            <span className="flex items-center gap-1 text-[11px] font-mono text-stone-500 dark:text-stone-400 mr-1">
              <Bell size={11} className="text-amber-600 dark:text-amber-400" />
              {data.reminderMinutesBefore >= 60
                ? `${data.reminderMinutesBefore / 60}h before`
                : `${data.reminderMinutesBefore}m before`}
            </span>
          )}

          {data.date && (
            <>
              <button
                type="button"
                onClick={handleAddToGoogleCalendar}
                className="p-1 hover:bg-stone-200/60 dark:hover:bg-stone-800 rounded-md text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 transition-colors"
                title="Add to Google Calendar"
              >
                <CalendarPlus size={13} />
              </button>
              <button
                type="button"
                onClick={handleDownloadIcs}
                className="p-1 hover:bg-stone-200/60 dark:hover:bg-stone-800 rounded-md text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 transition-colors"
                title="Download iCal (.ics) file"
              >
                <Download size={13} />
              </button>
            </>
          )}
        </div>
      </div>

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
