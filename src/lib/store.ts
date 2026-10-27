import { create } from 'zustand';
import { Card, Connection, Board, CardType, CardColor, CardContent, EventCardData, ConfirmModalConfig, WorkspaceMode } from '@/types/board';
import { WORKSPACE_MODES } from './templates';
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
  createBoardFromTemplate: (mode: WorkspaceMode, scenarioId?: string) => Board;
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

  // Confirmation modal
  confirmModal: ConfirmModalConfig | null;
  openConfirmModal: (config: ConfirmModalConfig) => void;
  closeConfirmModal: () => void;
  
  // Sync, Export & Import
  loadBoard: () => void;
  saveBoardLocally: (skipCloudSync?: boolean) => void;
  scheduleCloudSync: () => void;
  syncWithSupabase: () => Promise<void>;
  hydrateFromSupabase: () => Promise<void>;
  isSyncing: boolean;
  lastSyncedAt: string | null;
  saveStatus: 'saved' | 'saving';
  checkReminders: () => void;
  exportWorkspaceJson: () => string;
  importWorkspaceJson: (jsonString: string) => boolean;
}

interface SupabaseBoardRow {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  pan_x?: number;
  pan_y?: number;
  zoom?: number;
  created_at: string;
  updated_at: string;
}

interface SupabaseCardRow {
  id: string;
  board_id: string;
  user_id: string;
  type: CardType;
  x: number;
  y: number;
  width: number;
  height: number;
  z_index: number;
  color: CardColor;
  content: CardContent;
  created_at: string;
  updated_at: string;
}

interface SupabaseConnRow {
  id: string;
  board_id: string;
  from_card_id: string;
  to_card_id: string;
  color?: string;
  label?: string;
  style?: 'solid' | 'dashed' | 'curved';
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

let syncTimeout: ReturnType<typeof setTimeout> | null = null;

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
  confirmModal: null,
  openConfirmModal: (config: ConfirmModalConfig) => set({ confirmModal: config }),
  closeConfirmModal: () => set({ confirmModal: null }),
  theme: 'light',
  isSyncing: false,
  lastSyncedAt: null,
  saveStatus: 'saved',

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

