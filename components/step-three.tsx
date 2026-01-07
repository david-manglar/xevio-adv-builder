"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Sparkles,
  DollarSign,
  Target,
  MessageSquare,
  Zap,
  CheckCircle2,
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  Loader2,
} from "lucide-react"
import { CampaignData, StepThreeState, EditableItem, CategoryKey } from "@/lib/types"

interface StepThreeProps {
  onBack: () => void
  onNext: () => void
  campaignData: CampaignData
  data: StepThreeState
  updateData: (data: StepThreeState) => void
}

// Fallback initial data (can be empty or keep the demo data as fallback)
const defaultScrapedData: Record<CategoryKey, EditableItem[]> = {
  usps: [],
  pricing: [],
  mainAngle: [],
  toneOfVoice: [],
  keyHooks: [],
}

interface CategoryConfig {
  key: CategoryKey
  title: string
  description: string
  icon: React.ReactNode
  multiline: boolean
}

const categories: CategoryConfig[] = [
  {
    key: "usps",
    title: "USPs",
    description: "Key selling points",
    icon: <Sparkles className="h-4 w-4" />,
    multiline: false,
  },
  {
    key: "pricing",
    title: "Pricing",
    description: "Pricing information",
    icon: <DollarSign className="h-4 w-4" />,
    multiline: false,
  },
  {
    key: "mainAngle",
    title: "Main Angle",
    description: "Primary messaging angle",
    icon: <Target className="h-4 w-4" />,
    multiline: true,
  },
  {
    key: "toneOfVoice",
    title: "Tone of Voice",
    description: "Writing style",
    icon: <MessageSquare className="h-4 w-4" />,
    multiline: true,
  },
  {
    key: "keyHooks",
    title: "Key Hooks",
    description: "Attention-grabbing headlines",
    icon: <Zap className="h-4 w-4" />,
    multiline: false,
  },
]

