import { NextRequest, NextResponse } from 'next/server'

// Open Food Facts API integration (server-side proxy to avoid CORS).
//
// Endpoints used (all documented & stable):
//  - Barcode lookup:  GET /api/v2/product/{barcode}.json  -> { status, product }
//  - Name search (new): https://search.openfoodfacts.org/search?q=...  -> { hits: [...] }
//  - Name search (legacy fallback): /cgi/search.pl?search_terms=...&json=1 -> { products: [...] }
//
// NOTE: there is NO /api/v3/search endpoint — that was the source of the 503s.

const USER_AGENT =
  'Pulse-Workout-App/1.0 (https://github.com/felCardoso/pulse; pcardoso.felipe@gmail.com)'

const FIELDS = 'product_name,nutriments,code,brands'

interface Product {
  code?: string
  product_name?: string
  brands?: string
  nutriments?: Record<string, number>
}

// In-memory cache (per serverless instance).
const responseCache = new Map<string, { products: Product[]; timestamp: number }>()
const CACHE_DURATION = 6 * 60 * 60 * 1000 // 6 hours

let lastRequestTime = 0

async function rateLimitedFetch(url: string): Promise<Response> {
  const sinceLast = Date.now() - lastRequestTime
  if (sinceLast < 400) {
    await new Promise((r) => setTimeout(r, 400 - sinceLast))
  }
  lastRequestTime = Date.now()

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 9000)
  try {
    return await fetch(url, {
      headers: {
        'User-Agent': USER_AGENT,
        Accept: 'application/json',
      },
      signal: controller.signal,
    })
  } finally {
    clearTimeout(timeout)
  }
}

async function lookupByBarcode(barcode: string): Promise<Product[]> {
  const url = `https://world.openfoodfacts.org/api/v2/product/${barcode}.json?fields=${FIELDS}`
  const res = await rateLimitedFetch(url)
  if (!res.ok) throw new Error(`barcode ${res.status}`)
  const data = (await res.json()) as { status?: number; product?: Product }
  return data.status === 1 && data.product ? [data.product] : []
}

// Modern search service (search.openfoodfacts.org). Returns { hits: [...] }.
async function searchAlicious(query: string): Promise<Product[]> {
  const url =
    `https://search.openfoodfacts.org/search?q=${encodeURIComponent(query)}` +
    `&page_size=10&fields=${FIELDS}`
  const res = await rateLimitedFetch(url)
  if (!res.ok) throw new Error(`alicious ${res.status}`)
  const data = (await res.json()) as { hits?: Product[] }
  return data.hits ?? []
}

// Legacy CGI search — slower but very reliable. Returns { products: [...] }.
async function searchLegacy(query: string): Promise<Product[]> {
  const url =
    `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}` +
    `&search_simple=1&action=process&json=1&page_size=10&fields=${FIELDS}`
  const res = await rateLimitedFetch(url)
  if (!res.ok) throw new Error(`legacy ${res.status}`)
  const data = (await res.json()) as { products?: Product[] }
  return data.products ?? []
}

async function searchByName(query: string): Promise<Product[]> {
  // Try modern search first, fall back to legacy CGI if it fails.
  try {
    const hits = await searchAlicious(query)
    if (hits.length > 0) return hits
  } catch (err) {
    console.error('Search-a-licious failed, falling back:', err)
  }
  return searchLegacy(query)
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams
  const query = params.get('q')?.trim()
  const barcode = params.get('barcode')?.trim()

  if (!query && !barcode) {
    return NextResponse.json(
      { error: 'Missing query or barcode parameter' },
      { status: 400 }
    )
  }

  const cacheKey = barcode ? `bc:${barcode}` : `q:${query!.toLowerCase()}`
  const cached = responseCache.get(cacheKey)
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return NextResponse.json({ products: cached.products, cached: true })
  }

  try {
    let products: Product[] = []

    if (barcode && /^\d{8,14}$/.test(barcode)) {
      products = await lookupByBarcode(barcode)
    } else if (query) {
      // A numeric query is likely a barcode.
      if (/^\d{8,14}$/.test(query)) {
        products = await lookupByBarcode(query)
      }
      if (products.length === 0) {
        products = await searchByName(query)
      }
    }

    // Keep only products that actually have usable nutrition data.
    products = products.filter(
      (p) => p.nutriments && Object.keys(p.nutriments).length > 0
    )

    responseCache.set(cacheKey, { products, timestamp: Date.now() })

    return NextResponse.json({ products })
  } catch (error) {
    console.error('Food search API error:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch from Open Food Facts API',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 502 }
    )
  }
}
