import { router } from 'expo-router';
import React from 'react';
import { FlatList, Pressable, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TAHAP } from '../../constants/data';
import { colors, radius } from '../../constants/theme';
import { useLayanan } from '../../store/LayananContext';

export default function DaftarLayanan() {
  const { daftar } = useLayanan();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.title}>Layanan</Text>
      <FlatList
        data={daftar}
        keyExtractor={(l) => l.id}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        ListEmptyComponent={
          <Text style={styles.empty}>Belum ada layanan. Ketuk Tambah di bawah untuk membuat layanan pertama.</Text>
        }
        renderItem={({ item }) => (
          <Pressable style={styles.card} onPress={() => router.push(`/detail/${item.id}`)}>
            <Text style={styles.nomor}>{item.nomor}</Text>
            <Text style={styles.nama}>{item.namaKlien}</Text>
            <Text style={styles.sub}>
              {item.jenisLayanan} · {TAHAP[item.tahapIndex]}
            </Text>
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  title: { fontSize: 20, fontWeight: '700', color: colors.text, padding: 16, paddingBottom: 0 },
  card: { backgroundColor: colors.card, borderRadius: radius.md, padding: 16, borderWidth: 1, borderColor: colors.border },
  nomor: { fontSize: 11, color: colors.accent, fontWeight: '700' },
  nama: { fontSize: 17, fontWeight: '700', color: colors.text, marginTop: 4 },
  sub: { fontSize: 12, color: colors.muted, marginTop: 2 },
  empty: { textAlign: 'center', color: colors.muted, marginTop: 60, paddingHorizontal: 30 },
});
