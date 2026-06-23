'use client'

import { useState, useCallback } from 'react'
import { searchProduct, extractNutrients } from '@/lib/openfoodfacts'
import type { MacroFood } from '@/types'

interface CacheEntry {
  food: MacroFood
  timestamp: number
}

const CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours
const cache = new Map<string, CacheEntry>()

export function useOFFFoodSearch() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const search = useCallback(async (query: string): Promise<MacroFood | null> => {
    if (!query.trim()) return null

    // Check cache first
    const cacheKey = query.toLowerCase()
    const cached = cache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.food
    }

    setLoading(true)
    setError(null)

    try {
      const product = await searchProduct(query)

      if (!product) {
        setError('Produto não encontrado. Tente criar manualmente.')
        return null
      }

      const nutrients = extractNutrients(product)
      const food: MacroFood = {
        id: crypto.randomUUID(),
        name: product.product_name || query,
        kcalPer100g: nutrients.kcalPer100g,
        proteinPer100g: nutrients.proteinPer100g,
        carbsPer100g: nutrients.carbsPer100g,
        fatPer100g: nutrients.fatPer100g,
      }

      // Cache the result
      cache.set(cacheKey, { food, timestamp: Date.now() })

      return food
    } catch (err) {
      console.error('Erro ao buscar na Open Food Facts:', err)
      setError('Erro ao conectar à API. Verifique sua conexão.')
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const clearCache = useCallback(() => {
    cache.clear()
  }, [])

  return { search, loading, error, clearCache }
}
