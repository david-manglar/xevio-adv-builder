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
    "guidelines": "None" | "ERGO" | "Custom",
    "customGuidelines": null | "User's custom text..."
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
    "guidelines": "None" | "ERGO" | "Custom",
    "customGuidelines": null | "User's custom text..."
  }
}
```

---

## Compliance Guidelines (Scraping Workflow)

The scraping workflow receives compliance guidelines in the `context` object. These can be used to guide how content is analyzed during scraping.

### Payload Structure

The compliance fields are in the `context` object:

```json
{
  "campaignId": "uuid",
  "mode": "full",
  "urls": [...],
  "existingInsights": null,
  "context": {
    "topic": "...",
    "niche": "...",
    "campaignType": "...",
    "country": "...",
    "language": "...",
    "guidelines": "None" | "ERGO" | "Custom",
    "customGuidelines": null | "User's custom text here..."
  }
}
```

### Implementation

```javascript
// In your scraping workflow, access from context:
const guidelines = $json.context.guidelines;
const customGuidelines = $json.context.customGuidelines;

// Use in your scraping prompt/agent:
let complianceInstructions = "";

if (guidelines === "ERGO") {
  complianceInstructions = "Apply ERGO compliance standards...";
} else if (guidelines === "Custom" && customGuidelines) {
  complianceInstructions = customGuidelines;
}
// If "None", complianceInstructions stays empty
```

### Notes

- `customGuidelines` is only populated when `guidelines === "Custom"`
- When `guidelines` is "None" or "ERGO", `customGuidelines` will be `null`
- Always check `guidelines` first, then use `customGuidelines` if needed

---

## Realistic Example: Multiple Incremental Scrapes

This example demonstrates a real-world scenario where a user navigates back and forth between steps, adding URLs incrementally.

### Scenario Timeline

1. **Initial Setup**: User creates campaign with 2 URLs → Full scrape
2. **First Return**: User goes back to Step 2, adds 1 new URL → Incremental scrape #1
3. **Second Return**: User goes back again, adds 2 more URLs → Incremental scrape #2

---

### Payload 1: Initial Full Scrape

**User Action**: Creates new campaign with 2 URLs

```json
{
  "campaignId": "550e8400-e29b-41d4-a716-446655440000",
  "mode": "full",
  "urls": [
    {
      "url": "https://acmecorp.com/products",
      "description": "Main product page"
    },
    {
      "url": "https://acmecorp.com/pricing",
      "description": "Pricing information"
    }
  ],
  "existingInsights": null,
  "context": {
    "topic": "Cloud storage solutions for small businesses",
    "niche": "B2B SaaS",
    "campaignType": "advertorial",
    "country": "United States",
    "language": "English",
    "guidelines": "Focus on security and ease of use",
    "customGuidelines": "Emphasize 30-day free trial"
  }
}
```

**Note:** Since `guidelines: "Custom"`, the `customGuidelines` field contains the user's specific instructions. Your n8n scraping workflow should use this text when analyzing content.

**Expected n8n Result** (stored in Supabase `scraping_result`):
```json
{
  "usps": [
    "Enterprise-grade security with end-to-end encryption",
    "99.9% uptime SLA guarantee",
    "Seamless integration with existing tools",
    "Unlimited storage for teams"
  ],
  "pricing": [
    "$29/month per user",
    "Annual plans save 20%",
    "Free 30-day trial, no credit card required"
  ],
  "mainAngle": [
    "Transform your business with secure, scalable cloud storage that grows with your team. Built for modern businesses that value security without sacrificing simplicity."
  ],
  "toneOfVoice": [
    "Professional yet approachable, confident without being pushy, technical but accessible to non-technical decision makers"
  ],
  "keyHooks": [
    "Stop losing sleep over data security",
    "The cloud storage solution that actually works for small teams",
    "Why 10,000+ businesses trust AcmeCorp for their data"
  ]
}
```

---

### Payload 2: First Incremental Scrape

**User Action**: Goes back to Step 2, adds 1 new URL (`https://acmecorp.com/testimonials`)

