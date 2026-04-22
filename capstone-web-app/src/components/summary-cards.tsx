function formatDuration(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)}s`
  const m = Math.floor(seconds / 60)
  const s = Math.round(seconds % 60)
  return `${m}m ${s}s`
}

interface CardProps {
  title: string
  value: string
  sub?: string
  accent?: string
}

function StatCard({ title, value, sub, accent }: CardProps) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
      <p className="text-xs font-medium text-zinc-500 uppercase tracking-widest">{title}</p>
      <p className={`text-3xl font-bold mt-2 ${accent ?? 'text-zinc-100'}`}>{value}</p>
      {sub && (
        <p className="text-xs text-zinc-500 mt-1 truncate font-mono" title={sub}>
          {sub}
        </p>
      )}
    </div>
  )
}

interface SummaryCardsProps {
  totalRuns: number
  bestValAP: { value: number; runId: string }
  bestTestAP: { value: number; runId: string } | null
  avgDurationS: number
}

export function SummaryCards({ totalRuns, bestValAP, bestTestAP, avgDurationS }: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard title="Total Runs" value={totalRuns.toString()} />
      <StatCard
        title="Best Val AP"
        value={bestValAP.value.toFixed(4)}
        sub={bestValAP.runId}
        accent="text-indigo-400"
      />
      <StatCard
        title="Best Test AP"
        value={bestTestAP ? bestTestAP.value.toFixed(4) : '—'}
        sub={bestTestAP?.runId}
        accent="text-emerald-400"
      />
      <StatCard title="Avg Duration" value={formatDuration(avgDurationS)} />
    </div>
  )
}
