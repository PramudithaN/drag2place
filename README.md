# Drag2Place — Aesthetic Spatial Workspace

A Milanote-inspired personal dashboard and spatial workspace designed for organizing tasks, events, ideas, and visual moodboards on an infinite freeform canvas.

![Drag2Place Preview](public/next.svg)

## ✨ Core Features

- **Infinite Freeform Canvas**:
  - Pan freely (`Space + Left Click` or middle-click) and Zoom (`Ctrl + Scroll` from 25% to 250%).
  - Warm minimalist aesthetic with custom dot matrix grid.
  - Coordinate-based drag-and-drop placement with z-index elevation and resizing.
  - Optional snap-to-grid mode.

- **Visual Card Suite**:
  - **Checklists & To-Do Lists**: Interactive check items, progress bars, strike-through animations, and celebratory confetti upon 100% completion.
  - **Notes & Ideas**: Custom typography switcher (**Editorial Serif**, **Modern Sans**, **Clean Mono**), font sizing, and warm stationery styling.
  - **Events & Deadlines**: Calendar date pickers, times, location tags, dynamic countdown badges (*"Today ✨"*, *"Tomorrow"*, *"In 3 days"*), and reminder alert windows.
  - **Media & Moodboards**: Local image uploads and URL embeds with captions and full-screen lightbox zoom.
  - **Warm Color Palette**: 7 curated tones (*Paper, Cream, Sage, Terracotta, Amber, Lavender, Sky*).

- **Milanote-Style Connecting Arrows**:
  - Interactive bezier curved arrows connecting related cards.
  - Easy deletion and hover controls.

- **macOS Floating Dock**:
  - Spring-magnified bottom dock with quick shortcuts (`N` for Note, `T` for Todo, `E` for Event, `I` for Image, `C` for Connect).

- **Audio & Notifications**:
  - Procedural Web Audio API sound effects (tactile woodblock pops, mellow chimes).
  - Web Notifications API for native browser push alerts.
  - In-app notification drawer for overdue and upcoming events.

- **Typography**:
  - Authentic **Oregon LDO** by Luke Owens for branding and header titles.
  - Paired with Plus Jakarta Sans, Lora, and JetBrains Mono.

- **Supabase Cloud Ready & Local-First**:
  - Zero-setup local-first storage with instant offline persistence.
  - Complete PostgreSQL migration schema in `src/lib/supabase/schema.sql` with Row Level Security (RLS).
  - Google One-Click OAuth and Email authentication ready via `.env.local`.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript (Strict)
- **Styling**: Tailwind CSS 4
- **Animation**: Framer Motion
- **Icons**: Lucide React
- **Sound**: Web Audio API
- **Backend / Auth**: Supabase (`@supabase/supabase-js`)
- **State**: Zustand

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Run the Development Server
```bash
pnpm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Connect Supabase (Optional)
1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
2. Fill in your `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
3. Run `src/lib/supabase/schema.sql` in your Supabase SQL editor.
