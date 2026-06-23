import { NextRequest, NextResponse } from 'next/server'

const API_BASE = 'https://world.openfoodfacts.org/api/v3'
const USER_AGENT = 'Pulse-Workout-App/1.0 (https://github.com/felCardoso/pulse)'

// Cache responses in memory (server-side)
const responseCache = new Map<string, { data: unknown; timestamp: number }>()
const CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours

async function fetchWithCache(url: string) {
  const cacheKey = url
  const cached = responseCache.get(cacheKey)

  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data
  }

  // Add delay to respect rate limit (1 req/sec)
  await new Promise(resolve => setTimeout(resolve, 1000))

  const response = await fetch(url, {
    headers: {
      'User-Agent': USER_AGENT,
      'Accept': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`)
  }

  const data = await response.json()
  responseCache.set(cacheKey, { data, timestamp: Date.now() })

  return data
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
      const url = `${API_BASE}/products/${barcode}`
      const data = await fetchWithCache(url)

      return NextResponse.json({
        product: data.product || null,
        source: 'barcode',
      })
    }

    if (query) {
      // Name search
      const url = new URL(`${API_BASE}/search`)
      url.searchParams.set('q', query)
      url.searchParams.set('page_size', '5')
      url.searchParams.set('fields', 'product_name,nutriments,code')

      const data = await fetchWithCache(url.toString())

      return NextResponse.json({
        products: data.products || [],
        count: data.count || 0,
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
