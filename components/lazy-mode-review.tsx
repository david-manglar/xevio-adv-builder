"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MessageSquareText, Link, Globe, FileText, CheckCircle2, Loader2 } from "lucide-react"
import { LazyModeState, CampaignData } from "@/lib/types"

interface LazyModeReviewProps {
  data: LazyModeState
  campaignData: CampaignData
  userId: string | null
  onBack: () => void
  onGenerate: () => void
  setCampaignData: (updater: (prev: CampaignData) => CampaignData) => void
}

export function LazyModeReview({ data, campaignData, userId, onBack, onGenerate, setCampaignData }: LazyModeReviewProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const additionalLinks = data.referenceUrls
    .filter((ref) => ref.url && ref.url.trim() !== "")
    .map((ref) => ({ url: ref.url.trim(), description: ref.description?.trim() || null }))

  const lengthDisplay = data.keepOriginalLength ? "Keep original length" : `${data.length} words`

  const handleGenerate = async () => {
    setIsSubmitting(true)
    try {
      const response = await fetch("/api/lazy-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lazyModeData: data, userId }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to start generation")
      }

      setCampaignData((prev) => ({
        ...prev,
        id: result.campaignId,
        mode: "lazy",
        status: "generating",
      }))

      onGenerate()
    } catch (error) {
      console.error("Failed to start lazy generation:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-[#0dadb7] rounded-lg px-6 py-4 flex items-center justify-between">
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
        {/* Instructions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <MessageSquareText className="h-4 w-4 text-[#0dadb7]" />
              Instructions
            </CardTitle>
          </CardHeader>
          <CardContent className="px-6">
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{data.instructions}</p>
          </CardContent>
        </Card>

        {/* Reference Pages */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Link className="h-4 w-4 text-[#0dadb7]" />
              Reference Pages
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1">
              <span className="text-xs font-medium text-muted-foreground">Advertorial to rewrite</span>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-[#0dadb7] shrink-0" />
                <span className="text-muted-foreground truncate">{data.advertorialUrl.replace(/^https?:\/\//, "")}</span>
              </div>
            </div>
            {additionalLinks.length > 0 && (
              <>
                <div className="border-t border-border" />
                <div className="space-y-2">
                  <span className="text-xs font-medium text-muted-foreground">Additional links</span>
                  {additionalLinks.map((ref, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-[#0dadb7] shrink-0" />
                        <span className="text-muted-foreground truncate">{ref.url.replace(/^https?:\/\//, "")}</span>
                      </div>
                      {ref.description && (
                        <p className="text-xs text-muted-foreground ml-6 italic">{ref.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Campaign Settings */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Globe className="h-4 w-4 text-[#0dadb7]" />
              Campaign Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[
                ["Campaign Type", data.campaignType],
                ["Niche", data.niche],
                ["Country", data.country],
                ["Language", data.language],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-24 shrink-0">{label}</span>
                  <span className="inline-flex items-center rounded-md bg-[#F6F6F6] px-2.5 py-1 text-xs font-medium text-muted-foreground">
                    {value}
                  </span>
                </div>
              ))}
              {data.guidelines !== "None" && (
                <div className="flex items-start gap-2">
                  <span className="text-xs text-muted-foreground w-24 shrink-0 pt-1">Guidelines</span>
                  {data.guidelines === "Custom" && data.customGuidelines ? (
                    <div className="rounded-md bg-[#F6F6F6] px-2.5 py-1.5 text-xs font-medium text-muted-foreground whitespace-pre-wrap">
                      {data.customGuidelines}
                    </div>
                  ) : (
                    <span className="inline-flex items-center rounded-md bg-[#F6F6F6] px-2.5 py-1 text-xs font-medium text-muted-foreground">
                      {data.guidelines}
                    </span>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Content & Style */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4 text-[#0dadb7]" />
              Content & Style
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground w-24 shrink-0">Length</span>
                <span className="inline-flex items-center rounded-md bg-[#F6F6F6] px-2.5 py-1 text-xs font-medium text-muted-foreground">
                  {lengthDisplay}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground w-24 shrink-0">Paragraphs</span>
                <span className="inline-flex items-center rounded-md bg-[#F6F6F6] px-2.5 py-1 text-xs font-medium text-muted-foreground">
                  {data.paragraphLength}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack}>
          Back to Edit
        </Button>
        <Button
          size="lg"
          className="bg-[#4644B6] hover:bg-[#3a38a0]"
          onClick={handleGenerate}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Starting...
            </>
          ) : (
            "Generate Advertorial"
          )}
        </Button>
      </div>
    </div>
  )
}
