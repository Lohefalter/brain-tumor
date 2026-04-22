'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import type { RunWithTest } from '@/lib/csv'
import { tagColor, apColor } from '@/lib/colors'

type SortKey = 'best_val_ap' | 'test_ap' | 'lr' | 'epochs_actual' | 'duration_s'
type SortDir = 'asc' | 'desc'

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  return (
    <span className={`ml-1 text-xs ${active ? 'text-indigo-400' : 'text-zinc-600'}`}>
      {active ? (dir === 'desc' ? '↓' : '↑') : '↕'}
    </span>
  )
}

function ApBar({ value }: { value: number | null | undefined }) {
  if (value == null) return <span className="text-zinc-600">—</span>
  return (
    <div className="relative inline-flex items-center w-28">
      <div
        className="absolute left-0 top-0 h-full rounded opacity-25"
        style={{ width: `${value * 100}%`, backgroundColor: apColor(value) }}
      />
      <span className="relative font-mono text-xs text-zinc-100 pl-1">{value.toFixed(4)}</span>
    </div>
  )
}

export function RunsTable({ runs }: { runs: RunWithTest[] }) {
  const router = useRouter()
  const [sortKey, setSortKey] = useState<SortKey>('best_val_ap')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [filterTag, setFilterTag] = useState('')
  const [filterLoss, setFilterLoss] = useState('')
  const [search, setSearch] = useState('')

  const allTags = useMemo(() => ['', ...[...new Set(runs.map(r => r.tag))].sort()], [runs])
  const allLossTypes = useMemo(() => ['', ...[...new Set(runs.map(r => r.loss_type))].sort()], [runs])

  const filtered = useMemo(() => {
    let result = runs
    if (filterTag) result = result.filter(r => r.tag === filterTag)
    if (filterLoss) result = result.filter(r => r.loss_type === filterLoss)
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(r => r.run_id.toLowerCase().includes(q) || r.run_note.toLowerCase().includes(q))
    }
    return [...result].sort((a, b) => {
      let av: number, bv: number
      if (sortKey === 'test_ap') {
        av = a.test?.test_ap ?? -1
        bv = b.test?.test_ap ?? -1
      } else {
        av = (a[sortKey] as number | null) ?? -1
        bv = (b[sortKey] as number | null) ?? -1
      }
      return sortDir === 'desc' ? bv - av : av - bv
    })
  }, [runs, filterTag, filterLoss, search, sortKey, sortDir])

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => (d === 'desc' ? 'asc' : 'desc'))
    else { setSortKey(key); setSortDir('desc') }
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap gap-3 items-center">
        <input
          type="text"
          placeholder="Search run ID or note…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 w-56"
        />
        <select
          value={filterTag}
          onChange={e => setFilterTag(e.target.value)}
          className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500"
        >
          {allTags.map(t => (
            <option key={t} value={t}>{t || 'All Tags'}</option>
          ))}
        </select>
        <select
          value={filterLoss}
          onChange={e => setFilterLoss(e.target.value)}
          className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500"
        >
          {allLossTypes.map(l => (
            <option key={l} value={l}>{l || 'All Loss Types'}</option>
          ))}
        </select>
        <span className="text-xs text-zinc-500 ml-auto">{filtered.length} of {runs.length} runs</span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-zinc-800">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-zinc-900 border-b border-zinc-800">
              <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide">
                Run ID
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide">
                Tag
              </th>
              <th
                className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide cursor-pointer hover:text-zinc-300"
                onClick={() => handleSort('best_val_ap')}
              >
                Val AP <SortIcon active={sortKey === 'best_val_ap'} dir={sortDir} />
              </th>
              <th
                className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide cursor-pointer hover:text-zinc-300"
                onClick={() => handleSort('test_ap')}
              >
                Test AP <SortIcon active={sortKey === 'test_ap'} dir={sortDir} />
              </th>
              <th
                className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide cursor-pointer hover:text-zinc-300"
                onClick={() => handleSort('lr')}
              >
                LR <SortIcon active={sortKey === 'lr'} dir={sortDir} />
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide">
                Loss
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide">
                Top-K
              </th>
              <th
                className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide cursor-pointer hover:text-zinc-300"
                onClick={() => handleSort('epochs_actual')}
              >
                Epochs <SortIcon active={sortKey === 'epochs_actual'} dir={sortDir} />
              </th>
              <th
                className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide cursor-pointer hover:text-zinc-300"
                onClick={() => handleSort('duration_s')}
              >
                Duration <SortIcon active={sortKey === 'duration_s'} dir={sortDir} />
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((run, i) => (
              <tr
                key={run.run_id}
                onClick={() => router.push(`/runs/${encodeURIComponent(run.run_id)}`)}
                className={`border-b border-zinc-800/50 cursor-pointer hover:bg-zinc-800/40 transition-colors ${
                  i % 2 === 0 ? 'bg-zinc-900/30' : 'bg-zinc-900/10'
                }`}
              >
                <td className="px-4 py-3 font-mono text-xs text-zinc-300 max-w-[180px] truncate" title={run.run_id}>
                  {run.run_id}
                </td>
                <td className="px-4 py-3">
                  <span
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                    style={{
                      backgroundColor: tagColor(run.tag) + '22',
                      color: tagColor(run.tag),
                      border: `1px solid ${tagColor(run.tag)}44`,
                    }}
                  >
                    {run.tag}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <ApBar value={run.best_val_ap} />
                </td>
                <td className="px-4 py-3">
                  <ApBar value={run.test?.test_ap} />
                </td>
                <td className="px-4 py-3 font-mono text-xs text-zinc-400">{run.lr}</td>
                <td className="px-4 py-3 text-xs text-zinc-400">{run.loss_type}</td>
                <td className="px-4 py-3 text-xs text-zinc-400">{run.topk}</td>
                <td className="px-4 py-3 text-xs text-zinc-400">{run.epochs_actual != null ? Math.round(run.epochs_actual) : '—'}</td>
                <td className="px-4 py-3 text-xs text-zinc-400">{run.duration_s != null ? `${run.duration_s.toFixed(0)}s` : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-zinc-600 text-sm">No runs match filters.</div>
        )}
      </div>
    </div>
  )
}
