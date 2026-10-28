'use client';

import React from 'react';
import { useBoardStore } from '@/lib/store';
import { WORKSPACE_MODES } from '@/lib/templates';
import { WorkspaceMode } from '@/types/board';
import { Modal } from '@/components/ui/Modal';
import {
  X,
  Terminal,
  Layout,
  Video,
  PenTool,
  Megaphone,
  Camera,
  Target,
  Building2,
  Music,
  BookOpen,
  ArrowRight,
} from 'lucide-react';
import { soundFx } from '@/lib/sound';

interface ModeSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ModeSelectorModal: React.FC<ModeSelectorModalProps> = ({ isOpen, onClose }) => {
  const { createBoardFromTemplate } = useBoardStore();

  const handleSelectMode = (mode: WorkspaceMode, scenarioId?: string) => {
    soundFx.playDrop();
    createBoardFromTemplate(mode, scenarioId);
    onClose();
  };

  const getModeIcon = (mode: WorkspaceMode) => {
    switch (mode) {
      case 'developer':
        return <Terminal size={20} className="text-sky-600 dark:text-sky-400" />;
      case 'designer':
        return <Layout size={20} className="text-emerald-600 dark:text-emerald-400" />;
      case 'video_editor':
        return <Video size={20} className="text-amber-600 dark:text-amber-400" />;
      case 'graphic_designer':
        return <PenTool size={20} className="text-purple-600 dark:text-purple-400" />;
      case 'marketing':
        return <Megaphone size={20} className="text-orange-600 dark:text-orange-400" />;
      case 'influencer':
        return <Camera size={20} className="text-rose-600 dark:text-rose-400" />;
      case 'product_manager':
        return <Target size={20} className="text-indigo-600 dark:text-indigo-400" />;
      case 'architect':
        return <Building2 size={20} className="text-teal-600 dark:text-teal-400" />;
      case 'music_producer':
        return <Music size={20} className="text-violet-600 dark:text-violet-400" />;
      case 'author':
        return <BookOpen size={20} className="text-stone-700 dark:text-stone-300" />;
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
      case 'product_manager':
        return 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200/80 dark:border-indigo-800/60';
      case 'architect':
        return 'bg-teal-50 dark:bg-teal-950/40 border-teal-200/80 dark:border-teal-800/60';
      case 'music_producer':
        return 'bg-violet-50 dark:bg-violet-950/40 border-violet-200/80 dark:border-violet-800/60';
      case 'author':
        return 'bg-stone-100 dark:bg-stone-900/60 border-stone-200 dark:border-stone-700';
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="5xl"
      ariaLabel="Select Your Workspace Mode"
    >
      {/* Header */}
      <div className="shrink-0 flex items-start justify-between p-3.5 sm:p-6 pb-3 sm:pb-4 border-b border-stone-200/70 dark:border-stone-800/70 gap-3">
        <div className="flex-1 min-w-0">
          <div className="inline-flex items-center px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-[11px] font-sans font-medium bg-amber-100/80 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 mb-1 sm:mb-1.5">
            Curated Headstarter Workspaces
          </div>
          <h2 className="text-lg sm:text-2xl font-oregon font-bold text-stone-900 dark:text-stone-100 tracking-wide">
            Select Your Workspace Mode
          </h2>
          <p className="text-[11px] sm:text-xs text-stone-600 dark:text-stone-400 mt-0.5 sm:mt-1 max-w-2xl leading-relaxed">
            Launch a tailored canvas with domain-specific cards, task checklists, and aesthetic moodboards structured for your profession.
          </p>
          <div className="mt-2 sm:mt-2.5 inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-[10px] sm:text-xs font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
            <span><strong>Safe:</strong> Creates a brand new workspace board. Your existing boards and cards remain untouched.</span>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-1.5 sm:p-2 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-xl hover:bg-stone-200/50 dark:hover:bg-stone-800 transition-colors cursor-pointer shrink-0"
          title="Close (Esc)"
          aria-label="Close modal"
        >
          <X size={18} />
        </button>
      </div>

      {/* Modes Grid */}
      <div className="flex-1 min-h-0 overflow-y-auto p-3.5 sm:p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4.5 scrollbar-thin">
        {(Object.keys(WORKSPACE_MODES) as WorkspaceMode[]).map((modeKey) => {
          const template = WORKSPACE_MODES[modeKey];
          const hasSubScenarios = template.subScenarios && template.subScenarios.length > 0;

          return (
            <div
              key={modeKey}
              onClick={() => handleSelectMode(modeKey)}
              className="group relative flex flex-col justify-between p-4 sm:p-5 bg-white dark:bg-[#23201C] hover:bg-[#FDFBF7] dark:hover:bg-[#2A2621] border border-stone-200 dark:border-stone-800 hover:border-stone-400 dark:hover:border-stone-600 rounded-2xl shadow-xs hover:shadow-md transition-all cursor-pointer text-left"
            >
              <div>
                <div className="flex items-center justify-between mb-2.5 sm:mb-3">
                  <div className={`p-2 sm:p-2.5 rounded-xl border ${getAccentBg(modeKey)}`}>
                    {getModeIcon(modeKey)}
                  </div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400 dark:text-stone-500 bg-stone-100 dark:bg-stone-800/80 px-2 py-0.5 rounded-md">
                    {template.badge}
                  </span>
                </div>

                <h3 className="text-sm sm:text-base font-oregon font-bold text-stone-900 dark:text-stone-100 group-hover:text-amber-800 dark:group-hover:text-amber-300 transition-colors">
                  {template.name}
                </h3>
                <div className="text-[11px] font-medium text-stone-500 dark:text-stone-400 mt-0.5">
                  {template.headline}
                </div>

                <p className="text-[11px] sm:text-xs text-stone-600 dark:text-stone-400 mt-2 leading-relaxed line-clamp-3">
                  {template.description}
                </p>

                {/* Optional Alternative Scenarios */}
                {hasSubScenarios && (
                  <div className="mt-3 pt-2.5 border-t border-stone-100 dark:border-stone-800/60 flex flex-col gap-1.5">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-stone-400 dark:text-stone-500">
                      Alternative Scenario:
                    </div>
                    {template.subScenarios?.map((sub) => (
                      <button
                        type="button"
                        key={sub.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectMode(modeKey, sub.id);
                        }}
                        className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[10px] sm:text-[11px] font-sans text-stone-700 dark:text-stone-300 bg-stone-100/70 hover:bg-stone-200/80 dark:bg-stone-800/60 dark:hover:bg-stone-700/80 transition-colors text-left"
                      >
                        <span className="truncate mr-1.5">{sub.name}</span>
                        <ArrowRight size={11} className="shrink-0 text-stone-400" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-3.5 mt-3.5 border-t border-stone-100 dark:border-stone-800/60 flex items-center justify-between text-xs font-semibold text-stone-700 dark:text-stone-300 group-hover:text-stone-900 dark:group-hover:text-stone-100">
                <span className="text-[10px] sm:text-[11px] font-mono text-stone-400 group-hover:text-stone-600 dark:group-hover:text-stone-300 transition-colors">
                  {template.cards.length} cards
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
      <div className="shrink-0 px-4 sm:px-6 py-2.5 sm:py-3 bg-stone-100/70 dark:bg-stone-900/70 border-t border-stone-200/70 dark:border-stone-800/70 flex items-center justify-between text-[10px] sm:text-[11px] text-stone-500 dark:text-stone-400">
        <span className="truncate mr-2">Each mode creates a new workspace board without overwriting your existing work.</span>
        <span className="font-mono text-[10px] shrink-0 hidden xs:inline">Press ESC to cancel</span>
      </div>
    </Modal>
  );
};
