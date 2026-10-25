import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TAHAP } from '../../constants/data';
import { colors, radius } from '../../constants/theme';
import { useLayanan } from '../../store/LayananContext';

export default function Laporan() {
  const { daftar } = useLayanan();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
        <Text style={styles.title}>Laporan</Text>
        <Text style={styles.sub}>Jumlah layanan di setiap tahap</Text>
        <View style={styles.card}>
          {TAHAP.map((t, i) => (
            <View key={t} style={styles.row}>
              <Text style={styles.label}>{t}</Text>
              <Text style={styles.value}>{daftar.filter((l) => l.tahapIndex === i).length}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  title: { fontSize: 20, fontWeight: '700', color: colors.text },
  sub: { fontSize: 12, color: colors.muted },
  card: { backgroundColor: colors.card, borderRadius: radius.lg, padding: 16, borderWidth: 1, borderColor: colors.border },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10 },
  label: { fontSize: 14, color: colors.text },
  value: { fontSize: 14, fontWeight: '700', color: colors.primary },
});
