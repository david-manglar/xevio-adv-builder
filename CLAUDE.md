# Xevio Advertorial Builder

## Project Overview

SaaS tool for building high-converting advertorials via a 6-step wizard. Two modes: **Full** (guided) and **Lazy** (accelerated). Live in production with real users.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **UI:** React 19 + TypeScript (strict mode)
- **Styling:** Tailwind CSS v4 (OKLch colors, CSS custom properties)
- **Components:** shadcn/ui (New York style)
- **Drag & Drop:** @dnd-kit
- **Forms:** react-hook-form + Zod
- **Backend:** Supabase (auth, DB, realtime subscriptions)
- **Automation:** n8n webhooks (scraping, generation, lazy-generation)
- **Deployment:** Vercel (manual deploys)
- **Package manager:** npm or pnpm

## Design Tokens

| Token | Value | Usage |
|-------|-------|-------|
| Brand Teal | `#0dadb7` | Icons, accents |
| Brand Purple | `#4644B6` | CTAs, active states |
| Brand Gray | `#F6F6F6` | Backgrounds |
| Font | Inter | All text |

## Key Conventions

### Code Style
- Components: `"use client"`, PascalCase names, kebab-case filenames
- All UI built with shadcn/ui primitives — never raw HTML inputs/buttons
- Icons from `lucide-react` only
- Utility function: `cn()` from `@/lib/utils` for conditional classes
- Path aliases: `@/components`, `@/lib`, `@/components/ui`

### State Management
- All state lives in `app/page.tsx` via React hooks (no Redux/Zustand)
- Props down, callbacks up — minimal prop drilling
- Supabase Realtime for async updates (scraping status, etc.)

### API Routes
- Located in `app/api/`
- Use `fetch()` with try/catch pattern
- n8n webhooks are server-side only (secrets in env vars)
- Webhook secret: `N8N_WEBHOOK_SECRET` env var

### Component Pattern
```
interface StepProps {
  data: StepState
  updateData: (data: StepState) => void
  onNext: () => void
  onBack?: () => void
  campaignData: CampaignData
}
```

## Project Structure

```
app/                    → Next.js App Router (pages, layouts, API routes)
components/             → Feature components (step-*.tsx, mode-*.tsx, etc.)
components/ui/          → shadcn/ui primitives (do not edit manually)
lib/                    → Utilities (types.ts, supabase.ts, auth.ts, utils.ts)
docs/                   → Developer docs, .cursorrules, feature reference
n8n/                    → n8n workflow JSONs (gitignored — local only)
public/                 → Static assets and images
```

## External Integrations

### Supabase
- Instance: `fwrbocvmtxkozwradmkb.supabase.co`
- Primary table: `campaigns` (stores all wizard data, scraping results, status)
- Auth: email/password via Supabase Auth
- Realtime: subscriptions on campaign status changes
- Client initialized in `lib/supabase.ts`

### n8n
- Instance: `manglarmedia.app.n8n.cloud`
- v2 architecture: Unified Scraper (full+lazy), Full Writer, Lazy Writer, Google Doc Creator
- Payload docs: `docs/n8n-generation-workflow.md`, `docs/n8n-incremental-scraping.md`
- DEV workflow setup: `n8n/DEV-WORKFLOWS.md` (local only, gitignored)
- Workflow JSONs live in `/n8n` folder (gitignored — contain credentials)

### Output
- v2: in-app TipTap editor with AI rewrite, then optional export to Google Docs
- Editor uses A4-style container, placeholder styling for `[IMAGE: ...]` / `[CTA BUTTON: ...]` tokens

## Environment Variables

```bash
# Supabase (public — client-side auth & realtime)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=

# Supabase (secret — server-side API routes, bypasses RLS)
SUPABASE_SECRET_KEY=

# n8n webhooks (server-side only — never expose to client)
N8N_SCRAPE_WEBHOOK_URL=
N8N_GENERATE_WEBHOOK_URL=
N8N_LAZY_MODE_WEBHOOK_URL=
N8N_WEBHOOK_SECRET=

# DEV n8n webhooks (optional — takes priority over production URLs when set)
N8N_DEV_SCRAPE_WEBHOOK_URL=
N8N_DEV_FULL_MODE_WEBHOOK_URL=
N8N_DEV_LAZY_MODE_WEBHOOK_URL=
N8N_DEV_CREATE_DOC_WEBHOOK_URL=

# OpenRouter (for AI rewrite in editor)
OPENROUTER_API_KEY=
```

