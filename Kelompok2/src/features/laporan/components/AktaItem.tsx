import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "../colors";
import { formatTanggal } from "../store";
import type { Akta } from "../types";

type Props = { akta: Akta; onPress: () => void };

export default function AktaItem({ akta, onPress }: Props) {
  const terbit = akta.status === "terbit";
  return (
    <Pressable style={s.card} onPress={onPress}>
      <View style={s.thumb}>
        <Ionicons name="document-text-outline" size={20} color={colors.muted} />
      </View>
      <View style={{ flex: 1 }}>
        <View style={s.top}>
          <Text style={s.title}>Akta No. {akta.nomorAkta}</Text>
          <View
            style={[
              s.tag,
              { backgroundColor: terbit ? colors.successBg : colors.warningBg },
            ]}
          >
            <Text
              style={[
                s.tagText,
                { color: terbit ? colors.success : colors.warning },
              ]}
            >
              {terbit ? "Terbit" : "Draf"}
            </Text>
          </View>
        </View>
        <Text style={s.jenis}>{akta.jenis}</Text>
        <Text style={s.pihak} numberOfLines={1}>
          {akta.pihak}
        </Text>
        <View style={s.date}>
          <Ionicons name="calendar-outline" size={12} color={colors.muted} />
          <Text style={s.dateText}>{formatTanggal(akta.tanggal)}</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.text} />
    </Pressable>
  );
}

const s = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 14,
    backgroundColor: "#fff",
  },
  thumb: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: "#F1F3F2",
    alignItems: "center",
    justifyContent: "center",
  },
  top: { flexDirection: "row", alignItems: "center", gap: 8 },
  title: { fontSize: 14, fontWeight: "700", color: colors.text },
  tag: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 },
  tagText: { fontSize: 10, fontWeight: "600" },
  jenis: { fontSize: 12, color: colors.text, marginTop: 2 },
  pihak: { fontSize: 11, color: colors.muted, marginTop: 1 },
  date: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 },
  dateText: { fontSize: 11, color: colors.muted },
});
