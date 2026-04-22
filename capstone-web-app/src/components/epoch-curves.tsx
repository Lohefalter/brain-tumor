'use client'

import { useState, useEffect } from 'react'
import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts'
import type { Epoch } from '@/lib/csv'

const CHART_STYLE = {
  contentStyle: {
    backgroundColor: '#18181b',
    border: '1px solid #3f3f46',
    borderRadius: '6px',
    fontSize: 12,
  },
  labelStyle: { color: '#a1a1aa' },
}

export function EpochCurves({ epochs, bestEpoch }: { epochs: Epoch[]; bestEpoch: number }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  if (!mounted) {
    return <div className="h-72 bg-zinc-800/30 rounded-lg animate-pulse" />
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <ComposedChart data={epochs} margin={{ top: 10, right: 40, left: 0, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
        <XAxis
          dataKey="epoch"
          tick={{ fill: '#71717a', fontSize: 11 }}
          label={{ value: 'Epoch', position: 'insideBottom', offset: -12, fill: '#71717a', fontSize: 11 }}
        />
        <YAxis
          yAxisId="loss"
          orientation="left"
          tick={{ fill: '#f97316', fontSize: 11 }}
          label={{ value: 'Train Loss', angle: -90, position: 'insideLeft', offset: 15, fill: '#f97316', fontSize: 10 }}
          width={52}
        />
        <YAxis
          yAxisId="ap"
          orientation="right"
          domain={[0, 1]}
          tick={{ fill: '#818cf8', fontSize: 11 }}
          label={{ value: 'Val AP', angle: 90, position: 'insideRight', offset: 15, fill: '#818cf8', fontSize: 10 }}
          width={44}
        />
        <Tooltip
          contentStyle={CHART_STYLE.contentStyle}
          labelStyle={CHART_STYLE.labelStyle}
          labelFormatter={v => `Epoch ${v}`}
          formatter={(v: number, name: string) => [v.toFixed(4), name]}
        />
        <Legend
          wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
          formatter={(v: string) => <span style={{ color: '#a1a1aa' }}>{v}</span>}
        />
        <ReferenceLine
          yAxisId="ap"
          x={bestEpoch}
          stroke="#22c55e"
          strokeDasharray="4 4"
          strokeWidth={1.5}
          label={{ value: '★ best', position: 'top', fill: '#22c55e', fontSize: 10 }}
        />
        <Line
          yAxisId="loss"
          dataKey="train_loss"
          name="Train Loss"
          stroke="#f97316"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, fill: '#f97316' }}
        />
        <Line
          yAxisId="ap"
          dataKey="val_ap"
          name="Val AP"
          stroke="#818cf8"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, fill: '#818cf8' }}
        />
        <Line
          yAxisId="ap"
          dataKey="val_f1"
          name="Val F1"
          stroke="#34d399"
          strokeWidth={1.5}
          strokeDasharray="4 2"
          dot={false}
          activeDot={{ r: 3, fill: '#34d399' }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  )
}
