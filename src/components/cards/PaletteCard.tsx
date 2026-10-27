'use client';

import React, { useState } from 'react';
import { PaletteCardData, SwatchItem } from '@/types/board';
import { Plus, Trash2, Check, Copy } from 'lucide-react';
import { soundFx } from '@/lib/sound';

interface PaletteCardProps {
  cardId: string;
  data: PaletteCardData;
  onChange: (data: PaletteCardData) => void;
}

// Simple WCAG relative luminance calculator
function getLuminance(hex: string): number {
  const cleanHex = hex.replace('#', '');
  if (cleanHex.length !== 6) return 0.5;
  const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
  const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
  const b = parseInt(cleanHex.substring(4, 6), 16) / 255;

  const a = [r, g, b].map((v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

function getContrastRatio(hex1: string, hex2: string): number {
  const lum1 = getLuminance(hex1);
  const lum2 = getLuminance(hex2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}

export const PaletteCard: React.FC<PaletteCardProps> = ({ data, onChange }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [newColorHex, setNewColorHex] = useState('#E07A5F');
  const [newColorName, setNewColorName] = useState('');

  const handleCopyHex = (swatch: SwatchItem) => {
    soundFx.playCheck();
    navigator.clipboard.writeText(swatch.hex);
    setCopiedId(swatch.id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleAddSwatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColorHex) return;
    const newSwatch: SwatchItem = {
      id: `sw-${Date.now()}`,
      name: newColorName.trim() || 'Custom Swatch',
      hex: newColorHex.toUpperCase(),
    };
    onChange({
      ...data,
      swatches: [...(data.swatches || []), newSwatch],
    });
    setNewColorName('');
    soundFx.playDrop();
  };

  const handleDeleteSwatch = (id: string) => {
    onChange({
      ...data,
      swatches: (data.swatches || []).filter((s) => s.id !== id),
    });
  };

  const handleUpdateSwatchName = (id: string, name: string) => {
    onChange({
      ...data,
      swatches: (data.swatches || []).map((s) => (s.id === id ? { ...s, name } : s)),
    });
  };

  return (
    <div className="flex flex-col h-full space-y-3 font-sans">
      {/* Title */}
      <input
        type="text"
        value={data.title}
        onChange={(e) => onChange({ ...data, title: e.target.value })}
        placeholder="Palette Title..."
        className="w-full text-base font-oregon font-bold text-stone-900 dark:text-stone-100 bg-transparent border-b border-transparent hover:border-stone-200 dark:hover:border-stone-700 focus:border-stone-400 focus:outline-hidden transition-colors px-0.5"
      />

      {/* Swatches List */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
        {(data.swatches || []).map((swatch) => {
          const ratioOnWhite = getContrastRatio(swatch.hex, '#FFFFFF');
          const isAA = ratioOnWhite >= 4.5;
          const isCopied = copiedId === swatch.id;

          return (
            <div
              key={swatch.id}
              className="group flex items-center justify-between p-2 rounded-xl bg-white/70 dark:bg-stone-900/60 border border-stone-200/80 dark:border-stone-800/80 hover:border-stone-300 dark:hover:border-stone-700 shadow-2xs transition-all"
            >
              {/* Color Block & Name */}
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className="w-7 h-7 rounded-lg shadow-inner shrink-0 border border-black/10 dark:border-white/10"
                  style={{ backgroundColor: swatch.hex }}
                />
                <div className="min-w-0">
                  <input
                    type="text"
                    value={swatch.name}
                    onChange={(e) => handleUpdateSwatchName(swatch.id, e.target.value)}
                    className="text-xs font-semibold text-stone-800 dark:text-stone-200 bg-transparent border-none focus:outline-hidden truncate w-full"
                  />
                  {swatch.pantone && (
                    <div className="text-[10px] text-stone-400 font-mono truncate">
                      {swatch.pantone}
                    </div>
                  )}
                </div>
              </div>

              {/* Hex Button & Contrast Badge */}
              <div className="flex items-center gap-1.5 shrink-0">
                <span
                  className={`text-[9px] font-mono px-1.5 py-0.5 rounded-sm font-semibold ${
                    isAA
                      ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                      : 'bg-stone-100 dark:bg-stone-800 text-stone-500'
                  }`}
                  title={`Contrast ratio ${ratioOnWhite.toFixed(1)}:1 against white`}
                >
                  {isAA ? 'AA' : `${ratioOnWhite.toFixed(1)}:1`}
                </span>

                <button
                  type="button"
                  onClick={() => handleCopyHex(swatch)}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-mono font-medium text-stone-700 dark:text-stone-300 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 transition-colors"
                  title="Copy Hex Code"
                >
                  {isCopied ? (
                    <>
                      <Check size={11} className="text-emerald-600" />
                      <span className="text-emerald-600">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy size={11} className="text-stone-400" />
                      <span>{swatch.hex}</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleDeleteSwatch(swatch.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-stone-400 hover:text-rose-500 rounded transition-opacity"
                  title="Remove swatch"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Swatch Bar */}
      <form onSubmit={handleAddSwatch} className="pt-2 border-t border-stone-200/60 dark:border-stone-800/60 flex items-center gap-2">
        <input
          type="color"
          value={newColorHex}
          onChange={(e) => setNewColorHex(e.target.value)}
          className="w-7 h-7 rounded-lg border border-stone-300 dark:border-stone-600 cursor-pointer bg-transparent shrink-0"
          title="Pick color"
        />
        <input
          type="text"
          value={newColorName}
          onChange={(e) => setNewColorName(e.target.value)}
          placeholder="New color name..."
          className="flex-1 text-xs px-2.5 py-1.5 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 placeholder-stone-400 border border-transparent focus:border-stone-400 focus:outline-hidden"
        />
        <button
          type="submit"
          className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-900 dark:bg-stone-100 dark:hover:bg-white text-stone-100 dark:text-stone-900 transition-colors shrink-0"
          title="Add Swatch"
        >
          <Plus size={14} />
        </button>
      </form>
    </div>
  );
};
