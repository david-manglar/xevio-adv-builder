"use client"

import { FileText, Globe, Link, Target, Layers, ExternalLink } from "lucide-react"

interface ReferenceUrl {
  url: string
  description?: string | null
}

interface StructureBlock {
  position: number
  name: string
  inputValue?: string | null
  selectValue?: string | null
}

interface CampaignDetails {
  id: string
  topic: string
  campaignType: string
  niche: string
  country: string
  language: string
  length: string
  paragraphLength: string
  guidelines: string
  referenceUrls: (ReferenceUrl | string)[]
  selectedInsights: Record<string, Array<{ id: string; text: string; isCustom: boolean; selected: boolean }>>
  structureBlocks: StructureBlock[]
  generatedContent: string
  docName: string
}

interface BuilderSettingsDetailsProps {
  campaign: CampaignDetails
}

// Insight item structure from Supabase
interface InsightItem {
  id: string
  text: string
  isCustom: boolean
  selected: boolean
}

// Category display names mapping
const CATEGORY_LABELS: Record<string, string> = {
  usps: 'USPs',
  pricing: 'Pricing',
  keyHooks: 'Key Hooks',
  mainAngle: 'Main Angle',
  toneOfVoice: 'Tone of Voice',
}

// Order for displaying categories
const CATEGORY_ORDER = ['usps', 'pricing', 'keyHooks', 'mainAngle', 'toneOfVoice']

