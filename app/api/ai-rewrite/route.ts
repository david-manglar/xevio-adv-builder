import { NextResponse } from 'next/server'

interface RewriteRequestBody {
  campaignId?: string
  selectedText: string
  fullArticleHtml: string
  instruction: string
  campaignContext: {
    topic: string
    niche: string
    language: string
    guidelines: string
    customGuidelines: string
    paragraphLength: string
    campaignType?: string
    country?: string
  }
}

export async function POST(request: Request) {
  try {
    const body: RewriteRequestBody = await request.json()
    const { selectedText, fullArticleHtml, instruction, campaignContext } = body

    if (!selectedText || !instruction) {
      return NextResponse.json(
        { error: 'Selected text and instruction are required' },
        { status: 400 }
      )
    }

    const apiKey = process.env.OPENROUTER_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OpenRouter API key not configured' },
        { status: 500 }
      )
    }

    // Strip HTML tags from the full article to provide text context
    const fullArticleText = fullArticleHtml.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()

    // Build the system prompt with campaign context
    const systemPrompt = buildSystemPrompt(campaignContext)

    const userPrompt = `Here is the full advertorial for context:
---
${fullArticleText.substring(0, 6000)}
---

Here is the specific section I need you to rewrite:
---
${selectedText}
---

Instruction: ${instruction}

Return ONLY the rewritten text. Do not include any explanation, commentary, or markdown formatting. Just the rewritten text itself.`

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://xevio.app',
        'X-Title': 'Xevio Advertorial Builder',
      },
      body: JSON.stringify({
        model: 'anthropic/claude-sonnet-4.6',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('OpenRouter Error:', errorData)
      return NextResponse.json(
        { error: 'Failed to generate rewrite' },
        { status: 502 }
      )
    }

    const data = await response.json()
    const rewrittenText = data.choices?.[0]?.message?.content?.trim()

    if (!rewrittenText) {
      return NextResponse.json(
        { error: 'No rewrite generated' },
        { status: 502 }
      )
    }

    return NextResponse.json({ rewrittenText })

  } catch (error) {
    console.error('AI Rewrite Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

function buildSystemPrompt(context: RewriteRequestBody['campaignContext']): string {
  const parts = [
    'You are an expert advertorial copywriter helping to refine a specific section of an advertorial.',
    '',
    'PRIORITY: The user\'s instruction is your primary directive. Follow it precisely — if they say "expand", write more. If they say "shorten", write less. If they say "rewrite completely", do so. The instruction overrides any other preference.',
    '',
    'CONSISTENCY: Your rewrite must match the tone, style, and voice of the surrounding article. Read the full article context carefully before rewriting.',
  ]

  if (context.language) {
    parts.push(`\nLANGUAGE: Write entirely in ${context.language}.`)
  }

  // Campaign background — informational, not constraining
  const background: string[] = []
  if (context.campaignType) background.push(`Type: ${context.campaignType}`)
  if (context.niche) background.push(`Niche: ${context.niche}`)
  if (context.country) background.push(`Target market: ${context.country}`)
  if (context.topic) background.push(`Brief: ${context.topic}`)

  if (background.length > 0) {
    parts.push(`\nCAMPAIGN CONTEXT (for background, not as constraints):\n${background.join('\n')}`)
  }

  // Compliance guidelines ARE hard constraints
  if (context.guidelines === 'ERGO') {
    parts.push('\nCOMPLIANCE (hard constraint): Follow ERGO guidelines — no medical claims, no guaranteed results, include disclaimers where needed.')
  } else if (context.guidelines === 'Custom' && context.customGuidelines) {
    parts.push(`\nCOMPLIANCE (hard constraint): ${context.customGuidelines}`)
  }

  parts.push('\nReturn ONLY the rewritten text. No explanation, no commentary, no markdown formatting.')

  return parts.join('\n')
}
