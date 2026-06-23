'use client'

import { useState } from 'react'
import { Edit2, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePulseStore } from '@/store/pulse-store'
import ContextMenu from '@/components/ui/context-menu'
import ConfirmDialog from '@/components/ui/confirm-dialog'
import type { MacroFood } from '@/types'

interface Props {
  selectedFoodId: string | null
  onSelectFood: (id: string) => void
}

export default function SavedFoodsList({ selectedFoodId, onSelectFood }: Props) {
  const foods = usePulseStore((s) => s.foods)
  const deleteFood = usePulseStore((s) => s.deleteFood)
  const updateFood = usePulseStore((s) => s.updateFood)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editData, setEditData] = useState<MacroFood | null>(null)
  const [deleting, setDeleting] = useState<MacroFood | null>(null)

  const handleEdit = (id: string) => {
    const food = foods.find((f) => f.id === id)
    if (food) {
      setEditingId(id)
      setEditData(food)
    }
  }

  const handleSaveEdit = () => {
    if (editingId && editData) {
      updateFood(editingId, editData)
      setEditingId(null)
      setEditData(null)
    }
  }

  if (foods.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p className="text-sm">
          Nenhum alimento salvo. Crie um na aba &quot;Manual&quot; ou acesse as configurações para gerenciar alimentos.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {foods.map((food) => {
        if (editingId === food.id && editData) {
          return (
            <div
              key={food.id}
              className="rounded-lg border-2 border-primary bg-card p-3 space-y-2"
            >
              <input
                type="text"
                value={editData.name}
                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                className="w-full px-2 py-1 text-sm rounded border border-border bg-secondary focus:border-primary focus:outline-none"
                placeholder="Nome"
              />
              <div className="grid grid-cols-2 gap-2 text-xs">
                <input
                  type="number"
                  step="0.1"
                  value={editData.kcalPer100g}
                  onChange={(e) => setEditData({ ...editData, kcalPer100g: parseFloat(e.target.value) })}
                  className="px-2 py-1 rounded border border-border bg-secondary focus:border-primary focus:outline-none"
                  placeholder="kcal"
                />
                <input
                  type="number"
                  step="0.1"
                  value={editData.proteinPer100g}
                  onChange={(e) => setEditData({ ...editData, proteinPer100g: parseFloat(e.target.value) })}
                  className="px-2 py-1 rounded border border-border bg-secondary focus:border-primary focus:outline-none"
                  placeholder="Proteína"
                />
                <input
                  type="number"
                  step="0.1"
                  value={editData.carbsPer100g}
                  onChange={(e) => setEditData({ ...editData, carbsPer100g: parseFloat(e.target.value) })}
                  className="px-2 py-1 rounded border border-border bg-secondary focus:border-primary focus:outline-none"
                  placeholder="Carbs"
                />
                <input
                  type="number"
                  step="0.1"
                  value={editData.fatPer100g}
                  onChange={(e) => setEditData({ ...editData, fatPer100g: parseFloat(e.target.value) })}
                  className="px-2 py-1 rounded border border-border bg-secondary focus:border-primary focus:outline-none"
                  placeholder="Gordura"
                />
              </div>
              <div className="flex gap-2 pt-1">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setEditingId(null)
                    setEditData(null)
                  }}
                  className="flex-1 h-7 text-xs"
                >
                  Cancelar
                </Button>
                <Button
                  size="sm"
                  onClick={handleSaveEdit}
                  className="flex-1 h-7 text-xs"
                >
                  Salvar
                </Button>
              </div>
            </div>
          )
        }

        return (
          <ContextMenu
            key={food.id}
            items={[
              {
                label: 'Editar',
                icon: <Edit2 className="h-4 w-4" />,
                onSelect: () => handleEdit(food.id),
              },
              {
                label: 'Excluir',
                icon: <Trash2 className="h-4 w-4" />,
                destructive: true,
                onSelect: () => setDeleting(food),
              },
            ]}
          >
            <button
              onClick={() => onSelectFood(food.id)}
              className={`w-full text-left p-3 rounded-lg border-2 transition-colors ${
                selectedFoodId === food.id
                  ? 'border-primary bg-primary/10'
                  : 'border-border bg-card hover:border-primary/50'
              }`}
            >
              <p className="text-sm font-medium text-foreground">{food.name}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {food.kcalPer100g} kcal &middot; P: {food.proteinPer100g}g &middot; C: {food.carbsPer100g}g &middot; G: {food.fatPer100g}g
              </p>
            </button>
          </ContextMenu>
        )
      })}

      <ConfirmDialog
        open={deleting !== null}
        title="Excluir alimento"
        description={
          deleting
            ? `Tem certeza que deseja excluir "${deleting.name}" dos alimentos salvos?`
            : undefined
        }
        onConfirm={() => {
          if (deleting) {
            deleteFood(deleting.id)
            // Clear selection if the removed food was selected.
            if (selectedFoodId === deleting.id) onSelectFood('')
          }
          setDeleting(null)
        }}
        onCancel={() => setDeleting(null)}
      />
    </div>
  )
}
