# DEV Workflow Setup Guide

Instructions for creating DEV versions of the 3 production n8n workflows. These run on the same n8n instance (`manglarmedia.app.n8n.cloud`) but with modified behavior for the dev/staging environment.

| Production Workflow | DEV Workflow |
|---|---|
| ADVB - Scraper | DEV - ADVB - Scraper |
| ADVB - Writer | DEV - ADVB - Writer |
| ADVB - Lazy Mode | DEV - ADVB - Lazy Mode |

---

## General Setup (All 3 Workflows)

For each workflow:

1. Open the production workflow in n8n
2. Click the three-dot menu (top right) > **Duplicate**
3. Rename the duplicate to the DEV name (e.g., `DEV - ADVB - Writer`)
4. The duplicate gets its own Webhook URL automatically -- copy it for the app's env vars
5. Make the changes described below
6. **Activate** the DEV workflow

> **Important:** Do NOT deactivate or modify the production workflows. The DEV workflows run independently with their own webhook endpoints.

---

## DEV - ADVB - Writer

Three changes needed.

### Change 1: Dynamic model from webhook payload

The production workflow has a hardcoded model `anthropic/claude-sonnet-4.5` in the OpenRouter Chat Model node named **"sonnet-4.5"** (connected to the "Advertorial Writer" agent).

**Steps:**

1. Click the **"sonnet-4.5"** node (OpenRouter Chat Model, connected to the Advertorial Writer agent)
2. In the **Model** field, switch from the dropdown to **Expression** mode (click the toggle/gear icon next to the field)
3. Enter this expression:

```
{{ $('Webhook').item.json.body.model || 'anthropic/claude-sonnet-4-6' }}
```

4. This reads the `model` field from the webhook payload, falling back to `anthropic/claude-sonnet-4-6` if not provided
5. Close the node and save

> **What this does:** The app sends the user's chosen model (e.g., `anthropic/claude-sonnet-4-6`, `openai/gpt-5.4`) in the webhook payload. The agent now uses whatever model the user selected instead of always using Claude Sonnet 4.5.

### Change 2: Store generated_html before Google Doc creation

Add a Supabase node between the **"Markdown"** node (which converts markdown to HTML) and the **"Doc Fields"** node (which prepares Google Doc data).

**Current flow:**
```
... -> Markdown -> Doc Fields -> Prepare Request -> Create Google Doc -> Update a row
```

**New flow:**
```
... -> Markdown -> Store HTML -> Doc Fields -> Prepare Request -> Create Google Doc -> Update a row
```

**Steps:**

1. Disconnect the connection between **"Markdown"** and **"Doc Fields"**
   - Hover over the connection line and click the X, or drag the input of "Doc Fields" away
2. Add a new node: search for **Supabase** and select it
3. Configure the new Supabase node:
   - **Name:** `Store HTML`
   - **Credential:** Select `Supabase (Xevio)` (same as the existing "Update a row" node)
   - **Operation:** Update Row
   - **Table:** `campaigns`
   - **Filter:**
     - Column: `id`
     - Condition: equals
     - Value (expression): `{{ $('Extract Fields').item.json.campaignId }}`
   - **Fields to update:** Add one field:
     - Field: `generated_html`
     - Value (expression): `{{ $json.content }}`

   > `$json.content` is the HTML output from the "Markdown" node that just ran.

4. Connect the nodes:
   - **Markdown** output -> **Store HTML** input
   - **Store HTML** output -> **Doc Fields** input
5. Position the node between Markdown and Doc Fields on the canvas
6. Save

### Change 3: Store llm_model on campaign completion

The existing **"Update a row"** Supabase node (the final node, which sets `status` to `completed`) currently writes 3 fields: `status`, `generated_content`, `doc_name`.

**Steps:**

1. Click the **"Update a row"** node (the one at the end of the workflow, position ~5072,-96)
2. In the **Fields** section, click **Add Field**
3. Add a new field:
   - Field: `llm_model`
   - Value (expression): `{{ $('Webhook').item.json.body.model }}`
4. Save

**After this change, the "Update a row" node writes 4 fields:**

| Field | Value |
|---|---|
| `status` | `completed` |
| `generated_content` | Google Doc URL |
| `doc_name` | Document filename |
| `llm_model` | Model used (from webhook payload) |

---

## DEV - ADVB - Lazy Mode

