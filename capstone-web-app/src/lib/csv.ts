import path from 'path'
import { readFile } from 'fs/promises'
import Papa from 'papaparse'

const REPORTS = path.join(process.cwd(), 'Reports')

export interface Run {
  run_id: string
  run_note: string
  tag: string
  seed: number
  timestamp_start: string
  timestamp_end: string
  duration_s: number
  n_train_patients: number
  n_val_patients: number
  n_test_patients: number
  n_train_slices: number
  n_val_slices: number
  n_test_slices: number
  hgg_train: number
  lgg_train: number
  epochs_planned: number
  epochs_actual: number
  best_epoch: number
  best_val_ap: number
  best_val_f1: number
  best_val_balanced_acc: number
  best_val_precision: number
  best_val_recall: number
  best_val_threshold: number
  best_model_path: string
  topk: number
  context_slices: number
  out_hw: string
  norm_mode: string
  add_tumor_mask_channel: boolean
  bbox_margin: number
  min_bbox_size: number
  epochs_cfg: number
  lr: number
  weight_decay: number
  loss_type: string
  amp: boolean
  grad_clip: number
  focal_gamma: number
  max_lgg_weight: number
  use_cosine: boolean
  warmup_epochs: number
  early_stop_patience: number
  patient_agg: string
  device: string
  gpu_name: string
  n_workers: number
  data_fingerprint: string
}

export interface Epoch {
  run_id: string
  epoch: number
  train_loss: number
  epoch_time_s: number
  lr_current: number
  is_best: number
  val_ap: number
  val_roc_auc: number
  val_f1: number
  val_balanced_acc: number
  val_precision: number
  val_recall: number
  val_threshold: number
  val_tn: number
  val_fp: number
  val_fn: number
  val_tp: number
}

export interface TestReport {
  run_id: string
  timestamp: string
  n_test_patients: number
  test_ap: number
  test_roc_auc: number
  test_f1: number
  test_balanced_acc: number
  test_precision: number
  test_recall: number
  test_threshold: number
  test_tn: number
  test_fp: number
  test_fn: number
  test_tp: number
}

export type RunWithTest = Run & { test?: TestReport }

function coerceBool(val: unknown): boolean {
  return val === 'True' || val === true
}

export async function parseRuns(): Promise<Run[]> {
  const csv = await readFile(path.join(REPORTS, 'runs.csv'), 'utf-8')
  const { data } = Papa.parse<Record<string, unknown>>(csv, {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
  })
  return data.map(row => ({
    ...row,
    add_tumor_mask_channel: coerceBool(row.add_tumor_mask_channel),
    amp: coerceBool(row.amp),
    use_cosine: coerceBool(row.use_cosine),
  })) as Run[]
}

export async function parseEpochs(runId?: string): Promise<Epoch[]> {
  const csv = await readFile(path.join(REPORTS, 'epochs.csv'), 'utf-8')
  const { data } = Papa.parse<Epoch>(csv, {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
  })
  if (runId) return data.filter(e => e.run_id === runId)
  return data
}

export async function parseTestReports(): Promise<TestReport[]> {
  const csv = await readFile(path.join(REPORTS, 'test_reports.csv'), 'utf-8')
  const { data } = Papa.parse<TestReport>(csv, {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
  })
  return data
}

/**
 * A run is considered complete if:
 *  - it has a test report
 *  - neither val AP nor test AP is effectively 1.0 (suspiciously perfect)
 */
export function isRunComplete(run: RunWithTest): boolean {
  if (!run.test) return false
  if (run.best_val_ap >= 1 - 1e-9) return false
  if (run.test.test_ap >= 1 - 1e-9) return false
  return true
}

export async function getRunsWithTest(): Promise<RunWithTest[]> {
  const [runs, testReports] = await Promise.all([parseRuns(), parseTestReports()])
  const testByRunId = new Map(testReports.map(t => [t.run_id, t]))
  return runs.map(run => ({
    ...run,
    test: testByRunId.get(run.run_id),
  }))
}
