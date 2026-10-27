export type CardType = 'todo' | 'note' | 'event' | 'image' | 'code' | 'palette' | 'metric' | 'comment' | 'link';

export type CardColor = 
  | 'cream'
  | 'sage'
  | 'terracotta'
  | 'amber'
  | 'lavender'
  | 'sky'
  | 'paper';

export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  dueDate?: string;
  priority?: 'low' | 'medium' | 'high';
}

export interface TodoCardData {
  title: string;
  items: TodoItem[];
}

export interface NoteCardData {
  title: string;
  body: string;
  fontFamily: 'serif' | 'sans' | 'mono' | 'oregon';
  fontSize: 'sm' | 'base' | 'lg';
}

export interface EventCardData {
  title: string;
  description?: string;
  date: string; // ISO date string YYYY-MM-DD
  startTime?: string; // HH:mm
  endTime?: string;
  location?: string;
  reminderMinutesBefore?: number; // e.g. 15, 60, 1440
  notified?: boolean;
}

export interface ImageCardData {
  url: string;
  caption?: string;
  aspectRatio?: number;
  originalName?: string;
}

export interface CodeCardData {
  title: string;
  code: string;
  language: string;
}

export interface SwatchItem {
  id: string;
  name: string;
  hex: string;
  cmyk?: string;
  pantone?: string;
}

export interface PaletteCardData {
  title: string;
  swatches: SwatchItem[];
}

export interface MetricCardData {
  title: string;
  currentValue: number;
  targetValue: number;
  unit?: string;
  subtitle?: string;
}

export interface CommentCardData {
  author: string;
  avatarUrl?: string;
  text: string;
  resolved?: boolean;
  createdAt?: string;
}

export interface LinkCardData {
  url: string;
  title?: string;
  description?: string;
  image?: string;
  favicon?: string;
  siteName?: string;
}

export type CardContent = 
  | TodoCardData 
  | NoteCardData 
  | EventCardData 
  | ImageCardData 
  | CodeCardData 
  | PaletteCardData 
  | MetricCardData
  | CommentCardData
  | LinkCardData;

export interface Card {
  id: string;
  boardId: string;
  type: CardType;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  color: CardColor;
  content: CardContent;
  createdAt: string;
  updatedAt: string;
}

export interface Connection {
  id: string;
  boardId: string;
  fromCardId: string;
  toCardId: string;
  color?: string;
  label?: string;
  style?: 'solid' | 'dashed' | 'curved';
}

export type WorkspaceMode = 
  | 'developer'
  | 'designer'
  | 'video_editor'
  | 'graphic_designer'
  | 'marketing'
  | 'influencer'
  | 'product_manager'
  | 'architect'
  | 'music_producer'
  | 'author';

export interface Board {
  id: string;
  title: string;
  description?: string;
  theme: 'light' | 'dark';
  mode?: WorkspaceMode;
  pan: { x: number; y: number };
  zoom: number;
  createdAt: string;
  updatedAt: string;
}

export interface ViewportTransform {
  x: number;
  y: number;
  zoom: number;
}

export interface ConfirmModalConfig {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  icon?: 'trash' | 'logout' | 'alert';
  onConfirm: () => void;
}
