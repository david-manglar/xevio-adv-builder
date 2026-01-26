# n8n Generation/Writer Workflow Documentation

This document outlines the payload structure and requirements for the n8n generation/writer workflow that creates the final advertorial content.

## Overview

The generation workflow is triggered when a user completes all steps and clicks "Generate" in Step 5 (Review). This workflow receives all campaign settings, selected insights, structure blocks, and reference URLs to generate the final advertorial content.

---

## Webhook Payload Structure

### Complete Payload Example

```json
{
  "campaignId": "550e8400-e29b-41d4-a716-446655440000",
  "topic": "Cloud storage solutions for small businesses",
  "campaignType": "Lead Generation",
  "niche": "B2B SaaS",
  "country": "United States",
  "language": "English",
  "length": "1500",
  "paragraphLength": "Normal (3-4 lines)",
  "guidelines": "None" | "ERGO" | "Custom",
  "customGuidelines": null | "User's custom compliance text...",
  "referenceUrls": [
    {
      "url": "https://acmecorp.com/products",
      "description": "Main product page"
    },
    {
      "url": "https://acmecorp.com/pricing",
      "description": null
    }
  ],
  "selectedInsights": {
    "usps": [
      "Enterprise-grade security with end-to-end encryption",
      "99.9% uptime SLA guarantee"
    ],
    "pricing": [
      "$29/month per user",
      "Annual plans save 20%"
    ],
    "mainAngle": [
      "Transform your business with secure, scalable cloud storage..."
    ],
    "toneOfVoice": [
      "Professional yet approachable, confident without being pushy..."
    ],
    "keyHooks": [
      "Stop losing sleep over data security",
      "The cloud storage solution that actually works for small teams"
    ]
  },
  "structureBlocks": [
    {
      "position": 1,
      "name": "Hook",
      "inputValue": null,
      "selectValue": null
    },
    {
      "position": 2,
      "name": "Problem",
      "inputValue": null,
      "selectValue": null
    },
    {
      "position": 3,
      "name": "Solution",
      "inputValue": "Focus on security features",
      "selectValue": null
    },
    {
      "position": 4,
      "name": "USP",
      "inputValue": null,
      "selectValue": "Enterprise-grade security"
    }
  ]
}
```

---

## Custom Compliance Guidelines

The app supports three compliance guideline options:
- **"None"**: No specific compliance requirements
- **"ERGO"**: Standard ERGO compliance guidelines
- **"Custom"**: User-provided custom compliance instructions

### How It Works

When a user selects **"Custom"**, they must provide specific compliance instructions in a textarea. These instructions are sent in the `customGuidelines` field at the top level of the payload.

### Payload Structure

The compliance fields are at the top level of the payload:

```json
{
  "campaignId": "uuid",
  "topic": "...",
  "campaignType": "...",
  "niche": "...",
  "country": "...",
  "language": "...",
  "length": "1500",
  "paragraphLength": "Normal (3-4 lines)",
  "guidelines": "None" | "ERGO" | "Custom",
  "customGuidelines": null | "User's custom text here...",
  "referenceUrls": [...],
  "selectedInsights": {...},
  "structureBlocks": [...]
}
```

### Examples

#### Example 1: Guidelines = "None"

```json
{
  "guidelines": "None",
  "customGuidelines": null
}
```

**n8n Action:** No special compliance handling needed.

---

#### Example 2: Guidelines = "ERGO"

```json
{
  "guidelines": "ERGO",
  "customGuidelines": null
}
```

**n8n Action:** Apply standard ERGO compliance rules (you should have these predefined in your workflow).

---

#### Example 3: Guidelines = "Custom"

```json
{
  "guidelines": "Custom",
  "customGuidelines": "Do not use the word 'guarantee' or 'promise'. Only mention Bundle A pricing. Avoid any health claims. Must include disclaimer: 'Results may vary.'"
}
```

**n8n Action:** Use the `customGuidelines` text as specific instructions for content generation.

### Implementation Guide for n8n

