import React, { useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';
import { NotaryColors, Radius, Shadow } from '@/constants/notary-theme';
import { muatSemua, useLaporan, useLaporanStore } from '@/context/laporan-store';
import { useIsiDokumen } from '@/hooks/use-isi-dokumen';
import { useStatusBarStyle } from '@/hooks/use-status-bar-style';
import { STATUS_DOKUMEN_TONE, STATUS_VALIDASI_TONE, type ValidasiItem } from '@/types/laporan';
import { clampPercent } from '@/utils/service';
import { AppText, Badge, Button, IconButton } from '@/components/atoms';
import { AppHeader } from '@/components/organisms';
import { EksporSheet } from '@/components/laporan/DokumenSheets';
import { PeriodeSheet, ValidasiKategoriSheet } from '@/components/laporan/LaporanSheets';

// ───────────────────────── Cincin progres ─────────────────────────

const SIZE = 64;
const STROKE = 6;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/** Cincin progres melingkar (0–100) dengan angka persen di tengah. */
function ProgressRing({ value }: { value: number }) {
  const percent = clampPercent(value);
  const center = SIZE / 2;

  return (
    <View
      style={ringStyles.wrap}
      accessibilityRole="progressbar"
      accessibilityLabel="Kelengkapan validasi"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(percent) }}>
      {/* Diputar -90° agar isian progres mulai dari atas (jam 12). */}
      <Svg width={SIZE} height={SIZE} style={ringStyles.svg}>
        <Circle
          cx={center}
          cy={center}
          r={RADIUS}
          stroke={NotaryColors.progressTrack}
          strokeWidth={STROKE}
          fill="none"
        />
        <Circle
          cx={center}
          cy={center}
          r={RADIUS}
          stroke={NotaryColors.progressFill}
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={`${CIRCUMFERENCE}`}
          strokeDashoffset={CIRCUMFERENCE * (1 - percent / 100)}
          fill="none"
        />
      </Svg>
      <View style={ringStyles.center} pointerEvents="none">
        <AppText variant="heading">{Math.round(percent)}</AppText>
        <AppText variant="micro" color={NotaryColors.textSecondary} style={ringStyles.unit}>
          %
        </AppText>
      </View>
    </View>
  );
}

const ringStyles = StyleSheet.create({
  wrap: { width: SIZE, height: SIZE },
  svg: { transform: [{ rotate: '-90deg' }] },
  center: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unit: { marginTop: -2 },
});

// ───────────────────────── Kartu periode ─────────────────────────

interface PeriodeCardProps {
  periode: string;
  diperbarui: string;
  onPressKalender: () => void;
}

/** Kartu hijau "Periode Laporan" di puncak halaman Laporan. */
function PeriodeCard({ periode, diperbarui, onPressKalender }: PeriodeCardProps) {
  return (
    <View style={periodeCardStyles.card}>
      <View style={periodeCardStyles.texts}>
        <AppText variant="eyebrow" color={NotaryColors.gold}>
          PERIODE LAPORAN
        </AppText>
        <AppText variant="display" color="#FFFFFF" style={periodeCardStyles.periode}>
          {periode}
        </AppText>
        <AppText variant="caption" color={NotaryColors.headerSubtitleSage} style={periodeCardStyles.updated}>
          Terakhir diperbarui: {diperbarui}
        </AppText>
      </View>
      <IconButton
        icon="calendar-outline"
        color="#FFFFFF"
        size={20}
        boxSize={40}
        shape="square"
        backgroundColor={NotaryColors.headerNotifBg}
        accessibilityLabel="Pilih periode laporan"
        onPress={onPressKalender}
      />
    </View>
  );
}

const periodeCardStyles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 20,
    borderRadius: Radius.xl,
    backgroundColor: NotaryColors.primary,
    ...Shadow.card,
  },
  texts: { flex: 1 },
  periode: { marginTop: 6, fontSize: 30, lineHeight: 36 },
  updated: { marginTop: 14 },
});

// ───────────────────────── Judul & lencana validasi ─────────────────────────

interface LaporanHeaderProps {
  progress: number;
}

/** Judul "Laporan Bulanan", lencana status validasi, dan cincin progres. */
function LaporanHeader({ progress }: LaporanHeaderProps) {
  const selesai = progress >= 100;
  return (
    <View style={headerStyles.container}>
      <Badge
        label={selesai ? 'Validasi Selesai' : 'Validasi Diperlukan'}
        tone={selesai ? 'success' : 'warning'}
      />
      <View style={headerStyles.row}>
        <View style={headerStyles.texts}>
          <AppText variant="display">Laporan Bulanan</AppText>
          <AppText variant="caption" color={NotaryColors.textSecondary}>
            Data diambil dari aktivitas akta yang tercatat di sistem.
          </AppText>
        </View>
        <ProgressRing value={progress} />
      </View>
    </View>
  );
}

