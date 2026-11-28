import AsyncStorage from '@react-native-async-storage/async-storage';
import { Asset } from 'expo-asset';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { Platform } from 'react-native';
import type { TfliteModel, TensorflowModelDelegate } from 'react-native-fast-tflite';
import { supabase } from '@/lib/supabase';
import {
  aggregateRecentFourFullWeeks,
  computeWeeklyBaselines,
  postprocessWeeklyLogOutput,
  predictWeeklyWithCoefficients,
  preprocessWeeklyCounts,
  weeklyModelInfo,
  type RecentWeeksAggregation,
  type WeeklyForecastPrediction,
  type WeeklyModelMeta,
} from '@/utils/weekly-forecast';

export type ForecastRuntimeKind = 'tflite' | 'fallback_js';

export type ModelLifecycleState = 'idle' | 'loading' | 'ready' | 'fallback' | 'error';

export interface LoadedModelStatus {
  state: Exclude<ModelLifecycleState, 'idle' | 'loading'>;
  runtime: ForecastRuntimeKind;
  message: string;
  loadTimeMs: number;
  modelInfo: WeeklyModelMeta;
}

export interface AsyncForecastResult extends WeeklyForecastPrediction {
  runtime: ForecastRuntimeKind;
  latencyMs: number;
  fallbackReason?: string;
}

/** Cache lokal agregat non-PII (hanya 4 angka jumlah akta + label minggu + waktu sinkron). */
export interface CachedWeeklySnapshot extends RecentWeeksAggregation {
  syncedAtIso: string;
}

const DEFAULT_LOAD_TIMEOUT_MS = 8000;
const DEFAULT_INFERENCE_TIMEOUT_MS = 5000;
const SNAPSHOT_STORAGE_KEY = '@notarisai_weekly_forecast_snapshot_v1';

// Dimuat di top-level agar Metro bundler selalu menyertakan berkas .tflite ke aset APK.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const WEEKLY_TFLITE_ASSET = require('../../assets/models/weekly-forecast.tflite') as number;

let cachedTfliteModel: TfliteModel | null = null;
let cachedStatus: LoadedModelStatus | null = null;
let pendingLoad: Promise<LoadedModelStatus> | null = null;

function nowMs(): number {
  return typeof performance !== 'undefined' && typeof performance.now === 'function'
    ? performance.now()
    : Date.now();
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, timeoutMessage: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(timeoutMessage)), timeoutMs);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      },
    );
  });
}

function canUseNativeTflite(): { ok: true } | { ok: false; reason: string } {
  if (Platform.OS === 'web') {
    return {
      ok: false,
      reason: 'Runtime TFLite native hanya tersedia di build Android/iOS; Web memakai fallback lokal.',
    };
  }
  if (Constants.executionEnvironment === ExecutionEnvironment.StoreClient) {
    return {
      ok: false,
      reason: 'Expo Go tidak menyertakan modul native TFLite; gunakan APK preview/development untuk runtime .tflite.',
    };
  }
  return { ok: true };
}

/**
 * Menyalin/menyelesaikan aset `.tflite` bundel ke berkas lokal (`file://...`) melalui `expo-asset`.
 * Ini wajib pada Android Release/Preview APK karena `Image.resolveAssetSource` mengembalikan nama
 * resource tanpa protokol (`src_assets_models_weeklyforecast`), sedangkan `HybridAssetLoader`
 * di `react-native-fast-tflite` v3 membutuhkan URI dengan protokol valid (`file://` atau `http://`).
 */
async function resolveBundledTfliteUrl(timeoutMs: number): Promise<string> {
  const asset = Asset.fromModule(WEEKLY_TFLITE_ASSET);
  if (!asset.localUri) {
    await withTimeout(
      asset.downloadAsync(),
      timeoutMs,
      'Menyiapkan berkas aset model TFLite melebihi batas waktu.',
    );
  }
  const uri = asset.localUri ?? asset.uri;
  if (!uri || !/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(uri)) {
    throw new Error(`URI aset TFLite tidak memiliki protokol yang valid: ${uri || '(kosong)'}`);
  }
  return uri;
}

/**
 * Memuat model `.tflite` sekali (singleton) secara asynchronous.
 * Berjalan penuh baik saat online maupun offline (mode pesawat).
 * Jika runtime native tidak tersedia atau gagal memuat berkas model, layanan otomatis
 * beralih ke mode fallback lokal tanpa membuat aplikasi crash.
 */