```json
{
  "campaignId": "550e8400-e29b-41d4-a716-446655440000",
  "mode": "incremental",
  "urls": [
    {
      "url": "https://acmecorp.com/testimonials",
      "description": "Customer testimonials and case studies"
    }
  ],
  "existingInsights": {
    "usps": [
      "Enterprise-grade security with end-to-end encryption",
      "99.9% uptime SLA guarantee",
      "Seamless integration with existing tools",
      "Unlimited storage for teams"
    ],
    "pricing": [
      "$29/month per user",
      "Annual plans save 20%",
      "Free 30-day trial, no credit card required"
    ],
    "mainAngle": [
      "Transform your business with secure, scalable cloud storage that grows with your team. Built for modern businesses that value security without sacrificing simplicity."
    ],
    "toneOfVoice": [
      "Professional yet approachable, confident without being pushy, technical but accessible to non-technical decision makers"
    ],
    "keyHooks": [
      "Stop losing sleep over data security",
      "The cloud storage solution that actually works for small teams",
      "Why 10,000+ businesses trust AcmeCorp for their data"
    ]
  },
  "context": {
    "topic": "Cloud storage solutions for small businesses",
    "niche": "B2B SaaS",
    "campaignType": "advertorial",
    "country": "United States",
    "language": "English",
    "guidelines": "Focus on security and ease of use",
    "customGuidelines": "Emphasize 30-day free trial"
  }
}
```

**n8n Scrapes**: Only `https://acmecorp.com/testimonials`

**New Insights from Testimonials Page**:
```json
{
  "usps": [
    "Rated 4.9/5 stars by 2,500+ customers",
    "Average 40% reduction in IT support tickets"
  ],
  "pricing": [],
  "mainAngle": [
    "Trusted by growing businesses who need reliable infrastructure without enterprise complexity"
  ],
  "toneOfVoice": [
    "Social proof and credibility-focused, highlighting real customer success stories"
  ],
  "keyHooks": [
    "Join 2,500+ businesses that never worry about data loss",
    "See why customers say 'we wish we switched sooner'"
  ]
}
```

**n8n Merges** (existing + new) → Final result stored in Supabase:
```json
{
  "usps": [
    "Enterprise-grade security with end-to-end encryption",
    "99.9% uptime SLA guarantee",
    "Seamless integration with existing tools",
    "Unlimited storage for teams",
    "Rated 4.9/5 stars by 2,500+ customers",
    "Average 40% reduction in IT support tickets"
  ],
  "pricing": [
    "$29/month per user",
    "Annual plans save 20%",
    "Free 30-day trial, no credit card required"
  ],
  "mainAngle": [
    "Transform your business with secure, scalable cloud storage that grows with your team. Built for modern businesses that value security without sacrificing simplicity.",
    "Trusted by growing businesses who need reliable infrastructure without enterprise complexity"
  ],
  "toneOfVoice": [
    "Professional yet approachable, confident without being pushy, technical but accessible to non-technical decision makers",
    "Social proof and credibility-focused, highlighting real customer success stories"
  ],
  "keyHooks": [
    "Stop losing sleep over data security",
    "The cloud storage solution that actually works for small teams",
    "Why 10,000+ businesses trust AcmeCorp for their data",
    "Join 2,500+ businesses that never worry about data loss",
    "See why customers say 'we wish we switched sooner'"
  ]
}
```

---

### Payload 3: Second Incremental Scrape

**User Action**: Goes back to Step 2 again, adds 2 more URLs (`https://acmecorp.com/features` and `https://acmecorp.com/security`)

