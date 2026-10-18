import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "../colors";

type Props = {
  periode: string;
  terakhirDiperbarui: string;
  onPressKalender?: () => void;
};

export default function PeriodeCard({
  periode,
  terakhirDiperbarui,
  onPressKalender,
}: Props) {
  return (
    <View style={s.card}>
      <View style={{ flex: 1 }}>
        <Text style={s.label}>PERIODE LAPORAN</Text>
        <Text style={s.periode}>{periode}</Text>
        <Text style={s.updated}>Terakhir diperbarui: {terakhirDiperbarui}</Text>
      </View>
      <Pressable style={s.iconBox} onPress={onPressKalender} hitSlop={8}>
        <Ionicons name="calendar-outline" size={20} color="#fff" />
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    padding: 20,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  label: {
    color: colors.accent,
    fontSize: 11,
    letterSpacing: 1.2,
    fontWeight: "600",
  },
  periode: { color: "#fff", fontSize: 30, fontWeight: "700", marginTop: 6 },
  updated: { color: "rgba(255,255,255,0.7)", fontSize: 11, marginTop: 12 },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
});
