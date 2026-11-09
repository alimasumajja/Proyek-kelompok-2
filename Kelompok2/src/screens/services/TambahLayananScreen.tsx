import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { NotaryColors, Radius } from "@/constants/notary-theme";
import { SERVICE_STAGES } from "@/constants/service";
import { useAuth } from "@/context/AuthContext";
import { useServiceStore } from "@/context/service-store";
import { useToast } from "@/context/toast";
import { useStatusBarStyle } from "@/hooks/use-status-bar-style";
import { useSession } from "@/hooks/use-session";
import type { ServicePriority } from "@/types/service";
import { parseInputDate } from "@/utils/date";
import { AppText, Button, Input } from "@/components/atoms";
import { FormField, InfoNote, SelectField } from "@/components/molecules";
import { DateInputField } from "@/components/molecules/DateInputField";
import { PickerField } from "@/components/molecules/PickerField";
import { AppHeader } from "@/components/organisms";

/** Label pilihan di formulir → nilai yang disimpan ("Normal" = prioritas "Sedang"). */
const PRIORITY_OPTIONS = ["Rendah", "Normal", "Tinggi"] as const;
type PriorityOption = (typeof PRIORITY_OPTIONS)[number];
const PRIORITY_VALUE: Record<PriorityOption, ServicePriority> = {
  Rendah: "Rendah",
  Normal: "Sedang",
  Tinggi: "Tinggi",
};

interface FormState {
  clientName: string;
  serviceType: string;
  receivedDate: string;
  staffName: string;
  clientContact: string;
  description: string;
  priority: PriorityOption;
  dueDate: string;
}

const INITIAL_FORM: FormState = {
  clientName: "",
  serviceType: "",
  receivedDate: "",
  staffName: "",
  clientContact: "",
  description: "",
  priority: "Normal",
  dueDate: "",
};

type FormErrors = Partial<Record<keyof FormState, string>>;

interface TambahLayananScreenProps {
  onBack: () => void;
  /** Dipanggil setelah layanan berhasil disimpan (mis. pindah ke daftar Layanan). */
  onSaved: () => void;
}

/**
 * Halaman Tambah Layanan — PRD §6.3. Mencatat layanan baru; nomor layanan dibuat otomatis
 * dan tahap awal selalu "Penerimaan Berkas". Tidak ada unggah lampiran (PRD §5.2).
 */
