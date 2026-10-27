'use client';

import React, { useState } from 'react';
import { CodeCardData } from '@/types/board';
import { Copy, Check, Wand2, Terminal } from 'lucide-react';
import { soundFx } from '@/lib/sound';

interface CodeCardProps {
  cardId: string;
  data: CodeCardData;
  onChange: (data: CodeCardData) => void;
}

const SUPPORTED_LANGUAGES = [
  { id: 'typescript', label: 'TypeScript' },
  { id: 'javascript', label: 'JavaScript' },
  { id: 'python', label: 'Python' },
  { id: 'json', label: 'JSON' },
  { id: 'sql', label: 'SQL' },
  { id: 'bash', label: 'Bash' },
  { id: 'html', label: 'HTML' },
  { id: 'css', label: 'CSS' },
];

export const CodeCard: React.FC<CodeCardProps> = ({ data, onChange }) => {
  const [copied, setCopied] = useState(false);
  const [formatStatus, setFormatStatus] = useState<string | null>(null);

  const handleCopy = () => {
    soundFx.playCheck();
    navigator.clipboard.writeText(data.code || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const handleFormatCode = () => {
    soundFx.playCheck();
    try {
      // Try JSON formatting
      const parsed = JSON.parse(data.code);
      const formatted = JSON.stringify(parsed, null, 2);
      onChange({ ...data, code: formatted, language: 'json' });
      setFormatStatus('Formatted JSON');
      setTimeout(() => setFormatStatus(null), 2000);
    } catch {
      // If not JSON, normalize indentation
      const lines = data.code.split('\n');
      const trimmedLines = lines.map((l) => l.trimEnd());
      onChange({ ...data, code: trimmedLines.join('\n') });
      setFormatStatus('Cleaned Indents');
      setTimeout(() => setFormatStatus(null), 2000);
    }
  };

  const lineCount = (data.code || '').split('\n').length;

  return (
    <div className="flex flex-col h-full bg-[#181614] text-stone-200 rounded-xl overflow-hidden border border-stone-800/80 shadow-inner">
      {/* Terminal Title Bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#12110F] border-b border-stone-800/80 shrink-0">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
          <input
            type="text"
            value={data.title}
            onChange={(e) => onChange({ ...data, title: e.target.value })}
            placeholder="Snippet title..."
            className="ml-2 text-xs font-mono font-medium text-stone-200 bg-transparent border-none focus:outline-hidden focus:ring-1 focus:ring-stone-600 rounded px-1 truncate max-w-[140px]"
          />
        </div>

        <div className="flex items-center gap-1">
          {/* Language selector */}
          <select
            value={data.language || 'typescript'}
            onChange={(e) => onChange({ ...data, language: e.target.value })}
            className="text-[10px] font-mono bg-stone-800 text-stone-300 border border-stone-700 rounded px-1.5 py-0.5 focus:outline-hidden"
          >
            {SUPPORTED_LANGUAGES.map((lang) => (
              <option key={lang.id} value={lang.id}>
                {lang.label}
              </option>
            ))}
          </select>

          {/* Format button */}
          <button
            onClick={handleFormatCode}
            className="p-1 text-stone-400 hover:text-amber-300 hover:bg-stone-800 rounded transition-colors"
            title="Prettify / Format Code"
          >
            <Wand2 size={13} />
          </button>

          {/* Copy button */}
          <button
            onClick={handleCopy}
            className="p-1 text-stone-400 hover:text-stone-100 hover:bg-stone-800 rounded transition-colors"
            title="Copy code"
          >
            {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
          </button>
        </div>
      </div>

      {/* Editor Body with Line Numbers */}
      <div className="relative flex-1 flex overflow-hidden font-mono text-xs leading-relaxed">
        {/* Line numbers gutter */}
        <div className="select-none py-2 px-2 text-right text-[11px] text-stone-600 bg-[#141210] border-r border-stone-800/60 font-mono">
          {Array.from({ length: Math.max(1, lineCount) }).map((_, i) => (
            <div key={i} className="leading-5">
              {i + 1}
            </div>
          ))}
        </div>

        {/* Code Textarea */}
        <textarea
          value={data.code}
          onChange={(e) => onChange({ ...data, code: e.target.value })}
          placeholder="// Paste or write code snippet here..."
          spellCheck={false}
          className="flex-1 p-2 bg-transparent text-emerald-300/90 focus:text-stone-100 font-mono text-xs leading-5 border-none resize-none focus:outline-hidden overflow-auto selection:bg-stone-700 selection:text-white"
          onKeyDown={(e) => {
            if (e.key === 'Tab') {
              e.preventDefault();
              const target = e.currentTarget;
              const start = target.selectionStart;
              const end = target.selectionEnd;
              const value = target.value;
              target.value = value.substring(0, start) + '  ' + value.substring(end);
              target.selectionStart = target.selectionEnd = start + 2;
              onChange({ ...data, code: target.value });
            }
          }}
        />
      </div>

      {/* Footer bar */}
      <div className="flex items-center justify-between px-3 py-1 bg-[#12110F] border-t border-stone-800/60 text-[10px] font-mono text-stone-500">
        <div className="flex items-center gap-1.5">
          <Terminal size={10} />
          <span>{lineCount} lines</span>
        </div>
        {formatStatus && <span className="text-amber-400/90 font-sans">{formatStatus}</span>}
        <span className="uppercase">{data.language || 'code'}</span>
      </div>
    </div>
  );
};
