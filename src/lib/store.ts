import { create } from 'zustand';
import { Card, Connection, Board, CardType, CardColor, CardContent, EventCardData, ConfirmModalConfig, WorkspaceMode, BoardSection, CardStatus } from '@/types/board';
import { WORKSPACE_MODES } from './templates';
import { soundFx } from './sound';
import { notificationService } from './notifications';
import { getSupabase } from './supabase/client';
import { DEFAULT_BOARD_ID, INITIAL_BOARDS, INITIAL_CARDS, INITIAL_CONNECTIONS, INITIAL_SECTIONS } from './initialData';

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

  // Visual Sections (Grouping Frames)
  allSections: BoardSection[];
  selectedSectionId: string | null;
  selectSection: (id: string | null) => void;
  getActiveSections: () => BoardSection[];
  addSection: (title?: string, position?: { x: number; y: number }, size?: { width: number; height: number }, color?: CardColor) => BoardSection;
  updateSection: (id: string, updates: Partial<BoardSection>) => void;
  moveSection: (id: string, deltaX: number, deltaY: number) => void;
  deleteSection: (id: string) => void;

  // Search & Spotlight Filtering
  activeFilterType: CardType | 'all';
  searchQuery: string;
  showFilterBar: boolean;
  toggleFilterBar: () => void;
  setFilterType: (filter: CardType | 'all') => void;
  setSearchQuery: (query: string) => void;

  // Compact Overview Mode
  compactMode: boolean;
  toggleCompactMode: () => void;

  // Magnetic Alignment Guides
  alignmentGuides: { vertical?: number; horizontal?: number } | null;
  setAlignmentGuides: (guides: { vertical?: number; horizontal?: number } | null) => void;

  // Card Tags & Status Badges
  updateCardTags: (id: string, tags: string[]) => void;
  updateCardStatus: (id: string, status?: CardStatus) => void;

  // Viewport actions
  setPan: (pan: { x: number; y: number }) => void;
  setZoom: (zoom: number) => void;
  resetView: () => void;
  fitToScreen: () => void;
  tidyUpBoard: () => void;
  jumpToCard: (cardId: string) => void;
  setSnapToGrid: (snap: boolean) => void;
  setSoundEnabled: (enabled: boolean) => void;
  showMinimap: boolean;
  toggleMinimap: () => void;
  
  // Tool & selection
  setActiveTool: (tool: 'select' | 'connect' | 'pan') => void;
  setSelectedCards: (ids: string[]) => void;
  selectCard: (id: string, multi?: boolean) => void;
  selectCardsInRect: (rect: { left: number; top: number; right: number; bottom: number }, additive?: boolean) => void;
  selectAllCards: () => void;
  clearSelection: () => void;
  
  // Card operations
  addCard: (type: CardType, position?: { x: number; y: number }) => Card;
  duplicateCard: (id: string) => Card | null;
  duplicateSelectedCards: () => Card[];
  updateCardPosition: (id: string, x: number, y: number) => void;
  moveCards: (deltas: { id: string; x: number; y: number }[]) => void;
  alignSelectedCards: (type: 'left' | 'right' | 'top' | 'bottom' | 'center-h' | 'center-v' | 'distribute-h' | 'distribute-v' | 'grid') => void;
  updateSelectedCardsColor: (color: CardColor) => void;
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

let syncTimeout: ReturnType<typeof setTimeout> | null = null;

