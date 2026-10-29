import React from 'react';
import { WorkspaceMode, CardType, CardColor } from '@/types/board';
import {
  Terminal,
  Layout,
  Video,
  PenTool,
  Megaphone,
  Camera,
  Target,
  Building2,
  Music,
  BookOpen,
} from 'lucide-react';

export interface ModeConfig {
  mode: WorkspaceMode;
  name: string;
  badge: string;
  description: string;
  defaultCardType: CardType;
  defaultCardColor: CardColor;
  defaultNoteFont: 'oregon' | 'serif' | 'sans' | 'mono';
  canvasBgClass: string;
  dotColorLight: string;
  dotColorDark: string;
  accentBgClass: string;
  accentTextClass: string;
  accentBorderClass: string;
}

export const WORKSPACE_MODE_CONFIGS: Record<WorkspaceMode, ModeConfig> = {
  developer: {
    mode: 'developer',
    name: 'Developer',
    badge: 'API & DevOps',
    description: 'Code snippets, schema contracts, microservices, and sprint cutovers.',
    defaultCardType: 'code',
    defaultCardColor: 'paper',
    defaultNoteFont: 'mono',
    canvasBgClass: 'bg-[#F6F8FA] dark:bg-[#111317]',
    dotColorLight: '#B0C4DE',
    dotColorDark: '#2C3E50',
    accentBgClass: 'bg-sky-500/10 dark:bg-sky-500/15',
    accentTextClass: 'text-sky-700 dark:text-sky-300',
    accentBorderClass: 'border-sky-300/60 dark:border-sky-700/60',
  },
  designer: {
    mode: 'designer',
    name: 'Designer',
    badge: 'UI/UX & Tokens',
    description: 'Design systems, Pantone swatches, moodboards, and usability sprints.',
    defaultCardType: 'palette',
    defaultCardColor: 'lavender',
    defaultNoteFont: 'sans',
    canvasBgClass: 'bg-[#FAF9F6] dark:bg-[#141416]',
    dotColorLight: '#C8C2D6',
    dotColorDark: '#3A3245',
    accentBgClass: 'bg-emerald-500/10 dark:bg-emerald-500/15',
    accentTextClass: 'text-emerald-700 dark:text-emerald-300',
    accentBorderClass: 'border-emerald-300/60 dark:border-emerald-700/60',
  },
  video_editor: {
    mode: 'video_editor',
    name: 'Video Editor',
    badge: 'Post-Production',
    description: 'B-roll moodboards, sound memos, cutdown schedules, and launch timers.',
    defaultCardType: 'image',
    defaultCardColor: 'amber',
    defaultNoteFont: 'sans',
    canvasBgClass: 'bg-[#FAF7F2] dark:bg-[#121211]',
    dotColorLight: '#D8C9B5',
    dotColorDark: '#3D3528',
    accentBgClass: 'bg-amber-500/10 dark:bg-amber-500/15',
    accentTextClass: 'text-amber-700 dark:text-amber-300',
    accentBorderClass: 'border-amber-300/60 dark:border-amber-700/60',
  },
  graphic_designer: {
    mode: 'graphic_designer',
    name: 'Graphic Designer',
    badge: 'Brand & Print',
    description: 'Packaging die-lines, editorial pullquotes, visual moodboards, and swatches.',
    defaultCardType: 'palette',
    defaultCardColor: 'sage',
    defaultNoteFont: 'serif',
    canvasBgClass: 'bg-[#FAF9F6] dark:bg-[#141416]',
    dotColorLight: '#D0C4DB',
    dotColorDark: '#3C2E47',
    accentBgClass: 'bg-purple-500/10 dark:bg-purple-500/15',
    accentTextClass: 'text-purple-700 dark:text-purple-300',
    accentBorderClass: 'border-purple-300/60 dark:border-purple-700/60',
  },
  marketing: {
    mode: 'marketing',
    name: 'Marketing',
    badge: 'Growth & Campaigns',
    description: 'Campaign timelines, conversion targets, data tables, and launch metrics.',
    defaultCardType: 'countdown',
    defaultCardColor: 'terracotta',
    defaultNoteFont: 'sans',
    canvasBgClass: 'bg-[#FAF8F5] dark:bg-[#131416]',
    dotColorLight: '#D8C6BA',
    dotColorDark: '#3F2C24',
    accentBgClass: 'bg-orange-500/10 dark:bg-orange-500/15',
    accentTextClass: 'text-orange-700 dark:text-orange-300',
    accentBorderClass: 'border-orange-300/60 dark:border-orange-700/60',
  },
  influencer: {
    mode: 'influencer',
    name: 'Creator',
    badge: 'Media & Sponsorships',
    description: 'Sponsor deliverables, multi-platform media boards, and growth metrics.',
    defaultCardType: 'metric',
    defaultCardColor: 'cream',
    defaultNoteFont: 'oregon',
    canvasBgClass: 'bg-[#FCF8F9] dark:bg-[#161114]',
    dotColorLight: '#DDC5CF',
    dotColorDark: '#442834',
    accentBgClass: 'bg-rose-500/10 dark:bg-rose-500/15',
    accentTextClass: 'text-rose-700 dark:text-rose-300',
    accentBorderClass: 'border-rose-300/60 dark:border-rose-700/60',
  },
  product_manager: {
    mode: 'product_manager',
    name: 'Product Manager',
    badge: 'Roadmap & Specs',
    description: 'RICE sprint priority tables, OKR telemetry, user stories, and specs.',
    defaultCardType: 'todo',
    defaultCardColor: 'sky',
    defaultNoteFont: 'sans',
    canvasBgClass: 'bg-[#FAF9F7] dark:bg-[#131416]',
    dotColorLight: '#C6CCE0',
    dotColorDark: '#2B3247',
    accentBgClass: 'bg-indigo-500/10 dark:bg-indigo-500/15',
    accentTextClass: 'text-indigo-700 dark:text-indigo-300',
    accentBorderClass: 'border-indigo-300/60 dark:border-indigo-700/60',
  },
  architect: {
    mode: 'architect',
    name: 'Architect',
    badge: 'Blueprint & Spatial',
    description: 'Engineering schedules, Carrara finish matrices, and spatial drafting.',
    defaultCardType: 'table',
    defaultCardColor: 'sky',
    defaultNoteFont: 'mono',
    canvasBgClass: 'bg-[#F3F8FA] dark:bg-[#0C1319]',
    dotColorLight: '#A8CCD5',
    dotColorDark: '#1E3E47',
    accentBgClass: 'bg-teal-500/10 dark:bg-teal-500/15',
    accentTextClass: 'text-teal-700 dark:text-teal-300',
    accentBorderClass: 'border-teal-300/60 dark:border-teal-700/60',
  },
  music_producer: {
    mode: 'music_producer',
    name: 'Music Producer',
    badge: 'Audio & Signal Flow',
    description: 'Waveform visualizers, analog signal chains, track checklists, and mix notes.',
    defaultCardType: 'audio',
    defaultCardColor: 'lavender',
    defaultNoteFont: 'sans',
    canvasBgClass: 'bg-[#F8F7FC] dark:bg-[#12111A]',
    dotColorLight: '#D2C8E6',
    dotColorDark: '#372B4D',
    accentBgClass: 'bg-violet-500/10 dark:bg-violet-500/15',
    accentTextClass: 'text-violet-700 dark:text-violet-300',
    accentBorderClass: 'border-violet-300/60 dark:border-violet-700/60',
  },
  author: {
    mode: 'author',
    name: 'Author & Writer',
    badge: 'Prose & Manuscript',
    description: 'Literary prose, chapter outlines, character arcs, and pullquote citations.',
    defaultCardType: 'note',
    defaultCardColor: 'paper',
    defaultNoteFont: 'oregon',
    canvasBgClass: 'bg-[#FAF7F0] dark:bg-[#161412]',
    dotColorLight: '#D8CDBE',
    dotColorDark: '#3A3229',
    accentBgClass: 'bg-amber-600/10 dark:bg-amber-600/15',
    accentTextClass: 'text-stone-800 dark:text-amber-200',
    accentBorderClass: 'border-amber-400/50 dark:border-amber-700/50',
  },
};

