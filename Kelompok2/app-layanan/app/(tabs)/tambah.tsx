import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateField from '../../components/DateField';
import FormField from '../../components/FormField';
import SelectField from '../../components/SelectField';
import { JENIS_LAYANAN, PRIORITAS, STAF, TAHAP } from '../../constants/data';
import { colors, radius } from '../../constants/theme';
import { useLayanan } from '../../store/LayananContext';
import { Prioritas } from '../../types/layanan';

interface FormState {
  namaKlien: string;
  jenisLayanan: string;
  tanggalDiterima: string;
  penanggungJawab: string;
  kontakKlien: string;
  deskripsi: string;
  prioritas: Prioritas;
  targetSelesai: string;
}

const AWAL: FormState = {
  namaKlien: '',
  jenisLayanan: '',
  tanggalDiterima: '',
  penanggungJawab: '',
  kontakKlien: '',
  deskripsi: '',
  prioritas: 'Normal',
  targetSelesai: '',
};

export default function TambahLayanan() {
  const { tambahLayanan } = useLayanan();
  const [form, setForm] = useState<FormState>(AWAL);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [menyimpan, setMenyimpan] = useState(false);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const validasi = () => {
    const e: Partial<Record<keyof FormState, string>> = {};
    if (!form.namaKlien.trim()) e.namaKlien = 'Nama klien wajib diisi';
    if (!form.jenisLayanan) e.jenisLayanan = 'Pilih jenis layanan';
    if (!form.tanggalDiterima) e.tanggalDiterima = 'Tanggal diterima wajib diisi';
    if (!form.penanggungJawab) e.penanggungJawab = 'Pilih penanggung jawab';
    if (
      form.targetSelesai &&
      form.tanggalDiterima &&
      new Date(form.targetSelesai) < new Date(form.tanggalDiterima)
    ) {
      e.targetSelesai = 'Target tidak boleh sebelum tanggal diterima';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const simpan = async () => {
    if (!validasi() || menyimpan) return;
    setMenyimpan(true);
    try {
      const baru = await tambahLayanan({
        namaKlien: form.namaKlien.trim(),
        jenisLayanan: form.jenisLayanan,
        tanggalDiterima: form.tanggalDiterima,
        penanggungJawab: form.penanggungJawab,
        kontakKlien: form.kontakKlien.trim() || undefined,
        deskripsi: form.deskripsi.trim() || undefined,
        prioritas: form.prioritas,
        targetSelesai: form.targetSelesai || undefined,
      });
      setForm(AWAL);
      router.replace(`/detail/${baru.id}`);
    } finally {
      setMenyimpan(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.topbar}>
        <Pressable onPress={() => router.replace('/layanan')} hitSlop={12} style={styles.back}>
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </Pressable>
        <Text style={styles.topTitle}>Tambah Layanan</Text>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.hero}>
            <View style={styles.heroIcon}>
              <Ionicons name="briefcase-outline" size={20} color={colors.primary} />
            </View>
            <Text style={styles.heroTitle}>Layanan baru</Text>
            <Text style={styles.heroSub}>Isi informasi operasional layanan. Nomor layanan akan dibuat otomatis.</Text>
          </View>

          <Text style={styles.section}>Informasi utama</Text>
          <View style={styles.card}>
            <FormField
              label="Nama klien"
              wajib
              placeholder="Masukkan nama lengkap"
              value={form.namaKlien}
              onChangeText={(t) => set('namaKlien', t)}
              error={errors.namaKlien}
            />
            <SelectField
              label="Jenis layanan"
              wajib
              placeholder="Pilih jenis layanan"
              options={JENIS_LAYANAN}
              value={form.jenisLayanan}
              onChange={(v) => set('jenisLayanan', v)}
              error={errors.jenisLayanan}
            />
            <DateField
              label="Tanggal diterima"
              wajib
              value={form.tanggalDiterima}
              onChange={(v) => set('tanggalDiterima', v)}
              error={errors.tanggalDiterima}
            />
            <SelectField
              label="Penanggung jawab"
              wajib
              placeholder="Pilih staf"
              options={STAF}
              value={form.penanggungJawab}
              onChange={(v) => set('penanggungJawab', v)}
              error={errors.penanggungJawab}
            />
          </View>

          <Text style={styles.section}>Detail tambahan</Text>
          <View style={styles.card}>
            <FormField
              label="Kontak klien"
              placeholder="Nomor telepon atau email"
              value={form.kontakKlien}
              onChangeText={(t) => set('kontakKlien', t)}
              autoCapitalize="none"
            />
            <FormField
              label="Deskripsi singkat kebutuhan"
              placeholder="Jelaskan kebutuhan klien secara ringkas"
              value={form.deskripsi}
              onChangeText={(t) => set('deskripsi', t)}
              multiline
            />
            <SelectField
              label="Prioritas"
              options={PRIORITAS}
              value={form.prioritas}
              onChange={(v) => set('prioritas', v as Prioritas)}
            />
            <DateField
              label="Target penyelesaian"
              value={form.targetSelesai}
              onChange={(v) => set('targetSelesai', v)}
              error={errors.targetSelesai}
            />
          </View>

          <View style={styles.info}>
            <Ionicons name="sparkles-outline" size={14} color={colors.primary} />
            <Text style={styles.infoText}>Tahap awal otomatis: {TAHAP[0]}</Text>
          </View>

          <Pressable style={[styles.button, menyimpan && { opacity: 0.6 }]} onPress={simpan} disabled={menyimpan}>
            <Text style={styles.buttonText}>Simpan Layanan</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  topbar: { height: 52, alignItems: 'center', justifyContent: 'center' },
  back: { position: 'absolute', left: 12 },
  topTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  scroll: { padding: 16, paddingBottom: 40 },
  hero: { alignItems: 'center', marginBottom: 20 },
  heroIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  heroTitle: { fontSize: 17, fontWeight: '600', color: colors.text },
  heroSub: { fontSize: 12, color: colors.muted, textAlign: 'center', marginTop: 4, paddingHorizontal: 20 },
  section: { fontSize: 12, fontWeight: '700', color: colors.muted, marginBottom: 8, marginTop: 4 },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  info: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.primarySoft,
    borderRadius: radius.md,
    padding: 12,
    marginBottom: 16,
  },
  infoText: { fontSize: 12, color: colors.primary },
  button: { backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: 16, alignItems: 'center' },
  buttonText: { color: colors.white, fontWeight: '700', fontSize: 15 },
});