const headerStyles = StyleSheet.create({
  container: { gap: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  texts: { flex: 1, gap: 4 },
});

// ───────────────────────── Tiga angka ringkas ─────────────────────────

interface StatsRowProps {
  jumlahAkta: number;
  selesai: number;
  perluTinjau: number;
}

/** Tiga angka ringkas: jumlah akta, akta selesai (terbit), dan item perlu ditinjau. */
function StatsRow({ jumlahAkta, selesai, perluTinjau }: StatsRowProps) {
  const items = [
    { value: jumlahAkta, label: 'Jumlah Akta' },
    { value: selesai, label: 'Akta Selesai' },
    { value: perluTinjau, label: 'Perlu Tinjau' },
  ];

  return (
    <View style={statsStyles.row}>
      {items.map((item, index) => (
        <View
          key={item.label}
          style={[statsStyles.cell, index > 0 && statsStyles.divider]}
          accessible
          accessibilityLabel={`${item.label}: ${item.value}`}>
          <AppText variant="stat">{item.value}</AppText>
          <AppText variant="micro" color={NotaryColors.textSecondary}>
            {item.label}
          </AppText>
        </View>
      ))}
    </View>
  );
}

const statsStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    paddingVertical: 14,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: NotaryColors.border,
    backgroundColor: NotaryColors.card,
    ...Shadow.card,
  },
  cell: { flex: 1, alignItems: 'center', gap: 2 },
  divider: { borderLeftWidth: 1, borderLeftColor: NotaryColors.border },
});

// ───────────────────────── Baris validasi ─────────────────────────

interface ValidasiRowProps {
  item: ValidasiItem;
  onPress: () => void;
}

