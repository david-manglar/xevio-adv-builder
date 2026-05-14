# Xevio Advertorial Builder

A SaaS tool for building high-converting advertorials via an AI-assisted wizard. Supports two modes: **Full** (5-step guided builder) and **Lazy** (accelerated rewrite from an existing advertorial).

---

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [How the Tool Works](#how-the-tool-works)
   - [Full Mode](#full-mode--5-step-wizard)
   - [Lazy Mode](#lazy-mode--2-step-accelerated-flow)
3. [In-App Editor](#in-app-editor)
4. [Admin Panel](#admin-panel)
5. [Architecture](#architecture)
   - [Campaign Status Flow](#campaign-status-flow)
   - [API Routes](#api-routes)
   - [n8n Workflows](#n8n-workflows)
   - [Database Schema](#database-schema)
6. [Local Development Setup](#local-development-setup)
7. [Environment Variables](#environment-variables)
8. [Vercel Deployment](#vercel-deployment)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| UI | React 19 + TypeScript (strict) |
| Styling | Tailwind CSS v4 |
| Components | shadcn/ui (New York style) |
| Drag & Drop | @dnd-kit |
| Backend / Auth | Supabase (Postgres, Auth, Realtime) |
| Automation | n8n (scraping + content generation) |
| AI rewrites | OpenRouter API |
| Web scraping | Firecrawl (called from inside n8n) |
| Deployment | Vercel |

---

## How the Tool Works

### Full Mode — 5-Step Wizard

The full builder walks users through five steps to produce a structured advertorial from scratch.

#### Step 1: Campaign Setup
Collects the core brief:
- **Topic** — what the advertorial is about
- **Campaign type** — Lead Generation or E-commerce
- **Niche** — e.g. B2B SaaS, Health Supplements
- **Country & Language** — target market
- **Length** — target word count
- **Paragraph length** — Normal (3–4 lines), Short, Long
- **Compliance guidelines** — None, ERGO, or Custom (with free-text input)

#### Step 2: Reference Pages
User adds URLs that n8n will scrape to extract insights. Each URL can have an optional description.

Scraping behaviour is smart:
- **New campaign:** full scrape of all URLs
- **Add URLs only:** incremental scrape — only new URLs are scraped and merged with existing insights
- **Edit or remove URLs:** full re-scrape
- **Step 1 changed:** full re-scrape (changed brief = stale insights)

The scrape is triggered by `/api/scrape`, which calls the **Unified Scraper** n8n workflow and sets campaign status to `scraping`. The app listens via Supabase Realtime and updates the UI when scraping completes.

#### Step 3: Building Blocks
User assembles the advertorial structure using a drag-and-drop block builder. Blocks are ordered and can carry optional input values or dropdown selections. Available blocks include:

- **Opening:** Hook, Lede (Journalistic or Story), Headline
- **Body:** Problem, Solution, USP, Pricing, Feature Comparison, Social Proof, FAQ
- **Closing:** CTA, Disclaimer, Summary

Each block's name, position, and input values are sent to n8n to guide content generation.

#### Step 4: Insights
Displays insights extracted from the scraped URLs, grouped by category:
- **USPs** — unique selling points
- **Pricing** — pricing information
- **Main angle** — primary messaging angles
- **Tone of voice** — brand voice descriptors
- **Key hooks** — attention-grabbing openers

Users check which insights to include. They can also add custom insights or remove duplicates. Only the selected subset is sent to the writer workflow.

#### Step 5: Review & Generate
User reviews the full brief, can edit any field, then chooses an AI model and clicks Generate. The app calls `/api/generate`, which triggers the **Full Writer** n8n workflow.

**Available LLM models (via OpenRouter):**
- Claude Sonnet 4.6 / Opus 4.6
- GPT-4o / GPT-4.1
- Gemini 1.5 Pro
- Mistral Large
- DeepSeek R1

---

### Lazy Mode — 2-Step Accelerated Flow

Lazy mode is for rewriting or iterating on an existing advertorial quickly.

#### Step 1: Setup
- **Instructions** — what to do with the original advertorial (e.g. "Make it more conversational and shorter")
- **Advertorial URL** — the existing advertorial to rewrite (scraped as primary source)
- **Additional reference URLs** — optional supporting pages
- Same metadata as Full mode: campaign type, niche, country, language, length, compliance

#### Step 2: Review & Generate
User confirms the brief. Clicking Generate triggers `/api/scrape`, which scrapes the advertorial URL and references. When scraping completes (`urls_processed`), the app **automatically** triggers `/api/lazy-generate`, which calls the **Lazy Writer** n8n workflow — no extra user action required.

---

## In-App Editor

After generation completes (`drafted` status), the campaign opens in a TipTap-based rich text editor.

### Editing
Full WYSIWYG editing: bold, italic, underline, headings, lists. Changes autosave to Supabase (`editor_content` column) on every edit.

### Placeholders
The editor visually highlights special tokens the writer inserts:
- `[IMAGE: description]`
- `[CTA BUTTON: text]`
- `[PRODUCT WIDGET: ...]`
- `[VIDEO: ...]`
- `[DISCLAIMER: ...]`

These are displayed with a distinct background so users know they need to be replaced with real assets.

### AI Rewrite
Users can select any text, click **Rewrite**, and enter an instruction (e.g. "shorten this", "make it punchier"). The `/api/ai-rewrite` route sends the selected text, the full article, and the campaign context to Claude via OpenRouter. The response replaces the selection in the editor.

### Google Doc Export
Clicking **Export to Google Docs** calls `/api/create-google-doc`, which triggers the **Google Doc Creator** n8n workflow. n8n converts the editor's HTML into a Google Doc, stores it in the client's Google Drive, and returns a shareable URL. The campaign status updates to `completed` and a link appears in the history menu.

---

## Admin Panel

Accessible only to users with the `admin` role (stored in the `user_roles` table).

**Features:**
- List all users with email, display name, last sign-in date, and campaign counts
- Create new users (email + password, optional display name)
- Ban or delete users
- Assign or revoke the admin role
- Overview stats: total campaigns, drafted vs completed, total users

---

## Architecture

### Campaign Status Flow

Every campaign moves through a linear state machine:

```
scraping → urls_processed → generating → drafted → completed
```

| Status | Meaning |
|---|---|
| `scraping` | n8n Unified Scraper is running |
| `urls_processed` | Scraping complete, insights stored, ready to generate |
| `generating` | n8n writer workflow is running |
| `drafted` | Generated HTML is ready; campaign opens in editor |
| `completed` | Google Doc has been exported |

The frontend subscribes to Supabase Realtime on the active campaign row. Status changes written by n8n are received instantly and update the UI without polling.

---

### API Routes

| Route | Purpose | Calls |
|---|---|---|
| `POST /api/scrape` | Creates campaign in Supabase, triggers scraping | n8n Unified Scraper |
| `POST /api/generate` | Updates status to `generating`, sends full payload | n8n Full Writer |
| `POST /api/lazy-generate` | Reads campaign from DB, triggers lazy writer | n8n Lazy Writer |
| `POST /api/ai-rewrite` | Rewrites selected editor text | OpenRouter (Claude) |
| `POST /api/create-google-doc` | Exports editor content to Google Docs | n8n Google Doc Creator |
| `POST /api/save-editor` | Autosaves editor HTML to `editor_content` | Supabase only |
| `GET /api/campaign/[id]` | Fetches full campaign (for editor, history) | Supabase only |
| `GET /api/history` | Lists user's campaigns (paginated) | Supabase only |
| `POST /api/validate-url` | Checks if a URL is reachable before scraping | External HTTP |
| `GET/POST /api/admin/users` | List all users, create user | Supabase Admin |
| `POST /api/admin/users/[id]` | Ban, delete, or change role | Supabase Admin |

All n8n-facing routes are **server-side only** — webhook URLs and secrets are never exposed to the browser.

---

### n8n Workflows

There are four workflows running on [manglarmedia.app.n8n.cloud](https://manglarmedia.app.n8n.cloud). All are triggered via HTTP webhook and authenticated with a shared `N8N_WEBHOOK_SECRET` header.

---

#### 1. Unified Scraper
**Triggered by:** `/api/scrape`
**Env var:** `N8N_SCRAPE_WEBHOOK_URL`

Handles scraping for both Full and Lazy modes. Uses Firecrawl to extract content from URLs.

**Receives:**
```json
{
  "campaignId": "uuid",
  "mode": "full" | "incremental" | "lazy",
  "urls": [{ "url": "...", "description": "..." }],
  "advertorialUrl": "...",
  "existingInsights": { "usps": [], "pricing": [], ... },
  "context": {
    "topic": "...", "niche": "...", "campaignType": "...",
    "country": "...", "language": "...",
    "guidelines": "None|ERGO|Custom", "customGuidelines": null
  }
}
```

**Writes to Supabase:**
```json
{
  "scraping_result": {
    "usps": ["..."],
    "pricing": ["..."],
    "mainAngle": ["..."],
    "toneOfVoice": ["..."],
    "keyHooks": ["..."],
    "advertorial": "...",
    "references": "..."
  },
  "status": "urls_processed"
}
```

---

#### 2. Full Writer
**Triggered by:** `/api/generate`
**Env var:** `N8N_GENERATE_WEBHOOK_URL`

Generates the complete advertorial for Full mode campaigns.

**Receives:**
```json
{
  "campaignId": "uuid",
  "topic": "...", "campaignType": "...", "niche": "...",
  "country": "...", "language": "...",
  "length": "1500", "paragraphLength": "Normal (3-4 lines)",
  "guidelines": "None|ERGO|Custom", "customGuidelines": null,
  "model": "anthropic/claude-sonnet-4.6",
  "referenceUrls": [{ "url": "...", "description": "..." }],
  "selectedInsights": {
    "usps": ["..."], "pricing": ["..."],
    "mainAngle": ["..."], "toneOfVoice": ["..."], "keyHooks": ["..."]
  },
  "structureBlocks": [
    { "position": 1, "name": "Hook", "inputValue": null, "selectValue": null }
  ]
}
```

**Writes to Supabase:** `generated_html`, `status = 'drafted'`, `llm_model`, `doc_name`

For full payload docs see `docs/n8n-generation-workflow.md`.

---

#### 3. Lazy Writer
**Triggered by:** `/api/lazy-generate` (auto-fires when scraping completes)
**Env var:** `N8N_LAZY_MODE_WEBHOOK_URL`

Rewrites an existing advertorial based on user instructions.

**Receives:**
```json
{
  "campaignId": "uuid",
  "instructions": "user's rewrite prompt",
  "campaignType": "...", "niche": "...", "country": "...", "language": "...",
  "length": "1500", "paragraphLength": "...",
  "guidelines": "...", "customGuidelines": null,
  "model": "anthropic/claude-sonnet-4.6",
  "advertorial": "extracted advertorial text from scraping_result",
  "references": "additional reference content from scraping_result"
}
```

**Writes to Supabase:** same as Full Writer (`generated_html`, `status = 'drafted'`, etc.)

---

#### 4. Google Doc Creator
**Triggered by:** `/api/create-google-doc`
**Env var:** `N8N_CREATE_DOC_WEBHOOK_URL`

Converts the editor HTML to a Google Doc and stores it in the client's Google Drive.

**Receives:**
```json
{
  "campaignId": "uuid",
  "htmlContent": "<html>...</html>",
  "documentName": "ECOM - Product Name - Country - Date"
}
```

**Writes to Supabase:** `generated_content` (Google Docs URL), `status = 'completed'`

---

### Database Schema

**Primary table: `campaigns`**

| Column | Type | Description |
|---|---|---|
| `id` | UUID | Primary key |
| `user_id` | UUID | FK to `auth.users` |
| `mode` | text | `'full'` or `'lazy'` |
| `status` | text | See status flow above |
| `topic` | text | Campaign brief / instructions |
| `campaign_type` | text | Lead Generation or E-commerce |
| `niche` | text | Target niche |
| `country` | text | Target market |
| `language` | text | Content language |
| `length` | text | Target word count |
| `paragraph_length` | text | Paragraph style preference |
| `guidelines` | text | `None`, `ERGO`, or `Custom` |
| `custom_guidelines` | text | Free-text compliance instructions |
| `reference_urls` | JSON | Array of `{ url, description }` |
| `scraping_result` | JSON | Insights extracted by n8n scraper |
| `selected_insights` | JSON | Subset of insights selected by user |
| `structure_blocks` | JSON | Ordered blocks from Step 3 |
| `generated_html` | text | Raw HTML from n8n writer |
| `editor_content` | text | User-edited HTML (autosaved) |
| `generated_content` | text | Google Docs URL |
| `doc_name` | text | Display name for the document |
| `llm_model` | text | Model used for generation |
| `created_at` / `updated_at` | timestamp | — |

**Secondary tables:**
- `user_roles` — `user_id` + `role` (`'admin'`) — controls admin access
- `edit_history` — optional log of AI rewrite operations per campaign

**Row-Level Security:** Browser requests use the `anon` (publishable) key — RLS policies enforce `auth.uid() = user_id`. API routes use the `service_role` (secret) key and bypass RLS. The migration SQL is in `docs/supabase-v2-migration.sql`.

---

## Local Development Setup

### 1. Prerequisites
- Node.js 18+
- pnpm (`npm install -g pnpm`) or npm

### 2. Install dependencies
```bash
pnpm install
```

### 3. Create `.env.local`
Copy the template below into a `.env.local` file in the project root. This file is gitignored and must never be committed.

```bash
# ─── Supabase (public — used client-side for auth and realtime) ───────────────
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=

# ─── Supabase (secret — used server-side in API routes, bypasses RLS) ─────────
SUPABASE_SECRET_KEY=

# ─── OpenRouter (server-side only — AI rewrite feature in the editor) ─────────
OPENROUTER_API_KEY=

# ─── n8n webhooks — PRODUCTION ────────────────────────────────────────────────
N8N_SCRAPE_WEBHOOK_URL=
N8N_GENERATE_WEBHOOK_URL=
N8N_LAZY_MODE_WEBHOOK_URL=
N8N_WEBHOOK_SECRET=

# ─── n8n webhooks — DEV (optional, takes priority over production when set) ───
# Leave blank to use production webhooks in local dev.
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

## Environment Variables

### Where to find each value

#### Supabase
**Platform:** [supabase.com](https://supabase.com) → your project

| Variable | Location in Supabase dashboard |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Project Settings → Data API → Project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Project Settings → Data API → `anon` / `public` key |
| `SUPABASE_SECRET_KEY` | Project Settings → Data API → `service_role` key (keep secret) |

Run `docs/supabase-v2-migration.sql` on a fresh project to recreate the schema.

#### n8n
**Platform:** [manglarmedia.app.n8n.cloud](https://manglarmedia.app.n8n.cloud)

Open each workflow, click its **Webhook trigger node**, and copy the **Production URL**.

| Variable | Workflow |
|---|---|
| `N8N_SCRAPE_WEBHOOK_URL` | Unified Scraper |
| `N8N_GENERATE_WEBHOOK_URL` | Full Writer |
| `N8N_LAZY_MODE_WEBHOOK_URL` | Lazy Writer |
| `N8N_WEBHOOK_SECRET` | Shared secret set in each workflow's webhook auth — must match in all workflows |

The DEV webhook URLs point at test versions of the same workflows (same names prefixed with `dev-`). Use them locally to avoid triggering production workflows.

#### OpenRouter
**Platform:** [openrouter.ai](https://openrouter.ai) → Dashboard → Keys

| Variable | Location |
|---|---|
| `OPENROUTER_API_KEY` | Create or copy an existing API key |

Used only by `/api/ai-rewrite`. The model ID used is `anthropic/claude-sonnet-4.6` (note: dots, not dashes).

#### Firecrawl
Firecrawl is used **inside n8n**, not by this app directly. The API key lives in n8n's credential store: n8n → Credentials → Firecrawl API.

---

## Vercel Deployment

The project is connected to GitHub and deploys automatically.

- `main` branch → production environment
- `dev` branch → preview environment (staging)

**To deploy:** push to `main`. Vercel auto-deploys.

**Setting env vars on Vercel:** Project → Settings → Environment Variables. Add all variables from `.env.local`. Mark `NEXT_PUBLIC_*` vars for all environments; mark secret vars (Supabase secret key, n8n URLs, OpenRouter key) for Production (and Preview if needed).

---

## Scripts

```bash
pnpm dev        # Start dev server (localhost:3000)
pnpm build      # Production build
pnpm start      # Start production server
pnpm lint       # Run ESLint
```

---

## License

Private — All rights reserved.
