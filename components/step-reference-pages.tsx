"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog"
import { Link, Plus, X, AlertTriangle, Loader2, CheckCircle2, AlertCircle } from "lucide-react"
import { StepOneState, StepTwoState, CampaignData } from "@/lib/types"
import { useState } from "react"
import { cleanUrl, ensureProtocol, detectUrlChanges, extractUrls, hasStepOneChanges } from "@/lib/url-utils"

type UrlValidationStatus = 'idle' | 'validating' | 'valid' | 'invalid'

interface UrlValidation {
  status: UrlValidationStatus
  message?: string
}

// Scrape request passed to parent - null means skip (no scrape needed)
export interface ScrapeRequest {
  newUrlsOnly: string[] | null
  isFullRescrape: boolean
}

interface StepTwoProps {
  stepOneData: StepOneState
  data: StepTwoState
  updateData: (data: StepTwoState) => void
  onComplete: (scrapeRequest: ScrapeRequest | null) => void
  onBack: () => void
  campaignData: CampaignData
}

export function StepTwo({
  stepOneData,
  data,
  updateData,
  onComplete,
  onBack,
  campaignData,
}: StepTwoProps) {
  const [showRescrapeWarning, setShowRescrapeWarning] = useState(false)
  const [pendingAction, setPendingAction] = useState<'structural' | 'step1_change' | null>(null)
  const [urlValidations, setUrlValidations] = useState<Record<string, UrlValidation>>({})

  // Determine if we need to re-scrape based on URL or Step 1 changes
  const determineAction = () => {
    const currentUrls = extractUrls(data.referenceUrls)
    const scrapedUrls = campaignData.scrapedUrls || []
    
    // Check for Step 1 changes first
    const step1Changed = hasStepOneChanges(stepOneData, campaignData.scrapedStepOneData)
    
    // If no campaign exists yet or no scraping has been done, always do full scrape
    if (!campaignData.id || scrapedUrls.length === 0) {
      return { action: 'full_scrape' as const, newUrls: currentUrls }
    }
    
    // Detect URL changes
    const urlChange = detectUrlChanges(currentUrls, scrapedUrls)
    
    // Step 1 changed = structural change requiring full re-scrape
    if (step1Changed) {
      return { action: 'structural_step1' as const, newUrls: [] }
    }
    
    // URL changes
    switch (urlChange.changeType) {
      case 'none':
        return { action: 'skip' as const, newUrls: [] }
      case 'additions_only':
        return { action: 'incremental' as const, newUrls: urlChange.newUrls }
      case 'structural':
        return { action: 'structural_url' as const, newUrls: [] }
    }
  }

  const handleNext = () => {
    const decision = determineAction()
    
    // No scraping needed - just proceed
    if (decision.action === 'skip') {
      onComplete(null)
      return
    }
    
    // Structural changes require warning dialog
    if (decision.action === 'structural_url') {
      setPendingAction('structural')
      setShowRescrapeWarning(true)
      return
    }
    
    if (decision.action === 'structural_step1') {
      setPendingAction('step1_change')
      setShowRescrapeWarning(true)
      return
    }
    
    // Full scrape (new campaign) or incremental - pass to parent
    onComplete({
      newUrlsOnly: decision.action === 'incremental' ? decision.newUrls : null,
      isFullRescrape: false,
    })
  }

  const handleConfirmRescrape = () => {
    setShowRescrapeWarning(false)
    setPendingAction(null)
    
    // Tell parent to do full re-scrape
    onComplete({
      newUrlsOnly: null,
      isFullRescrape: true,
    })
  }

  // Check if a string is a valid URL
  const isValidUrl = (urlString: string): boolean => {
    if (!urlString || urlString.trim() === "") return false
    try {
      const url = new URL(urlString)
      return url.protocol === "http:" || url.protocol === "https:"
    } catch {
      return false
    }
  }

  // Check if at least one valid URL exists
  const hasValidUrl = data.referenceUrls.some((ref) => isValidUrl(ref.url))

  const addUrlField = () => {
    updateData({ ...data, referenceUrls: [...data.referenceUrls, { url: "", description: "" }] })
  }

  const removeUrlField = (index: number) => {
    updateData({
      ...data,
      referenceUrls: data.referenceUrls.filter((_, i) => i !== index),
    })
  }

  const updateUrl = (index: number, value: string) => {
    const updated = [...data.referenceUrls]
    updated[index] = { ...updated[index], url: value }
    updateData({ ...data, referenceUrls: updated })
  }

  const handleUrlBlur = async (index: number) => {
    const raw = data.referenceUrls[index]?.url
    if (!raw || !raw.trim()) return

    const normalized = ensureProtocol(cleanUrl(raw))
    if (normalized !== raw) {
      updateUrl(index, normalized)
    }

    if (!isValidUrl(normalized)) return
    const cleaned = normalized

    // Skip if already validated as reachable or currently in-flight
    const existing = urlValidations[cleaned]
    if (existing?.status === 'valid' || existing?.status === 'validating') return

    setUrlValidations(prev => ({ ...prev, [cleaned]: { status: 'validating' } }))

    try {
      const res = await fetch('/api/validate-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: cleaned }),
      })
      const result = await res.json()

      setUrlValidations(prev => ({
        ...prev,
        [cleaned]: {
          status: result.reachable ? 'valid' : 'invalid',
          message: result.error || undefined,
        },
      }))
    } catch {
      setUrlValidations(prev => ({
        ...prev,
        [cleaned]: { status: 'invalid', message: 'Failed to validate URL' },
      }))
    }
  }

  const getUrlValidation = (url: string): UrlValidation | null => {
    if (!url || !isValidUrl(url)) return null
    return urlValidations[cleanUrl(url)] || null
  }

  const updateDescription = (index: number, value: string) => {
    const updated = [...data.referenceUrls]
    updated[index] = { ...updated[index], description: value }
    updateData({ ...data, referenceUrls: updated })
  }

  // Button text based on whether this is a new scrape or just continuing
  const buttonText = campaignData.scrapedUrls?.length ? "Continue" : "Scrape & Continue"

  const hasValidationError = data.referenceUrls.some((ref) => {
    const v = getUrlValidation(ref.url)
    return v?.status === 'invalid'
  })

  const isValidatingUrls = data.referenceUrls.some((ref) => {
    const v = getUrlValidation(ref.url)
    return v?.status === 'validating'
  })

  return (
    <div className="space-y-6">
      {/* Reference Pages Section */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <Link className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-base">Reference Pages</CardTitle>
          </div>
          <CardDescription>
            Add URLs from existing pages (product pages, competitor pages) and optionally describe what each page is or what the scraper should focus on. It will extract key information like USPs, pricing, tone of voice, and more from these references.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.referenceUrls.map((ref, index) => {
              const validation = getUrlValidation(ref.url)
              return (
              <div key={index} className="space-y-2">
                <div className="flex items-start gap-2">
                  <div className="flex-1 space-y-2">
                    <div className="space-y-1">
                      <Label htmlFor={`url-${index}`} className="text-sm text-muted-foreground">
                        Reference URL {index + 1} <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id={`url-${index}`}
                        type="url"
                        placeholder="example.com/product-page"
                        value={ref.url}
                        onChange={(e) => updateUrl(index, e.target.value)}
                        onBlur={() => handleUrlBlur(index)}
                        aria-invalid={validation?.status === 'invalid'}
                      />
                      {validation?.status === 'validating' && (
                        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          Checking URL...
                        </p>
                      )}
                      {validation?.status === 'valid' && (
                        <p className="flex items-center gap-1.5 text-xs text-green-600">
                          <CheckCircle2 className="h-3 w-3" />
                          URL is reachable
                        </p>
                      )}
                      {validation?.status === 'invalid' && (
                        <p className="flex items-center gap-1.5 text-xs text-destructive">
                          <AlertCircle className="h-3 w-3" />
                          {validation.message || 'URL is not reachable'}
                        </p>
                      )}
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor={`description-${index}`} className="text-sm text-muted-foreground">
                        Description <span className="text-xs font-normal">(optional)</span>
                      </Label>
                      <Input
                        id={`description-${index}`}
                        type="text"
                        placeholder="e.g., competitor homepage, our product page, pricing comparison site"
                        value={ref.description || ""}
                        onChange={(e) => updateDescription(index, e.target.value)}
                        className="text-sm"
                      />
                    </div>
                  </div>
                  {data.referenceUrls.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="mt-6 text-muted-foreground hover:text-destructive shrink-0"
                      onClick={() => removeUrlField(index)}
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">Remove URL</span>
                    </Button>
                  )}
                </div>
              </div>
              )
            })}
            <Button variant="outline" size="sm" className="gap-2 bg-transparent" onClick={addUrlField}>
              <Plus className="h-4 w-4" />
              Add another URL
            </Button>
            <p className="text-xs text-muted-foreground">
              Scraping happens in the background while you continue. Results will be ready when you reach Step 4 (Insights).
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={handleNext} disabled={!hasValidUrl || hasValidationError || isValidatingUrls} size="lg">
          {buttonText}
        </Button>
      </div>

      {/* Re-scrape Warning Dialog */}
      <AlertDialog open={showRescrapeWarning} onOpenChange={(open) => !open && setShowRescrapeWarning(false)}>
        <AlertDialogContent className="sm:max-w-[425px]">
          <AlertDialogHeader>
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 mt-1">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
              </div>
              <div className="flex-1 space-y-2">
                <AlertDialogTitle>Re-scrape Required</AlertDialogTitle>
                <AlertDialogDescription>
                  {pendingAction === 'step1_change' ? (
                    <>
                      Changing campaign settings will restart the scraping process since these 
                      settings affect how pages are analyzed. You may lose insights you've customized.
                    </>
                  ) : (
                    <>
                      You've modified or removed URLs that were already processed. This will restart 
                      the scraping process and you may lose insights you've customized in Step 4.
                    </>
                  )}
                  <br /><br />
                  Do you want to continue?
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowRescrapeWarning(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmRescrape}
              className="bg-[#4644B6] hover:bg-[#3a38a0]"
            >
              Yes, Re-scrape
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
