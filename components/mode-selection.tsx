"use client"

import { useMemo } from "react"
import { ArrowRight } from "lucide-react"

const greetingSubtitles = [
  "What would you like to do today?",
  "What are you feeling like?",
  "Got the time? Or feeling lazy?",
  "Woke up inspired — or keeping it chill?",
  "Ready to build, or ready to ship?",
]

function DotGrid({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="180"
      height="180"
      viewBox="0 0 180 180"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {Array.from({ length: 9 }).map((_, row) =>
        Array.from({ length: 9 }).map((_, col) => (
          <circle
            key={`${row}-${col}`}
            cx={10 + col * 20}
            cy={10 + row * 20}
            r="1.5"
            fill="white"
            opacity="0.15"
          />
        ))
      )}
    </svg>
  )
}

interface ModeSelectionProps {
  userEmail: string
  onSelectMode: (mode: "full" | "lazy") => void
}

export function ModeSelection({ userEmail, onSelectMode }: ModeSelectionProps) {
  const displayName = userEmail.split("@")[0]
  const subtitle = useMemo(
    () => greetingSubtitles[Math.floor(Math.random() * greetingSubtitles.length)],
    []
  )

  return (
    <div className="flex flex-col items-center justify-center py-16 px-6">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-semibold text-foreground">
          Welcome back, {displayName}
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">{subtitle}</p>
      </div>

      <div className="grid gap-8 md:grid-cols-2 w-full max-w-7xl">
        {/* Full Builder */}
        <button
          onClick={() => onSelectMode("full")}
          className="group relative flex flex-col items-center justify-center gap-6 rounded-2xl px-14 py-16 text-center transition-all duration-200 cursor-pointer overflow-hidden hover:scale-[1.02] hover:shadow-2xl"
          style={{
            background: "linear-gradient(135deg, #4644B6 0%, #3532a0 100%)",
            minHeight: "420px",
          }}
        >
          <DotGrid className="absolute bottom-0 right-0 opacity-60" />
          <DotGrid className="absolute top-0 left-0 opacity-30" />

          <span className="relative text-7xl" role="img" aria-label="Construction worker">
            👷
          </span>
          <div className="relative">
            <h2 className="text-2xl font-bold text-white">Full Builder</h2>
            <p className="text-white/75 mt-3 text-base leading-relaxed max-w-[340px]">
              Build an advertorial from scratch with full control over structure,
              insights, and content.
            </p>
          </div>
          <div className="relative mt-2 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#4644B6] transition-all group-hover:shadow-lg">
            <span>Build from scratch</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </div>
        </button>

        {/* Lazy Mode */}
        <button
          onClick={() => onSelectMode("lazy")}
          className="group relative flex flex-col items-center justify-center gap-6 rounded-2xl px-14 py-16 text-center transition-all duration-200 cursor-pointer overflow-hidden hover:scale-[1.02] hover:shadow-2xl"
          style={{
            background: "linear-gradient(135deg, #0dadb7 0%, #0a9199 100%)",
            minHeight: "420px",
          }}
        >
          <DotGrid className="absolute top-0 right-0 opacity-60" />
          <DotGrid className="absolute bottom-0 left-0 opacity-30" />

          <span className="relative text-7xl" role="img" aria-label="Person on couch">
            🛋️
          </span>
          <div className="relative">
            <h2 className="text-2xl font-bold text-white">Lazy Mode</h2>
            <p className="text-white/75 mt-3 text-base leading-relaxed max-w-[340px]">
              Iterate on an existing advertorial with a prompt. Provide reference
              pages, describe your changes, and get a rewrite.
            </p>
          </div>
          <div className="relative mt-2 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#0a9199] transition-all group-hover:shadow-lg">
            <span>Help me rewrite</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </div>
        </button>
      </div>
    </div>
  )
}
