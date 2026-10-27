# Senior Developer & Security Guidelines (Coding Agent Instructions)

> **CRITICAL INSTRUCTION FOR ALL AI CODING AGENTS**:
> Whenever you analyze, plan, edit, or refactor code in this repository (**drag2place**), you must **strictly adhere** to all architectural best practices, security standards, UI/UX conventions, documentation maintenance, and commit conventions detailed in this document.

---

## 1. Project Overview & Architecture

**drag2place** is a production-grade application engineered with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, **Supabase**, **Zustand**.

> A modern full-stack web application powered by Next.js and React.

### Project Structure & Separation of Concerns:
```text
drag2place/
├── public                   # Static Assets, Media & Icons
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
├── src                      # Application Source Code
│   ├── app                      # Application Core / App Router
│   │   ├── favicon.ico
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components           # Reusable UI & View Components
│   │   ├── canvas
│   │   ├── cards
│   │   ├── dock
│   │   ├── navigation
│   │   └── ui
│   ├── lib                  # Helper Libraries & Shared Utilities
│   │   ├── supabase
│   │   ├── notifications.ts
│   │   ├── sound.ts
│   │   └── store.ts
│   └── types                # Type Definitions & Contracts
│       └── board.ts
├── .env.example
├── .gitignore
├── AGENTS.md
├── eslint.config.mjs
├── next-env.d.ts
├── next.config.ts
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
├── README.md
└── tsconfig.json
```

---

## 2. Professional Mindset & Clean Code Standards

1. **Senior TypeScript Architecture & Strict Typing:**
   - Enforce strict type safety: never use `any` or `as unknown as T` workarounds. Utilize explicit interfaces, tagged unions, and generics.
   - Ensure proper separation of concerns across state persistence, business domain logic, presentation UI, and platform bridges.
   - Keep `tsconfig.json` strict and ensure TypeScript compilation exits with 0 errors and 0 warnings.

2. **Next.js Server vs Client Component Boundaries:**
   - Maintain React Server Components (RSC) as the default. Confine `'use client'` strictly to leaf interactive components.
   - Server actions and database mutations must execute on the server with schema validation (e.g. Zod).

3. **DRY & Single Responsibility Principles:**
   - Decompose monolithic routines and large files into focused, reusable modules, services, and utility functions.
   - Decouple external API integrations and persistence layers behind clear domain interfaces.

---

## 3. Framework & Technical Guidelines

### Next.js & Fullstack React Guidelines:
1. **Data Caching & Revalidation:**
   - Leverage `fetch` cache tags and `revalidateTag` / `revalidatePath` for granular invalidation.
   - Never perform expensive database queries or expose secret credentials inside client-rendered code.
2. **Route Handlers & Server Actions:**
   - Validate incoming payloads using schema validators (Zod / TypeBox) before executing database mutations.

### UI / UX Design System & Layout Conventions:
1. **Design System & Visual Cohesion:**
   - Maintain consistent spacing tokens, typography hierarchies, and cohesive theme modes (dark/light) with WCAG AA contrast compliance.
   - Ensure smooth transitions, subtle glassmorphism effects, and accessible focus outlines on all interactive elements.

### Database, ORM & Persistence Standards:
1. **Schema Integrity & Migrations:**
   - Always validate database inputs with schema validators before triggering ORM queries.
   - Ensure proper indexes on foreign keys, lookups, and unique constraints for query performance.

---

## 4. Zero-Vulnerability & Cybersecurity Principles

1. **Zero Exposed Secrets & Environment Validation:**
   - Never hardcode private API keys, database credentials, or sensitive tokens in client-facing or version-controlled files.
   - Validate all runtime environment variables at application boot using schema parsers (e.g. Zod / envalid).

2. **Network Resilience & Latency Handling:**
   - All network calls must specify explicit timeout thresholds (e.g. `AbortSignal.timeout(10000)`).
   - Implement automatic exponential backoff retry with jitter for idempotent network requests to handle unstable 3G or high-latency connections.
   - Handle offline and degraded connection states gracefully (`navigator.onLine`, `offline` event listeners) without unhandled promise rejections or freezing UI state.

3. **Injection Defense & Cross-Platform Path Safety:**
   - Never construct shell commands via string concatenation (e.g., avoid `exec(`cmd ${input}`)`). Use parameterized execution APIs (`execFile` or `spawn` with array arguments) to eliminate Command Injection (CWE-78).
   - Normalize all file system paths using `node:path` (`path.join`, `path.resolve`) to ensure seamless cross-platform reliability on Windows, macOS, and Linux.
   - Parameterize all SQL/database queries and sanitize any HTML rendered dynamically (e.g. via DOMPurify) to prevent SQLi and XSS.

4. **Resource Management & Concurrency Safety:**
   - Prevent memory leaks: always unregister event listeners, clear intervals/timers, abort pending network requests, and tear down WebSockets/workers when components unmount.
   - Offload heavy compute operations away from the main UI thread to Web Workers or Worker Threads to maintain responsive 60fps rendering.

5. **Row-Level Security (RLS) & Authorization:**
   - Ensure all Supabase tables enforce strict Row-Level Security (RLS) policies. Never rely solely on client-side state for authorization.

6. **Clean Build Artifacts & Git Hygiene:**
   - Keep build artifacts (`dist`, `dist-electron`, `release`, `build`, `node_modules`, `.next`, `.turbo`) ignored in `.gitignore`.

---

## 5. Continuous Documentation Maintenance (README Sync)

1. **Keep Documentation Synchronized:**
   - Whenever adding new features, components, architecture changes, settings options, or build requirements, **you must update `README.md`** to reflect the changes.
   - Keep technology stack listings, installation/build instructions, and environment variable notes completely accurate.

---

## 6. Standard Git Commit Message Conventions

All commit messages in this project must follow the standard **Conventional Commits** specification:

### Format:
```text
<type>(<scope>): <short description in imperative mood>
```

### Commit Types:
* `feat(scope):` -> A new feature or user-facing capability (e.g. `feat(models): add animated cyber samurai 3D model`).
* `fix(scope):` -> A bug fix or error correction (e.g. `fix(tray): update mute icon on tray menu toggle`).
* `perf(scope):` -> Performance improvement (e.g. `perf(three): dispose unused textures on model swap`).
* `refactor(scope):` -> Code restructuring without changing functional behavior (e.g. `refactor(timers): extract interval calculation helper`).
* `security(scope):` -> Security hardening or IPC sanitization (e.g. `security(ipc): validate payload structure in main process`).
* `style(scope):` -> Styling, theme, or layout tweaks (e.g. `style(settings): refine slider contrast for dark theme`).
* `docs(scope):` -> Documentation updates (e.g. `docs(readme): document new stretch break intervals`).
* `chore(scope):` -> Maintenance, dependencies, build configuration (e.g. `chore(deps): update electron to latest patch release`).

---

## 7. Verification & Quality Assurance Runbook

Before completing any coding task, the agent must run and verify all of the following:

1. **Lint & Code Style Quality Check:**
   ```bash
   npm run lint
   ```
   *Must exit with code 0 without unaddressed errors.*

2. **TypeScript Strict Compilation:**
   ```bash
   npx tsc --noEmit
   ```
   *Must compile with zero TypeScript errors or type mismatches.*

3. **Production Build Verification:**
   ```bash
   npm run build
   ```
   *Must bundle cleanly with zero compilation or packaging errors.*

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