export async function loadWeeklyForecastModel(options?: {
  timeoutMs?: number;
  forceReload?: boolean;
}): Promise<LoadedModelStatus> {
  const forceReload = options?.forceReload ?? false;
  if (!forceReload && cachedStatus) return cachedStatus;
  if (!forceReload && pendingLoad) return pendingLoad;

  const timeoutMs = options?.timeoutMs ?? DEFAULT_LOAD_TIMEOUT_MS;
  const started = nowMs();

  pendingLoad = (async (): Promise<LoadedModelStatus> => {
    const eligibility = canUseNativeTflite();
    if (!eligibility.ok) {
      cachedTfliteModel = null;
      cachedStatus = {
        state: 'fallback',
        runtime: 'fallback_js',
        message: eligibility.reason,
        loadTimeMs: Math.max(0, nowMs() - started),
        modelInfo: weeklyModelInfo,
      };
      return cachedStatus;
    }

    try {
      const modelUrl = await resolveBundledTfliteUrl(timeoutMs);

      // Lazy require agar modul Nitro C++ tidak diinisialisasi di lingkungan yang tidak mendukung.
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const tflite = require('react-native-fast-tflite') as {
        loadTensorflowModel: (
          source: number | { url: string },
          delegates: TensorflowModelDelegate[],
        ) => Promise<TfliteModel>;
      };

      // Delegate kosong ([]) memakai CPU standar TFLite agar stabil di semua perangkat Android/iOS.
      const loaded = await withTimeout(
        tflite.loadTensorflowModel({ url: modelUrl }, []),
        timeoutMs,
        'Pemuatan model TFLite melebihi batas waktu.',
      );

      cachedTfliteModel = loaded;
      cachedStatus = {
        state: 'ready',
        runtime: 'tflite',
        message: `Model TFLite (${(weeklyModelInfo.tfliteSizeBytes / 1024).toFixed(2)} KB) aktif di perangkat — siap dipakai saat online maupun offline.`,
        loadTimeMs: Math.max(0, nowMs() - started),
        modelInfo: weeklyModelInfo,
      };
      return cachedStatus;
    } catch (error) {
      cachedTfliteModel = null;
      const reason = error instanceof Error ? error.message : 'Gagal memuat runtime TFLite.';
      cachedStatus = {
        state: 'fallback',
        runtime: 'fallback_js',
        message: `Model TFLite belum dapat dimuat (${reason}). Menggunakan perhitungan lokal yang setara agar fitur tetap dapat dipakai.`,
        loadTimeMs: Math.max(0, nowMs() - started),
        modelInfo: weeklyModelInfo,
      };
      return cachedStatus;
    } finally {
      pendingLoad = null;
    }
  })();

  return pendingLoad;
}

/**
 * Menjalankan inferensi prediksi akta reguler mingguan secara asynchronous.
 * Preprocessing input identik dengan pipeline training Python (`log1p` + standardisasi train set).
 */
export async function runWeeklyForecast(
  counts: readonly number[],
  options?: { timeoutMs?: number },
): Promise<AsyncForecastResult> {
  const timeoutMs = options?.timeoutMs ?? DEFAULT_INFERENCE_TIMEOUT_MS;
  const status = await loadWeeklyForecastModel();
  const started = nowMs();

  if (status.runtime === 'tflite' && cachedTfliteModel) {
    try {
      const inputTensor = preprocessWeeklyCounts(counts, weeklyModelInfo);
      // Salin ke ArrayBuffer baru (byteOffset === 0) untuk JSI/Nitro TFLite.
      const inputBuffer = new ArrayBuffer(inputTensor.byteLength);
      new Float32Array(inputBuffer).set(inputTensor);
      const outputs = await withTimeout(
        cachedTfliteModel.run([inputBuffer]),
        timeoutMs,
        'Inferensi model TFLite melebihi batas waktu.',
      );

      const firstOutput = outputs[0];
      if (!firstOutput) {
        throw new Error('Keluaran tensor TFLite kosong.');
      }
      const outView = new Float32Array(firstOutput);
      const prediction = postprocessWeeklyLogOutput(outView[0]);
      const baselines = computeWeeklyBaselines(counts);
      return {
        prediction,
        baseline: baselines.naiveLag1,
        baselines,
        outsideTrainingRange: counts.some((n) => n > weeklyModelInfo.maxObservedWeeklyCount),
        runtime: 'tflite',
        latencyMs: Math.max(0, nowMs() - started),
      };
    } catch (error) {
      const fallback = predictWeeklyWithCoefficients(counts, weeklyModelInfo);
      const reason = error instanceof Error ? error.message : 'Inferensi TFLite gagal.';
      return {
        ...fallback,
        runtime: 'fallback_js',
        latencyMs: Math.max(0, nowMs() - started),
        fallbackReason: `Beralih ke fallback lokal karena inferensi TFLite gagal: ${reason}`,
      };
    }
  }

  // Beri jeda microtask singkat agar UI sempat merender state "Menginferensi" secara responsif.
  await Promise.resolve();
  const fallback = predictWeeklyWithCoefficients(counts, weeklyModelInfo);
  return {
    ...fallback,
    runtime: 'fallback_js',
    latencyMs: Math.max(0, nowMs() - started),
    fallbackReason: status.message,
  };
}

