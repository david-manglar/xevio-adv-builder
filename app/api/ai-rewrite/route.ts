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
        model: 'anthropic/claude-sonnet-4-6',
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
    'Your rewrite must maintain consistency with the rest of the article in tone, style, and voice.',
  ]

  if (context.language) {
    parts.push(`The entire output must be in ${context.language}.`)
  }

  if (context.niche) {
    parts.push(`This advertorial is in the ${context.niche} niche.`)
  }

  if (context.topic) {
    parts.push(`The topic is: ${context.topic}`)
  }

  if (context.paragraphLength) {
    parts.push(`Target paragraph length: ${context.paragraphLength}.`)
  }

  if (context.guidelines === 'ERGO') {
    parts.push('Follow ERGO compliance guidelines: no medical claims, no guaranteed results, include disclaimers where needed.')
  } else if (context.guidelines === 'Custom' && context.customGuidelines) {
    parts.push(`Follow these custom guidelines: ${context.customGuidelines}`)
  }

  parts.push('Keep formatting minimal. Return plain text only, matching the style of the surrounding content.')

  return parts.join(' ')
}
