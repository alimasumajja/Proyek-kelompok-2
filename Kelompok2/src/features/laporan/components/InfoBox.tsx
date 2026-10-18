import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { colors } from "../colors";

type Props = { tone?: "info" | "warning"; children: string };

export default function InfoBox({ tone = "info", children }: Props) {
  const warn = tone === "warning";
  return (
    <View
      style={[s.box, { backgroundColor: warn ? colors.warningBg : "#EEF3EF" }]}
    >
      <Ionicons
        name="warning-outline"
        size={16}
        color={warn ? colors.warning : colors.muted}
      />
      <Text style={s.text}>{children}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  box: {
    flexDirection: "row",
    gap: 10,
    padding: 12,
    borderRadius: 12,
    alignItems: "flex-start",
  },
  text: { flex: 1, fontSize: 11, lineHeight: 16, color: colors.muted },
});
