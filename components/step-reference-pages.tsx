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
import { Link, Loader2, Plus, X, AlertTriangle } from "lucide-react"
import { StepOneState, StepTwoState, CampaignData } from "@/lib/types"
import { useState } from "react"
import { detectUrlChanges, extractUrls, hasStepOneChanges } from "@/lib/url-utils"

interface StepTwoProps {
  stepOneData: StepOneState
  data: StepTwoState
  updateData: (data: StepTwoState) => void
  onNext: () => void
  onBack: () => void
  isLoading: boolean
  onCampaignCreated: (data: CampaignData) => void
  onResetInsights: () => void  // NEW: Reset Step 4 insights on full re-scrape
  userId: string | null
  campaignData: CampaignData  // NEW: Access existing campaign data
}

export function StepTwo({
  stepOneData,
  data,
  updateData,
  onNext,
  onBack,
  isLoading,
  onCampaignCreated,
  onResetInsights,
  userId,
  campaignData,
}: StepTwoProps) {
  const [showRescrapeWarning, setShowRescrapeWarning] = useState(false)
  const [pendingAction, setPendingAction] = useState<'structural' | 'step1_change' | null>(null)
  const [isNavigating, setIsNavigating] = useState(false)

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

  const handleNext = async () => {
    const decision = determineAction()
    
    // No scraping needed - just proceed
    if (decision.action === 'skip') {
      onNext()
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
    
    // Full scrape (new campaign) or incremental - proceed with API call
    await performScrape(decision.action === 'incremental' ? decision.newUrls : null)
  }

  const handleConfirmRescrape = async () => {
    setShowRescrapeWarning(false)
    setPendingAction(null)
    
    // Reset insights since we're doing full re-scrape
    onResetInsights()
    
    // Perform full re-scrape
    await performScrape(null, true)
  }

  const performScrape = async (newUrlsOnly: string[] | null, isFullRescrape: boolean = false) => {
    setIsNavigating(true)
    
    // Proceed optimistically to Step 3 immediately - we don't need to wait for the API
    // Step 3 (Building Blocks) doesn't require the campaign ID
    // The API call will complete in the background and update campaign data when ready
    onNext()
    
    try {
      const response = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stepOneData,
          stepTwoData: data,
          userId,
          // Include campaign ID if updating existing campaign
          campaignId: campaignData.id || undefined,
          // Include only new URLs for incremental scrape
          newUrlsOnly: newUrlsOnly || undefined,
          // Flag for full re-scrape (clears existing results)
          isFullRescrape: isFullRescrape || undefined,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to start scraping")
      }

      const campaignId = result.campaignId
      const currentUrls = extractUrls(data.referenceUrls)
      
      // Update campaign data with the new/updated campaign ID and scraping status
      // This happens after navigation, but Step 4 (Insights) will wait for scraping results anyway
      onCampaignCreated({ 
        id: campaignId, 
        status: "scraping",
        scrapedUrls: currentUrls,
        scrapedStepOneData: { ...stepOneData },
        // Keep existing results if incremental, clear if full re-scrape
        scrapingResult: (newUrlsOnly && !isFullRescrape) ? campaignData.scrapingResult : undefined,
      })

    } catch (error) {
      console.error("Error starting scrape:", error)
      // Note: User is already on Step 3, so we can't show an alert easily
      // The scraping will fail and Step 4 will show the error state
      // Alternatively, we could use a toast notification here
    }
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

  const updateDescription = (index: number, value: string) => {
    const updated = [...data.referenceUrls]
    updated[index] = { ...updated[index], description: value }
    updateData({ ...data, referenceUrls: updated })
  }

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
            {data.referenceUrls.map((ref, index) => (
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
                        placeholder="https://example.com/product-page"
                        value={ref.url}
                        onChange={(e) => updateUrl(index, e.target.value)}
                      />
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
            ))}
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
        <Button 
          onClick={handleNext} 
          disabled={isLoading || isNavigating || !hasValidUrl} 
          size="lg"
        >
          {isLoading || isNavigating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {campaignData.scrapedUrls?.length ? "Continue" : "Scrape & Continue"}
            </>
          ) : (
            // Show different button text based on whether this is a new scrape or just continuing
            campaignData.scrapedUrls?.length ? "Continue" : "Scrape & Continue"
          )}
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
