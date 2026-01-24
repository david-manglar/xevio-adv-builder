# n8n Workflow Changes for Incremental Scraping

This document outlines the required changes to your n8n scraping workflow to support the new incremental scraping feature.

## Overview

The app now sends a `mode` field with each webhook request:

| Mode | When Triggered | What n8n Receives | What n8n Does |
|------|----------------|-------------------|---------------|
| `full` | New campaign, or user modified/deleted URLs | All URLs, `existingInsights: null` | Normal scraping (no changes needed) |
| `incremental` | User only added new URLs | Only new URLs, `existingInsights: {...}` | Scrape new URLs, merge with existing |

## Request Flow (Incremental)

```
┌─────────────────────────────────────────────────────────────────┐
│  1. User adds new URL in the app, clicks Continue               │
│                         │                                       │
│                         ▼                                       │
│  2. API fetches existing scraping_result from Supabase          │
│                         │                                       │
│                         ▼                                       │
│  3. API sends POST to n8n webhook with:                         │
│     {                                                           │
│       mode: "incremental",                                      │
│       urls: [{ url: "new-url.com" }],      ◄── only new URLs    │
│       existingInsights: { usps: [...], ... } ◄── from Supabase  │
│       context: { ... }                                          │
│     }                                                           │
│                         │                                       │
│                         ▼                                       │
│  4. n8n scrapes only the new URL(s)                             │
│                         │                                       │
│                         ▼                                       │
│  5. n8n merges: existingInsights + newResults = completeResult  │
│                         │                                       │
│                         ▼                                       │
│  6. n8n UPDATE campaigns SET scraping_result = completeResult   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Key point:** n8n receives everything it needs in the webhook payload. No need to query Supabase for existing data.

---

## Webhook Payload Structure

### Full Mode (existing behavior)

```json
{
  "campaignId": "uuid",
  "mode": "full",
  "urls": [
    { "url": "https://example.com/page1", "description": "Product page" },
    { "url": "https://example.com/page2", "description": null }
  ],
  "existingInsights": null,
  "context": {
    "topic": "...",
    "niche": "...",
    "campaignType": "...",
    "country": "...",
    "language": "...",
    "guidelines": "..."
  }
}
```

### Incremental Mode (new)

```json
{
  "campaignId": "uuid",
  "mode": "incremental",
  "urls": [
    { "url": "https://example.com/page3", "description": "New page" }
  ],
  "existingInsights": {
    "usps": ["Existing USP 1", "Existing USP 2"],
    "pricing": ["$99/month"],
    "mainAngle": ["Existing angle..."],
    "toneOfVoice": ["Professional and friendly"],
    "keyHooks": ["Existing hook..."]
  },
  "context": {
    "topic": "...",
    "niche": "...",
    "campaignType": "...",
    "country": "...",
    "language": "...",
    "guidelines": "..."
  }
}
```

---

## Implementation (Recommended Approach)

### Step 1: Add IF Node After Webhook

Add an **IF** node right after your webhook trigger:

**Condition:**
```javascript
{{ $json.mode === 'incremental' }}
```

This creates two paths:
- **True (Incremental):** New simplified path
- **False (Full):** Your existing workflow (no changes needed)

### Step 2: Incremental Path - Scrape New URLs

Connect the IF node's "true" output to your scraping nodes. The `urls` array already contains only the new URLs, so your existing scraping logic works as-is.

**Skip the consolidation/deduplication agent** for incremental mode (it's designed for multiple URLs).

### Step 3: Add Merge Code Node

After scraping completes on the incremental path, add a **Code** node to merge results:

```javascript
// Get existing insights from the original webhook payload
const webhookData = $('Webhook').first().json;
const existing = webhookData.existingInsights || {
  usps: [],
  pricing: [],
  mainAngle: [],
  toneOfVoice: [],
  keyHooks: []
};

// Get new insights from the scraping pipeline
// Adjust this based on how your pipeline outputs results
const newResults = $input.first().json;

// Merge: append new to existing
const merged = {
  usps: [...(existing.usps || []), ...(newResults.usps || [])],
  pricing: [...(existing.pricing || []), ...(newResults.pricing || [])],
  mainAngle: [...(existing.mainAngle || []), ...(newResults.mainAngle || [])],
  toneOfVoice: [...(existing.toneOfVoice || []), ...(newResults.toneOfVoice || [])],
  keyHooks: [...(existing.keyHooks || []), ...(newResults.keyHooks || [])]
};

return { 
  scraping_result: merged,
  campaignId: webhookData.campaignId
};
```

### Step 4: Write to Supabase

Both paths (full and incremental) should end at your existing Supabase UPDATE node:

```sql
UPDATE campaigns
SET 
  scraping_result = $scraping_result,
  status = 'urls_processed'
WHERE id = $campaignId
```

No changes needed to this node — it receives the complete merged result.

---

## Visual Workflow Structure

```
                    ┌─────────────┐
                    │   Webhook   │
                    └──────┬──────┘
                           │
                           ▼
                    ┌─────────────┐
                    │  IF: mode   │
                    │ incremental │
                    └──────┬──────┘
                           │
              ┌────────────┴────────────┐
              │                         │
              ▼                         ▼
       [incremental]               [full]
              │                         │
              ▼                         ▼
    ┌─────────────────┐      ┌─────────────────┐
    │  Scrape new     │      │  Your existing  │
    │  URLs only      │      │  full pipeline  │
    │  (skip consol.) │      │                 │
    └────────┬────────┘      └────────┬────────┘
             │                        │
             ▼                        │
    ┌─────────────────┐               │
    │  Code: Merge    │               │
    │  existing +     │               │
    │  new results    │               │
    └────────┬────────┘               │
             │                        │
             └────────────┬───────────┘
                          │
                          ▼
                 ┌─────────────────┐
                 │ Supabase UPDATE │
                 │ (unchanged)     │
                 └─────────────────┘
```

---

## Limitations to Know

1. **No cross-page deduplication for incremental:** If the new URL produces an insight similar to an existing one, both will appear. Users can manually deselect duplicates in Step 4 (Insights).

2. **Context isolation:** Existing insights were extracted considering all original URLs together. New insights are extracted with only the new URL's context.

3. **Full re-scrapes still deduplicate:** When users modify/delete URLs, the app triggers `mode: "full"`, which runs your complete pipeline including consolidation.

---

## Testing Checklist

### Test 1: Full Scrape (New Campaign)
- [ ] Create new campaign with 2 URLs
- [ ] Verify webhook receives `mode: "full"` and `existingInsights: null`
- [ ] Verify normal scraping behavior (existing workflow)

### Test 2: Incremental Scrape
- [ ] Use existing campaign that completed scraping
- [ ] Go back to Step 2, add 1 new URL
- [ ] Click Continue
- [ ] Verify webhook receives:
  - `mode: "incremental"`
  - `urls` array with only the new URL
  - `existingInsights` with previous results
- [ ] Verify final `scraping_result` contains old + new insights

### Test 3: Full Re-scrape (URL Modified)
- [ ] Use existing campaign
- [ ] Go back to Step 2, modify an existing URL
- [ ] Confirm the warning dialog
- [ ] Verify webhook receives `mode: "full"`
- [ ] Verify all URLs are scraped fresh

---

## Quick Reference

| Scenario | `mode` | `urls` contains | `existingInsights` |
|----------|--------|-----------------|-------------------|
| New campaign | `full` | All URLs | `null` |
| User added URLs only | `incremental` | Only new URLs | Previous results |
| User modified/deleted URLs | `full` | All URLs | `null` |
| User changed Step 1 settings | `full` | All URLs | `null` |
