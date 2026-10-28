'use client';

import React, { useState, useRef, useEffect } from 'react';
import { AudioCardData } from '@/types/board';
import { Play, Pause, Volume2, Music } from 'lucide-react';

interface AudioCardProps {
  cardId: string;
  data: AudioCardData;
  onChange: (data: Partial<AudioCardData>) => void;
}

export const AudioCard: React.FC<AudioCardProps> = ({ data, onChange }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const duration = data.duration || 184; // 3:04 default

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= duration) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, duration]);

  const togglePlay = () => {
    if (data.url) {
      if (!audioRef.current) {
        audioRef.current = new Audio(data.url);
        audioRef.current.onended = () => {
          setIsPlaying(false);
          setCurrentTime(0);
        };
      }
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(() => {
          // If browser blocks audio without user interaction
        });
      }
    }
    setIsPlaying(!isPlaying);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Generate a procedural soundwave pattern
  const waveHeights = [24, 45, 68, 30, 85, 95, 40, 70, 50, 90, 100, 65, 45, 78, 60, 35, 80, 55, 30, 70, 92, 48, 64, 30];

  return (
    <div className="flex flex-col h-full justify-between space-y-3 p-1">
      {/* Track & Artist Info */}
      <div className="flex items-center gap-2.5">
        <div className="w-10 h-10 rounded-xl bg-amber-500/15 dark:bg-amber-400/15 border border-amber-500/30 flex items-center justify-center text-amber-700 dark:text-amber-400 shrink-0 shadow-xs">
          <Music size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <input
            type="text"
            value={data.title}
            onChange={(e) => onChange({ title: e.target.value })}
            placeholder="Track title..."
            className="w-full text-xs font-semibold bg-transparent border-none outline-none text-stone-800 dark:text-stone-100 truncate"
          />
          <input
            type="text"
            value={data.artist || ''}
            onChange={(e) => onChange({ artist: e.target.value })}
            placeholder="Artist / Producer..."
            className="w-full text-[11px] font-mono bg-transparent border-none outline-none text-stone-500 dark:text-stone-400 truncate"
          />
        </div>
      </div>

      {/* Simulated Audio Waveform Visualizer */}
      <div className="flex items-end justify-between gap-1 h-14 px-2 py-1 bg-stone-500/5 dark:bg-stone-400/5 rounded-xl border border-stone-200/50 dark:border-stone-800/50">
        {waveHeights.map((h, i) => {
          const isActive = (i / waveHeights.length) <= (currentTime / duration);
          return (
            <div
              key={i}
              style={{ height: `${h}%` }}
              className={`w-1 rounded-full transition-all duration-150 ${
                isActive
                  ? 'bg-amber-600 dark:bg-amber-400'
                  : 'bg-stone-300 dark:bg-stone-700'
              } ${isPlaying ? 'animate-pulse' : ''}`}
            />
          );
        })}
      </div>

      {/* Controls & Scrubber */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[11px] font-mono text-stone-500 dark:text-stone-400">
          <span>{formatTime(currentTime)}</span>
          <div className="flex items-center gap-1">
            <Volume2 size={12} className="text-stone-400" />
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={togglePlay}
            className="w-8 h-8 rounded-full bg-amber-600 hover:bg-amber-700 text-white flex items-center justify-center shadow-md active:scale-95 transition-all cursor-pointer shrink-0"
            title={isPlaying ? 'Pause Audio' : 'Play Audio'}
          >
            {isPlaying ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
          </button>

          <input
            type="text"
            value={data.url}
            onChange={(e) => onChange({ url: e.target.value })}
            placeholder="Audio URL (.mp3 or stream)..."
            className="flex-1 px-2 py-1 text-[11px] font-mono bg-stone-100 dark:bg-stone-800/60 rounded-lg border border-stone-200/60 dark:border-stone-700/60 outline-none text-stone-700 dark:text-stone-300 placeholder:text-stone-400"
          />
        </div>
      </div>
    </div>
  );
};
