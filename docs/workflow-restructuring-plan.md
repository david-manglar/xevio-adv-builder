# Plan: Restructure n8n Workflows — Unified Scraper + Separate Writers

## Context

Current architecture: 3 workflows (Scraper for full mode, Writer for full mode, Lazy Mode all-in-one).
New architecture: 4 workflows (Unified Scraper for both modes, Writer Full, Writer Lazy, Google Doc Creator).

The key change: extract scraping from Lazy Mode into a unified scraper with IF routing, so Lazy Mode becomes a two-phase process (scrape → auto-trigger write) matching the Full Mode pattern. This improves debugging, allows independent iteration on scraping vs writing, and simplifies each workflow.

**Phases 1-4 are done and tested end-to-end (Lazy Mode). Phase 5 is Full Writer (most complex workflow, tackled last).**

---

## Phase 1: Frontend & API Changes

### Step 1A: Extend `/api/scrape/route.ts` for lazy mode

**File:** `app/api/scrape/route.ts`

Add support for `mode: 'lazy'` so the same scrape API endpoint handles both modes.

**Interface changes:**
```typescript
interface ScrapeRequestBody {
  // ...existing fields...
  mode?: 'full' | 'lazy'           // NEW — defaults to 'full'
  advertorialUrl?: string           // NEW — main advertorial URL (lazy mode)
  model?: string                    // NEW — LLM model for later generation
}
```

**Logic changes in the "NEW CAMPAIGN" branch (line 131):**
- Check `body.mode` — if `'lazy'`, insert with `mode: 'lazy'` instead of `'full'`
- Store `model` as `llm_model` if provided
- The `topic` field already gets `stepOneData.topic` (which will be the lazy instructions)

**Webhook payload change (line 190):**
- Add `mode` field: `'lazy'` | `'full'` | `'incremental'`
- Add `advertorialUrl` field (only for lazy mode — tells n8n which URL is the main advertorial)
- Full/incremental mode payloads stay identical to today

### Step 1B: Rewrite `/api/lazy-generate/route.ts`

**File:** `app/api/lazy-generate/route.ts`

Transform from "create campaign + trigger all-in-one workflow" to "read existing campaign + trigger write-only workflow."

**New request body:** `{ campaignId: string, model?: string }`

**New logic:**
1. Read campaign from Supabase: `scraping_result`, `topic`, `campaign_type`, `niche`, `country`, `language`, `length`, `paragraph_length`, `guidelines`, `custom_guidelines`, `llm_model`
2. Validate `scraping_result` exists (guard against premature trigger)
3. Update campaign: `status: 'generating'`, `llm_model: model` (if provided)
4. Build webhook payload with campaign settings + scraping results:
   ```typescript
   {
     campaignId,
     instructions: campaign.topic,
     campaignType: campaign.campaign_type,
     // ...all campaign settings from DB...
     model: model || campaign.llm_model || 'anthropic/claude-sonnet-4-6',
     advertorial: campaign.scraping_result.advertorial,    // from scraper
     references: campaign.scraping_result.references,      // from scraper
   }
   ```
5. POST to `N8N_DEV_LAZY_MODE_WEBHOOK_URL` (will point to new Lazy Writer workflow)

### Step 1C: Modify `components/lazy-mode-review.tsx`

**File:** `components/lazy-mode-review.tsx`

Change `handleGenerate` (line 30) to call `/api/scrape` instead of `/api/lazy-generate`.

**New request body:**
```typescript
{
  stepOneData: {
    topic: data.instructions,
    campaignType: data.campaignType,
    niche: data.niche,
    country: data.country,
    language: data.language,
    length: data.keepOriginalLength ? 'keep_original' : data.length,
    paragraphLength: data.paragraphLength,
    guidelines: data.guidelines,
    customGuidelines: data.customGuidelines,
  },
  stepTwoData: {
    referenceUrls: [
      { url: data.advertorialUrl, description: 'Reference advertorial' },
      ...data.referenceUrls.filter(r => r.url.trim()),
    ],
  },
  userId,
  mode: 'lazy',
  advertorialUrl: data.advertorialUrl,
  model: selectedModel,
}
```

**Status change:** `setCampaignData` sets `status: 'scraping'` instead of `'generating'`.

Still calls `onGenerate()` to transition to the progress screen.

### Step 1D: Add auto-trigger in `app/page.tsx`

**File:** `app/page.tsx`

Add a `useEffect` that watches for `campaignData.status === 'urls_processed'` when in lazy mode, and auto-triggers generation:

