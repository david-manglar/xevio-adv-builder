"use client"

import { useState, useEffect } from "react"
import { X, FileText, ExternalLink, Clock, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface HistoryMenuProps {
  isOpen: boolean
  onClose: () => void
  userId: string | null
}

interface CampaignHistory {
  id: string
  title: string
  campaignType: string
  niche: string
  country: string
  createdAt: string
  docUrl: string
}

export function HistoryMenu({ isOpen, onClose, userId }: HistoryMenuProps) {
  const [campaigns, setCampaigns] = useState<CampaignHistory[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const [total, setTotal] = useState(0)
  const [offset, setOffset] = useState(0)

  // Fetch history when menu opens
  useEffect(() => {
    if (isOpen && userId) {
      fetchHistory(true)
    }
  }, [isOpen, userId])

  // Reset state when menu closes
  useEffect(() => {
    if (!isOpen) {
      setCampaigns([])
      setOffset(0)
      setHasMore(false)
      setTotal(0)
    }
  }, [isOpen])

  const fetchHistory = async (reset: boolean = false) => {
    if (!userId) return

    const currentOffset = reset ? 0 : offset
    
    if (reset) {
      setIsLoading(true)
    } else {
      setIsLoadingMore(true)
    }

    try {
      const response = await fetch(`/api/history?userId=${userId}&offset=${currentOffset}`)
      const data = await response.json()

      if (response.ok) {
        if (reset) {
          setCampaigns(data.campaigns)
        } else {
          setCampaigns((prev) => [...prev, ...data.campaigns])
        }
        setHasMore(data.hasMore)
        setTotal(data.total)
        setOffset(currentOffset + data.campaigns.length)
      } else {
        console.error('Failed to fetch history:', data.error)
      }
    } catch (error) {
      console.error('Error fetching history:', error)
    } finally {
      setIsLoading(false)
      setIsLoadingMore(false)
    }
  }

  const handleLoadMore = () => {
    fetchHistory(false)
  }

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
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-[#0dadb7]" />
              <p className="text-sm text-muted-foreground mt-2">Loading history...</p>
            </div>
          ) : campaigns.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="h-10 w-10 text-muted-foreground/40 mb-3" />
              <p className="text-sm font-medium text-muted-foreground">No completed campaigns yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                Your generated advertorials will appear here
              </p>
            </div>
          ) : (
            <>
              {campaigns.map((campaign) => (
                <div key={campaign.id} className="bg-[#F6F6F6] rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-[#0dadb7] shrink-0" />
                      <span className="font-medium text-sm">{campaign.title}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <div>
                      Type: <span className="text-foreground">{campaign.campaignType}</span>
                    </div>
                    <div>
                      Niche: <span className="text-foreground">{campaign.niche}</span>
                    </div>
                    <div>
                      Country: <span className="text-foreground">{campaign.country}</span>
                    </div>
                    <div>
                      Created: <span className="text-foreground">{campaign.createdAt}</span>
                    </div>
                  </div>

                  <a
                    href={campaign.docUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-[#4644B6] hover:underline font-medium"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Open Google Doc
                  </a>
                </div>
              ))}

              {/* Load More Button */}
              {hasMore && (
                <div className="pt-2">
                  <Button
                    variant="outline"
                    className="w-full bg-transparent"
                    onClick={handleLoadMore}
                    disabled={isLoadingMore}
                  >
                    {isLoadingMore ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      `Load More (${campaigns.length} of ${total})`
                    )}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  )
}
