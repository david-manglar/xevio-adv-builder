import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

interface ScrapeRequestBody {
  stepOneData: {
    topic: string
    campaignType: string
    niche: string
    country: string
    language: string
    length: string
    paragraphLength: string
    guidelines: string
    customGuidelines?: string
  }
  stepTwoData: {
    referenceUrls: Array<{ url: string; description?: string } | string>
  }
  userId: string
  campaignId?: string        // Existing campaign to update
  newUrlsOnly?: string[]     // Only scrape these URLs (incremental)
  isFullRescrape?: boolean   // Clear existing results first
}

export async function POST(request: Request) {
  try {
    const body: ScrapeRequestBody = await request.json()
    const { stepOneData, stepTwoData, userId, campaignId, newUrlsOnly, isFullRescrape } = body

    // 1. Validate data
    const validUrls = stepTwoData?.referenceUrls?.filter((ref: any) => {
      const url = typeof ref === 'string' ? ref : ref?.url
      return url && url.trim() !== ''
    }) || []
    
    if (validUrls.length === 0) {
      return NextResponse.json({ error: 'No reference URLs provided' }, { status: 400 })
    }

    // 2. Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Prepare URLs with descriptions
    const urlsWithContext = validUrls.map((ref: any) => {
      if (typeof ref === 'string') {
        return { url: ref.trim(), description: null }
      }
      return { 
        url: ref.url.trim(), 
        description: ref.description?.trim() || null 
      }
    })

    let finalCampaignId: string
    let existingInsights: any = null

    // 3. Handle different scraping modes
    if (campaignId && !isFullRescrape && newUrlsOnly && newUrlsOnly.length > 0) {
      // INCREMENTAL SCRAPE: Only scrape new URLs and append to existing
      
      // Fetch existing campaign to get current scraping_result
      const { data: existingCampaign, error: fetchError } = await supabase
        .from('campaigns')
        .select('scraping_result')
        .eq('id', campaignId)
        .single()
      
      if (fetchError) {
        console.error('Error fetching existing campaign:', fetchError)
        return NextResponse.json({ error: 'Failed to fetch existing campaign' }, { status: 500 })
      }
      
      existingInsights = existingCampaign?.scraping_result || null

      // Update campaign with new URLs and set status to scraping
      const { error: updateError } = await supabase
        .from('campaigns')
        .update({
          reference_urls: urlsWithContext,
          status: 'scraping',
          // Update Step 1 data in case it changed (though for incremental it shouldn't)
          topic: stepOneData.topic,
          campaign_type: stepOneData.campaignType,
          niche: stepOneData.niche,
          country: stepOneData.country,
          language: stepOneData.language,
          length: stepOneData.length,
          paragraph_length: stepOneData.paragraphLength,
          guidelines: stepOneData.guidelines,
        })
        .eq('id', campaignId)

      if (updateError) {
        console.error('Supabase Update Error:', updateError)
        return NextResponse.json({ error: 'Failed to update campaign' }, { status: 500 })
      }

      finalCampaignId = campaignId

    } else if (campaignId && isFullRescrape) {
      // FULL RE-SCRAPE: Clear existing results and scrape all URLs again
      
      const { error: updateError } = await supabase
        .from('campaigns')
        .update({
          reference_urls: urlsWithContext,
          scraping_result: null, // Clear existing results
          status: 'scraping',
          // Update Step 1 data
          topic: stepOneData.topic,
          campaign_type: stepOneData.campaignType,
          niche: stepOneData.niche,
          country: stepOneData.country,
          language: stepOneData.language,
          length: stepOneData.length,
          paragraph_length: stepOneData.paragraphLength,
          guidelines: stepOneData.guidelines,
        })
        .eq('id', campaignId)

      if (updateError) {
        console.error('Supabase Update Error:', updateError)
        return NextResponse.json({ error: 'Failed to update campaign' }, { status: 500 })
      }

      finalCampaignId = campaignId

    } else {
      // NEW CAMPAIGN: Create fresh campaign record
      
      const { data: campaign, error: dbError } = await supabase
        .from('campaigns')
        .insert({
          user_id: userId,
          topic: stepOneData.topic,
          campaign_type: stepOneData.campaignType,
          niche: stepOneData.niche,
          country: stepOneData.country,
          language: stepOneData.language,
          length: stepOneData.length,
          paragraph_length: stepOneData.paragraphLength,
          guidelines: stepOneData.guidelines,
          reference_urls: urlsWithContext,
          status: 'scraping'
        })
        .select()
        .single()

      if (dbError) {
        console.error('Supabase Error:', dbError)
        return NextResponse.json({ error: 'Failed to create campaign' }, { status: 500 })
      }

      finalCampaignId = campaign.id
    }

    // 4. Trigger n8n Webhook
    const n8nWebhookUrl = process.env.N8N_SCRAPE_WEBHOOK_URL
    const n8nWebhookSecret = process.env.N8N_WEBHOOK_SECRET
    
    if (n8nWebhookUrl) {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (n8nWebhookSecret) {
        headers['X-Webhook-Secret'] = n8nWebhookSecret
      }

      // Determine which URLs to send to n8n
      const urlsToScrape = newUrlsOnly && newUrlsOnly.length > 0
        ? urlsWithContext.filter(u => newUrlsOnly.includes(u.url.toLowerCase().replace(/\/+$/, '')))
        : urlsWithContext

      // Determine scraping mode for n8n
      const mode = (newUrlsOnly && newUrlsOnly.length > 0 && !isFullRescrape) 
        ? 'incremental' 
        : 'full'

      // Fire-and-forget: Trigger n8n webhook without blocking the API response
      // This allows the user to proceed immediately while scraping happens in background
      fetch(n8nWebhookUrl, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
          campaignId: finalCampaignId,
          urls: urlsToScrape,
          mode: mode,
          // Include existing insights for incremental mode so n8n can merge
          existingInsights: mode === 'incremental' ? existingInsights : null,
          context: {
            topic: stepOneData.topic,
            niche: stepOneData.niche,
            campaignType: stepOneData.campaignType,
            country: stepOneData.country,
            language: stepOneData.language,
            guidelines: stepOneData.guidelines
          }
        })
      }).catch((error) => {
        // Log error but don't block - scraping will be retried if needed
        console.error('Failed to trigger n8n webhook:', error)
      })
    } else {
      console.warn('N8N_SCRAPE_WEBHOOK_URL is not defined')
    }

    return NextResponse.json({ success: true, campaignId: finalCampaignId })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
