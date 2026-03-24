import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { campaignId, editorContent } = body

    if (!campaignId) {
      return NextResponse.json({ error: 'Campaign ID is required' }, { status: 400 })
    }

    if (!editorContent) {
      return NextResponse.json({ error: 'Editor content is required' }, { status: 400 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.SUPABASE_SECRET_KEY!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const { error: dbError } = await supabase
      .from('campaigns')
      .update({ editor_content: editorContent })
      .eq('id', campaignId)

    if (dbError) {
      console.error('Supabase Error:', dbError)
      return NextResponse.json({ error: 'Failed to save editor content' }, { status: 500 })
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
