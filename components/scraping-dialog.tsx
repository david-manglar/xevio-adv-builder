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
  onCancel: () => void
}

// Customize these messages to change the "story" told during loading
const loadingMessages = [
  "Initializing smart scraper...",
  "Reading your reference pages...",
  "Analyzing tone of voice and style...",
  "Extracting key benefits and USPs...",
  "Identifying pain points and solutions...",
  "Structuring insights for your brief...",
  "Finalizing analysis..."
]

export function ScrapingDialog({ open, onOpenChange, onCancel }: ScrapingDialogProps) {
  const [messageIndex, setMessageIndex] = useState(0)

  // Cycle through messages to keep the user engaged
  useEffect(() => {
    if (!open) {
      setMessageIndex(0)
      return
    }

    const interval = setInterval(() => {
      setMessageIndex((prev) => {
        // If we reach the last message, stay there
        if (prev >= loadingMessages.length - 1) return prev
        return prev + 1
      })
    }, 4500) // Change message every 4.5 seconds

    return () => clearInterval(interval)
  }, [open])

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-[425px]">
        <AlertDialogHeader>
          <div className="flex flex-col items-center justify-center gap-6 py-6">
            {/* Shadcn Spinner */}
            <Spinner className="h-12 w-12 text-[#0dadb7]" />

            <div className="space-y-2 text-center">
              <AlertDialogTitle className="text-xl">Analyzing Content</AlertDialogTitle>
              <AlertDialogDescription className="mx-auto max-w-[280px]">
                Your reference pages are being scraped and analyzed. This can take a couple of minutes.
              </AlertDialogDescription>
            </div>
            
            {/* Dynamic Status Message */}
            <div className="min-h-[24px] flex items-center justify-center">
              <p className="text-sm font-medium text-[#0dadb7] animate-pulse text-center transition-all duration-500">
                {loadingMessages[messageIndex]}
              </p>
            </div>
          </div>
        </AlertDialogHeader>
        
        <AlertDialogFooter className="sm:justify-center">
          <AlertDialogCancel onClick={onCancel} className="mt-2 text-muted-foreground hover:text-foreground">
            Cancel
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