export const renderModeIcon = (mode: WorkspaceMode, size = 16, className = '') => {
  switch (mode) {
    case 'developer':
      return <Terminal size={size} className={className || 'text-sky-600 dark:text-sky-400'} />;
    case 'designer':
      return <Layout size={size} className={className || 'text-emerald-600 dark:text-emerald-400'} />;
    case 'video_editor':
      return <Video size={size} className={className || 'text-amber-600 dark:text-amber-400'} />;
    case 'graphic_designer':
      return <PenTool size={size} className={className || 'text-purple-600 dark:text-purple-400'} />;
    case 'marketing':
      return <Megaphone size={size} className={className || 'text-orange-600 dark:text-orange-400'} />;
    case 'influencer':
      return <Camera size={size} className={className || 'text-rose-600 dark:text-rose-400'} />;
    case 'product_manager':
      return <Target size={size} className={className || 'text-indigo-600 dark:text-indigo-400'} />;
    case 'architect':
      return <Building2 size={size} className={className || 'text-teal-600 dark:text-teal-400'} />;
    case 'music_producer':
      return <Music size={size} className={className || 'text-violet-600 dark:text-violet-400'} />;
    case 'author':
      return <BookOpen size={size} className={className || 'text-amber-700 dark:text-amber-300'} />;
  }
};