/** Menyimpan ringkasan agregat 4 minggu terakhir (tanpa PII) agar tetap tersedia saat offline. */
export async function saveCachedWeeklySnapshot(snapshot: CachedWeeklySnapshot): Promise<void> {
  try {
    await AsyncStorage.setItem(SNAPSHOT_STORAGE_KEY, JSON.stringify(snapshot));
  } catch {
    /* abaikan kegagalan cache lokal */
  }
}

/** Memuat ringkasan agregat 4 minggu terakhir yang tersimpan di perangkat untuk penggunaan offline. */
export async function loadCachedWeeklySnapshot(): Promise<CachedWeeklySnapshot | null> {
  try {
    const raw = await AsyncStorage.getItem(SNAPSHOT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<CachedWeeklySnapshot>;
    if (
      !Array.isArray(parsed.counts) ||
      parsed.counts.length !== 4 ||
      !Array.isArray(parsed.weekRanges) ||
      parsed.weekRanges.length !== 4 ||
      typeof parsed.syncedAtIso !== 'string'
    ) {
      return null;
    }
    return {
      counts: parsed.counts as [number, number, number, number],
      weekRanges: parsed.weekRanges as [string, string, string, string],
      totalRegularDeeds: typeof parsed.totalRegularDeeds === 'number' ? parsed.totalRegularDeeds : 0,
      excludedBatchPg: typeof parsed.excludedBatchPg === 'number' ? parsed.excludedBatchPg : 0,
      syncedAtIso: parsed.syncedAtIso,
    };
  } catch {
    return null;
  }
}

/**
 * Mengambil ringkasan 4 minggu penuh terakhir langsung dari tabel `akta` (hanya kolom
 * `tanggal` dan `jenis`, tanpa nama penghadap/PII) secara silent tanpa memunculkan Alert.
 * Jika offline atau jaringan gagal, mengembalikan `{ ok: false }` agar UI tetap tenang
 * dan beralih ke cache lokal.
 */
export async function syncRecentWeeksFromSupabase(): Promise<
  { ok: true; snapshot: CachedWeeklySnapshot } | { ok: false }
> {
  try {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 40);
    const cutoffIso = [
      cutoff.getFullYear(),
      String(cutoff.getMonth() + 1).padStart(2, '0'),
      String(cutoff.getDate()).padStart(2, '0'),
    ].join('-');

    const { data, error } = await withTimeout(
      Promise.resolve(
        supabase
          .from('akta')
          .select('tanggal, jenis')
          .gte('tanggal', cutoffIso)
          .order('tanggal', { ascending: true }),
      ),
      5000,
      'Sinkronisasi Repertorium melebihi batas waktu.',
    );

    if (error || !data) return { ok: false };

    const rows = (data as { tanggal?: string | null; jenis?: string | null }[])
      .filter((r): r is { tanggal: string; jenis: string } => Boolean(r.tanggal && r.jenis));

    const agg = aggregateRecentFourFullWeeks(rows);
    const snapshot: CachedWeeklySnapshot = {
      ...agg,
      syncedAtIso: new Date().toISOString(),
    };
    await saveCachedWeeklySnapshot(snapshot);
    return { ok: true, snapshot };
  } catch {
    // Mode offline / DNS unreachable: tangani diam-diam tanpa pop-up Alert.
    return { ok: false };
  }
}

/** Mereset cache model untuk pengujian atau pemuatan ulang manual. */
export function resetWeeklyForecastModel(): void {
  cachedTfliteModel = null;
  cachedStatus = null;
  pendingLoad = null;
}
