"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Globe, FileText, Shield, Lightbulb } from "lucide-react"

interface StepOneProps {
  onNext: () => void
}

export function StepOne({ onNext }: StepOneProps) {
  const [formData, setFormData] = useState({
    topic: "How UK residents can save up to 40% on dental care with the right insurance plan",
    campaignType: "Lead Generation",
    niche: "Finance/Insurance",
    country: "United Kingdom",
    language: "English",
    length: "1500",
    paragraphLength: "Normal (3-4 lines)",
    guidelines: "None",
  })

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
              className="min-h-[120px] resize-y"
              value={formData.topic}
              onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
            />
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
                value={formData.campaignType}
                onValueChange={(v) => setFormData({ ...formData, campaignType: v })}
              >
                <SelectTrigger id="campaign-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Lead Generation">Lead Generation</SelectItem>
                  <SelectItem value="E-commerce">E-commerce</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="niche">
                Campaign Niche <span className="text-destructive">*</span>
              </Label>
              <Select value={formData.niche} onValueChange={(v) => setFormData({ ...formData, niche: v })}>
                <SelectTrigger id="niche">
                  <SelectValue />
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">
                Country <span className="text-destructive">*</span>
              </Label>
              <Select value={formData.country} onValueChange={(v) => setFormData({ ...formData, country: v })}>
                <SelectTrigger id="country">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="United States">United States</SelectItem>
                  <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                  <SelectItem value="Canada">Canada</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="language">
                Language <span className="text-destructive">*</span>
              </Label>
              <Select value={formData.language} onValueChange={(v) => setFormData({ ...formData, language: v })}>
                <SelectTrigger id="language">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="English">English</SelectItem>
                </SelectContent>
              </Select>
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
                  value={formData.length}
                  onChange={(e) => setFormData({ ...formData, length: e.target.value })}
                />
              </div>

              <div className="space-y-2 flex-1 min-w-[180px]">
                <Label htmlFor="paragraph-length">
                  Paragraph Length <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.paragraphLength}
                  onValueChange={(v) => setFormData({ ...formData, paragraphLength: v })}
                >
                  <SelectTrigger id="paragraph-length">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Very Short (1 sentence)">Very Short (1 sentence)</SelectItem>
                    <SelectItem value="Short (1-3 lines)">Short (1-3 lines)</SelectItem>
                    <SelectItem value="Normal (3-4 lines)">Normal (3-4 lines)</SelectItem>
                    <SelectItem value="Long (4-6 lines)">Long (4-6 lines)</SelectItem>
                  </SelectContent>
                </Select>
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
              <Label htmlFor="guidelines">Client Guidelines</Label>
              <Select value={formData.guidelines} onValueChange={(v) => setFormData({ ...formData, guidelines: v })}>
                <SelectTrigger id="guidelines">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="None">None</SelectItem>
                  <SelectItem value="ERGO">ERGO</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Navigation */}
      <div className="flex justify-end pt-4">
        <Button onClick={onNext} size="lg" className="bg-[#4644B6] hover:bg-[#3a38a0]">
          Continue to Product Info
        </Button>
      </div>
    </div>
  )
}
