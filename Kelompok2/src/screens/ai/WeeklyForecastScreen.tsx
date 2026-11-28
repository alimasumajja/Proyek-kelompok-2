import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText, Badge, Button, Input } from '@/components/atoms';
import { InfoNote } from '@/components/molecules';
import { AppHeader } from '@/components/organisms/AppHeader';
import { NotaryColors, Radius, Shadow } from '@/constants/notary-theme';
import { useAuth } from '@/context/AuthContext';
import {
  loadCachedWeeklySnapshot,
  loadWeeklyForecastModel,
  resetWeeklyForecastModel,
  runWeeklyForecast,
  syncRecentWeeksFromSupabase,
  type AsyncForecastResult,
  type CachedWeeklySnapshot,
  type LoadedModelStatus,
  type ModelLifecycleState,
} from '@/services/ai/weeklyForecastService';
import { parseWeeklyCounts, weeklyModelInfo } from '@/utils/weekly-forecast';

const WEEK_SLOTS = [
  { short: 'Minggu 1', hint: 'Paling lama' },
  { short: 'Minggu 2', hint: '3 mgg lalu' },
  { short: 'Minggu 3', hint: '2 mgg lalu' },
  { short: 'Minggu 4', hint: 'Paling baru' },
] as const;

type InputSourceKind = 'repertorium_online' | 'repertorium_cache' | 'simulation' | 'manual';

function formatNumberId(value: number, digits = 2): string {
  return value.toFixed(digits).replace('.', ',');
}

function formatSyncTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export default function WeeklyForecastScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const [values, setValues] = useState(['', '', '', '']);
  const [weekRanges, setWeekRanges] = useState<string[] | null>(null);
  const [inputSource, setInputSource] = useState<InputSourceKind>('manual');
  const [cachedSnapshot, setCachedSnapshot] = useState<CachedWeeklySnapshot | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [offlineSyncHint, setOfflineSyncHint] = useState(false);

  const [modelState, setModelState] = useState<ModelLifecycleState>('loading');
  const [modelStatus, setModelStatus] = useState<LoadedModelStatus | null>(null);
  const [inferring, setInferring] = useState(false);
  const [result, setResult] = useState<AsyncForecastResult | null>(null);
  const [error, setError] = useState('');
  const [detailsOpen, setDetailsOpen] = useState(false);

  const requestSeq = useRef(0);
  const userEditedRef = useRef(false);

  const reloadModel = useCallback(async () => {
    setModelState('loading');
    resetWeeklyForecastModel();
    try {
      const status = await loadWeeklyForecastModel({ forceReload: true });
      setModelStatus(status);
      setModelState(status.state);
    } catch (e) {
      setModelStatus(null);
      setModelState('error');
      setError(e instanceof Error ? e.message : 'Model belum dapat dimuat.');
    }
  }, []);

  // 1. Muat model TFLite sekali saat layar dibuka (jalan online maupun offline).
  useEffect(() => {
    let active = true;
    void loadWeeklyForecastModel({ forceReload: false })
      .then((status) => {
        if (!active) return;
        setModelStatus(status);
        setModelState(status.state);
      })
      .catch((e: unknown) => {
        if (!active) return;
        setModelStatus(null);
        setModelState('error');
        setError(e instanceof Error ? e.message : 'Model belum dapat dimuat.');
      });
    return () => {
      active = false;
    };
  }, []);

  // 2. Muat cache agregat lokal (non-PII), lalu jika user login coba sinkron diam-diam dari Repertorium.
  useEffect(() => {
    let active = true;

    void (async () => {
      const cached = await loadCachedWeeklySnapshot();
      if (!active) return;
      if (cached) {
        setCachedSnapshot(cached);
        if (!userEditedRef.current) {
          setValues(cached.counts.map(String));
          setWeekRanges(cached.weekRanges);
          setInputSource('repertorium_cache');
        }
      }

      if (!user) return;
      setSyncing(true);
      const synced = await syncRecentWeeksFromSupabase();
      if (!active) return;
      setSyncing(false);

      if (synced.ok) {
        setOfflineSyncHint(false);
        setCachedSnapshot(synced.snapshot);
        if (!userEditedRef.current) {
          setValues(synced.snapshot.counts.map(String));
          setWeekRanges(synced.snapshot.weekRanges);
          setInputSource('repertorium_online');
        }
      } else {
        setOfflineSyncHint(true);
      }
    })();

    return () => {
      active = false;
    };
  }, [user]);

  const change = (next: string[], source: InputSourceKind = 'manual', edited = true) => {
    requestSeq.current += 1;
    userEditedRef.current = edited;
    setInferring(false);
    setValues(next);
    setInputSource(source);
    if (source === 'simulation') setWeekRanges(null);
    setResult(null);
    setError('');
  };

  const handleManualSync = async () => {
    if (!user || syncing) return;
    setSyncing(true);
    setError('');
    const synced = await syncRecentWeeksFromSupabase();
    setSyncing(false);
    if (synced.ok) {
      setOfflineSyncHint(false);
      userEditedRef.current = false;
      setCachedSnapshot(synced.snapshot);
      setValues(synced.snapshot.counts.map(String));
      setWeekRanges(synced.snapshot.weekRanges);
      setInputSource('repertorium_online');
      setResult(null);
    } else {
      setOfflineSyncHint(true);
    }
  };

  const applyFromCache = () => {
    if (!cachedSnapshot) return;
    userEditedRef.current = false;
    requestSeq.current += 1;
    setInferring(false);
    setValues(cachedSnapshot.counts.map(String));
    setWeekRanges(cachedSnapshot.weekRanges);
    setInputSource('repertorium_cache');
    setResult(null);
    setError('');
  };

  const calculate = async () => {
    let counts: number[];
    try {
      counts = parseWeeklyCounts(values);
    } catch (e) {
      setResult(null);
      setError(e instanceof Error ? e.message : 'Input belum valid.');
      return;
    }

    const mySeq = ++requestSeq.current;
    setError('');
    setInferring(true);
    try {
      const output = await runWeeklyForecast(counts);
      if (mySeq !== requestSeq.current) return;
      setResult(output);
    } catch (e) {
      if (mySeq !== requestSeq.current) return;
      setResult(null);
      setError(e instanceof Error ? e.message : 'Prediksi belum dapat dihitung.');
    } finally {
      if (mySeq === requestSeq.current) setInferring(false);
    }
  };

  const cancelInference = () => {
    requestSeq.current += 1;
    setInferring(false);
  };

  const runtimeDotColor =
    modelState === 'ready'
      ? NotaryColors.emerald
      : modelState === 'loading'
        ? NotaryColors.gold
        : modelState === 'fallback'
          ? NotaryColors.amber
          : NotaryColors.danger;

  const runtimeLabel =
    modelState === 'ready'
      ? 'TFLite On-Device · Siap (Online & Offline)'
      : modelState === 'loading'
        ? 'Menyiapkan model TFLite…'
        : modelState === 'fallback'
          ? 'Mode Fallback Lokal (On-Device)'
          : 'Model belum siap';

  const sourceChip =
    inputSource === 'repertorium_online'
      ? { label: 'Repertorium', tone: 'success' as const }
      : inputSource === 'repertorium_cache'
        ? { label: 'Cache Lokal', tone: 'info' as const }
        : inputSource === 'simulation'
          ? { label: 'Simulasi', tone: 'warning' as const }
          : { label: 'Manual', tone: 'neutral' as const };

  const holdoutModel = weeklyModelInfo.holdoutSummary.model;
  const holdoutNaive = weeklyModelInfo.holdoutSummary.baselines.naive_lag1;
  const holdoutMa4 = weeklyModelInfo.holdoutSummary.baselines.ma4;
  const sizeKb = (weeklyModelInfo.tfliteSizeBytes / 1024).toFixed(2).replace('.', ',');

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <AppHeader
        title="Prediksi Akta AI"
        onBack={() => (router.canGoBack() ? router.back() : router.replace('/login'))}
      />

      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 28 }]}>
        {/* Status runtime 1 baris — ringkas dan langsung terbaca */}
        <View style={styles.statusStrip}>
          <View style={styles.statusLeft}>
            {modelState === 'loading' ? (
              <ActivityIndicator size="small" color={NotaryColors.primary} />
            ) : (
              <View style={[styles.dot, { backgroundColor: runtimeDotColor }]} />
            )}
            <AppText variant="label" color={NotaryColors.textPrimary} style={styles.flexText}>
              {runtimeLabel}
            </AppText>
          </View>
          {modelState === 'fallback' || modelState === 'error' ? (
            <Pressable
              onPress={() => void reloadModel()}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Muat ulang model TFLite">
              <AppText variant="label" color={NotaryColors.emerald}>
                Muat ulang
              </AppText>
            </Pressable>
          ) : null}
        </View>

        {modelState === 'fallback' && modelStatus?.message ? (
          <InfoNote tone="neutral" text={modelStatus.message} />
        ) : null}

        {/* Kartu utama: input 4 minggu dalam grid 2x2 */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.flexText}>
              <AppText variant="heading">Akta Reguler 4 Minggu Terakhir</AppText>
              <AppText variant="micro" color={NotaryColors.textSecondary}>
                PT, CV, RUPS, Perjanjian (di luar batch Personal Guarantee)
              </AppText>
            </View>
            <Badge label={sourceChip.label} tone={sourceChip.tone} />
          </View>

          {offlineSyncHint ? (
            <AppText variant="micro" color={NotaryColors.amber}>
              Sedang offline — memakai {cachedSnapshot ? 'cache Repertorium lokal' : 'input manual'}.
            </AppText>
          ) : null}

          <View style={styles.grid}>
            {WEEK_SLOTS.map((slot, i) => {
              const sub = weekRanges?.[i] ?? slot.hint;
              return (
                <View key={slot.short} style={styles.gridCell}>
                  <View style={styles.cellLabelRow}>
                    <AppText variant="label">{slot.short}</AppText>
                    <AppText variant="micro" color={NotaryColors.textMuted} numberOfLines={1}>
                      {sub}
                    </AppText>
                  </View>
                  <Input
                    accessibilityLabel={`${slot.short} (${sub}), jumlah akta reguler`}
                    placeholder="0"
                    keyboardType="number-pad"
                    maxLength={5}
                    value={values[i]}
                    onChangeText={(value) =>
                      change(
                        values.map((v, index) => (index === i ? value : v)),
                        'manual',
                        true,
                      )
                    }
                  />
                </View>
              );
            })}
          </View>

          {/* Aksi cepat ringkas dalam 1 baris */}
          <View style={styles.quickRow}>
            {user ? (
              <Pressable
                style={styles.quickChip}
                disabled={syncing || inferring}
                onPress={() => void handleManualSync()}
                accessibilityRole="button">
                <Ionicons name="sync-outline" size={14} color={NotaryColors.emerald} />
                <AppText variant="micro" color={NotaryColors.emerald}>
                  {syncing ? 'Menyinkronkan…' : 'Sinkron Data'}
                </AppText>
              </Pressable>
            ) : cachedSnapshot ? (
              <Pressable
                style={styles.quickChip}
                disabled={inferring}
                onPress={applyFromCache}
                accessibilityRole="button">
                <Ionicons name="time-outline" size={14} color={NotaryColors.emerald} />
                <AppText variant="micro" color={NotaryColors.emerald}>
                  Cache ({formatSyncTime(cachedSnapshot.syncedAtIso)})
                </AppText>
              </Pressable>
            ) : null}

            <Pressable
              style={styles.quickChip}
              disabled={inferring}
              onPress={() => change(['1', '2', '3', '2'], 'simulation', true)}
              accessibilityRole="button">
              <Ionicons name="sparkles-outline" size={14} color={NotaryColors.textSecondary} />
              <AppText variant="micro" color={NotaryColors.textSecondary}>
                Contoh
              </AppText>
            </Pressable>

            <Pressable
              style={styles.quickChip}
              disabled={inferring}
              onPress={() => {
                setWeekRanges(null);
                change(['', '', '', ''], 'manual', true);
              }}
              accessibilityRole="button">
              <Ionicons name="refresh-outline" size={14} color={NotaryColors.textSecondary} />
              <AppText variant="micro" color={NotaryColors.textSecondary}>
                Reset
              </AppText>
            </Pressable>
          </View>

          {error ? (
            <AppText variant="caption" color={NotaryColors.danger} accessibilityRole="alert">
              {error}
            </AppText>
          ) : null}

          <Button
            label={inferring ? 'Menghitung di perangkat…' : 'Hitung Prediksi'}
            icon={inferring ? undefined : 'analytics-outline'}
            disabled={inferring || modelState === 'loading'}
            onPress={() => void calculate()}
          />
          {inferring ? (
            <Button variant="outline" compact label="Batalkan" onPress={cancelInference} />
          ) : null}
        </View>

        {/* Kartu hasil prediksi — fokus pada angka + perbandingan 2 baseline */}
        {result ? (
          <View style={styles.resultCard} accessibilityLiveRegion="polite">
            <View style={styles.cardHeader}>
              <AppText variant="eyebrow" color={NotaryColors.emerald}>
                PERKIRAAN MINGGU DEPAN
              </AppText>
              <Badge
                label={
                  result.runtime === 'tflite'
                    ? `TFLite · ${formatNumberId(result.latencyMs, 1)} ms`
                    : `Fallback · ${formatNumberId(result.latencyMs, 1)} ms`
                }
                tone={result.runtime === 'tflite' ? 'success' : 'warning'}
              />
            </View>

            <View style={styles.heroValueRow}>
              <AppText variant="display" style={styles.heroNumber}>
                {formatNumberId(result.prediction)}
              </AppText>
              <AppText variant="bodyStrong" color={NotaryColors.textSecondary}>
                akta reguler
              </AppText>
            </View>

            <View style={styles.baselineRow}>
              <View style={styles.baselineTile}>
                <AppText variant="micro" color={NotaryColors.textSecondary}>
                  Minggu Lalu (Naive)
                </AppText>
                <AppText variant="heading">{result.baselines.naiveLag1} akta</AppText>
              </View>
              <View style={styles.baselineTile}>
                <AppText variant="micro" color={NotaryColors.textSecondary}>
                  Rata-rata 4 Mgg (MA-4)
                </AppText>
                <AppText variant="heading">{formatNumberId(result.baselines.ma4)} akta</AppText>
              </View>
            </View>

            <AppText variant="micro" color={NotaryColors.textSecondary}>
              Perkiraan alat bantu perencanaan; keputusan jadwal tetap di tangan Notaris.
            </AppText>

            {result.outsideTrainingRange ? (
              <InfoNote
                text={`Input melebihi batas maksimum data latih (${weeklyModelInfo.maxObservedWeeklyCount} akta/minggu); ketidakpastian lebih tinggi.`}
              />
            ) : null}
          </View>
        ) : null}

        {/* Progressive disclosure: Detail Model, Metrik Holdout & Privasi (1 ketuk untuk buka) */}
        <View style={styles.accordionCard}>
          <Pressable
            onPress={() => setDetailsOpen((open) => !open)}
            style={styles.accordionHeader}
            accessibilityRole="button"
            accessibilityState={{ expanded: detailsOpen }}
            accessibilityLabel="Detail model, metrik evaluasi, dan privasi">
            <View style={styles.flexText}>
              <AppText variant="bodyStrong">Detail Model & Evaluasi</AppText>
              <AppText variant="micro" color={NotaryColors.textSecondary}>
                TFLite FP32 ({sizeKb} KB) · Test MAE {formatNumberId(holdoutModel.mae)} vs Naive{' '}
                {formatNumberId(holdoutNaive.mae)}
              </AppText>
            </View>
            <Ionicons
              name={detailsOpen ? 'chevron-up' : 'chevron-down'}
              size={18}
              color={NotaryColors.textSecondary}
            />
          </Pressable>

          {detailsOpen ? (
            <View style={styles.accordionBody}>
              <View style={styles.metricTable}>
                <View style={styles.tableHead}>
                  <AppText variant="micro" color={NotaryColors.textMuted} style={styles.colName}>
                    Uji Holdout (8 mgg)
                  </AppText>
                  <AppText variant="micro" color={NotaryColors.textMuted} style={styles.colNum}>
                    MAE
                  </AppText>
                  <AppText variant="micro" color={NotaryColors.textMuted} style={styles.colNum}>
                    RMSE
                  </AppText>
                </View>
                <View style={styles.tableRow}>
                  <AppText variant="label" style={styles.colName}>
                    Model TFLite
                  </AppText>
                  <AppText variant="label" color={NotaryColors.emerald} style={styles.colNum}>
                    {formatNumberId(holdoutModel.mae)}
                  </AppText>
                  <AppText variant="label" color={NotaryColors.emerald} style={styles.colNum}>
                    {formatNumberId(holdoutModel.rmse)}
                  </AppText>
                </View>
                <View style={styles.tableRow}>
                  <AppText variant="caption" style={styles.colName}>
                    Naive (lag-1)
                  </AppText>
                  <AppText variant="caption" style={styles.colNum}>
                    {formatNumberId(holdoutNaive.mae)}
                  </AppText>
                  <AppText variant="caption" style={styles.colNum}>
                    {formatNumberId(holdoutNaive.rmse)}
                  </AppText>
                </View>
                <View style={styles.tableRow}>
                  <AppText variant="caption" style={styles.colName}>
                    MA-4
                  </AppText>
                  <AppText variant="caption" style={styles.colNum}>
                    {formatNumberId(holdoutMa4.mae)}
                  </AppText>
                  <AppText variant="caption" style={styles.colNum}>
                    {formatNumberId(holdoutMa4.rmse)}
                  </AppText>
                </View>
              </View>

              <AppText variant="caption" color={NotaryColors.textSecondary}>
                • Versi: {weeklyModelInfo.version} (split kronologis 22 latih / 8 validasi / 8 uji
                dari 42 minggu data real kantor notaris, 5 Jan–25 Okt 2026).
              </AppText>
              <AppText variant="caption" color={NotaryColors.textSecondary}>
                • Privasi & offline: inferensi berjalan 100% di perangkat tanpa mengirim data klien
                ke server; cache lokal hanya menyimpan 4 angka agregat.
              </AppText>
              <AppText variant="caption" color={NotaryColors.textSecondary}>
                • Keterbatasan: sampel mingguan terbatas; proyek batch Personal Guarantee dipisahkan
                agar lonjakan satu klien tidak mendistorsi beban rutin. Bukti lengkap tersedia di
                docs/project/metrics.json.
              </AppText>
            </View>
          ) : null}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: NotaryColors.background },
  content: { padding: 16, gap: 14 },
  flexText: { flex: 1 },
  statusStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: NotaryColors.border,
    backgroundColor: NotaryColors.card,
  },
  statusLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  card: {
    padding: 16,
    gap: 14,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: NotaryColors.border,
    backgroundColor: NotaryColors.card,
    ...Shadow.card,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  gridCell: {
    width: '48%',
    flexGrow: 1,
    gap: 6,
  },
  cellLabelRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 4,
  },
  quickRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: NotaryColors.border,
    backgroundColor: NotaryColors.background,
  },
  resultCard: {
    padding: 16,
    gap: 12,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: NotaryColors.emerald,
    backgroundColor: NotaryColors.card,
    ...Shadow.card,
  },
  heroValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  heroNumber: {
    fontSize: 34,
    lineHeight: 40,
    color: NotaryColors.primary,
  },
  baselineRow: {
    flexDirection: 'row',
    gap: 10,
  },
  baselineTile: {
    flex: 1,
    gap: 2,
    padding: 12,
    borderRadius: Radius.md,
    backgroundColor: NotaryColors.background,
  },
  accordionCard: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: NotaryColors.border,
    backgroundColor: NotaryColors.card,
    overflow: 'hidden',
  },
  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    padding: 14,
  },
  accordionBody: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: NotaryColors.borderLight,
    paddingTop: 12,
  },
  metricTable: {
    borderRadius: Radius.md,
    backgroundColor: NotaryColors.background,
    padding: 10,
    gap: 6,
  },
  tableHead: {
    flexDirection: 'row',
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: NotaryColors.border,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colName: { flex: 1 },
  colNum: { width: 58, textAlign: 'right' },
});
