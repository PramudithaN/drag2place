'use client';

import dynamic from 'next/dynamic';

const InfiniteCanvas = dynamic(
  () => import('@/components/canvas/InfiniteCanvas').then((mod) => mod.InfiniteCanvas),
  { ssr: false }
);

export default function Home() {
  return (
    <main className="w-screen h-screen overflow-hidden bg-[#FAF8F5]">
      <InfiniteCanvas />
    </main>
  );
}
