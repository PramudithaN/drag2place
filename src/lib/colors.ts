import { CardColor } from '@/types/board';

export interface CardColorStyle {
  bg: string;
  border: string;
  accent: string;
}

export const COLOR_CLASSES: Record<CardColor, CardColorStyle> = {
  paper: {
    bg: 'bg-[#FFFFFF] dark:bg-[#1D1B18]',
    border: 'border-[#EBE6DE] dark:border-[#2F2C27]',
    accent: 'text-stone-700 dark:text-stone-300',
  },
  cream: {
    bg: 'bg-[#FBF8F2] dark:bg-[#23201C]',
    border: 'border-[#EAE3D5] dark:border-[#332E27]',
    accent: 'text-stone-800 dark:text-stone-200',
  },
  sage: {
    bg: 'bg-[#F2F6F1] dark:bg-[#1C241D]',
    border: 'border-[#DEE7DD] dark:border-[#29362B]',
    accent: 'text-emerald-900 dark:text-emerald-200',
  },
  terracotta: {
    bg: 'bg-[#FDF3F0] dark:bg-[#281E1C]',
    border: 'border-[#EFE1DC] dark:border-[#3B2925]',
    accent: 'text-orange-950 dark:text-orange-200',
  },
  amber: {
    bg: 'bg-[#FDF6E9] dark:bg-[#28231A]',
    border: 'border-[#EFE5D0] dark:border-[#3C3322]',
    accent: 'text-amber-950 dark:text-amber-200',
  },
  lavender: {
    bg: 'bg-[#F6F3FA] dark:bg-[#241E2B]',
    border: 'border-[#E7E0F1] dark:border-[#382B45]',
    accent: 'text-purple-950 dark:text-purple-200',
  },
  sky: {
    bg: 'bg-[#F1F6FA] dark:bg-[#1B232A]',
    border: 'border-[#D9E6EF] dark:border-[#283745]',
    accent: 'text-sky-950 dark:text-sky-200',
  },
};

export const COLOR_PALETTE: CardColor[] = [
  'paper',
  'cream',
  'sage',
  'terracotta',
  'amber',
  'lavender',
  'sky',
];
