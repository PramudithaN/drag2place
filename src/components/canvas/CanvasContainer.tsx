'use client';

import dynamic from 'next/dynamic';

const InfiniteCanvas = dynamic(
  () => import('@/components/canvas/InfiniteCanvas').then((mod) => mod.InfiniteCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-[#FAF8F5] dark:bg-[#141311] text-stone-500 text-sm">
        <div className="flex items-center gap-3">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-stone-400 border-t-transparent" />
          <span>Loading spatial workspace...</span>
        </div>
      </div>
    ),
  }
);

export function CanvasContainer() {
  return <InfiniteCanvas />;
}
