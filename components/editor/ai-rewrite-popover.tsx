"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Sparkles, Check, X, Loader2, RotateCcw } from "lucide-react"

interface SelectionContext {
  nodeType: string
  headingLevel?: number
  hasPlaceholders: boolean
  isPlaceholderOnly: boolean
  activeMarks?: string[]
  charCount?: number
  sentenceCount?: number
}

// Phase 1: Instruction input popover
interface AiRewritePopoverProps {
  selectedText: string
  selectedHtml: string
  fullArticleHtml: string
  campaignContext: {
    topic: string
    niche: string
    language: string
    guidelines: string
    customGuidelines: string
    paragraphLength: string
  }
  campaignId?: string
  selectionContext?: SelectionContext | null
  position: { top: number; left: number }
  onRewriteResult: (rewrittenHtml: string) => void
  onCancel: () => void
}

export function AiRewritePopover({
  selectedText,
  selectedHtml,
  fullArticleHtml,
  campaignContext,
  campaignId,
  selectionContext,
  position,
  onRewriteResult,
  onCancel,
}: AiRewritePopoverProps) {
  const [instruction, setInstruction] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleRewrite = async () => {
    if (!instruction.trim()) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/ai-rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignId,
          selectedText,
          selectedHtml,
          fullArticleHtml,
          instruction: instruction.trim(),
          campaignContext,
          selectionContext,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to rewrite")
      }

      const data = await response.json()
      onRewriteResult(data.rewrittenHtml)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div
      className="absolute z-50 w-96 rounded-lg border border-border bg-card shadow-lg"
      style={{
        top: position.top + 24,
        left: Math.max(0, position.left - 160),
      }}
    >
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <Sparkles className="h-4 w-4 text-[#4644B6]" />
        <span className="text-sm font-medium">AI Rewrite</span>
      </div>

      <div className="p-4 space-y-3">
        {/* Instruction input */}
        <div>
          <Textarea
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            placeholder="e.g., Make this more urgent, Shorten to 2 sentences, Change tone to casual..."
            className="resize-none text-sm"
            rows={3}
            disabled={isLoading}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleRewrite()
              }
            }}
          />
        </div>

        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            className="flex-1 bg-[#4644B6] hover:bg-[#3a38a0]"
            onClick={handleRewrite}
            disabled={isLoading || !instruction.trim()}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Rewriting...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Rewrite
              </>
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
}

// Phase 2: Floating action bar for preview
interface AiRewriteActionBarProps {
  position: { top: number; left: number }
  onAccept: () => void
  onTryAgain: () => void
  onCancel: () => void
}

export function AiRewriteActionBar({
  position,
  onAccept,
  onTryAgain,
  onCancel,
}: AiRewriteActionBarProps) {
  return (
    <div
      className="absolute z-50 flex items-center gap-1.5 rounded-lg border border-[#3a38a0] bg-[#4644B6] shadow-lg px-3 py-2 left-1/2 -translate-x-1/2"
      style={{
        top: position.top + 8,
      }}
    >
      <Sparkles className="h-4 w-4 text-white/70 shrink-0" />
      <span className="text-xs text-white/70 mr-1 whitespace-nowrap">AI Rewrite</span>
      <Button
        size="sm"
        className="h-7 bg-white hover:bg-white/90 hover:text-[#4644B6] text-[#4644B6] text-xs px-3"
        onClick={onAccept}
      >
        <Check className="mr-1.5 h-3 w-3" />
        Accept
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="h-7 bg-transparent border-white/30 text-white hover:bg-white/10 hover:text-white text-xs px-3"
        onClick={onTryAgain}
      >
        <RotateCcw className="mr-1.5 h-3 w-3" />
        Try again
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="h-7 w-7 p-0 text-white/70 hover:text-white hover:bg-white/10"
        onClick={onCancel}
      >
        <X className="h-3.5 w-3.5" />
      </Button>
    </div>
  )
}
