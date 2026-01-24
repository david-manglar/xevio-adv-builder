import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { campaignId, stepOneData, stepTwoData, stepThreeData, stepFourData, stepFiveData } = body

    if (!campaignId) {
      return NextResponse.json({ error: 'Campaign ID is required' }, { status: 400 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // 1. Update campaign status to 'generating'
    const { error: updateError } = await supabase
      .from('campaigns')
      .update({ status: 'generating' })
      .eq('id', campaignId)

    if (updateError) {
      console.error('Supabase Error:', updateError)
      return NextResponse.json({ error: 'Failed to update campaign status' }, { status: 500 })
    }

    // 2. Build clean payload with final/edited values from Step 5
    const finalSettings = stepFiveData?.campaignData || {}
    
    // Extract only selected insights from Step 3
    const selectedInsights: Record<string, string[]> = {}
    if (stepThreeData?.data) {
      for (const [category, items] of Object.entries(stepThreeData.data)) {
        const selected = (items as any[])
          .filter((item: any) => item.selected)
          .map((item: any) => item.text)
        if (selected.length > 0) {
          selectedInsights[category] = selected
        }
      }
    }

    // Build structure blocks with their inputs (position is 1-indexed for clarity)
    const structureBlocks = (stepFourData?.blocks || []).map((block: any, index: number) => ({
      position: index + 1,
      name: block.name,
      inputValue: block.inputValue || null,
      selectValue: block.selectValue || null,
    }))

    // Clean payload for n8n
    const webhookPayload = {
      campaignId,
      
      // Final campaign settings (edited in Step 5, or original from Step 1)
      topic: stepFiveData?.topic || stepOneData?.topic,
      campaignType: finalSettings.campaignType || stepOneData?.campaignType,
      niche: finalSettings.niche || stepOneData?.niche,
      country: finalSettings.country || stepOneData?.country,
      language: finalSettings.language || stepOneData?.language,
      length: finalSettings.length || stepOneData?.length,
      paragraphLength: finalSettings.paragraphLength || stepOneData?.paragraphLength,
      guidelines: finalSettings.guidelines || stepOneData?.guidelines,

      // Reference URLs from Step 2 (with descriptions)
      referenceUrls: (stepTwoData?.referenceUrls || [])
        .filter((ref: any) => {
          const url = typeof ref === 'string' ? ref : ref?.url
          return url && url.trim() !== ''
        })
        .map((ref: any) => {
          if (typeof ref === 'string') {
            return { url: ref.trim(), description: null }
          }
          return { 
            url: ref.url.trim(), 
            description: ref.description?.trim() || null 
          }
        }),

      // Only selected insights from Step 3
      selectedInsights,

      // Ordered structure blocks from Step 4
      structureBlocks,
    }

    // 3. Trigger n8n webhook
    const webhookUrl = process.env.N8N_GENERATE_WEBHOOK_URL
    const webhookSecret = process.env.N8N_WEBHOOK_SECRET

    if (!webhookUrl) {
      console.warn('N8N_GENERATE_WEBHOOK_URL not set')
    } else {
      try {
        const headers: Record<string, string> = { 'Content-Type': 'application/json' }
        if (webhookSecret) {
          headers['X-Webhook-Secret'] = webhookSecret
        }

        console.log('Calling n8n generate webhook:', webhookUrl)
        
        const response = await fetch(webhookUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify(webhookPayload)
        })

        console.log('n8n webhook response status:', response.status)
        
        if (!response.ok) {
          console.error('n8n webhook returned error:', response.status, await response.text())
        }
      } catch (webhookError) {
        console.error('Webhook Error:', webhookError)
      }
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

