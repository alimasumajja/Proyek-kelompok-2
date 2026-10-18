import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors } from "../colors";
import AktaItem from "../components/AktaItem";
import KoreksiSheet from "../components/KoreksiSheet";
import PeriodeSheet from "../components/PeriodeSheet";
import {
  BULAN,
  closeRepertorium,
  isInPeriode,
  useLaporanStore,
} from "../store";
import type { Akta } from "../types";

export default function RepertoriumScreen() {
  const { akta, bulan, tahun } = useLaporanStore();
  const [cari, setCari] = useState("");
  const [periodeOpen, setPeriodeOpen] = useState(false);
  const [koreksiOpen, setKoreksiOpen] = useState(false);
  const [dipilih, setDipilih] = useState<Akta | null>(null);

  const q = cari.trim().toLowerCase();
  const daftar = akta
    .filter((a) => isInPeriode(a.tanggal, bulan, tahun))
    .filter(
      (a) =>
        !q ||
        [a.nomorAkta, a.pihak, a.jenis].some((t) =>
          t.toLowerCase().includes(q),
        ),
    );

  const buka = (a: Akta | null) => {
    setDipilih(a);
    setKoreksiOpen(true);
  };

  return (
    <SafeAreaView style={s.safe} edges={["top"]}>
      <View style={s.header}>
        <Pressable onPress={closeRepertorium} hitSlop={10}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={s.title}>Repertorium</Text>
        <Pressable onPress={() => buka(null)} hitSlop={10}>
          <Ionicons name="add" size={26} color={colors.text} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={s.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={s.search}>
          <Ionicons name="search-outline" size={18} color={colors.muted} />
          <TextInput
            style={s.searchInput}
            placeholder="Cari nomor akta atau pihak terkait"
            placeholderTextColor={colors.muted}
            value={cari}
            onChangeText={setCari}
          />
        </View>

        <View style={s.meta}>
          <Text style={s.metaText}>
            {daftar.length} akta · {BULAN[bulan]} {tahun}
          </Text>
          <Pressable style={s.periodeBtn} onPress={() => setPeriodeOpen(true)}>
            <Ionicons
              name="calendar-outline"
              size={14}
              color={colors.primary}
            />
            <Text style={s.periodeText}>Periode</Text>
          </Pressable>
        </View>

        {daftar.length === 0 ? (
          <Text style={s.empty}>Tidak ada akta pada periode ini.</Text>
        ) : (
          daftar.map((a) => (
            <AktaItem key={a.id} akta={a} onPress={() => buka(a)} />
          ))
        )}

        <View style={s.note}>
          <Ionicons
            name="document-text-outline"
            size={16}
            color={colors.success}
          />
          <Text style={s.noteText}>
            Repertorium menampilkan data berstruktur, bukan dokumen atau
            lampiran. Nomor akta tidak dibuat otomatis.
          </Text>
        </View>
      </ScrollView>

      <PeriodeSheet
        visible={periodeOpen}
        onClose={() => setPeriodeOpen(false)}
      />
      <KoreksiSheet
        visible={koreksiOpen}
        akta={dipilih}
        onClose={() => setKoreksiOpen(false)}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: { fontSize: 17, fontWeight: "700", color: colors.text },
  content: { padding: 16, gap: 12, paddingBottom: 24 },
  search: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchInput: { flex: 1, fontSize: 13, color: colors.text },
  meta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  metaText: { fontSize: 12, color: colors.muted },
  periodeBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  periodeText: { fontSize: 12, fontWeight: "600", color: colors.primary },
  empty: {
    textAlign: "center",
    color: colors.muted,
    paddingVertical: 24,
    fontSize: 13,
  },
  note: {
    flexDirection: "row",
    gap: 10,
    padding: 12,
    borderRadius: 12,
    backgroundColor: colors.successBg,
    alignItems: "flex-start",
  },
  noteText: { flex: 1, fontSize: 11, lineHeight: 16, color: colors.muted },
});
