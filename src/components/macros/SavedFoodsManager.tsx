'use client'

import { useState } from 'react'
import { Trash2, Edit2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePulseStore } from '@/store/pulse-store'
import ContextMenu from '@/components/ui/context-menu'
import ConfirmDialog from '@/components/ui/confirm-dialog'
import type { MacroFood } from '@/types'

export default function SavedFoodsManager() {
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
      <div className="text-center py-6 text-muted-foreground">
        <p className="text-sm">Nenhum alimento salvo ainda</p>
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
              className="rounded-lg border border-border bg-card p-3.5"
            >
              <div className="space-y-2">
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
              <div className="flex gap-2 pt-2">
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
            <div className="rounded-lg border border-border bg-card p-3.5">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{food.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {food.kcalPer100g} kcal · P: {food.proteinPer100g}g · C: {food.carbsPer100g}g · G: {food.fatPer100g}g
                  </p>
                  {food.lastUsedAt && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Usado em: {new Date(food.lastUsedAt).toLocaleDateString('pt-BR')}
                    </p>
                  )}
                </div>
                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => handleEdit(food.id)}
                    className="p-1.5 hover:bg-secondary rounded transition-colors"
                    title="Editar"
                  >
                    <Edit2 className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                  <button
                    onClick={() => setDeleting(food)}
                    className="p-1.5 hover:bg-destructive/10 rounded transition-colors"
                    title="Deletar"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </button>
                </div>
              </div>
            </div>
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
          if (deleting) deleteFood(deleting.id)
          setDeleting(null)
        }}
        onCancel={() => setDeleting(null)}
      />
    </div>
  )
}
