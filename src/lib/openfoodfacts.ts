// Open Food Facts API v3.6 integration via Next.js API proxy
// This avoids CORS issues by routing through /api/search-food

interface Product {
  code?: string
  product_name?: string
  nutriments?: {
    [key: string]: number
  }
  nutriment_energy_unit?: string
  nutrient_levels?: Record<string, string>
}

export async function searchProductByBarcode(barcode: string): Promise<Product | null> {
  try {
    const response = await fetch(`/api/search-food?barcode=${barcode}`)

    if (!response.ok) return null

    const data = (await response.json()) as {
      product?: Product | null
      error?: string
    }

    return data.product || null
  } catch (err) {
    console.error('Erro ao buscar por código de barras:', err)
    return null
  }
}

export async function searchProductByName(query: string): Promise<Product[]> {
  try {
    const response = await fetch(
      `/api/search-food?q=${encodeURIComponent(query)}`
    )

    if (!response.ok) return []

    const data = (await response.json()) as {
      products?: Product[]
      error?: string
    }

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
  const results = await searchProductByName(query)
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