```typescript
// Auto-trigger lazy generation when scraping completes
useEffect(() => {
  if (appMode === 'lazy' && campaignData.status === 'urls_processed' && campaignData.id) {
    const triggerGeneration = async () => {
      try {
        const response = await fetch('/api/lazy-generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ campaignId: campaignData.id, model: selectedModel }),
        })
        if (!response.ok) throw new Error('Failed to trigger generation')
        setCampaignData(prev => ({ ...prev, status: 'generating' }))
      } catch (error) {
        console.error('Auto-trigger lazy generation failed:', error)
      }
    }
    triggerGeneration()
  }
}, [appMode, campaignData.status, campaignData.id])
```

**Update the Realtime subscription** (line 282): it already watches for status changes and updates `campaignData.status`. The `urls_processed` status will naturally flow through, triggering the useEffect above. No changes needed to the subscription itself.

**Update StepGenerating render** (line 395 area): pass a `phase` prop based on status:
```typescript
<StepGenerating
  ...
  phase={campaignData.status === 'scraping' ? 'scraping' : 'generating'}
/>
```

### Step 1E: Update `components/step-generating.tsx`

**File:** `components/step-generating.tsx`

Add optional `phase` prop to show different messages:
- `phase === 'scraping'`: "Analyzing Your Pages" / "Scraping and analyzing your reference pages..."
- `phase === 'generating'` (default): "Generating Your Advertorial" / "Be patient, the writer is working on it..."

---

## Phase 2: Unified Scraper n8n Workflow

**File to create:** `n8n/dev-advb-unified-scraper.json`

Based on the existing `dev-advb-scraper.json`, with an added lazy branch.

### Workflow structure:

```
Webhook → Set data → IF (mode === 'lazy')
  ├── TRUE (Lazy branch):
  │   └── Split Out URLs → Loop Over Items
  │       → Scrape (Firecrawl) → Markdown Cleaner (Gemini)
  │       → IF (description === 'Reference advertorial')
  │           ├── TRUE: Keep cleaned content + count words → Label as advertorial
  │           └── FALSE: Page Analyzer (Gemini) → Label as reference
  │       → Aggregate all → Assemble scraping_result → Update Supabase
  │
  └── FALSE (Full branch — existing logic, unchanged):
      └── > 1 URL? → Scrape → Clean → Analyze → Consolidate → Parse → Update Supabase
```

### Lazy branch output shape (stored in `scraping_result`):
```json
{
  "advertorial": {
    "url": "https://...",
    "content": "# Cleaned markdown of the original advertorial...",
    "word_count": 1150
  },
  "references": [
    {
      "url": "https://...",
      "description": "Competitor page",
      "analysis": "PAGE TYPE: Sales page\nCONTENT SUMMARY: ..."
    }
  ]
}
```

### Key nodes to copy from `dev-advb-lazy-mode.json`:
- Markdown Cleaner agent (Gemini 2.5 Flash) — same agent, cleans raw markdown
- Page Analyzer agent (Gemini 2.5 Flash) — analyzes reference pages
- Word counter code node — counts words in advertorial content
- The IF + Label nodes that separate advertorial from references

### Both branches end with:
- Supabase Update: `scraping_result` = result JSON, `status` = `'urls_processed'`

### Webhook payload contract:
```json
{
  "campaignId": "uuid",
  "urls": [{ "url": "...", "description": "..." }],
  "mode": "full" | "incremental" | "lazy",
  "advertorialUrl": "https://...",           // lazy mode only
  "existingInsights": null | {...},          // incremental only
  "context": { "topic", "niche", "campaignType", "country", "language", "guidelines" }
}
```

---

## Supabase Changes

**None.** The `scraping_result` column is JSONB — it accepts any shape. Lazy mode campaigns will now use `scraping` and `urls_processed` statuses (already defined in the type system but previously skipped for lazy mode).

---

## Env Var Changes

**None.** `N8N_DEV_SCRAPE_WEBHOOK_URL` will point to the new Unified Scraper (replace the old one in n8n). `N8N_DEV_LAZY_MODE_WEBHOOK_URL` will later point to the new Lazy Writer (Phase 3, separate chat).

---

## Verification

### Phase 1 (frontend/API — testable with mock or existing scraper):
- [ ] Lazy Mode review calls `/api/scrape` with `mode: 'lazy'`
- [ ] Campaign created with `status: 'scraping'`, `mode: 'lazy'`
- [ ] Progress screen shows "Analyzing Your Pages" during scraping phase
- [ ] When `urls_processed` arrives via Realtime, auto-triggers `/api/lazy-generate`
- [ ] Progress screen transitions to "Generating Your Advertorial"
- [ ] Full Mode still works exactly as before (no regression)

