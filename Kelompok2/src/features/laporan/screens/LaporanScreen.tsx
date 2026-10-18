import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors } from "../colors";
import LaporanBulananHeader from "../components/LaporanBulananHeader";
import PeriodeCard from "../components/PeriodeCard";
import PeriodeSheet from "../components/PeriodeSheet";
import RepertoriumCard from "../components/RepertoriumCard";
import StatsRow from "../components/StatsRow";
import ValidasiItem from "../components/ValidasiItem";
import ValidasiKategoriSheet from "../components/ValidasiKategoriSheet";
import { useLaporan } from "../hooks/useLaporan";
import { closeRepertorium, openRepertorium, useLaporanStore } from "../store";
import RepertoriumScreen from "./RepertoriumScreen";

export default function LaporanScreen() {
  const { data } = useLaporan();
  const { repertoriumOpen } = useLaporanStore();
  const [periodeOpen, setPeriodeOpen] = useState(false);
  const [validasiOpen, setValidasiOpen] = useState(false);

  return (
    <SafeAreaView style={s.safe} edges={["top"]}>
      <View style={s.header}>
        <View style={s.logo}>
          <Text style={s.logoText}>N</Text>
        </View>
        <Text style={s.headerTitle}>Laporan</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
      >
        <PeriodeCard
          periode={data.periode}
          terakhirDiperbarui={data.terakhirDiperbarui}
          onPressKalender={() => setPeriodeOpen(true)}
        />
        <LaporanBulananHeader progress={data.progress} />
        <StatsRow {...data.stats} />

        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>Validasi Data</Text>
          <Pressable onPress={() => setValidasiOpen(true)}>
            <Text style={s.link}>Periksa Semua</Text>
          </Pressable>
        </View>

        <View>
          {data.validasi.map((v) => (
            <ValidasiItem
              key={v.id}
              {...v}
              onPress={() => setValidasiOpen(true)}
            />
          ))}
        </View>

        <Pressable style={s.button} onPress={() => setValidasiOpen(true)}>
          <Ionicons name="eye-outline" size={18} color="#fff" />
          <Text style={s.buttonText}>Selesaikan Validasi</Text>
        </Pressable>

        <RepertoriumCard onPress={openRepertorium} />
      </ScrollView>

      <PeriodeSheet
        visible={periodeOpen}
        onClose={() => setPeriodeOpen(false)}
      />
      <ValidasiKategoriSheet
        visible={validasiOpen}
        onClose={() => setValidasiOpen(false)}
      />

      <Modal
        visible={repertoriumOpen}
        animationType="slide"
        onRequestClose={closeRepertorium}
      >
        <RepertoriumScreen />
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  logo: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: { color: colors.accent, fontWeight: "800" },
  headerTitle: { fontSize: 16, fontWeight: "600", color: colors.text },
  content: { padding: 16, gap: 16, paddingBottom: 24 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: colors.text },
  link: { fontSize: 12, fontWeight: "600", color: colors.primary },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 14,
    alignSelf: "center",
  },
  buttonText: { color: "#fff", fontWeight: "600" },
});
