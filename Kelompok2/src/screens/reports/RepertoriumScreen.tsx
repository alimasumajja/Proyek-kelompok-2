import React, { useState } from 'react';
import { FlatList, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FigmaTokens, NotaryColors, Radius, Shadow } from '@/constants/notary-theme';
import {
  BULAN,
  formatTanggalAkta,
  useLaporan,
  useLaporanStore,
} from '@/context/laporan-store';
import { useStatusBarStyle } from '@/hooks/use-status-bar-style';
import { STATUS_AKTA_TONE, type Akta } from '@/types/laporan';
import { AppText, Badge } from '@/components/atoms';
import { EmptyState, InfoNote } from '@/components/molecules';
import { AppHeader } from '@/components/organisms';
import { KoreksiSheet, PeriodeSheet } from '@/components/laporan/LaporanSheets';

// ───────────────────────── Kolom pencarian ─────────────────────────

interface AktaSearchProps {
  value: string;
  onChangeText: (text: string) => void;
}

/** Kolom pencarian Repertorium (tanpa tombol filter, periode dipilih lewat tautan terpisah). */
function AktaSearch({ value, onChangeText }: AktaSearchProps) {
  return (
    <View style={searchStyles.box}>
      <Ionicons name="search-outline" size={18} color="#8A92A0" />
      <TextInput
        style={searchStyles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder="Cari nomor akta atau pihak terkait"
        placeholderTextColor="#9CA3AF"
        returnKeyType="search"
        autoCorrect={false}
        accessibilityLabel="Cari akta"
      />
      {value.length > 0 ? (
        <Pressable
          onPress={() => onChangeText('')}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Hapus pencarian">
          <Ionicons name="close-circle" size={16} color="#9CA3AF" />
        </Pressable>
      ) : null}
    </View>
  );
}

const searchStyles = StyleSheet.create({
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 48,
    paddingHorizontal: 14,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  input: {
    flex: 1,
    paddingVertical: 0,
    fontSize: 13.5,
    fontFamily: FigmaTokens.fonts.regular,
    color: NotaryColors.textPrimary,
  },
});

// ───────────────────────── Kartu akta ─────────────────────────

interface AktaRowProps {
  akta: Akta;
  onPress: (akta: Akta) => void;
}

/** Satu kartu akta pada daftar Repertorium. */
function AktaRow({ akta, onPress }: AktaRowProps) {
  return (
    <Pressable
      onPress={() => onPress(akta)}
      accessibilityRole="button"
      accessibilityLabel={`Akta nomor ${akta.nomorAkta}, ${akta.jenis}, ${akta.pihak}, ${akta.status}`}
      style={({ pressed }) => [aktaRowStyles.card, pressed && aktaRowStyles.pressed]}>
      <View style={aktaRowStyles.thumb}>
        <Ionicons name="document-text-outline" size={20} color={NotaryColors.textSecondary} />
      </View>
      <View style={aktaRowStyles.texts}>
        <View style={aktaRowStyles.top}>
          <AppText variant="heading">Akta No. {akta.nomorAkta}</AppText>
          <Badge label={akta.status} tone={STATUS_AKTA_TONE[akta.status]} />
        </View>
        <AppText variant="caption">{akta.jenis}</AppText>
        <AppText variant="caption" color={NotaryColors.textSecondary} numberOfLines={1}>
          {akta.pihak}
        </AppText>
        <View style={aktaRowStyles.date}>
          <Ionicons name="calendar-outline" size={12} color={NotaryColors.textMuted} />
          <AppText variant="micro" color={NotaryColors.textMuted}>
            {formatTanggalAkta(akta.tanggal)}
          </AppText>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={18} color={NotaryColors.textPrimary} />
    </Pressable>
  );
}

const aktaRowStyles = StyleSheet.create({
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
  thumb: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: NotaryColors.badgeNeutralBg,
  },
  texts: { flex: 1, gap: 2 },
  top: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  date: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
});

// ───────────────────────── Layar Repertorium ─────────────────────────

interface RepertoriumScreenProps {
  onBack: () => void;
}

/** Halaman Repertorium — daftar akta periode terpilih, pencarian, tambah, dan koreksi. */
export function RepertoriumScreen({ onBack }: RepertoriumScreenProps) {
  useStatusBarStyle('dark');
  const insets = useSafeAreaInsets();
  const { bulan, tahun } = useLaporanStore();
  const { aktaPeriode } = useLaporan();

  const [cari, setCari] = useState('');
  const [periodeOpen, setPeriodeOpen] = useState(false);
  const [koreksi, setKoreksi] = useState<{ open: boolean; akta: Akta | null }>({
    open: false,
    akta: null,
  });

  const query = cari.trim().toLowerCase();
  const daftar = query
    ? aktaPeriode.filter((a) =>
        [a.nomorAkta, a.pihak, a.jenis].some((t) => t.toLowerCase().includes(query))
      )
    : aktaPeriode;

  const bukaForm = (akta: Akta | null) => setKoreksi({ open: true, akta });

  const header = (
    <View style={styles.header}>
      <AktaSearch value={cari} onChangeText={setCari} />
      <View style={styles.meta}>
        <AppText variant="label" color={NotaryColors.textSecondary}>
          {daftar.length} akta · {BULAN[bulan]} {tahun}
        </AppText>
        <Pressable
          onPress={() => setPeriodeOpen(true)}
          hitSlop={8}
          style={styles.periodeLink}
          accessibilityRole="button"
          accessibilityLabel="Pilih periode">
          <Ionicons name="calendar-outline" size={14} color={NotaryColors.emerald} />
          <AppText variant="label" color={NotaryColors.emerald}>
            Periode
          </AppText>
        </Pressable>
      </View>
    </View>
  );

  const footer = (
    <View style={styles.footer}>
      <InfoNote
        tone="neutral"
        icon="document-text-outline"
        text="Repertorium menampilkan data berstruktur, bukan dokumen atau lampiran. Nomor akta tidak dibuat otomatis."
      />
    </View>
  );

  return (
    <View style={styles.screen}>
      <AppHeader
        title="Repertorium"
        onBack={onBack}
        action={{ icon: 'add', label: 'Tambah akta', onPress: () => bukaForm(null) }}
      />

      <FlatList
        data={daftar}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <AktaRow akta={item} onPress={bukaForm} />}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListHeaderComponent={header}
        ListFooterComponent={footer}
        ListEmptyComponent={
          <EmptyState
            title="Tidak ada akta"
            description={
              query
                ? `Tidak ada hasil untuk kata kunci "${cari.trim()}".`
                : 'Belum ada akta pada periode ini. Ketuk + untuk menambah akta.'
            }
            actionLabel={query ? 'Hapus Pencarian' : undefined}
            onActionPress={() => setCari('')}
          />
        }
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 24 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      />

      <PeriodeSheet visible={periodeOpen} onClose={() => setPeriodeOpen(false)} />
      <KoreksiSheet
        visible={koreksi.open}
        akta={koreksi.akta}
        onClose={() => setKoreksi((prev) => ({ ...prev, open: false }))}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: NotaryColors.background },
  list: { paddingHorizontal: 16, paddingTop: 16 },
  header: { gap: 12, marginBottom: 12 },
  meta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  periodeLink: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  separator: { height: 12 },
  footer: { marginTop: 16 },
});