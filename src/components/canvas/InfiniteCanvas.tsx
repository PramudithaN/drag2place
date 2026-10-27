'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useBoardStore } from '@/lib/store';
import { CanvasGrid } from './CanvasGrid';
import { ConnectionLine } from './ConnectionLine';
import { CardWrapper } from '../cards/CardWrapper';
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

  // Zooming with mouse wheel anchored to cursor
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();

      if (e.ctrlKey || e.metaKey) {
        // Pinch-to-zoom
        const zoomFactor = 1 - e.deltaY * 0.005;
        const newZoom = Math.min(Math.max(currentBoard.zoom * zoomFactor, 0.25), 2.5);

        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return;

        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const newPanX = mouseX - (mouseX - currentBoard.pan.x) * (newZoom / currentBoard.zoom);
        const newPanY = mouseY - (mouseY - currentBoard.pan.y) * (newZoom / currentBoard.zoom);

        setZoom(newZoom);
        setPan({ x: newPanX, y: newPanY });
      } else {
        // Normal trackpad pan
        setPan({
          x: currentBoard.pan.x - e.deltaX / currentBoard.zoom,
          y: currentBoard.pan.y - e.deltaY / currentBoard.zoom,
        });
      }
    },
    [currentBoard.pan, currentBoard.zoom, setPan, setZoom]
  );

  // Pan start
  const handleMouseDown = (e: React.MouseEvent) => {
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
      useBoardStore.getState().saveBoardLocally();
    }
  };

  // Find cards for connection lines
  const cardMap = new Map(cards.map((c) => [c.id, c]));

  return (
    <div
      ref={containerRef}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
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

        {/* Cards layer */}
        {cards.map((card) => (
          <CardWrapper key={card.id} card={card} zoom={currentBoard.zoom} />
        ))}
      </div>

      {/* Bottom Floating macOS Dock */}
      <FloatingDock />

      {/* Canvas Viewport Controls */}
      <CanvasControls />

      {/* Confirmation Modal */}
      <ConfirmationModal />
    </div>
  );
};
