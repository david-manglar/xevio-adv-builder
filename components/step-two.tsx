"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Link, Loader2, Plus, X } from "lucide-react"
import { StepOneState, StepTwoState, CampaignData } from "@/lib/types"
import { ScrapingDialog } from "@/components/scraping-dialog"
import { useRef, useState } from "react"
import { supabase } from "@/lib/supabase"
import { RealtimeChannel } from "@supabase/supabase-js"

interface StepTwoProps {
  stepOneData: StepOneState
  data: StepTwoState
  updateData: (data: StepTwoState) => void
  onNext: () => void
  onBack: () => void
  isLoading: boolean
  onCampaignCreated: (data: CampaignData) => void
  userId: string | null
}

export function StepTwo({
  stepOneData,
  data,
  updateData,
  onNext,
  onBack,
  isLoading,
  onCampaignCreated,
  userId,
}: StepTwoProps) {
  const [showDialog, setShowDialog] = useState(false)
  const [isStartingScrape, setIsStartingScrape] = useState(false)
  const channelRef = useRef<RealtimeChannel | null>(null)

  const handleCancel = () => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current)
      channelRef.current = null
    }
    setShowDialog(false)
    setIsStartingScrape(false)
  }

  const handleNext = async () => {
    setIsStartingScrape(true)
    
    try {
      // 1. Call our internal API to create the campaign record
      // This API route handles the n8n webhook trigger
      const response = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stepOneData,
          stepTwoData: data,
          userId,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to start scraping")
      }

      const campaignId = result.campaignId
      onCampaignCreated({ id: campaignId, status: "scraping" })
      
      // 2. Open the waiting dialog
      setIsStartingScrape(false)
      setShowDialog(true)

      // 3. Subscribe to Realtime updates AND check current status
      const channel = supabase
        .channel(`campaign-${campaignId}`)
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "campaigns",
            filter: `id=eq.${campaignId}`,
          },
          (payload) => {
            handleStatusUpdate(payload.new.status, payload.new.scraping_result, campaignId, channel)
          }
        )
        .subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
             // 4. Double check status in case it updated while we were connecting
             const { data: currentCampaign } = await supabase
               .from('campaigns')
               .select('status, scraping_result')
               .eq('id', campaignId)
               .single()
             
             if (currentCampaign) {
               handleStatusUpdate(currentCampaign.status, currentCampaign.scraping_result, campaignId, channel)
             }
          }
        })
        
      channelRef.current = channel

    } catch (error) {
      console.error("Error starting scrape:", error)
      setIsStartingScrape(false)
      alert("Something went wrong starting the process.")
    }
  }

  const handleStatusUpdate = (
    status: string, 
    scrapingResult: any, 
    campaignId: string, 
    channel: RealtimeChannel
  ) => {
    console.log("Status update:", status)
    
    if (status === "urls_processed") {
      // Scraping finished!
      onCampaignCreated({ 
        id: campaignId, 
        status: "urls_processed",
        scrapingResult: scrapingResult
      })
      setShowDialog(false)
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
      onNext()
    } else if (status === "failed") {
      // Handle failure
      setShowDialog(false)
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
      alert("Scraping failed. Please try again.")
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
  const hasValidUrl = data.referenceUrls.some((url) => isValidUrl(url))

  const addUrlField = () => {
    updateData({ ...data, referenceUrls: [...data.referenceUrls, ""] })
  }

  const removeUrlField = (index: number) => {
    updateData({
      ...data,
      referenceUrls: data.referenceUrls.filter((_, i) => i !== index),
    })
  }

  const updateUrl = (index: number, value: string) => {
    const updated = [...data.referenceUrls]
    updated[index] = value
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
            Add URLs to existing pages (product pages, competitor pages) and we'll extract key information. You can add
            multiple references.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.referenceUrls.map((url, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="flex-1 space-y-1">
                  <Label htmlFor={`url-${index}`} className="text-sm text-muted-foreground">
                    Reference URL {index + 1}
                  </Label>
                  <Input
                    id={`url-${index}`}
                    type="url"
                    placeholder="https://example.com/product-page"
                    value={url}
                    onChange={(e) => updateUrl(index, e.target.value)}
                  />
                </div>
                {data.referenceUrls.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="mt-6 text-muted-foreground hover:text-destructive"
                    onClick={() => removeUrlField(index)}
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Remove URL</span>
                  </Button>
                )}
              </div>
            ))}
            <Button variant="outline" size="sm" className="gap-2 bg-transparent" onClick={addUrlField}>
              <Plus className="h-4 w-4" />
              Add another URL
            </Button>
            <p className="text-xs text-muted-foreground">
              We'll scrape these pages to extract USPs, pricing, tone of voice, and more.
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
          disabled={isLoading || isStartingScrape || !hasValidUrl} 
          size="lg"
        >
          {isLoading || isStartingScrape ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Starting...
            </>
          ) : (
            "Scrape & Continue"
          )}
        </Button>
      </div>
      
      <ScrapingDialog 
        open={showDialog} 
        onOpenChange={() => {}} 
        onCancel={handleCancel}
      />
    </div>
  )
}
