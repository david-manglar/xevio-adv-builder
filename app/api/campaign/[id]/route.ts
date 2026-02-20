import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json({ error: 'Campaign ID is required' }, { status: 400 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Fetch complete campaign details
    const { data: campaign, error } = await supabase
      .from('campaigns')
      .select(`
        id,
        topic,
        campaign_type,
        niche,
        country,
        language,
        length,
        paragraph_length,
        guidelines,
        reference_urls,
        selected_insights,
        structure_blocks,
        generated_content,
        doc_name,
        status,
        created_at,
        mode
      `)
      .eq('id', id)
      .single()

    if (error) {
      console.error('Supabase Error:', error)
      return NextResponse.json({ error: 'Failed to fetch campaign' }, { status: 500 })
    }

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    // Format the response
    const formattedCampaign = {
      id: campaign.id,
      topic: campaign.topic || '',
      campaignType: campaign.campaign_type || '',
      niche: campaign.niche || '',
      country: campaign.country || '',
      language: campaign.language || '',
      length: campaign.length || '',
      paragraphLength: campaign.paragraph_length || '',
      guidelines: campaign.guidelines || '',
      referenceUrls: campaign.reference_urls || [],
      selectedInsights: campaign.selected_insights || {},
      structureBlocks: campaign.structure_blocks || [],
      generatedContent: campaign.generated_content || '',
      docName: campaign.doc_name || '',
      status: campaign.status || '',
      createdAt: campaign.created_at || '',
      mode: campaign.mode ?? null,
    }

    return NextResponse.json({ campaign: formattedCampaign })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
