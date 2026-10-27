import { create } from 'zustand';
import { Card, Connection, Board, CardType, CardColor, CardContent, EventCardData } from '@/types/board';
import { soundFx } from './sound';
import { notificationService } from './notifications';
import { getSupabase } from './supabase/client';

interface BoardState {
  boards: Board[];
  activeBoardId: string;
  currentBoard: Board;
  allCards: Card[];
  allConnections: Connection[];
  selectedCardIds: string[];
  activeTool: 'select' | 'connect' | 'pan';
  connectingFromCardId: string | null;
  snapToGrid: boolean;
  soundEnabled: boolean;
  theme: 'light' | 'dark';
  
  // Board getters for active board
  getActiveCards: () => Card[];
  getActiveConnections: () => Connection[];

  // Board operations
  switchBoard: (boardId: string) => void;
  createBoard: (title: string, description?: string) => Board;
  updateBoardTitle: (boardId: string, title: string) => void;
  deleteBoard: (boardId: string) => void;

  // Theme actions
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;

  // Viewport actions
  setPan: (pan: { x: number; y: number }) => void;
  setZoom: (zoom: number) => void;
  resetView: () => void;
  jumpToCard: (cardId: string) => void;
  setSnapToGrid: (snap: boolean) => void;
  setSoundEnabled: (enabled: boolean) => void;
  
  // Tool & selection
  setActiveTool: (tool: 'select' | 'connect' | 'pan') => void;
  setSelectedCards: (ids: string[]) => void;
  selectCard: (id: string, multi?: boolean) => void;
  clearSelection: () => void;
  
  // Card operations
  addCard: (type: CardType, position?: { x: number; y: number }) => Card;
  updateCardPosition: (id: string, x: number, y: number) => void;
  updateCardSize: (id: string, width: number, height: number) => void;
  updateCardContent: (id: string, content: Partial<CardContent>) => void;
  updateCardColor: (id: string, color: CardColor) => void;
  bringToFront: (id: string) => void;
  deleteCard: (id: string) => void;
  
  // Connection operations
  startConnecting: (cardId: string) => void;
  finishConnecting: (toCardId: string) => void;
  cancelConnecting: () => void;
  deleteConnection: (id: string) => void;
  
  // Sync, Export & Import
  loadBoard: () => void;
  saveBoardLocally: () => void;
  syncWithSupabase: () => Promise<void>;
  checkReminders: () => void;
  exportWorkspaceJson: () => string;
  importWorkspaceJson: (jsonString: string) => boolean;
}

const DEFAULT_BOARD_ID = 'main-board';

