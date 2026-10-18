import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { JENIS_AKTA, addAkta, nextNomorUrut, updateAkta } from "../store";
import type { Akta, AktaStatus } from "../types";
import BottomSheet from "./BottomSheet";
import Field from "./Field";
import InfoBox from "./InfoBox";
import PrimaryButton from "./PrimaryButton";
import SelectField from "./SelectField";

type Form = Omit<Akta, "id">;
type Props = { visible: boolean; akta: Akta | null; onClose: () => void };

const OPSI_JENIS = JENIS_AKTA.map((j) => ({ label: j, value: j }));
const OPSI_SIFAT = ["Minuta", "Salinan", "Kutipan"].map((j) => ({
  label: j,
  value: j,
}));
const OPSI_STATUS = [
  { label: "Terbit", value: "terbit" },
  { label: "Draf", value: "draf" },
];

const kosong = (): Form => ({
  nomorUrut: nextNomorUrut(),
  nomorAkta: "",
  tanggal: "",
  jenis: JENIS_AKTA[0],
  pihak: "",
  sifat: "Minuta",
  status: "draf",
  catatan: "",
});

export default function KoreksiSheet({ visible, akta, onClose }: Props) {
  const [form, setForm] = useState<Form>(kosong());
  const [error, setError] = useState("");

  useEffect(() => {
    if (!visible) return;
    setError("");
    if (akta) {
      const { id, ...rest } = akta;
      setForm(rest);
    } else {
      setForm(kosong());
    }
  }, [visible, akta]);

  const set = <K extends keyof Form>(key: K, value: Form[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const simpan = () => {
    if (!form.nomorAkta.trim() || !form.pihak.trim()) {
      setError("Nomor akta dan nama pihak terkait wajib diisi.");
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(form.tanggal)) {
      setError("Tanggal harus berformat TTTT-BB-HH, contoh 2026-03-12.");
      return;
    }
    if (akta) updateAkta(akta.id, form);
    else addAkta(form);
    onClose();
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title={akta ? "Koreksi Akta" : "Tambah Akta"}
    >
      <View style={s.row}>
        <View style={{ flex: 1 }}>
          <Field
            label="Nomor urut"
            value={form.nomorUrut}
            onChangeText={(v) => set("nomorUrut", v)}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Field
            label="Nomor akta"
            placeholder="12/2026"
            value={form.nomorAkta}
            onChangeText={(v) => set("nomorAkta", v)}
          />
        </View>
      </View>

      <Field
        label="Tanggal akta"
        placeholder="TTTT-BB-HH, mis. 2026-03-12"
        value={form.tanggal}
        onChangeText={(v) => set("tanggal", v)}
      />

      <SelectField
        label="Jenis akta"
        value={form.jenis}
        options={OPSI_JENIS}
        onChange={(v) => set("jenis", v)}
      />

      <Field
        label="Nama pihak terkait"
        value={form.pihak}
        onChangeText={(v) => set("pihak", v)}
      />

      <View style={s.row}>
        <View style={{ flex: 1 }}>
          <SelectField
            label="Sifat akta"
            value={form.sifat}
            options={OPSI_SIFAT}
            onChange={(v) => set("sifat", v)}
          />
        </View>
        <View style={{ flex: 1 }}>
          <SelectField
            label="Status"
            value={form.status}
            options={OPSI_STATUS}
            onChange={(v) => set("status", v as AktaStatus)}
          />
        </View>
      </View>

      <Field
        label="Catatan"
        multiline
        value={form.catatan}
        onChangeText={(v) => set("catatan", v)}
      />

      {error !== "" && <Text style={s.error}>{error}</Text>}

      {akta && (
        <InfoBox tone="warning">
          Koreksi tidak menghapus catatan sebelumnya dan akan ditandai dalam
          riwayat.
        </InfoBox>
      )}

      <PrimaryButton
        label={akta ? "Simpan Koreksi" : "Simpan Akta"}
        onPress={simpan}
      />
    </BottomSheet>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", gap: 12 },
  error: { fontSize: 12, color: "#C62828" },
});
