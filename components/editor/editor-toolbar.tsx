"use client"

import { Button } from "@/components/ui/button"
import { Copy, FileText, ExternalLink, Save, RotateCcw } from "lucide-react"
import { toast } from "sonner"
import type { Editor } from "@tiptap/react"

interface EditorToolbarProps {
  editor: Editor | null
  documentUrl?: string
  documentName?: string
  isSaving: boolean
  onSave: () => void
  onStartOver: () => void
}

export function EditorToolbar({
  editor,
  documentUrl,
  documentName,
  isSaving,
  onSave,
  onStartOver,
}: EditorToolbarProps) {
  const wordCount = editor
    ? editor.getText().split(/\s+/).filter(Boolean).length
    : 0

  const handleCopyAll = async () => {
    if (!editor) return

    const html = editor.getHTML()
    const text = editor.getText()

    try {
      await navigator.clipboard.write([
        new ClipboardItem({
          "text/html": new Blob([html], { type: "text/html" }),
          "text/plain": new Blob([text], { type: "text/plain" }),
        }),
      ])
      toast.success("Copied to clipboard", {
        description: "Content copied as formatted text. Paste it anywhere.",
      })
    } catch {
      // Fallback to plain text copy
      try {
        await navigator.clipboard.writeText(text)
        toast.success("Copied as plain text")
      } catch {
        toast.error("Failed to copy to clipboard")
      }
    }
  }

  return (
    <div className="flex items-center justify-between border-b border-border bg-card px-6 py-3">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <FileText className="h-4 w-4" />
          <span>{documentName || "Generated Advertorial"}</span>
        </div>
        <div className="h-4 w-px bg-border" />
        <span className="text-sm text-muted-foreground">
          {wordCount.toLocaleString()} words
        </span>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="bg-transparent"
          onClick={handleCopyAll}
        >
          <Copy className="mr-2 h-4 w-4" />
          Copy All
        </Button>

        {documentUrl && (
          <Button variant="outline" size="sm" className="bg-transparent" asChild>
            <a href={documentUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" />
              Google Docs
            </a>
          </Button>
        )}

        <Button
          variant="outline"
          size="sm"
          className="bg-transparent"
          onClick={onSave}
          disabled={isSaving}
        >
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? "Saving..." : "Save"}
        </Button>

        <div className="h-4 w-px bg-border" />

        <Button
          variant="outline"
          size="sm"
          className="bg-transparent"
          onClick={onStartOver}
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          New Advertorial
        </Button>
      </div>
    </div>
  )
}
