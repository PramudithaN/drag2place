'use client';

import React, { useState } from 'react';
import { LinkCardData } from '@/types/board';
import { ExternalLink, RotateCw, Globe, ArrowRight, Pencil, Image as ImageIcon } from 'lucide-react';
import { soundFx } from '@/lib/sound';

interface LinkCardProps {
  cardId: string;
  data: LinkCardData;
  onChange: (data: LinkCardData) => void;
}

export const LinkCard: React.FC<LinkCardProps> = ({ data, onChange }) => {
  const [urlInput, setUrlInput] = useState(data.url || '');
  const [isLoading, setIsLoading] = useState(false);
  const [isEditingUrl, setIsEditingUrl] = useState(!data.title && !data.description);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchPreview = async (urlToFetch: string) => {
    if (!urlToFetch) return;
    setIsLoading(true);
    setFetchError(null);

    // Auto prepend https if missing
    let normalized = urlToFetch.trim();
    if (!normalized.startsWith('http://') && !normalized.startsWith('https://')) {
      normalized = `https://${normalized}`;
    }

    try {
      const res = await fetch(`/api/link-preview?url=${encodeURIComponent(normalized)}`);
      if (!res.ok) throw new Error('Preview fetch failed');
      const json = await res.json();

      onChange({
        ...data,
        url: normalized,
        title: json.title || normalized,
        description: json.description || '',
        image: json.image || undefined,
        favicon: json.favicon || `https://www.google.com/s2/favicons?domain=${new URL(normalized).hostname}&sz=64`,
        siteName: json.siteName || new URL(normalized).hostname,
      });
      setIsEditingUrl(false);
      soundFx.playDrop();
    } catch (err) {
      console.warn('Error fetching preview:', err);
      setFetchError('Could not fetch rich preview, basic link saved');
      // Fallback
      try {
        const hostname = new URL(normalized).hostname;
        onChange({
          ...data,
          url: normalized,
          title: hostname,
          description: `Web link to ${hostname}`,
          siteName: hostname,
          favicon: `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`,
        });
        setIsEditingUrl(false);
      } catch {
        setFetchError('Please enter a valid URL');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPreview(urlInput);
  };

  const domain = data.url ? (() => {
    try {
      return new URL(data.url).hostname.replace(/^www\./, '');
    } catch {
      return data.url;
    }
  })() : '';

  return (
    <div className="flex flex-col h-full justify-between font-sans overflow-hidden">
      {/* If editing URL or inputting for the first time */}
      {isEditingUrl ? (
        <form onSubmit={handleSubmit} className="flex flex-col h-full justify-center p-2 space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-700 dark:text-stone-300">
            <Globe size={14} className="text-amber-700 dark:text-amber-400" />
            <span>Generate Link Preview</span>
          </div>

          <div className="relative">
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://github.com or figma.com..."
              className="w-full text-xs px-3 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200 placeholder-stone-400 focus:outline-hidden focus:border-stone-500 shadow-2xs font-mono"
              autoFocus
            />
          </div>

          {fetchError && (
            <div className="text-[11px] text-rose-500 font-sans">{fetchError}</div>
          )}

          <div className="flex items-center justify-end gap-2 pt-1">
            {data.url && (
              <button
                type="button"
                onClick={() => setIsEditingUrl(false)}
                className="px-2.5 py-1 text-xs text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={isLoading || !urlInput.trim()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-stone-900 hover:bg-black dark:bg-stone-100 dark:hover:bg-white text-stone-100 dark:text-stone-900 transition-colors disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RotateCw size={12} className="animate-spin" />
                  <span>Fetching...</span>
                </>
              ) : (
                <>
                  <span>Create Preview</span>
                  <ArrowRight size={12} />
                </>
              )}
            </button>
          </div>
        </form>
      ) : (
        /* Rich Preview Card Content */
        <div className="flex flex-col h-full justify-between">
          <div>
            {/* Hero Image if available */}
            {data.image ? (
              <div className="relative w-full h-28 -mx-3.5 -mt-3.5 mb-2.5 overflow-hidden bg-stone-200 dark:bg-stone-800">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={data.image}
                  alt={data.title || 'Link Preview'}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Hide broken image
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
            ) : (
              <div className="w-full h-10 -mx-3.5 -mt-3.5 mb-2.5 bg-gradient-to-r from-stone-200/60 to-stone-300/40 dark:from-stone-800/60 dark:to-stone-900/40 flex items-center px-4">
                <ImageIcon size={14} className="text-stone-400" />
              </div>
            )}

            {/* Favicon + Domain header */}
            <div className="flex items-center gap-1.5 mb-1.5">
              {data.favicon ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={data.favicon}
                  alt="Favicon"
                  className="w-3.5 h-3.5 rounded-xs object-contain shrink-0"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              ) : (
                <Globe size={13} className="text-stone-400 shrink-0" />
              )}
              <span className="text-[11px] font-mono text-stone-400 uppercase tracking-wider truncate">
                {data.siteName || domain}
              </span>
            </div>

            {/* Title */}
            <a
              href={data.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group/title block text-sm font-oregon font-bold text-stone-900 dark:text-stone-100 hover:text-amber-800 dark:hover:text-amber-300 transition-colors line-clamp-2 leading-tight"
            >
              {data.title || data.url}
            </a>

            {/* Description snippet */}
            {data.description && (
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 line-clamp-2 leading-relaxed">
                {data.description}
              </p>
            )}
          </div>

          {/* Footer controls */}
          <div className="pt-2 border-t border-stone-200/70 dark:border-stone-800/70 flex items-center justify-between text-xs text-stone-500">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  setUrlInput(data.url);
                  setIsEditingUrl(true);
                }}
                className="p-1 hover:text-stone-800 dark:hover:text-stone-200 rounded transition-colors"
                title="Edit URL"
              >
                <Pencil size={12} />
              </button>
              <button
                type="button"
                onClick={() => fetchPreview(data.url)}
                disabled={isLoading}
                className="p-1 hover:text-stone-800 dark:hover:text-stone-200 rounded transition-colors"
                title="Refresh preview"
              >
                <RotateCw size={12} className={isLoading ? 'animate-spin' : ''} />
              </button>
            </div>

            <a
              href={data.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 dark:text-amber-300 hover:underline"
            >
              <span>Visit Link</span>
              <ExternalLink size={11} />
            </a>
          </div>
        </div>
      )}
    </div>
  );
};
