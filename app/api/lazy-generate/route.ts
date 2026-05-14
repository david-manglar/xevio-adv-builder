import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { campaignId, model } = body

    if (!campaignId) {
      return NextResponse.json({ error: 'Missing campaignId' }, { status: 400 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.SUPABASE_SECRET_KEY!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // 1. Read campaign from Supabase
    const { data: campaign, error: fetchError } = await supabase
      .from('campaigns')
      .select('scraping_result, topic, campaign_type, niche, country, language, length, paragraph_length, guidelines, custom_guidelines, llm_model')
      .eq('id', campaignId)
      .single()

    if (fetchError || !campaign) {
      console.error('Error fetching campaign:', fetchError)
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    // 2. Validate scraping_result exists
    if (!campaign.scraping_result) {
      return NextResponse.json(
        { error: 'Scraping results not available yet. Wait for scraping to complete.' },
        { status: 409 }
      )
    }

    // 3. Update campaign status and model
    const { error: updateError } = await supabase
      .from('campaigns')
      .update({
        status: 'generating',
        ...(model ? { llm_model: model } : {}),
      })
      .eq('id', campaignId)

    if (updateError) {
      console.error('Error updating campaign:', updateError)
      return NextResponse.json({ error: 'Failed to update campaign' }, { status: 500 })
    }

    // 4. Trigger lazy writer webhook
    const webhookUrl = process.env.N8N_DEV_LAZY_MODE_WEBHOOK_URL || process.env.N8N_LAZY_MODE_WEBHOOK_URL
    if (!webhookUrl) {
      console.error('[Lazy Generate] N8N_LAZY_MODE_WEBHOOK_URL is not set.')
      return NextResponse.json(
        { error: 'Lazy generation is not configured. Please set N8N_LAZY_MODE_WEBHOOK_URL on the server.' },
        { status: 503 }
      )
    }

    const webhookSecret = process.env.N8N_WEBHOOK_SECRET
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (webhookSecret) {
      headers['X-Webhook-Secret'] = webhookSecret
    }

    const webhookPayload = {
      campaignId,
      instructions: campaign.topic,
      campaignType: campaign.campaign_type,
      niche: campaign.niche,
      country: campaign.country,
      language: campaign.language,
      length: campaign.length,
      paragraphLength: campaign.paragraph_length,
      guidelines: campaign.guidelines,
      customGuidelines: campaign.custom_guidelines || null,
      model: model || campaign.llm_model || 'anthropic/claude-sonnet-4.6',
      advertorial: campaign.scraping_result.advertorial,
      references: campaign.scraping_result.references,
    }

    try {
      const webhookResponse = await fetch(webhookUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(webhookPayload),
      })

      if (!webhookResponse.ok) {
        console.error('n8n lazy writer webhook returned error:', webhookResponse.status, await webhookResponse.text())
      }
    } catch (webhookError) {
      console.error('Failed to trigger n8n lazy writer webhook:', webhookError)
    }

    return NextResponse.json({ success: true, campaignId })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
