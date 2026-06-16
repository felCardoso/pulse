'use client'

import { useRef, useState } from 'react'
import { Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { parseTemplateCSV } from '@/lib/csv-import'
import type { ExerciseTemplate } from '@/types'

interface Props {
  onImport: (exercises: Omit<ExerciseTemplate, 'id' | 'order'>[]) => void
}

export default function CSVImport({ onImport }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setError(null)

    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target?.result as string
      const { exercises, errors } = parseTemplateCSV(text)
      if (exercises.length === 0) {
        setError('Nenhum exercício encontrado. Verifique o formato do arquivo.')
        return
      }
      if (errors.length > 0) {
        setError(`Importado com avisos: ${errors.join('; ')}`)
      }
      onImport(exercises)
    }
    reader.readAsText(file)
    // Reset input so the same file can be re-imported
    e.target.value = ''
  }

  return (
    <div className="space-y-1">
      <input
        ref={inputRef}
        type="file"
        accept=".csv,.txt"
        className="hidden"
        onChange={handleFile}
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="gap-2"
        onClick={() => inputRef.current?.click()}
      >
        <Upload className="h-4 w-4" />
        Importar CSV
      </Button>
      {error && <p className="text-xs text-destructive">{error}</p>}
      <p className="text-xs text-muted-foreground">
        Formato: exercício, séries, reps, descanso(s)
      </p>
    </div>
  )
}
