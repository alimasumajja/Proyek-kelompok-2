import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "../colors";
import { useLaporan } from "../hooks/useLaporan";
import { KATEGORI_VALIDASI, confirmKosong, useLaporanStore } from "../store";
import BottomSheet from "./BottomSheet";
import InfoBox from "./InfoBox";
import PrimaryButton from "./PrimaryButton";

type Props = { visible: boolean; onClose: () => void };

export default function ValidasiKategoriSheet({ visible, onClose }: Props) {
  const { kategoriKosong } = useLaporanStore();
  const { luarPeriode } = useLaporan();
  const [dicentang, setDicentang] = useState<string[]>([]);

  const belum = KATEGORI_VALIDASI.filter((k) => !kategoriKosong.includes(k));

  useEffect(() => {
    if (visible) setDicentang([]);
  }, [visible]);

  const toggle = (k: string) =>
    setDicentang((d) => (d.includes(k) ? d.filter((x) => x !== k) : [...d, k]));

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title="Validasi Kategori Laporan"
    >
      <Text style={s.intro}>
        Periksa kategori tanpa data. Sistem tidak akan menyimpan nilai tanpa
        konfirmasi Anda.
      </Text>

      {belum.length === 0 ? (
        <InfoBox>Semua kategori sudah dikonfirmasi.</InfoBox>
      ) : (
        belum.map((k) => {
          const on = dicentang.includes(k);
          return (
            <Pressable key={k} style={s.check} onPress={() => toggle(k)}>
              <View style={[s.box, on && s.boxOn]}>
                {on && <Ionicons name="checkmark" size={14} color="#fff" />}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.checkTitle}>{k} tidak memiliki data</Text>
                <Text style={s.checkDesc}>
                  Konfirmasi sebagai nilai nol untuk periode bulan ini.
                </Text>
              </View>
            </Pressable>
          );
        })
      )}

      {luarPeriode > 0 && (
        <InfoBox tone="warning">
          {`${luarPeriode} data di luar periode. Data tersebut tidak dihitung pada periode ini dan perlu dipastikan manual.`}
        </InfoBox>
      )}

      <PrimaryButton
        label="Simpan Konfirmasi"
        disabled={dicentang.length === 0}
        onPress={() => {
          confirmKosong(dicentang);
          onClose();
        }}
      />
    </BottomSheet>
  );
}

const s = StyleSheet.create({
  intro: { fontSize: 12, color: colors.muted, lineHeight: 17 },
  check: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 12,
  },
  box: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: colors.muted,
    alignItems: "center",
    justifyContent: "center",
  },
  boxOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  checkTitle: { fontSize: 13, fontWeight: "600", color: colors.text },
  checkDesc: { fontSize: 11, color: colors.muted, marginTop: 2 },
});
