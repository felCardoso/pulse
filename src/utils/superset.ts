/**
 * Groups a list already in display order into superset/circuit chains:
 * consecutive items are merged into one group for as long as each item
 * (except the last) has `supersetWithNext` set. An item without the flag
 * ends its group — including groups of size 1, the common case.
 */
export function groupBySuperset<T extends { supersetWithNext?: boolean }>(list: T[]): T[][] {
  const groups: T[][] = []
  let current: T[] = []
  for (const item of list) {
    current.push(item)
    if (!item.supersetWithNext) {
      groups.push(current)
      current = []
    }
  }
  if (current.length) groups.push(current)
  return groups
}

/** Naming a chained group by its size: 2 exercises is a bi-set, 3 a
 * tri-set, 4+ a circuit (giant sets aren't named separately in the app). */
export function supersetGroupLabel(size: number): string {
  if (size >= 4) return 'Circuito'
  if (size === 3) return 'Tri-set'
  return 'Bi-set'
}
