# Drag2Place — Aesthetic Spatial Workspace

A Milanote-inspired personal dashboard and spatial workspace designed for organizing tasks, events, ideas, and visual moodboards on an infinite freeform canvas.

---

## ✨ Features Across All 5 Phases

### 1. **Infinite Freeform Spatial Canvas**
- Pan freely (`Space + Left Click` or middle-click) and Zoom (`Ctrl + Scroll` from 25% to 250%).
- Warm minimalist aesthetic with dot matrix grid.
- Coordinate-based drag-and-drop placement with z-index elevation and card resizing.
- Optional snap-to-grid mode.

### 2. **Multi-Board Workspace Management**
- Create multiple independent boards (e.g., *"Daily Canvas & Ideas"*, *"Product Roadmap & Vision"*, *"Life Goals"*).
- Switch between boards seamlessly from the top navigation dropdown.
- Inline board rename and board deletion.
- Each board maintains its own independent pan, zoom, cards, and connection arrows.

### 3. **Search & Command Palette (`Ctrl + K`)**
- Press `Ctrl + K` or click **Search** in the header to search across all cards, notes, tasks, and image captions.
- Click any search result to automatically fly/pan the viewport directly to that card and highlight it.
- Keyboard quick actions to create cards and toggle themes.

### 4. **Export to PNG Image & JSON Backup**
- **Export to Image (PNG)**: Capture and download high-resolution 2x snapshots of your visible canvas.
- **Export JSON Backup**: One-click download of all boards, cards, and connections into a `.json` backup file.
- **Restore Backup**: Upload a previous `.json` backup to restore your workspace anytime.

### 5. **Visual Card Suite**
- **Checklists & To-Do Lists**: Interactive check items, progress bars, strike-through animations, and celebratory confetti upon 100% completion.
- **Notes & Ideas**: Custom typography switcher (**Oregon LDO**, **Editorial Serif**, **Modern Sans**, **Clean Mono**), font sizing, and warm stationery styling.
- **Events & Deadlines**: Calendar date pickers, times, location tags, dynamic countdown badges (*"Today"*, *"Tomorrow"*, *"In 3 days"*), and reminder alert windows.
- **Media & Moodboards**: Local image uploads and URL embeds with captions and full-screen lightbox zoom.
- **Curated Color Palette**: 7 warm tones (*Paper, Cream, Sage, Terracotta, Amber, Lavender, Sky*).

### 6. **Milanote-Style Connecting Arrows**
- Interactive bezier curved arrows connecting related cards.
- Quick deletion and hover controls.

### 7. **macOS Floating Bottom Dock**
- Spring-magnified bottom dock with quick shortcuts (`N` for Note, `T` for Todo, `E` for Event, `I` for Image, `C` for Connect).

### 8. **Audio & Notifications**
- Procedural Web Audio API sound effects (tactile woodblock pops, mellow chimes).
- Web Notifications API for native browser push alerts.
- In-app notification drawer for overdue and upcoming events.

### 9. **Dark & Light Mode**
- Instant toggle between **Warm Minimalist Light** and **Obsidian Velvet Dark** themes.
- Preferences automatically persisted in `localStorage`.

### 10. **Typography**
- Authentic **Oregon LDO** by Luke Owens embedded directly for titles, headers, and branding.

### 11. **Supabase Cloud Ready & Local-First**
- Zero-setup local-first storage with instant offline persistence.
- Complete PostgreSQL migration schema in `src/lib/supabase/schema.sql` with Row Level Security (RLS).
- Google One-Click OAuth and Email authentication ready via `.env.local`.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript (Strict)
- **Styling**: Tailwind CSS 4
- **Animation**: Framer Motion
- **Icons**: Lucide React (no emojis)
- **Image Export**: `html-to-image`
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