/** Satu baris pada daftar "Validasi Data". */
function ValidasiRow({ item, onPress }: ValidasiRowProps) {
  const lengkap = item.status === 'Lengkap';
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${item.judul}: ${item.status}. ${item.deskripsi}`}
      style={({ pressed }) => [validasiRowStyles.row, pressed && validasiRowStyles.pressed]}>
      <Ionicons
        name={lengkap ? 'checkmark-circle-outline' : 'warning-outline'}
        size={22}
        color={lengkap ? NotaryColors.badgeSuccessText : NotaryColors.amber}
      />
      <View style={validasiRowStyles.texts}>
        <AppText variant="bodyStrong">{item.judul}</AppText>
        <AppText variant="caption" color={NotaryColors.textSecondary}>
          {item.deskripsi}
        </AppText>
      </View>
      <Badge label={item.status} tone={STATUS_VALIDASI_TONE[item.status]} />
    </Pressable>
  );
}

const validasiRowStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: NotaryColors.borderLight,
  },
  pressed: { opacity: 0.7 },
  texts: { flex: 1, gap: 2 },
});

// ───────────────────────── Pintasan Repertorium ─────────────────────────

interface RepertoriumLinkProps {
  jumlah: number;
  onPress: () => void;
}

/** Kartu pintasan ke halaman Repertorium. */
function RepertoriumLink({ jumlah, onPress }: RepertoriumLinkProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Buka Repertorium"
      style={({ pressed }) => [linkStyles.card, pressed && linkStyles.pressed]}>
      <View style={linkStyles.iconBox}>
        <Ionicons name="document-text-outline" size={20} color={NotaryColors.summaryIcons.activeIcon} />
      </View>
      <View style={linkStyles.texts}>
        <AppText variant="bodyStrong">Repertorium</AppText>
        <AppText variant="caption" color={NotaryColors.textSecondary}>
          Daftar semua akta yang tercatat
        </AppText>
      </View>
      <Badge label={`${jumlah} akta`} tone="info" />
      <Ionicons name="chevron-forward" size={18} color={NotaryColors.textSecondary} />
    </Pressable>
  );
}

const linkStyles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: NotaryColors.border,
    backgroundColor: NotaryColors.card,
    ...Shadow.card,
  },
  pressed: { opacity: 0.93, transform: [{ scale: 0.985 }] },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: NotaryColors.summaryIcons.activeBg,
  },
  texts: { flex: 1, gap: 2 },
});

// ───────────────────────── Kartu dokumen laporan ─────────────────────────

interface DokumenCardProps {
  onPratinjau: () => void;
  onEkspor: () => void;
}

/** Bagian "Dokumen Laporan": status dokumen serta tombol Pratinjau dan Ekspor. */
function DokumenCard({ onPratinjau, onEkspor }: DokumenCardProps) {
  const { dokumen, versi, periodeLabel, jumlahAkta } = useIsiDokumen();

  return (
    <View style={dokumenStyles.wrap}>
      <View style={dokumenStyles.header}>
        <View>
          <AppText variant="eyebrow" color={NotaryColors.textMuted}>
            DOKUMEN LAPORAN
          </AppText>
          <AppText variant="title" accessibilityRole="header">
            Pratinjau & Ekspor
          </AppText>
        </View>
        <Badge label={dokumen.status} tone={STATUS_DOKUMEN_TONE[dokumen.status]} />
      </View>

      <View style={dokumenStyles.card}>
        <View style={dokumenStyles.row}>
          <View style={dokumenStyles.thumb} accessibilityElementsHidden>
            <View style={dokumenStyles.thumbLogo} />
            <View style={dokumenStyles.thumbGaris} />
            <View style={[dokumenStyles.thumbGaris, dokumenStyles.thumbPendek]} />
          </View>
          <View style={dokumenStyles.texts}>
            <Badge label={periodeLabel} tone="neutral" shape="square" />
            <AppText variant="bodyStrong">Laporan Bulanan Notaris</AppText>
            <AppText variant="caption" color={NotaryColors.textSecondary}>
              Versi {versi} · {jumlahAkta} akta
            </AppText>
          </View>
        </View>
        <View style={dokumenStyles.actions}>
          <View style={dokumenStyles.slot}>
            <Button label="Pratinjau" variant="outline" icon="eye-outline" onPress={onPratinjau} />
          </View>
          <View style={dokumenStyles.slot}>
            <Button label="Ekspor" icon="download-outline" onPress={onEkspor} />
          </View>
        </View>
      </View>
    </View>
  );
}

const dokumenStyles = StyleSheet.create({
  wrap: { gap: 10 },
  header: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  card: {
    gap: 14,
    padding: 14,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: NotaryColors.border,
    backgroundColor: NotaryColors.card,
    ...Shadow.card,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  thumb: {
    width: 52,
    height: 68,
    gap: 5,
    padding: 7,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: NotaryColors.border,
    backgroundColor: '#FFFFFF',
  },
  thumbLogo: { width: 12, height: 12, borderRadius: 3, backgroundColor: NotaryColors.primary },
  thumbGaris: { height: 3, borderRadius: 2, backgroundColor: NotaryColors.border },
  thumbPendek: { width: '60%' },
  texts: { flex: 1, alignItems: 'flex-start', gap: 4 },
  actions: { flexDirection: 'row', gap: 12 },
  slot: { flex: 1 },
});

// ───────────────────────── Layar Laporan ─────────────────────────

interface ReportsScreenProps {
  /** Buka halaman Repertorium (di luar tab, bottom nav tersembunyi). */
  onOpenRepertorium: () => void;
  /** Buka halaman Pratinjau Laporan. */
  onOpenPratinjau: () => void;
}

/** Halaman Laporan — ringkasan periode, validasi data, dan pintasan ke Repertorium. */
export function ReportsScreen({ onOpenRepertorium, onOpenPratinjau }: ReportsScreenProps) {
  useStatusBarStyle('dark');
  const { summary, aktaPeriode } = useLaporan();
  const { memuat } = useLaporanStore();
  const [periodeOpen, setPeriodeOpen] = useState(false);
  const [validasiOpen, setValidasiOpen] = useState(false);
    const [eksporOpen, setEksporOpen] = useState(false);

  const openValidasi = () => setValidasiOpen(true);

  return (
    <View style={styles.screen}>
      <AppHeader title="Laporan" />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={memuat} onRefresh={() => void muatSemua()} />}>
        <PeriodeCard
          periode={summary.periodeLabel}
          diperbarui={summary.diperbaruiLabel}
          onPressKalender={() => setPeriodeOpen(true)}
        />
        <LaporanHeader progress={summary.progress} />
        <StatsRow {...summary.stats} />

        <View style={styles.sectionHeader}>
          <AppText variant="title" accessibilityRole="header">
            Validasi Data
          </AppText>
          <Pressable
            onPress={openValidasi}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Periksa semua validasi">
            <AppText variant="label" color={NotaryColors.emerald}>
              Periksa Semua
            </AppText>
          </Pressable>
        </View>

        <View style={styles.validasiCard}>
          {summary.validasi.map((item) => (
            <ValidasiRow key={item.id} item={item} onPress={openValidasi} />
          ))}
        </View>

        <View style={styles.cta}>
          <Button label="Selesaikan Validasi" icon="eye-outline" compact onPress={openValidasi} />
        </View>

        <DokumenCard onPratinjau={onOpenPratinjau} onEkspor={() => setEksporOpen(true)} />
        <RepertoriumLink jumlah={aktaPeriode.length} onPress={onOpenRepertorium} />
      </ScrollView>

      <PeriodeSheet visible={periodeOpen} onClose={() => setPeriodeOpen(false)} />
      <ValidasiKategoriSheet visible={validasiOpen} onClose={() => setValidasiOpen(false)} />
      <EksporSheet visible={eksporOpen} onClose={() => setEksporOpen(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: NotaryColors.background },
  content: { padding: 16, gap: 16, paddingBottom: 24 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  validasiCard: {
    paddingHorizontal: 14,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: NotaryColors.border,
    backgroundColor: NotaryColors.card,
    ...Shadow.card,
  },
  cta: { alignItems: 'center' },
});