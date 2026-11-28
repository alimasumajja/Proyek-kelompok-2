import modelMeta from '../assets/models/weekly-forecast-meta.json';

export interface WeeklyModelMeta {
  version: string;
  format: string;
  quantization: string;
  tfliteSizeBytes: number;
  targetScope: string;
  trainedRange: { start: string; end: string; pairs: number };
  holdoutTestRange: { start: string; end: string; pairs: number };
  sourceSha256: string;
  matchesReferenceDataset: boolean;
  lags: number;
  alpha: number;
  transform: string;
  inputOrder: string;
  coefficientOrder: string;
  mean: number[];
  scale: number[];
  weights: number[];
  intercept: number;
  maxObservedWeeklyCount: number;
  holdoutSummary: {
    model: { mae: number; rmse: number };
    baselines: {
      naive_lag1: { mae: number; rmse: number };
      ma4: { mae: number; rmse: number };
    };
  };
}

export interface WeeklyBaselines {
  naiveLag1: number;
  ma4: number;
}

export interface WeeklyForecastPrediction {
  prediction: number;
  /** @deprecated Gunakan `baselines.naiveLag1` untuk kejelasan. */
  baseline: number;
  baselines: WeeklyBaselines;
  outsideTrainingRange: boolean;
}

export interface DeedSummaryRecord {
  tanggal: string;
  jenis: string;
}

export interface RecentWeeksAggregation {
  counts: [number, number, number, number];
  weekRanges: [string, string, string, string];
  totalRegularDeeds: number;
  excludedBatchPg: number;
}

export const weeklyModelInfo = modelMeta as WeeklyModelMeta;

export const MAX_WEEKLY_INPUT = 10000;

const SHORT_MONTHS_ID = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'Mei',
  'Jun',
  'Jul',
  'Agu',
  'Sep',
  'Okt',
  'Nov',
  'Des',
] as const;

/** Memvalidasi empat bilangan bulat 0–10.000 dalam urutan kronologis (paling lama ke paling baru). */
export function validateWeeklyCounts(counts: readonly number[]): void {
  if (
    counts.length !== 4 ||
    counts.some((n) => !Number.isSafeInteger(n) || n < 0 || n > MAX_WEEKLY_INPUT)
  ) {
    throw new Error('Isi empat minggu dengan bilangan bulat 0–10.000.');
  }
}

/** Menolak nilai kosong agar minggu yang belum diketahui tidak dianggap nol secara diam-diam. */
export function parseWeeklyCounts(values: readonly string[]): number[] {
  if (values.length !== 4 || values.some((v) => !/^\d{1,5}$/.test(v.trim()))) {
    throw new Error('Lengkapi empat minggu dengan angka bulat. Isi 0 hanya jika tidak ada akta.');
  }
  const counts = values.map((v) => Number(v.trim()));
  validateWeeklyCounts(counts);
  return counts;
}

/** Memisahkan akta batch Personal Guarantee dari akta reguler/organik kantor (selaras dengan train.py). */
export function isRegularDeedType(jenis: string): boolean {
  return !jenis.toLowerCase().includes('personal guarantee');
}

function parseFlexibleDate(value: string): Date | null {
  const trimmed = value.trim();
  const dmy = /^(\d{2})-(\d{2})-(\d{4})$/.exec(trimmed);
  if (dmy) {
    const day = Number(dmy[1]);
    const month = Number(dmy[2]);
    const year = Number(dmy[3]);
    const d = new Date(year, month - 1, day);
    if (d.getFullYear() === year && d.getMonth() === month - 1 && d.getDate() === day) {
      return d;
    }
    return null;
  }
  const iso = /^(\d{4})-(\d{2})-(\d{2})/.exec(trimmed);
  if (iso) {
    const year = Number(iso[1]);
    const month = Number(iso[2]);
    const day = Number(iso[3]);
    const d = new Date(year, month - 1, day);
    if (d.getFullYear() === year && d.getMonth() === month - 1 && d.getDate() === day) {
      return d;
    }
  }
  return null;
}

