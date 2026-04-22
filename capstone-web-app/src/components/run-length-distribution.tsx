import type { RunWithTest } from '@/lib/csv'

export function RunLengthDistribution({ runs }: { runs: RunWithTest[] }) {
  const bucketMap: Record<number, number> = {}
  for (const run of runs) {
    const e = Math.round(run.epochs_actual)
    bucketMap[e] = (bucketMap[e] ?? 0) + 1
  }

  const entries = Object.entries(bucketMap)
    .map(([e, count]) => ({ epochs: Number(e), count }))
    .sort((a, b) => a.epochs - b.epochs)

  const maxCount = entries.length ? Math.max(...entries.map(e => e.count)) : 1

  return (
    <div className="space-y-2">
      <div className="flex items-end gap-1.5 h-52">
        {entries.map(({ epochs, count }) => {
          const pct = count / maxCount
          const hue = Math.round(pct * 120)
          return (
            <div key={epochs} className="flex flex-col items-center gap-1 flex-1 min-w-0">
              <span className="text-xs text-zinc-400 font-mono">{count}</span>
              <div
                className="w-full rounded-t-sm"
                style={{
                  height: `${Math.max(Math.round(pct * 100), 2)}%`,
                  backgroundColor: `hsl(${hue}, 65%, 50%)`,
                }}
                title={`${count} run${count !== 1 ? 's' : ''} — ${epochs} epochs`}
              />
            </div>
          )
        })}
      </div>
      <div className="flex gap-1.5">
        {entries.map(({ epochs }) => (
          <div key={epochs} className="flex-1 text-center text-xs text-zinc-500 font-mono min-w-0 truncate">
            {epochs}
          </div>
        ))}
      </div>
      <p className="text-xs text-zinc-600 text-center">epochs run</p>
    </div>
  )
}
