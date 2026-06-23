'use client'

import { useState, useCallback } from 'react'
import { searchProducts, extractNutrients, productLabel } from '@/lib/openfoodfacts'
import type { MacroFood } from '@/types'

const CACHE_DURATION = 6 * 60 * 60 * 1000 // 6 hours
const cache = new Map<string, { foods: MacroFood[]; timestamp: number }>()

export function useOFFFoodSearch() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [results, setResults] = useState<MacroFood[]>([])

  const search = useCallback(async (query: string): Promise<MacroFood[]> => {
    const trimmed = query.trim()
    if (!trimmed) return []

    const cacheKey = trimmed.toLowerCase()
    const cached = cache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      setResults(cached.foods)
      return cached.foods
    }

    setLoading(true)
    setError(null)
    setResults([])

    try {
      const products = await searchProducts(trimmed)

      if (products.length === 0) {
        setError('Nenhum produto encontrado. Tente criar manualmente.')
        return []
      }

      const seen = new Set<string>()
      const foods: MacroFood[] = []
      for (const p of products) {
        const n = extractNutrients(p)
        const name = productLabel(p)
        // Dedupe by normalized name + macros so the same product (often
        // returned multiple times by OFF) only appears once.
        const key = `${name.toLowerCase().trim()}|${n.kcalPer100g}|${n.proteinPer100g}|${n.carbsPer100g}|${n.fatPer100g}`
        if (seen.has(key)) continue
        seen.add(key)
        foods.push({
          id: crypto.randomUUID(),
          name,
          kcalPer100g: n.kcalPer100g,
          proteinPer100g: n.proteinPer100g,
          carbsPer100g: n.carbsPer100g,
          fatPer100g: n.fatPer100g,
        })
      }

      cache.set(cacheKey, { foods, timestamp: Date.now() })
      setResults(foods)
      return foods
    } catch (err) {
      console.error('Erro ao buscar na Open Food Facts:', err)
      setError('Erro ao conectar à API. Verifique sua conexão.')
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  const reset = useCallback(() => {
    setResults([])
    setError(null)
  }, [])

  return { search, loading, error, results, reset }
}
