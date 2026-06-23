// Open Food Facts client — talks to our own /api/search-food proxy
// (server-side proxy avoids CORS and handles barcode/name detection).

interface Product {
  code?: string
  product_name?: string
  // OFF returns brands inconsistently: usually a comma-separated string, but
  // sometimes an array (or missing). Keep it loose and coerce defensively.
  brands?: unknown
  nutriments?: {
    [key: string]: number
  }
}

export async function searchProducts(query: string): Promise<Product[]> {
  try {
    const response = await fetch(`/api/search-food?q=${encodeURIComponent(query)}`)
    if (!response.ok) return []

    const data = (await response.json()) as {
      products?: Product[]
      error?: string
    }

    return data.products ?? []
  } catch (err) {
    console.error('Erro ao buscar alimento:', err)
    return []
  }
}

export async function searchProduct(query: string): Promise<Product | null> {
  const results = await searchProducts(query)
  return results.length > 0 ? results[0] : null
}

export function extractNutrients(product: Product) {
  const nutrients = product.nutriments || {}

  // Nutrient keys vary by data source / region.
  const kcal =
    nutrients['energy-kcal_100g'] ||
    nutrients['energy-kcal'] ||
    nutrients['energy_kcal_100g'] ||
    nutrients['energy_kcal'] ||
    0

  const protein = nutrients['proteins_100g'] || nutrients['proteins'] || 0
  const carbs = nutrients['carbohydrates_100g'] || nutrients['carbohydrates'] || 0
  const fat = nutrients['fat_100g'] || nutrients['fat'] || 0

  return {
    kcalPer100g: Math.round(kcal),
    proteinPer100g: Math.round(protein * 10) / 10,
    carbsPer100g: Math.round(carbs * 10) / 10,
    fatPer100g: Math.round(fat * 10) / 10,
  }
}

export function productLabel(product: Product): string {
  const name = (typeof product.product_name === 'string' && product.product_name.trim())
    ? product.product_name.trim()
    : 'Sem nome'

  // brands may be a string, an array, or absent — normalize to first brand.
  let firstBrand = ''
  if (typeof product.brands === 'string') {
    firstBrand = product.brands.split(',')[0]?.trim() ?? ''
  } else if (Array.isArray(product.brands) && product.brands.length > 0) {
    firstBrand = String(product.brands[0]).trim()
  }

  return firstBrand ? `${name} (${firstBrand})` : name
}
