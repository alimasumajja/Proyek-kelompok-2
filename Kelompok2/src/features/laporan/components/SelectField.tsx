import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "../colors";

type Option = { label: string; value: string };
type Props = {
  label: string;
  value: string;
  options: Option[];
  onChange: (value: string) => void;
};

export default function SelectField({
  label,
  value,
  options,
  onChange,
}: Props) {
  const [open, setOpen] = useState(false);
  const current = options.find((o) => o.value === value);

  return (
    <View style={{ gap: 6 }}>
      <Text style={s.label}>{label}</Text>
      <Pressable style={s.box} onPress={() => setOpen((o) => !o)}>
        <Text style={s.value}>{current?.label ?? "Pilih"}</Text>
        <Ionicons
          name={open ? "chevron-up" : "chevron-down"}
          size={16}
          color={colors.muted}
        />
      </Pressable>
      {open && (
        <View style={s.list}>
          {options.map((o) => (
            <Pressable
              key={o.value}
              style={[s.option, o.value === value && s.optionActive]}
              onPress={() => {
                onChange(o.value);
                setOpen(false);
              }}
            >
              <Text
                style={[
                  s.optionText,
                  o.value === value && {
                    color: colors.primary,
                    fontWeight: "700",
                  },
                ]}
              >
                {o.label}
              </Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  label: { fontSize: 12, fontWeight: "600", color: colors.text },
  box: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    backgroundColor: "#fff",
  },
  value: { fontSize: 14, color: colors.text },
  list: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    overflow: "hidden",
    maxHeight: 200,
  },
  option: {
    paddingHorizontal: 12,
    paddingVertical: 11,
    backgroundColor: "#fff",
  },
  optionActive: { backgroundColor: colors.successBg },
  optionText: { fontSize: 14, color: colors.text },
});
