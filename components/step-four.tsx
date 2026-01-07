"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Plus,
  X,
  GripVertical,
  FileText,
  Quote,
  List,
  Lightbulb,
  ShieldCheck,
  Star,
  Percent,
  HelpCircle,
  ImageIcon,
  MessageSquare,
  Target,
  Clock,
  DollarSign,
  Layers,
  Globe,
  Loader2,
} from "lucide-react"
import {
  DndContext,
  DragOverlay,
  useDraggable,
  useDroppable,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from "@dnd-kit/core"
import { SortableContext, useSortable, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { CampaignData, StepFourState, AddedBlock as AddedBlockType } from "@/lib/types"

type BlockType = {
  id: string
  name: string
  icon: React.ReactNode
  category: string
  hasInput?: boolean
  inputLabel?: string
  inputType?: 'text' | 'number'
  hasSelect?: boolean
  selectOptions?: string[]
  selectLabel?: string
  required?: boolean
}

const buildingBlocks: BlockType[] = [
  // Opening
  {
    id: "lede-journalistic",
    name: "Lede (Journalistic)",
    icon: <FileText className="h-4 w-4" />,
    category: "Opening",
    required: true,
  },
  {
    id: "lede-story",
    name: "Lede (Story, First Person)",
    icon: <FileText className="h-4 w-4" />,
    category: "Opening",
    required: true,
  },
  {
    id: "lede-product",
    name: "Lede (Product-Focused)",
    icon: <FileText className="h-4 w-4" />,
    category: "Opening",
    required: true,
  },
  { id: "teaser", name: "Teaser", icon: <Lightbulb className="h-4 w-4" />, category: "Opening" },
  { id: "subheadline", name: "Subheadline", icon: <FileText className="h-4 w-4" />, category: "Opening" },
  // Authority & Credibility
  {
    id: "authority",
    name: "Authority",
    icon: <ShieldCheck className="h-4 w-4" />,
    category: "Authority & Credibility",
    hasInput: true,
    inputLabel: "Authority Name / Role",
  },
  {
    id: "expert-testimonial",
    name: "Expert Testimonial (Quote)",
    icon: <Quote className="h-4 w-4" />,
    category: "Authority & Credibility",
    hasSelect: true,
    selectLabel: "Quote From",
    selectOptions: ["User", "Founder", "Expert"],
  },
  {
    id: "trust-elements",
    name: "Trust Elements",
    icon: <ShieldCheck className="h-4 w-4" />,
    category: "Authority & Credibility",
  },
  {
    id: "social-proof",
    name: "Social Proof (Reviews)",
    icon: <Star className="h-4 w-4" />,
    category: "Authority & Credibility",
  },
  // Problem & Solution
  {
    id: "x-reasons",
    name: "(X) Reasons For…",
    icon: <List className="h-4 w-4" />,
    category: "Problem & Solution",
    hasInput: true,
    inputLabel: "Number of Reasons (X)",
    inputType: "number",
  },
  {
    id: "problem-awareness",
    name: "Problem Awareness Paragraph",
    icon: <Target className="h-4 w-4" />,
    category: "Problem & Solution",
  },
  {
    id: "listicle-intro",
    name: "Listicle Intro",
    icon: <List className="h-4 w-4" />,
    category: "Problem & Solution",
  },
  {
    id: "listicle-comparison",
    name: "Listicle (Product Comparison)",
    icon: <List className="h-4 w-4" />,
    category: "Problem & Solution",
    hasInput: true,
    inputLabel: "Number of Competitors",
    inputType: "number",
  },
  {
    id: "solution",
    name: "Solution (Product Introduction)",
    icon: <Lightbulb className="h-4 w-4" />,
    category: "Problem & Solution",
  },
  {
    id: "unique-mechanism",
    name: "Unique Mechanism",
    icon: <Layers className="h-4 w-4" />,
    category: "Problem & Solution",
  },
  { id: "killing-concerns", name: "Killing Concerns", icon: <X className="h-4 w-4" />, category: "Problem & Solution" },
  // Benefits & Features
  {
    id: "bullet-benefits",
    name: "Bullet Points (Benefits)",
    icon: <List className="h-4 w-4" />,
    category: "Benefits & Features",
  },
  {
    id: "bullet-problems",
    name: "Bullet Points (Current Problems)",
    icon: <List className="h-4 w-4" />,
    category: "Benefits & Features",
  },
  {
    id: "future-me",
    name: "Future Me (Psychological Benefits)",
    icon: <Star className="h-4 w-4" />,
    category: "Benefits & Features",
  },
  // Urgency & CTA
  { id: "call-to-urgency", name: "Call to Urgency", icon: <Clock className="h-4 w-4" />, category: "Urgency & CTA" },
  { id: "scarcity", name: "Scarcity", icon: <Clock className="h-4 w-4" />, category: "Urgency & CTA" },
  {
    id: "discount",
    name: "Discount",
    icon: <Percent className="h-4 w-4" />,
    category: "Urgency & CTA",
    hasInput: true,
    inputLabel: "Discount Value",
  },
  {
    id: "price-explainer",
    name: "Price Explainer",
    icon: <DollarSign className="h-4 w-4" />,
    category: "Urgency & CTA",
  },
  { id: "next-steps", name: "Next Steps Explainer", icon: <FileText className="h-4 w-4" />, category: "Urgency & CTA" },
  { id: "cta", name: "CTA", icon: <MessageSquare className="h-4 w-4" />, category: "Urgency & CTA" },
  // Other
  { id: "faq", name: "FAQ", icon: <HelpCircle className="h-4 w-4" />, category: "Other" },
  {
    id: "placeholder-image",
    name: "Placeholder for Image / GIF / Chart",
    icon: <ImageIcon className="h-4 w-4" />,
    category: "Other",
    hasInput: true,
    inputLabel: "Notes",
  },
]

type AddedBlock = {
  uid: string
  block: BlockType
  inputValue?: string
  selectValue?: string
}

const categories = [
  "Opening",
  "Authority & Credibility",
  "Problem & Solution",
  "Benefits & Features",
  "Urgency & CTA",
  "Other",
]

function DraggablePaletteBlock({ block, onAdd }: { block: BlockType; onAdd: () => void }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${block.id}`,
    data: { type: "palette", block },
  })

  return (
    <Button
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      variant="outline"
      size="sm"
      className={`h-auto py-1.5 px-2 text-xs bg-white border-[#0dadb7]/30 hover:bg-[#0dadb7]/10 hover:border-[#0dadb7] cursor-grab active:cursor-grabbing ${
        isDragging ? "opacity-50" : ""
      }`}
      onClick={onAdd}
    >
      <Plus className="mr-1 h-3 w-3 text-[#0dadb7]" />
      {block.name}
      {block.required && <span className="ml-1 text-destructive">*</span>}
    </Button>
  )
}

function SortableStructureBlock({
  item,
  index,
  onRemove,
  onUpdateInput,
  onUpdateSelect,
}: {
  item: AddedBlock
  index: number
  onRemove: () => void
  onUpdateInput: (value: string) => void
  onUpdateSelect: (value: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.uid,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const hasExtraContent = item.block.hasInput || item.block.hasSelect

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`border-border transition-all ${isDragging ? "opacity-50 z-50 shadow-lg" : ""}`}
    >
      <CardContent className={`p-3 ${!hasExtraContent ? "min-h-[56px]" : ""}`}>
        <div className={`flex items-start gap-3 ${!hasExtraContent ? "items-center h-full" : ""}`}>
          <div className="flex items-center gap-1 shrink-0">
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded"
            >
              <GripVertical className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex h-6 w-6 items-center justify-center rounded bg-[#0dadb7] text-xs font-medium text-white">
              {index + 1}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              {item.block.icon}
              <span className="text-sm font-medium truncate">{item.block.name}</span>
            </div>

            {item.block.hasInput && (
              <div className="mt-2">
                <Input
                  type={item.block.inputType || "text"}
                  placeholder={item.block.inputLabel}
                  value={item.inputValue || ""}
                  onChange={(e) => onUpdateInput(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
            )}

            {item.block.hasSelect && (
              <div className="mt-2">
                <Select value={item.selectValue || item.block.selectOptions?.[0]} onValueChange={onUpdateSelect}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder={item.block.selectLabel} />
                  </SelectTrigger>
                  <SelectContent>
                    {item.block.selectOptions?.map((option) => (
                      <SelectItem key={option} value={option} className="text-xs">
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0"
            onClick={onRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function DropZone({ id, isOver }: { id: string; isOver: boolean }) {
  const { setNodeRef } = useDroppable({ id })

  return (
    <div
      ref={setNodeRef}
      className={`transition-all duration-200 rounded-md my-2 ${
        isOver ? "h-12 bg-[#0dadb7]/20 border-2 border-dashed border-[#0dadb7] flex items-center justify-center" : "h-2"
      }`}
    >
      {isOver && <span className="text-xs font-medium text-[#0dadb7]">Drop here</span>}
    </div>
  )
}

function DroppableStructureArea({
  children,
  isEmpty,
  isOver,
}: {
  children: React.ReactNode
  isEmpty: boolean
  isOver: boolean
}) {
  const { setNodeRef } = useDroppable({
    id: "structure-drop-area",
  })

  return (
    <div
      ref={setNodeRef}
      className={`min-h-[200px] max-h-[600px] overflow-y-auto pr-2 rounded-lg transition-colors ${
        isEmpty && isOver ? "bg-[#0dadb7]/10" : ""
      } ${isEmpty ? "flex items-center justify-center" : ""}`}
    >
      {children}
    </div>
  )
}

interface StepFourProps {
  onBack: () => void
  onNext: () => void
  campaignData: CampaignData
  data: StepFourState
  updateData: (data: StepFourState) => void
}

export function StepFour({ onBack, onNext, campaignData, data: stepData, updateData }: StepFourProps) {
  // Convert from parent state format to local AddedBlock format
  const initializeBlocks = (): AddedBlock[] => {
    if (stepData.initialized && stepData.blocks.length > 0) {
      return stepData.blocks.map(b => {
        const blockDef = buildingBlocks.find(bb => bb.id === b.blockId)
        return {
          uid: b.uid,
          block: blockDef || { 
            id: b.blockId, 
            name: b.name, 
            icon: <FileText className="h-4 w-4" />, 
            category: b.category,
            hasInput: b.hasInput,
            inputLabel: b.inputLabel,
            hasSelect: b.hasSelect,
            selectLabel: b.selectLabel,
            selectOptions: b.selectOptions,
          },
          inputValue: b.inputValue || "",
          selectValue: b.selectValue || "",
        }
      })
    }
    return []
  }

  const [addedBlocks, setAddedBlocksLocal] = useState<AddedBlock[]>(initializeBlocks)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [activePaletteBlock, setActivePaletteBlock] = useState<BlockType | null>(null)
  const [overDropZone, setOverDropZone] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  // Helper to update both local and parent state
  const setAddedBlocks = (newBlocks: AddedBlock[] | ((prev: AddedBlock[]) => AddedBlock[])) => {
    const updated = typeof newBlocks === 'function' ? newBlocks(addedBlocks) : newBlocks
    setAddedBlocksLocal(updated)
    syncToParent(updated)
  }

  // Sync local state to parent
  const syncToParent = (blocks: AddedBlock[]) => {
    updateData({
      blocks: blocks.map(b => ({
        uid: b.uid,
        blockId: b.block.id,
        name: b.block.name,
        category: b.block.category,
        inputValue: b.inputValue,
        selectValue: b.selectValue,
        hasInput: b.block.hasInput,
        inputLabel: b.block.inputLabel,
        hasSelect: b.block.hasSelect,
        selectLabel: b.block.selectLabel,
        selectOptions: b.block.selectOptions,
      })),
      initialized: true,
    })
  }

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
  )

  const addBlock = (block: BlockType) => {
    const newBlock: AddedBlock = {
      uid: Date.now().toString(),
      block,
      inputValue: "",
      selectValue: block.selectOptions?.[0] || "",
    }
    setAddedBlocks([...addedBlocks, newBlock])
  }

  const removeBlock = (uid: string) => {
    setAddedBlocks(addedBlocks.filter((b) => b.uid !== uid))
  }

  const updateBlockInput = (uid: string, value: string) => {
    setAddedBlocks(addedBlocks.map((b) => (b.uid === uid ? { ...b, inputValue: value } : b)))
  }

  const updateBlockSelect = (uid: string, value: string) => {
    setAddedBlocks(addedBlocks.map((b) => (b.uid === uid ? { ...b, selectValue: value } : b)))
  }

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    setActiveId(active.id as string)

    if (active.data.current?.type === "palette") {
      setActivePaletteBlock(active.data.current.block)
    } else {
      setActivePaletteBlock(null)
    }
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event
    if (over && String(over.id).startsWith("drop-zone-")) {
      setOverDropZone(over.id as string)
    } else {
      setOverDropZone(null)
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    setActiveId(null)
    setActivePaletteBlock(null)
    setOverDropZone(null)

    if (!over) return

    if (active.data.current?.type === "palette") {
      const block = active.data.current.block as BlockType
      const newBlock: AddedBlock = {
        uid: Date.now().toString(),
        block,
        inputValue: "",
        selectValue: block.selectOptions?.[0] || "",
      }

      const overId = String(over.id)

      if (overId.startsWith("drop-zone-")) {
        const insertIndex = Number.parseInt(overId.replace("drop-zone-", ""), 10)
        const newBlocks = [...addedBlocks]
        newBlocks.splice(insertIndex, 0, newBlock)
        setAddedBlocks(newBlocks)
      } else if (overId === "structure-drop-area") {
        setAddedBlocks([...addedBlocks, newBlock])
      } else {
        setAddedBlocks([...addedBlocks, newBlock])
      }
    } else {
      const oldIndex = addedBlocks.findIndex((b) => b.uid === active.id)
      const newIndex = addedBlocks.findIndex((b) => b.uid === over.id)

      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        setAddedBlocks(arrayMove(addedBlocks, oldIndex, newIndex))
      }
    }
  }

  const isOverMainArea = overDropZone === null && activeId !== null && activePaletteBlock !== null

  const handleNext = async () => {
    setIsSaving(true)
    try {
      if (campaignData.id) {
        await fetch("/api/save-progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            campaignId: campaignData.id,
            structureBlocks: addedBlocks.map(b => ({
              blockId: b.block.id,
              name: b.block.name,
              inputValue: b.inputValue,
              selectValue: b.selectValue,
            })),
          }),
        })
      }
      onNext()
    } catch (error) {
      console.error("Failed to save progress:", error)
      // Proceed anyway to not block the user
      onNext()
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
      <div className="space-y-6">
        {/* Campaign summary */}
        <div className="rounded-lg border border-border bg-muted/50 px-5 py-4">
          <div className="flex items-center gap-2 mb-2">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Campaign Summary</span>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground leading-relaxed">
              <span className="text-foreground font-medium">Topic:</span> Why UK residents are switching to private
              dental insurance plans amid rising NHS waiting times and limited coverage options
            </p>
            <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground">
              <span>
                <span className="text-foreground font-medium">Niche:</span> Finance/Insurance
              </span>
              <span>
                <span className="text-foreground font-medium">Market:</span> United Kingdom
              </span>
              <span>
                <span className="text-foreground font-medium">Length:</span> 1500 words
              </span>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
          {/* Left Panel: Block Palette */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Available Blocks</h3>
            <p className="text-xs text-muted-foreground">Drag blocks to the structure or click + to add</p>
            <div className="rounded-lg bg-[#0dadb7] p-4 space-y-3 max-h-[600px] overflow-y-auto">
              {categories.map((category) => (
                <div key={category} className="rounded-md bg-white/95 p-3">
                  <p className="text-xs font-medium text-[#0dadb7] mb-2">{category}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {buildingBlocks
                      .filter((b) => b.category === category)
                      .map((block) => (
                        <DraggablePaletteBlock key={block.id} block={block} onAdd={() => addBlock(block)} />
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Panel: Structure Builder */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground">Advertorial Structure</h3>
              <Badge variant="secondary">{addedBlocks.length} blocks</Badge>
            </div>

            <div className="rounded-lg bg-[#F6F6F6] border border-border p-4">
              <DroppableStructureArea isEmpty={addedBlocks.length === 0} isOver={isOverMainArea}>
                {addedBlocks.length === 0 ? (
                  <Card
                    className={`border-dashed border-2 w-full transition-colors bg-white ${isOverMainArea ? "border-[#0dadb7] bg-[#0dadb7]/10" : ""}`}
                  >
                    <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                      <Layers className="h-12 w-12 text-muted-foreground/40 mb-4" />
                      <p className="text-sm font-medium text-muted-foreground">
                        {isOverMainArea ? "Drop here to add" : "No blocks added yet"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1 max-w-[250px]">
                        {isOverMainArea
                          ? ""
                          : "Drag blocks from the left panel or click + to start building your advertorial structure"}
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <SortableContext items={addedBlocks.map((b) => b.uid)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-3">
                      {activePaletteBlock && <DropZone id="drop-zone-0" isOver={overDropZone === "drop-zone-0"} />}

                      {addedBlocks.map((item, index) => (
                        <div key={item.uid}>
                          <SortableStructureBlock
                            item={item}
                            index={index}
                            onRemove={() => removeBlock(item.uid)}
                            onUpdateInput={(value) => updateBlockInput(item.uid, value)}
                            onUpdateSelect={(value) => updateBlockSelect(item.uid, value)}
                          />
                          {activePaletteBlock && (
                            <DropZone
                              id={`drop-zone-${index + 1}`}
                              isOver={overDropZone === `drop-zone-${index + 1}`}
                            />
                          )}
                        </div>
                      ))}

                      {activePaletteBlock && !overDropZone && (
                        <div className="h-12 bg-[#0dadb7]/10 border-2 border-dashed border-[#0dadb7]/40 rounded-md flex items-center justify-center">
                          <span className="text-xs font-medium text-[#0dadb7]">Drop here</span>
                        </div>
                      )}
                    </div>
                  </SortableContext>
                )}
              </DroppableStructureArea>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button size="lg" disabled={addedBlocks.length === 0 || isSaving} onClick={handleNext}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Review & Generate"
            )}
          </Button>
        </div>
      </div>

      <DragOverlay>
        {activeId && activePaletteBlock ? (
          <Button
            variant="outline"
            size="sm"
            className="h-auto py-1.5 px-2 text-xs bg-white border-[#0dadb7] shadow-lg cursor-grabbing"
          >
            <Plus className="mr-1 h-3 w-3 text-[#0dadb7]" />
            {activePaletteBlock.name}
          </Button>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