export const DEDICATED_TYPE_COLORS: Record<CardType, CardColor> = {
  note: 'cream',
  todo: 'sage',
  event: 'amber',
  link: 'sky',
  palette: 'lavender',
  metric: 'terracotta',
  code: 'paper',
  image: 'paper',
  comment: 'amber',
  audio: 'amber',
  table: 'sky',
  countdown: 'terracotta',
  quote: 'cream',
};

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
  showMinimap: false,
  toggleMinimap: () => set((state) => ({ showMinimap: !state.showMinimap })),
  isSyncing: false,
  lastSyncedAt: null,
  saveStatus: 'saved',

  allSections: INITIAL_SECTIONS,
  selectedSectionId: null,
  activeFilterType: 'all',
  searchQuery: '',
  showFilterBar: true,
  compactMode: false,
  alignmentGuides: null,

  selectSection: (selectedSectionId) => set({ selectedSectionId }),

  getActiveCards: () => {
    const { allCards, activeBoardId } = get();
    return (allCards || []).filter((c) => c.boardId === activeBoardId);
  },

  getActiveConnections: () => {
    const { allConnections, activeBoardId } = get();
    return (allConnections || []).filter((c) => c.boardId === activeBoardId);
  },

  getActiveSections: () => {
    const { allSections, activeBoardId } = get();
    return (allSections || []).filter((s) => s.boardId === activeBoardId);
  },

  setFilterType: (activeFilterType) => set({ activeFilterType }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  toggleFilterBar: () => set((state) => ({ showFilterBar: !state.showFilterBar })),
  toggleCompactMode: () => set((state) => ({ compactMode: !state.compactMode })),
  setAlignmentGuides: (alignmentGuides) => set({ alignmentGuides }),

  addSection: (title = 'New Section', position, size, color = 'cream') => {
    const { currentBoard, activeBoardId } = get();
    const posX = position ? position.x : -currentBoard.pan.x + 80;
    const posY = position ? position.y : -currentBoard.pan.y + 60;
    const width = size?.width || 720;
    const height = size?.height || 480;

    const newSection: BoardSection = {
      id: `section-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      boardId: activeBoardId,
      title,
      x: posX,
      y: posY,
      width,
      height,
      color,
      createdAt: new Date().toISOString(),
    };

    soundFx.playCheck();
    set((state) => ({
      allSections: [...state.allSections, newSection],
      selectedSectionId: newSection.id,
      selectedCardIds: [],
    }));
    get().saveBoardLocally();
    return newSection;
  },

  updateSection: (id, updates) => {
    set((state) => ({
      allSections: state.allSections.map((s) => (s.id === id ? { ...s, ...updates } : s)),
    }));
    get().saveBoardLocally();
  },

  moveSection: (id, deltaX, deltaY) => {
    set((state) => {
      const section = state.allSections.find((s) => s.id === id);
      if (!section) return state;

      const newSectionX = section.x + deltaX;
      const newSectionY = section.y + deltaY;

      // Cards inside this section prior to movement
      const cardsInside = state.allCards.filter((c) => {
        if (c.boardId !== section.boardId) return false;
        const centerX = c.x + c.width / 2;
        const centerY = c.y + c.height / 2;
        return (
          centerX >= section.x &&
          centerX <= section.x + section.width &&
          centerY >= section.y &&
          centerY <= section.y + section.height
        );
      });

      const insideCardIds = new Set(cardsInside.map((c) => c.id));
      const now = new Date().toISOString();

      return {
        allSections: state.allSections.map((s) =>
          s.id === id ? { ...s, x: newSectionX, y: newSectionY } : s
        ),
        allCards: state.allCards.map((c) => {
          if (insideCardIds.has(c.id)) {
            return {
              ...c,
              x: c.x + deltaX,
              y: c.y + deltaY,
              updatedAt: now,
            };
          }
          return c;
        }),
      };
    });
    get().saveBoardLocally();
  },

  deleteSection: (id) => {
    set((state) => ({
      allSections: state.allSections.filter((s) => s.id !== id),
      selectedSectionId: state.selectedSectionId === id ? null : state.selectedSectionId,
    }));
    soundFx.playDrop();
    get().saveBoardLocally();
  },

  updateCardTags: (id, tags) => {
    const now = new Date().toISOString();
    set((state) => ({
      allCards: state.allCards.map((c) => (c.id === id ? { ...c, tags, updatedAt: now } : c)),
    }));
    get().saveBoardLocally();
  },

  updateCardStatus: (id, status) => {
    const now = new Date().toISOString();
    set((state) => ({
      allCards: state.allCards.map((c) => (c.id === id ? { ...c, status, updatedAt: now } : c)),
    }));
    get().saveBoardLocally();
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
      selectedSectionId: null,
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
    const newBoardId = `board-${mode}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`;
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
      id: `card-${mode}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}-${idx}`,
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

    const targetBoard = boards.find((b) => b.id === boardId);
    const boardTitle = targetBoard?.title || 'workspace';
    const remainingBoards = boards.filter((b) => b.id !== boardId);
    if (remainingBoards.length === 0) return;

    const nextActive = (activeBoardId === boardId || get().currentBoard.id === boardId)
      ? remainingBoards[0]
      : (remainingBoards.find((b) => b.id === activeBoardId) || remainingBoards[0]);

    soundFx.playDrop();
    set((state) => ({
      boards: remainingBoards,
      activeBoardId: nextActive.id,
      currentBoard: nextActive,
      allCards: state.allCards.filter((c) => c.boardId !== boardId),
      allConnections: state.allConnections.filter((conn) => conn.boardId !== boardId),
      allSections: state.allSections.filter((s) => s.boardId !== boardId),
      selectedCardIds: [],
    }));
    get().saveBoardLocally();

    notificationService.trigger('Workspace Deleted', `"${boardTitle}" was permanently removed.`);

    // Cascade delete from Supabase in reverse dependency order:
    // 1. connections -> 2. cards -> 3. boards
    const supabase = getSupabase();
    if (supabase) {
      supabase.auth.getUser().then(async ({ data: { user } }) => {
        if (user) {
          try {
            await supabase.from('connections').delete().eq('board_id', boardId);
            await supabase.from('cards').delete().eq('board_id', boardId).eq('user_id', user.id);
            const { error } = await supabase.from('boards').delete().eq('id', boardId).eq('user_id', user.id);
            if (error) {
              console.error('Supabase board delete error:', error);
            }
          } catch (err) {
            console.error('Failed to cascade delete board from Supabase:', err);
          }
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
      if (theme === "dark") {
        document.documentElement.classList.add("dark");
        document.documentElement.style.colorScheme = "dark";
      } else {
        document.documentElement.classList.remove("dark");
        document.documentElement.style.colorScheme = "light";
      }
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

  fitToScreen: () => {
    const { getActiveCards } = get();
    const cards = getActiveCards();
    if (cards.length === 0) {
      set((state) => ({
        currentBoard: { ...state.currentBoard, pan: { x: 0, y: 0 }, zoom: 1 },
      }));
      return;
    }

    const minX = Math.min(...cards.map((c) => c.x));
    const maxX = Math.max(...cards.map((c) => c.x + c.width));
    const minY = Math.min(...cards.map((c) => c.y));
    const maxY = Math.max(...cards.map((c) => c.y + c.height));

    const contentWidth = Math.max(maxX - minX, 200);
    const contentHeight = Math.max(maxY - minY, 200);

    const winW = typeof window !== 'undefined' ? window.innerWidth : 1400;
    const winH = typeof window !== 'undefined' ? window.innerHeight : 900;

    const padding = 100;
    const availableW = winW - padding * 2;
    const availableH = winH - padding * 2 - 80;

    const scaleX = availableW / contentWidth;
    const scaleY = availableH / contentHeight;
    const fitZoom = Math.min(Math.max(Math.min(scaleX, scaleY), 0.3), 1.15);

    const centerX = minX + contentWidth / 2;
    const centerY = minY + contentHeight / 2;

    const panX = winW / (2 * fitZoom) - centerX;
    const panY = winH / (2 * fitZoom) - centerY;

    soundFx.playDrop();
    set((state) => ({
      currentBoard: {
        ...state.currentBoard,
        zoom: Math.round(fitZoom * 100) / 100,
        pan: { x: Math.round(panX), y: Math.round(panY) },
      },
    }));
    get().saveBoardLocally(true);
  },

  tidyUpBoard: () => {
    const { getActiveCards, activeBoardId } = get();
    const cards = getActiveCards();
    if (cards.length === 0) return;

    // Stable sort: reading order (top to bottom bands, then left to right)
    const sortedCards = [...cards].sort((a, b) => {
      const bandA = Math.floor(a.y / 180);
      const bandB = Math.floor(b.y / 180);
      if (bandA !== bandB) return bandA - bandB;
      return a.x - b.x;
    });

    // 1. Determine optimal column count for balanced 2D matrix
    const count = sortedCards.length;
    let numCols = 3;
    if (count <= 2) numCols = count;
    else if (count <= 4) numCols = 2;
    else if (count <= 9) numCols = 3;
    else numCols = 4;

    const numRows = Math.ceil(count / numCols);

    // 2. Build 2D matrix [row][col] to align horizontally & vertically
    const matrix: (Card | null)[][] = Array.from({ length: numRows }, () =>
      new Array(numCols).fill(null)
    );

    sortedCards.forEach((card, index) => {
      const r = Math.floor(index / numCols);
      const c = index % numCols;
      matrix[r][c] = card;
    });

    // 3. Compute row heights (tallest card in row) & col widths (widest card in col)
    const rowHeights = new Array(numRows).fill(300);
    for (let r = 0; r < numRows; r++) {
      let maxH = 260;
      for (let c = 0; c < numCols; c++) {
        const card = matrix[r][c];
        if (card) {
          maxH = Math.max(maxH, card.height || 320);
        }
      }
      rowHeights[r] = maxH;
    }

    const colWidths = new Array(numCols).fill(340);
    for (let c = 0; c < numCols; c++) {
      let maxW = 320;
      for (let r = 0; r < numRows; r++) {
        const card = matrix[r][c];
        if (card) {
          maxW = Math.max(maxW, card.width || 340);
        }
      }
      colWidths[c] = maxW;
    }

    // 4. Calculate starting X and Y positions with clean spacing
    const gapX = 40;
    const gapY = 40;
    const startX = 80;
    const startY = 80;

    const colStartX = new Array(numCols).fill(startX);
    for (let c = 1; c < numCols; c++) {
      colStartX[c] = colStartX[c - 1] + colWidths[c - 1] + gapX;
    }

    const rowStartY = new Array(numRows).fill(startY);
    for (let r = 1; r < numRows; r++) {
      rowStartY[r] = rowStartY[r - 1] + rowHeights[r - 1] + gapY;
    }

    // 5. Place cards: strictly aligned horizontally in rows & vertically in columns
    const updated: Card[] = [];
    const now = new Date().toISOString();

    for (let r = 0; r < numRows; r++) {
      for (let c = 0; c < numCols; c++) {
        const card = matrix[r][c];
        if (card) {
          updated.push({
            ...card,
            x: colStartX[c],
            y: rowStartY[r],
            color: DEDICATED_TYPE_COLORS[card.type] || card.color,
            updatedAt: now,
          });
        }
      }
    }

    const updateMap = new Map(updated.map((u) => [u.id, u]));

    set((state) => ({
      allCards: state.allCards.map((c) => {
        if (c.boardId !== activeBoardId) return c;
        const match = updateMap.get(c.id);
        return match || c;
      }),
    }));

    soundFx.playDrop();
    get().saveBoardLocally();
    get().fitToScreen();
  },

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

  selectCardsInRect: (rect, additive = false) => {
    const { getActiveCards, selectedCardIds } = get();
    const activeCards = getActiveCards();

    const minX = Math.min(rect.left, rect.right);
    const maxX = Math.max(rect.left, rect.right);
    const minY = Math.min(rect.top, rect.bottom);
    const maxY = Math.max(rect.top, rect.bottom);

    const hitCardIds = activeCards
      .filter((c) => {
        const cardRight = c.x + c.width;
        const cardBottom = c.y + c.height;
        return c.x < maxX && cardRight > minX && c.y < maxY && cardBottom > minY;
      })
      .map((c) => c.id);

    if (additive) {
      const combined = Array.from(new Set([...selectedCardIds, ...hitCardIds]));
      set({ selectedCardIds: combined });
    } else {
      set({ selectedCardIds: hitCardIds });
    }
  },

  selectAllCards: () => {
    const { getActiveCards } = get();
    const activeCards = getActiveCards();
    set({ selectedCardIds: activeCards.map((c) => c.id) });
  },

  addCard: (type: CardType, position?: { x: number; y: number }) => {
    const { currentBoard, allCards, allSections, selectedSectionId, activeBoardId, getActiveCards } = get();
    const highestZ = allCards.reduce((max, c) => Math.max(max, c.zIndex), 0);
    const activeCards = getActiveCards();

    let targetCardWidth =
      type === 'code' || type === 'table'
        ? 380
        : type === 'palette' || type === 'audio' || type === 'countdown' || type === 'quote'
        ? 320
        : type === 'image' || type === 'link'
        ? 340
        : type === 'comment'
        ? 270
        : 300;
    const cardHeight =
      type === 'event' || type === 'comment' || type === 'audio' || type === 'countdown'
        ? 240
        : type === 'metric' || type === 'quote'
        ? 260
        : type === 'table'
        ? 320
        : 340;

    let posX = 0;
    let posY = 0;
    let assignedSectionId: string | undefined;
    let shouldFocusCanvas = false;
    let targetPanX = currentBoard.pan.x;
    let targetPanY = currentBoard.pan.y;

    const winW = typeof window !== 'undefined' ? window.innerWidth : 1400;
    const winH = typeof window !== 'undefined' ? window.innerHeight : 900;
    const zoom = Math.max(0.1, currentBoard.zoom || 1);
    const panX = currentBoard.pan.x;
    const panY = currentBoard.pan.y;

    // Viewport bounds in world canvas coordinates
    const viewLeft = -panX;
    const viewTop = -panY;
    const viewRight = (winW / zoom) - panX;
    const viewBottom = (winH / zoom) - panY;

    // Usable focused area avoiding top header (~80px), bottom dock (~115px), and margins (~48px)
    const topInset = 80 / zoom;
    const bottomInset = 115 / zoom;
    const sideInset = 48 / zoom;

    const focusedLeft = viewLeft + sideInset;
    const focusedTop = viewTop + topInset;
    const focusedRight = viewRight - sideInset;
    const focusedBottom = viewBottom - bottomInset;

    const hasCollision = (x: number, y: number, w: number, h: number, margin = 20) => {
      return activeCards.some((c) => {
        const overlapX = x < c.x + c.width + margin && x + w + margin > c.x;
        const overlapY = y < c.y + c.height + margin && y + h + margin > c.y;
        return overlapX && overlapY;
      });
    };

    // Check if user has a section selected
    const targetSection = !position && selectedSectionId
      ? allSections.find((s) => s.id === selectedSectionId && s.boardId === activeBoardId)
      : null;

    if (position) {
      posX = position.x;
      posY = position.y;
      const container = allSections.find(
        (s) =>
          s.boardId === activeBoardId &&
          posX >= s.x &&
          posX <= s.x + s.width &&
          posY >= s.y &&
          posY <= s.y + s.height
      );
      if (container) {
        assignedSectionId = container.id;
      }
    } else if (targetSection) {
      assignedSectionId = targetSection.id;

      // Cards that currently belong to this section
      const sectionCards = activeCards.filter((c) => {
        if (c.sectionId === targetSection.id) return true;
        const centerX = c.x + c.width / 2;
        const centerY = c.y + c.height / 2;
        return (
          centerX >= targetSection.x &&
          centerX <= targetSection.x + targetSection.width &&
          centerY >= targetSection.y &&
          centerY <= targetSection.y + targetSection.height
        );
      });

      // Internal layout padding & gaps
      const padX = 24;
      const padTop = 36;
      const padBottom = 28;
      const gapX = 24;
      const gapY = 24;

      const availWidth = Math.max(260, targetSection.width - padX * 2);

      // Determine column count that fits comfortably inside the section width
      let numCols = Math.max(1, Math.floor((availWidth + gapX) / (targetCardWidth + gapX)));
      if (availWidth < 500) {
        numCols = 1;
      }

      // Automatically adjust card width to fit the section columns cleanly
      targetCardWidth = Math.min(
        targetCardWidth,
        Math.floor((availWidth - (numCols - 1) * gapX) / numCols)
      );

      // Search for the first non-overlapping slot inside the section
      let slotFound = false;
      let slotIndex = 0;
      let slotX = targetSection.x + padX;
      let slotY = targetSection.y + padTop;

      while (!slotFound && slotIndex < 60) {
        const col = slotIndex % numCols;
        const row = Math.floor(slotIndex / numCols);

        slotX = targetSection.x + padX + col * (targetCardWidth + gapX);
        slotY = targetSection.y + padTop + row * (cardHeight + gapY);

        const overlaps = sectionCards.some((sc) => {
          const overlapX = slotX < sc.x + sc.width && slotX + targetCardWidth > sc.x;
          const overlapY = slotY < sc.y + sc.height && slotY + cardHeight > sc.y;
          return overlapX && overlapY;
        });

        if (!overlaps) {
          slotFound = true;
        } else {
          slotIndex++;
        }
      }

      posX = slotX;
      posY = slotY;

      // Make the section adjust to the cards! Automatically expand section height if needed
      const neededHeight = (slotY - targetSection.y) + cardHeight + padBottom;
      if (neededHeight > targetSection.height) {
        const updatedHeight = Math.round(neededHeight);
        set((state) => ({
          allSections: state.allSections.map((s) =>
            s.id === targetSection.id ? { ...s, height: updatedHeight } : s
          ),
        }));
      }

      // If the placed card inside section is out of the focused viewport, focus canvas to it
      const inViewport =
        posX >= focusedLeft &&
        posX + targetCardWidth <= focusedRight &&
        posY >= focusedTop &&
        posY + cardHeight <= focusedBottom;

      if (!inViewport) {
        shouldFocusCanvas = true;
        const cardCenterX = posX + targetCardWidth / 2;
        const cardCenterY = posY + cardHeight / 2;
        targetPanX = Math.round(winW / (2 * zoom) - cardCenterX);
        targetPanY = Math.round(winH / (2 * zoom) - cardCenterY);
      }
    } else {
      // Automatic intelligent placement:
      // 1. Check if there is space in the focused canvas area; place it there.
      // 2. If no space in focused canvas area, place it in the next available space and focus the canvas there.
      const padding = 28;
      const availW = focusedRight - focusedLeft;
      const availH = focusedBottom - focusedTop;
      let foundInFocus = false;

      if (availW >= targetCardWidth && availH >= cardHeight) {
        // Step 1A: Check near the center of the focused canvas area
        const centerCandX = Math.round(focusedLeft + (availW - targetCardWidth) / 2);
        const centerCandY = Math.round(focusedTop + (availH - cardHeight) / 2);

        if (!hasCollision(centerCandX, centerCandY, targetCardWidth, cardHeight)) {
          foundInFocus = true;
          posX = centerCandX;
          posY = centerCandY;
        } else {
          // Step 1B: Scan available slots in a grid inside the focused viewport
          const colStep = targetCardWidth + padding;
          const rowStep = cardHeight + padding;
          const numCols = Math.max(1, Math.floor((availW + padding) / colStep));
          const numRows = Math.max(1, Math.floor((availH + padding) / rowStep));

          const gridOffsetX = focusedLeft + Math.max(0, (availW - (numCols * targetCardWidth + (numCols - 1) * padding)) / 2);
          const gridOffsetY = focusedTop + Math.max(0, (availH - (numRows * cardHeight + (numRows - 1) * padding)) / 2);

          for (let r = 0; r < numRows; r++) {
            for (let c = 0; c < numCols; c++) {
              const candX = Math.round(gridOffsetX + c * colStep);
              const candY = Math.round(gridOffsetY + r * rowStep);

              if (candX + targetCardWidth <= focusedRight + 12 && candY + cardHeight <= focusedBottom + 12) {
                if (!hasCollision(candX, candY, targetCardWidth, cardHeight)) {
                  foundInFocus = true;
                  posX = candX;
                  posY = candY;
                  break;
                }
              }
            }
            if (foundInFocus) break;
          }

          // Step 1C: If grid scan was obstructed, test natural offsets adjacent to visible cards
          if (!foundInFocus) {
            const visibleCards = activeCards.filter(
              (c) =>
                c.x < focusedRight &&
                c.x + c.width > focusedLeft &&
                c.y < focusedBottom &&
                c.y + c.height > focusedTop
            );

            for (const vc of visibleCards) {
              const adjacentCandidates = [
                { x: vc.x + vc.width + padding, y: vc.y },
                { x: vc.x, y: vc.y + vc.height + padding },
                { x: vc.x - targetCardWidth - padding, y: vc.y },
                { x: vc.x, y: vc.y - cardHeight - padding },
              ];

              for (const cand of adjacentCandidates) {
                if (
                  cand.x >= focusedLeft - 8 &&
                  cand.x + targetCardWidth <= focusedRight + 8 &&
                  cand.y >= focusedTop - 8 &&
                  cand.y + cardHeight <= focusedBottom + 8
                ) {
                  if (!hasCollision(cand.x, cand.y, targetCardWidth, cardHeight)) {
                    foundInFocus = true;
                    posX = Math.round(cand.x);
                    posY = Math.round(cand.y);
                    break;
                  }
                }
              }
              if (foundInFocus) break;
            }
          }
        }
      }

      // Step 2: If no space in focused canvas area, place it in an available space next and focus the canvas there
      if (!foundInFocus) {
        const startNextX = focusedRight + padding;
        const startNextY = focusedTop;
        const colStep = targetCardWidth + padding;
        const rowStep = cardHeight + padding;
        const maxRowsToSearch = Math.max(2, Math.floor((availH + padding) / rowStep));

        let nextCol = 0;
        let nextRow = 0;
        let nextFound = false;
        let attempts = 0;

        while (!nextFound && attempts < 80) {
          const candX = Math.round(startNextX + nextCol * colStep);
          const candY = Math.round(startNextY + nextRow * rowStep);

          if (!hasCollision(candX, candY, targetCardWidth, cardHeight)) {
            nextFound = true;
            posX = candX;
            posY = candY;
          } else {
            nextRow++;
            if (nextRow >= maxRowsToSearch) {
              nextRow = 0;
              nextCol++;
            }
          }
          attempts++;
        }

        if (!nextFound) {
          const maxActiveX = activeCards.reduce((max, c) => Math.max(max, c.x + c.width), focusedRight);
          posX = maxActiveX + padding * 2;
          posY = focusedTop;
        }

        shouldFocusCanvas = true;
        const cardCenterX = posX + targetCardWidth / 2;
        const cardCenterY = posY + cardHeight / 2;
        targetPanX = Math.round(winW / (2 * zoom) - cardCenterX);
        targetPanY = Math.round(winH / (2 * zoom) - cardCenterY);
      }
    }

    const defaultColors: Record<CardType, CardColor> = DEDICATED_TYPE_COLORS;

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
    } else if (type === 'audio') {
      initialContent = {
        title: 'Audio Track',
        artist: 'Voice Memo / Sound Design',
        url: '',
        duration: 180,
      };
    } else if (type === 'table') {
      initialContent = {
        title: 'Project Backlog',
        columns: ['Feature / Milestone', 'Priority', 'Status'],
        rows: [
          { id: 'r1', cells: ['Design System Audit', 'High', 'Done'] },
          { id: 'r2', cells: ['Waveform Visualizer', 'Medium', 'In Progress'] },
          { id: 'r3', cells: ['Vector Die-line Exporter', 'Low', 'Backlog'] },
        ],
      };
    } else if (type === 'countdown') {
      const target = new Date();
      target.setDate(target.getDate() + 7);
      target.setHours(12, 0, 0, 0);
      initialContent = {
        title: 'Launch Countdown',
        targetDate: target.toISOString().slice(0, 16),
        description: 'Product Launch Date',
      };
    } else if (type === 'quote') {
      initialContent = {
        quote: 'Simplicity is about subtracting the obvious and adding the meaningful.',
        author: 'John Maeda',
        citation: 'The Laws of Simplicity',
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
      width: targetCardWidth,
      height: cardHeight,
      zIndex: highestZ + 1,
      color: defaultColors[type],
      content: initialContent,
      sectionId: assignedSectionId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    soundFx.playDrop();

    set((state) => {
      const nextCurrentBoard = shouldFocusCanvas
        ? {
            ...state.currentBoard,
            pan: { x: targetPanX, y: targetPanY },
          }
        : state.currentBoard;

      const nextBoards = shouldFocusCanvas
        ? state.boards.map((b) => (b.id === state.currentBoard.id ? nextCurrentBoard : b))
        : state.boards;

      return {
        allCards: [...state.allCards, newCard],
        selectedCardIds: [newCard.id],
        currentBoard: nextCurrentBoard,
        boards: nextBoards,
      };
    });

    get().saveBoardLocally();
    return newCard;
  },

  duplicateCard: (id: string) => {
    const { allCards, activeBoardId } = get();
    const card = allCards.find((c) => c.id === id);
    if (!card) return null;

    const highestZ = allCards.reduce((max, c) => Math.max(max, c.zIndex), 0);
    const newId = `card-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const clonedContent = JSON.parse(JSON.stringify(card.content)) as CardContent;

    const newCard: Card = {
      ...card,
      id: newId,
      boardId: activeBoardId,
      x: card.x + 28,
      y: card.y + 28,
      zIndex: highestZ + 1,
      content: clonedContent,
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

  duplicateSelectedCards: () => {
    const { allCards, selectedCardIds, activeBoardId } = get();
    if (selectedCardIds.length === 0) return [];

    const highestZ = allCards.reduce((max, c) => Math.max(max, c.zIndex), 0);
    const cardsToDuplicate = allCards.filter((c) => selectedCardIds.includes(c.id));
    if (cardsToDuplicate.length === 0) return [];

    let currentZ = highestZ;
    const newCards: Card[] = cardsToDuplicate.map((card) => {
      currentZ += 1;
      const newId = `card-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const clonedContent = JSON.parse(JSON.stringify(card.content)) as CardContent;
      return {
        ...card,
        id: newId,
        boardId: activeBoardId,
        x: card.x + 28,
        y: card.y + 28,
        zIndex: currentZ,
        content: clonedContent,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    });

    soundFx.playDrop();

    set((state) => ({
      allCards: [...state.allCards, ...newCards],
      selectedCardIds: newCards.map((c) => c.id),
    }));

    get().saveBoardLocally();
    return newCards;
  },

  moveCards: (deltas) =>
    set((state) => {
      const deltaMap = new Map(deltas.map((d) => [d.id, d]));
      const now = new Date().toISOString();
      const GRID_SIZE = 20;

      return {
        allCards: state.allCards.map((card) => {
          const delta = deltaMap.get(card.id);
          if (!delta) return card;

          let nextX = delta.x;
          let nextY = delta.y;
          if (state.snapToGrid) {
            nextX = Math.round(nextX / GRID_SIZE) * GRID_SIZE;
            nextY = Math.round(nextY / GRID_SIZE) * GRID_SIZE;
          }

          return {
            ...card,
            x: nextX,
            y: nextY,
            updatedAt: now,
          };
        }),
      };
    }),

  alignSelectedCards: (type) => {
    const { getActiveCards, selectedCardIds } = get();
    const activeCards = getActiveCards().filter((c) => selectedCardIds.includes(c.id));
    if (activeCards.length < 2) return;

    let updatedCards: { id: string; x: number; y: number }[] = [];

    if (type === 'left') {
      const minX = Math.min(...activeCards.map((c) => c.x));
      updatedCards = activeCards.map((c) => ({ id: c.id, x: minX, y: c.y }));
    } else if (type === 'right') {
      const maxRight = Math.max(...activeCards.map((c) => c.x + c.width));
      updatedCards = activeCards.map((c) => ({ id: c.id, x: maxRight - c.width, y: c.y }));
    } else if (type === 'top') {
      const minY = Math.min(...activeCards.map((c) => c.y));
      updatedCards = activeCards.map((c) => ({ id: c.id, x: c.x, y: minY }));
    } else if (type === 'bottom') {
      const maxBottom = Math.max(...activeCards.map((c) => c.y + c.height));
      updatedCards = activeCards.map((c) => ({ id: c.id, x: c.x, y: maxBottom - c.height }));
    } else if (type === 'center-h') {
      const avgCenterY = activeCards.reduce((sum, c) => sum + (c.y + c.height / 2), 0) / activeCards.length;
      updatedCards = activeCards.map((c) => ({ id: c.id, x: c.x, y: Math.round(avgCenterY - c.height / 2) }));
    } else if (type === 'center-v') {
      const avgCenterX = activeCards.reduce((sum, c) => sum + (c.x + c.width / 2), 0) / activeCards.length;
      updatedCards = activeCards.map((c) => ({ id: c.id, x: Math.round(avgCenterX - c.width / 2), y: c.y }));
    } else if (type === 'distribute-h') {
      const sorted = [...activeCards].sort((a, b) => a.x - b.x);
      const firstX = sorted[0].x;
      const lastX = sorted[sorted.length - 1].x;
      const totalSpacing = (lastX - firstX) / (sorted.length - 1);
      updatedCards = sorted.map((c, index) => ({
        id: c.id,
        x: Math.round(firstX + index * totalSpacing),
        y: c.y,
      }));
    } else if (type === 'distribute-v') {
      const sorted = [...activeCards].sort((a, b) => a.y - b.y);
      const firstY = sorted[0].y;
      const lastY = sorted[sorted.length - 1].y;
      const totalSpacing = (lastY - firstY) / (sorted.length - 1);
      updatedCards = sorted.map((c, index) => ({
        id: c.id,
        x: c.x,
        y: Math.round(firstY + index * totalSpacing),
      }));
    } else if (type === 'grid') {
      // 2D Matrix Alignment: aligns selected cards horizontally in rows and vertically in columns
      const sorted = [...activeCards].sort((a, b) => {
        const bandA = Math.floor(a.y / 180);
        const bandB = Math.floor(b.y / 180);
        if (bandA !== bandB) return bandA - bandB;
        return a.x - b.x;
      });

      const count = sorted.length;
      let numCols = 3;
      if (count <= 2) numCols = count;
      else if (count <= 4) numCols = 2;
      else if (count <= 9) numCols = 3;
      else numCols = 4;

      const numRows = Math.ceil(count / numCols);
      const matrix: (Card | null)[][] = Array.from({ length: numRows }, () =>
        new Array(numCols).fill(null)
      );

      sorted.forEach((card, index) => {
        const r = Math.floor(index / numCols);
        const c = index % numCols;
        matrix[r][c] = card;
      });

      const rowHeights = new Array(numRows).fill(300);
      for (let r = 0; r < numRows; r++) {
        let maxH = 260;
        for (let c = 0; c < numCols; c++) {
          const card = matrix[r][c];
          if (card) maxH = Math.max(maxH, card.height || 320);
        }
        rowHeights[r] = maxH;
      }

      const colWidths = new Array(numCols).fill(340);
      for (let c = 0; c < numCols; c++) {
        let maxW = 320;
        for (let r = 0; r < numRows; r++) {
          const card = matrix[r][c];
          if (card) maxW = Math.max(maxW, card.width || 340);
        }
        colWidths[c] = maxW;
      }

      const minX = Math.min(...activeCards.map((c) => c.x));
      const minY = Math.min(...activeCards.map((c) => c.y));
      const gapX = 36;
      const gapY = 36;

      const colStartX = new Array(numCols).fill(minX);
      for (let c = 1; c < numCols; c++) {
        colStartX[c] = colStartX[c - 1] + colWidths[c - 1] + gapX;
      }

      const rowStartY = new Array(numRows).fill(minY);
      for (let r = 1; r < numRows; r++) {
        rowStartY[r] = rowStartY[r - 1] + rowHeights[r - 1] + gapY;
      }

      updatedCards = [];
      for (let r = 0; r < numRows; r++) {
        for (let c = 0; c < numCols; c++) {
          const card = matrix[r][c];
          if (card) {
            updatedCards.push({
              id: card.id,
              x: colStartX[c],
              y: rowStartY[r],
            });
          }
        }
      }
    }

    if (updatedCards.length > 0) {
      const updateMap = new Map(updatedCards.map((u) => [u.id, u]));
      set((state) => ({
        allCards: state.allCards.map((c) => {
          const match = updateMap.get(c.id);
          return match ? { ...c, x: match.x, y: match.y, updatedAt: new Date().toISOString() } : c;
        }),
      }));
      soundFx.playDrop();
      get().saveBoardLocally();
    }
  },

  updateSelectedCardsColor: (color: CardColor) => {
    const { selectedCardIds } = get();
    if (selectedCardIds.length === 0) return;
    const now = new Date().toISOString();

    set((state) => ({
      allCards: state.allCards.map((c) =>
        selectedCardIds.includes(c.id) ? { ...c, color, updatedAt: now } : c
      ),
    }));
    soundFx.playDrop();
    get().saveBoardLocally();
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

    const supabase = getSupabase();
    if (supabase) {
      supabase.auth.getUser().then(async ({ data: { user } }) => {
        if (user) {
          try {
            await supabase.from('connections').delete().or(`from_card_id.eq.${id},to_card_id.eq.${id}`);
            await supabase.from('cards').delete().eq('id', id).eq('user_id', user.id);
          } catch (err) {
            console.error('Error deleting card from Supabase:', err);
          }
        }
      });
    }
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
      const savedSections = localStorage.getItem('drag2place_sections');
      const savedBoards = localStorage.getItem('drag2place_boards');
      const savedActiveBoardId = localStorage.getItem('drag2place_active_board_id');
      const savedTheme = localStorage.getItem('drag2place_theme') as 'light' | 'dark' | null;

      let boardsList = INITIAL_BOARDS;
      if (savedBoards) {
        try {
          const parsed = JSON.parse(savedBoards);
          if (Array.isArray(parsed) && parsed.length > 0) {
            // Deduplicate IDs so every board can be uniquely switched & deleted
            const seenIds = new Set<string>();
            boardsList = parsed.map((b: Board, idx: number) => {
              let id = b.id || `board-${idx}-${Date.now().toString(36)}`;
              if (seenIds.has(id)) {
                id = `${id}-dup-${idx}-${Math.random().toString(36).substring(2, 6)}`;
              }
              seenIds.add(id);
              return { ...b, id };
            });
            set({ boards: boardsList });
          }
        } catch {
          boardsList = INITIAL_BOARDS;
        }
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
      if (savedSections) {
        set({ allSections: JSON.parse(savedSections) });
      }

      set({
        activeBoardId: activeId,
        currentBoard: current,
      });

      if (savedTheme) {
        set({ theme: savedTheme });
        if (savedTheme === "dark") {
          document.documentElement.classList.add("dark");
          document.documentElement.style.colorScheme = "dark";
        } else {
          document.documentElement.classList.remove("dark");
          document.documentElement.style.colorScheme = "light";
        }
      } else {
        set({ theme: "light" });
        document.documentElement.classList.remove("dark");
        document.documentElement.style.colorScheme = "light";
      }
    } catch {
      // Keep defaults
    }
  },

  saveBoardLocally: (skipCloudSync = false) => {
    if (typeof window === 'undefined') return;
    try {
      set({ saveStatus: 'saving' });
      const { allCards, allConnections, allSections, boards, activeBoardId, theme } = get();
      localStorage.setItem('drag2place_cards', JSON.stringify(allCards));
      localStorage.setItem('drag2place_connections', JSON.stringify(allConnections));
      localStorage.setItem('drag2place_sections', JSON.stringify(allSections));
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
        .eq('user_id', user.id)
        .returns<SupabaseBoardRow[]>();

      if (bErr || !cloudBoards || cloudBoards.length === 0) {
        // No existing boards in cloud yet, automatically push current local workspace
        await get().syncWithSupabase();
        set({ isSyncing: false, lastSyncedAt: new Date().toISOString() });
        return;
      }

      const { data: cloudCards } = await supabase
        .from('cards')
        .select('*')
        .eq('user_id', user.id)
        .returns<SupabaseCardRow[]>();

      const { data: cloudConns } = await supabase
        .from('connections')
        .select('*')
        .returns<SupabaseConnRow[]>();

      const mappedBoards: Board[] = (cloudBoards || []).map((b: SupabaseBoardRow) => ({
        id: b.id,
        title: b.title,
        description: b.description || '',
        theme: get().theme,
        pan: { x: b.pan_x ?? 0, y: b.pan_y ?? 0 },
        zoom: b.zoom ?? 1,
        createdAt: b.created_at,
        updatedAt: b.updated_at,
      }));

      const mappedCards: Card[] = (cloudCards || []).map((c: SupabaseCardRow) => ({
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

      const mappedConns: Connection[] = (cloudConns || []).map((conn: SupabaseConnRow) => ({
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
