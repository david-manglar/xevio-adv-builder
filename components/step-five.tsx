"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Globe, FileText, Target, Link, CheckCircle2, Layers, Pencil, X, Check, AlertTriangle } from "lucide-react"

interface StepFiveProps {
  onBack: () => void
  onGenerate: () => void
  onJumpToStep: (step: number) => void
}

function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
}: {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
}) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-lg max-w-md w-full mx-4 p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-foreground mb-2">Change Reference Pages?</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Changing the reference pages will trigger the scraping process again. You'll have to choose new insights
              and build the advertorial again. Are you sure about this?
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button className="bg-[#4644B6] hover:bg-[#3a38a0]" onClick={onConfirm}>
            Yes, Change Pages
          </Button>
        </div>
      </div>
    </div>
  )
}

function EditButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="ml-auto p-1.5 rounded-md hover:bg-[#F6F6F6] text-muted-foreground hover:text-[#4644B6] transition-colors"
      title="Edit this section"
    >
      <Pencil className="h-3.5 w-3.5" />
    </button>
  )
}

function EditActions({ onSave, onCancel }: { onSave: () => void; onCancel: () => void }) {
  return (
    <div className="flex gap-1 ml-auto">
      <button
        onClick={onCancel}
        className="p-1.5 rounded-md hover:bg-[#F6F6F6] text-muted-foreground hover:text-destructive transition-colors"
        title="Cancel"
      >
        <X className="h-3.5 w-3.5" />
      </button>
      <button
        onClick={onSave}
        className="p-1.5 rounded-md hover:bg-[#F6F6F6] text-muted-foreground hover:text-[#0dadb7] transition-colors"
        title="Save"
      >
        <Check className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}

export function StepFive({ onBack, onGenerate, onJumpToStep }: StepFiveProps) {
  const [editingCampaign, setEditingCampaign] = useState(false)
  const [editingTopic, setEditingTopic] = useState(false)
  const [showRefWarning, setShowRefWarning] = useState(false)

  const [campaignData, setCampaignData] = useState({
    campaignType: "Lead Generation",
    niche: "Finance/Insurance",
    country: "United Kingdom",
    language: "English",
    length: "1500",
    paragraphLength: "Normal (3-4 lines)",
    guidelines: "None",
  })
  const [tempCampaignData, setTempCampaignData] = useState(campaignData)

  const [topic, setTopic] = useState(
    "How UK residents can save up to 40% on dental care with the right insurance plan, especially as NHS dentists become harder to find.",
  )
  const [tempTopic, setTempTopic] = useState(topic)

  const handleCampaignEdit = () => {
    setTempCampaignData(campaignData)
    setEditingCampaign(true)
  }

  const handleCampaignSave = () => {
    setCampaignData(tempCampaignData)
    setEditingCampaign(false)
  }

  const handleCampaignCancel = () => {
    setTempCampaignData(campaignData)
    setEditingCampaign(false)
  }

  const handleTopicEdit = () => {
    setTempTopic(topic)
    setEditingTopic(true)
  }

  const handleTopicSave = () => {
    setTopic(tempTopic)
    setEditingTopic(false)
  }

  const handleTopicCancel = () => {
    setTempTopic(topic)
    setEditingTopic(false)
  }

  return (
    <div className="space-y-6">
      <ConfirmDialog
        isOpen={showRefWarning}
        onClose={() => setShowRefWarning(false)}
        onConfirm={() => {
          setShowRefWarning(false)
          onJumpToStep(2)
        }}
      />

      <div className="bg-[#4644B6] rounded-lg px-6 py-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Review your request</h2>
          <p className="text-white/80 text-sm">Confirm the details below before generating</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-white/60 text-sm">
          <CheckCircle2 className="h-5 w-5" />
          <span>Almost there</span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4 text-[#0dadb7]" />
              Advertorial Topic
              {editingTopic ? (
                <EditActions onSave={handleTopicSave} onCancel={handleTopicCancel} />
              ) : (
                <EditButton onClick={handleTopicEdit} />
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-6">
            {editingTopic ? (
              <Textarea
                className="min-h-[100px] text-sm resize-y"
                value={tempTopic}
                onChange={(e) => setTempTopic(e.target.value)}
              />
            ) : (
              <p className="text-sm text-muted-foreground leading-relaxed">{topic}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Globe className="h-4 w-4 text-[#0dadb7]" />
              Campaign Setup
              {editingCampaign ? (
                <EditActions onSave={handleCampaignSave} onCancel={handleCampaignCancel} />
              ) : (
                <EditButton onClick={handleCampaignEdit} />
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {editingCampaign ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-24 shrink-0">Campaign Type</span>
                  <Select
                    value={tempCampaignData.campaignType}
                    onValueChange={(v) => setTempCampaignData({ ...tempCampaignData, campaignType: v })}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="text-xs">
                      <SelectItem className="text-xs" value="Lead Generation">
                        Lead Generation
                      </SelectItem>
                      <SelectItem className="text-xs" value="E-commerce">
                        E-commerce
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-24 shrink-0">Niche</span>
                  <Select
                    value={tempCampaignData.niche}
                    onValueChange={(v) => setTempCampaignData({ ...tempCampaignData, niche: v })}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="text-xs">
                      <SelectItem className="text-xs" value="Beauty">
                        Beauty
                      </SelectItem>
                      <SelectItem className="text-xs" value="Education">
                        Education
                      </SelectItem>
                      <SelectItem className="text-xs" value="Fashion/Clothing">
                        Fashion/Clothing
                      </SelectItem>
                      <SelectItem className="text-xs" value="Finance/Insurance">
                        Finance/Insurance
                      </SelectItem>
                      <SelectItem className="text-xs" value="Gaming">
                        Gaming
                      </SelectItem>
                      <SelectItem className="text-xs" value="Health Supplements">
                        Health Supplements
                      </SelectItem>
                      <SelectItem className="text-xs" value="Home Improvement">
                        Home Improvement
                      </SelectItem>
                      <SelectItem className="text-xs" value="Medical">
                        Medical
                      </SelectItem>
                      <SelectItem className="text-xs" value="Tech/Gadgets">
                        Tech/Gadgets
                      </SelectItem>
                      <SelectItem className="text-xs" value="Weight Loss">
                        Weight Loss
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-24 shrink-0">Country</span>
                  <Select
                    value={tempCampaignData.country}
                    onValueChange={(v) => setTempCampaignData({ ...tempCampaignData, country: v })}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="text-xs">
                      <SelectItem className="text-xs" value="United States">
                        United States
                      </SelectItem>
                      <SelectItem className="text-xs" value="United Kingdom">
                        United Kingdom
                      </SelectItem>
                      <SelectItem className="text-xs" value="Canada">
                        Canada
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-24 shrink-0">Language</span>
                  <Select
                    value={tempCampaignData.language}
                    onValueChange={(v) => setTempCampaignData({ ...tempCampaignData, language: v })}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="text-xs">
                      <SelectItem className="text-xs" value="English">
                        English
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-24 shrink-0">Length</span>
                  <Input
                    type="number"
                    className="h-8 max-w-[120px] !text-xs"
                    value={tempCampaignData.length}
                    onChange={(e) => setTempCampaignData({ ...tempCampaignData, length: e.target.value })}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-24 shrink-0">Paragraphs</span>
                  <Select
                    value={tempCampaignData.paragraphLength}
                    onValueChange={(v) => setTempCampaignData({ ...tempCampaignData, paragraphLength: v })}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="text-xs">
                      <SelectItem className="text-xs" value="Very Short (1 sentence)">
                        Very Short (1 sentence)
                      </SelectItem>
                      <SelectItem className="text-xs" value="Short (1-3 lines)">
                        Short (1-3 lines)
                      </SelectItem>
                      <SelectItem className="text-xs" value="Normal (3-4 lines)">
                        Normal (3-4 lines)
                      </SelectItem>
                      <SelectItem className="text-xs" value="Long (4-6 lines)">
                        Long (4-6 lines)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-24 shrink-0">Guidelines</span>
                  <Select
                    value={tempCampaignData.guidelines}
                    onValueChange={(v) => setTempCampaignData({ ...tempCampaignData, guidelines: v })}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="text-xs">
                      <SelectItem className="text-xs" value="None">
                        None
                      </SelectItem>
                      <SelectItem className="text-xs" value="ERGO">
                        ERGO
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-24 shrink-0">Campaign Type</span>
                  <span className="inline-flex items-center rounded-md bg-[#F6F6F6] px-2.5 py-1 text-xs font-medium text-muted-foreground">
                    {campaignData.campaignType}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-24 shrink-0">Niche</span>
                  <span className="inline-flex items-center rounded-md bg-[#F6F6F6] px-2.5 py-1 text-xs font-medium text-muted-foreground">
                    {campaignData.niche}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-24 shrink-0">Country</span>
                  <span className="inline-flex items-center rounded-md bg-[#F6F6F6] px-2.5 py-1 text-xs font-medium text-muted-foreground">
                    {campaignData.country}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-24 shrink-0">Language</span>
                  <span className="inline-flex items-center rounded-md bg-[#F6F6F6] px-2.5 py-1 text-xs font-medium text-muted-foreground">
                    {campaignData.language}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-24 shrink-0">Length</span>
                  <span className="inline-flex items-center rounded-md bg-[#F6F6F6] px-2.5 py-1 text-xs font-medium text-muted-foreground">
                    {campaignData.length} words
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-24 shrink-0">Paragraphs</span>
                  <span className="inline-flex items-center rounded-md bg-[#F6F6F6] px-2.5 py-1 text-xs font-medium text-muted-foreground">
                    {campaignData.paragraphLength}
                  </span>
                </div>
                {campaignData.guidelines !== "None" && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground w-24 shrink-0">Guidelines</span>
                    <span className="inline-flex items-center rounded-md bg-[#F6F6F6] px-2.5 py-1 text-xs font-medium text-muted-foreground">
                      {campaignData.guidelines}
                    </span>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Link className="h-4 w-4 text-[#0dadb7]" />
              Reference Pages
              <EditButton onClick={() => setShowRefWarning(true)} />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 text-[#0dadb7]" />
              <span className="text-muted-foreground truncate">dentalcover.co.uk/plans</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 text-[#0dadb7]" />
              <span className="text-muted-foreground truncate">nhs.uk/dental-costs</span>
            </div>
          </CardContent>
        </Card>

        {/* Selected Insights */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="h-4 w-4 text-[#0dadb7]" />
              Selected Insights
              <EditButton onClick={() => onJumpToStep(3)} />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center rounded-md bg-[#F6F6F6] px-2.5 py-1 text-xs font-medium text-muted-foreground">
                Save up to 40% on treatments
              </span>
              <span className="inline-flex items-center rounded-md bg-[#F6F6F6] px-2.5 py-1 text-xs font-medium text-muted-foreground">
                No waiting periods
              </span>
              <span className="inline-flex items-center rounded-md bg-[#F6F6F6] px-2.5 py-1 text-xs font-medium text-muted-foreground">
                From £8.50/month
              </span>
              <span className="inline-flex items-center rounded-md bg-[#F6F6F6] px-2.5 py-1 text-xs font-medium text-muted-foreground">
                NHS dentists hard to find
              </span>
              <span className="inline-flex items-center rounded-md bg-[#F6F6F6] px-2.5 py-1 text-xs font-medium text-muted-foreground">
                Friendly, reassuring tone
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Structure Preview */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Layers className="h-4 w-4 text-[#0dadb7]" />
            Advertorial Structure
            <span className="inline-flex items-center rounded-md bg-[#F6F6F6] px-2.5 py-1 text-xs font-medium text-muted-foreground">
              8 blocks
            </span>
            <EditButton onClick={() => onJumpToStep(4)} />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2">
            {[
              "Lede (Journalistic)",
              "Problem Awareness",
              "Solution",
              "Trust Elements",
              "Bullet Points (Benefits)",
              "Social Proof",
              "Price Explainer",
              "CTA",
            ].map((block, index) => (
              <div key={block} className="flex items-center gap-3 rounded-md bg-[#F6F6F6] px-3 py-2">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#0dadb7] text-xs font-medium text-white">
                  {index + 1}
                </span>
                <span className="text-sm font-medium text-muted-foreground">{block}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack}>
          Back to Edit
        </Button>
        <Button size="lg" className="bg-[#4644B6] hover:bg-[#3a38a0]" onClick={onGenerate}>
          Generate Advertorial
        </Button>
      </div>
    </div>
  )
}
