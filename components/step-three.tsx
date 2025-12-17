"use client"

import type React from "react"

import { useState } from "react"
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
} from "lucide-react"

interface StepThreeProps {
  onBack: () => void
  onNext: () => void
}

interface EditableItem {
  id: string
  text: string
  selected: boolean
  isCustom: boolean
}

const initialScrapedData = {
  usps: [
    {
      id: "usp-1",
      text: "Plans from just £7.50 per month – budget-friendly dental protection",
      selected: true,
      isCustom: false,
    },
    {
      id: "usp-2",
      text: "Covers NHS charges, private treatment, and dental emergencies",
      selected: true,
      isCustom: false,
    },
    { id: "usp-3", text: "No health questionnaires or medical checks required", selected: false, isCustom: false },
    { id: "usp-4", text: "Immediate cover for accidents – no waiting period", selected: true, isCustom: false },
    { id: "usp-5", text: "Access to 24/7 dental advice helpline", selected: true, isCustom: false },
    { id: "usp-6", text: "Cashback on routine check-ups and hygienist visits", selected: false, isCustom: false },
    { id: "usp-7", text: "Family plans available with multi-person discounts", selected: false, isCustom: false },
  ],
  pricing: [
    { id: "price-1", text: "Budget Plan: £7.50/month – covers NHS charges only", selected: true, isCustom: false },
    {
      id: "price-2",
      text: "Standard Plan: £12.99/month – NHS + private treatments up to £500/year",
      selected: true,
      isCustom: false,
    },
    {
      id: "price-3",
      text: "Premium Plan: £24.99/month – comprehensive cover up to £1,500/year",
      selected: false,
      isCustom: false,
    },
    { id: "price-4", text: "Family add-on: £4.99 per additional family member", selected: false, isCustom: false },
  ],
  mainAngle: [
    {
      id: "angle-1",
      text: "Price-Value with emphasis on peace of mind and avoiding unexpected dental bills",
      selected: true,
      isCustom: false,
    },
  ],
  toneOfVoice: [
    {
      id: "tone-1",
      text: "Friendly, reassuring, and straightforward – avoids jargon, speaks to everyday concerns about dental costs",
      selected: true,
      isCustom: false,
    },
  ],
  keyHooks: [
    { id: "hook-1", text: '"NHS dentists are hard to find – don\'t get caught out"', selected: true, isCustom: false },
    {
      id: "hook-2",
      text: '"One crown can cost over £300 privately – are you covered?"',
      selected: false,
      isCustom: false,
    },
    { id: "hook-3", text: '"Stop dreading the dentist bill"', selected: true, isCustom: false },
    { id: "hook-4", text: '"Protect your smile without breaking the bank"', selected: false, isCustom: false },
  ],
}

type CategoryKey = keyof typeof initialScrapedData

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

export function StepThree({ onBack, onNext }: StepThreeProps) {
  const [data, setData] = useState(initialScrapedData)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState("")
  const [addingTo, setAddingTo] = useState<CategoryKey | null>(null)
  const [newItemText, setNewItemText] = useState("")
  const [expandedCategories, setExpandedCategories] = useState<CategoryKey[]>(["usps", "pricing", "keyHooks"])

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
        <Button size="lg" onClick={onNext}>
          Continue to Building Blocks
        </Button>
      </div>
    </div>
  )
}