Three changes needed -- same pattern as Writer.

### Change 1: Dynamic model from webhook payload

The Lazy Mode workflow has **three** `anthropic/claude-sonnet-4.6` model nodes. Only the one connected to the **Advertorial Writer** agent should use the dynamic model. The other two are for different agents (Copy Extractor and Page Analyzer) and should stay as-is.

**Node to change:**

| Node name | Connected to | Change? |
|---|---|---|
| `sonnet-4.6` | Copy Extractor | No -- keep hardcoded |
| `sonnet-4.6-2` | Page Analyzer | No -- keep hardcoded |
| `sonnet-4.6-3` | Advertorial Writer | **Yes -- make dynamic** |

**Steps:**

1. Click the **"sonnet-4.6-3"** node (OpenRouter Chat Model, position ~1456,1472, connected to the Advertorial Writer)
2. In the **Model** field, switch to **Expression** mode
3. Enter:

```
{{ $('Webhook').item.json.body.model || 'anthropic/claude-sonnet-4-6' }}
```

4. Save

### Change 2: Store generated_html before Google Doc creation

Same pattern as Writer. Add a Supabase node between **"Markdown"** and **"Doc Fields"**.

**Current flow:**
```
... -> Markdown -> Doc Fields -> Prepare Request -> Create Google Doc -> Update a row
```

**New flow:**
```
... -> Markdown -> Store HTML -> Doc Fields -> Prepare Request -> Create Google Doc -> Update a row
```

**Steps:**

1. Disconnect **"Markdown"** from **"Doc Fields"**
2. Add a new **Supabase** node:
   - **Name:** `Store HTML`
   - **Credential:** `Supabase (Xevio)`
   - **Operation:** Update Row
   - **Table:** `campaigns`
   - **Filter:**
     - Column: `id`
     - Condition: equals
     - Value (expression): `{{ $('Extract Fields').item.json.campaignId }}`
   - **Fields to update:**
     - Field: `generated_html`
     - Value (expression): `{{ $json.content }}`
3. Connect: **Markdown** -> **Store HTML** -> **Doc Fields**
4. Save

### Change 3: Store llm_model on campaign completion

1. Click the **"Update a row"** node (final Supabase node, position ~4096,768)
2. Add a new field:
   - Field: `llm_model`
   - Value (expression): `{{ $('Webhook').item.json.body.model }}`
3. Save

---

## DEV - ADVB - Scraper

One change needed.

### Change 1: Context-aware analysis prompt

The **"Page Analyzer"** agent currently extracts insights generically. Update its prompt to include campaign context from the webhook payload, so extraction is prioritized for the specific campaign.

The webhook already sends a `context` object (stored in the "Set data" node) with: `topic`, `niche`, `campaignType`, `country`, `language`, `guidelines`.

**Steps:**

1. Click the **"Page Analyzer"** agent node
2. In the **Text** (user prompt) field, find the section that says:

```
EXTRACTION REQUIREMENTS:
```

3. **Add the following block BEFORE "EXTRACTION REQUIREMENTS:"** (right after the `SCREENSHOT URL:` section):

```
---

CAMPAIGN CONTEXT:
- Campaign Type: {{ $('Set data').item.json.context.campaignType }}
- Niche: {{ $('Set data').item.json.context.niche }}
- Target Country: {{ $('Set data').item.json.context.country }}
- Language: {{ $('Set data').item.json.context.language }}
- Topic: {{ $('Set data').item.json.context.topic }}

Use this context to prioritize extraction:
- Focus on insights relevant to a {{ $('Set data').item.json.context.campaignType }} campaign in the {{ $('Set data').item.json.context.niche }} niche
- Prioritize elements that would resonate with {{ $('Set data').item.json.context.country }} audiences
- Weight USPs, hooks, and angles that align with the campaign topic: "{{ $('Set data').item.json.context.topic }}"

---
```

4. The full prompt order should now be:
   - Input sources
   - User context
   - Markdown content
   - Screenshot URL
   - **Campaign context (new)**
   - Extraction requirements
   - Instructions
   - Output format
5. Save

> **Why:** By including campaign context, the Page Analyzer can prioritize extracting insights that are most relevant to the specific campaign type, niche, and target audience, rather than extracting everything generically.

---

## App Environment Variables

After creating the DEV workflows, copy each workflow's webhook URL and add them to the app's `.env.local`:

