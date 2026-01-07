"use client"

import { Loader2, FileText, CheckCircle2, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface StepGeneratingProps {
  onComplete: () => void
  status: 'generating' | 'completed'
  documentUrl?: string
  documentName?: string
  topic?: string
}

export function StepGenerating({ onComplete, status = 'generating', documentUrl, documentName, topic }: StepGeneratingProps) {
  
  if (status === 'generating') {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="relative mb-8">
          <div className="absolute inset-0 rounded-full bg-[#4644B6]/20 animate-ping" />
          <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-[#4644B6]">
            <Loader2 className="h-10 w-10 text-white animate-spin" />
          </div>
        </div>
        <h2 className="text-xl font-semibold text-foreground mb-2">Generating Your Advertorial</h2>
        <p className="text-muted-foreground text-center max-w-md">Be patient, the writer is working on it...</p>
        <div className="mt-8 flex items-center gap-2 text-sm text-muted-foreground">
          <FileText className="h-4 w-4" />
          <span>Creating content for: {topic ? (topic.length > 40 ? topic.substring(0, 40) + '...' : topic) : 'New Campaign'}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="mb-8">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#0dadb7]">
          <CheckCircle2 className="h-10 w-10 text-white" />
        </div>
      </div>
      <h2 className="text-2xl font-semibold text-foreground mb-2">Advertorial Ready!</h2>
      <p className="text-muted-foreground text-center max-w-md mb-8">
        Your advertorial has been generated and is ready for review in Google Docs.
      </p>

      <Card className="w-full max-w-md border-[#0dadb7]/30 bg-[#0dadb7]/5">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-white border border-border">
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none">
                <path
                  d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z"
                  stroke="#4285F4"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path d="M14 2V8H20" stroke="#4285F4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M8 13H16" stroke="#4285F4" strokeWidth="2" strokeLinecap="round" />
                <path d="M8 17H16" stroke="#4285F4" strokeWidth="2" strokeLinecap="round" />
                <path d="M8 9H10" stroke="#4285F4" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground">{documentName || "Generated Advertorial"}</p>
              <p className="text-sm text-muted-foreground mt-0.5">Google Docs</p>
              <p className="text-xs text-muted-foreground mt-1">Created just now</p>
            </div>
          </div>

          <Button className="w-full mt-4 bg-[#4644B6] hover:bg-[#3a38a0]" asChild>
            <a
              href={documentUrl || "#"}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Open in Google Docs
            </a>
          </Button>
        </CardContent>
      </Card>

      <Button variant="outline" className="mt-6 bg-transparent" onClick={onComplete}>
        Create Another Advertorial
      </Button>
    </div>
  )
}
