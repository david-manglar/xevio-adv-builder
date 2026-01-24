import { ReferenceUrl } from './types'

export type UrlChangeType = 'none' | 'additions_only' | 'structural'

export interface UrlChangeResult {
  changeType: UrlChangeType
  newUrls: string[]
}

/**
 * Normalize a URL for comparison by trimming whitespace and removing trailing slashes
 */
function normalizeUrl(url: string): string {
  return url.trim().replace(/\/+$/, '').toLowerCase()
}

/**
 * Extract URL strings from ReferenceUrl array
 */
export function extractUrls(referenceUrls: ReferenceUrl[]): string[] {
  return referenceUrls
    .map(ref => typeof ref === 'string' ? ref : ref?.url)
    .filter((url): url is string => !!url && url.trim() !== '')
    .map(normalizeUrl)
}

/**
 * Detect what type of URL changes occurred between current and scraped URLs
 * 
 * @param currentUrls - Array of current URLs entered by user
 * @param scrapedUrls - Array of URLs that were previously scraped
 * @returns Object with changeType and array of new URLs (for additions_only case)
 * 
 * Logic:
 * - 'none': Sets are identical, no changes needed
 * - 'additions_only': Current is a superset of scraped (only new URLs added)
 * - 'structural': URLs were deleted or modified, requires full re-scrape
 */
export function detectUrlChanges(
  currentUrls: string[],
  scrapedUrls: string[]
): UrlChangeResult {
  // Normalize all URLs for comparison
  const currentSet = new Set(currentUrls.map(normalizeUrl))
  const scrapedSet = new Set(scrapedUrls.map(normalizeUrl))

  // If both are empty or identical, no changes
  if (currentSet.size === 0 && scrapedSet.size === 0) {
    return { changeType: 'none', newUrls: [] }
  }

  // Check if sets are identical
  if (currentSet.size === scrapedSet.size) {
    const allMatch = [...currentSet].every(url => scrapedSet.has(url))
    if (allMatch) {
      return { changeType: 'none', newUrls: [] }
    }
  }

  // Check if all scraped URLs still exist in current (additions only)
  const allScrapedStillExist = [...scrapedSet].every(url => currentSet.has(url))
  
  if (allScrapedStillExist) {
    // Find new URLs (in current but not in scraped)
    const newUrls = [...currentSet].filter(url => !scrapedSet.has(url))
    
    if (newUrls.length > 0) {
      return { changeType: 'additions_only', newUrls }
    }
    
    // No new URLs and all scraped exist = no changes
    return { changeType: 'none', newUrls: [] }
  }

  // Some scraped URLs were removed or modified = structural change
  return { changeType: 'structural', newUrls: [] }
}

/**
 * Compare two StepOneState objects to detect if there are meaningful changes
 * that would affect scraping (context-related fields)
 */
export function hasStepOneChanges(
  current: { topic: string; niche: string; campaignType: string; country: string; language: string; guidelines: string },
  original: { topic: string; niche: string; campaignType: string; country: string; language: string; guidelines: string } | null | undefined
): boolean {
  if (!original) return false
  
  // Compare fields that affect scraping context
  return (
    current.topic !== original.topic ||
    current.niche !== original.niche ||
    current.campaignType !== original.campaignType ||
    current.country !== original.country ||
    current.language !== original.language ||
    current.guidelines !== original.guidelines
  )
}
