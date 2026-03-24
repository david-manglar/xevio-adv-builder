"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Sparkles, Check, X, Loader2 } from "lucide-react"

interface AiRewritePopoverProps {
  selectedText: string
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
  position: { top: number; left: number }
  onAccept: (rewrittenText: string) => void
  onCancel: () => void
}

export function AiRewritePopover({
  selectedText,
  fullArticleHtml,
  campaignContext,
  campaignId,
  position,
  onAccept,
  onCancel,
}: AiRewritePopoverProps) {
  const [instruction, setInstruction] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [rewrittenText, setRewrittenText] = useState<string | null>(null)
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
          fullArticleHtml,
          instruction: instruction.trim(),
          campaignContext,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to rewrite")
      }

      const data = await response.json()
      setRewrittenText(data.rewrittenText)
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
        {/* Original text preview */}
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1">Selected text</p>
          <p className="text-sm text-foreground bg-muted/50 rounded-md p-2 max-h-20 overflow-y-auto">
            {selectedText.length > 200
              ? selectedText.substring(0, 200) + "..."
              : selectedText}
          </p>
        </div>

        {/* Rewrite result */}
        {rewrittenText !== null ? (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">
              Rewritten version
            </p>
            <p className="text-sm text-foreground bg-[#4644B6]/5 border border-[#4644B6]/20 rounded-md p-2 max-h-32 overflow-y-auto">
              {rewrittenText}
            </p>
            <div className="flex items-center gap-2 mt-3">
              <Button
                size="sm"
                className="flex-1 bg-[#4644B6] hover:bg-[#3a38a0]"
                onClick={() => onAccept(rewrittenText)}
              >
                <Check className="mr-2 h-4 w-4" />
                Accept
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 bg-transparent"
                onClick={() => {
                  setRewrittenText(null)
                  setInstruction("")
                }}
              >
                Try Again
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onCancel}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <>
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
          </>
        )}
      </div>
    </div>
  )
}
