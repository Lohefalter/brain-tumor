interface ConfusionMatrixProps {
  tn: number
  fp: number
  fn: number
  tp: number
}

export function ConfusionMatrix({ tn, fp, fn, tp }: ConfusionMatrixProps) {
  const total = tn + fp + fn + tp

  function Cell({
    value,
    label,
    variant,
    rowLabel,
    colLabel,
  }: {
    value: number
    label: string
    variant: 'correct' | 'wrong' | 'critical'
    rowLabel?: string
    colLabel?: string
  }) {
    const bg =
      variant === 'correct'
        ? 'bg-emerald-900/40 border-emerald-700/40'
        : variant === 'critical'
        ? 'bg-red-900/50 border-red-700/50'
        : 'bg-amber-900/30 border-amber-700/30'
    const textColor =
      variant === 'correct' ? 'text-emerald-300' : variant === 'critical' ? 'text-red-300' : 'text-amber-300'

    return (
      <div className={`border rounded-lg p-4 flex flex-col items-center justify-center ${bg}`}>
        {colLabel && <p className="text-xs text-zinc-500 mb-1">{colLabel}</p>}
        <p className={`text-3xl font-bold ${textColor}`}>{Math.round(value)}</p>
        <p className="text-xs font-medium text-zinc-400 mt-1">{label}</p>
        <p className="text-xs text-zinc-600 mt-0.5">{total > 0 ? ((value / total) * 100).toFixed(1) : '0'}%</p>
      </div>
    )
  }

  return (
    <div>
      <div className="grid grid-cols-2 gap-1 text-center mb-1">
        <div className="text-xs text-zinc-600 col-start-2 text-center">Predicted HGG</div>
        <div className="text-xs text-zinc-600 col-start-2 text-right pr-2"></div>
      </div>

      {/* Header row */}
      <div className="grid grid-cols-[auto_1fr_1fr] gap-2 items-center">
        <div className="w-6" /> {/* spacer */}
        <div className="text-center text-xs text-zinc-500 font-medium pb-1">Pred HGG</div>
        <div className="text-center text-xs text-zinc-500 font-medium pb-1">Pred LGG</div>

        {/* Row 1: Actual HGG */}
        <div className="flex items-center">
          <span
            className="text-xs text-zinc-500 font-medium"
            style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
          >
            Actual HGG
          </span>
        </div>
        <Cell value={tn} label="TN" variant="correct" />
        <Cell value={fp} label="FP" variant="wrong" />

        {/* Row 2: Actual LGG */}
        <div className="flex items-center">
          <span
            className="text-xs text-zinc-500 font-medium"
            style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
          >
            Actual LGG
          </span>
        </div>
        <Cell value={fn} label="FN ⚠" variant="critical" />
        <Cell value={tp} label="TP" variant="correct" />
      </div>

      <p className="text-xs text-zinc-600 mt-3 text-center">
        FN (LGG missed as HGG) is the most critical error in clinical settings.
      </p>
    </div>
  )
}
