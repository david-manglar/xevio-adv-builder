import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cleanUrl, ensureProtocol } from '@/lib/url-utils'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { lazyModeData, userId } = body

    if (!lazyModeData || !userId) {
      return NextResponse.json({ error: 'Missing required data' }, { status: 400 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const advertorialUrl = ensureProtocol(cleanUrl(lazyModeData.advertorialUrl || ''))
    if (!advertorialUrl) {
      return NextResponse.json({ error: 'Advertorial URL is required' }, { status: 400 })
    }

    const additionalLinks = (lazyModeData.referenceUrls || [])
      .filter((ref: any) => ref?.url && ref.url.trim() !== '')
      .map((ref: any) => ({
        url: ensureProtocol(cleanUrl(ref.url)),
        description: ref.description?.trim() || null,
      }))

    const referenceUrls = [
      { url: advertorialUrl, description: 'Reference advertorial' },
      ...additionalLinks,
    ]

    const lengthValue = lazyModeData.keepOriginalLength ? 'keep_original' : lazyModeData.length

    // Require n8n webhook URL before creating campaign (avoids orphan campaigns in "generating")
    const webhookUrl = process.env.N8N_LAZY_MODE_WEBHOOK_URL
    if (!webhookUrl) {
      console.error(
        '[Lazy Mode] N8N_LAZY_MODE_WEBHOOK_URL is not set. Set this env var in production so the n8n workflow is triggered.'
      )
      return NextResponse.json(
        {
          error: 'Lazy generation is not configured. Please set N8N_LAZY_MODE_WEBHOOK_URL on the server.',
        },
        { status: 503 }
      )
    }

    // Create campaign record
    const { data: campaign, error: dbError } = await supabase
      .from('campaigns')
      .insert({
        user_id: userId,
        mode: 'lazy',
        topic: lazyModeData.instructions,
        campaign_type: lazyModeData.campaignType,
        niche: lazyModeData.niche,
        country: lazyModeData.country,
        language: lazyModeData.language,
        length: lengthValue,
        paragraph_length: lazyModeData.paragraphLength,
        guidelines: lazyModeData.guidelines,
        reference_urls: referenceUrls,
        status: 'generating',
      })
      .select()
      .single()

    if (dbError) {
      console.error('Supabase Error:', dbError)
      return NextResponse.json({ error: 'Failed to create campaign' }, { status: 500 })
    }

    // Trigger n8n webhook (webhookUrl already checked above)
    // MUST be awaited — on Vercel the lambda is killed after the response is sent,
    // so a fire-and-forget fetch would be silently aborted.
    const webhookSecret = process.env.N8N_WEBHOOK_SECRET
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (webhookSecret) {
        headers['X-Webhook-Secret'] = webhookSecret
      }

      const webhookPayload = {
        campaignId: campaign.id,
        instructions: lazyModeData.instructions,
        advertorialUrl,
        additionalLinks,
        referenceUrls,
        campaignType: lazyModeData.campaignType,
        niche: lazyModeData.niche,
        country: lazyModeData.country,
        language: lazyModeData.language,
        length: lengthValue,
        paragraphLength: lazyModeData.paragraphLength,
        guidelines: lazyModeData.guidelines,
        customGuidelines: lazyModeData.customGuidelines || null,
      }

      const webhookResponse = await fetch(webhookUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(webhookPayload),
      })

      if (!webhookResponse.ok) {
        console.error('n8n lazy mode webhook returned error:', webhookResponse.status, await webhookResponse.text())
      }
    } catch (webhookError) {
      console.error('Failed to trigger n8n lazy mode webhook:', webhookError)
    }

    return NextResponse.json({ success: true, campaignId: campaign.id })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
