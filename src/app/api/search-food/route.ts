import { NextRequest, NextResponse } from 'next/server'

const API_BASES = [
  'https://world.openfoodfacts.org/api/v3',
  'https://br.openfoodfacts.org/api/v3', // Brazil mirror
]
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Pulse-App'

// Cache responses in memory (server-side)
const responseCache = new Map<string, { data: unknown; timestamp: number }>()
const CACHE_DURATION = 6 * 60 * 60 * 1000 // 6 hours (reduced from 24h)
let lastRequestTime = 0

async function fetchWithRetry(url: string, maxRetries = 3): Promise<unknown> {
  let lastError: Error | null = null

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // Respect rate limit: min 500ms between requests
      const timeSinceLastRequest = Date.now() - lastRequestTime
      if (timeSinceLastRequest < 500) {
        await new Promise(resolve =>
          setTimeout(resolve, 500 - timeSinceLastRequest)
        )
      }

      lastRequestTime = Date.now()

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10s timeout

      const response = await fetch(url, {
        headers: {
          'User-Agent': USER_AGENT,
          'Accept': 'application/json',
          'Accept-Language': 'pt-BR,pt;q=0.9',
        },
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        // 503/429 = rate limit/service unavailable, retry
        if (response.status === 503 || response.status === 429) {
          const delay = Math.pow(2, attempt) * 1000 // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, delay))
          continue
        }
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err))

      // Retry on network errors but not on parsing errors
      if (
        lastError.message.includes('fetch') ||
        lastError.message.includes('timeout') ||
        lastError.message.includes('503') ||
        lastError.message.includes('429')
      ) {
        if (attempt < maxRetries - 1) {
          const delay = Math.pow(2, attempt) * 1000
          await new Promise(resolve => setTimeout(resolve, delay))
          continue
        }
      } else {
        // Non-retryable error
        throw lastError
      }
    }
  }

  throw lastError || new Error('Max retries exceeded')
}

async function fetchWithCacheAndRetry(url: string) {
  const cacheKey = url
  const cached = responseCache.get(cacheKey)

  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data
  }

  // Try each API base if URL fails
  for (const base of API_BASES) {
    const apiUrl = url.replace(API_BASES[0], base)
    try {
      const data = await fetchWithRetry(apiUrl)
      responseCache.set(cacheKey, { data, timestamp: Date.now() })
      return data
    } catch (err) {
      console.error(`Failed with ${base}:`, err)
      // Try next mirror
      continue
    }
  }

  throw new Error('All API mirrors failed')
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get('q')
  const barcode = searchParams.get('barcode')

  if (!query && !barcode) {
    return NextResponse.json(
      { error: 'Missing query or barcode parameter' },
      { status: 400 }
    )
  }

  try {
    if (barcode && /^\d{8,14}$/.test(barcode)) {
      // Barcode search
      const url = `${API_BASES[0]}/products/${barcode}`
      const data = await fetchWithCacheAndRetry(url)

      return NextResponse.json({
        product: (data as Record<string, unknown>).product || null,
        source: 'barcode',
      })
    }

    if (query) {
      // Name search
      const url = new URL(`${API_BASES[0]}/search`)
      url.searchParams.set('q', query)
      url.searchParams.set('page_size', '5')
      url.searchParams.set('fields', 'product_name,nutriments,code')

      const data = await fetchWithCacheAndRetry(url.toString())

      return NextResponse.json({
        products: ((data as Record<string, unknown>).products as unknown[]) || [],
        count: (data as Record<string, unknown>).count || 0,
        source: 'name',
      })
    }

    return NextResponse.json(
      { error: 'Invalid parameters' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Food search API error:', error)

    return NextResponse.json(
      {
        error: 'Failed to fetch from Open Food Facts API',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 503 }
    )
  }
}

// Clear cache endpoint (optional, for maintenance)
export async function POST(request: NextRequest) {
  const { action } = (await request.json()) as { action?: string }

  if (action === 'clear-cache') {
    responseCache.clear()
    return NextResponse.json({ message: 'Cache cleared' })
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}
