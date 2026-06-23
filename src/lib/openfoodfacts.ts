// Open Food Facts API v3.6 integration with rate limiting
// API Limits: 1 request/second max, 100 requests/minute recommended
// User-Agent required for proper rate limit handling

const API_BASE = 'https://world.openfoodfacts.org/api/v3'
const USER_AGENT = 'Pulse-Workout-App/1.0 (https://github.com/felCardoso/pulse)'
const MIN_REQUEST_INTERVAL = 1000 // 1 second between requests
let lastRequestTime = 0

interface Product {
  code?: string
  product_name?: string
  nutriments?: {
    [key: string]: number
  }
  nutriment_energy_unit?: string
  nutrient_levels?: Record<string, string>
}

interface SearchResponse {
  products?: Product[]
  page?: number
  page_size?: number
  count?: number
}

interface BarcodeResponse {
  product?: Product
  status?: number
  status_verbose?: string
}

async function rateLimitedFetch(url: string) {
  const now = Date.now()
  const timeSinceLastRequest = now - lastRequestTime

  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    await new Promise(resolve =>
      setTimeout(resolve, MIN_REQUEST_INTERVAL - timeSinceLastRequest)
    )
  }

  lastRequestTime = Date.now()

  return fetch(url, {
    headers: {
      'User-Agent': USER_AGENT,
      'Accept': 'application/json',
    },
  })
}

export async function searchProductByBarcode(barcode: string): Promise<Product | null> {
  try {
    const url = `${API_BASE}/products/${barcode}`
    const response = await rateLimitedFetch(url)

    if (!response.ok) return null

    const data = (await response.json()) as BarcodeResponse
    return data.product || null
  } catch (err) {
    console.error('Erro ao buscar por código de barras:', err)
    return null
  }
}

export async function searchProductByName(query: string, pageSize = 5): Promise<Product[]> {
  try {
    const url = new URL(`${API_BASE}/search`)
    url.searchParams.set('q', query)
    url.searchParams.set('page_size', pageSize.toString())
    url.searchParams.set('fields', 'product_name,nutriments,code')

    const response = await rateLimitedFetch(url.toString())

    if (!response.ok) return []

    const data = (await response.json()) as SearchResponse
    return data.products || []
  } catch (err) {
    console.error('Erro ao buscar por nome:', err)
    return []
  }
}

export async function searchProduct(query: string): Promise<Product | null> {
  // First try barcode search (faster, for numeric codes)
  if (/^\d{8,14}$/.test(query)) {
    const product = await searchProductByBarcode(query)
    if (product) return product
  }

  // Fall back to name search
  const results = await searchProductByName(query, 1)
  return results.length > 0 ? results[0] : null
}

export function extractNutrients(product: Product) {
  const nutrients = product.nutriments || {}

  // Try common nutrient keys (vary by region/data source)
  const kcal =
    nutrients['energy-kcal'] ||
    nutrients['energy_kcal'] ||
    nutrients['energy-kcal_100g'] ||
    nutrients['energy_kcal_100g'] ||
    0

  const protein =
    nutrients['proteins'] ||
    nutrients['proteins_100g'] ||
    0

  const carbs =
    nutrients['carbohydrates'] ||
    nutrients['carbohydrates_100g'] ||
    0

  const fat =
    nutrients['fat'] ||
    nutrients['fat_100g'] ||
    0

  return {
    kcalPer100g: Math.round(kcal),
    proteinPer100g: Math.round(protein * 10) / 10,
    carbsPer100g: Math.round(carbs * 10) / 10,
    fatPer100g: Math.round(fat * 10) / 10,
  }
}
