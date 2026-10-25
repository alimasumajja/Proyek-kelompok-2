import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TAHAP } from '../../../constants/data';
import { colors, radius } from '../../../constants/theme';
import { useLayanan } from '../../../store/LayananContext';
import { formatTanggal, inisial, selisihHari } from '../../../utils/format';

const TABS = ['Ringkasan', 'Alur Kerja', 'Catatan', 'Riwayat'] as const;
type Tab = (typeof TABS)[number];

export default function DetailLayanan() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getById, majuTahap } = useLayanan();
  const [tab, setTab] = useState<Tab>('Ringkasan');

  const l = getById(id);

  if (!l) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.notFound}>Layanan tidak ditemukan.</Text>
        <Pressable onPress={() => router.replace('/layanan')}>
          <Text style={[styles.notFound, { color: colors.primary }]}>Kembali</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const progres = Math.round((l.tahapIndex / (TAHAP.length - 1)) * 100);
  const selesai = l.tahapIndex >= TAHAP.length - 1;
  const tahapBerikut = TAHAP[l.tahapIndex + 1];

  const perbarui = () => {
    if (selesai) return;
    Alert.alert('Perbarui tahap', `Pindah ke tahap "${tahapBerikut}"?`, [
      { text: 'Batal', style: 'cancel' },
      { text: 'Ya, perbarui', onPress: () => majuTahap(l.id) },
    ]);
  };

  const tepatTarget = !l.targetSelesai || new Date() <= new Date(l.targetSelesai);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.topbar}>
        <Pressable onPress={() => router.replace('/layanan')} hitSlop={12} style={styles.topBtn}>
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </Pressable>
        <Text style={styles.topTitle}>Detail Layanan</Text>
        <View style={[styles.topBtn, { right: 12, left: undefined }]}>
          <Ionicons name="ellipsis-horizontal" size={20} color={colors.text} />
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Header hijau */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={styles.nomor}>{l.nomor}</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{l.status}</Text>
            </View>
          </View>
          <Text style={styles.nama}>{l.namaKlien}</Text>
          <Text style={styles.jenis}>{l.jenisLayanan}</Text>
          <View style={styles.divider} />
          <View style={styles.metaRow}>
            <Ionicons name="calendar-outline" size={13} color="#CFE0D9" />
            <Text style={styles.metaText}>Target {formatTanggal(l.targetSelesai)}</Text>
            <View style={styles.avatarSm}>
              <Text style={styles.avatarSmText}>{inisial(l.penanggungJawab)}</Text>
            </View>
            <Text style={styles.metaText}>{l.penanggungJawab.split(' ').slice(0, 2).join(' ')}</Text>
          </View>
        </View>

        {/* Tab */}
        <View style={styles.tabs}>
          {TABS.map((t) => (
            <Pressable key={t} onPress={() => setTab(t)} style={[styles.tab, tab === t && styles.tabActive]}>
              <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>{t}</Text>
            </Pressable>
          ))}
        </View>

        <View style={{ padding: 16, gap: 14 }}>
          {tab === 'Ringkasan' && (
            <>
              <View style={styles.card}>
                <View style={styles.progressRow}>
                  <View>
                    <Text style={styles.small}>Progres keseluruhan</Text>
                    <Text style={styles.tahap}>{TAHAP[l.tahapIndex]}</Text>
                  </View>
                  <Text style={styles.persen}>{progres}%</Text>
                </View>
                <View style={styles.bar}>
                  <View style={[styles.barFill, { width: `${progres}%` }]} />
                </View>
                <Text style={styles.hint}>Dihitung dari tahap yang diselesaikan, bukan waktu berjalan.</Text>

                <View style={styles.stats}>
                  <Stat label="Mulai tahap" value={formatTanggal(l.tahapMulai)} />
                  <Stat label="Durasi tahap" value={`${selisihHari(l.tahapMulai)} hari`} />
                  <Stat label="Total durasi" value={`${selisihHari(l.tanggalDiterima)} hari`} />
                </View>
              </View>

              <Pressable
                style={[styles.primaryBtn, selesai && { opacity: 0.5 }]}
                onPress={perbarui}
                disabled={selesai}
              >
                <Ionicons name="pencil-outline" size={16} color={colors.white} />
                <Text style={styles.primaryBtnText}>{selesai ? 'Layanan Selesai' : 'Perbarui Tahap'}</Text>
              </Pressable>

              <View style={styles.card}>
                <View style={styles.cardHead}>
                  <Text style={styles.cardTitle}>Penugasan & Target</Text>
                  <Text style={styles.link}>Ubah</Text>
                </View>
                <View style={styles.person}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{inisial(l.penanggungJawab)}</Text>
                  </View>
                  <View>
                    <Text style={styles.small}>Penanggung jawab</Text>
                    <Text style={styles.personName}>{l.penanggungJawab}</Text>
                    <Text style={styles.small}>Prioritas: {l.prioritas}</Text>
                  </View>
                </View>
                <View style={styles.divLine} />
                <View style={styles.targetRow}>
                  <Ionicons name="calendar-outline" size={18} color={colors.primary} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.small}>Target penyelesaian</Text>
                    <Text style={styles.personName}>{formatTanggal(l.targetSelesai)}</Text>
                  </View>
                  <View style={[styles.chip, !tepatTarget && { backgroundColor: '#F9E1DE' }]}>
                    <Text style={[styles.chipText, !tepatTarget && { color: colors.danger }]}>
                      {tepatTarget ? 'Sesuai target' : 'Melewati target'}
                    </Text>
                  </View>
                </View>
                {l.deskripsi ? <Text style={styles.desc}>{l.deskripsi}</Text> : null}
              </View>

              <View style={styles.aiCard}>
                <View style={styles.aiIcon}>
                  <Ionicons name="sparkles-outline" size={18} color={colors.accent} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.aiTitle}>Butuh ringkasan cepat?</Text>
                  <Text style={styles.aiSub}>AI dapat meringkas progres dan riwayat layanan ini.</Text>
                </View>
                <Pressable style={styles.aiBtn} onPress={() => Alert.alert('Segera hadir', 'Fitur AI belum tersedia.')}>
                  <Text style={styles.aiBtnText}>Coba AI</Text>
                </Pressable>
              </View>
            </>
          )}

          {tab === 'Alur Kerja' && (
            <View style={styles.card}>
              {TAHAP.map((t, i) => {
                const lewat = i < l.tahapIndex;
                const kini = i === l.tahapIndex;
                return (
                  <View key={t} style={styles.step}>
                    <Ionicons
                      name={lewat ? 'checkmark-circle' : kini ? 'radio-button-on' : 'ellipse-outline'}
                      size={20}
                      color={lewat || kini ? colors.primary : colors.border}
                    />
                    <Text style={[styles.stepText, kini && { fontWeight: '700' }]}>{t}</Text>
                  </View>
                );
              })}
            </View>
          )}

          {tab === 'Catatan' && (
            <View style={styles.card}>
              <Text style={styles.hint}>
                {l.kontakKlien ? `Kontak klien: ${l.kontakKlien}` : 'Belum ada catatan untuk layanan ini.'}
              </Text>
            </View>
          )}

          {tab === 'Riwayat' && (
            <View style={styles.card}>
              {[...l.riwayat].reverse().map((r, i) => (
                <View key={i} style={styles.step}>
                  <Ionicons name="time-outline" size={18} color={colors.primary} />
                  <View>
                    <Text style={styles.stepText}>{r.tahap}</Text>
                    <Text style={styles.small}>{formatTanggal(r.tanggal)}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flex: 1 }}>
      <Text style={styles.small}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  notFound: { textAlign: 'center', marginTop: 40, color: colors.muted },
  topbar: { height: 52, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  topBtn: { position: 'absolute', left: 12 },
  topTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  header: { backgroundColor: colors.primary, padding: 18, paddingBottom: 16 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  nomor: { color: colors.accent, fontSize: 11, fontWeight: '700' },
  badge: { backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 },
  badgeText: { fontSize: 11, color: colors.primary, fontWeight: '600' },
  nama: { color: colors.white, fontSize: 22, fontWeight: '600', marginTop: 10 },
  jenis: { color: '#CFE0D9', fontSize: 13, marginTop: 2 },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.18)', marginVertical: 14 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { color: '#E6EFEB', fontSize: 11, marginRight: 8 },
  avatarSm: { width: 22, height: 22, borderRadius: 11, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  avatarSmText: { fontSize: 9, fontWeight: '700', color: colors.primary },
  tabs: { flexDirection: 'row', backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.border },
  tab: { paddingVertical: 12, paddingHorizontal: 14 },
  tabActive: { borderBottomWidth: 2, borderBottomColor: colors.primary },
  tabText: { fontSize: 13, color: colors.muted },
  tabTextActive: { color: colors.primary, fontWeight: '700' },
  card: { backgroundColor: colors.card, borderRadius: radius.lg, padding: 16, borderWidth: 1, borderColor: colors.border },
  cardHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  cardTitle: { fontSize: 16, fontWeight: '600', color: colors.text },
  link: { color: colors.primary, fontWeight: '700', fontSize: 13 },
  small: { fontSize: 11, color: colors.muted },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  tahap: { fontSize: 18, fontWeight: '600', color: colors.text, marginTop: 4 },
  persen: { fontSize: 26, fontWeight: '700', color: colors.primary },
  bar: { height: 6, backgroundColor: colors.primarySoft, borderRadius: 3, marginTop: 14, overflow: 'hidden' },
  barFill: { height: 6, backgroundColor: colors.primary, borderRadius: 3 },
  hint: { fontSize: 10, color: colors.muted, marginTop: 8 },
  stats: { flexDirection: 'row', marginTop: 16, paddingTop: 14, borderTopWidth: 1, borderTopColor: colors.border },
  statValue: { fontSize: 13, fontWeight: '700', color: colors.text, marginTop: 2 },
  primaryBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 15,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: { color: colors.white, fontWeight: '700', fontSize: 15 },
  person: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: colors.primary, fontWeight: '700' },
  personName: { fontSize: 15, fontWeight: '700', color: colors.text },
  divLine: { height: 1, backgroundColor: colors.border, marginVertical: 14 },
  targetRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  chip: { backgroundColor: colors.primarySoft, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  chipText: { fontSize: 11, color: colors.primary, fontWeight: '600' },
  desc: { marginTop: 14, fontSize: 12, color: colors.muted, lineHeight: 18 },
  aiCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.accentSoft,
    borderRadius: radius.md,
    padding: 12,
    borderWidth: 1,
    borderColor: '#EADBB6',
  },
  aiIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#EFDDB0', alignItems: 'center', justifyContent: 'center' },
  aiTitle: { fontSize: 13, fontWeight: '700', color: colors.text },
  aiSub: { fontSize: 10, color: colors.muted, marginTop: 2 },
  aiBtn: { backgroundColor: colors.primary, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 },
  aiBtnText: { color: colors.white, fontSize: 12, fontWeight: '700' },
  step: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 },
  stepText: { fontSize: 14, color: colors.text },
});
