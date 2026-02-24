import { NextResponse } from 'next/server'
import { cleanUrl, ensureProtocol } from '@/lib/url-utils'

export async function POST(request: Request) {
  try {
    const { url } = await request.json()

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ reachable: false, error: 'No URL provided' }, { status: 400 })
    }

    const cleaned = cleanUrl(url)
    const withProtocol = ensureProtocol(cleaned)

    try {
      const parsed = new URL(withProtocol)
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        return NextResponse.json({ reachable: false, error: 'URL must use HTTP or HTTPS' })
      }
    } catch {
      return NextResponse.json({ reachable: false, error: 'Invalid URL format' })
    }

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10_000)

    try {
      let response = await fetch(withProtocol, {
        method: 'HEAD',
        signal: controller.signal,
        redirect: 'follow',
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; URLValidator/1.0)' },
      })

      if (response.status === 405 || response.status === 403) {
        response = await fetch(withProtocol, {
          method: 'GET',
          signal: controller.signal,
          redirect: 'follow',
          headers: { 'User-Agent': 'Mozilla/5.0 (compatible; URLValidator/1.0)' },
        })
      }

      clearTimeout(timeout)

      const reachable = response.ok
      return NextResponse.json({
        reachable,
        status: response.status,
        error: reachable ? null : `URL returned status ${response.status}`,
      })
    } catch (fetchError: unknown) {
      clearTimeout(timeout)

      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        return NextResponse.json({ reachable: false, error: 'Request timed out' })
      }

      return NextResponse.json({ reachable: false, error: 'URL is unreachable' })
    }
  } catch {
    return NextResponse.json({ reachable: false, error: 'Validation failed' }, { status: 500 })
  }
}
