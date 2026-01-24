# Error Handling Analysis: Step 4 (Insights) Scraping Results

## Current State

### How Errors Are Currently Handled

1. **Status-Based Error Detection** (in `step-insights.tsx`):
   - The app subscribes to Supabase realtime updates
   - Checks if `status === "failed"` 
   - Shows a generic alert: "Scraping failed. Please go back and try again."
   - **Problem**: No details about which URLs failed or why

2. **Scraping Result Structure**:
   - Currently expects: `{ usps: [], pricing: [], mainAngle: [], toneOfVoice: [], keyHooks: [] }`
   - **Problem**: No error metadata included

3. **n8n Workflow**:
   - Documentation doesn't specify error handling structure
   - **Problem**: Unknown how n8n reports per-URL failures

### Current Limitations

❌ **No per-URL error tracking**: Can't tell which URLs succeeded vs failed  
❌ **No partial success handling**: If 2/3 URLs fail, user sees generic failure  
❌ **No error details**: Users don't know why URLs failed (timeout, 404, blocked, etc.)  
❌ **Binary success/failure**: Either all succeed or all fail - no middle ground  
❌ **Poor UX**: Generic alert doesn't help users understand what went wrong

---

## Proposed Solution

### 1. Enhanced Scraping Result Structure

The `scraping_result` should include error metadata:

```typescript
interface ScrapingResult {
  // Existing insight arrays
  usps: string[]
  pricing: string[]
  mainAngle: string[]
  toneOfVoice: string[]
  keyHooks: string[]
  
  // NEW: Error metadata
  urlResults?: {
    url: string
    status: 'success' | 'failed'
    error?: string  // Error message if failed
    errorType?: 'timeout' | '404' | '403' | 'network' | 'parse' | 'unknown'
  }[]
  
  // NEW: Summary stats
  summary?: {
    totalUrls: number
    successfulUrls: number
    failedUrls: number
    hasPartialSuccess: boolean
  }
}
```

### 2. n8n Workflow Changes

Your n8n workflow should:

1. **Track per-URL results** during scraping
2. **Include error information** in the final result
3. **Set status appropriately**:
   - `urls_processed` if at least one URL succeeded (even if some failed)
   - `failed` only if ALL URLs failed

**Example n8n output structure:**

```json
{
  "scraping_result": {
    "usps": ["USP 1", "USP 2"],
    "pricing": ["$99/month"],
    "mainAngle": ["..."],
    "toneOfVoice": ["..."],
    "keyHooks": ["..."],
    "urlResults": [
      {
        "url": "https://example.com/page1",
        "status": "success"
      },
      {
        "url": "https://example.com/page2",
        "status": "failed",
        "error": "Request timeout after 30 seconds",
        "errorType": "timeout"
      },
      {
        "url": "https://example.com/page3",
        "status": "success"
      }
    ],
    "summary": {
      "totalUrls": 3,
      "successfulUrls": 2,
      "failedUrls": 1,
      "hasPartialSuccess": true
    }
  }
}
```

### 3. Frontend Changes (Step 4 - Insights)

#### Scenario 1: All URLs Failed

**Display:**
- Replace success banner with error banner
- Show list of failed URLs with error messages
- Provide "Try Again" button to go back to Step 2
- Disable "Continue" button (no insights to show)

**UI Example:**
```
⚠️ Scraping Failed

We couldn't scrape any of your reference pages:
• https://example.com/page1 - Request timeout
• https://example.com/page2 - Page not found (404)
• https://example.com/page3 - Access denied (403)

Please check your URLs and try again.
[← Back to URLs] [Try Again]
```

#### Scenario 2: Some URLs Failed (Partial Success)

**Display:**
- Show warning banner (not error) indicating partial success
- Show insights from successful URLs (normal display)
- Show collapsible section listing failed URLs
- Allow user to proceed with available insights

**UI Example:**
```
⚠️ Partial Success

We successfully scraped 2 of 3 reference pages. 
You can proceed with the available insights, or go back to fix the failed URLs.

[Show failed URLs ▼]
• https://example.com/page2 - Request timeout

[Continue with available insights →]
```

#### Scenario 3: All URLs Succeeded

**Display:**
- Current success banner (no changes needed)
- Normal insights display

---

## Implementation Plan

### Phase 1: Update n8n Workflow

1. Modify scraping nodes to track per-URL results
2. Add error handling for each URL
3. Include `urlResults` array in final output
4. Calculate `summary` statistics
5. Set status to `urls_processed` if any URL succeeds

### Phase 2: Update Frontend Types

1. Add `ScrapingResult` interface with error metadata
2. Update `CampaignData` type if needed

### Phase 3: Update Step 4 (Insights) Component

1. Check `scrapingResult.summary` to determine scenario
2. Add error/warning banners based on results
3. Display failed URLs list when applicable
4. Handle empty insights gracefully

### Phase 4: Update n8n Documentation

1. Document error structure in `n8n-incremental-scraping.md`
2. Provide examples of error responses

---

## Questions for You

1. **What error types should n8n report?** (timeout, 404, 403, network, parse, etc.)
2. **Should users be able to proceed with partial results?** (I assume yes)
3. **Do you want retry functionality?** (e.g., "Retry failed URLs" button)
4. **How detailed should error messages be?** (technical vs user-friendly)

---

## Next Steps

Once you confirm the approach, I can:
1. Update the frontend components to handle these scenarios
2. Provide detailed n8n workflow modifications
3. Update the documentation
