import { getRunsWithTest, isRunComplete } from '@/lib/csv'
import { RunsTable } from '@/components/runs-table'

export const revalidate = 60

export default async function RunsPage() {
  const allRuns = await getRunsWithTest()
  const runs = allRuns.filter(isRunComplete)
  const filteredOut = allRuns.length - runs.length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">Completed Runs</h1>
        <p className="text-sm text-zinc-500 mt-1">
          Click any row to view detailed epoch curves and test metrics.{' '}
          {filteredOut > 0 && (
            <span className="text-zinc-600">{filteredOut} runs excluded (incomplete or AP = 1.0).</span>
          )}
        </p>
      </div>
      <RunsTable runs={runs} />
    </div>
  )
}
