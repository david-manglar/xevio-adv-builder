import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { stepOneData, stepTwoData, userId } = body

    // 1. Validate data
    if (!stepTwoData?.referenceUrls?.length || !stepTwoData.referenceUrls[0]) {
      return NextResponse.json({ error: 'No reference URLs provided' }, { status: 400 })
    }

    // 2. Initialize Supabase client
    // Note: In an API route, we could technically use the Service Role key if we needed to bypass RLS,
    // but using the Anon key acts as a standard user. 
    // If you encounter permission issues, we might need the Service Role key here.
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // 3. Create Campaign Record in Supabase
    const { data: campaign, error: dbError } = await supabase
      .from('campaigns')
      .insert({
        // User ID (links campaign to authenticated user)
        user_id: userId,

        // Step 1 Data
        topic: stepOneData.topic,
        campaign_type: stepOneData.campaignType,
        niche: stepOneData.niche,
        country: stepOneData.country,
        language: stepOneData.language,
        length: stepOneData.length,
        paragraph_length: stepOneData.paragraphLength,
        guidelines: stepOneData.guidelines,

        // Step 2 Data
        reference_urls: stepTwoData.referenceUrls.filter((u: string) => u.trim() !== ''),
        
        status: 'scraping' // Initial status
      })
      .select()
      .single()

    if (dbError) {
      console.error('Supabase Error:', dbError)
      return NextResponse.json({ error: 'Failed to create campaign' }, { status: 500 })
    }

    // 4. Trigger n8n Webhook (Fire and forget - mostly)
    // We don't await the full result, just the acknowledgement
    // Replace this URL with your actual n8n webhook URL
    const n8nWebhookUrl = process.env.N8N_SCRAPE_WEBHOOK_URL
    const n8nWebhookSecret = process.env.N8N_WEBHOOK_SECRET
    
    if (n8nWebhookUrl) {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (n8nWebhookSecret) {
        headers['X-Webhook-Secret'] = n8nWebhookSecret
      }

      // We don't await this fetch to prevent blocking, or we await it if it returns quickly.
      // Usually webhooks return 200 OK immediately.
      await fetch(n8nWebhookUrl, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
          campaignId: campaign.id,
          urls: campaign.reference_urls,
          context: {
            topic: stepOneData.topic,
            niche: stepOneData.niche,
            campaignType: stepOneData.campaignType,
            country: stepOneData.country,
            language: stepOneData.language,
            guidelines: stepOneData.guidelines
          }
        })
      })
    } else {
      console.warn('N8N_SCRAPE_WEBHOOK_URL is not defined')
    }

    return NextResponse.json({ success: true, campaignId: campaign.id })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

