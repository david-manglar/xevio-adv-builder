import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { campaignId } = body

    if (!campaignId) {
      return NextResponse.json({ error: 'Campaign ID is required' }, { status: 400 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.SUPABASE_SECRET_KEY!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // 1. Fetch campaign to get the latest editor content (or generated HTML as fallback)
    const { data: campaign, error: fetchError } = await supabase
      .from('campaigns')
      .select('editor_content, generated_html, doc_name')
      .eq('id', campaignId)
      .single()

    if (fetchError || !campaign) {
      console.error('Failed to fetch campaign:', fetchError)
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    const htmlContent = campaign.editor_content || campaign.generated_html
    if (!htmlContent) {
      return NextResponse.json({ error: 'No content available to export' }, { status: 400 })
    }

    // 2. Trigger n8n Google Doc Creator webhook
    const webhookUrl = process.env.N8N_DEV_CREATE_DOC_WEBHOOK_URL || process.env.N8N_CREATE_DOC_WEBHOOK_URL
    const webhookSecret = process.env.N8N_WEBHOOK_SECRET

    if (!webhookUrl) {
      console.warn('N8N_CREATE_DOC_WEBHOOK_URL not set')
      return NextResponse.json({ error: 'Google Doc export is not configured' }, { status: 500 })
    }

    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (webhookSecret) {
      headers['X-Webhook-Secret'] = webhookSecret
    }

    const webhookPayload = {
      campaignId,
      htmlContent,
      documentName: campaign.doc_name,
    }

    console.log('Calling n8n Google Doc Creator webhook:', webhookUrl)

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(webhookPayload),
    })

    console.log('n8n webhook response status:', response.status)

    if (!response.ok) {
      console.error('n8n webhook returned error:', response.status, await response.text())
      return NextResponse.json({ error: 'Failed to create Google Doc' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
