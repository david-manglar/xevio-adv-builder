# Xevio Advertorial Builder

## Handoff Note

v2 is complete and live in production. The project was handed off to the client in May 2026. The original v1 codebase is preserved as the `v1-legacy` git tag. For full setup and architecture documentation, see `README.md`.

---

## Project Overview

SaaS tool for building high-converting advertorials via a 5-step wizard. Two modes: **Full** (guided) and **Lazy** (accelerated). Live in production with real users.

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
docs/                   → Developer docs, feature reference, n8n payload docs
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
- 4 workflows: ADVB - Unified Scraper, ADVB - Full Writer, ADVB - Lazy Writer, ADVB - Google Doc Creator
- Payload docs: `docs/n8n-generation-workflow.md`, `docs/n8n-incremental-scraping.md`
- Workflow JSONs live in `/n8n` folder (gitignored — contain credentials)

### Output
- In-app TipTap editor with AI rewrite, then optional export to Google Docs
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
N8N_FULL_MODE_WEBHOOK_URL=
N8N_LAZY_MODE_WEBHOOK_URL=
N8N_CREATE_DOC_WEBHOOK_URL=
N8N_WEBHOOK_SECRET=

# OpenRouter (for AI rewrite in editor)
OPENROUTER_API_KEY=

# App environment — set to "dev" on Vercel Preview environment only
# Controls header label: unset = "Advertorial Builder", "dev" = "Advertorial Builder (dev)"
NEXT_PUBLIC_APP_ENV=
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
- `v1-legacy` tag = archived v1 codebase
- Feature branches off `dev` for individual changes

**Important:** Never push directly to `main`. Always work on `dev` or feature branches.

## Working With This Project

### Do
- Read existing component code before modifying — patterns are consistent
- Use shadcn/ui for any new UI elements (`npx shadcn@latest add <component>`)
- Keep state in `app/page.tsx` unless there's a strong reason to move it
- Check `docs/` for n8n payload structures before modifying API routes
- Test changes against the existing wizard flow (all 5 steps + lazy mode)

### Don't
- Don't introduce new state management libraries without discussion
- Don't modify `components/ui/` files directly (shadcn-managed)
- Don't expose n8n webhook URLs or secrets to client-side code
- Don't break the existing wizard flow — there are live users

## v2 Features (all shipped)

- [x] In-app AI editing environment (TipTap editor with AI rewrite)
- [x] LLM switching for end users (OpenRouter, 8 models)
- [x] n8n workflow restructuring — Unified Scraper, Full Writer, Lazy Writer, Google Doc Creator
- [x] Dev/staging environment (Vercel preview on `dev` branch)
- [x] Admin panel with user management
- [x] User profile panel

### n8n Workflows

| Workflow | File (local, gitignored) | Status |
|---|---|---|
| ADVB - Unified Scraper | `n8n/advb-unified-scraper.json` | Live |
| ADVB - Full Writer | `n8n/advb-full-writer.json` | Live |
| ADVB - Lazy Writer | `n8n/advb-lazy-writer.json` | Live |
| ADVB - Google Doc Creator | `n8n/advb-google-doc-creator.json` | Live |
| ADVB - Scraper (v1) | `n8n/advb-scraper-v1.json` | Deactivated |
| ADVB - Writer (v1) | `n8n/advb-writer-v1.json` | Deactivated |
| ADVB - Lazy Mode (v1) | `n8n/advb-lazy-mode-v1.json` | Deactivated |

### Campaign status flow
`scraping` → `urls_processed` → `generating` → `drafted` → `completed`
- Writer workflows write `status: 'drafted'` (content ready in editor)
- Google Doc Creator writes `status: 'completed'` (doc exported)
- History menu: `drafted` = "Open in editor", `completed` = "Open Google Doc"
