import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const ITEMS_PER_PAGE = 5

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const offset = parseInt(searchParams.get('offset') || '0', 10)

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Fetch completed campaigns for this user
    const { data: campaigns, error, count } = await supabase
      .from('campaigns')
      .select('id, doc_name, niche, country, campaign_type, created_at, generated_content, mode', { count: 'exact' })
      .eq('user_id', userId)
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
      .range(offset, offset + ITEMS_PER_PAGE - 1)

    if (error) {
      console.error('Supabase Error:', error)
      return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 })
    }

    // Parse and format the campaigns
    const formattedCampaigns = (campaigns || []).map((campaign) => ({
      id: campaign.id,
      title: parseProductName(campaign.doc_name),
      campaignType: campaign.campaign_type,
      niche: campaign.niche,
      country: campaign.country,
      createdAt: formatDate(campaign.created_at),
      docUrl: campaign.generated_content,
      mode: campaign.mode ?? null,
    }))

    return NextResponse.json({
      campaigns: formattedCampaigns,
      total: count || 0,
      hasMore: (offset + ITEMS_PER_PAGE) < (count || 0),
    })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

/**
 * Parse the product name from doc_name
 * Input: "ECOM - Hair Growth Solution - US - 07.01.2026"
 * Output: "Hair Growth Solution"
 */
function parseProductName(docName: string | null): string {
  if (!docName) return 'Untitled Campaign'
  
  const parts = docName.split(' - ')
  
  // If we have the expected format (TYPE - PRODUCT - COUNTRY - DATE)
  // Return the second part (product name)
  if (parts.length >= 2) {
    return parts[1].trim()
  }
  
  // Fallback: return the full name
  return docName
}

/**
 * Format date to readable string
 * Input: "2026-01-07T14:32:00Z"
 * Output: "Jan 7, 2026 - 14:32"
 */
function formatDate(dateString: string | null): string {
  if (!dateString) return 'Unknown date'
  
  const date = new Date(dateString)
  
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const month = months[date.getMonth()]
  const day = date.getDate()
  const year = date.getFullYear()
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  
  return `${month} ${day}, ${year} - ${hours}:${minutes}`
}

