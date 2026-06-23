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

export default function DayMacroSummary({ kcal, protein, carbs, fat }: Props) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="rounded-xl border border-border bg-card p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
          Proteína
        </p>
        <p className="text-2xl font-bold text-foreground">
          {protein.current}
          <span className="text-xs text-muted-foreground font-normal ml-1">g</span>
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Meta: {protein.target}g
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
          Carboidratos
        </p>
        <p className="text-2xl font-bold text-foreground">
          {carbs.current}
          <span className="text-xs text-muted-foreground font-normal ml-1">g</span>
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Meta: {carbs.target}g
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
          Gordura
        </p>
        <p className="text-2xl font-bold text-foreground">
          {fat.current}
          <span className="text-xs text-muted-foreground font-normal ml-1">g</span>
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Meta: {fat.target}g
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
          Total
        </p>
        <p className="text-2xl font-bold text-foreground">
          {kcal.current}
          <span className="text-xs text-muted-foreground font-normal ml-1">kcal</span>
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Meta: {kcal.target}kcal
        </p>
      </div>
    </div>
  )
}
