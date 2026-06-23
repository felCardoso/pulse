'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePulseStore } from '@/store/pulse-store'

interface Props {
  onFoodAdded: (foodId: string) => void
}

export default function ManualFoodForm({ onFoodAdded }: Props) {
  const [mode, setMode] = useState<'create' | 'search'>('create')
  const [name, setName] = useState('')
  const [kcal, setKcal] = useState('')
  const [protein, setProtein] = useState('')
  const [carbs, setCarbs] = useState('')
  const [fat, setFat] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)

  const addFood = usePulseStore((s) => s.addFood)

  const handleCreate = () => {
    if (!name || !kcal || !protein || !carbs || !fat) return

    const food = addFood({
      name,
      kcalPer100g: parseFloat(kcal),
      proteinPer100g: parseFloat(protein),
      carbsPer100g: parseFloat(carbs),
      fatPer100g: parseFloat(fat),
    })

    onFoodAdded(food.id)
    setName('')
    setKcal('')
    setProtein('')
    setCarbs('')
    setFat('')
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    setLoading(true)
    setSearchError(null)

    try {
      // First, try barcode search
      let response = await fetch(
        `https://world.openfoodfacts.org/api/v0/product/${searchQuery}.json`
      )
      const barcodeData = (await response.json()) as {
        product?: {
          product_name?: string
          nutriments?: Record<string, number>
        }
        status?: number
      }

      // If barcode found, use it
      if (barcodeData.product && barcodeData.status !== 0) {
        const product = barcodeData.product
        const nutrients = product.nutriments || {}

        const food = addFood({
          name: product.product_name || searchQuery,
          kcalPer100g: nutrients['energy-kcal_100g'] || nutrients['energy-kcal'] || 0,
          proteinPer100g: nutrients['proteins_100g'] || nutrients['proteins'] || 0,
          carbsPer100g: nutrients['carbohydrates_100g'] || nutrients['carbohydrates'] || 0,
          fatPer100g: nutrients['fat_100g'] || nutrients['fat'] || 0,
        })

        onFoodAdded(food.id)
        setSearchQuery('')
        return
      }

      // If barcode not found, search by name
      response = await fetch(
        `https://world.openfoodfacts.org/api/v3/foods?query=${encodeURIComponent(searchQuery)}&page_size=1`
      )
      const nameData = (await response.json()) as {
        foods?: Array<{
          product_name?: string
          nutriments?: Record<string, number>
        }>
      }

      if (!nameData.foods || nameData.foods.length === 0) {
        setSearchError('Produto não encontrado. Tente criar manualmente.')
        return
      }

      const product = nameData.foods[0]
      const nutrients = product.nutriments || {}

      const food = addFood({
        name: product.product_name || searchQuery,
        kcalPer100g: nutrients['energy-kcal'] || 0,
        proteinPer100g: nutrients['proteins'] || 0,
        carbsPer100g: nutrients['carbohydrates'] || 0,
        fatPer100g: nutrients['fat'] || 0,
      })

      onFoodAdded(food.id)
      setSearchQuery('')
    } catch (err) {
      console.error('Erro ao buscar na Open Food Facts:', err)
      setSearchError('Erro ao conectar à API. Verifique sua conexão.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Mode toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setMode('create')}
          className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            mode === 'create'
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
          }`}
        >
          Criar manual
        </button>
        <button
          onClick={() => setMode('search')}
          className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            mode === 'search'
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
          }`}
        >
          Buscar API
        </button>
      </div>

      {mode === 'create' ? (
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">
              Nome do alimento
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ex: Wrap Rap10"
              className="w-full px-3 py-2 rounded-lg border border-border bg-secondary text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">
                kcal/100g
              </label>
              <input
                type="number"
                value={kcal}
                onChange={(e) => setKcal(e.target.value)}
                placeholder="200"
                className="w-full px-3 py-2 rounded-lg border border-border bg-secondary text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">
                Proteína/100g
              </label>
              <input
                type="number"
                step="0.1"
                value={protein}
                onChange={(e) => setProtein(e.target.value)}
                placeholder="15"
                className="w-full px-3 py-2 rounded-lg border border-border bg-secondary text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">
                Carbs/100g
              </label>
              <input
                type="number"
                step="0.1"
                value={carbs}
                onChange={(e) => setCarbs(e.target.value)}
                placeholder="30"
                className="w-full px-3 py-2 rounded-lg border border-border bg-secondary text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">
                Gordura/100g
              </label>
              <input
                type="number"
                step="0.1"
                value={fat}
                onChange={(e) => setFat(e.target.value)}
                placeholder="5"
                className="w-full px-3 py-2 rounded-lg border border-border bg-secondary text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          <Button onClick={handleCreate} className="w-full">
            Salvar alimento
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Busque por código de barras ou nome do produto na Open Food Facts
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="ex: Rap10 ou código de barras"
              className="flex-1 px-3 py-2 rounded-lg border border-border bg-secondary text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            />
            <Button
              onClick={handleSearch}
              disabled={loading || !searchQuery.trim()}
              size="sm"
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>
          {loading && <p className="text-xs text-muted-foreground">Buscando...</p>}
          {searchError && <p className="text-xs text-destructive">{searchError}</p>}
        </div>
      )}
    </div>
  )
}