### Phase 2 (Unified Scraper — import to n8n and test):
- [ ] Full mode: same behavior as before (send test payload with `mode: 'full'`)
- [ ] Lazy mode: send test payload with `mode: 'lazy'` + advertorial URL
- [ ] Verify `scraping_result` in Supabase has the lazy shape (advertorial + references)
- [ ] Verify `status` set to `urls_processed`

### Phase 3 (Lazy Writer — done, tested end-to-end):
- [x] Workflow created: `n8n/dev-advb-lazy-writer.json`
- [x] Writing pipeline executes end-to-end with mock data
- [x] Dynamic model selection works (`$json.length`, `$json.advertorial.word_count`)
- [x] `doc_name` written to Supabase on completion
- [x] End-to-end with real campaign ID — tested successfully
- [x] Writer writes `status: 'drafted'` (not `completed`)

**Notes from implementation:**
- No Prepare Data code node — field mapping handled directly in a Set node ("Writer Brief")
- Key expressions: `$json.length`, `$json.advertorial.word_count`, `$json.advertorial.content`, `$json.references[].analysis`
- Test payload: `n8n/test-lazy-writer-payload.json`

### End-to-end (Phases 1-4 — tested):
- [x] Full flow: Lazy Mode setup → scraping → auto-generate → editor → export to Google Doc

---

## Phase 3: Lazy Writer n8n Workflow (separate chat)

**File to create:** `n8n/dev-advb-lazy-writer.json`

Take the current `dev-advb-lazy-mode.json`, remove all scraping nodes (Split Out, Loop, Scrape, Markdown Cleaner, Page Analyzer, Aggregate, Split original, Word counter, IF, Label nodes). Keep the entire writing pipeline from Writer Variables onward.

Writer Variables reads from webhook payload instead of upstream scraping nodes:
- `advertorialUrl` ← `$('Extract Fields').item.json.advertorial`
- `referenceUrls` ← `$('Extract Fields').item.json.references`

Everything downstream (Advertorial Writer agent, sanity checks, quality loop, Markdown conversion, Store HTML, Update a row) stays identical.

"Update a row" writes 3 fields: `status: 'drafted'`, `llm_model`, `doc_name` (from Filename node).

---

## Phase 4: Google Doc Creator — Done

Simplified approach: no LLM fallback needed. Both writer workflows (Lazy Writer in Phase 3, Full Writer in Phase 5) store `doc_name` before completion, so the Google Doc Creator always receives a valid name.

**Changes made:**
- `app/api/create-google-doc/route.ts`: removed `|| 'Advertorial'` fallback — `documentName` is now `campaign.doc_name` directly
- n8n workflow (`dev-advb-google-doc-creator.json`): Update Campaign node writes `generated_content` (doc URL), `doc_name`, and `status: 'completed'`
- Fixed: Update Campaign node was using "Create" instead of "Update" — changed to update with filter on campaign ID

```
Webhook → Doc Fields → Prepare Request → Create Google Doc → Update Campaign
```

### Status flow integration:
- Writer workflows write `status: 'drafted'` → content appears in editor
- Google Doc Creator writes `status: 'completed'` → signals export is done
- Frontend Realtime catches both transitions and reacts accordingly

### Verification (Phase 4):
- [x] Generate advertorial (Lazy Mode) → `doc_name` stored in Supabase
- [x] Click "Export to Google Doc" → doc created with proper name
- [x] Google Docs link appears in editor toolbar via Realtime
- [x] Modal dialog appears with doc link on completion
- [x] History menu shows "Open Google Doc" for completed campaigns
- [x] Doc contains the **edited** content, not the original AI output

---

## Phase 5: Full Writer n8n Workflow ← NEXT

> Lazy Mode is fully tested end-to-end. Full Mode is next.

Mostly unchanged from `dev-advb-writer.json`. Changes needed:
1. **Update a row** writes `status: 'drafted'` (not `completed`) — matches Lazy Writer
2. **Update a row** includes `doc_name` field (same as Lazy Writer)
3. Verify dynamic model selection is in place (`sonnet-4.5` node → expression mode, use `anthropic/claude-sonnet-4.6` as fallback)
4. Verify `Store HTML` node exists before `Update a row`
5. Remove Google Doc creation nodes if still present (Doc Fields, Prepare Request, Create Google Doc) — doc creation is now handled by the separate Google Doc Creator workflow

### Verification (Phase 5):
- [ ] Full Mode flow works end-to-end: steps → scraping → generate → editor → export
- [ ] `doc_name`, `llm_model`, `generated_html` all written to Supabase
- [ ] `status` set to `drafted` (not `completed`)
- [ ] Dynamic model works (send different model in payload, check execution log)
- [ ] Google Doc export works via the Google Doc Creator workflow (status changes to `completed`)
