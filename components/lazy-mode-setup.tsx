"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MessageSquareText, Link, Globe, FileText, Shield, Plus, X, Loader2, CheckCircle2, AlertCircle } from "lucide-react"
import { LazyModeState } from "@/lib/types"
import { cn } from "@/lib/utils"
import { cleanUrl, ensureProtocol } from "@/lib/url-utils"

type UrlValidationStatus = "idle" | "validating" | "valid" | "invalid"

interface UrlValidation {
  status: UrlValidationStatus
  message?: string
}

interface LazyModeSetupProps {
  data: LazyModeState
  updateData: (data: LazyModeState) => void
  onNext: () => void
  onBack: () => void
}

export function LazyModeSetup({ data, updateData, onNext, onBack }: LazyModeSetupProps) {
  const [errors, setErrors] = useState<Partial<Record<string, boolean>>>({})
  const [urlValidations, setUrlValidations] = useState<Record<string, UrlValidation>>({})

  const isValidUrl = (urlString: string): boolean => {
    if (!urlString || urlString.trim() === "") return false
    try {
      const url = new URL(urlString)
      return url.protocol === "http:" || url.protocol === "https:"
    } catch {
      return false
    }
  }

  const hasValidAdvertorialUrl = isValidUrl(data.advertorialUrl)

  const validate = () => {
    const newErrors: Record<string, boolean> = {}
    let isValid = true

    if (!data.instructions.trim()) {
      newErrors.instructions = true
      isValid = false
    }

    if (!hasValidAdvertorialUrl) {
      newErrors.advertorialUrl = true
      isValid = false
    }

    const requiredFields = ["campaignType", "niche", "country", "language", "paragraphLength", "guidelines"] as const
    for (const field of requiredFields) {
      if (!data[field] || data[field].trim() === "") {
        newErrors[field] = true
        isValid = false
      }
    }

    if (!data.keepOriginalLength && (!data.length || data.length.trim() === "")) {
      newErrors.length = true
      isValid = false
    }

    if (data.guidelines === "Custom" && (!data.customGuidelines || data.customGuidelines.trim() === "")) {
      newErrors.customGuidelines = true
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const clearError = (field: string) => {
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const handleNext = () => {
    if (validate()) onNext()
  }

  const addUrlField = () => {
    updateData({ ...data, referenceUrls: [...data.referenceUrls, { url: "", description: "" }] })
  }

  const removeUrlField = (index: number) => {
    updateData({ ...data, referenceUrls: data.referenceUrls.filter((_, i) => i !== index) })
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

  const validateUrlRemotely = async (rawUrl: string): Promise<void> => {
    const cleaned = ensureProtocol(cleanUrl(rawUrl))
    if (!isValidUrl(cleaned)) return

    const existing = urlValidations[cleaned]
    if (existing?.status === "valid" || existing?.status === "validating") return

    setUrlValidations((prev) => ({ ...prev, [cleaned]: { status: "validating" } }))

    try {
      const res = await fetch("/api/validate-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: cleaned }),
      })
      const result = await res.json()
      setUrlValidations((prev) => ({
        ...prev,
        [cleaned]: { status: result.reachable ? "valid" : "invalid", message: result.error || undefined },
      }))
    } catch {
      setUrlValidations((prev) => ({
        ...prev,
        [cleaned]: { status: "invalid", message: "Failed to validate URL" },
      }))
    }
  }

  const handleAdvertorialUrlBlur = async () => {
    const raw = data.advertorialUrl
    if (!raw || !raw.trim()) return
    const normalized = ensureProtocol(cleanUrl(raw))
    if (normalized !== raw) updateData({ ...data, advertorialUrl: normalized })
    await validateUrlRemotely(normalized)
  }

  const handleUrlBlur = async (index: number) => {
    const raw = data.referenceUrls[index]?.url
    if (!raw || !raw.trim()) return
    const normalized = ensureProtocol(cleanUrl(raw))
    if (normalized !== raw) updateUrl(index, normalized)
    await validateUrlRemotely(normalized)
  }

  const getUrlValidation = (url: string): UrlValidation | null => {
    if (!url || !isValidUrl(url)) return null
    return urlValidations[ensureProtocol(cleanUrl(url))] || null
  }

  const advertorialValidation = getUrlValidation(data.advertorialUrl)

  const hasValidationError =
    advertorialValidation?.status === "invalid" ||
    data.referenceUrls.some((ref) => {
      const v = getUrlValidation(ref.url)
      return v?.status === "invalid"
    })

  const isValidatingUrls =
    advertorialValidation?.status === "validating" ||
    data.referenceUrls.some((ref) => {
      const v = getUrlValidation(ref.url)
      return v?.status === "validating"
    })

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <MessageSquareText className="h-5 w-5 text-[#0dadb7]" />
            <CardTitle className="text-base">Instructions</CardTitle>
          </div>
          <CardDescription>
            Describe your goal or vision for the new advertorial. Be as specific or general as you like.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Label htmlFor="instructions">
              What should the AI do? <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="instructions"
              placeholder="e.g., Rewrite this advertorial to target men instead of women. Keep the same structure but adjust the tone, examples, and testimonials..."
              className={cn("min-h-[140px] resize-y", errors.instructions && "border-destructive")}
              value={data.instructions}
              onChange={(e) => {
                updateData({ ...data, instructions: e.target.value })
                clearError("instructions")
              }}
            />
            {errors.instructions && <p className="text-sm text-destructive">This field is required</p>}
          </div>
        </CardContent>
      </Card>

      {/* Reference Pages */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <Link className="h-5 w-5 text-[#0dadb7]" />
            <CardTitle className="text-base">Reference Pages</CardTitle>
          </div>
          <CardDescription>
            Provide the advertorial you want to rewrite, plus any additional pages the AI can draw from.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Reference Advertorial */}
            <div className="space-y-2">
              <Label htmlFor="lazy-advertorial-url">
                Advertorial URL <span className="text-destructive">*</span>
              </Label>
              <Input
                id="lazy-advertorial-url"
                type="url"
                placeholder="example.com/advertorial"
                className={cn(errors.advertorialUrl && "border-destructive")}
                value={data.advertorialUrl}
                onChange={(e) => {
                  updateData({ ...data, advertorialUrl: e.target.value })
                  clearError("advertorialUrl")
                }}
                onBlur={handleAdvertorialUrlBlur}
                aria-invalid={advertorialValidation?.status === "invalid"}
              />
              {advertorialValidation?.status === "validating" && (
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Checking URL...
                </p>
              )}
              {advertorialValidation?.status === "valid" && (
                <p className="flex items-center gap-1.5 text-xs text-green-600">
                  <CheckCircle2 className="h-3 w-3" />
                  URL is reachable
                </p>
              )}
              {advertorialValidation?.status === "invalid" && (
                <p className="flex items-center gap-1.5 text-xs text-destructive">
                  <AlertCircle className="h-3 w-3" />
                  {advertorialValidation.message || "URL is not reachable"}
                </p>
              )}
              {errors.advertorialUrl && !advertorialValidation && (
                <p className="text-sm text-destructive">A valid advertorial URL is required</p>
              )}
            </div>

            {/* Divider */}
            <div className="border-t border-border" />

            {/* Additional Links */}
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium">Additional Links <span className="text-xs font-normal text-muted-foreground">(optional)</span></p>
                <p className="text-sm text-muted-foreground mt-1">
                  Add other pages (e.g. product pages, competitor pages) the AI can use for context.
                </p>
              </div>
              {data.referenceUrls.map((ref, index) => {
                const validation = getUrlValidation(ref.url)
                return (
                  <div key={index} className="space-y-2">
                    <div className="flex items-start gap-2">
                      <div className="flex-1 space-y-2">
                        <div className="space-y-1">
                          <Label htmlFor={`lazy-url-${index}`} className="text-sm text-muted-foreground">
                            URL {index + 1}
                          </Label>
                          <Input
                            id={`lazy-url-${index}`}
                            type="url"
                            placeholder="example.com/product-page"
                            value={ref.url}
                            onChange={(e) => updateUrl(index, e.target.value)}
                            onBlur={() => handleUrlBlur(index)}
                            aria-invalid={validation?.status === "invalid"}
                          />
                          {validation?.status === "validating" && (
                            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Loader2 className="h-3 w-3 animate-spin" />
                              Checking URL...
                            </p>
                          )}
                          {validation?.status === "valid" && (
                            <p className="flex items-center gap-1.5 text-xs text-green-600">
                              <CheckCircle2 className="h-3 w-3" />
                              URL is reachable
                            </p>
                          )}
                          {validation?.status === "invalid" && (
                            <p className="flex items-center gap-1.5 text-xs text-destructive">
                              <AlertCircle className="h-3 w-3" />
                              {validation.message || "URL is not reachable"}
                            </p>
                          )}
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor={`lazy-desc-${index}`} className="text-sm text-muted-foreground">
                            Description <span className="text-xs font-normal">(optional)</span>
                          </Label>
                          <Input
                            id={`lazy-desc-${index}`}
                            type="text"
                            placeholder="e.g., product page, competitor listicle"
                            value={ref.description || ""}
                            onChange={(e) => updateDescription(index, e.target.value)}
                            className="text-sm"
                          />
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="mt-6 text-muted-foreground hover:text-destructive shrink-0"
                        onClick={() => removeUrlField(index)}
                      >
                        <X className="h-4 w-4" />
                        <span className="sr-only">Remove URL</span>
                      </Button>
                    </div>
                  </div>
                )
              })}
              <Button variant="outline" size="sm" className="gap-2 bg-transparent" onClick={addUrlField}>
                <Plus className="h-4 w-4" />
                Add a link
              </Button>
            </div>
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
              <Label htmlFor="lazy-campaign-type">
                Campaign Type <span className="text-destructive">*</span>
              </Label>
              <Select
                value={data.campaignType}
                onValueChange={(v) => {
                  updateData({ ...data, campaignType: v })
                  clearError("campaignType")
                }}
              >
                <SelectTrigger id="lazy-campaign-type" className={cn(errors.campaignType && "border-destructive")}>
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
              <Label htmlFor="lazy-niche">
                Campaign Niche <span className="text-destructive">*</span>
              </Label>
              <Select
                value={data.niche}
                onValueChange={(v) => {
                  updateData({ ...data, niche: v })
                  clearError("niche")
                }}
              >
                <SelectTrigger id="lazy-niche" className={cn(errors.niche && "border-destructive")}>
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
              <Label htmlFor="lazy-country">
                Country <span className="text-destructive">*</span>
              </Label>
              <Select
                value={data.country}
                onValueChange={(v) => {
                  updateData({ ...data, country: v })
                  clearError("country")
                }}
              >
                <SelectTrigger id="lazy-country" className={cn(errors.country && "border-destructive")}>
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
              <Label htmlFor="lazy-language">
                Language <span className="text-destructive">*</span>
              </Label>
              <Select
                value={data.language}
                onValueChange={(v) => {
                  updateData({ ...data, language: v })
                  clearError("language")
                }}
              >
                <SelectTrigger id="lazy-language" className={cn(errors.language && "border-destructive")}>
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

      {/* Content & Style + Compliance */}
      <div className="grid gap-6 lg:grid-cols-2">
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
                <Label htmlFor="lazy-length">
                  Length (words) {!data.keepOriginalLength && <span className="text-destructive">*</span>}
                </Label>
                <Input
                  id="lazy-length"
                  type="number"
                  placeholder="e.g., 1500"
                  className={cn(errors.length && "border-destructive")}
                  value={data.length}
                  disabled={data.keepOriginalLength}
                  onChange={(e) => {
                    updateData({ ...data, length: e.target.value })
                    clearError("length")
                  }}
                />
                {errors.length && <p className="text-sm text-destructive">Required</p>}
                <label className="flex items-center gap-2 cursor-pointer select-none pt-1">
                  <input
                    type="checkbox"
                    checked={data.keepOriginalLength}
                    onChange={(e) => {
                      updateData({
                        ...data,
                        keepOriginalLength: e.target.checked,
                        length: e.target.checked ? "" : data.length,
                      })
                      if (e.target.checked) clearError("length")
                    }}
                    className="h-3.5 w-3.5 rounded border-border text-[#4644B6] focus:ring-[#4644B6]"
                  />
                  <span className="text-xs text-muted-foreground">Keep original length</span>
                </label>
              </div>

                <div className="space-y-2 flex-1 min-w-[180px]">
                  <Label htmlFor="lazy-paragraph-length">
                    Paragraph Length <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={data.paragraphLength}
                    onValueChange={(v) => {
                      updateData({ ...data, paragraphLength: v })
                      clearError("paragraphLength")
                    }}
                  >
                    <SelectTrigger id="lazy-paragraph-length" className={cn(errors.paragraphLength && "border-destructive")}>
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
              <Label htmlFor="lazy-guidelines">
                Client Guidelines <span className="text-destructive">*</span>
              </Label>
              <Select
                value={data.guidelines}
                onValueChange={(v) => {
                  updateData({
                    ...data,
                    guidelines: v,
                    customGuidelines: v === "Custom" ? data.customGuidelines : undefined,
                  })
                  clearError("guidelines")
                  clearError("customGuidelines")
                }}
              >
                <SelectTrigger id="lazy-guidelines" className={cn(errors.guidelines && "border-destructive")}>
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
                  <Label htmlFor="lazy-custom-guidelines">
                    Custom Guidelines <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="lazy-custom-guidelines"
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
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button
          onClick={handleNext}
          disabled={!hasValidAdvertorialUrl || hasValidationError || isValidatingUrls}
          size="lg"
          className="bg-[#4644B6] hover:bg-[#3a38a0]"
        >
          Review
        </Button>
      </div>
    </div>
  )
}
