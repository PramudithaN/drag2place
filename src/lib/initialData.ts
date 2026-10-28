import { Board, Card, Connection } from '@/types/board';

export const DEFAULT_BOARD_ID = 'main-board';

export const INITIAL_BOARDS: Board[] = [
  {
    id: DEFAULT_BOARD_ID,
    title: 'Daily Canvas & Ideas',
    description: 'Personal aesthetic sanctuary for plans, tasks, and notes.',
    theme: 'light',
    pan: { x: 0, y: 0 },
    zoom: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'project-launch',
    title: 'Product Roadmap & Vision',
    description: 'Quarterly milestones and high-level architectural designs.',
    theme: 'light',
    pan: { x: 0, y: 0 },
    zoom: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const INITIAL_CARDS: Card[] = [
  {
    id: 'card-welcome-note',
    boardId: DEFAULT_BOARD_ID,
    type: 'note',
    x: 80,
    y: 90,
    width: 320,
    height: 340,
    zIndex: 1,
    color: 'cream',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    content: {
      title: 'Welcome to your Workspace',
      body: 'A quiet, spatial space inspired by Milanote.\n\n- Drag cards freely anywhere on this infinite canvas.\n- Use the bottom dock to place new ideas, todos, events, and images.\n- Connect cards with visual arrows.\n- Set dates to receive native sound and push reminders.\n\nEnjoy the slow, intentional flow.',
      fontFamily: 'oregon',
      fontSize: 'base',
    },
  },
  {
    id: 'card-launch-todos',
    boardId: DEFAULT_BOARD_ID,
    type: 'todo',
    x: 440,
    y: 90,
    width: 320,
    height: 380,
    zIndex: 2,
    color: 'paper',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    content: {
      title: 'Today & Next Priorities',
      items: [
        { id: '1', text: 'Outline visual design ideas', completed: true, priority: 'high' },
        { id: '2', text: 'Curate warm minimalist palette', completed: true, priority: 'medium' },
        { id: '3', text: 'Schedule weekly planning session', completed: false, priority: 'medium' },
        { id: '4', text: 'Test browser notification alerts', completed: false, priority: 'high' },
        { id: '5', text: 'Review creative project goals', completed: false, priority: 'low' },
      ],
    },
  },
  {
    id: 'card-upcoming-event',
    boardId: DEFAULT_BOARD_ID,
    type: 'event',
    x: 800,
    y: 90,
    width: 300,
    height: 290,
    zIndex: 3,
    color: 'amber',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    content: {
      title: 'Studio Creative Retreat',
      description: 'Deep work and board retrospective with ambient soundscapes.',
      date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
      startTime: '10:00',
      endTime: '13:00',
      location: 'Local Artisan Studio',
      reminderMinutesBefore: 60,
    },
  },
  {
    id: 'card-aesthetic-mood',
    boardId: DEFAULT_BOARD_ID,
    type: 'image',
    x: 440,
    y: 500,
    width: 360,
    height: 320,
    zIndex: 4,
    color: 'sage',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    content: {
      url: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=1000&auto=format&fit=crop',
      caption: 'Calm morning workspace: clean lines, natural wood, warm sun.',
    },
  },
];

export const INITIAL_CONNECTIONS: Connection[] = [
  {
    id: 'conn-1',
    boardId: DEFAULT_BOARD_ID,
    fromCardId: 'card-welcome-note',
    toCardId: 'card-launch-todos',
    style: 'curved',
    label: 'next steps',
  },
];
