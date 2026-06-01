export function formatCalories(cal: number | null | undefined): string {
  if (cal == null) return "—"
  return `${Math.round(cal)} kcal`
}

export function formatWeight(kg: number | null | undefined): string {
  if (kg == null) return "—"
  return `${kg} kg`
}

export function formatMacro(g: number | null | undefined, unit = "g"): string {
  if (g == null) return "—"
  return `${g}${unit}`
}

export function sum(arr: (number | null | undefined)[]): number {
  return arr.reduce<number>((acc, v) => acc + (v ?? 0), 0)
}
