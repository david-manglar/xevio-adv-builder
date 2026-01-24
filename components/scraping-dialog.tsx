"use client"

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog"
import { Spinner } from "@/components/ui/spinner"
import { useEffect, useState } from "react"

interface ScrapingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCancel?: () => void
  variant?: "scraping" | "finalizing"
}

interface ScrapingDialogMessages {
  title: string
  description: string
  messages: string[]
}

// Default messages for initial scraping (Step 2)
const defaultMessages: ScrapingDialogMessages = {
  title: "Analyzing Content",
  description: "Your reference pages are being scraped and analyzed. This can take a couple of minutes.",
  messages: [
    "Initializing smart scraper...",
    "Reading your reference pages...",
    "Analyzing tone of voice and style...",
    "Extracting key benefits and USPs...",
    "Identifying pain points and solutions...",
    "Structuring insights for your brief...",
    "Finalizing analysis..."
  ]
}

// Messages for when user reaches Insights before scraping is done
const finalizingMessages: ScrapingDialogMessages = {
  title: "Finalizing Analysis",
  description: "We're wrapping up the analysis of your reference pages. This should only take a moment.",
  messages: [
    "Almost there...",
    "Processing final details...",
    "Organizing your insights...",
    "Just a few more seconds...",
    "Preparing your data...",
    "Nearly ready..."
  ]
}

export function ScrapingDialog({ open, onOpenChange, onCancel, variant = "scraping" }: ScrapingDialogProps) {
  const [messageIndex, setMessageIndex] = useState(0)
  
  const content = variant === "finalizing" ? finalizingMessages : defaultMessages

  // Cycle through messages to keep the user engaged
  useEffect(() => {
    if (!open) {
      setMessageIndex(0)
      return
    }

    const interval = setInterval(() => {
      setMessageIndex((prev) => {
        // If we reach the last message, stay there
        if (prev >= content.messages.length - 1) return prev
        return prev + 1
      })
    }, variant === "finalizing" ? 3000 : 4500) // Faster cycling for finalizing variant

    return () => clearInterval(interval)
  }, [open, content.messages.length, variant])

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-[425px]">
        <AlertDialogHeader>
          <div className="flex flex-col items-center justify-center gap-6 py-6">
            {/* Shadcn Spinner */}
            <Spinner className="h-12 w-12 text-[#0dadb7]" />

            <div className="space-y-2 text-center">
              <AlertDialogTitle className="text-xl">{content.title}</AlertDialogTitle>
              <AlertDialogDescription className="mx-auto max-w-[280px]">
                {content.description}
              </AlertDialogDescription>
            </div>
            
            {/* Dynamic Status Message */}
            <div className="min-h-[24px] flex items-center justify-center">
              <p className="text-sm font-medium text-[#0dadb7] animate-pulse text-center transition-all duration-500">
                {content.messages[messageIndex]}
              </p>
            </div>
          </div>
        </AlertDialogHeader>
        
        {onCancel && (
          <AlertDialogFooter className="sm:justify-center">
            <AlertDialogCancel onClick={onCancel} className="mt-2 text-muted-foreground hover:text-foreground">
              Cancel
            </AlertDialogCancel>
          </AlertDialogFooter>
        )}
      </AlertDialogContent>
    </AlertDialog>
  )
}