```json
{
  "campaignId": "550e8400-e29b-41d4-a716-446655440000",
  "mode": "incremental",
  "urls": [
    {
      "url": "https://acmecorp.com/features",
      "description": "Detailed feature list"
    },
    {
      "url": "https://acmecorp.com/security",
      "description": "Security and compliance information"
    }
  ],
  "existingInsights": {
    "usps": [
      "Enterprise-grade security with end-to-end encryption",
      "99.9% uptime SLA guarantee",
      "Seamless integration with existing tools",
      "Unlimited storage for teams",
      "Rated 4.9/5 stars by 2,500+ customers",
      "Average 40% reduction in IT support tickets"
    ],
    "pricing": [
      "$29/month per user",
      "Annual plans save 20%",
      "Free 30-day trial, no credit card required"
    ],
    "mainAngle": [
      "Transform your business with secure, scalable cloud storage that grows with your team. Built for modern businesses that value security without sacrificing simplicity.",
      "Trusted by growing businesses who need reliable infrastructure without enterprise complexity"
    ],
    "toneOfVoice": [
      "Professional yet approachable, confident without being pushy, technical but accessible to non-technical decision makers",
      "Social proof and credibility-focused, highlighting real customer success stories"
    ],
    "keyHooks": [
      "Stop losing sleep over data security",
      "The cloud storage solution that actually works for small teams",
      "Why 10,000+ businesses trust AcmeCorp for their data",
      "Join 2,500+ businesses that never worry about data loss",
      "See why customers say 'we wish we switched sooner'"
    ]
  },
  "context": {
    "topic": "Cloud storage solutions for small businesses",
    "niche": "B2B SaaS",
    "campaignType": "advertorial",
    "country": "United States",
    "language": "English",
    "guidelines": "Focus on security and ease of use",
    "customGuidelines": "Emphasize 30-day free trial"
  }
}
```

**n8n Scrapes**: Only the 2 new URLs (`/features` and `/security`)

**New Insights from Features & Security Pages**:
```json
{
  "usps": [
    "Real-time collaboration with version history",
    "Advanced admin controls and user permissions",
    "SOC 2 Type II and GDPR compliant",
    "Automated backup every 6 hours"
  ],
  "pricing": [
    "Volume discounts available for 50+ users"
  ],
  "mainAngle": [
    "Built with security-first architecture, giving small businesses enterprise-level protection without the enterprise-level complexity or cost."
  ],
  "toneOfVoice": [
    "Technical and authoritative when discussing security features, reassuring and transparent about compliance standards"
  ],
  "keyHooks": [
    "The only cloud storage that meets enterprise security standards at small business prices",
    "Sleep soundly knowing your data is protected by the same security used by Fortune 500 companies"
  ]
}
```

**n8n Merges** (all previous + new) → Final result:
```json
{
  "usps": [
    "Enterprise-grade security with end-to-end encryption",
    "99.9% uptime SLA guarantee",
    "Seamless integration with existing tools",
    "Unlimited storage for teams",
    "Rated 4.9/5 stars by 2,500+ customers",
    "Average 40% reduction in IT support tickets",
    "Real-time collaboration with version history",
    "Advanced admin controls and user permissions",
    "SOC 2 Type II and GDPR compliant",
    "Automated backup every 6 hours"
  ],
  "pricing": [
    "$29/month per user",
    "Annual plans save 20%",
    "Free 30-day trial, no credit card required",
    "Volume discounts available for 50+ users"
  ],
  "mainAngle": [
    "Transform your business with secure, scalable cloud storage that grows with your team. Built for modern businesses that value security without sacrificing simplicity.",
    "Trusted by growing businesses who need reliable infrastructure without enterprise complexity",
    "Built with security-first architecture, giving small businesses enterprise-level protection without the enterprise-level complexity or cost."
  ],
  "toneOfVoice": [
    "Professional yet approachable, confident without being pushy, technical but accessible to non-technical decision makers",
    "Social proof and credibility-focused, highlighting real customer success stories",
    "Technical and authoritative when discussing security features, reassuring and transparent about compliance standards"
  ],
  "keyHooks": [
    "Stop losing sleep over data security",
    "The cloud storage solution that actually works for small teams",
    "Why 10,000+ businesses trust AcmeCorp for their data",
    "Join 2,500+ businesses that never worry about data loss",
    "See why customers say 'we wish we switched sooner'",
    "The only cloud storage that meets enterprise security standards at small business prices",
    "Sleep soundly knowing your data is protected by the same security used by Fortune 500 companies"
  ]
}
```

---

### Key Observations

1. **Accumulation**: Each incremental scrape adds to the existing insights. The `existingInsights` payload grows larger with each iteration.

2. **URL Filtering**: Only new URLs are sent in the `urls` array. n8n should only scrape these URLs, not re-scrape existing ones.

3. **No Deduplication**: If similar insights appear across different URLs, they will all be included. The user can manually deselect duplicates in Step 3 (Insights).

4. **Context Consistency**: The `context` object remains the same across all scrapes for the same campaign, ensuring consistent analysis parameters.

