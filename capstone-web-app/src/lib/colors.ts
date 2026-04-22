export const TAG_COLORS: Record<string, string> = {
  'baseline': '#6366f1',
  'baseline-lr1e-4': '#06b6d4',
  'no-early-stop': '#22c55e',
  'no-stop': '#14b8a6',
  'mask': '#f97316',
  '224-mask': '#ef4444',
  'top32k': '#a855f7',
}

export function tagColor(tag: string): string {
  return TAG_COLORS[tag] ?? '#94a3b8'
}

/** Returns an HSL color on a red→yellow→green scale for a 0–1 metric. */
export function apColor(value: number): string {
  const hue = Math.round(Math.max(0, Math.min(1, value)) * 120)
  return `hsl(${hue}, 70%, 45%)`
}
