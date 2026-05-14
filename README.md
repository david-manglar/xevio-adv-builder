# Xevio Advertorial Builder

A SaaS tool for building high-converting advertorials via a 6-step guided wizard. Supports two modes: **Full** (step-by-step guided) and **Lazy** (accelerated, URL-based).

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| UI | React 19 + TypeScript (strict) |
| Styling | Tailwind CSS v4 |
| Components | shadcn/ui (New York style) |
| Backend / Auth | Supabase (Postgres, Auth, Realtime) |
| Automation | n8n (scraping + content generation workflows) |
| AI rewrites | OpenRouter API |
| Web scraping | Firecrawl (used inside n8n workflows) |
| Deployment | Vercel |

---

## Project Structure

```
app/                    → Next.js App Router (pages, layouts, API routes)
  api/                  → Server-side API routes (n8n triggers, Supabase writes)
components/             → Feature components
  ui/                   → shadcn/ui primitives — do not edit manually
  editor/               → In-app TipTap editor + AI rewrite
lib/                    → Types, Supabase client, auth helpers, utils
docs/                   → Developer docs and n8n payload references
public/                 → Static assets
```

---

## Local Development Setup

### 1. Prerequisites

- Node.js 18+
- pnpm (`npm install -g pnpm`) or npm

### 2. Install dependencies

```bash
pnpm install
```

### 3. Environment variables

Create a `.env.local` file in the project root. This file is gitignored and must never be committed. Copy the template below and fill in each value from its respective platform (see [Where to find each value](#where-to-find-each-value)).

```bash
# ─── Supabase (public — used client-side for auth and realtime) ───────────────
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=

# ─── Supabase (secret — used server-side in API routes, bypasses RLS) ─────────
SUPABASE_SECRET_KEY=

# ─── OpenRouter (server-side only — AI rewrite feature in the editor) ─────────
OPENROUTER_API_KEY=

# ─── n8n webhooks — PRODUCTION ────────────────────────────────────────────────
# These are the live webhook URLs from the production n8n workflows.
# Find them in each workflow's Webhook trigger node in n8n.
N8N_SCRAPE_WEBHOOK_URL=
N8N_GENERATE_WEBHOOK_URL=
N8N_LAZY_MODE_WEBHOOK_URL=
N8N_WEBHOOK_SECRET=

# ─── n8n webhooks — DEV (optional) ───────────────────────────────────────────
# When these are set, they take priority over the production URLs above.
# Use this to point at test/dev workflows in n8n without touching production.
# Leave blank to use production webhooks.
N8N_DEV_SCRAPE_WEBHOOK_URL=
N8N_DEV_FULL_MODE_WEBHOOK_URL=
N8N_DEV_LAZY_MODE_WEBHOOK_URL=
N8N_DEV_CREATE_DOC_WEBHOOK_URL=
```

### 4. Start the dev server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Where to Find Each Value

### Supabase
**Platform:** [supabase.com](https://supabase.com) → Project: `fwrbocvmtxkozwradmkb`

| Variable | Where to find it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Project Settings → Data API → Project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Project Settings → Data API → Project API keys → `anon` / `public` key |
| `SUPABASE_SECRET_KEY` | Project Settings → Data API → Project API keys → `service_role` key (keep secret) |

The primary database table is `campaigns`. Run the migration in `docs/supabase-v2-migration.sql` on a fresh project to recreate the schema.

### n8n
**Platform:** [manglarmedia.app.n8n.cloud](https://manglarmedia.app.n8n.cloud)

There are four production workflows, each with a Webhook trigger node. Open each workflow, click the Webhook node, and copy the **Production URL**.

| Variable | Workflow |
|---|---|
| `N8N_SCRAPE_WEBHOOK_URL` | Unified Scraper |
| `N8N_GENERATE_WEBHOOK_URL` | Full Writer |
| `N8N_LAZY_MODE_WEBHOOK_URL` | Lazy Writer |
| `N8N_WEBHOOK_SECRET` | A shared secret set in each workflow's auth settings — must match across all workflows |

Payload structures are documented in `docs/n8n-generation-workflow.md` and `docs/n8n-incremental-scraping.md`.

### OpenRouter
**Platform:** [openrouter.ai](https://openrouter.ai) → API Keys

| Variable | Where to find it |
|---|---|
| `OPENROUTER_API_KEY` | Dashboard → Keys → Create or copy existing key |

Used only in `/api/ai-rewrite` for the in-app editor's AI rewrite feature.

### Firecrawl
Firecrawl is used **inside n8n**, not directly by this app. The API key lives in the n8n workflow credentials, not in `.env.local`. To update it: n8n → Credentials → Firecrawl API.

---

## Vercel Deployment

The project is deployed on Vercel connected to the GitHub repo.

- `main` branch → production environment
- `dev` branch → preview environment (staging)

**To deploy:** Push to `main`. Vercel auto-deploys.

**Environment variables on Vercel:** Go to Project → Settings → Environment Variables and add the same variables from `.env.local`. Set `NEXT_PUBLIC_*` variables for all environments; set secret variables (Supabase secret key, n8n URLs, OpenRouter key) for Production only (and Preview if needed).

---

## Scripts

```bash
pnpm dev        # Start dev server (localhost:3000)
pnpm build      # Production build
pnpm start      # Start production server
pnpm lint       # Run ESLint
```

---

## Campaign Status Flow

```
scraping → urls_processed → generating → drafted → completed
```

- `drafted` — content is ready in the in-app editor
- `completed` — content has been exported to Google Docs

---

## License

Private — All rights reserved.
