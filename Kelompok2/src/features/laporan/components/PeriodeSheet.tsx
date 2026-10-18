import { useEffect, useState } from "react";
import { View } from "react-native";
import { BULAN, setPeriode, useLaporanStore } from "../store";
import BottomSheet from "./BottomSheet";
import InfoBox from "./InfoBox";
import PrimaryButton from "./PrimaryButton";
import SelectField from "./SelectField";

const OPSI_BULAN = BULAN.map((b, i) => ({ label: b, value: String(i) }));
const OPSI_TAHUN = ["2024", "2025", "2026", "2027", "2028"].map((t) => ({
  label: t,
  value: t,
}));

type Props = { visible: boolean; onClose: () => void };

export default function PeriodeSheet({ visible, onClose }: Props) {
  const store = useLaporanStore();
  const [bulan, setBulan] = useState(String(store.bulan));
  const [tahun, setTahun] = useState(String(store.tahun));

  useEffect(() => {
    if (visible) {
      setBulan(String(store.bulan));
      setTahun(String(store.tahun));
    }
  }, [visible, store.bulan, store.tahun]);

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title="Pilih Periode Laporan"
    >
      <View style={{ flexDirection: "row", gap: 12 }}>
        <View style={{ flex: 1 }}>
          <SelectField
            label="Bulan"
            value={bulan}
            options={OPSI_BULAN}
            onChange={setBulan}
          />
        </View>
        <View style={{ flex: 1 }}>
          <SelectField
            label="Tahun"
            value={tahun}
            options={OPSI_TAHUN}
            onChange={setTahun}
          />
        </View>
      </View>
      <InfoBox>
        Periode hanya mengubah simulasi tampilan. Data di luar periode akan
        ditandai, bukan dipindahkan otomatis.
      </InfoBox>
      <PrimaryButton
        label="Terapkan Periode"
        onPress={() => {
          setPeriode(Number(bulan), Number(tahun));
          onClose();
        }}
      />
    </BottomSheet>
  );
}
