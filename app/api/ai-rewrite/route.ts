import { NextResponse } from 'next/server'

interface SelectionContext {
  nodeType: string
  headingLevel?: number
  hasPlaceholders: boolean
  isPlaceholderOnly: boolean
  activeMarks?: string[]
  charCount?: number
  sentenceCount?: number
}

interface RewriteRequestBody {
  campaignId?: string
  selectedText: string
  selectedHtml?: string
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
  selectionContext?: SelectionContext
}

export async function POST(request: Request) {
  try {
    const body: RewriteRequestBody = await request.json()
    const { selectedText, selectedHtml, fullArticleHtml, instruction, campaignContext, selectionContext } = body

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

    // Build the system prompt with campaign context and selection context
    const systemPrompt = buildSystemPrompt(campaignContext, selectionContext)

    // Use HTML for the selected section so the LLM can see formatting
    const selectedContent = selectedHtml || selectedText

    const userPrompt = `Here is the full advertorial for context:
---
${fullArticleText.substring(0, 6000)}
---

Here is the specific section I need you to rewrite (in HTML):
---
${selectedContent}
---

Instruction: ${instruction}

Return ONLY the rewritten HTML. Preserve the HTML structure (paragraphs as <p>, headings as <h1>/<h2>/<h3>, bold as <strong>, italic as <em>, lists as <ul>/<ol> with <li>). Do not include any explanation, commentary, or markdown. Just the rewritten HTML.`

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
    let rewrittenHtml = data.choices?.[0]?.message?.content?.trim()

    if (!rewrittenHtml) {
      return NextResponse.json(
        { error: 'No rewrite generated' },
        { status: 502 }
      )
    }

    // Strip markdown code fences if the LLM wrapped the HTML in them
    rewrittenHtml = rewrittenHtml.replace(/^```html?\n?/i, '').replace(/\n?```$/i, '').trim()

    return NextResponse.json({ rewrittenHtml })

  } catch (error) {
    console.error('AI Rewrite Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

function buildSystemPrompt(context: RewriteRequestBody['campaignContext'], selectionContext?: SelectionContext): string {
  const parts = [
    'You are an expert advertorial copywriter helping to refine a specific section of an advertorial.',
    '',
    'PRIORITY: The user\'s instruction is your primary directive. Follow it precisely — if they say "expand", write more. If they say "shorten", write less. If they say "rewrite completely", do so. The instruction overrides any other preference.',
    '',
    'CONSISTENCY: Your rewrite must match the tone, style, and voice of the surrounding article. Read the full article context carefully before rewriting.',
    '',
    'OUTPUT FORMAT: Return valid HTML only. Use <p> for paragraphs, <strong> for bold, <em> for italic, <h1>/<h2>/<h3> for headings, <ul>/<ol> with <li> for lists. Preserve the same HTML structure as the original — if the input has 3 paragraphs, the output should have roughly 3 paragraphs. Do not wrap the output in a container div.',
  ]

  // Formatting context based on selection node type
  if (selectionContext) {
    if (selectionContext.isPlaceholderOnly) {
      parts.push('\nFORMATTING: The selected text is a placeholder token (e.g. [IMAGE: description] or [CTA BUTTON: text]). The user wants a new idea for this placeholder. Return your response in the exact same bracket format: [TYPE: new description]. Do not change the type, only the description inside.')
    } else {
      if (selectionContext.nodeType === 'heading') {
        parts.push(`\nFORMATTING: The selected text is a heading (level ${selectionContext.headingLevel}). Keep your rewrite short and punchy — it must work as a heading, not a paragraph. Return it as a single <h${selectionContext.headingLevel}> tag.`)
      } else if (selectionContext.nodeType === 'bulletList' || selectionContext.nodeType === 'orderedList') {
        parts.push(`\nFORMATTING: The selected text is part of a ${selectionContext.nodeType === 'bulletList' ? 'bullet' : 'numbered'} list. Return your rewrite as list items within the appropriate list tag — do not merge into a single paragraph.`)
      }

      if (selectionContext.hasPlaceholders) {
        parts.push('\nPLACEHOLDERS: The selected text contains placeholder tokens in [BRACKETS] like [IMAGE: ...] or [CTA BUTTON: ...]. Preserve these tokens exactly as-is in your rewrite — do not modify, remove, or rephrase them. Only change them if the user\'s instruction specifically asks you to.')
      }

      // Length matching — only when not a placeholder-only selection
      if (selectionContext.charCount && selectionContext.sentenceCount) {
        let lengthHint = `\nLENGTH: The original text is ~${selectionContext.charCount} characters and ~${selectionContext.sentenceCount} sentence(s).`
        if (context.paragraphLength) {
          lengthHint += ` The user's preferred paragraph length is "${context.paragraphLength}".`
        }
        lengthHint += ` Match the original length closely unless the user's instruction explicitly asks to make it longer or shorter.`
        parts.push(lengthHint)
      }
    }
  }

  if (context.language) {
    parts.push(`\nLANGUAGE (critical): The advertorial content is written in ${context.language}. Your rewrite MUST be in ${context.language}. The user's instruction may also be in ${context.language} — interpret it in that language. Do not translate to English. This system prompt is in English for technical reasons only — all your output must be in ${context.language}.`)
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

  parts.push('\nReturn ONLY the rewritten HTML. No explanation, no commentary, no markdown code fences.')

  return parts.join('\n')
}
