import { getRunsWithTest, isRunComplete } from '@/lib/csv'
import { SummaryCards } from '@/components/summary-cards'
import { RunLengthDistribution } from '@/components/run-length-distribution'
import { ValVsTestScatter } from '@/components/val-vs-test-scatter'
import { ApByTagChart } from '@/components/ap-by-tag-chart'

export const revalidate = 60

export default async function OverviewPage() {
  const allRuns = await getRunsWithTest()
  const runs = allRuns.filter(isRunComplete)

  const totalRuns = runs.length
  const filteredOut = allRuns.length - totalRuns

  const bestValRun = runs.reduce((best, r) =>
    r.best_val_ap > best.best_val_ap ? r : best
  )
  const bestValAP = { value: bestValRun.best_val_ap, runId: bestValRun.run_id }

  const bestTestRun = runs.reduce((best, r) =>
    r.test!.test_ap > best.test!.test_ap ? r : best
  )
  const bestTestAP = { value: bestTestRun.test!.test_ap, runId: bestTestRun.run_id }

  const avgDurationS = runs.reduce((s, r) => s + r.duration_s, 0) / runs.length

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">Experiment Overview</h1>
        <p className="text-sm text-zinc-500 mt-1">
          UCSF-PDGM-v5 · ResNet50 · HGG vs LGG brain tumor classification ·{' '}
          <span className="text-zinc-400">{totalRuns} completed runs</span>
          {filteredOut > 0 && (
            <span className="text-zinc-600"> · {filteredOut} excluded (incomplete or AP = 1.0)</span>
          )}
        </p>
      </div>

      <SummaryCards
        totalRuns={totalRuns}
        bestValAP={bestValAP}
        bestTestAP={bestTestAP}
        avgDurationS={avgDurationS}
      />

      <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-zinc-300 mb-1">Run Length Distribution</h2>
        <p className="text-xs text-zinc-600 mb-4">
          How many epochs each completed run trained before early stopping. Taller = more runs ended at that epoch count.
        </p>
        <RunLengthDistribution runs={runs} />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-zinc-300 mb-1">Val AP vs Test AP</h2>
          <p className="text-xs text-zinc-600 mb-3">
            Points on the diagonal line indicate perfect val/test alignment.
          </p>
          <ValVsTestScatter runs={runs} />
        </section>

        <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-zinc-300 mb-1">AP by Experiment Tag</h2>
          <p className="text-xs text-zinc-600 mb-3">
            Max and mean best_val_ap grouped by tag.
          </p>
          <ApByTagChart runs={runs} />
        </section>
      </div>
    </div>
  )
}
