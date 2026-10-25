import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  StatusBar,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { NotaryColors } from '@/constants/notary-theme';

const SERVICE_TYPES = [
  'Pendirian Perseroan Terbatas',
  'Akta Jual Beli',
  'Legalisasi',
  'Pendaftaran Hak Tanggungan',
  'Waarmerking',
  'Perjanjian Kredit',
  'Akta Hibah',
  'Akta Wasiat',
];

const STAFF_LIST = ['Andi Pratama', 'Rina Amelia', 'Nadia Larasati'];
const PRIORITY_LIST = ['Rendah', 'Sedang', 'Tinggi'] as const;

/**
 * Route Tambah Layanan — Tab 3 (tombol tengah elevated).
 * Formulir pencatatan layanan baru sesuai PRD §6.3.
 * Tidak ada upload lampiran sesuai PRD §5.2.
 */
export default function TambahTab() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [clientName, setClientName] = useState('');
  const [serviceType, setServiceType] = useState('');
  const [selectedStaff, setSelectedStaff] = useState('');
  const [priority, setPriority] = useState<'Rendah' | 'Sedang' | 'Tinggi'>('Sedang');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const validate = () => {
    const newErrors: string[] = [];
    if (!clientName.trim()) newErrors.push('clientName');
    if (!serviceType) newErrors.push('serviceType');
    if (!selectedStaff) newErrors.push('staff');
    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      Alert.alert(
        'Layanan Disimpan',
        'Layanan baru berhasil dicatat. Nomor layanan akan dibuat otomatis oleh sistem.',
        [{ text: 'OK', onPress: () => router.navigate('/(tabs)/layanan') }]
      );
    }, 800);
  };

  const hasError = (field: string) => errors.includes(field);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) + 8 }]}>
        <View style={styles.headerContent}>
          <View style={styles.headerIcon}>
            <Ionicons name="briefcase-outline" size={20} color={NotaryColors.gold} />
          </View>
          <View style={styles.headerTexts}>
            <Text style={styles.headerEyebrow}>TAMBAH</Text>
            <Text style={styles.headerTitle}>Layanan Baru</Text>
          </View>
        </View>
        <Text style={styles.headerSubtitle}>
          Isi data operasional layanan. Nomor layanan dibuat otomatis.
        </Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 120 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">

        {/* Bagian: Informasi Utama */}
        <Text style={styles.sectionLabel}>INFORMASI UTAMA</Text>
        <View style={styles.formCard}>

          {/* Nama Klien */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>
              Nama Klien <Text style={styles.required}>*</Text>
            </Text>
            <View style={[styles.inputWrap, hasError('clientName') && styles.inputError]}>
              <Ionicons name="person-outline" size={17} color="#8A95A0" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Masukkan nama lengkap klien"
                placeholderTextColor="#9CA3AF"
                value={clientName}
                onChangeText={setClientName}
                accessibilityLabel="Nama Klien"
              />
            </View>
            {hasError('clientName') && (
              <Text style={styles.errorText}>Nama klien wajib diisi</Text>
            )}
          </View>

          {/* Jenis Layanan */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>
              Jenis Layanan <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.chipGroup}>
              {SERVICE_TYPES.map((type) => (
                <Pressable
                  key={type}
                  style={[styles.chip, serviceType === type && styles.chipActive]}
                  onPress={() => setServiceType(type)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: serviceType === type }}>
                  <Text style={[styles.chipText, serviceType === type && styles.chipTextActive]}>
                    {type}
                  </Text>
                </Pressable>
              ))}
            </View>
            {hasError('serviceType') && (
              <Text style={styles.errorText}>Jenis layanan wajib dipilih</Text>
            )}
          </View>
        </View>

        {/* Bagian: Penugasan */}
        <Text style={styles.sectionLabel}>PENUGASAN</Text>
        <View style={styles.formCard}>

          {/* Penanggung Jawab */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>
              Penanggung Jawab <Text style={styles.required}>*</Text>
            </Text>
            {STAFF_LIST.map((staff) => (
              <Pressable
                key={staff}
                style={[styles.staffRow, selectedStaff === staff && styles.staffRowActive]}
                onPress={() => setSelectedStaff(staff)}
                accessibilityRole="radio"
                accessibilityState={{ selected: selectedStaff === staff }}>
                <View style={styles.staffAvatar}>
                  <Text style={styles.staffAvatarText}>
                    {staff.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                  </Text>
                </View>
                <Text style={styles.staffName}>{staff}</Text>
                {selectedStaff === staff && (
                  <Ionicons name="checkmark-circle" size={20} color={NotaryColors.primary} />
                )}
              </Pressable>
            ))}
            {hasError('staff') && (
              <Text style={styles.errorText}>Penanggung jawab wajib dipilih</Text>
            )}
          </View>

          {/* Prioritas */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Prioritas</Text>
            <View style={styles.priorityRow}>
              {PRIORITY_LIST.map((p) => (
                <Pressable
                  key={p}
                  style={[styles.priorityChip, priority === p && styles.priorityChipActive]}
                  onPress={() => setPriority(p)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: priority === p }}>
                  <Text
                    style={[styles.priorityText, priority === p && styles.priorityTextActive]}>
                    {p}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>

        {/* Bagian: Catatan Awal */}
        <Text style={styles.sectionLabel}>CATATAN AWAL (OPSIONAL)</Text>
        <View style={styles.formCard}>
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Catatan</Text>
            <TextInput
              style={styles.textarea}
              placeholder="Deskripsi singkat kebutuhan klien atau catatan awal..."
              placeholderTextColor="#9CA3AF"
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              accessibilityLabel="Catatan Awal"
            />
          </View>
        </View>

        {/* Info Note: Tahap Awal */}
        <View style={styles.infoNote}>
          <Ionicons name="information-circle-outline" size={16} color={NotaryColors.primary} />
          <Text style={styles.infoNoteText}>
            Tahap awal otomatis: <Text style={styles.infoNoteBold}>Penerimaan Berkas</Text>
          </Text>
        </View>

        {/* Tombol Simpan */}
        <Pressable
          style={({ pressed }: { pressed: boolean }) => [
            styles.saveButton,
            pressed && styles.saveButtonPressed,
            isSaving && styles.saveButtonDisabled,
          ]}
          onPress={handleSave}
          disabled={isSaving}
          accessibilityRole="button"
          accessibilityLabel="Simpan Layanan">
          {isSaving ? (
            <Text style={styles.saveButtonText}>Menyimpan layanan...</Text>
          ) : (
            <>
              <Ionicons name="checkmark-outline" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.saveButtonText}>Simpan Layanan</Text>
            </>
          )}
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: NotaryColors.background },
  header: {
    backgroundColor: NotaryColors.primary,
    paddingHorizontal: 20,
    paddingBottom: 22,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  headerIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.10)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(196,164,55,0.3)',
  },
  headerTexts: { flex: 1 },
  headerEyebrow: {
    fontSize: 10,
    fontWeight: '700',
    color: NotaryColors.gold,
    letterSpacing: 1.2,
    marginBottom: 2,
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#FFFFFF' },
  headerSubtitle: {
    fontSize: 12.5,
    color: 'rgba(255,255,255,0.72)',
    lineHeight: 18,
  },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 22 },
  sectionLabel: {
    fontSize: 10.5,
    fontWeight: '700',
    color: NotaryColors.textSecondary,
    letterSpacing: 0.8,
    marginBottom: 10,
    marginTop: 4,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 4,
    borderWidth: 1,
    borderColor: '#ECEFF1',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  fieldGroup: { marginBottom: 18 },
  fieldLabel: {
    fontSize: 13.5,
    fontWeight: '600',
    color: NotaryColors.textPrimary,
    marginBottom: 8,
  },
  required: { color: '#E05252' },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
    backgroundColor: '#FAFAFA',
  },
  inputError: { borderColor: '#E05252' },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 14, color: NotaryColors.textPrimary },
  errorText: { fontSize: 11.5, color: '#E05252', marginTop: 5, fontWeight: '500' },
  chipGroup: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: '#FAFAFA',
  },
  chipActive: {
    backgroundColor: NotaryColors.primary,
    borderColor: NotaryColors.primary,
  },
  chipText: { fontSize: 12.5, color: NotaryColors.textSecondary, fontWeight: '500' },
  chipTextActive: { color: '#FFFFFF', fontWeight: '700' },
  staffRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    marginBottom: 8,
    backgroundColor: '#FAFAFA',
    gap: 10,
  },
  staffRowActive: {
    borderColor: NotaryColors.primary,
    backgroundColor: '#EEF6F3',
  },
  staffAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#D1DDD8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  staffAvatarText: { fontSize: 11, fontWeight: '700', color: '#264D43' },
  staffName: { flex: 1, fontSize: 14, fontWeight: '500', color: NotaryColors.textPrimary },
  priorityRow: { flexDirection: 'row', gap: 10 },
  priorityChip: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: '#FAFAFA',
  },
  priorityChipActive: {
    backgroundColor: NotaryColors.primary,
    borderColor: NotaryColors.primary,
  },
  priorityText: { fontSize: 13, fontWeight: '600', color: NotaryColors.textSecondary },
  priorityTextActive: { color: '#FFFFFF', fontWeight: '700' },
  textarea: {
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    color: NotaryColors.textPrimary,
    backgroundColor: '#FAFAFA',
    minHeight: 100,
    lineHeight: 20,
  },
  infoNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#EEF4F1',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 20,
  },
  infoNoteText: { fontSize: 13, color: NotaryColors.textSecondary, flex: 1, lineHeight: 18 },
  infoNoteBold: { fontWeight: '700', color: NotaryColors.primary },
  saveButton: {
    backgroundColor: NotaryColors.primary,
    borderRadius: 16,
    height: 54,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: NotaryColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 4,
  },
  saveButtonPressed: { opacity: 0.88, transform: [{ scale: 0.98 }] },
  saveButtonDisabled: { opacity: 0.65 },
  saveButtonText: { color: '#FFFFFF', fontSize: 15.5, fontWeight: '700' },
});
