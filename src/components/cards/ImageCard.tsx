'use client';

import React, { useState, useRef } from 'react';
import { ImageCardData } from '@/types/board';
import { Upload, Maximize2, X } from 'lucide-react';
import Image from 'next/image';

interface ImageCardProps {
  cardId: string;
  data: ImageCardData;
  onChange: (data: Partial<ImageCardData>) => void;
}

export const ImageCard: React.FC<ImageCardProps> = ({ data, onChange }) => {
  const [showLightbox, setShowLightbox] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onChange({ url: reader.result, originalName: file.name });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (urlInput.trim()) {
      onChange({ url: urlInput.trim() });
      setShowUrlInput(false);
      setUrlInput('');
    }
  };

  return (
    <div className="flex flex-col h-full space-y-2">
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/*"
        className="hidden"
      />

      {/* Image container */}
      <div className="relative flex-1 min-h-[160px] rounded-lg overflow-hidden bg-stone-200/40 group/img">
        {data.url ? (
          <>
            <Image
              src={data.url}
              alt={data.caption || 'Moodboard image'}
              fill
              className="object-cover transition-transform duration-300 group-hover/img:scale-102"
              unoptimized
            />
            {/* Quick action buttons */}
            <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover/img:opacity-100 transition-opacity">
              <button
                onClick={() => setShowLightbox(true)}
                className="p-1.5 bg-black/50 hover:bg-black/70 text-white rounded-full backdrop-blur-xs transition-colors"
                title="Expand preview"
              >
                <Maximize2 size={12} />
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-1.5 bg-black/50 hover:bg-black/70 text-white rounded-full backdrop-blur-xs transition-colors"
                title="Replace image"
              >
                <Upload size={12} />
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-4 text-center text-stone-400 space-y-2">
            <Upload size={24} className="stroke-1" />
            <p className="text-xs">Drag & drop or upload image</p>
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-2.5 py-1 text-xs bg-stone-800 text-stone-100 rounded-md hover:bg-stone-700 transition-colors"
              >
                Choose File
              </button>
              <button
                onClick={() => setShowUrlInput(!showUrlInput)}
                className="px-2.5 py-1 text-xs border border-stone-300 text-stone-700 rounded-md hover:bg-stone-100 transition-colors"
              >
                Paste URL
              </button>
            </div>
          </div>
        )}
      </div>

      {/* URL input modal / toggle */}
      {showUrlInput && (
        <form onSubmit={handleUrlSubmit} className="flex gap-1 pt-1">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://images.unsplash.com/..."
            className="flex-1 text-xs p-1.5 bg-stone-50 border border-stone-300 rounded outline-none"
          />
          <button
            type="submit"
            className="px-2 text-xs bg-stone-800 text-stone-100 rounded"
          >
            Load
          </button>
        </form>
      )}

      {/* Caption input */}
      <input
        type="text"
        value={data.caption || ''}
        onChange={(e) => onChange({ caption: e.target.value })}
        placeholder="Add caption or note..."
        className="w-full text-xs italic bg-transparent outline-none text-stone-700 placeholder-stone-400 px-0.5"
      />

      {/* Lightbox modal */}
      {showLightbox && data.url && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-8"
          onClick={() => setShowLightbox(false)}
        >
          <button
            onClick={() => setShowLightbox(false)}
            className="absolute top-6 right-6 p-2 text-white/80 hover:text-white"
          >
            <X size={24} />
          </button>
          <div className="relative max-w-4xl max-h-[85vh] w-full h-full flex flex-col items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <Image
              src={data.url}
              alt={data.caption || ''}
              width={1200}
              height={800}
              className="max-h-[80vh] w-auto object-contain rounded-lg shadow-2xl"
              unoptimized
            />
            {data.caption && (
              <p className="mt-3 text-stone-300 text-sm italic">{data.caption}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
