# Xevio Advertorial Builder

A powerful tool for building high-converting advertorials with an intuitive 6-step wizard interface.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **UI:** React 19 + TypeScript
- **Styling:** Tailwind CSS v4
- **Components:** shadcn/ui
- **Drag & Drop:** @dnd-kit
- **Backend:** Supabase
- **Deployment:** Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm

### Installation

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── app/                  # Next.js App Router pages
│   ├── api/              # API routes
│   ├── globals.css       # Global styles & Tailwind config
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Main page
├── components/           # React components
│   ├── ui/               # shadcn/ui primitives
│   ├── step-one.tsx      # Wizard steps
│   ├── step-two.tsx
│   ├── step-three.tsx
│   ├── step-four.tsx
│   ├── step-five.tsx
│   └── ...
├── lib/                  # Utilities
│   ├── auth.ts           # Authentication helpers
│   ├── supabase.ts       # Supabase client
│   ├── types.ts          # TypeScript types
│   └── utils.ts          # Utility functions
└── public/               # Static assets
```

## Design Tokens

| Token | Value | Usage |
|-------|-------|-------|
| Brand Teal | `#0dadb7` | Icons, accents |
| Brand Purple | `#4644b6` | CTAs, active states |
| Brand Gray | `#f6f6f6` | Backgrounds |

## Scripts

```bash
pnpm dev      # Start development server
pnpm build    # Build for production
pnpm start    # Start production server
pnpm lint     # Run ESLint
```

## License

Private - All rights reserved.