```bash
# DEV n8n webhook URLs
N8N_DEV_SCRAPE_WEBHOOK_URL=https://manglarmedia.app.n8n.cloud/webhook/[DEV-SCRAPER-WEBHOOK-ID]
N8N_DEV_GENERATE_WEBHOOK_URL=https://manglarmedia.app.n8n.cloud/webhook/[DEV-WRITER-WEBHOOK-ID]
N8N_DEV_LAZY_MODE_WEBHOOK_URL=https://manglarmedia.app.n8n.cloud/webhook/[DEV-LAZY-WEBHOOK-ID]
```

To find each webhook URL: open the DEV workflow in n8n, click the **Webhook** trigger node, and copy the **Production URL**.

### API Route Changes

The API routes in `app/api/` need to select DEV vs production URLs based on the environment. The logic should be:

```typescript
// In each API route that calls n8n:
const webhookUrl = process.env.NODE_ENV === 'development'
  ? process.env.N8N_DEV_SCRAPE_WEBHOOK_URL    // or N8N_DEV_GENERATE_WEBHOOK_URL, etc.
  : process.env.N8N_SCRAPE_WEBHOOK_URL;        // or N8N_GENERATE_WEBHOOK_URL, etc.
```

Routes that need this change:
- `app/api/scrape/route.ts` (or wherever the scrape webhook is called)
- `app/api/generate/route.ts` (or wherever the generate webhook is called)
- `app/api/lazy-generate/route.ts` (or wherever the lazy mode webhook is called)

### Webhook Payload: model field

The Writer and Lazy Mode API routes must include the `model` field in the webhook payload:

```typescript
// Example: in the generate API route
const payload = {
  // ...existing fields...
  model: campaignData.model || 'anthropic/claude-sonnet-4-6',
};
```

This field is what the DEV workflows read for dynamic model selection.

---

## Database Changes

The DEV workflows write two new fields to the `campaigns` table. These columns must exist in Supabase before the DEV workflows run:

| Column | Type | Description |
|---|---|---|
| `generated_html` | `text` | HTML version of the generated advertorial |
| `llm_model` | `text` | Model identifier used for generation (e.g., `anthropic/claude-sonnet-4-6`) |

**To add them in Supabase:**

1. Go to Table Editor > `campaigns`
2. Click **New Column**
3. Add `generated_html` as type `text`, nullable, no default
4. Add `llm_model` as type `text`, nullable, no default

---

## Verification Checklist

After setup, test each DEV workflow:

- [ ] **DEV - ADVB - Scraper:** Trigger with a test payload including `context`. Verify the Page Analyzer output references campaign context in its extraction priorities.
- [ ] **DEV - ADVB - Writer:** Trigger with a test payload including `model: "anthropic/claude-sonnet-4-6"`. Verify:
  - The agent uses the specified model (check execution log for the model node)
  - `generated_html` is written to the campaign row in Supabase (check before Google Doc is created)
  - `llm_model` is written to the campaign row after completion
- [ ] **DEV - ADVB - Lazy Mode:** Same checks as Writer, plus verify that only the Advertorial Writer's model node uses the dynamic expression (Copy Extractor and Page Analyzer should still use their hardcoded models).
- [ ] **App integration:** Run `pnpm dev`, create a test campaign, and verify the app hits DEV webhook URLs (not production).

---

## Quick Reference: Node Positions

For orientation when working in the n8n canvas.

### Writer
| Node | Approximate position |
|---|---|
| Webhook | start of workflow |
| sonnet-4.5 (model) | 2832, 608 |
| Advertorial Writer (agent) | 912, 32 |
| Markdown (md->html) | 4304, -96 |
| Doc Fields | 4464, -96 |
| Create Google Doc | 4800, -96 |
| Update a row (final) | 5072, -96 |

### Lazy Mode
| Node | Approximate position |
|---|---|
| Webhook | -1184, 32 |
| sonnet-4.6-3 (writer model) | 1456, 1472 |
| Advertorial Writer (agent) | mid-workflow |
| Markdown (md->html) | 3328, 768 |
| Doc Fields | 3488, 768 |
| Create Google Doc | 3808, 768 |
| Update a row (final) | 4096, 768 |

### Scraper
| Node | Approximate position |
|---|---|
| Webhook | start of workflow |
| Set data | -368, 800 |
| Page Analyzer | 1104, 464 |
