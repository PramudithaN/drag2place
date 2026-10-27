'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { useBoardStore } from '@/lib/store';
import { toPng } from 'html-to-image';
import { X, Image as ImageIcon, Download, Upload, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose }) => {
  const { currentBoard, exportWorkspaceJson, importWorkspaceJson } = useBoardStore();
  const [isExportingImage, setIsExportingImage] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleExportPng = async () => {
    const canvasElement = document.getElementById('infinite-canvas-viewport');
    if (!canvasElement) {
      setErrorMsg('Canvas element not found');
      return;
    }

    try {
      setIsExportingImage(true);
      setErrorMsg(null);

      const dataUrl = await toPng(canvasElement, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: document.documentElement.classList.contains('dark') ? '#141311' : '#FAF8F5',
      });

      const link = document.createElement('a');
      link.download = `${currentBoard.title.toLowerCase().replace(/\s+/g, '-')}-export.png`;
      link.href = dataUrl;
      link.click();

      setSuccessMsg('Board image exported successfully!');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to export image');
    } finally {
      setIsExportingImage(false);
    }
  };

  const handleExportJson = () => {
    try {
      const json = exportWorkspaceJson();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `drag2place-backup-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);

      setSuccessMsg('JSON backup downloaded!');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch {
      setErrorMsg('Failed to export JSON');
    }
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const ok = importWorkspaceJson(content);
        if (ok) {
          setSuccessMsg('Workspace restored successfully!');
          setTimeout(() => {
            setSuccessMsg(null);
            onClose();
          }, 1500);
        } else {
          setErrorMsg('Invalid backup file format');
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div
      onWheel={(e) => e.stopPropagation()}
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 dark:bg-black/60 backdrop-blur-xs p-4"
    >
      <div
        onWheel={(e) => e.stopPropagation()}
        className="relative w-full max-w-md bg-[#FAF8F5] dark:bg-[#1C1A17] border border-[#E6E0D4] dark:border-[#33302A] rounded-3xl p-6 shadow-2xl flex flex-col space-y-4"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-full"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-3">
          <Image
            src="/drag2placeLogo.png"
            alt="Drag2Place Logo"
            width={38}
            height={38}
            className="rounded-xl object-contain shadow-xs shrink-0"
          />
          <div>
            <h2 className="text-xl font-oregon font-bold text-stone-900 dark:text-stone-100">
              Export & Backup Board
            </h2>
            <p className="text-xs text-stone-600 dark:text-stone-400 mt-0.5">
              Save a high-resolution snapshot or download a complete data backup.
            </p>
          </div>
        </div>

        {successMsg && (
          <div className="flex items-center gap-2 p-2.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs rounded-xl">
            <CheckCircle2 size={14} className="shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="flex items-center gap-2 p-2.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs rounded-xl">
            <AlertCircle size={14} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Options */}
        <div className="space-y-2.5 pt-1">
          {/* Export PNG */}
          <button
            onClick={handleExportPng}
            disabled={isExportingImage}
            className="flex items-center justify-between w-full p-3.5 bg-white dark:bg-[#25221E] hover:bg-stone-50 dark:hover:bg-[#2E2B26] border border-stone-200 dark:border-stone-700 rounded-2xl transition-all shadow-xs text-left group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400">
                <ImageIcon size={18} />
              </div>
              <div>
                <div className="text-xs font-semibold text-stone-800 dark:text-stone-100">
                  Export Board as Image (PNG)
                </div>
                <div className="text-[11px] text-stone-500 dark:text-stone-400">
                  High-res 2x snapshot of the visible canvas
                </div>
              </div>
            </div>
            {isExportingImage ? (
              <Loader2 size={16} className="animate-spin text-stone-500" />
            ) : (
              <Download size={16} className="text-stone-400 group-hover:text-stone-700 dark:group-hover:text-stone-200" />
            )}
          </button>

          {/* Export JSON */}
          <button
            onClick={handleExportJson}
            className="flex items-center justify-between w-full p-3.5 bg-white dark:bg-[#25221E] hover:bg-stone-50 dark:hover:bg-[#2E2B26] border border-stone-200 dark:border-stone-700 rounded-2xl transition-all shadow-xs text-left group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400">
                <Download size={18} />
              </div>
              <div>
                <div className="text-xs font-semibold text-stone-800 dark:text-stone-100">
                  Export JSON Workspace Backup
                </div>
                <div className="text-[11px] text-stone-500 dark:text-stone-400">
                  Full backup of all boards, cards, and links
                </div>
              </div>
            </div>
          </button>

          {/* Import JSON */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportJson}
            accept=".json"
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-between w-full p-3.5 bg-white dark:bg-[#25221E] hover:bg-stone-50 dark:hover:bg-[#2E2B26] border border-stone-200 dark:border-stone-700 rounded-2xl transition-all shadow-xs text-left group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400">
                <Upload size={18} />
              </div>
              <div>
                <div className="text-xs font-semibold text-stone-800 dark:text-stone-100">
                  Restore from JSON Backup
                </div>
                <div className="text-[11px] text-stone-500 dark:text-stone-400">
                  Load cards and boards from a previous backup
                </div>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
