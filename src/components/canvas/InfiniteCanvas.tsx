'use client';

import React, { useRef, useEffect, useState } from 'react';
import { useBoardStore } from '@/lib/store';
import { CanvasGrid } from './CanvasGrid';
import { ConnectionLine } from './ConnectionLine';
import { CardWrapper } from '../cards/CardWrapper';
import { CanvasCommentPin } from './CanvasCommentPin';
import { CanvasContextMenu } from './CanvasContextMenu';
import { FloatingDock } from '../dock/FloatingDock';
import { CanvasControls } from './CanvasControls';
import { HeaderBar } from '../navigation/HeaderBar';
import { ConfirmationModal } from '../ui/ConfirmationModal';
import { MultiSelectActionBar } from './MultiSelectActionBar';
import { CanvasMinimap } from './CanvasMinimap';
import { SectionFrame } from './SectionFrame';
import { SpotlightFilterBar } from './SpotlightFilterBar';

export const InfiniteCanvas: React.FC = () => {
  const {
    currentBoard,
    getActiveCards,
    getActiveConnections,
    getActiveSections,
    setPan,
    setZoom,
    resetView,
    fitToScreen,
    tidyUpBoard,
    clearSelection,
    activeTool,
    setActiveTool,
    addCard,
    addSection,
    deleteCard,
    duplicateSelectedCards,
    selectAllCards,
    selectCardsInRect,
    deleteConnection,
    selectedCardIds,
    alignmentGuides,
    checkReminders,
    loadBoard,
    openConfirmModal,
  } = useBoardStore();

  const cards = getActiveCards() || [];
  const connections = getActiveConnections() || [];
  const sections = getActiveSections() || [];

  const containerRef = useRef<HTMLDivElement>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const [marquee, setMarquee] = useState<{
    startX: number;
    startY: number;
    currentX: number;
    currentY: number;
  } | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    screenX: number;
    screenY: number;
    canvasX: number;
    canvasY: number;
  } | null>(null);
  const startPanRef = useRef<{ x: number; y: number; mouseX: number; mouseY: number }>({
    x: 0,
    y: 0,
    mouseX: 0,
    mouseY: 0,
  });

  // Load saved local board on startup
  useEffect(() => {
    loadBoard();
  }, [loadBoard]);

  // Periodic reminder checker
  useEffect(() => {
    checkReminders();
    const interval = setInterval(() => {
      checkReminders();
    }, 30000);
    return () => clearInterval(interval);
  }, [checkReminders]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || (e.target as HTMLElement)?.isContentEditable) {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && (e.key === 'd' || e.key === 'D')) {
        e.preventDefault();
        duplicateSelectedCards();
        return;
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'a' || e.key === 'A')) {
        e.preventDefault();
        selectAllCards();
        return;
      } else if (e.shiftKey && (e.key === '!' || e.key === '1')) {
        e.preventDefault();
        fitToScreen();
        return;
      }

      if (e.code === 'Space' && !e.repeat) {
        setIsSpacePressed(true);
      } else if (e.key === 'h' || e.key === 'H') {
        const currentTool = useBoardStore.getState().activeTool;
        setActiveTool(currentTool === 'pan' ? 'select' : 'pan');
      } else if (e.key === 'v' || e.key === 'V') {
        setActiveTool('select');
      } else if (e.key === 'Escape') {
        setActiveTool('select');
      } else if (e.key === 'n' || e.key === 'N') {
        addCard('note');
      } else if (e.key === 't' || e.key === 'T') {
        addCard('todo');
      } else if (e.key === 'c' || e.key === 'C') {
        addCard('code');
      } else if (e.key === 'p' || e.key === 'P') {
        addCard('palette');
      } else if (e.key === 'm' || e.key === 'M') {
        addCard('metric');
      } else if (e.key === 'e' || e.key === 'E') {
        addCard('event');
      } else if (e.key === 'i' || e.key === 'I') {
        addCard('image');
      } else if ((e.key === 'f' || e.key === 'F') && !e.ctrlKey && !e.metaKey) {
        addSection('New Section');
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedCardIds.length === 0) return;
        const count = selectedCardIds.length;
        openConfirmModal({
          title: count > 1 ? `Delete ${count} Cards?` : 'Delete Card?',
          message: count > 1
            ? `Are you sure you want to permanently delete these ${count} selected cards? Any connecting arrows will also be removed.`
            : 'Are you sure you want to permanently delete this card and its connecting arrows?',
          confirmText: count > 1 ? `Delete ${count} Cards` : 'Delete Card',
          isDestructive: true,
          icon: 'trash',
          onConfirm: () => {
            selectedCardIds.forEach((id) => deleteCard(id));
          },
        });
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsSpacePressed(false);
        setIsPanning(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [addCard, addSection, deleteCard, duplicateSelectedCards, selectAllCards, fitToScreen, selectedCardIds, openConfirmModal, setActiveTool]);

  // Universal clipboard paste (Ctrl+V) anywhere on the canvas
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || (e.target as HTMLElement)?.isContentEditable) {
        return;
      }

      const state = useBoardStore.getState();
      const zoom = state.currentBoard.zoom;
      const pan = state.currentBoard.pan;

      // Center position in canvas world coordinates
      const targetCanvasX = window.innerWidth / 2 / zoom - pan.x;
      const targetCanvasY = window.innerHeight / 2 / zoom - pan.y;
      const spawnPos = { x: Math.round(targetCanvasX - 150), y: Math.round(targetCanvasY - 100) };

      // 1. Check for image files in clipboard (e.g. copied screenshot)
      const files = e.clipboardData?.files;
      if (files && files.length > 0) {
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          if (file.type.startsWith('image/')) {
            e.preventDefault();
            const reader = new FileReader();
            reader.onload = () => {
              const result = reader.result as string;
              const newCard = state.addCard('image', spawnPos);
              state.updateCardContent(newCard.id, {
                url: result,
                caption: file.name || 'Pasted Image',
              });
            };
            reader.readAsDataURL(file);
            return;
          }
        }
      }

      // 2. Check for text data in clipboard
      const text = e.clipboardData?.getData('text')?.trim();
      if (!text) return;

      e.preventDefault();

      // Check if it's a URL
      const isUrl = /^https?:\/\//i.test(text);
      if (isUrl) {
        const isImageUrl = /\.(png|jpe?g|webp|gif|svg)(\?.*)?$/i.test(text);
        if (isImageUrl) {
          const newCard = state.addCard('image', spawnPos);
          state.updateCardContent(newCard.id, {
            url: text,
            caption: 'Pasted Image URL',
          });
        } else {
          const newCard = state.addCard('link', spawnPos);
          state.updateCardContent(newCard.id, {
            url: text,
            title: '',
          });
        }
        return;
      }

      // Check if it's formatted JSON
      if ((text.startsWith('{') && text.endsWith('}')) || (text.startsWith('[') && text.endsWith(']'))) {
        try {
          const parsed = JSON.parse(text);
          const pretty = JSON.stringify(parsed, null, 2);
          const newCard = state.addCard('code', spawnPos);
          state.updateCardContent(newCard.id, {
            title: 'Pasted JSON Data',
            code: pretty,
            language: 'json',
          });
          return;
        } catch {
          // Fall through to note
        }
      }

      // Default: create a Note card
      const newCard = state.addCard('note', spawnPos);
      state.updateCardContent(newCard.id, {
        title: '',
        body: text,
      });
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Wheel zoom (Ctrl + mouse wheel / trackpad pinch) and canvas trackpad pan
  useEffect(() => {
    const handleGlobalWheel = (e: WheelEvent) => {
      const container = containerRef.current;
      if (!container) return;

      // 1. If Ctrl or Meta is held: zoom the canvas anchored to cursor
      if (e.ctrlKey || e.metaKey) {
        // Prevent native browser page zoom completely
        e.preventDefault();

        // If hovering inside an open modal dialog, don't zoom the background canvas
        const modalElement = document.querySelector('[role="dialog"]');
        if (modalElement && modalElement.contains(e.target as Node)) {
          return;
        }

        const state = useBoardStore.getState();
        const currentZoom = state.currentBoard.zoom;
        const currentPan = state.currentBoard.pan;

        // Normalize delta across line, page, or pixel deltaMode
        const rawDelta = e.deltaMode === 1 ? e.deltaY * 20 : e.deltaMode === 2 ? e.deltaY * 100 : e.deltaY;
        // Smooth exponential zoom factor for uniform feel in both directions
        const zoomFactor = Math.exp(-rawDelta * 0.0015);
        const newZoom = Math.min(Math.max(currentZoom * zoomFactor, 0.25), 2.5);

        const rect = container.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const newPanX = mouseX - (mouseX - currentPan.x) * (newZoom / currentZoom);
        const newPanY = mouseY - (mouseY - currentPan.y) * (newZoom / currentZoom);

        setZoom(newZoom);
        setPan({ x: newPanX, y: newPanY });

        // Debounced local storage save
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = setTimeout(() => {
          useBoardStore.getState().saveBoardLocally(true);
        }, 600);
      } else {
        // 2. Normal two-finger trackpad panning on the canvas viewport
        const target = e.target as HTMLElement | null;
        if (!target) return;

        // If target is inside scrollable card content or modal, allow native content scrolling
        const isScrollable = target.closest('[data-scrollable="true"]') || target.closest('textarea') || target.closest('pre') || target.closest('[role="dialog"]');
        if (!isScrollable && container.contains(target)) {
          // Prevent browser back/forward swipe history navigation
          e.preventDefault();
          const state = useBoardStore.getState();
          const currentZoom = state.currentBoard.zoom;
          const currentPan = state.currentBoard.pan;

          setPan({
            x: currentPan.x - e.deltaX / currentZoom,
            y: currentPan.y - e.deltaY / currentZoom,
          });

          if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
          saveTimeoutRef.current = setTimeout(() => {
            useBoardStore.getState().saveBoardLocally(true);
          }, 600);
        }
      }
    };

    window.addEventListener('wheel', handleGlobalWheel, { passive: false });
    return () => {
      window.removeEventListener('wheel', handleGlobalWheel);
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [setZoom, setPan]);

  // Touch handling for mobile & tablet (single-finger pan, two-finger pinch-zoom & pan, long-press context menu)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let touchMode: 'none' | 'pan' | 'pinch' = 'none';
    let startX = 0;
    let startY = 0;
    let startPanX = 0;
    let startPanY = 0;
    let startDist = 0;
    let startZoom = 1;
    let pinchMidX = 0;
    let pinchMidY = 0;
    let hasMoved = false;
    let longPressTimeout: ReturnType<typeof setTimeout> | null = null;

    const clearLongPress = () => {
      if (longPressTimeout) {
        clearTimeout(longPressTimeout);
        longPressTimeout = null;
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      // Ignore touches on cards, comment pins, buttons, inputs, dialogs, dock, headers
      const isCard = target.closest('[data-card="true"]') || target.closest('[data-comment-pin="true"]');
      const isInteractiveUI = target.closest(
        'button, input, textarea, select, [role="button"], [role="dialog"], header, nav, [data-dock="true"], [data-controls="true"]'
      );
      if (isCard || isInteractiveUI) {
        clearLongPress();
        return;
      }

      // Close open context menu on canvas touch
      setContextMenu(null);

      if (e.touches.length === 1) {
        const touch = e.touches[0];
        touchMode = 'pan';
        startX = touch.clientX;
        startY = touch.clientY;
        const state = useBoardStore.getState();
        startPanX = state.currentBoard.pan.x;
        startPanY = state.currentBoard.pan.y;
        hasMoved = false;

        // Long press detection for spatial context menu
        clearLongPress();
        longPressTimeout = setTimeout(() => {
          if (!hasMoved && touchMode === 'pan') {
            touchMode = 'none';
            if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
              try {
                navigator.vibrate(20);
              } catch {}
            }
            const rect = container.getBoundingClientRect();
            const mouseX = touch.clientX - rect.left;
            const mouseY = touch.clientY - rect.top;
            const curZoom = useBoardStore.getState().currentBoard.zoom;
            const curPan = useBoardStore.getState().currentBoard.pan;
            const canvasX = Math.round(mouseX / curZoom - curPan.x);
            const canvasY = Math.round(mouseY / curZoom - curPan.y);

            setContextMenu({
              screenX: touch.clientX,
              screenY: touch.clientY,
              canvasX,
              canvasY,
            });
          }
        }, 500);
      } else if (e.touches.length === 2) {
        clearLongPress();
        touchMode = 'pinch';
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        startDist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
        const state = useBoardStore.getState();
        startZoom = state.currentBoard.zoom;
        startPanX = state.currentBoard.pan.x;
        startPanY = state.currentBoard.pan.y;
        pinchMidX = (t1.clientX + t2.clientX) / 2;
        pinchMidY = (t1.clientY + t2.clientY) / 2;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (touchMode === 'none') return;

      // Prevent native browser scroll and pull-to-refresh
      if (e.cancelable) {
        e.preventDefault();
      }

      if (touchMode === 'pan' && e.touches.length === 1) {
        const touch = e.touches[0];
        const dx = touch.clientX - startX;
        const dy = touch.clientY - startY;

        if (Math.hypot(dx, dy) > 8) {
          hasMoved = true;
          clearLongPress();
        }

        const state = useBoardStore.getState();
        const curZoom = state.currentBoard.zoom;
        setPan({
          x: startPanX + dx / curZoom,
          y: startPanY + dy / curZoom,
        });
      } else if (touchMode === 'pinch' && e.touches.length === 2) {
        clearLongPress();
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        const curDist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
        if (startDist <= 0) return;

        const scale = curDist / startDist;
        const newZoom = Math.min(Math.max(startZoom * scale, 0.25), 2.5);

        const curMidX = (t1.clientX + t2.clientX) / 2;
        const curMidY = (t1.clientY + t2.clientY) / 2;

        const rect = container.getBoundingClientRect();
        const anchorX = pinchMidX - rect.left;
        const anchorY = pinchMidY - rect.top;

        const basePanX = anchorX - (anchorX - startPanX) * (newZoom / startZoom);
        const basePanY = anchorY - (anchorY - startPanY) * (newZoom / startZoom);

        const deltaMidX = (curMidX - pinchMidX) / newZoom;
        const deltaMidY = (curMidY - pinchMidY) / newZoom;

        setZoom(newZoom);
        setPan({
          x: basePanX + deltaMidX,
          y: basePanY + deltaMidY,
        });
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      clearLongPress();
      if (e.touches.length === 0) {
        if (touchMode !== 'none') {
          useBoardStore.getState().saveBoardLocally(true);
        }
        touchMode = 'none';
      } else if (e.touches.length === 1) {
        const touch = e.touches[0];
        touchMode = 'pan';
        startX = touch.clientX;
        startY = touch.clientY;
        const state = useBoardStore.getState();
        startPanX = state.currentBoard.pan.x;
        startPanY = state.currentBoard.pan.y;
        hasMoved = true;
      }
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });
    container.addEventListener('touchcancel', handleTouchEnd, { passive: true });

    return () => {
      clearLongPress();
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
      container.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [setPan, setZoom]);

  // Global drag handler during panning so moving fast or over cards keeps panning smoothly
  useEffect(() => {
    if (!isPanning) return;

    document.body.style.cursor = 'grabbing';
    document.body.style.userSelect = 'none';

    const handleWindowMouseMove = (e: MouseEvent) => {
      const state = useBoardStore.getState();
      const currentZoom = state.currentBoard.zoom;
      const deltaX = (e.clientX - startPanRef.current.mouseX) / currentZoom;
      const deltaY = (e.clientY - startPanRef.current.mouseY) / currentZoom;

      setPan({
        x: startPanRef.current.x + deltaX,
        y: startPanRef.current.y + deltaY,
      });
    };

    const handleWindowMouseUp = () => {
      setIsPanning(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      useBoardStore.getState().saveBoardLocally(true);
    };

    window.addEventListener('mousemove', handleWindowMouseMove);
    window.addEventListener('mouseup', handleWindowMouseUp);

    return () => {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      window.removeEventListener('mousemove', handleWindowMouseMove);
      window.removeEventListener('mouseup', handleWindowMouseUp);
    };
  }, [isPanning, setPan]);

  // Global drag handler during marquee box selection
  useEffect(() => {
    if (!marquee) return;

    document.body.style.cursor = 'crosshair';
    document.body.style.userSelect = 'none';

    const handleWindowMouseMove = (e: MouseEvent) => {
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const state = useBoardStore.getState();
      const canvasX = (e.clientX - rect.left) / state.currentBoard.zoom - state.currentBoard.pan.x;
      const canvasY = (e.clientY - rect.top) / state.currentBoard.zoom - state.currentBoard.pan.y;

      setMarquee((prev) => (prev ? { ...prev, currentX: canvasX, currentY: canvasY } : null));

      selectCardsInRect(
        {
          left: Math.min(marquee.startX, canvasX),
          top: Math.min(marquee.startY, canvasY),
          right: Math.max(marquee.startX, canvasX),
          bottom: Math.max(marquee.startY, canvasY),
        },
        false
      );
    };

    const handleWindowMouseUp = () => {
      setMarquee(null);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    window.addEventListener('mousemove', handleWindowMouseMove);
    window.addEventListener('mouseup', handleWindowMouseUp);

    return () => {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      window.removeEventListener('mousemove', handleWindowMouseMove);
      window.removeEventListener('mouseup', handleWindowMouseUp);
    };
  }, [marquee, selectCardsInRect]);

  // Pan start & dismiss context menu
  const handleMouseDown = (e: React.MouseEvent) => {
    if (contextMenu) {
      setContextMenu(null);
    }

    const target = e.target as HTMLElement | null;
    if (!target) return;

    // Ignore interactive UI like buttons, inputs, dialogs, dock, headers
    const isInteractiveUI = Boolean(
      target.closest(
        'button, input, textarea, select, [role="button"], [role="dialog"], header, nav, [data-dock="true"], [data-controls="true"]'
      )
    );
    if (isInteractiveUI) return;

    const isCard = Boolean(target.closest('[data-card="true"]') || target.closest('[data-comment-pin="true"]'));

    // Marquee box selection starts when dragging with Shift held (on empty canvas or card surface)
    if (e.button === 0 && e.shiftKey && activeTool !== 'connect') {
      e.preventDefault();
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const canvasX = (e.clientX - rect.left) / currentBoard.zoom - currentBoard.pan.x;
      const canvasY = (e.clientY - rect.top) / currentBoard.zoom - currentBoard.pan.y;
      setMarquee({
        startX: canvasX,
        startY: canvasY,
        currentX: canvasX,
        currentY: canvasY,
      });
      return;
    }

    // Pan should start if:
    // 1. Middle mouse button (button === 1)
    // 2. Space key is held down
    // 3. Hand tool is active in desktop mode (activeTool === 'pan')
    // 4. Left click (button === 0) on empty canvas (when not in connect mode and not clicking on a card)
    const shouldPan =
      e.button === 1 ||
      isSpacePressed ||
      activeTool === 'pan' ||
      (e.button === 0 && activeTool !== 'connect' && !isCard);

    if (shouldPan) {
      e.preventDefault();
      setIsPanning(true);
      startPanRef.current = {
        x: currentBoard.pan.x,
        y: currentBoard.pan.y,
        mouseX: e.clientX,
        mouseY: e.clientY,
      };
      if (!isCard) {
        clearSelection();
      }
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    // Allow native context menu on text inputs and editable fields
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
      return;
    }

    e.preventDefault();
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Convert mouse screen coordinates into infinite canvas world coordinates
    const canvasX = Math.round(mouseX / currentBoard.zoom - currentBoard.pan.x);
    const canvasY = Math.round(mouseY / currentBoard.zoom - currentBoard.pan.y);

    setContextMenu({
      screenX: e.clientX,
      screenY: e.clientY,
      canvasX,
      canvasY,
    });
  };

  // Find cards for connection lines
  const cardMap = new Map(cards.map((c) => [c.id, c]));

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onContextMenu={handleContextMenu}
      className={`relative w-screen h-screen overflow-hidden bg-[#FAF8F5] dark:bg-[#141311] select-none touch-none ${
        isPanning
          ? 'cursor-grabbing'
          : activeTool === 'connect'
          ? 'cursor-crosshair'
          : 'cursor-grab'
      }`}
    >
      {/* Background Dot Grid */}
      <CanvasGrid pan={currentBoard.pan} zoom={currentBoard.zoom} />

      {/* Header bar */}
      <HeaderBar />

      {/* Floating Spotlight Filter & Search Bar */}
      <SpotlightFilterBar />

      {/* World Canvas Layer (target for html-to-image export) */}
      <div
        id="infinite-canvas-viewport"
        className="absolute inset-0 origin-top-left pointer-events-auto"
        style={{
          transform: `scale(${currentBoard.zoom}) translate(${currentBoard.pan.x}px, ${currentBoard.pan.y}px)`,
        }}
      >
        {/* SVG layer for Milanote connection arrows */}
        <svg className="absolute inset-0 w-[50000px] h-[50000px] -translate-x-[25000px] -translate-y-[25000px] pointer-events-none overflow-visible">
          <defs>
            <marker
              id="arrowhead"
              markerWidth="8"
              markerHeight="6"
              refX="7"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 8 3, 0 6" fill="#8C7E72" />
            </marker>
          </defs>

          <g transform="translate(25000, 25000)">
            {connections.map((conn) => {
              const from = cardMap.get(conn.fromCardId);
              const to = cardMap.get(conn.toCardId);
              if (!from || !to) return null;

              return (
                <ConnectionLine
                  key={conn.id}
                  connection={conn}
                  fromCard={from}
                  toCard={to}
                  zoom={currentBoard.zoom}
                  onDelete={deleteConnection}
                />
              );
            })}
          </g>
        </svg>

        {/* Visual Section Group Frames layer (underneath cards) */}
        {sections.map((section) => (
          <SectionFrame key={section.id} section={section} zoom={currentBoard.zoom} />
        ))}

        {/* Dynamic Magnetic Alignment Guides */}
        {alignmentGuides?.vertical !== undefined && (
          <div
            className="absolute top-[-25000px] bottom-[-25000px] w-0 border-l border-dashed border-amber-600 dark:border-amber-400 pointer-events-none z-[9999]"
            style={{ left: `${alignmentGuides.vertical}px`, height: '50000px' }}
          />
        )}
        {alignmentGuides?.horizontal !== undefined && (
          <div
            className="absolute left-[-25000px] right-[-25000px] h-0 border-t border-dashed border-amber-600 dark:border-amber-400 pointer-events-none z-[9999]"
            style={{ top: `${alignmentGuides.horizontal}px`, width: '50000px' }}
          />
        )}

        {/* Cards & Canvas Pins layer */}
        {cards.map((card) =>
          card.type === 'comment' ? (
            <CanvasCommentPin key={card.id} card={card} zoom={currentBoard.zoom} />
          ) : (
            <CardWrapper key={card.id} card={card} zoom={currentBoard.zoom} />
          )
        )}

        {/* Marquee box selection rectangle - always on top of every card */}
        {marquee && (
          <div
            className="absolute border-2 border-amber-600/90 bg-amber-500/20 dark:border-amber-400 dark:bg-amber-400/20 rounded-lg pointer-events-none transition-none shadow-sm ring-1 ring-amber-500/30"
            style={{
              left: `${Math.min(marquee.startX, marquee.currentX)}px`,
              top: `${Math.min(marquee.startY, marquee.currentY)}px`,
              width: `${Math.abs(marquee.currentX - marquee.startX)}px`,
              height: `${Math.abs(marquee.currentY - marquee.startY)}px`,
              zIndex: 999999,
            }}
          />
        )}
      </div>

      {/* Floating Multi-Selection Action Bar (appears when 2+ cards selected) */}
      <MultiSelectActionBar />

      {/* Interactive Minimap Radar View */}
      <CanvasMinimap />

      {/* Bottom Floating macOS Dock */}
      <FloatingDock />

      {/* Canvas Viewport Controls */}
      <CanvasControls />

      {/* Confirmation Modal */}
      <ConfirmationModal />

      {/* Right-Click Spatial Context Menu */}
      {contextMenu && (
        <CanvasContextMenu
          x={contextMenu.screenX}
          y={contextMenu.screenY}
          onAddComment={() => addCard('comment', { x: contextMenu.canvasX, y: contextMenu.canvasY })}
          onAddSection={() => addSection('New Section', { x: contextMenu.canvasX, y: contextMenu.canvasY })}
          onAddNote={() => addCard('note', { x: contextMenu.canvasX, y: contextMenu.canvasY })}
          onAddTodo={() => addCard('todo', { x: contextMenu.canvasX, y: contextMenu.canvasY })}
          onAddCode={() => addCard('code', { x: contextMenu.canvasX, y: contextMenu.canvasY })}
          onAddLink={() => addCard('link', { x: contextMenu.canvasX, y: contextMenu.canvasY })}
          onAddEvent={() => addCard('event', { x: contextMenu.canvasX, y: contextMenu.canvasY })}
          onAddImage={() => addCard('image', { x: contextMenu.canvasX, y: contextMenu.canvasY })}
          onAddPalette={() => addCard('palette', { x: contextMenu.canvasX, y: contextMenu.canvasY })}
          onAddMetric={() => addCard('metric', { x: contextMenu.canvasX, y: contextMenu.canvasY })}
          onFitToScreen={fitToScreen}
          onTidyUp={tidyUpBoard}
          onResetView={resetView}
          onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  );
};
