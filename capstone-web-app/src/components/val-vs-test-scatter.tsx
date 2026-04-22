'use client'

import { useState, useEffect } from 'react'
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import type { RunWithTest } from '@/lib/csv'
import { tagColor, TAG_COLORS } from '@/lib/colors'

interface ScatterPoint {
  x: number
  y: number
  run_id: string
  tag: string
  lr: number
  loss_type: string
  topk: number
}

const CHART_STYLE = {
  contentStyle: {
    backgroundColor: '#18181b',
    border: '1px solid #3f3f46',
    borderRadius: '6px',
    fontSize: 12,
  },
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: { payload: ScatterPoint }[] }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div style={CHART_STYLE.contentStyle} className="p-3">
      <p className="font-medium text-zinc-100 mb-1 font-mono text-xs truncate max-w-[220px]">{d.run_id}</p>
      <p className="text-zinc-400">Val AP: <span className="text-zinc-100">{d.x.toFixed(4)}</span></p>
      <p className="text-zinc-400">Test AP: <span className="text-zinc-100">{d.y.toFixed(4)}</span></p>
      <p className="text-zinc-400">LR: <span className="text-zinc-100">{d.lr}</span></p>
      <p className="text-zinc-400">Loss: <span className="text-zinc-100">{d.loss_type}</span></p>
      <p className="text-zinc-400">Top-K: <span className="text-zinc-100">{d.topk}</span></p>
    </div>
  )
}

export function ValVsTestScatter({ runs }: { runs: RunWithTest[] }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const tagGroups: Record<string, ScatterPoint[]> = {}
  for (const run of runs) {
    if (run.test?.test_ap === undefined) continue
    const point: ScatterPoint = {
      x: run.best_val_ap,
      y: run.test.test_ap,
      run_id: run.run_id,
      tag: run.tag,
      lr: run.lr,
      loss_type: run.loss_type,
      topk: run.topk,
    }
    if (!tagGroups[run.tag]) tagGroups[run.tag] = []
    tagGroups[run.tag].push(point)
  }

  if (!mounted) {
    return <div className="h-64 bg-zinc-800/30 rounded-lg animate-pulse" />
  }

  return (
    <div>
      <ResponsiveContainer width="100%" height={280}>
        <ScatterChart margin={{ top: 8, right: 20, left: 0, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
          <XAxis
            dataKey="x"
            type="number"
            domain={[0, 1]}
            name="Val AP"
            label={{ value: 'Val AP', position: 'insideBottom', offset: -4, fill: '#71717a', fontSize: 11 }}
            tick={{ fill: '#71717a', fontSize: 11 }}
          />
          <YAxis
            dataKey="y"
            type="number"
            domain={[0, 1]}
            name="Test AP"
            label={{ value: 'Test AP', angle: -90, position: 'insideLeft', fill: '#71717a', fontSize: 11 }}
            tick={{ fill: '#71717a', fontSize: 11 }}
            width={40}
          />
          {/* Diagonal parity line */}
          <ReferenceLine
            segment={[{ x: 0, y: 0 }, { x: 1, y: 1 }]}
            stroke="#3f3f46"
            strokeDasharray="4 4"
          />
          <Tooltip content={<CustomTooltip />} />
          {Object.entries(tagGroups).map(([tag, data]) => (
            <Scatter
              key={tag}
              name={tag}
              data={data}
              fill={tagColor(tag)}
              opacity={0.8}
            />
          ))}
        </ScatterChart>
      </ResponsiveContainer>

      <div className="flex flex-wrap gap-3 mt-2 justify-center">
        {Object.keys(tagGroups).map(tag => (
          <div key={tag} className="flex items-center gap-1.5 text-xs text-zinc-400">
            <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ backgroundColor: tagColor(tag) }} />
            {tag}
          </div>
        ))}
        <div className="flex items-center gap-1.5 text-xs text-zinc-600">
          <span className="inline-block w-4 border-t border-dashed border-zinc-600" />
          ideal
        </div>
      </div>
    </div>
  )
}
