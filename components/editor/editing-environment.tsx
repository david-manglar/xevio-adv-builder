"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Underline from "@tiptap/extension-underline"
import Placeholder from "@tiptap/extension-placeholder"
import { Plugin, PluginKey } from "@tiptap/pm/state"
import { Decoration, DecorationSet } from "@tiptap/pm/view"
import { DOMSerializer } from "@tiptap/pm/model"
import { Extension } from "@tiptap/core"
import { Button } from "@/components/ui/button"
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Undo,
  Redo,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  X,
} from "lucide-react"
import { EditorToolbar } from "./editor-toolbar"
import { AiRewritePopover, AiRewriteActionBar } from "./ai-rewrite-popover"
import { cn } from "@/lib/utils"
import type { CampaignData, StepOneState, StepThreeState, LazyModeState } from "@/lib/types"

const placeholderPattern = /\[(IMAGE|CTA BUTTON|PRODUCT WIDGET|VIDEO|DISCLAIMER):\s*[^\]]+\]/gi

// Shared mutable ref that the decoration plugin reads directly
// This avoids plugin state/meta issues — just set the range and trigger a re-render
const highlightRange = { from: 0, to: 0 }

function createAiHighlightPlugin() {
  return new Plugin({
    key: new PluginKey('aiRewriteHighlight'),
    props: {
      decorations(state) {
        const { from, to } = highlightRange
        if (from === 0 && to === 0) return DecorationSet.empty
        if (from >= to || to > state.doc.content.size) return DecorationSet.empty
        const decorations: Decoration[] = []
        state.doc.nodesBetween(from, to, (node, pos) => {
          if (node.isText) {
            const start = Math.max(from, pos)
            const end = Math.min(to, pos + node.nodeSize)
            if (start < end) {
              decorations.push(
                Decoration.inline(start, end, { class: 'ai-rewrite-highlight' })
              )
            }
          }
        })
        return DecorationSet.create(state.doc, decorations)
      },
    },
  })
}

const AiRewriteHighlight = Extension.create({
  name: 'aiRewriteHighlight',
  addProseMirrorPlugins() {
    return [createAiHighlightPlugin()]
  },
})

const PlaceholderHighlight = Extension.create({
  name: 'placeholderHighlight',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('placeholderHighlight'),
        props: {
          decorations(state) {
            const decorations: Decoration[] = []
            state.doc.descendants((node, pos) => {
              if (!node.isText || !node.text) return
              let match
              placeholderPattern.lastIndex = 0
              while ((match = placeholderPattern.exec(node.text)) !== null) {
                const from = pos + match.index
                const to = from + match[0].length
                decorations.push(
                  Decoration.inline(from, to, { class: 'adv-placeholder' })
                )
              }
            })
            return DecorationSet.create(state.doc, decorations)
          },
        },
      }),
    ]
  },
})

interface EditingEnvironmentProps {
  generatedHtml: string
  documentUrl?: string
  documentName?: string
  campaignId?: string
  campaignData: CampaignData
  stepOneData?: StepOneState
  stepThreeData?: StepThreeState
  lazyModeData?: LazyModeState
  onStartOver: () => void
}

// AI rewrite phase: 'instruction' = popover with input, 'preview' = content inserted with action bar
type RewritePhase = 'instruction' | 'preview' | null