export function TambahLayananScreen({ onBack, onSaved }: TambahLayananScreenProps) {
  useStatusBarStyle("dark");
  const insets = useSafeAreaInsets();
  const { showToast } = useToast();
  const { user } = useAuth();

  const { addService, serviceTypes, activeServiceTypeNames, activeStaff } = useServiceStore();
  const { account, isNotaris } = useSession();

  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<FormErrors>({});

  // Hanya akun aktif yang dapat ditugaskan sebagai penanggung jawab.
  const staffOptions = user?.role === "Notaris" ? activeStaff.map((staff) => staff.name) : user ? [user.name] : [];

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validate = (): boolean => {
    const next: FormErrors = {};
    if (!form.clientName.trim()) next.clientName = "Nama klien wajib diisi";
    if (!form.serviceType) next.serviceType = "Pilih jenis layanan";
    if (!form.staffName) next.staffName = "Pilih penanggung jawab";

    const received = parseInputDate(form.receivedDate);
    if (!form.receivedDate) next.receivedDate = "Tanggal diterima wajib diisi";
    else if (!received) next.receivedDate = "Tanggal tidak valid. Gunakan format HH-BB-TTTT";

    if (form.dueDate) {
      const due = parseInputDate(form.dueDate);
      if (!due) next.dueDate = "Tanggal tidak valid. Gunakan format HH-BB-TTTT";
      else if (received && due < received) next.dueDate = "Target tidak boleh sebelum tanggal diterima";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    if (!account) {
      showToast("Sesi pengguna tidak ditemukan.");
      return;
    }

    const receivedDate = parseInputDate(form.receivedDate);
    if (!receivedDate) return;

    const selectedStaff = isNotaris
      ? activeStaff.find((staff) => staff.name === form.staffName)
      : account
        ? {
            id: account.id,
            name: account.name,
            initials: account.initials,
          }
        : undefined;

    const selectedType = serviceTypes.find((type) => type.active && type.name === form.serviceType);

    if (!selectedType) {
      showToast("Jenis layanan tidak tersedia.");
      return;
    }

    if (!selectedStaff?.id) {
      showToast("Penanggung jawab tidak valid.");
      return;
    }

    try {
      await addService({
        clientName: form.clientName.trim(),
        serviceType: selectedType.name,
        receivedDate,
        assignedStaff: selectedStaff,
        priority: PRIORITY_VALUE[form.priority],
        isNotaris,
        dueDate: form.dueDate ? (parseInputDate(form.dueDate) ?? undefined) : undefined,
        clientContact: form.clientContact.trim() || undefined,
        description: form.description.trim() || undefined,
        createdBy: account.name,
      });

      setForm(INITIAL_FORM);
      setErrors({});
      showToast("Layanan berhasil disimpan.");
      onSaved();
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Gagal menyimpan layanan.");
    }
  };

  return (
    <View style={styles.screen}>
      <AppHeader title="Tambah Layanan" onBack={onBack} />

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom, 16) + 24 }]} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {/* Pengantar */}
          <View style={styles.hero}>
            <View style={styles.heroIcon}>
              <Ionicons name="briefcase-outline" size={22} color={NotaryColors.emerald} />
            </View>
            <AppText variant="heading" style={styles.center}>
              Layanan baru
            </AppText>
            <AppText variant="caption" color={NotaryColors.textSecondary} style={styles.center}>
              Isi informasi operasional layanan. Nomor layanan akan dibuat otomatis.
            </AppText>
          </View>

          {/* Informasi utama */}
          <AppText variant="eyebrow" color={NotaryColors.textSecondary} style={styles.sectionLabel}>
            INFORMASI UTAMA
          </AppText>
          <View style={styles.card}>
            <FormField label="Nama klien" required error={errors.clientName}>
              <Input value={form.clientName} onChangeText={(t) => setField("clientName", t)} placeholder="Masukkan nama lengkap" autoCapitalize="words" invalid={!!errors.clientName} accessibilityLabel="Nama klien" />
            </FormField>

            <PickerField label="Jenis layanan" required placeholder="Pilih jenis layanan" value={form.serviceType} options={activeServiceTypeNames} onChange={(v) => setField("serviceType", v)} error={errors.serviceType} />

            <DateInputField label="Tanggal diterima" required value={form.receivedDate} onChangeText={(v) => setField("receivedDate", v)} error={errors.receivedDate} />

            <PickerField label="Penanggung jawab" required placeholder="Pilih staf" value={form.staffName} options={staffOptions} onChange={(v) => setField("staffName", v)} error={errors.staffName} />
          </View>

          {/* Detail tambahan */}
          <AppText variant="eyebrow" color={NotaryColors.textSecondary} style={styles.sectionLabel}>
            DETAIL TAMBAHAN
          </AppText>
          <View style={styles.card}>
            <FormField label="Kontak klien">
              <Input value={form.clientContact} onChangeText={(t) => setField("clientContact", t)} placeholder="Nomor telepon atau email" autoCapitalize="none" keyboardType="email-address" accessibilityLabel="Kontak klien" />
            </FormField>

            <FormField label="Deskripsi singkat kebutuhan">
              <Input value={form.description} onChangeText={(t) => setField("description", t)} placeholder="Jelaskan kebutuhan klien secara ringkas" rows={3} accessibilityLabel="Deskripsi singkat kebutuhan" />
            </FormField>

            <SelectField label="Prioritas" value={form.priority} options={PRIORITY_OPTIONS} onChange={(v) => setField("priority", v)} />

            <DateInputField label="Target penyelesaian" value={form.dueDate} onChangeText={(v) => setField("dueDate", v)} error={errors.dueDate} />
          </View>

          <InfoNote icon="sparkles-outline" tone="neutral" text={`Tahap awal otomatis: ${SERVICE_STAGES[0]}`} />

          <View style={styles.saveWrap}>
            <Button label="Simpan Layanan" onPress={handleSave} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: NotaryColors.background },
  flex: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 20, gap: 12 },
  hero: { alignItems: "center", gap: 6, paddingHorizontal: 12, marginBottom: 8 },
  heroIcon: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    backgroundColor: NotaryColors.statNormalBg,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  center: { textAlign: "center" },
  sectionLabel: { marginTop: 4 },
  card: {
    gap: 16,
    padding: 16,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: NotaryColors.border,
    backgroundColor: "#FFFFFF",
  },
  saveWrap: { marginTop: 4 },
});
