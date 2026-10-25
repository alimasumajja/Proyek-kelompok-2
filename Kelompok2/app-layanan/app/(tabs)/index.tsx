import { router } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TAHAP } from '../../constants/data';
import { colors, radius } from '../../constants/theme';
import { useLayanan } from '../../store/LayananContext';

export default function Beranda() {
  const { daftar } = useLayanan();
  const aktif = daftar.filter((l) => l.status === 'Aktif').length;
  const selesai = daftar.filter((l) => l.status === 'Selesai').length;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 14 }}>
        <Text style={styles.title}>Beranda</Text>
        <View style={styles.row}>
          <View style={styles.stat}>
            <Text style={styles.statNum}>{aktif}</Text>
            <Text style={styles.statLabel}>Layanan aktif</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statNum}>{selesai}</Text>
            <Text style={styles.statLabel}>Selesai</Text>
          </View>
        </View>

        <Text style={styles.section}>Terbaru</Text>
        {daftar.length === 0 && <Text style={styles.empty}>Belum ada layanan.</Text>}
        {daftar.slice(0, 3).map((l) => (
          <Pressable key={l.id} style={styles.card} onPress={() => router.push(`/detail/${l.id}`)}>
            <Text style={styles.nomor}>{l.nomor}</Text>
            <Text style={styles.nama}>{l.namaKlien}</Text>
            <Text style={styles.sub}>
              {l.jenisLayanan} · {TAHAP[l.tahapIndex]}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  title: { fontSize: 20, fontWeight: '700', color: colors.text },
  row: { flexDirection: 'row', gap: 12 },
  stat: { flex: 1, backgroundColor: colors.primary, borderRadius: radius.lg, padding: 16 },
  statNum: { fontSize: 28, fontWeight: '700', color: colors.white },
  statLabel: { fontSize: 12, color: '#CFE0D9', marginTop: 2 },
  section: { fontSize: 14, fontWeight: '700', color: colors.text, marginTop: 6 },
  empty: { color: colors.muted, fontSize: 13 },
  card: { backgroundColor: colors.card, borderRadius: radius.md, padding: 16, borderWidth: 1, borderColor: colors.border },
  nomor: { fontSize: 11, color: colors.accent, fontWeight: '700' },
  nama: { fontSize: 16, fontWeight: '700', color: colors.text, marginTop: 4 },
  sub: { fontSize: 12, color: colors.muted, marginTop: 2 },
});