export function EditingEnvironment({
  generatedHtml,
  documentUrl,
  documentName,
  campaignId,
  campaignData,
  stepOneData,
  stepThreeData,
  lazyModeData,
  onStartOver,
}: EditingEnvironmentProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [rewritePhase, setRewritePhase] = useState<RewritePhase>(null)
  const [selectedText, setSelectedText] = useState("")
  const [selectedHtml, setSelectedHtml] = useState("")
  const [aiPopoverPosition, setAiPopoverPosition] = useState({ top: 0, left: 0 })
  const [showDocModal, setShowDocModal] = useState(false)
  const editorContainerRef = useRef<HTMLDivElement>(null)
  const prevDocUrl = useRef(documentUrl)
  const originalEditorHtml = useRef<string | null>(null)
  const rewriteSelectionRange = useRef<{ from: number; to: number } | null>(null)

  // Show modal when Google Doc URL arrives
  useEffect(() => {
    if (documentUrl && !prevDocUrl.current) {
      setShowDocModal(true)
    }
    prevDocUrl.current = documentUrl
  }, [documentUrl])

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      Placeholder.configure({
        placeholder: "Start editing your advertorial...",
      }),
      PlaceholderHighlight,
      AiRewriteHighlight,
    ],
    content: generatedHtml,
    editorProps: {
      attributes: {
        class:
          "prose prose-neutral max-w-none focus:outline-none min-h-[500px] px-12 py-8",
      },
    },
  })

  const handleSave = useCallback(async () => {
    if (!editor || !campaignId) return

    setIsSaving(true)
    try {
      const response = await fetch("/api/save-editor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignId,
          editorContent: editor.getHTML(),
        }),
      })

      if (!response.ok) throw new Error("Failed to save")
    } catch (error) {
      console.error("Error saving editor content:", error)
    } finally {
      setIsSaving(false)
    }
  }, [editor, campaignId])

  // Set or clear the AI rewrite highlight decoration
  const setHighlightRange = useCallback((from: number, to: number) => {
    if (!editor) return
    highlightRange.from = from
    highlightRange.to = to
    // Dispatch a no-op transaction to force the decoration plugin to re-evaluate
    editor.view.dispatch(editor.state.tr)
  }, [editor])

  const clearHighlight = useCallback(() => {
    if (!editor) return
    highlightRange.from = 0
    highlightRange.to = 0
    editor.view.dispatch(editor.state.tr)
  }, [editor])

  const [selectionContext, setSelectionContext] = useState<{
    nodeType: string
    headingLevel?: number
    hasPlaceholders: boolean
    isPlaceholderOnly: boolean
    activeMarks: string[]
    charCount: number
    sentenceCount: number
  } | null>(null)

  // Serialize selected ProseMirror content to HTML
  const getSelectedHtml = useCallback(() => {
    if (!editor) return ""
    const { from, to } = editor.state.selection
    const slice = editor.state.doc.slice(from, to)
    const serializer = DOMSerializer.fromSchema(editor.schema)
    const fragment = serializer.serializeFragment(slice.content)
    const div = document.createElement("div")
    div.appendChild(fragment)
    return div.innerHTML
  }, [editor])

  const handleAiRewrite = useCallback(() => {
    if (!editor) return

    const { from, to } = editor.state.selection
    const text = editor.state.doc.textBetween(from, to, " ")

    if (!text.trim()) return

    // Detect node type at selection start
    const $from = editor.state.doc.resolve(from)
    const parentNode = $from.parent
    let nodeType = "paragraph"
    let headingLevel: number | undefined

    if (parentNode.type.name === "heading") {
      nodeType = "heading"
      headingLevel = parentNode.attrs.level
    } else if (parentNode.type.name === "listItem") {
      const grandparent = $from.node($from.depth - 2)
      nodeType = grandparent?.type.name === "orderedList" ? "orderedList" : "bulletList"
    }

    // Detect active inline marks across the selection
    const activeMarks: string[] = []
    const markTypes = ["bold", "italic", "underline"]
    for (const mark of markTypes) {
      let allMarked = true
      editor.state.doc.nodesBetween(from, to, (node) => {
        if (node.isText) {
          if (!node.marks.some((m) => m.type.name === mark)) {
            allMarked = false
          }
        }
      })
      if (allMarked) activeMarks.push(mark)
    }

    // Detect placeholders in selection
    const placeholderRegex = /\[(IMAGE|CTA BUTTON|PRODUCT WIDGET|VIDEO|DISCLAIMER):\s*[^\]]+\]/gi
    const placeholderMatches = text.match(placeholderRegex)
    const hasPlaceholders = !!placeholderMatches
    const isPlaceholderOnly = hasPlaceholders && text.trim() === placeholderMatches![0].trim()

    // Count length metrics
    const charCount = text.trim().length
    const sentenceCount = (text.match(/[.!?]+/g) || []).length || 1

    // Get HTML of the selection
    const html = getSelectedHtml()

    setSelectedText(text)
    setSelectedHtml(html)
    setSelectionContext({ nodeType, headingLevel, hasPlaceholders, isPlaceholderOnly, activeMarks, charCount, sentenceCount })
    rewriteSelectionRange.current = { from, to }

    // Highlight the selected range
    setHighlightRange(from, to)

    // Get position for the popover relative to the scrollable container
    const coords = editor.view.coordsAtPos(from)
    const container = editorContainerRef.current
    if (container) {
      const containerRect = container.getBoundingClientRect()
      setAiPopoverPosition({
        top: coords.top - containerRect.top + container.scrollTop,
        left: coords.left - containerRect.left,
      })
    }

    setRewritePhase('instruction')
  }, [editor, getSelectedHtml])

  // Called when the AI returns a result — insert preview into editor
  const handleRewriteResult = useCallback(
    (rewrittenHtml: string) => {
      if (!editor || !rewriteSelectionRange.current) return

      // Save original editor state for revert
      originalEditorHtml.current = editor.getHTML()

      const { from, to } = rewriteSelectionRange.current

      // Clear highlight, then replace selection with rewritten HTML
      highlightRange.from = 0
      highlightRange.to = 0

      const docSizeBefore = editor.state.doc.content.size
      editor.chain().focus().setTextSelection({ from, to }).deleteRange({ from, to }).insertContent(rewrittenHtml).run()

      // Calculate end of inserted content from doc size change
      const docSizeAfter = editor.state.doc.content.size
      const insertedLength = docSizeAfter - docSizeBefore + (to - from)
      const newTo = from + insertedLength
      setHighlightRange(from, newTo)

      // Position the action bar below the end of inserted content
      const safeNewTo = Math.min(newTo, editor.state.doc.content.size - 1)
      const endCoords = editor.view.coordsAtPos(safeNewTo)
      const container = editorContainerRef.current
      if (container) {
        const containerRect = container.getBoundingClientRect()
        setAiPopoverPosition({
          top: endCoords.bottom - containerRect.top + container.scrollTop,
          left: endCoords.left - containerRect.left,
        })
      }

      setRewritePhase('preview')
    },
    [editor, setHighlightRange]
  )

  // Accept the preview — just dismiss, content is already in the editor
  const handlePreviewAccept = useCallback(() => {
    clearHighlight()
    originalEditorHtml.current = null
    rewriteSelectionRange.current = null
    setRewritePhase(null)
    setSelectedText("")
    setSelectedHtml("")
  }, [clearHighlight])

  // Try again — revert to original, go back to instruction phase
  const handlePreviewTryAgain = useCallback(() => {
    if (!editor || !originalEditorHtml.current) return

    clearHighlight()
    editor.commands.setContent(originalEditorHtml.current)
    originalEditorHtml.current = null

    // Re-highlight the original selection range
    if (rewriteSelectionRange.current) {
      setHighlightRange(rewriteSelectionRange.current.from, rewriteSelectionRange.current.to)
    }

    setRewritePhase('instruction')
  }, [editor, clearHighlight, setHighlightRange])

  // Cancel — revert to original, dismiss everything
  const handleRewriteCancel = useCallback(() => {
    clearHighlight()
    if (editor && originalEditorHtml.current) {
      editor.commands.setContent(originalEditorHtml.current)
    }
    originalEditorHtml.current = null
    rewriteSelectionRange.current = null
    setRewritePhase(null)
    setSelectedText("")
    setSelectedHtml("")
  }, [editor, clearHighlight])

  // Build campaign context for AI rewrite
  const campaignContext = {
    topic: stepOneData?.topic || lazyModeData?.instructions || "",
    niche: stepOneData?.niche || lazyModeData?.niche || "",
    language: stepOneData?.language || lazyModeData?.language || "",
    guidelines: stepOneData?.guidelines || lazyModeData?.guidelines || "",
    customGuidelines: stepOneData?.customGuidelines || lazyModeData?.customGuidelines || "",
    paragraphLength: stepOneData?.paragraphLength || lazyModeData?.paragraphLength || "",
    campaignType: stepOneData?.campaignType || lazyModeData?.campaignType || "",
    country: stepOneData?.country || lazyModeData?.country || "",
  }

  return (
    <div className="flex flex-col h-full">
      <EditorToolbar
        editor={editor}
        documentUrl={documentUrl}
        documentName={documentName}
        isSaving={isSaving}
        campaignId={campaignId}
        onSave={handleSave}
        onStartOver={onStartOver}
      />

      {/* Formatting toolbar */}
      <div className="flex items-center gap-1 border-b border-border bg-card/50 px-6 py-2">
        <FormatButton
          onClick={() => editor?.chain().focus().toggleBold().run()}
          active={editor?.isActive("bold") ?? false}
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </FormatButton>
        <FormatButton
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          active={editor?.isActive("italic") ?? false}
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </FormatButton>
        <FormatButton
          onClick={() => editor?.chain().focus().toggleUnderline().run()}
          active={editor?.isActive("underline") ?? false}
          title="Underline"
        >
          <UnderlineIcon className="h-4 w-4" />
        </FormatButton>

        <div className="mx-1 h-4 w-px bg-border" />

        <FormatButton
          onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
          active={editor?.isActive("heading", { level: 1 }) ?? false}
          title="Heading 1"
        >
          <Heading1 className="h-4 w-4" />
        </FormatButton>
        <FormatButton
          onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor?.isActive("heading", { level: 2 }) ?? false}
          title="Heading 2"
        >
          <Heading2 className="h-4 w-4" />
        </FormatButton>
        <FormatButton
          onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor?.isActive("heading", { level: 3 }) ?? false}
          title="Heading 3"
        >
          <Heading3 className="h-4 w-4" />
        </FormatButton>

        <div className="mx-1 h-4 w-px bg-border" />

        <FormatButton
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
          active={editor?.isActive("bulletList") ?? false}
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </FormatButton>
        <FormatButton
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          active={editor?.isActive("orderedList") ?? false}
          title="Numbered List"
        >
          <ListOrdered className="h-4 w-4" />
        </FormatButton>

        <div className="mx-1 h-4 w-px bg-border" />

        <FormatButton
          onClick={() => editor?.chain().focus().undo().run()}
          active={false}
          title="Undo"
        >
          <Undo className="h-4 w-4" />
        </FormatButton>
        <FormatButton
          onClick={() => editor?.chain().focus().redo().run()}
          active={false}
          title="Redo"
        >
          <Redo className="h-4 w-4" />
        </FormatButton>

        <div className="mx-1 h-4 w-px bg-border" />

        <Button
          variant="outline"
          size="sm"
          className="bg-[#4644B6] text-white border-[#4644B6] hover:bg-[#3a38a0] hover:text-white"
          onClick={handleAiRewrite}
          title="AI Rewrite — select text first"
        >
          <Sparkles className="mr-2 h-4 w-4" />
          AI Rewrite
        </Button>
      </div>

      {/* Editor content */}
      <div className="flex-1 overflow-y-auto bg-[#F6F6F6]" ref={editorContainerRef}>
        <div className="relative mx-auto max-w-[816px] my-8 bg-white rounded-sm shadow-[0_1px_3px_rgba(0,0,0,0.12),0_1px_2px_rgba(0,0,0,0.06)] min-h-[1056px]">
          <EditorContent editor={editor} />

          {rewritePhase === 'instruction' && (
            <AiRewritePopover
              selectedText={selectedText}
              selectedHtml={selectedHtml}
              fullArticleHtml={editor?.getHTML() || ""}
              campaignContext={campaignContext}
              campaignId={campaignId}
              selectionContext={selectionContext}
              position={aiPopoverPosition}
              onRewriteResult={handleRewriteResult}
              onCancel={handleRewriteCancel}
            />
          )}

          {rewritePhase === 'preview' && (
            <AiRewriteActionBar
              position={aiPopoverPosition}
              onAccept={handlePreviewAccept}
              onTryAgain={handlePreviewTryAgain}
              onCancel={handleRewriteCancel}
            />
          )}
        </div>
      </div>

      {/* Google Doc created modal */}
      {showDocModal && documentUrl && (
        <>
          <div className="fixed inset-0 bg-black/30 z-50" onClick={() => setShowDocModal(false)} />
          <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-sm">
            <div className="bg-white rounded-lg shadow-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0dadb7]">
                    <CheckCircle2 className="h-4 w-4 text-white" />
                  </div>
                  <h3 className="font-semibold text-foreground">Google Doc created</h3>
                </div>
                <button
                  onClick={() => setShowDocModal(false)}
                  className="p-1 rounded-md hover:bg-muted text-muted-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                {documentName || "Your advertorial"} has been exported to Google Docs.
              </p>
              <div className="flex gap-2">
                <Button
                  className="flex-1 bg-[#4644B6] hover:bg-[#3a38a0]"
                  asChild
                >
                  <a href={documentUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Open Google Doc
                  </a>
                </Button>
                <Button
                  variant="outline"
                  className="bg-transparent"
                  onClick={() => setShowDocModal(false)}
                >
                  Continue editing
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function FormatButton({
  onClick,
  active,
  title,
  children,
}: {
  onClick: () => void
  active: boolean
  title: string
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={cn(
        "rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors",
        active && "bg-muted text-foreground"
      )}
    >
      {children}
    </button>
  )
}
