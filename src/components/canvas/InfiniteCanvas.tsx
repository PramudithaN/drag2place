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

export const InfiniteCanvas: React.FC = () => {
  const {
    currentBoard,
    getActiveCards,
    getActiveConnections,
    setPan,
    setZoom,
    resetView,
    clearSelection,
    activeTool,
    addCard,
    deleteCard,
    deleteConnection,
    selectedCardIds,
    checkReminders,
    loadBoard,
    openConfirmModal,
  } = useBoardStore();

  const cards = getActiveCards() || [];
  const connections = getActiveConnections() || [];

  const containerRef = useRef<HTMLDivElement>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [isSpacePressed, setIsSpacePressed] = useState(false);
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

      if (e.code === 'Space' && !e.repeat) {
        setIsSpacePressed(true);
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
  }, [addCard, deleteCard, selectedCardIds, openConfirmModal]);

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

  // Pan start & dismiss context menu
  const handleMouseDown = (e: React.MouseEvent) => {
    if (contextMenu) {
      setContextMenu(null);
    }
    if (e.button === 1 || isSpacePressed || e.target === containerRef.current) {
      e.preventDefault();
      setIsPanning(true);
      startPanRef.current = {
        x: currentBoard.pan.x,
        y: currentBoard.pan.y,
        mouseX: e.clientX,
        mouseY: e.clientY,
      };
      if (e.target === containerRef.current) {
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

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning) return;
    const deltaX = (e.clientX - startPanRef.current.mouseX) / currentBoard.zoom;
    const deltaY = (e.clientY - startPanRef.current.mouseY) / currentBoard.zoom;

    setPan({
      x: startPanRef.current.x + deltaX,
      y: startPanRef.current.y + deltaY,
    });
  };

  const handleMouseUp = () => {
    if (isPanning) {
      setIsPanning(false);
      useBoardStore.getState().saveBoardLocally(true);
    }
  };

  // Find cards for connection lines
  const cardMap = new Map(cards.map((c) => [c.id, c]));

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onContextMenu={handleContextMenu}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      className={`relative w-screen h-screen overflow-hidden bg-[#FAF8F5] dark:bg-[#141311] select-none ${
        isSpacePressed || isPanning
          ? 'cursor-grab active:cursor-grabbing'
          : activeTool === 'connect'
          ? 'cursor-crosshair'
          : 'cursor-default'
      }`}
    >
      {/* Background Dot Grid */}
      <CanvasGrid pan={currentBoard.pan} zoom={currentBoard.zoom} />

      {/* Header bar */}
      <HeaderBar />

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

        {/* Cards & Canvas Pins layer */}
        {cards.map((card) =>
          card.type === 'comment' ? (
            <CanvasCommentPin key={card.id} card={card} zoom={currentBoard.zoom} />
          ) : (
            <CardWrapper key={card.id} card={card} zoom={currentBoard.zoom} />
          )
        )}
      </div>

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
          onAddNote={() => addCard('note', { x: contextMenu.canvasX, y: contextMenu.canvasY })}
          onAddTodo={() => addCard('todo', { x: contextMenu.canvasX, y: contextMenu.canvasY })}
          onAddCode={() => addCard('code', { x: contextMenu.canvasX, y: contextMenu.canvasY })}
          onAddLink={() => addCard('link', { x: contextMenu.canvasX, y: contextMenu.canvasY })}
          onResetView={resetView}
          onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  );
};
