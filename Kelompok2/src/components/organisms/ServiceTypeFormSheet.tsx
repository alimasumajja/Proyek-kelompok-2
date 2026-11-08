import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import type { ActionResult } from "@/types/service";
import { SERVICE_TYPE_MAX_LENGTH } from "@/utils/service-types";
import { Button, Input } from "../atoms";
import { BottomSheet, FormField } from "../molecules";

interface ServiceTypeFormSheetProps {
  visible: boolean;
  mode: "add" | "edit";
  initialName?: string;
  onClose: () => void;
  /** Mengembalikan hasil validasi dari store; bila ok, pemanggil menutup sheet. */
  onSubmit: (name: string) => Promise<ActionResult>;
}

/** Formulir tambah / ubah nama jenis layanan. */
export function ServiceTypeFormSheet({ visible, mode, initialName = "", onClose, onSubmit }: ServiceTypeFormSheetProps) {
  return (
    <BottomSheet visible={visible} onClose={onClose} title={mode === "add" ? "Tambah Jenis Layanan" : "Ubah Jenis Layanan"}>
      {visible ? <Form key={`${mode}-${initialName}`} mode={mode} initialName={initialName} onSubmit={onSubmit} /> : null}
    </BottomSheet>
  );
}

function Form({ mode, initialName, onSubmit }: Pick<ServiceTypeFormSheetProps, "mode" | "onSubmit"> & { initialName: string }) {
  const [name, setName] = useState(initialName);
  const [error, setError] = useState<string | undefined>();
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (submitting) return;

    setError(undefined);
    setSubmitting(true);

    try {
      const result = await onSubmit(name);

      if (!result.ok) {
        setError(result.error);
      }
    } catch {
      setError("Terjadi kesalahan. Silakan coba kembali.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.form}>
      <FormField label="Nama jenis layanan" required error={error}>
        <Input
          value={name}
          onChangeText={(text) => {
            setName(text);
            setError(undefined);
          }}
          placeholder="Contoh: Akta Fidusia"
          maxLength={SERVICE_TYPE_MAX_LENGTH}
          autoCapitalize="words"
          autoFocus
          returnKeyType="done"
          onSubmitEditing={submit}
          invalid={!!error}
          accessibilityLabel="Nama jenis layanan"
        />
      </FormField>

      <Button label={submitting ? "Menyimpan..." : mode === "add" ? "Simpan Jenis Layanan" : "Simpan Perubahan"} onPress={submit} disabled={submitting} />
    </View>
  );
}

const styles = StyleSheet.create({
  form: { gap: 16 },
});