function startOfDayLocal(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDaysLocal(date: Date, days: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

function formatRangeShort(start: Date, end: Date): string {
  const s = `${start.getDate()} ${SHORT_MONTHS_ID[start.getMonth()]}`;
  const e = `${end.getDate()} ${SHORT_MONTHS_ID[end.getMonth()]}`;
  return `${s} – ${e}`;
}

/**
 * Mengelompokkan akta reguler Repertorium ke dalam 4 minggu penuh terakhir (Senin–Minggu)
 * sebelum minggu berjalan. Tidak memproses atau menyimpan identitas penghadap (PII).
 */
export function aggregateRecentFourFullWeeks(
  aktaList: readonly DeedSummaryRecord[],
  referenceDate: Date = new Date(),
): RecentWeeksAggregation {
  const ref = startOfDayLocal(referenceDate);
  // 0=Minggu, 1=Senin, ..., 6=Sabtu -> offset dari Senin minggu berjalan.
  const daysSinceMonday = (ref.getDay() + 6) % 7;
  const currentWeekMonday = addDaysLocal(ref, -daysSinceMonday);

  const starts = [
    addDaysLocal(currentWeekMonday, -28),
    addDaysLocal(currentWeekMonday, -21),
    addDaysLocal(currentWeekMonday, -14),
    addDaysLocal(currentWeekMonday, -7),
  ];

  const counts: [number, number, number, number] = [0, 0, 0, 0];
  let totalRegularDeeds = 0;
  let excludedBatchPg = 0;

  for (const item of aktaList) {
    const parsed = parseFlexibleDate(item.tanggal);
    if (!parsed) continue;
    const t = parsed.getTime();
    if (t < starts[0].getTime() || t >= currentWeekMonday.getTime()) continue;

    if (!isRegularDeedType(item.jenis)) {
      excludedBatchPg += 1;
      continue;
    }

    const diffDays = Math.floor((t - starts[0].getTime()) / (24 * 60 * 60 * 1000));
    const bucket = Math.floor(diffDays / 7);
    if (bucket >= 0 && bucket < 4) {
      counts[bucket] += 1;
      totalRegularDeeds += 1;
    }
  }

  const weekRanges: [string, string, string, string] = [
    formatRangeShort(starts[0], addDaysLocal(starts[0], 6)),
    formatRangeShort(starts[1], addDaysLocal(starts[1], 6)),
    formatRangeShort(starts[2], addDaysLocal(starts[2], 6)),
    formatRangeShort(starts[3], addDaysLocal(starts[3], 6)),
  ];

  return {
    counts,
    weekRanges,
    totalRegularDeeds,
    excludedBatchPg,
  };
}

/**
 * Preprocessing identik dengan pipeline Python (`train_weekly_forecast.py`):
 * 1. Balik urutan input kronologis [t-4, t-3, t-2, t-1] -> lag [t-1, t-2, t-3, t-4].
 * 2. Transformasi log1p(x).
 * 3. Standardisasi (log1p(x) - mean) / scale menggunakan statistik partisi latih.
 */
export function preprocessWeeklyCounts(
  counts: readonly number[],
  meta: Pick<WeeklyModelMeta, 'mean' | 'scale'> = weeklyModelInfo,
): Float32Array {
  validateWeeklyCounts(counts);
  const newestFirst = [...counts].reverse();
  const tensor = new Float32Array(4);
  for (let i = 0; i < 4; i += 1) {
    const scale = meta.scale[i] === 0 ? 1 : meta.scale[i];
    tensor[i] = (Math.log1p(newestFirst[i]) - meta.mean[i]) / scale;
  }
  return tensor;
}

/** Mengembalikan output ruang log1p dari model menjadi perkiraan jumlah akta (>= 0). */
export function postprocessWeeklyLogOutput(yLog: number): number {
  if (!Number.isFinite(yLog)) {
    throw new Error('Model tidak dapat menghitung prediksi.');
  }
  const prediction = Math.expm1(yLog);
  if (!Number.isFinite(prediction)) {
    throw new Error('Model tidak dapat menghitung prediksi.');
  }
  return Math.max(0, prediction);
}

/** Baseline pembanding wajib: minggu terakhir (Naive lag-1) dan rata-rata 4 minggu (MA-4). */
export function computeWeeklyBaselines(counts: readonly number[]): WeeklyBaselines {
  validateWeeklyCounts(counts);
  const sum = counts[0] + counts[1] + counts[2] + counts[3];
  return {
    naiveLag1: counts[3],
    ma4: sum / 4,
  };
}

/**
 * Jalur inferensi fallback berbasis koefisien matematis yang setara dengan graf Dense(1)
 * pada berkas `.tflite`. Dipakai otomatis bila runtime native TFLite tidak tersedia
 * (Expo Go, Web) atau gagal dimuat, agar aplikasi tetap berjalan tanpa crash.
 */
export function predictWeeklyWithCoefficients(
  counts: readonly number[],
  meta: Pick<
    WeeklyModelMeta,
    'mean' | 'scale' | 'weights' | 'intercept' | 'maxObservedWeeklyCount'
  > = weeklyModelInfo,
): WeeklyForecastPrediction {
  const z = preprocessWeeklyCounts(counts, meta);
  let yLog = meta.intercept;
  for (let i = 0; i < 4; i += 1) {
    yLog += z[i] * meta.weights[i];
  }
  const prediction = postprocessWeeklyLogOutput(yLog);
  const baselines = computeWeeklyBaselines(counts);
  return {
    prediction,
    baseline: baselines.naiveLag1,
    baselines,
    outsideTrainingRange: counts.some((n) => n > meta.maxObservedWeeklyCount),
  };
}

/** Wrapper sinkron untuk pengujian unit & komputasi fallback. */
export function predictWeeklyDeeds(counts: readonly number[]): WeeklyForecastPrediction {
  return predictWeeklyWithCoefficients(counts, weeklyModelInfo);
}
