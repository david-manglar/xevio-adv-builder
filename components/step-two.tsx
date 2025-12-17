"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Link, Loader2, Plus, X } from "lucide-react"

interface StepTwoProps {
  onNext: () => void
  onBack: () => void
  referenceOption: "manual" | "scrape" | null
  setReferenceOption: (option: "manual" | "scrape" | null) => void
  isLoading: boolean
}

export function StepTwo({ onNext, onBack, isLoading }: StepTwoProps) {
  const [referenceUrls, setReferenceUrls] = useState([
    "https://www.dentalcover.co.uk/plans",
    "https://www.simplyhealth.co.uk/dental-insurance",
  ])

  const addUrlField = () => {
    setReferenceUrls([...referenceUrls, ""])
  }

  const removeUrlField = (index: number) => {
    setReferenceUrls(referenceUrls.filter((_, i) => i !== index))
  }

  const updateUrl = (index: number, value: string) => {
    const updated = [...referenceUrls]
    updated[index] = value
    setReferenceUrls(updated)
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
            {referenceUrls.map((url, index) => (
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
                {referenceUrls.length > 1 && (
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
        <Button onClick={onNext} disabled={isLoading} size="lg">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Scraping Pages...
            </>
          ) : (
            "Scrape & Continue"
          )}
        </Button>
      </div>
    </div>
  )
}
