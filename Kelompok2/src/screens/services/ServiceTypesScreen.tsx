import React, { useState } from "react";
import { Alert, FlatList, StyleSheet, View } from "react-native";
import { NotaryColors } from "@/constants/notary-theme";
import { useServiceStore } from "@/context/service-store";
import { useToast } from "@/context/toast";
import { useSession } from "@/hooks/use-session";
import { useStatusBarStyle } from "@/hooks/use-status-bar-style";
import type { ServiceType } from "@/types/service";
import { canManageServiceTypes } from "@/utils/permissions";
import { countServicesUsingType } from "@/utils/service-types";
import { Button } from "@/components/atoms";
import { EmptyState, InfoNote, ServiceTypeRow } from "@/components/molecules";
import { AppHeader, ServiceTypeFormSheet } from "@/components/organisms";

type FormState = { mode: "add" } | { mode: "edit"; type: ServiceType } | null;

interface ServiceTypesScreenProps {
  onBack: () => void;
}

/**
 * Kelola Jenis Layanan (CRUD) — khusus Notaris.
 * - Tambah: jenis baru langsung tersedia di formulir Tambah Layanan.
 * - Ubah: nama baru juga diterapkan ke layanan yang sudah memakainya.
 * - Nonaktifkan: jenis tidak muncul di formulir, layanan lama tetap utuh.
 * - Hapus: hanya bila belum dipakai layanan mana pun.
 */
export function ServiceTypesScreen({ onBack }: ServiceTypesScreenProps) {
  useStatusBarStyle("dark");
  const { showToast } = useToast();
  const { actor } = useSession();
  const { serviceTypes, services, serviceTypesLoading, serviceTypesError, refreshServiceTypes, addServiceType, renameServiceType, setServiceTypeActive, deleteServiceType } = useServiceStore();
  const [form, setForm] = useState<FormState>(null);

  if (!canManageServiceTypes(actor)) {
    return (
      <View style={styles.screen}>
        <AppHeader title="Jenis Layanan" onBack={onBack} />
        <EmptyState icon="lock-closed-outline" title="Hanya untuk Notaris" description="Pengaturan jenis layanan hanya dapat diubah oleh Notaris." actionLabel="Kembali" onActionPress={onBack} />
      </View>
    );
  }

  const submit = async (name: string) => {
    const result = form?.mode === "edit" ? await renameServiceType(form.type.id, name) : await addServiceType(name);

    if (result.ok) {
      showToast(form?.mode === "edit" ? "Jenis layanan diperbarui" : "Jenis layanan ditambahkan");
      setForm(null);
    }

    return result;
  };

  const toggleActive = async (id: string, active: boolean) => {
    const result = await setServiceTypeActive(id, active);

    showToast(result.ok ? (active ? "Jenis layanan diaktifkan" : "Jenis layanan dinonaktifkan") : result.error);
  };

  const askDelete = (type: ServiceType) => {
    const used = countServicesUsingType(services, type.name);
    if (used > 0) {
      Alert.alert("Tidak dapat dihapus", `"${type.name}" masih dipakai ${used} layanan. Nonaktifkan saja agar tidak muncul di formulir layanan baru.`, [
        { text: "Tutup", style: "cancel" },
        ...(type.active
          ? [
              {
                text: "Nonaktifkan",
                onPress: async () => {
                  const result = await setServiceTypeActive(type.id, false);

                  showToast(result.ok ? "Jenis layanan dinonaktifkan" : result.error);
                },
              },
            ]
          : []),
      ]);
      return;
    }
    Alert.alert("Hapus jenis layanan?", `"${type.name}" akan dihapus permanen.`, [
      { text: "Batal", style: "cancel" },
      {
        text: "Hapus",
        style: "destructive",
        onPress: async () => {
          const result = await deleteServiceType(type.id);
          showToast(result.ok ? "Jenis layanan dihapus" : result.error);
        },
      },
    ]);
  };

  const activeCount = serviceTypes.filter((t) => t.active).length;

  return (
    <View style={styles.screen}>
      <AppHeader title="Jenis Layanan" onBack={onBack} action={{ icon: "add", label: "Tambah jenis layanan", onPress: () => setForm({ mode: "add" }) }} />

      <FlatList
        data={serviceTypes}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.header}>
            <InfoNote tone="neutral" icon="information-circle-outline" text="Jenis yang dinonaktifkan tidak muncul di formulir Tambah Layanan. Layanan yang sudah ada tidak berubah." />
            {serviceTypesError ? <InfoNote tone="neutral" text={`Gagal memperbarui data: ${serviceTypesError}`} /> : null}
          </View>
        }
        renderItem={({ item }) => (
          <ServiceTypeRow
            type={item}
            usageCount={countServicesUsingType(services, item.name)}
            onToggleActive={(active) => {
              void toggleActive(item.id, active);
            }}
            onEdit={() => setForm({ mode: "edit", type: item })}
            onDelete={() => askDelete(item)}
          />
        )}
        ItemSeparatorComponent={() => <View style={styles.gap} />}
        ListEmptyComponent={
          serviceTypesLoading ? (
            <InfoNote tone="neutral" text="Memuat jenis layanan..." />
          ) : serviceTypesError ? (
            <EmptyState
              title="Gagal memuat jenis layanan"
              description="Periksa koneksi Anda, kemudian coba muat ulang data."
              actionLabel="Coba Lagi"
              onActionPress={() => {
                void refreshServiceTypes();
              }}
            />
          ) : (
            <EmptyState title="Belum ada jenis layanan" description="Tambahkan jenis layanan agar bisa dipilih saat mencatat layanan baru." actionLabel="Tambah Jenis Layanan" onActionPress={() => setForm({ mode: "add" })} />
          )
        }
        ListFooterComponent={
          serviceTypes.length > 0 ? (
            <View style={styles.footer}>
              <Button label={`Tambah Jenis Layanan (${activeCount}/${serviceTypes.length} tersedia)`} variant="secondary" onPress={() => setForm({ mode: "add" })} />
            </View>
          ) : undefined
        }
      />

      <ServiceTypeFormSheet visible={form !== null} mode={form?.mode ?? "add"} initialName={form?.mode === "edit" ? form.type.name : ""} onClose={() => setForm(null)} onSubmit={submit} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: NotaryColors.background },
  list: { padding: 16, paddingBottom: 32 },
  header: { marginBottom: 14 },
  gap: { height: 12 },
  footer: { marginTop: 16 },
});
