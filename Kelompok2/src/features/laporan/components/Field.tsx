import {
    StyleSheet,
    Text,
    TextInput,
    View,
    type TextInputProps,
} from "react-native";
import { colors } from "../colors";

type Props = TextInputProps & { label: string };

export default function Field({ label, style, ...rest }: Props) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={s.label}>{label}</Text>
      <TextInput
        placeholderTextColor={colors.muted}
        style={[s.input, rest.multiline && s.multi, style]}
        {...rest}
      />
    </View>
  );
}

const s = StyleSheet.create({
  label: { fontSize: 12, fontWeight: "600", color: colors.text },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    fontSize: 14,
    color: colors.text,
    backgroundColor: "#fff",
  },
  multi: { height: 84, paddingTop: 10, textAlignVertical: "top" },
});
