'use client';

import React, { useEffect } from 'react';
import { useBoardStore } from '@/lib/store';
import { WORKSPACE_MODES } from '@/lib/templates';
import { WorkspaceMode } from '@/types/board';
import { X, Terminal, Layout, Video, PenTool, Megaphone, Camera, ArrowRight, Sparkles } from 'lucide-react';
import { soundFx } from '@/lib/sound';

interface ModeSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ModeSelectorModal: React.FC<ModeSelectorModalProps> = ({ isOpen, onClose }) => {
  const { createBoardFromTemplate } = useBoardStore();

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSelectMode = (mode: WorkspaceMode) => {
    soundFx.playDrop();
    createBoardFromTemplate(mode);
    onClose();
  };

  const getModeIcon = (mode: WorkspaceMode) => {
    switch (mode) {
      case 'developer':
        return <Terminal size={22} className="text-sky-600 dark:text-sky-400" />;
      case 'designer':
        return <Layout size={22} className="text-emerald-600 dark:text-emerald-400" />;
      case 'video_editor':
        return <Video size={22} className="text-amber-600 dark:text-amber-400" />;
      case 'graphic_designer':
        return <PenTool size={22} className="text-purple-600 dark:text-purple-400" />;
      case 'marketing':
        return <Megaphone size={22} className="text-orange-600 dark:text-orange-400" />;
      case 'influencer':
        return <Camera size={22} className="text-rose-600 dark:text-rose-400" />;
    }
  };

  const getAccentBg = (mode: WorkspaceMode) => {
    switch (mode) {
      case 'developer':
        return 'bg-sky-50 dark:bg-sky-950/40 border-sky-200/80 dark:border-sky-800/60';
      case 'designer':
        return 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200/80 dark:border-emerald-800/60';
      case 'video_editor':
        return 'bg-amber-50 dark:bg-amber-950/40 border-amber-200/80 dark:border-amber-800/60';
      case 'graphic_designer':
        return 'bg-purple-50 dark:bg-purple-950/40 border-purple-200/80 dark:border-purple-800/60';
      case 'marketing':
        return 'bg-orange-50 dark:bg-orange-950/40 border-orange-200/80 dark:border-orange-800/60';
      case 'influencer':
        return 'bg-rose-50 dark:bg-rose-950/40 border-rose-200/80 dark:border-rose-800/60';
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 dark:bg-black/60 backdrop-blur-xs"
      onClick={onClose}
      onWheel={(e) => e.stopPropagation()}
    >
      <div
        className="relative w-full max-w-4xl max-h-[88vh] bg-[#FAF8F5] dark:bg-[#1C1A17] border border-[#E7E0D4] dark:border-[#33302A] rounded-3xl shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        onWheel={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 pb-4 border-b border-stone-200/70 dark:border-stone-800/70">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-sans font-medium bg-amber-100/80 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 mb-1.5">
              <Sparkles size={12} /> Curated Headstarter Workspaces
            </div>
            <h2 className="text-2xl font-oregon font-bold text-stone-900 dark:text-stone-100 tracking-wide">
              Select Your Workspace Mode
            </h2>
            <p className="text-xs text-stone-600 dark:text-stone-400 mt-1 max-w-xl leading-relaxed">
              Launch a tailored canvas with pre-configured cards, checklists, moodboard images, and connection arrows tailored to your profession.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-xl hover:bg-stone-200/50 dark:hover:bg-stone-800 transition-colors"
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modes Grid */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 scrollbar-thin">
          {(Object.keys(WORKSPACE_MODES) as WorkspaceMode[]).map((modeKey) => {
            const template = WORKSPACE_MODES[modeKey];
            return (
              <div
                key={modeKey}
                onClick={() => handleSelectMode(modeKey)}
                className="group relative flex flex-col justify-between p-5 bg-white dark:bg-[#23201C] hover:bg-[#FDFBF7] dark:hover:bg-[#2A2621] border border-stone-200 dark:border-stone-800 hover:border-stone-400 dark:hover:border-stone-600 rounded-2xl shadow-xs hover:shadow-md transition-all cursor-pointer text-left"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-2.5 rounded-xl border ${getAccentBg(modeKey)}`}>
                      {getModeIcon(modeKey)}
                    </div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400 dark:text-stone-500 bg-stone-100 dark:bg-stone-800/80 px-2 py-0.5 rounded-md">
                      {template.badge}
                    </span>
                  </div>

                  <h3 className="text-base font-oregon font-bold text-stone-900 dark:text-stone-100 group-hover:text-amber-800 dark:group-hover:text-amber-300 transition-colors">
                    {template.name}
                  </h3>
                  <div className="text-[11px] font-medium text-stone-500 dark:text-stone-400 mt-0.5">
                    {template.headline}
                  </div>

                  <p className="text-xs text-stone-600 dark:text-stone-400 mt-2.5 leading-relaxed line-clamp-3">
                    {template.description}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-stone-100 dark:border-stone-800/60 flex items-center justify-between text-xs font-semibold text-stone-700 dark:text-stone-300 group-hover:text-stone-900 dark:group-hover:text-stone-100">
                  <span className="text-[11px] font-mono text-stone-400 group-hover:text-stone-600 dark:group-hover:text-stone-300 transition-colors">
                    {template.cards.length} cards + arrows
                  </span>
                  <div className="flex items-center gap-1 text-[11px] text-amber-700 dark:text-amber-400 font-sans group-hover:translate-x-0.5 transition-transform">
                    <span>Launch</span>
                    <ArrowRight size={13} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="px-6 py-3 bg-stone-100/70 dark:bg-stone-900/70 border-t border-stone-200/70 dark:border-stone-800/70 flex items-center justify-between text-[11px] text-stone-500 dark:text-stone-400">
          <span>Each mode creates a new workspace board without overwriting your existing work.</span>
          <span className="font-mono text-[10px]">Press ESC to cancel</span>
        </div>
      </div>
    </div>
  );
};