```javascript
// In your writer workflow, access from top level:
const guidelines = $json.guidelines;
const customGuidelines = $json.customGuidelines;

// Build compliance section for your prompt:
let complianceSection = "";

if (guidelines === "ERGO") {
  complianceSection = "ERGO Compliance Requirements:\n- [Your ERGO rules here]";
} else if (guidelines === "Custom" && customGuidelines) {
  complianceSection = "Custom Compliance Requirements:\n" + customGuidelines;
}

// Include in your final prompt to the writer agent
const fullPrompt = `
  Topic: ${$json.topic}
  Campaign Type: ${$json.campaignType}
  Niche: ${$json.niche}
  Country: ${$json.country}
  Language: ${$json.language}
  Length: ${$json.length} words
  Paragraph Length: ${$json.paragraphLength}
  
  ${complianceSection}
  
  Selected Insights:
  ${JSON.stringify($json.selectedInsights, null, 2)}
  
  Structure Blocks:
  ${JSON.stringify($json.structureBlocks, null, 2)}
  
  Reference URLs:
  ${JSON.stringify($json.referenceUrls, null, 2)}
`;
```

### Important Notes

1. **`customGuidelines` is only populated when `guidelines === "Custom"`**
   - When `guidelines` is "None" or "ERGO", `customGuidelines` will be `null`
   - Always check `guidelines` first, then use `customGuidelines` if needed

2. **Validation in App**
   - The app validates that if `guidelines === "Custom"`, then `customGuidelines` must not be empty
   - You can safely assume that when `guidelines === "Custom"`, `customGuidelines` contains valid text

3. **Required Fields**
   - All top-level fields shown in the payload structure are always present
   - `customGuidelines` may be `null` (when guidelines is "None" or "ERGO")

---

## Field Descriptions

### Campaign Settings

- **`campaignId`**: UUID of the campaign in Supabase
- **`topic`**: Detailed description of the advertorial topic (from Step 1 or edited in Step 5)
- **`campaignType`**: Either "Lead Generation" or "E-commerce"
- **`niche`**: Selected niche (e.g., "B2B SaaS", "Health Supplements", etc.)
- **`country`**: Target country (e.g., "United States", "United Kingdom")
- **`language`**: Target language (e.g., "English", "German")
- **`length`**: Target word count as string (e.g., "1500")
- **`paragraphLength`**: Paragraph style preference (e.g., "Normal (3-4 lines)")

### Compliance

- **`guidelines`**: One of "None", "ERGO", or "Custom"
- **`customGuidelines`**: User-provided compliance text (only when `guidelines === "Custom"`), otherwise `null`

### Content Data

- **`referenceUrls`**: Array of reference URLs with optional descriptions
  ```json
  [
    { "url": "https://example.com/page", "description": "Product page" },
    { "url": "https://example.com/pricing", "description": null }
  ]
  ```

- **`selectedInsights`**: Object containing only the insights the user selected in Step 3
  ```json
  {
    "usps": ["USP 1", "USP 2"],
    "pricing": ["$99/month"],
    "mainAngle": ["Angle description..."],
    "toneOfVoice": ["Tone description..."],
    "keyHooks": ["Hook 1", "Hook 2"]
  }
  ```

- **`structureBlocks`**: Ordered array of structure blocks with their inputs
  ```json
  [
    {
      "position": 1,
      "name": "Hook",
      "inputValue": "Custom input text" | null,
      "selectValue": "Selected option" | null
    }
  ]
  ```

---

## Workflow Requirements

1. **Generate Content**: Use all provided data to generate the advertorial
2. **Apply Compliance**: Respect `guidelines` and `customGuidelines` when generating
3. **Follow Structure**: Generate content according to the order and inputs in `structureBlocks`
4. **Use Selected Insights**: Only use insights from `selectedInsights` (user has already filtered)
5. **Meet Length Requirements**: Target the specified `length` in words
6. **Update Supabase**: After generation, update the campaign:
   ```sql
   UPDATE campaigns
   SET 
     generated_content = $generatedContent,
     status = 'completed'
   WHERE id = $campaignId
   ```

---

## Testing Checklist

- [ ] Test with `guidelines: "None"` - verify no compliance restrictions applied
- [ ] Test with `guidelines: "ERGO"` - verify ERGO rules are applied
- [ ] Test with `guidelines: "Custom"` - verify custom guidelines are followed
- [ ] Test with empty `customGuidelines` when `guidelines: "Custom"` (should not happen, but handle gracefully)
- [ ] Verify content length matches `length` requirement
- [ ] Verify structure blocks are followed in order
- [ ] Verify only selected insights are used
- [ ] Verify reference URLs are referenced appropriately
