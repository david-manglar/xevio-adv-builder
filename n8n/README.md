# n8n Workflows

This folder contains n8n workflow JSONs and code snippets for the Xevio Advertorial Builder.

## Workflows

| Workflow | Webhook | Description |
|----------|---------|-------------|
| Scraping | `N8N_SCRAPE_WEBHOOK_URL` | Scrapes reference URLs, extracts insights |
| Generation | `N8N_GENERATE_WEBHOOK_URL` | Generates final advertorial content (Full mode) |
| Lazy Generation | `N8N_LAZY_MODE_WEBHOOK_URL` | Generates content in accelerated Lazy mode |

## Payload Documentation

See `/docs/n8n-generation-workflow.md` and `/docs/n8n-incremental-scraping.md` for payload structures.

## File Naming

- `workflow-<name>.json` — Full workflow exports from n8n
- `code-<name>.js` — Code node snippets