  createBoardFromTemplate: (mode: WorkspaceMode, scenarioId?: string) => {
    const baseTemplate = WORKSPACE_MODES[mode];
    const template = (scenarioId && baseTemplate?.subScenarios?.find((s) => s.id === scenarioId)) || baseTemplate;
    if (!template) return get().currentBoard;
    const newBoardId = `board-${mode}-${Date.now().toString(36)}`;
    const newBoard: Board = {
      id: newBoardId,
      title: template.boardTitle,
      description: template.boardDescription,
      theme: get().theme,
      mode,
      pan: { x: 0, y: 0 },
      zoom: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const createdCards: Card[] = template.cards.map((c, idx) => ({
      ...c,
      id: `card-${mode}-${Date.now()}-${idx}`,
      boardId: newBoardId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    const createdConnections: Connection[] = [];

    soundFx.playDrop();
    set((state) => ({
      boards: [...state.boards, newBoard],
      activeBoardId: newBoard.id,
      currentBoard: newBoard,
      allCards: [...state.allCards, ...createdCards],
      allConnections: [...state.allConnections, ...createdConnections],
      selectedCardIds: [createdCards[0]?.id || ''],
    }));

    get().saveBoardLocally();
    get().syncWithSupabase();
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

    // Delete from Supabase if user is logged in (cascades to cards & connections)
    const supabase = getSupabase();
    if (supabase) {
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (user) {
          supabase.from('boards').delete().eq('id', boardId).eq('user_id', user.id).then();
        }
      });
    }
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
      code: 'paper',
      palette: 'cream',
      metric: 'sky',
      comment: 'amber',
      link: 'paper',
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
    } else if (type === 'code') {
      initialContent = {
        title: 'Code Snippet',
        code: '// Paste or write code snippet here\nfunction calculateScore(x: number) {\n  return x * 1.5;\n}',
        language: 'typescript',
      };
    } else if (type === 'palette') {
      initialContent = {
        title: 'Color Palette',
        swatches: [
          { id: 'sw-1', name: 'Obsidian Velvet', hex: '#1C1A17', pantone: 'Black 6 C' },
          { id: 'sw-2', name: 'Paper Linen', hex: '#FAF8F5', pantone: '7527 C' },
          { id: 'sw-3', name: 'Warm Terracotta', hex: '#E07A5F', pantone: '7592 C' },
          { id: 'sw-4', name: 'Deep Slate', hex: '#3D405B', pantone: '534 C' },
        ],
      };
    } else if (type === 'metric') {
      initialContent = {
        title: 'Key Metric Goal',
        currentValue: 120,
        targetValue: 500,
        unit: 'users',
        subtitle: 'Target for Q4 Launch',
      };
    } else if (type === 'comment') {
      initialContent = {
        author: 'Reviewer',
        text: '',
        resolved: false,
        createdAt: new Date().toISOString(),
      };
    } else if (type === 'link') {
      initialContent = {
        url: '',
        title: '',
        description: '',
      };
    } else {
      initialContent = {
        title: '',
        body: '',
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
      width: type === 'code' ? 360 : type === 'palette' ? 320 : type === 'image' || type === 'link' ? 340 : type === 'comment' ? 270 : 300,
      height: type === 'event' || type === 'comment' ? 240 : type === 'metric' ? 260 : 340,
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

  saveBoardLocally: (skipCloudSync = false) => {
    if (typeof window === 'undefined') return;
    try {
      set({ saveStatus: 'saving' });
      const { allCards, allConnections, boards, activeBoardId, theme } = get();
      localStorage.setItem('drag2place_cards', JSON.stringify(allCards));
      localStorage.setItem('drag2place_connections', JSON.stringify(allConnections));
      localStorage.setItem('drag2place_boards', JSON.stringify(boards));
      localStorage.setItem('drag2place_active_board_id', activeBoardId);
      localStorage.setItem('drag2place_theme', theme);

      // Debounced background sync to cloud if user is logged in
      if (!skipCloudSync) {
        const supabase = getSupabase();
        if (supabase) {
          get().scheduleCloudSync();
          supabase.auth.getSession().then(({ data: { session } }) => {
            if (!session) {
              setTimeout(() => set({ saveStatus: 'saved' }), 500);
            }
          }).catch(() => {
            setTimeout(() => set({ saveStatus: 'saved' }), 500);
          });
        } else {
          setTimeout(() => set({ saveStatus: 'saved' }), 500);
        }
      } else {
        setTimeout(() => set({ saveStatus: 'saved' }), 400);
      }
    } catch {
      set({ saveStatus: 'saved' });
    }
  },

  scheduleCloudSync: () => {
    if (syncTimeout) clearTimeout(syncTimeout);
    syncTimeout = setTimeout(() => {
      get().syncWithSupabase();
    }, 3000);
  },

  syncWithSupabase: async () => {
    const supabase = getSupabase();
    if (!supabase) {
      set({ saveStatus: 'saved' });
      return;
    }

    // Prevent concurrent sync executions
    if (get().isSyncing) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        set({ saveStatus: 'saved' });
        return;
      }

      set({ isSyncing: true, saveStatus: 'saving' });
      const { allCards, allConnections, boards } = get();

      // Batch upsert boards in a single request
      if (boards.length > 0) {
        await supabase.from('boards').upsert(
          boards.map((b) => ({
            id: b.id,
            user_id: user.id,
            title: b.title,
            pan_x: b.pan.x,
            pan_y: b.pan.y,
            zoom: b.zoom,
            updated_at: new Date().toISOString(),
          }))
        );
      }

      // Batch upsert cards in a single request
      if (allCards.length > 0) {
        await supabase.from('cards').upsert(
          allCards.map((card) => ({
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
          }))
        );
      }

      // Batch upsert connections in a single request
      if (allConnections.length > 0) {
        await supabase.from('connections').upsert(
          allConnections.map((conn) => ({
            id: conn.id,
            board_id: conn.boardId,
            from_card_id: conn.fromCardId,
            to_card_id: conn.toCardId,
            style: conn.style || 'curved',
            label: conn.label || '',
          }))
        );
      }

      set({ isSyncing: false, saveStatus: 'saved', lastSyncedAt: new Date().toISOString() });
    } catch (err) {
      console.error('Supabase sync error:', err);
      set({ isSyncing: false, saveStatus: 'saved' });
    }
  },

  hydrateFromSupabase: async () => {
    const supabase = getSupabase();
    if (!supabase) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      set({ isSyncing: true });

      const { data: cloudBoards, error: bErr } = await supabase
        .from('boards')
        .select('*')
        .eq('user_id', user.id);

      if (bErr || !cloudBoards || cloudBoards.length === 0) {
        // No existing boards in cloud yet, automatically push current local workspace
        await get().syncWithSupabase();
        set({ isSyncing: false, lastSyncedAt: new Date().toISOString() });
        return;
      }

      const { data: cloudCards } = await supabase
        .from('cards')
        .select('*')
        .eq('user_id', user.id);

      const { data: cloudConns } = await supabase
        .from('connections')
        .select('*');

      const mappedBoards: Board[] = (cloudBoards as unknown as SupabaseBoardRow[]).map((b) => ({
        id: b.id,
        title: b.title,
        description: b.description || '',
        theme: get().theme,
        pan: { x: b.pan_x ?? 0, y: b.pan_y ?? 0 },
        zoom: b.zoom ?? 1,
        createdAt: b.created_at,
        updatedAt: b.updated_at,
      }));

      const mappedCards: Card[] = ((cloudCards || []) as unknown as SupabaseCardRow[]).map((c) => ({
        id: c.id,
        boardId: c.board_id,
        type: c.type,
        x: c.x,
        y: c.y,
        width: c.width,
        height: c.height,
        zIndex: c.z_index,
        color: c.color,
        content: c.content,
        createdAt: c.created_at,
        updatedAt: c.updated_at,
      }));

      const mappedConns: Connection[] = ((cloudConns || []) as unknown as SupabaseConnRow[]).map((conn) => ({
        id: conn.id,
        boardId: conn.board_id,
        fromCardId: conn.from_card_id,
        toCardId: conn.to_card_id,
        color: conn.color,
        label: conn.label,
        style: conn.style,
      }));

      // Merge offline work: preserve any newly created cards crafted while logged out
      const localCards = get().allCards;
      const cloudCardIds = new Set(mappedCards.map((c) => c.id));
      const newlyCreatedOfflineCards = localCards.filter(
        (lc) => !cloudCardIds.has(lc.id) && !lc.id.startsWith('card-welcome') && !lc.id.startsWith('card-launch')
      );

      const mergedCards = [...mappedCards, ...newlyCreatedOfflineCards];

      const activeId = mappedBoards[0]?.id || DEFAULT_BOARD_ID;
      const current = mappedBoards[0] || INITIAL_BOARDS[0];

      set({
        boards: mappedBoards,
        allCards: mergedCards,
        allConnections: mappedConns,
        activeBoardId: activeId,
        currentBoard: current,
        isSyncing: false,
        lastSyncedAt: new Date().toISOString(),
      });

      get().saveBoardLocally(true);

      // If there were newly created offline cards, sync them to cloud now
      if (newlyCreatedOfflineCards.length > 0) {
        await get().syncWithSupabase();
      }
    } catch (err) {
      console.error('Supabase hydration error:', err);
      set({ isSyncing: false });
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