5. **Multiple URLs in One Incremental Scrape**: Users can add multiple URLs at once, and n8n will receive all of them in a single incremental payload.

---

## ⚠️ What Happens If You Don't Implement This?

If you don't add the merge logic for incremental mode, here's what will happen:

### The Problem

**Scenario:**
1. User scrapes 2 URLs initially → Gets 10 USPs, 3 pricing points, etc.
2. User goes back, adds 1 new URL → Incremental scrape triggered
3. **Without merge logic:** n8n scrapes the new URL, gets 2 new USPs
4. **n8n overwrites Supabase** with ONLY the 2 new USPs (loses the original 10!)
5. **User sees:** Only insights from the new URL, all previous insights are gone

### Consequences

❌ **Data Loss**: All insights from previously scraped URLs are permanently lost  
❌ **Poor UX**: Users will be confused why their previous insights disappeared  
❌ **Work Wasted**: Users may have already selected/edited insights in Step 3, all that work is lost  
❌ **No Recovery**: The old insights aren't stored anywhere else - they're gone

### What the App Expects

The app sends `existingInsights` in the payload specifically so you can merge them. If you ignore this and only save new results, you're overwriting valuable data.

### Visual Example

```
Initial Scrape (2 URLs):
┌─────────────────────────────────────┐
│ scraping_result in Supabase:       │
│ • 10 USPs                          │
│ • 5 pricing points                 │
│ • 3 main angles                    │
│ • 2 tone of voice                  │
│ • 8 key hooks                      │
└─────────────────────────────────────┘

User adds 1 new URL → Incremental scrape

WITHOUT MERGE (❌ WRONG):
┌─────────────────────────────────────┐
│ n8n scrapes new URL → gets:        │
│ • 2 new USPs                       │
│ • 1 new pricing point              │
│                                     │
│ n8n saves ONLY new results:        │
│ • 2 USPs  ← Lost the 10!            │
│ • 1 pricing point ← Lost the 5!    │
│ • 0 main angles ← Lost the 3!      │
│ • 0 tone of voice ← Lost the 2!    │
│ • 0 key hooks ← Lost the 8!        │
└─────────────────────────────────────┘

WITH MERGE (✅ CORRECT):
┌─────────────────────────────────────┐
│ n8n scrapes new URL → gets:        │
│ • 2 new USPs                       │
│ • 1 new pricing point              │
│                                     │
│ n8n merges: existing + new         │
│ • 12 USPs (10 old + 2 new) ✅      │
│ • 6 pricing (5 old + 1 new) ✅     │
│ • 3 main angles (kept) ✅           │
│ • 2 tone of voice (kept) ✅         │
│ • 8 key hooks (kept) ✅             │
└─────────────────────────────────────┘
```

**Bottom line:** You MUST merge `existingInsights` + new results, or users will lose their previous work.

---

## Quick Answer: What Needs to Change?

**Good news:** Your existing scraping logic doesn't need to change! The app already filters the URLs, so in incremental mode you'll only receive new URLs to scrape.

**What you DO need to add:**
1. Check the `mode` field to detect incremental vs full
2. For incremental mode: Merge new scraping results with `existingInsights` (provided in payload)
3. Write the merged result to Supabase

**What you DON'T need to worry about:**
- ❌ Filtering URLs (app does this)
- ❌ Re-scraping old URLs (they're not sent)
- ❌ Querying Supabase for existing data (it's in `existingInsights`)

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

Connect the IF node's "true" output to your scraping nodes. 

**Important:** The `urls` array already contains **ONLY the new URLs** - old URLs are filtered out by the app before sending. Your existing scraping logic will work as-is because it will only receive the new URLs to scrape.

**Skip the consolidation/deduplication agent** for incremental mode (it's designed for multiple URLs and cross-page analysis).

### Step 3: Add Merge Code Node

After scraping completes on the incremental path, add a **Code** node to merge results:

**This is the ONLY required change** - you need to merge the new scraping results with the `existingInsights` that were sent in the webhook payload.

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

**Note:** The app already filters out old URLs before sending to n8n, so you don't need to worry about re-scraping existing URLs. Just scrape what's in the `urls` array and merge with `existingInsights`.

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
