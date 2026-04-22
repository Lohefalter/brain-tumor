import Link from 'next/link'
import { notFound } from 'next/navigation'
import { parseRuns, parseEpochs, parseTestReports } from '@/lib/csv'
import { EpochCurves } from '@/components/epoch-curves'
import { ConfusionMatrix } from '@/components/confusion-matrix'
import { tagColor } from '@/lib/colors'

export const revalidate = 60

interface Props {
  params: Promise<{ run_id: string }>
}

function MetricCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-lg p-3 text-center">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="text-lg font-bold text-zinc-100 mt-0.5">{value}</p>
      {sub && <p className="text-xs text-zinc-600 mt-0.5">{sub}</p>}
    </div>
  )
}

function ConfigRow({ label, value }: { label: string; value: string | number | boolean }) {
  const display = typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value)
  return (
    <div className="flex justify-between py-1.5 border-b border-zinc-800/60 last:border-0">
      <span className="text-xs text-zinc-500">{label}</span>
      <span className="text-xs text-zinc-300 font-mono">{display}</span>
    </div>
  )
}

export default async function RunDetailPage({ params }: Props) {
  const { run_id } = await params

  const [runs, testReports] = await Promise.all([
    parseRuns(),
    parseTestReports(),
  ])

  const run = runs.find(r => r.run_id === run_id)
  if (!run) notFound()

  const epochs = await parseEpochs(run_id)
  const testReport = testReports.find(t => t.run_id === run_id)

  // Best epoch data from epochs array
  const bestEpochData = epochs.find(e => e.is_best === 1) ?? epochs[Math.round(run.best_epoch) - 1]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Link
          href="/runs"
          className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          ← All Runs
        </Link>
        <div className="flex items-center gap-3 mt-2 flex-wrap">
          <h1 className="text-xl font-bold text-zinc-100 font-mono break-all">{run.run_id}</h1>
          <span
            className="px-2.5 py-1 rounded-full text-xs font-medium"
            style={{
              backgroundColor: tagColor(run.tag) + '22',
              color: tagColor(run.tag),
              border: `1px solid ${tagColor(run.tag)}44`,
            }}
          >
            {run.tag}
          </span>
        </div>
        {run.run_note && (
          <p className="text-sm text-zinc-400 mt-1">{run.run_note}</p>
        )}
        <p className="text-xs text-zinc-600 mt-1">
          {new Date(run.timestamp_start).toLocaleString()} · {run.duration_s.toFixed(1)}s ·{' '}
          {Math.round(run.epochs_actual)} epochs · seed {run.seed}
        </p>
      </div>

      {/* Config panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-zinc-300 mb-3">Preprocessing Config</h2>
          <ConfigRow label="Top-K slices" value={run.topk} />
          <ConfigRow label="Context slices (±N)" value={run.context_slices} />
          <ConfigRow label="Output size" value={run.out_hw} />
          <ConfigRow label="Normalization" value={run.norm_mode} />
          <ConfigRow label="Tumor mask channel" value={run.add_tumor_mask_channel} />
          <ConfigRow label="Bbox margin (px)" value={run.bbox_margin} />
          <ConfigRow label="Min bbox size (px)" value={run.min_bbox_size} />
          <ConfigRow label="Train slices" value={run.n_train_slices} />
          <ConfigRow label="Val slices" value={run.n_val_slices} />
        </section>

        <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-zinc-300 mb-3">Training Config</h2>
          <ConfigRow label="Learning rate" value={run.lr} />
          <ConfigRow label="Weight decay" value={run.weight_decay} />
          <ConfigRow label="Loss type" value={run.loss_type} />
          {run.loss_type === 'focal' && <ConfigRow label="Focal gamma" value={run.focal_gamma} />}
          <ConfigRow label="Max LGG weight" value={run.max_lgg_weight} />
          <ConfigRow label="Cosine LR schedule" value={run.use_cosine} />
          <ConfigRow label="Warmup epochs" value={run.warmup_epochs} />
          <ConfigRow label="Early stop patience" value={run.early_stop_patience} />
          <ConfigRow label="Grad clip" value={run.grad_clip || 'disabled'} />
          <ConfigRow label="Patient agg" value={run.patient_agg} />
          <ConfigRow label="AMP (fp16)" value={run.amp} />
          <ConfigRow label="GPU" value={run.gpu_name} />
        </section>
      </div>

      {/* Epoch curves */}
      <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-zinc-300 mb-1">Training Curves</h2>
        <p className="text-xs text-zinc-600 mb-4">
          Green dashed line marks the best epoch (epoch {Math.round(run.best_epoch)}).
        </p>
        <EpochCurves epochs={epochs} bestEpoch={Math.round(run.best_epoch)} />
      </section>

      {/* Val metrics at best epoch */}
      <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-zinc-300 mb-3">
          Validation Metrics at Best Epoch (epoch {Math.round(run.best_epoch)})
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <MetricCard label="Val AP" value={run.best_val_ap.toFixed(4)} sub="primary metric" />
          <MetricCard label="Val F1" value={run.best_val_f1.toFixed(4)} />
          <MetricCard label="Balanced Acc" value={run.best_val_balanced_acc.toFixed(4)} />
          <MetricCard label="Precision" value={run.best_val_precision.toFixed(4)} />
          <MetricCard label="Recall" value={run.best_val_recall.toFixed(4)} />
          <MetricCard
            label="Threshold"
            value={run.best_val_threshold.toFixed(3)}
            sub="tuned on val"
          />
        </div>
      </section>

      {/* Test evaluation */}
      {testReport ? (
        <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-zinc-300 mb-4">
            Test Evaluation
            <span className="ml-2 text-xs font-normal text-zinc-600">
              {testReport.n_test_patients} patients · threshold {testReport.test_threshold.toFixed(3)}
            </span>
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Confusion matrix */}
            <div>
              <p className="text-xs text-zinc-500 mb-3">Patient-level confusion matrix</p>
              <ConfusionMatrix
                tn={testReport.test_tn}
                fp={testReport.test_fp}
                fn={testReport.test_fn}
                tp={testReport.test_tp}
              />
            </div>

            {/* Test metrics */}
            <div>
              <p className="text-xs text-zinc-500 mb-3">Test metrics</p>
              <div className="grid grid-cols-2 gap-3">
                <MetricCard label="Test AP" value={testReport.test_ap.toFixed(4)} sub="primary" />
                <MetricCard label="Test ROC-AUC" value={testReport.test_roc_auc.toFixed(4)} />
                <MetricCard label="Test F1" value={testReport.test_f1.toFixed(4)} />
                <MetricCard label="Balanced Acc" value={testReport.test_balanced_acc.toFixed(4)} />
                <MetricCard label="Precision" value={testReport.test_precision.toFixed(4)} />
                <MetricCard label="Recall" value={testReport.test_recall.toFixed(4)} />
              </div>
            </div>
          </div>
        </section>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 text-center text-zinc-600 text-sm">
          No test evaluation recorded for this run.
        </div>
      )}
    </div>
  )
}
