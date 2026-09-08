import type { ExerciseTemplate, WorkoutTemplate, Ficha } from '@/types'
import { getLocalDateStr } from '@/utils/format'

interface FichaFile {
  type: 'echo-ficha'
  version: 1
  name: string
  description?: string
  /** Each workout's exercises — ids get regenerated on import regardless. */
  templates: { name: string; description?: string; exercises: ExerciseTemplate[] }[]
}

export type FichaFilePayload = Omit<FichaFile, 'type' | 'version'>

/** Exports one ficha and its member workouts as a standalone JSON file,
 * separate from the full app backup — meant to be shared with someone else
 * so they can import just this program. */
export function exportFicha(ficha: Ficha, templates: WorkoutTemplate[]) {
  const file: FichaFile = {
    type: 'echo-ficha',
    version: 1,
    name: ficha.name,
    description: ficha.description,
    templates: templates.map((t) => ({
      name: t.name,
      description: t.description,
      exercises: t.exercises,
    })),
  }
  const blob = new Blob([JSON.stringify(file, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `echo-ficha-${ficha.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${getLocalDateStr()}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function parseFichaFile(json: string): FichaFilePayload {
  const data = JSON.parse(json) as FichaFile
  if (data.type !== 'echo-ficha' || !Array.isArray(data.templates) || !data.name) {
    throw new Error('Arquivo de ficha inválido')
  }
  return {
    name: data.name,
    description: data.description,
    templates: data.templates,
  }
}
