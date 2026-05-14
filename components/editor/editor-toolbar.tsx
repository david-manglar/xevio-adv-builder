"use client"

import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Copy, FileText, ExternalLink, Save, RotateCcw, Loader2, Pencil } from "lucide-react"
import { toast } from "sonner"
import type { Editor } from "@tiptap/react"

interface EditorToolbarProps {
  editor: Editor | null
  documentUrl?: string
  documentName?: string
  isSaving: boolean
  campaignId?: string
  onSave: () => void
  onStartOver: () => void
}

export function EditorToolbar({
  editor,
  documentUrl,
  documentName,
  isSaving,
  campaignId,
  onSave,
  onStartOver,
}: EditorToolbarProps) {
  const [isExporting, setIsExporting] = useState(false)
  const [isEditingName, setIsEditingName] = useState(false)
  const [editName, setEditName] = useState(documentName || "")
  const nameInputRef = useRef<HTMLInputElement>(null)

  const handleNameSave = useCallback(async () => {
    const trimmed = editName.trim()
    if (!trimmed || !campaignId || trimmed === documentName) {
      setEditName(documentName || "")
      setIsEditingName(false)
      return
    }

    try {
      const response = await fetch("/api/save-editor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaignId, docName: trimmed }),
      })
      if (!response.ok) throw new Error("Failed to save name")
    } catch (error) {
      console.error("Error saving doc name:", error)
      toast.error("Failed to save document name")
      setEditName(documentName || "")
    }
    setIsEditingName(false)
  }, [editName, campaignId, documentName])

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

  const handleExportGoogleDoc = async () => {
    if (!campaignId) return

    setIsExporting(true)
    try {
      // Save current editor content first
      await onSave()

      const response = await fetch("/api/create-google-doc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaignId }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to export")
      }

    } catch (error) {
      console.error("Error exporting to Google Doc:", error)
      toast.error("Failed to create Google Doc")
      setIsExporting(false)
    }
  }

  return (
    <div className="flex items-center justify-between border-b border-border bg-card px-6 py-3">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <FileText className="h-4 w-4 shrink-0" />
          {isEditingName ? (
            <input
              ref={nameInputRef}
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={handleNameSave}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleNameSave()
                if (e.key === "Escape") {
                  setEditName(documentName || "")
                  setIsEditingName(false)
                }
              }}
              autoFocus
              className="bg-transparent border-b border-[#4644B6] outline-none text-foreground text-sm min-w-[200px]"
            />
          ) : (
            <button
              onClick={() => {
                setEditName(documentName || "")
                setIsEditingName(true)
              }}
              className="flex items-center gap-1.5 hover:text-foreground transition-colors group"
              title="Click to rename"
            >
              <span>{documentName || "Generated Advertorial"}</span>
              <Pencil className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          )}
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

        {documentUrl ? (
          <Button variant="outline" size="sm" className="bg-transparent" asChild>
            <a href={documentUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" />
              Google Docs
            </a>
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="bg-transparent"
            onClick={handleExportGoogleDoc}
            disabled={isExporting || !campaignId}
          >
            {isExporting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <ExternalLink className="mr-2 h-4 w-4" />
            )}
            {isExporting ? "Exporting..." : "Export to Google Doc"}
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