## Commands

```bash
pnpm dev        # Start dev server (localhost:3000)
pnpm build      # Production build
pnpm start      # Start production server
pnpm lint       # Run ESLint
```

Note: `next.config.mjs` has `typescript.ignoreBuildErrors: true` — build won't catch type errors.

## Git & Branching

- `main` branch = production (deployed on Vercel)
- `dev` branch = staging/preview (Vercel preview environment)
- Feature branches off `dev` for individual changes

**Important:** Never push directly to `main`. Always work on `dev` or feature branches.

## Working With This Project

### Do
- Read existing component code before modifying — patterns are consistent
- Use shadcn/ui for any new UI elements (`npx shadcn@latest add <component>`)
- Keep state in `app/page.tsx` unless there's a strong reason to move it
- Reference `docs/.features` for the full feature spec
- Check `docs/` for n8n payload structures before modifying API routes
- Test changes against the existing wizard flow (all 6 steps + lazy mode)

### Don't
- Don't introduce new state management libraries without discussion
- Don't modify `components/ui/` files directly (shadcn-managed)
- Don't expose n8n webhook URLs or secrets to client-side code
- Don't break the existing wizard flow — there are live users

## v2 Context

Major improvements (v2):
- [x] In-app AI editing environment (TipTap editor with AI rewrite)
- [x] LLM switching for end users (OpenRouter, 8 models)
- [x] n8n workflow restructuring (Unified Scraper, Lazy Writer, Google Doc Creator)
- [x] Dev/staging environment (Vercel preview on `dev` branch)
- [ ] Full Writer n8n workflow (Phase 5)
- [ ] New and modified building blocks
- [ ] Prompt refinements

### v2 Workflow Restructuring Progress

Plan: `docs/workflow-restructuring-plan.md`

| Phase | Description | Status |
|-------|-------------|--------|
| 1 | Frontend & API changes (scrape route, lazy-generate route, auto-trigger, UI) | Done |
| 2 | Unified Scraper n8n workflow (`dev-advb-unified-scraper.json`) | Done |
| 3 | Lazy Writer n8n workflow (`dev-advb-lazy-writer.json`) | Done — tested end-to-end |
| 4 | Google Doc Creator (`dev-advb-google-doc-creator.json`) | Done — tested end-to-end |
| 5 | Full Writer n8n workflow | Not started |

### Campaign status flow (v2)
`scraping` → `urls_processed` → `generating` → `drafted` → `completed`
- Writer workflows write `status: 'drafted'` (content ready in editor)
- Google Doc Creator writes `status: 'completed'` (doc exported)
- History menu: `drafted` = "Open in editor", `completed` = "Open Google Doc"

### Key changes already made
- `/api/scrape` handles both full and lazy modes via `mode` field; stores `custom_guidelines`
- `/api/lazy-generate` reads campaign from Supabase + triggers write-only workflow (incl. `custom_guidelines`)
- `lazy-mode-review.tsx` calls `/api/scrape` (not `/api/lazy-generate` directly)
- `page.tsx` auto-triggers generation when scraping completes (`urls_processed` status)
- `page.tsx` Realtime re-fetches full campaign on `drafted` or `completed` status
- `step-generating.tsx` shows phase-aware progress stepper (scraping → writing → done)
- In-app editor: A4 container, placeholder styling (`[IMAGE: ...]`, `[CTA BUTTON: ...]`), editable doc name
- AI rewrite: OpenRouter API with full article context, campaign context, user instruction as primary directive
- Google Doc export: modal dialog on completion, history menu updates
- History menu: "Open in editor" for drafts, "Open Google Doc" for exported campaigns
- OpenRouter model IDs: `anthropic/claude-sonnet-4.6` (dots, not dashes)
- LLM model shown in history settings panel