export function StepThree({ onBack, onNext, campaignData, data: stepData, updateData }: StepThreeProps) {
  // Use local state that syncs with parent
  const [localData, setLocalData] = useState<Record<CategoryKey, EditableItem[]>>(stepData.data)
  
  // Initialize from scrapingResult only if not already initialized
  useEffect(() => {
    if (!stepData.initialized && campaignData?.scrapingResult) {
      const result = campaignData.scrapingResult
      const newData: Record<CategoryKey, EditableItem[]> = { ...defaultScrapedData }

      // Iterate through our known categories and populate from the scraping result
      categories.forEach(cat => {
        if (Array.isArray(result[cat.key])) {
          newData[cat.key] = result[cat.key].map((text: string, index: number) => ({
            id: `${cat.key}-${index}`,
            text: text,
            selected: false,
            isCustom: false
          }))
        }
      })
      // Use setData to update both local and parent state
      setData(newData)
    } else if (stepData.initialized) {
      // Sync local state with parent state if it changes externally
      // Note: We use JSON.stringify to avoid deep equality check issues, 
      // but simple reference check might be enough if parent state is immutable.
      // However, since we want to avoid infinite loops, we only set if different.
      // For now, we trust the parent state passed in props is the source of truth on mount.
      if (localData !== stepData.data) {
        setLocalData(stepData.data)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaignData, stepData.initialized])

  // Helper to update both local and parent state
  const setData = (newData: Record<CategoryKey, EditableItem[]> | ((prev: Record<CategoryKey, EditableItem[]>) => Record<CategoryKey, EditableItem[]>)) => {
    const updated = typeof newData === 'function' ? newData(localData) : newData
    setLocalData(updated)
    updateData({ data: updated, initialized: true })
  }

  // Use localData for rendering
  const data = localData

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState("")
  const [addingTo, setAddingTo] = useState<CategoryKey | null>(null)
  const [newItemText, setNewItemText] = useState("")
  const [expandedCategories, setExpandedCategories] = useState<CategoryKey[]>([
    "usps",
    "pricing",
    "mainAngle",
    "toneOfVoice",
    "keyHooks"
  ])

  const [isSaving, setIsSaving] = useState(false)

  const handleNext = async () => {
    setIsSaving(true)
    try {
      if (campaignData.id) {
        await fetch("/api/save-progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            campaignId: campaignData.id,
            selectedInsights: data,
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

  const toggleCategory = (key: CategoryKey) => {
    setExpandedCategories((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]))
  }

  const toggleItemSelection = (category: CategoryKey, itemId: string) => {
    setData((prev) => ({
      ...prev,
      [category]: prev[category].map((item) => (item.id === itemId ? { ...item, selected: !item.selected } : item)),
    }))
  }

  const startEditing = (item: EditableItem) => {
    setEditingId(item.id)
    setEditText(item.text)
  }

  const saveEdit = (category: CategoryKey) => {
    if (!editingId || !editText.trim()) return
    setData((prev) => ({
      ...prev,
      [category]: prev[category].map((item) => (item.id === editingId ? { ...item, text: editText.trim() } : item)),
    }))
    setEditingId(null)
    setEditText("")
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditText("")
  }

  const deleteItem = (category: CategoryKey, itemId: string) => {
    setData((prev) => ({
      ...prev,
      [category]: prev[category].filter((item) => item.id !== itemId),
    }))
  }

  const startAdding = (category: CategoryKey) => {
    setAddingTo(category)
    setNewItemText("")
  }

  const saveNewItem = (category: CategoryKey) => {
    if (!newItemText.trim()) return
    const newItem: EditableItem = {
      id: `${category}-custom-${Date.now()}`,
      text: newItemText.trim(),
      selected: true,
      isCustom: true,
    }
    setData((prev) => ({
      ...prev,
      [category]: [...prev[category], newItem],
    }))
    setAddingTo(null)
    setNewItemText("")
  }

  const cancelAdding = () => {
    setAddingTo(null)
    setNewItemText("")
  }

  const getTotalSelected = () => {
    return Object.values(data)
      .flat()
      .filter((item) => item.selected).length
  }

  const getCategoryCount = (category: CategoryKey) => {
    const items = data[category]
    const selected = items.filter((item) => item.selected).length
    return { selected, total: items.length }
  }

  return (
    <div className="space-y-4">
      {/* Success Banner */}
      <div className="flex items-center gap-3 rounded-lg border border-success/30 bg-success/10 p-4">
        <CheckCircle2 className="h-5 w-5 text-success shrink-0" />
        <div>
          <p className="font-medium text-foreground">Reference pages scraped successfully</p>
          <p className="text-sm text-muted-foreground">Select, edit, or add your own insights for the brief</p>
        </div>
      </div>

      {/* Categories */}
      {categories.map((category) => {
        const { selected, total } = getCategoryCount(category.key)
        const isExpanded = expandedCategories.includes(category.key)
        const items = data[category.key]

        return (
          <Card key={category.key} className="overflow-hidden">
            {/* Category Header - Clickable to expand/collapse */}
            <CardHeader
              className="pb-3 cursor-pointer hover:bg-muted/30 transition-colors"
              onClick={() => toggleCategory(category.key)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#0dadb7]/10 text-[#0dadb7]">
                    {category.icon}
                  </div>
                  <div>
                    <CardTitle className="text-base">{category.title}</CardTitle>
                    <p className="text-xs text-muted-foreground">{category.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="bg-brand-gray">
                    {selected}/{total} selected
                  </Badge>
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </div>
            </CardHeader>

            {/* Category Content */}
            {isExpanded && (
              <CardContent className="pt-0 space-y-2">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className={`group relative rounded-lg border p-3 transition-all ${
                      item.selected
                        ? "border-[#0dadb7]/40 bg-[#0dadb7]/5"
                        : "border-border bg-background hover:border-border/80"
                    }`}
                  >
                    {editingId === item.id ? (
                      // Edit Mode
                      <div className="space-y-2">
                        {category.multiline ? (
                          <Textarea
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            className="min-h-[80px] text-sm"
                            autoFocus
                          />
                        ) : (
                          <Input
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            className="text-sm"
                            autoFocus
                          />
                        )}
                        <div className="flex gap-2 justify-end">
                          <Button size="sm" variant="ghost" onClick={cancelEdit}>
                            <X className="h-3 w-3 mr-1" />
                            Cancel
                          </Button>
                          <Button size="sm" onClick={() => saveEdit(category.key)}>
                            <Check className="h-3 w-3 mr-1" />
                            Save
                          </Button>
                        </div>
                      </div>
                    ) : (
                      // Display Mode
                      <div className="flex items-start gap-3">
                        {/* Selection Toggle */}
                        <button
                          onClick={() => toggleItemSelection(category.key, item.id)}
                          className={`mt-0.5 shrink-0 h-5 w-5 rounded border-2 flex items-center justify-center transition-colors ${
                            item.selected
                              ? "bg-[#0dadb7] border-[#0dadb7] text-white"
                              : "border-muted-foreground/30 hover:border-[#0dadb7]"
                          }`}
                        >
                          {item.selected && <Check className="h-3 w-3" />}
                        </button>

                        {/* Text Content */}
                        <p
                          className={`flex-1 text-sm leading-relaxed ${
                            item.selected ? "text-foreground" : "text-muted-foreground"
                          }`}
                        >
                          {item.text}
                          {item.isCustom && (
                            <Badge variant="outline" className="ml-2 text-xs py-0 px-1.5">
                              Custom
                            </Badge>
                          )}
                        </p>

                        {/* Action Buttons */}
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => startEditing(item)}>
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-destructive hover:text-destructive"
                            onClick={() => deleteItem(category.key, item.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {/* Add New Item */}
                {addingTo === category.key ? (
                  <div className="rounded-lg border border-dashed border-[#0dadb7] p-3 space-y-2 bg-[#0dadb7]/5">
                    {category.multiline ? (
                      <Textarea
                        value={newItemText}
                        onChange={(e) => setNewItemText(e.target.value)}
                        placeholder={`Add your own ${category.title.toLowerCase()}...`}
                        className="min-h-[80px] text-sm"
                        autoFocus
                      />
                    ) : (
                      <Input
                        value={newItemText}
                        onChange={(e) => setNewItemText(e.target.value)}
                        placeholder={`Add your own ${category.title.toLowerCase()}...`}
                        className="text-sm"
                        autoFocus
                      />
                    )}
                    <div className="flex gap-2 justify-end">
                      <Button size="sm" variant="ghost" onClick={cancelAdding}>
                        Cancel
                      </Button>
                      <Button size="sm" onClick={() => saveNewItem(category.key)}>
                        <Plus className="h-3 w-3 mr-1" />
                        Add
                      </Button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => startAdding(category.key)}
                    className="w-full rounded-lg border border-dashed border-muted-foreground/30 p-3 text-sm text-muted-foreground hover:border-[#0dadb7] hover:text-[#0dadb7] hover:bg-[#0dadb7]/5 transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add your own
                  </button>
                )}
              </CardContent>
            )}
          </Card>
        )
      })}

      {/* Summary & Navigation */}
      <Card className="border-foreground/20 bg-muted/30">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">{getTotalSelected()} items selected for your brief</p>
              <p className="text-sm text-muted-foreground">These insights will be used to generate your advertorial</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button size="lg" onClick={handleNext} disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Continue to Building Blocks"
          )}
        </Button>
      </div>
    </div>
  )
}
