# Model4 — Column Reference

Documents all columns in the CSV report files.

---

## Run ID Format

Pattern: `run_{YYYYMMDD}_{HHMMSS}[_{tag}]`

| Part | Meaning |
|------|---------|
| `YYYYMMDD` | Date the run started (e.g. `20260323`) |
| `HHMMSS` | Time the run started, 24-hour (e.g. `142530`) |
| `tag` | Optional short description from `RunCfg.tag` (e.g. `focal-lr3e4`) |

Runs sort chronologically by lexicographic order on the run_id string.

---

## runs.csv — One row per training run

### Run Metadata
| Column | Type | Description |
|--------|------|-------------|
| `run_id` | str | Unique run identifier |
| `run_note` | str | Free-text from `RunCfg.note` — what is different about this run? |
| `tag` | str | Short tag from `RunCfg.tag`, also embedded in run_id |
| `seed` | int | Random seed from `RunCfg.seed` |
| `timestamp_start` | ISO datetime | When training began |
| `timestamp_end` | ISO datetime | When training finished |
| `duration_s` | float | Total training duration in seconds |

### Dataset Counts
| Column | Type | Description |
|--------|------|-------------|
| `n_train_patients` | int | Patients in training split |
| `n_val_patients` | int | Patients in validation split |
| `n_test_patients` | int | Patients in test split |
| `n_train_slices` | int | Preprocessed slices in training tensor bank |
| `n_val_slices` | int | Preprocessed slices in validation tensor bank |
| `n_test_slices` | int | Preprocessed slices in test tensor bank |
| `hgg_train` | int | HGG (label=0) patient count in training split |
| `lgg_train` | int | LGG (label=1) patient count in training split |
| `data_fingerprint` | str | MD5 hash of sorted patient IDs (first 12 chars). Differs if dataset changes between runs. |

### Training Outcome
| Column | Type | Description |
|--------|------|-------------|
| `epochs_planned` | int | `TrainCfg.epochs` (may not all run if early-stopped) |
| `epochs_actual` | int | Actual number of epochs completed |
| `best_epoch` | int | Epoch number at which the best model was saved |
| `best_val_ap` | float | **Primary metric.** Best validation AP (PR-AUC for LGG class). Threshold-free. |
| `best_val_f1` | float | Validation F1 for LGG at best epoch |
| `best_val_balanced_acc` | float | Validation balanced accuracy at best epoch |
| `best_val_precision` | float | Validation precision for LGG at best epoch |
| `best_val_recall` | float | Validation recall for LGG at best epoch |
| `best_val_threshold` | float | Decision threshold tuned on validation set at best epoch |
| `best_model_path` | str | Absolute path to saved `.pt` file |

### Preprocessing Config (PreprocCfg)
| Column | Type | Description |
|--------|------|-------------|
| `topk` | int | Top-K slices per patient by tumor area fraction |
| `context_slices` | int | Context slices added around each top-K slice (±N) |
| `out_hw` | str | Output image size as `(H, W)` string |
| `norm_mode` | str | Normalization: `robust_z` (median/IQR, clipped) or `pct01` (1st-99th pct) |
| `add_tumor_mask_channel` | bool | Whether tumor mask was added as an extra channel |
| `bbox_margin` | int | Pixel margin added around bounding box |
| `min_bbox_size` | int | Minimum bounding box side length in pixels |

### Training Config (TrainCfg)
| Column | Type | Description |
|--------|------|-------------|
| `epochs_cfg` | int | Planned epoch count (`TrainCfg.epochs`) |
| `lr` | float | Initial learning rate for AdamW |
| `weight_decay` | float | AdamW L2 weight decay |
| `loss_type` | str | `weighted_ce` or `focal` |
| `amp` | bool | Automatic mixed precision (float16) enabled |
| `grad_clip` | float | Gradient clipping max norm (0 = disabled) |
| `focal_gamma` | float | Focal loss gamma (only relevant when `loss_type=focal`) |
| `max_lgg_weight` | float | Cap on LGG class weight |
| `use_cosine` | bool | Cosine LR schedule with linear warmup |
| `warmup_epochs` | int | Linear warmup duration in epochs |
| `early_stop_patience` | int | Stop if val AP doesn't improve for this many consecutive epochs |
| `patient_agg` | str | Slice-to-patient aggregation: `mean` or `max` |

### Hardware
| Column | Type | Description |
|--------|------|-------------|
| `device` | str | Torch device used (e.g. `cuda`, `cpu`) |
| `gpu_name` | str | GPU model name from `torch.cuda.get_device_name()` |
| `n_workers` | int | Parallel threads/processes used in data preparation |

---

## epochs.csv — One row per epoch per run

| Column | Type | Description |
|--------|------|-------------|
| `run_id` | str | Foreign key → `runs.csv` |
| `epoch` | int | Epoch number (1-indexed) |
| `train_loss` | float | Mean training loss over all batches |
| `epoch_time_s` | float | Wall-clock time for this epoch (seconds) |
| `lr_current` | float | Learning rate at end of epoch (after scheduler step) |
| `is_best` | int | `1` if this epoch had the best val AP so far, else `0` |
| `val_ap` | float | Validation AP (PR-AUC for LGG) — primary metric |
| `val_roc_auc` | float | Validation ROC-AUC (less informative under class imbalance) |
| `val_f1` | float | Validation F1 for LGG class |
| `val_balanced_acc` | float | Validation balanced accuracy |
| `val_precision` | float | Validation precision for LGG |
| `val_recall` | float | Validation recall for LGG |
| `val_threshold` | float | Decision threshold tuned on val set this epoch |
| `val_tn` | int | True negatives (HGG → HGG) |
| `val_fp` | int | False positives (HGG → LGG) |
| `val_fn` | int | False negatives (LGG → HGG) |
| `val_tp` | int | True positives (LGG → LGG) |

---

## test_reports.csv — One row per run after test evaluation

| Column | Type | Description |
|--------|------|-------------|
| `run_id` | str | Foreign key → `runs.csv` |
| `timestamp` | ISO datetime | When test evaluation was run |
| `n_test_patients` | int | Number of patients in test set |
| `test_ap` | float | Test AP (PR-AUC for LGG) |
| `test_roc_auc` | float | Test ROC-AUC |
| `test_f1` | float | Test F1 for LGG |
| `test_balanced_acc` | float | Test balanced accuracy |
| `test_precision` | float | Test precision for LGG |
| `test_recall` | float | Test recall for LGG |
| `test_threshold` | float | Threshold applied (tuned on val set, applied here) |
| `test_tn` | int | True negatives |
| `test_fp` | int | False positives |
| `test_fn` | int | False negatives |
| `test_tp` | int | True positives |

---

## File Formats

### Best Model: `best_models/{run_id}.pt`
Saved with `torch.save(model.state_dict(), path)`.  
Load with:
```python
from torchvision.models import resnet50
model = make_resnet50_inchannels(num_in_channels=4, num_classes=2, pretrained=False)
model.load_state_dict(torch.load(path, map_location='cpu'))
```

### PR Curve: `pr_curves/{run_id}.npz`
Saved with `np.savez_compressed(path, precision=..., recall=..., thresholds=..., y_true=..., p_lgg=...)`.  
Arrays from `sklearn.metrics.precision_recall_curve` on the **test set** at **patient level**.  
Load with: `data = np.load(path)` then `data['precision']`, `data['recall']`, etc.