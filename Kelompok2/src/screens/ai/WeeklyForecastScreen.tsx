import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText, Badge, Button, Input } from '@/components/atoms';
import { InfoNote } from '@/components/molecules';
import { AppHeader } from '@/components/organisms/AppHeader';
import { NotaryColors, Radius } from '@/constants/notary-theme';
import { parseWeeklyCounts, predictWeeklyDeeds, weeklyModelInfo } from '@/utils/weekly-forecast';

const labels = ['Minggu 1 · paling lama', 'Minggu 2', 'Minggu 3', 'Minggu 4 · paling baru'];

export default function WeeklyForecastScreen() {
  const insets = useSafeAreaInsets();
  const [values, setValues] = useState(['', '', '', '']);
  const [result, setResult] = useState<ReturnType<typeof predictWeeklyDeeds> | null>(null);
  const [error, setError] = useState('');
  const [example, setExample] = useState(false);
  const change = (next: string[]) => { setValues(next); setResult(null); setError(''); setExample(false); };
  const calculate = () => {
    try {
      setResult(predictWeeklyDeeds(parseWeeklyCounts(values)));
      setError('');
    } catch (e) {
      setResult(null);
      setError(e instanceof Error ? e.message : 'Prediksi belum dapat dihitung.');
    }
  };
  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <AppHeader title="Eksperimen AI" onBack={() => router.canGoBack() ? router.back() : router.replace('/login')} />
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}>
        <Badge label="Eksperimen kuliah · Offline" tone="gold" />
        <AppText variant="title" accessibilityRole="header">Prediksi akta mingguan</AppText>
        <InfoNote title="Hasil prediksi masih terbatas" text="Untuk demonstrasi pembelajaran. Model belum mengungguli baseline secara konsisten. Jangan gunakan hasilnya sebagai dasar keputusan operasional kantor." />
        <AppText>Masukkan jumlah akta dari empat minggu penuh yang berurutan (Senin–Minggu), dari paling lama ke paling baru. Prediksi berlaku untuk satu minggu sesudahnya.</AppText>
        <InfoNote tone="neutral" icon="phone-portrait-outline" text="Dihitung langsung di perangkat. Tidak perlu login atau internet. Input tidak dikirim, tidak disimpan, dan tidak mengambil data layanan kantor." />
        <View style={styles.card}>
          {labels.map((label, i) => (
            <View key={label} style={styles.field}>
              <AppText variant="label">{label}</AppText>
              <Input accessibilityLabel={`${label}, jumlah akta`} placeholder="Masukkan jumlah akta, contoh 2" keyboardType="number-pad" maxLength={5} value={values[i]} onChangeText={(value) => change(values.map((v, index) => index === i ? value : v))} />
            </View>
          ))}
          <AppText variant="caption">Isi 0 jika memang tidak ada akta. Biarkan kosong jika jumlahnya belum diketahui.</AppText>
          {error ? <AppText color={NotaryColors.danger} accessibilityRole="alert">{error}</AppText> : null}
          <Button label="Hitung prediksi offline" onPress={calculate} />
          <Button variant="outline" label="Gunakan contoh simulasi" onPress={() => { change(['1', '2', '3', '4']); setExample(true); }} />
          <Button variant="outline" label="Kosongkan input" onPress={() => change(['', '', '', ''])} />
          {example ? <AppText variant="caption">Contoh simulasi, bukan catatan kantor.</AppText> : null}
        </View>
        {result ? (
          <View style={styles.card} accessibilityLiveRegion="polite">
            <AppText variant="heading">Perkiraan untuk minggu berikutnya</AppText>
            <AppText variant="display">{result.prediction.toFixed(2).replace('.', ',')} akta</AppText>
            <AppText>Baseline minggu sebelumnya: {result.baseline} akta.</AppText>
            <AppText variant="caption">Angka desimal adalah nilai perkiraan model, bukan jumlah akta pasti atau tingkat keyakinan.</AppText>
            {result.outsideTrainingRange ? <InfoNote text="Input melebihi jumlah mingguan tertinggi pada data pelatihan (11 akta). Prediksi di luar rentang ini lebih tidak dapat diandalkan." /> : null}
          </View>
        ) : null}
        <View style={styles.card}>
          <AppText variant="heading">Tentang eksperimen</AppText>
          <AppText variant="caption">Ridge 4 minggu · model {weeklyModelInfo.version}. Dilatih dari 42 minggu penuh, 5 Januari–25 Oktober 2026. Tidak belajar ulang secara otomatis.</AppText>
          <AppText variant="caption">Pada evaluasi eksploratif 8 minggu dengan pelatihan ulang mingguan, galat rata-rata model 3,66 akta/minggu; baseline 1,63. Angka ini bukan persentase akurasi atau jaminan performa model tetap di aplikasi.</AppText>
          <AppText variant="caption">Inferensi memakai koefisien model lokal dalam JavaScript, bukan TensorFlow Lite. Model dan input tersedia tanpa unduhan tambahan.</AppText>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: NotaryColors.background },
  content: { padding: 16, gap: 16 },
  card: { padding: 16, gap: 14, borderRadius: Radius.lg, backgroundColor: NotaryColors.card, borderWidth: 1, borderColor: NotaryColors.border },
  field: { gap: 6 },
});
