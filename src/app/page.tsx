import { CanvasContainer } from '@/components/canvas/CanvasContainer';

export default function Home() {
  return (
    <main className="relative w-screen h-screen overflow-hidden bg-[#FAF8F5]">
      {/* Semantic crawlable content for search engine indexers & assistive technology */}
      <section className="sr-only" aria-label="Drag2Place Workspace Introduction and Capabilities">
        <h1>Drag2Place - Aesthetic Spatial Personal Workspace & Visual Dashboard</h1>
        <p>
          Drag2Place is an open-source, spatial personal workspace inspired by Milanote.
          Organize your thoughts, plan projects, track deadlines, and assemble visual moodboards
          on an infinite, hardware-accelerated freeform canvas.
        </p>
        <h2>Dynamic Visual Cards</h2>
        <ul>
          <li>Markdown notes with typography customizer (Oregon LDO, Serif, Sans, Mono)</li>
          <li>Checklists and tasks with progress tracking and celebration effects</li>
          <li>Terminal-style code snippets with validation and copy tools</li>
          <li>Editable data tables and backlogs</li>
          <li>Interactive color palettes with WCAG contrast verification</li>
          <li>Audio visualizer memos with waveform playback</li>
          <li>Countdown launch timers</li>
          <li>Editorial pull-quotes and citations</li>
          <li>KPI metric goal progress trackers</li>
          <li>Spatial canvas comment pins and review balloons</li>
          <li>Rich web bookmark previews and interactive media embeds (YouTube, Spotify, Figma)</li>
          <li>Calendar events with Google Calendar sync and .ics export</li>
          <li>Media and image moodboard cards</li>
        </ul>
        <h2>Infinite Canvas Navigation & Tools</h2>
        <p>
          Features freeform panning, 25% to 250% zoom, 2D matrix auto-tidy layout, Milanote-style
          section group frames, spotlight search (Ctrl+F), smart magnetic alignment guides,
          radar minimap, and multi-board workspaces.
        </p>
      </section>

      {/* Fallback for web crawlers or users without JavaScript execution */}
      <noscript>
        <div className="p-8 max-w-2xl mx-auto bg-stone-100 text-stone-900 rounded-xl my-10 shadow-lg">
          <h2 className="text-xl font-bold mb-3">JavaScript Required for Full Interactive Canvas</h2>
          <p className="mb-4">
            Drag2Place is an interactive hardware-accelerated spatial workspace. Please enable JavaScript
            in your browser to pan, zoom, drag cards, and collaborate.
          </p>
          <p>
            Learn more about Drag2Place features, keyboard shortcuts, and local-first architecture on our{' '}
            <a href="https://github.com/PramudithaN/drag2place" className="underline font-semibold">
              GitHub repository
            </a>.
          </p>
        </div>
      </noscript>

      {/* Interactive Infinite Canvas */}
      <CanvasContainer />
    </main>
  );
}
