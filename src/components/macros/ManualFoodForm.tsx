'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePulseStore } from '@/store/pulse-store'
import { useOFFFoodSearch } from '@/hooks/useOFFFoodSearch'

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

  const addFood = usePulseStore((s) => s.addFood)
  const { search, loading, error: searchError, results, reset } = useOFFFoodSearch()

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
    await search(searchQuery)
  }

  const handlePickResult = (result: (typeof results)[number]) => {
    const addedFood = addFood({
      name: result.name,
      kcalPer100g: result.kcalPer100g,
      proteinPer100g: result.proteinPer100g,
      carbsPer100g: result.carbsPer100g,
      fatPer100g: result.fatPer100g,
    })
    onFoodAdded(addedFood.id)
    setSearchQuery('')
    reset()
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

          {results.length > 0 && (
            <div className="space-y-2 pt-1">
              <p className="text-xs text-muted-foreground">
                {results.length} resultado{results.length !== 1 ? 's' : ''} — toque para adicionar
              </p>
              {results.map((result) => (
                <button
                  key={result.id}
                  onClick={() => handlePickResult(result)}
                  className="w-full text-left p-3 rounded-lg border border-border bg-card hover:border-primary/50 transition-colors"
                >
                  <p className="text-sm font-medium text-foreground">{result.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {result.kcalPer100g} kcal &middot; P: {result.proteinPer100g}g &middot; C: {result.carbsPer100g}g &middot; G: {result.fatPer100g}g
                    <span className="text-muted-foreground/60"> (por 100g)</span>
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