const INITIAL_BOARDS: Board[] = [
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

const INITIAL_CARDS: Card[] = [
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

const INITIAL_CONNECTIONS: Connection[] = [
  {
    id: 'conn-1',
    boardId: DEFAULT_BOARD_ID,
    fromCardId: 'card-welcome-note',
    toCardId: 'card-launch-todos',
    style: 'curved',
    label: 'next steps',
  },
];

export const useBoardStore = create<BoardState>((set, get) => ({
  boards: INITIAL_BOARDS,
  activeBoardId: DEFAULT_BOARD_ID,
  currentBoard: INITIAL_BOARDS[0],
  allCards: INITIAL_CARDS,
  allConnections: INITIAL_CONNECTIONS,
  selectedCardIds: [],
  activeTool: 'select',
  connectingFromCardId: null,
  snapToGrid: false,
  soundEnabled: true,
  theme: 'light',

  getActiveCards: () => {
    const { allCards, activeBoardId } = get();
    return (allCards || []).filter((c) => c.boardId === activeBoardId);
  },

  getActiveConnections: () => {
    const { allConnections, activeBoardId } = get();
    return (allConnections || []).filter((c) => c.boardId === activeBoardId);
  },

  switchBoard: (boardId: string) => {
    const { boards, currentBoard } = get();
    // Save current pan & zoom to the board model
    const updatedBoards = boards.map((b) => (b.id === currentBoard.id ? currentBoard : b));
    const targetBoard = updatedBoards.find((b) => b.id === boardId) || updatedBoards[0];

    soundFx.playDrop();
    set({
      boards: updatedBoards,
      activeBoardId: targetBoard.id,
      currentBoard: targetBoard,
      selectedCardIds: [],
      connectingFromCardId: null,
      activeTool: 'select',
    });
    get().saveBoardLocally();
  },

  createBoard: (title: string, description = '') => {
    const newBoard: Board = {
      id: `board-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title,
      description,
      theme: get().theme,
      pan: { x: 0, y: 0 },
      zoom: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    soundFx.playCheck();
    set((state) => ({
      boards: [...state.boards, newBoard],
      activeBoardId: newBoard.id,
      currentBoard: newBoard,
      selectedCardIds: [],
    }));

    get().saveBoardLocally();
    return newBoard;
  },

  updateBoardTitle: (boardId: string, title: string) => {
    set((state) => {
      const updatedBoards = state.boards.map((b) =>
        b.id === boardId ? { ...b, title, updatedAt: new Date().toISOString() } : b
      );
      const updatedCurrent = state.currentBoard.id === boardId ? { ...state.currentBoard, title } : state.currentBoard;
      return { boards: updatedBoards, currentBoard: updatedCurrent };
    });
    get().saveBoardLocally();
  },

  deleteBoard: (boardId: string) => {
    const { boards, activeBoardId } = get();
    if (boards.length <= 1) return; // Keep at least one board

    const remainingBoards = boards.filter((b) => b.id !== boardId);
    const nextActive = activeBoardId === boardId ? remainingBoards[0] : get().currentBoard;

    soundFx.playDrop();
    set((state) => ({
      boards: remainingBoards,
      activeBoardId: nextActive.id,
      currentBoard: nextActive,
      allCards: state.allCards.filter((c) => c.boardId !== boardId),
      allConnections: state.allConnections.filter((conn) => conn.boardId !== boardId),
    }));
    get().saveBoardLocally();
  },

  toggleTheme: () => {
    const nextTheme = get().theme === 'light' ? 'dark' : 'light';
    get().setTheme(nextTheme);
  },

  setTheme: (theme) => {
    if (typeof document !== 'undefined') {
      if (theme === "dark") { document.documentElement.classList.add("dark"); } else { document.documentElement.classList.remove("dark"); }
    }
    set((state) => ({
      theme,
      currentBoard: { ...state.currentBoard, theme },
    }));
    get().saveBoardLocally();
  },

  setPan: (pan) =>
    set((state) => {
      const nextBoard = { ...state.currentBoard, pan };
      return { currentBoard: nextBoard };
    }),

  setZoom: (zoom) =>
    set((state) => {
      const clamped = Math.min(Math.max(zoom, 0.25), 2.5);
      return { currentBoard: { ...state.currentBoard, zoom: clamped } };
    }),

  resetView: () =>
    set((state) => ({
      currentBoard: { ...state.currentBoard, pan: { x: 0, y: 0 }, zoom: 1 },
    })),

  jumpToCard: (cardId: string) => {
    const card = get().allCards.find((c) => c.id === cardId);
    if (!card) return;

    if (card.boardId !== get().activeBoardId) {
      get().switchBoard(card.boardId);
    }

    // Center card in the viewport
    const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;
    const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 800;

    const targetPanX = viewportWidth / 2 - (card.x + card.width / 2);
    const targetPanY = viewportHeight / 2 - (card.y + card.height / 2);

    soundFx.playDrop();
    set((state) => ({
      currentBoard: { ...state.currentBoard, pan: { x: targetPanX, y: targetPanY }, zoom: 1 },
      selectedCardIds: [cardId],
    }));
  },

  setSnapToGrid: (snapToGrid) => set({ snapToGrid }),

  setSoundEnabled: (enabled) => {
    soundFx.enabled = enabled;
    set({ soundEnabled: enabled });
  },

  setActiveTool: (activeTool) => {
    if (activeTool !== 'connect') {
      set({ connectingFromCardId: null });
    }
    set({ activeTool });
  },

  setSelectedCards: (selectedCardIds) => set({ selectedCardIds }),

  selectCard: (id, multi = false) =>
    set((state) => {
      if (multi) {
        const exists = state.selectedCardIds.includes(id);
        return {
          selectedCardIds: exists
            ? state.selectedCardIds.filter((cid) => cid !== id)
            : [...state.selectedCardIds, id],
        };
      }
      return { selectedCardIds: [id] };
    }),

  clearSelection: () => set({ selectedCardIds: [] }),

  addCard: (type: CardType, position?: { x: number; y: number }) => {
    const { currentBoard, allCards, activeBoardId } = get();
    const highestZ = allCards.reduce((max, c) => Math.max(max, c.zIndex), 0);

    const posX = position ? position.x : -currentBoard.pan.x + 250;
    const posY = position ? position.y : -currentBoard.pan.y + 150;

    const defaultColors: Record<CardType, CardColor> = {
      todo: 'paper',
      note: 'cream',
      event: 'amber',
      image: 'sage',
    };

    let initialContent: CardContent;

    if (type === 'todo') {
      initialContent = {
        title: 'New Checklist',
        items: [
          { id: Math.random().toString(36).substring(2, 7), text: 'First task', completed: false },
        ],
      };
    } else if (type === 'event') {
      initialContent = {
        title: 'New Event',
        date: new Date().toISOString().split('T')[0],
        startTime: '12:00',
        reminderMinutesBefore: 15,
      };
    } else if (type === 'image') {
      initialContent = {
        url: 'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?q=80&w=1000&auto=format&fit=crop',
        caption: 'Aesthetic moodboard item',
      };
    } else {
      initialContent = {
        title: 'Fresh Thought',
        body: 'Write thoughts, inspirations, or notes...',
        fontFamily: 'oregon',
        fontSize: 'base',
      };
    }

    const newCard: Card = {
      id: `card-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      boardId: activeBoardId,
      type,
      x: posX,
      y: posY,
      width: type === 'image' ? 340 : 300,
      height: type === 'event' ? 280 : 320,
      zIndex: highestZ + 1,
      color: defaultColors[type],
      content: initialContent,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    soundFx.playDrop();

    set((state) => ({
      allCards: [...state.allCards, newCard],
      selectedCardIds: [newCard.id],
    }));

    get().saveBoardLocally();
    return newCard;
  },

  updateCardPosition: (id, x, y) =>
    set((state) => {
      let finalX = x;
      let finalY = y;

      if (state.snapToGrid) {
        const GRID_SIZE = 20;
        finalX = Math.round(x / GRID_SIZE) * GRID_SIZE;
        finalY = Math.round(y / GRID_SIZE) * GRID_SIZE;
      }

      return {
        allCards: state.allCards.map((c) =>
          c.id === id ? { ...c, x: finalX, y: finalY, updatedAt: new Date().toISOString() } : c
        ),
      };
    }),

  updateCardSize: (id, width, height) =>
    set((state) => ({
      allCards: state.allCards.map((c) =>
        c.id === id
          ? {
              ...c,
              width: Math.max(220, width),
              height: Math.max(160, height),
              updatedAt: new Date().toISOString(),
            }
          : c
      ),
    })),

  updateCardContent: (id, partialContent) =>
    set((state) => ({
      allCards: state.allCards.map((c) =>
        c.id === id
          ? {
              ...c,
              content: { ...c.content, ...partialContent } as CardContent,
              updatedAt: new Date().toISOString(),
            }
          : c
      ),
    })),

  updateCardColor: (id, color) =>
    set((state) => ({
      allCards: state.allCards.map((c) =>
        c.id === id ? { ...c, color, updatedAt: new Date().toISOString() } : c
      ),
    })),

  bringToFront: (id) =>
    set((state) => {
      const highestZ = state.allCards.reduce((max, c) => Math.max(max, c.zIndex), 0);
      return {
        allCards: state.allCards.map((c) => (c.id === id ? { ...c, zIndex: highestZ + 1 } : c)),
      };
    }),

  deleteCard: (id) => {
    soundFx.playDrop();
    set((state) => ({
      allCards: state.allCards.filter((c) => c.id !== id),
      allConnections: state.allConnections.filter((conn) => conn.fromCardId !== id && conn.toCardId !== id),
      selectedCardIds: state.selectedCardIds.filter((cid) => cid !== id),
    }));
    get().saveBoardLocally();
  },

  startConnecting: (cardId) => {
    set({
      activeTool: 'connect',
      connectingFromCardId: cardId,
    });
  },

  finishConnecting: (toCardId) => {
    const { connectingFromCardId, allConnections, activeBoardId } = get();
    if (!connectingFromCardId || connectingFromCardId === toCardId) {
      set({ connectingFromCardId: null, activeTool: 'select' });
      return;
    }

    const alreadyConnected = allConnections.some(
      (c) =>
        (c.fromCardId === connectingFromCardId && c.toCardId === toCardId) ||
        (c.fromCardId === toCardId && c.toCardId === connectingFromCardId)
    );

    if (!alreadyConnected) {
      const newConn: Connection = {
        id: `conn-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        boardId: activeBoardId,
        fromCardId: connectingFromCardId,
        toCardId,
        style: 'curved',
      };
      soundFx.playCheck();
      set((state) => ({
        allConnections: [...state.allConnections, newConn],
        connectingFromCardId: null,
        activeTool: 'select',
      }));
      get().saveBoardLocally();
    } else {
      set({ connectingFromCardId: null, activeTool: 'select' });
    }
  },

  cancelConnecting: () => {
    set({ connectingFromCardId: null, activeTool: 'select' });
  },

  deleteConnection: (id) => {
    set((state) => ({
      allConnections: state.allConnections.filter((c) => c.id !== id),
    }));
    get().saveBoardLocally();
  },

  loadBoard: () => {
    if (typeof window === 'undefined') return;
    try {
      const savedCards = localStorage.getItem('drag2place_cards');
      const savedConnections = localStorage.getItem('drag2place_connections');
      const savedBoards = localStorage.getItem('drag2place_boards');
      const savedActiveBoardId = localStorage.getItem('drag2place_active_board_id');
      const savedTheme = localStorage.getItem('drag2place_theme') as 'light' | 'dark' | null;

      let boardsList = INITIAL_BOARDS;
      if (savedBoards) {
        boardsList = JSON.parse(savedBoards);
        set({ boards: boardsList });
      }

      const activeId = savedActiveBoardId && boardsList.some((b) => b.id === savedActiveBoardId)
        ? savedActiveBoardId
        : boardsList[0].id;

      const current = boardsList.find((b) => b.id === activeId) || boardsList[0];

      if (savedCards) {
        set({ allCards: JSON.parse(savedCards) });
      }
      if (savedConnections) {
        set({ allConnections: JSON.parse(savedConnections) });
      }

      set({
        activeBoardId: activeId,
        currentBoard: current,
      });

      if (savedTheme) {
        set({ theme: savedTheme });
        if (savedTheme === "dark") { document.documentElement.classList.add("dark"); } else { document.documentElement.classList.remove("dark"); } } else { set({ theme: "light" }); document.documentElement.classList.remove("dark"); }
    } catch {
      // Keep defaults
    }
  },

  saveBoardLocally: () => {
    if (typeof window === 'undefined') return;
    try {
      const { allCards, allConnections, boards, activeBoardId, theme } = get();
      localStorage.setItem('drag2place_cards', JSON.stringify(allCards));
      localStorage.setItem('drag2place_connections', JSON.stringify(allConnections));
      localStorage.setItem('drag2place_boards', JSON.stringify(boards));
      localStorage.setItem('drag2place_active_board_id', activeBoardId);
      localStorage.setItem('drag2place_theme', theme);
    } catch {
      // Storage error handle
    }
  },

  syncWithSupabase: async () => {
    const supabase = getSupabase();
    if (!supabase) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { allCards, allConnections, boards } = get();

      for (const b of boards) {
        await supabase.from('boards').upsert({
          id: b.id,
          user_id: user.id,
          title: b.title,
          pan_x: b.pan.x,
          pan_y: b.pan.y,
          zoom: b.zoom,
          updated_at: new Date().toISOString(),
        });
      }

      for (const card of allCards) {
        await supabase.from('cards').upsert({
          id: card.id,
          board_id: card.boardId,
          user_id: user.id,
          type: card.type,
          x: card.x,
          y: card.y,
          width: card.width,
          height: card.height,
          z_index: card.zIndex,
          color: card.color,
          content: card.content,
          updated_at: new Date().toISOString(),
        });
      }

      for (const conn of allConnections) {
        await supabase.from('connections').upsert({
          id: conn.id,
          board_id: conn.boardId,
          from_card_id: conn.fromCardId,
          to_card_id: conn.toCardId,
          style: conn.style || 'curved',
          label: conn.label || '',
        });
      }
    } catch (err) {
      console.error('Supabase sync error:', err);
    }
  },

  checkReminders: () => {
    const { allCards } = get();
    const now = new Date();

    allCards.forEach((card) => {
      if (card.type === 'event') {
        const ev = card.content as EventCardData;
        if (!ev.date || ev.notified) return;

        const eventDateTime = new Date(`${ev.date}T${ev.startTime || '00:00'}:00`);
        const reminderMinutes = ev.reminderMinutesBefore || 15;
        const alertThreshold = new Date(eventDateTime.getTime() - reminderMinutes * 60 * 1000);

        if (now >= alertThreshold && now < eventDateTime) {
          notificationService.trigger(
            `Upcoming Event: ${ev.title}`,
            `Scheduled for ${ev.startTime ? `${ev.startTime} on ` : ''}${ev.date}. ${ev.location ? `Location: ${ev.location}` : ''}`,
            card.id
          );
          get().updateCardContent(card.id, { notified: true });
        }
      }
    });
  },

  exportWorkspaceJson: () => {
    const { boards, allCards, allConnections, theme } = get();
    const data = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      theme,
      boards,
      cards: allCards,
      connections: allConnections,
    };
    return JSON.stringify(data, null, 2);
  },

  importWorkspaceJson: (jsonString: string) => {
    try {
      const data = JSON.parse(jsonString);
      if (data && Array.isArray(data.boards) && Array.isArray(data.cards)) {
        soundFx.playChime();
        set({
          boards: data.boards,
          allCards: data.cards,
          allConnections: Array.isArray(data.connections) ? data.connections : [],
          activeBoardId: data.boards[0]?.id || DEFAULT_BOARD_ID,
          currentBoard: data.boards[0] || INITIAL_BOARDS[0],
          selectedCardIds: [],
        });
        get().saveBoardLocally();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  },
}));