export function BuilderSettingsDetails({ campaign }: BuilderSettingsDetailsProps) {
  // Group selected insights by category
  const insightsByCategory: Record<string, string[]> = {}
  let totalInsights = 0

  for (const category of CATEGORY_ORDER) {
    const items = campaign.selectedInsights?.[category] || []
    const selectedTexts = items
      .filter((item: any) => item && typeof item === 'object' && item.selected === true && item.text)
      .map((item: any) => item.text)
    
    if (selectedTexts.length > 0) {
      insightsByCategory[category] = selectedTexts
      totalInsights += selectedTexts.length
    }
  }

  const hasInsights = totalInsights > 0

  // Get block names from structure (filter out any without names)
  const blockNames = (campaign.structureBlocks || [])
    .map(b => b?.name)
    .filter(Boolean) as string[]

  // Normalize reference URLs to handle multiple formats:
  // - New format (going forward): {url: "...", description: "..."} - proper object
  // - Legacy format: "https://..." - plain URL string
  // - Transitional format: "{\"url\":\"...\", ...}" - stringified JSON (current bug)
  const normalizedUrls = (campaign.referenceUrls || [])
    .map((ref: any) => {
      // Already a proper object with url
      if (ref && typeof ref === 'object' && ref.url) {
        return ref
      }
      
      // String format - could be plain URL or stringified JSON
      if (typeof ref === 'string') {
        // Check if it's stringified JSON (starts with {)
        if (ref.trim().startsWith('{')) {
          try {
            const parsed = JSON.parse(ref)
            if (parsed && parsed.url) {
              return parsed
            }
          } catch {
            // Failed to parse, not valid JSON
          }
        }
        // Plain URL string (legacy format)
        if (ref.startsWith('http')) {
          return { url: ref, description: null }
        }
      }
      
      return null
    })
    .filter((ref: any): ref is ReferenceUrl => ref !== null && ref.url && typeof ref.url === 'string')

  return (
    <div className="space-y-4 pt-4 border-t border-border/50">
      {/* Topic Section */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-medium text-foreground">
          <FileText className="h-3.5 w-3.5 text-[#0dadb7]" />
          Advertorial Topic
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed bg-white rounded-md p-3 border border-border/50">
          {campaign.topic || "No topic specified"}
        </p>
      </div>

      {/* Campaign Setup Section */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-medium text-foreground">
          <Globe className="h-3.5 w-3.5 text-[#0dadb7]" />
          Campaign Setup
        </div>
        <div className="bg-white rounded-md p-3 border border-border/50 space-y-1.5">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted-foreground w-20 shrink-0">Type</span>
            <span className="inline-flex items-center rounded bg-[#F6F6F6] px-2 py-0.5 text-xs text-muted-foreground">
              {campaign.campaignType || "—"}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted-foreground w-20 shrink-0">Niche</span>
            <span className="inline-flex items-center rounded bg-[#F6F6F6] px-2 py-0.5 text-xs text-muted-foreground">
              {campaign.niche || "—"}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted-foreground w-20 shrink-0">Country</span>
            <span className="inline-flex items-center rounded bg-[#F6F6F6] px-2 py-0.5 text-xs text-muted-foreground">
              {campaign.country || "—"}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted-foreground w-20 shrink-0">Language</span>
            <span className="inline-flex items-center rounded bg-[#F6F6F6] px-2 py-0.5 text-xs text-muted-foreground">
              {campaign.language || "—"}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted-foreground w-20 shrink-0">Length</span>
            <span className="inline-flex items-center rounded bg-[#F6F6F6] px-2 py-0.5 text-xs text-muted-foreground">
              {campaign.length ? `${campaign.length} words` : "—"}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted-foreground w-20 shrink-0">Paragraphs</span>
            <span className="inline-flex items-center rounded bg-[#F6F6F6] px-2 py-0.5 text-xs text-muted-foreground">
              {campaign.paragraphLength || "—"}
            </span>
          </div>
          {campaign.guidelines && campaign.guidelines !== "None" && (
            <div className="flex items-start gap-2 text-xs">
              <span className="text-muted-foreground w-20 shrink-0 pt-0.5">Guidelines</span>
              <span className="inline-flex items-center rounded bg-[#F6F6F6] px-2 py-0.5 text-xs text-muted-foreground">
                {campaign.guidelines}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Reference Pages Section */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-medium text-foreground">
          <Link className="h-3.5 w-3.5 text-[#0dadb7]" />
          Reference Pages
          <span className="inline-flex items-center rounded bg-[#0dadb7]/10 px-1.5 py-0.5 text-[10px] font-medium text-[#0dadb7]">
            {normalizedUrls.length}
          </span>
        </div>
        <div className="bg-white rounded-md p-3 border border-border/50 space-y-2">
          {normalizedUrls.length > 0 ? (
            normalizedUrls.map((ref, index) => (
              <div key={index} className="space-y-0.5">
                <a
                  href={ref.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-[#4644B6] hover:underline"
                >
                  <ExternalLink className="h-3 w-3 shrink-0" />
                  <span className="truncate">{ref.url.replace(/^https?:\/\//, '')}</span>
                </a>
                {ref.description && (
                  <p className="text-[10px] text-muted-foreground ml-4.5 italic pl-4">
                    {ref.description}
                  </p>
                )}
              </div>
            ))
          ) : (
            <p className="text-xs text-muted-foreground">No reference pages</p>
          )}
        </div>
      </div>

      {/* Selected Insights Section */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-medium text-foreground">
          <Target className="h-3.5 w-3.5 text-[#0dadb7]" />
          Selected Insights
          <span className="inline-flex items-center rounded bg-[#0dadb7]/10 px-1.5 py-0.5 text-[10px] font-medium text-[#0dadb7]">
            {totalInsights}
          </span>
        </div>
        <div className="bg-white rounded-md p-3 border border-border/50">
          {hasInsights ? (
            <div className="space-y-3">
              {CATEGORY_ORDER.map((category) => {
                const texts = insightsByCategory[category]
                if (!texts || texts.length === 0) return null
                
                return (
                  <div key={category} className="space-y-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                        {CATEGORY_LABELS[category] || category}
                      </span>
                      <span className="text-[9px] text-muted-foreground/60">
                        ({texts.length})
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {texts.map((text, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center rounded bg-[#F6F6F6] px-2 py-1 text-[10px] text-muted-foreground max-w-full"
                          title={text}
                        >
                          <span className="truncate">
                            {text.length > 40 ? `${text.substring(0, 40)}...` : text}
                          </span>
                        </span>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">No insights selected</p>
          )}
        </div>
      </div>

      {/* Structure Section */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-medium text-foreground">
          <Layers className="h-3.5 w-3.5 text-[#0dadb7]" />
          Advertorial Structure
          <span className="inline-flex items-center rounded bg-[#0dadb7]/10 px-1.5 py-0.5 text-[10px] font-medium text-[#0dadb7]">
            {blockNames.length} blocks
          </span>
        </div>
        <div className="bg-white rounded-md p-3 border border-border/50">
          {blockNames.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {blockNames.map((name, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1.5 rounded bg-[#F6F6F6] px-2 py-1 text-[10px] text-muted-foreground"
                >
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#0dadb7] text-[9px] font-medium text-white">
                    {index + 1}
                  </span>
                  {name}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">No structure defined</p>
          )}
        </div>
      </div>
    </div>
  )
}
