'use client'

interface MacroValue {
  current: number
  target: number
}

interface Props {
  kcal: MacroValue
  protein: MacroValue
  carbs: MacroValue
  fat: MacroValue
}

// Compact single-row strip (was a 2×2 grid of large cards) — frees
// vertical space for the quick-add chips and the meal log.
export default function DayMacroSummary({ kcal, protein, carbs, fat }: Props) {
  const items = [
    { label: 'Prot', value: protein, unit: 'g' },
    { label: 'Carb', value: carbs, unit: 'g' },
    { label: 'Gord', value: fat, unit: 'g' },
    { label: 'Total', value: kcal, unit: '' },
  ]

  return (
    <div className="grid grid-cols-4 divide-x divide-border rounded-xl border border-border bg-card">
      {items.map((item) => (
        <div key={item.label} className="px-2 py-3 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            {item.label}
          </p>
          <p className="mt-0.5 text-base font-bold text-foreground tabular-nums">
            {item.value.current}
            <span className="text-[10px] font-normal text-muted-foreground">{item.unit}</span>
          </p>
          <p className="text-[10px] text-muted-foreground tabular-nums">
            / {item.value.target}
            {item.unit}
          </p>
        </div>
      ))}
    </div>
  )
}
