"use client"

import { X, FileText, ExternalLink, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"

interface HistoryMenuProps {
  isOpen: boolean
  onClose: () => void
}

// Hardcoded previous requests for demo
const previousRequests = [
  {
    id: 1,
    title: "Dental Insurance - UK",
    niche: "Finance/Insurance",
    country: "United Kingdom",
    createdAt: "Dec 8, 2025 - 14:32",
    docUrl: "https://docs.google.com/document/d/dental-insurance-uk",
  },
  {
    id: 2,
    title: "Weight Loss Supplements - US",
    niche: "Weight Loss",
    country: "United States",
    createdAt: "Dec 6, 2025 - 09:15",
    docUrl: "https://docs.google.com/document/d/weight-loss-us",
  },
  {
    id: 3,
    title: "Home Security System - CA",
    niche: "Tech/Gadgets",
    country: "Canada",
    createdAt: "Dec 4, 2025 - 16:48",
    docUrl: "https://docs.google.com/document/d/home-security-ca",
  },
]

export function HistoryMenu({ isOpen, onClose }: HistoryMenuProps) {
  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />

      {/* Side Panel */}
      <div className="fixed top-0 right-0 h-full w-[400px] max-w-[90vw] bg-card border-l border-border shadow-xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-[#0dadb7]" />
            <h2 className="text-lg font-semibold">Request History</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Request List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {previousRequests.map((request) => (
            <div key={request.id} className="bg-[#F6F6F6] rounded-lg p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-[#0dadb7] shrink-0" />
                  <span className="font-medium text-sm">{request.title}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <div>
                  Niche: <span className="text-foreground">{request.niche}</span>
                </div>
                <div>
                  Country: <span className="text-foreground">{request.country}</span>
                </div>
                <div className="col-span-2">
                  Created: <span className="text-foreground">{request.createdAt}</span>
                </div>
              </div>

              <a
                href={request.docUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-[#4644B6] hover:underline font-medium"
              >
                <ExternalLink className="h-4 w-4" />
                Open Google Doc
              </a>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
