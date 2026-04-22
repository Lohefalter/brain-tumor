'use client'

import { useState, useEffect } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type { RunWithTest } from '@/lib/csv'
import { tagColor, TAG_COLORS } from '@/lib/colors'

interface Point {
  ts: number
  best_val_ap: number
  tag: string
  run_id: string
}

const CHART_STYLE = {
  contentStyle: {
    backgroundColor: '#18181b',
    border: '1px solid #3f3f46',
    borderRadius: '6px',
    fontSize: 12,
  },
  labelStyle: { color: '#a1a1aa' },
}

export function ValApTimeline({ runs }: { runs: RunWithTest[] }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const data: Point[] = [...runs]
    .sort((a, b) => new Date(a.timestamp_start).getTime() - new Date(b.timestamp_start).getTime())
    .map(r => ({
      ts: new Date(r.timestamp_start).getTime(),
      best_val_ap: r.best_val_ap,
      tag: r.tag,
      run_id: r.run_id,
    }))

  if (!mounted) {
    return <div className="h-64 bg-zinc-800/30 rounded-lg animate-pulse" />
  }

  return (
    <div>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data} margin={{ top: 8, right: 20, left: 0, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
          <XAxis
            dataKey="ts"
            type="number"
            scale="time"
            domain={['dataMin', 'dataMax']}
            tickFormatter={v => new Date(v).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            tick={{ fill: '#71717a', fontSize: 11 }}
          />
          <YAxis domain={[0, 1]} tick={{ fill: '#71717a', fontSize: 11 }} width={36} />
          <Tooltip
            contentStyle={CHART_STYLE.contentStyle}
            labelStyle={CHART_STYLE.labelStyle}
            labelFormatter={v => new Date(v as number).toLocaleString()}
            formatter={(v: number, _name: string, props: { payload?: Point }) => [
              v.toFixed(4),
              props.payload?.tag ?? 'Val AP',
            ]}
          />
          <Line
            dataKey="best_val_ap"
            stroke="#4f46e5"
            strokeWidth={1.5}
            dot={(props: { cx: number; cy: number; payload: Point }) => (
              <circle
                key={props.payload.run_id}
                cx={props.cx}
                cy={props.cy}
                r={3.5}
                fill={tagColor(props.payload.tag)}
                stroke="none"
              />
            )}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mt-2 justify-center">
        {Object.entries(TAG_COLORS).map(([tag, color]) => (
          <div key={tag} className="flex items-center gap-1.5 text-xs text-zinc-400">
            <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
            {tag}
          </div>
        ))}
      </div>
    </div>
  )
}
