'use client'

import { useState, useEffect } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import type { RunWithTest } from '@/lib/csv'
import { tagColor } from '@/lib/colors'

interface TagStat {
  tag: string
  max_val_ap: number
  mean_val_ap: number
  count: number
  color: string
}

const CHART_STYLE = {
  contentStyle: {
    backgroundColor: '#18181b',
    border: '1px solid #3f3f46',
    borderRadius: '6px',
    fontSize: 12,
  },
}

export function ApByTagChart({ runs }: { runs: RunWithTest[] }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const tagMap: Record<string, number[]> = {}
  for (const run of runs) {
    if (!tagMap[run.tag]) tagMap[run.tag] = []
    tagMap[run.tag].push(run.best_val_ap)
  }

  const data: TagStat[] = Object.entries(tagMap)
    .map(([tag, vals]) => ({
      tag,
      max_val_ap: Math.max(...vals),
      mean_val_ap: vals.reduce((s, v) => s + v, 0) / vals.length,
      count: vals.length,
      color: tagColor(tag),
    }))
    .sort((a, b) => b.max_val_ap - a.max_val_ap)

  if (!mounted) {
    return <div className="h-64 bg-zinc-800/30 rounded-lg animate-pulse" />
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 8, right: 20, left: 10, bottom: 8 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" horizontal={false} />
        <XAxis
          type="number"
          domain={[0, 1]}
          tick={{ fill: '#71717a', fontSize: 11 }}
        />
        <YAxis
          type="category"
          dataKey="tag"
          tick={{ fill: '#a1a1aa', fontSize: 11 }}
          width={100}
        />
        <Tooltip
          contentStyle={CHART_STYLE.contentStyle}
          labelStyle={{ color: '#a1a1aa' }}
          formatter={(v: number, name: string, props: { payload?: TagStat }) => [
            v.toFixed(4),
            `${name} (n=${props.payload?.count ?? ''})`,
          ]}
        />
        <Legend
          wrapperStyle={{ fontSize: 12, color: '#a1a1aa' }}
          formatter={(v) => <span style={{ color: '#a1a1aa' }}>{v}</span>}
        />
        <Bar dataKey="max_val_ap" name="Max Val AP" fill="#6366f1" radius={[0, 3, 3, 0]} />
        <Bar dataKey="mean_val_ap" name="Mean Val AP" fill="#4338ca" opacity={0.7} radius={[0, 3, 3, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
