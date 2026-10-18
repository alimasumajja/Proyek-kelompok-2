import { Pressable, StyleSheet, Text } from "react-native";
import { colors } from "../colors";

type Props = { label: string; onPress: () => void; disabled?: boolean };

export default function PrimaryButton({ label, onPress, disabled }: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[s.btn, disabled && { opacity: 0.4 }]}
    >
      <Text style={s.text}>{label}</Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  btn: {
    backgroundColor: colors.primary,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  text: { color: "#fff", fontWeight: "600", fontSize: 14 },
});
