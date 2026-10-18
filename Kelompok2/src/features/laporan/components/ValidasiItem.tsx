import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "../colors";
import type { ValidasiData } from "../types";

type Props = ValidasiData & { onPress?: () => void };

export default function ValidasiItem({
  judul,
  deskripsi,
  status,
  onPress,
}: Props) {
  const ok = status === "lengkap";

  return (
    <Pressable style={s.row} onPress={onPress}>
      <Ionicons
        name={ok ? "checkmark-circle-outline" : "warning-outline"}
        size={22}
        color={ok ? colors.success : colors.warning}
      />
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={s.title}>{judul}</Text>
        <Text style={s.desc}>{deskripsi}</Text>
      </View>
      <View
        style={[
          s.tag,
          { backgroundColor: ok ? colors.successBg : colors.warningBg },
        ]}
      >
        <Text
          style={[s.tagText, { color: ok ? colors.success : colors.warning }]}
        >
          {ok ? "Lengkap" : "Tinjau"}
        </Text>
      </View>
    </Pressable>
  );
}

const s = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: { fontSize: 14, fontWeight: "600", color: colors.text },
  desc: { fontSize: 11, color: colors.muted, marginTop: 2 },
  tag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  tagText: { fontSize: 11, fontWeight: "600" },
});
