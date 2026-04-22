import Image from 'next/image'
import Link from 'next/link'
import { getRunsWithTest, parseEpochs, isRunComplete } from '@/lib/csv'
import { EpochCurves } from '@/components/epoch-curves'

export const revalidate = 60

export default async function AboutPage() {
  const allRuns = await getRunsWithTest()
  const runs = allRuns.filter(isRunComplete)

  const bestRun = runs.reduce((best, r) =>
    r.best_val_ap > best.best_val_ap ? r : best
  )
  const epochs = await parseEpochs(bestRun.run_id)

  return (
    <div className="space-y-16 max-w-4xl mx-auto">

      {/* Section A — Hero */}
      <section className="pt-4">
        <h1 className="text-3xl font-bold text-zinc-100">About This Project</h1>
        <p className="text-zinc-400 mt-4 leading-relaxed">
          This project explores the use of deep learning for brain tumor grade prediction from MRI
          scans. The application presents model results, training insights, and visual examples from
          the imaging pipeline. It is designed to make the project easier to understand by combining
          technical explanations, training metrics, and representative MRI modality views in one place.
        </p>
      </section>

      {/* Section B — Project Overview */}
      <section>
        <h2 className="text-xl font-semibold text-zinc-100 mb-3">Project Overview</h2>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <p className="text-zinc-400 leading-relaxed">
            The core objective of this work is to classify brain tumors into low-grade or high-grade
            categories using multi-modal MRI data. Rather than relying on a single imaging sequence,
            the model uses complementary information from several MRI modalities to better capture
            tumor appearance, tissue characteristics, and surrounding abnormalities.
          </p>
          <p className="text-zinc-400 leading-relaxed mt-4">
            This web application serves as the presentation layer for the project. It summarizes the
            training workflow, the type of data used, and the performance trends observed during model
            development.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            {[
              { label: 'Task', value: 'Binary Classification' },
              { label: 'Classes', value: 'Low Grade · High Grade' },
              { label: 'Model', value: 'ResNet50 (4-channel)' },
              { label: 'Input', value: 'Multi-modal MRI' },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="bg-zinc-800/60 border border-zinc-700/50 rounded-lg px-4 py-2"
              >
                <p className="text-xs text-zinc-500">{label}</p>
                <p className="text-sm font-medium text-zinc-200 mt-0.5">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section C — MRI Modalities */}
      <section>
        <h2 className="text-xl font-semibold text-zinc-100 mb-3">MRI Modalities Used</h2>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-6">
          <p className="text-zinc-400 leading-relaxed">
            The model uses four MRI modalities, each capturing different tissue properties:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              {
                name: 'T1',
                desc: 'Provides structural anatomical detail.',
                color: 'text-sky-400',
                border: 'border-sky-800/40',
                bg: 'bg-sky-900/10',
              },
              {
                name: 'T1c',
                desc: 'Contrast-enhanced T1, useful for highlighting enhancing tumor regions.',
                color: 'text-violet-400',
                border: 'border-violet-800/40',
                bg: 'bg-violet-900/10',
              },
              {
                name: 'T2',
                desc: 'Emphasizes fluid-sensitive signal and broader tissue differences.',
                color: 'text-amber-400',
                border: 'border-amber-800/40',
                bg: 'bg-amber-900/10',
              },
              {
                name: 'FLAIR',
                desc: 'Suppresses CSF signal, making edema and lesion-related abnormalities more visible.',
                color: 'text-emerald-400',
                border: 'border-emerald-800/40',
                bg: 'bg-emerald-900/10',
              },
            ].map(({ name, desc, color, border, bg }) => (
              <div key={name} className={`rounded-lg border ${border} ${bg} px-4 py-3`}>
                <p className={`text-sm font-semibold ${color}`}>{name}</p>
                <p className="text-sm text-zinc-400 mt-1">{desc}</p>
              </div>
            ))}
          </div>
          <p className="text-zinc-500 text-sm">
            Using these modalities together allows the model to learn from multiple views of the same
            case instead of depending on a single scan type.
          </p>

          {/* MRI image grid */}
          <div>
            <div className="rounded-xl overflow-hidden border border-zinc-700">
              <Image
                src="/mri-modalities.png"
                alt="Sample patient MRI slices across T1, T1c, T2, and FLAIR modalities"
                width={1200}
                height={400}
                className="w-full object-contain bg-zinc-950"
                priority
              />
            </div>
            <div className="mt-2 flex justify-center gap-6">
              {['T1', 'T1c', 'T2', 'FLAIR'].map((label) => (
                <span key={label} className="text-xs font-medium text-zinc-500">
                  {label}
                </span>
              ))}
            </div>
            <p className="text-xs text-zinc-600 mt-1 text-center">
              Example MRI slices from a sample patient across the four modalities used by the model.
            </p>
          </div>
        </div>
      </section>

      {/* Section D — Dataset and Pipeline */}
      <section>
        <h2 className="text-xl font-semibold text-zinc-100 mb-3">Dataset and Processing Pipeline</h2>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
          <p className="text-zinc-400 leading-relaxed">
            The project is based on a curated brain MRI dataset prepared for tumor grade prediction.
            The preprocessing and training pipeline were designed to convert raw imaging data into
            model-ready inputs suitable for supervised learning.
          </p>
          <p className="text-zinc-400 text-sm mb-2">At a high level, the workflow includes:</p>
          <ol className="space-y-2">
            {[
              'Organizing the MRI data by patient and modality',
              'Preparing consistent model inputs from the available scans',
              'Training a classification model on the processed data',
              'Monitoring performance across training sessions using tracked metrics',
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-400 text-xs font-medium flex items-center justify-center mt-0.5">
                  {i + 1}
                </span>
                <span className="text-sm text-zinc-400">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Section E — Model Training Summary */}
      <section>
        <h2 className="text-xl font-semibold text-zinc-100 mb-3">Model Training</h2>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
          <p className="text-zinc-400 leading-relaxed">
            The model was trained as a supervised binary classifier to distinguish low-grade from
            high-grade tumor cases. During development, training runs were monitored using standard
            learning curves and evaluation metrics to understand convergence behavior and model quality.
          </p>
          <p className="text-zinc-400 leading-relaxed">
            Two particularly useful views are:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-lg px-4 py-3">
              <p className="text-sm font-semibold text-orange-400">Loss vs Epoch</p>
              <p className="text-sm text-zinc-400 mt-1">
                Shows how the optimization process evolves over time.
              </p>
            </div>
            <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-lg px-4 py-3">
              <p className="text-sm font-semibold text-indigo-400">Average Precision vs Epoch</p>
              <p className="text-sm text-zinc-400 mt-1">
                Shows how predictive performance changes across epochs, especially in imbalanced
                classification settings.
              </p>
            </div>
          </div>
          <p className="text-zinc-500 text-sm">
            These visualizations help interpret whether a training run is learning effectively,
            stabilizing, or beginning to overfit.
          </p>
        </div>
      </section>

      {/* Section F — Training Charts */}
      <section>
        <h2 className="text-xl font-semibold text-zinc-100 mb-1">Training Run Visualizations</h2>
        <p className="text-sm text-zinc-500 mb-4">
          Charts from the best-performing run —{' '}
          <Link
            href={`/runs/${bestRun.run_id}`}
            className="font-mono text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            {bestRun.run_id}
          </Link>{' '}
          (Val AP {bestRun.best_val_ap.toFixed(4)}).
        </p>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-zinc-300 mb-1">
            Train Loss &amp; Val AP vs Epoch
          </h3>
          <p className="text-xs text-zinc-600 mb-4">
            Green dashed line marks the best epoch (epoch {Math.round(bestRun.best_epoch)}).
            Left axis: train loss (orange). Right axis: val AP and val F1 (indigo / teal).
          </p>
          <EpochCurves epochs={epochs} bestEpoch={Math.round(bestRun.best_epoch)} />
          <p className="text-xs text-zinc-600 mt-3 text-center">
            Example training curves from the best run, used to evaluate optimization progress and
            predictive performance.
          </p>
        </div>
      </section>

      {/* Section G — Metrics Explanation */}
      <section>
        <h2 className="text-xl font-semibold text-zinc-100 mb-3">Key Metrics</h2>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
          <p className="text-zinc-400 leading-relaxed">
            The application highlights performance metrics that help interpret model quality beyond a
            single accuracy value.
          </p>
          <div className="space-y-3">
            {[
              {
                name: 'Loss',
                desc: 'Reflects how far model predictions are from the expected labels during training.',
                color: 'text-orange-400',
              },
              {
                name: 'Average Precision (AP)',
                desc: 'Summarizes precision-recall behavior and is especially informative for imbalanced classification tasks.',
                color: 'text-indigo-400',
              },
              {
                name: 'Other metrics',
                desc: 'Additional metrics shown elsewhere in the application (F1, balanced accuracy, ROC-AUC) should be interpreted alongside these curves rather than in isolation.',
                color: 'text-zinc-400',
              },
            ].map(({ name, desc, color }) => (
              <div
                key={name}
                className="flex gap-3 items-start border-b border-zinc-800/60 pb-3 last:border-0 last:pb-0"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-current mt-2 flex-shrink-0" style={{ color: 'inherit' }} />
                <div>
                  <p className={`text-sm font-semibold ${color}`}>{name}</p>
                  <p className="text-sm text-zinc-400 mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section H — Web App Purpose */}
      <section className="pb-8">
        <h2 className="text-xl font-semibold text-zinc-100 mb-3">Why This Application Exists</h2>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
          <p className="text-zinc-400 leading-relaxed">
            This application was built to make the project easier to explore and communicate. Instead
            of leaving the work only in notebooks or training logs, the web interface brings together:
          </p>
          <ul className="space-y-2">
            {[
              'Project background and problem context',
              'Modality examples showing what the model sees',
              'Training charts from individual run sessions',
              'Key evaluation metrics at a glance',
              'A clearer narrative around the end-to-end workflow',
            ].map((item) => (
              <li key={item} className="flex items-center gap-2 text-sm text-zinc-400">
                <span className="w-1 h-1 rounded-full bg-zinc-600 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
          <p className="text-zinc-500 text-sm">
            The goal is to present the project in a way that is useful both for technical review and
            for general understanding.
          </p>
          <div className="pt-2 flex gap-3 flex-wrap">
            <Link
              href="/"
              className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              View Experiment Overview →
            </Link>
            <Link
              href="/runs"
              className="text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              Browse All Runs →
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
