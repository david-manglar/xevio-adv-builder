"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import { Globe, FileText, Shield, Lightbulb, AlertTriangle } from "lucide-react"
import { StepOneState, CampaignData } from "@/lib/types"
import { cn } from "@/lib/utils"
import { hasStepOneChanges } from "@/lib/url-utils"

interface StepOneProps {
  data: StepOneState
  updateData: (data: StepOneState) => void
  onNext: () => void
  campaignData: CampaignData  // NEW: Access existing campaign data
}

export function StepOne({ data, updateData, onNext, campaignData }: StepOneProps) {
  const [errors, setErrors] = useState<Partial<Record<keyof StepOneState, boolean>>>({})
  const [showRescrapeWarning, setShowRescrapeWarning] = useState(false)

  const validate = () => {
    const newErrors: Partial<Record<keyof StepOneState, boolean>> = {}
    let isValid = true

    const mandatoryFields: (keyof StepOneState)[] = [
      "topic",
      "campaignType",
      "niche",
      "country",
      "language",
      "length",
      "paragraphLength",
      "guidelines",
    ]

    mandatoryFields.forEach((key) => {
      if (!data[key] || data[key].trim() === "") {
        newErrors[key] = true
        isValid = false
      }
    })

    // If Custom is selected, customGuidelines is required
    if (data.guidelines === "Custom" && (!data.customGuidelines || data.customGuidelines.trim() === "")) {
      newErrors.customGuidelines = true
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const handleNext = () => {
    if (!validate()) return
    
    // Check if Step 1 data has changed from the scraped version
    // Only show warning if we have existing scraped data
    const hasScrapedData = campaignData.scrapedUrls && campaignData.scrapedUrls.length > 0
    const step1Changed = hasStepOneChanges(data, campaignData.scrapedStepOneData)
    
    if (hasScrapedData && step1Changed) {
      setShowRescrapeWarning(true)
      return
    }
    
    onNext()
  }
  
  const handleConfirmRescrape = () => {
    setShowRescrapeWarning(false)
    onNext()
  }

  const clearError = (field: keyof StepOneState) => {
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  return (
    <div className="space-y-6">
      {/* Advertorial Topic */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-[#0dadb7]" />
            <CardTitle className="text-base">Advertorial Topic</CardTitle>
          </div>
          <CardDescription>Describe in plain language what your advertorial is about</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Label htmlFor="topic">
              Topic <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="topic"
              placeholder="Describe the topic of your advertorial in detail..."
              className={cn("min-h-[120px] resize-y", errors.topic && "border-destructive")}
              value={data.topic}
              onChange={(e) => {
                updateData({ ...data, topic: e.target.value })
                clearError("topic")
              }}
            />
            {errors.topic && <p className="text-sm text-destructive">This field is required</p>}
          </div>
        </CardContent>
      </Card>

      {/* Campaign Type & Geo */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-[#0dadb7]" />
            <CardTitle className="text-base">Campaign Type & Geo</CardTitle>
          </div>
          <CardDescription>Define your campaign's market and type</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="campaign-type">
                Campaign Type <span className="text-destructive">*</span>
              </Label>
              <Select
                value={data.campaignType}
                onValueChange={(v) => {
                  updateData({ ...data, campaignType: v })
                  clearError("campaignType")
                }}
              >
                <SelectTrigger id="campaign-type" className={cn(errors.campaignType && "border-destructive")}>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Lead Generation">Lead Generation</SelectItem>
                  <SelectItem value="E-commerce">E-commerce</SelectItem>
                </SelectContent>
              </Select>
              {errors.campaignType && <p className="text-sm text-destructive">Required</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="niche">
                Campaign Niche <span className="text-destructive">*</span>
              </Label>
              <Select
                value={data.niche}
                onValueChange={(v) => {
                  updateData({ ...data, niche: v })
                  clearError("niche")
                }}
              >
                <SelectTrigger id="niche" className={cn(errors.niche && "border-destructive")}>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Beauty">Beauty</SelectItem>
                  <SelectItem value="Education">Education</SelectItem>
                  <SelectItem value="Fashion/Clothing">Fashion/Clothing</SelectItem>
                  <SelectItem value="Finance/Insurance">Finance/Insurance</SelectItem>
                  <SelectItem value="Gaming">Gaming</SelectItem>
                  <SelectItem value="Health Supplements">Health Supplements</SelectItem>
                  <SelectItem value="Home Improvement">Home Improvement</SelectItem>
                  <SelectItem value="Medical">Medical</SelectItem>
                  <SelectItem value="Tech/Gadgets">Tech/Gadgets</SelectItem>
                  <SelectItem value="Weight Loss">Weight Loss</SelectItem>
                </SelectContent>
              </Select>
              {errors.niche && <p className="text-sm text-destructive">Required</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">
                Country <span className="text-destructive">*</span>
              </Label>
              <Select
                value={data.country}
                onValueChange={(v) => {
                  updateData({ ...data, country: v })
                  clearError("country")
                }}
              >
                <SelectTrigger id="country" className={cn(errors.country && "border-destructive")}>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="United States">United States</SelectItem>
                  <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                  <SelectItem value="Canada">Canada</SelectItem>
                  <SelectItem value="Germany">Germany</SelectItem>
                </SelectContent>
              </Select>
              {errors.country && <p className="text-sm text-destructive">Required</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="language">
                Language <span className="text-destructive">*</span>
              </Label>
              <Select
                value={data.language}
                onValueChange={(v) => {
                  updateData({ ...data, language: v })
                  clearError("language")
                }}
              >
                <SelectTrigger id="language" className={cn(errors.language && "border-destructive")}>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="English">English</SelectItem>
                  <SelectItem value="German">German</SelectItem>
                </SelectContent>
              </Select>
              {errors.language && <p className="text-sm text-destructive">Required</p>}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Content & Style */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-[#0dadb7]" />
              <CardTitle className="text-base">Content & Style</CardTitle>
            </div>
            <CardDescription>Configure content length and formatting</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-6">
              <div className="space-y-2 w-[140px]">
                <Label htmlFor="length">
                  Length (words) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="length"
                  type="number"
                  placeholder="e.g., 1500"
                  className={cn(errors.length && "border-destructive")}
                  value={data.length}
                  onChange={(e) => {
                    updateData({ ...data, length: e.target.value })
                    clearError("length")
                  }}
                />
                {errors.length && <p className="text-sm text-destructive">Required</p>}
              </div>

              <div className="space-y-2 flex-1 min-w-[180px]">
                <Label htmlFor="paragraph-length">
                  Paragraph Length <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={data.paragraphLength}
                  onValueChange={(v) => {
                    updateData({ ...data, paragraphLength: v })
                    clearError("paragraphLength")
                  }}
                >
                  <SelectTrigger id="paragraph-length" className={cn(errors.paragraphLength && "border-destructive")}>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Very Short (1 sentence)">Very Short (1 sentence)</SelectItem>
                    <SelectItem value="Short (1-3 lines)">Short (1-3 lines)</SelectItem>
                    <SelectItem value="Normal (3-4 lines)">Normal (3-4 lines)</SelectItem>
                    <SelectItem value="Long (4-6 lines)">Long (4-6 lines)</SelectItem>
                  </SelectContent>
                </Select>
                {errors.paragraphLength && <p className="text-sm text-destructive">Required</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Compliance */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-[#0dadb7]" />
              <CardTitle className="text-base">Compliance</CardTitle>
            </div>
            <CardDescription>Indicate specific guidelines to follow</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="guidelines">
                Client Guidelines <span className="text-destructive">*</span>
              </Label>
              <Select
                value={data.guidelines}
                onValueChange={(v) => {
                  updateData({ 
                    ...data, 
                    guidelines: v,
                    // Clear custom guidelines if switching away from Custom
                    customGuidelines: v === "Custom" ? data.customGuidelines : undefined
                  })
                  clearError("guidelines")
                  clearError("customGuidelines")
                }}
              >
                <SelectTrigger id="guidelines" className={cn(errors.guidelines && "border-destructive")}>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="None">None</SelectItem>
                  <SelectItem value="ERGO">ERGO</SelectItem>
                  <SelectItem value="Custom">Custom</SelectItem>
                </SelectContent>
              </Select>
              {errors.guidelines && <p className="text-sm text-destructive">Required</p>}
              
              {data.guidelines === "Custom" && (
                <div className="mt-3 space-y-2">
                  <Label htmlFor="custom-guidelines">
                    Custom Guidelines <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="custom-guidelines"
                    placeholder="e.g., 'Don't use word X' or 'Only communicate Bundle A'..."
                    className={cn("min-h-[100px] resize-y", errors.customGuidelines && "border-destructive")}
                    value={data.customGuidelines || ""}
                    onChange={(e) => {
                      updateData({ ...data, customGuidelines: e.target.value })
                      clearError("customGuidelines")
                    }}
                  />
                  {errors.customGuidelines && <p className="text-sm text-destructive">Required</p>}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Navigation */}
      <div className="flex justify-end pt-4">
        <Button onClick={handleNext} size="lg" className="bg-[#4644B6] hover:bg-[#3a38a0]">
          Continue to Product Info
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
                  Changing campaign settings will restart the scraping process since these 
                  settings affect how pages are analyzed. You may lose insights you've customized.
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
              Yes, Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
