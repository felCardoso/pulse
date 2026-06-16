import type { ExerciseTemplate } from '@/types'

type ParseResult = {
  exercises: Omit<ExerciseTemplate, 'id' | 'order'>[]
  errors: string[]
}

function detectSeparator(line: string): string {
  if ((line.match(/;/g) || []).length > (line.match(/,/g) || []).length) return ';'
  return ','
}

function stripQuotes(value: string): string {
  return value.trim().replace(/^["']|["']$/g, '')
}

export function parseTemplateCSV(text: string): ParseResult {
  const lines = text
    .trim()
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)

  if (lines.length === 0) return { exercises: [], errors: ['Arquivo vazio'] }

  const sep = detectSeparator(lines[0])
  const firstCellLower = stripQuotes(lines[0].split(sep)[0]).toLowerCase()
  const headerKeywords = ['exercise', 'exercício', 'exercicio', 'name', 'nome']
  const hasHeader = headerKeywords.includes(firstCellLower)
  const dataLines = hasHeader ? lines.slice(1) : lines

  const exercises: Omit<ExerciseTemplate, 'id' | 'order'>[] = []
  const errors: string[] = []

  dataLines.forEach((line, i) => {
    const cols = line.split(sep).map(stripQuotes)
    const [rawName, rawSets, rawReps, rawRest] = cols

    if (!rawName) {
      errors.push(`Linha ${i + 1 + (hasHeader ? 1 : 0)}: nome vazio`)
      return
    }

    const sets = parseInt(rawSets) || 3
    const reps = rawReps || '10'
    const restSeconds = parseInt(rawRest) || 90

    exercises.push({ name: rawName, sets, reps, restSeconds })
  })

  return { exercises, errors }
}
