import type { ReactNode } from "react";
import {
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { colors } from "../colors";

type Props = {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
};

export default function BottomSheet({
  visible,
  onClose,
  title,
  children,
}: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={s.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={s.wrap}
        >
          <View style={s.sheet}>
            <View style={s.handle} />
            <View style={s.header}>
              <Text style={s.title}>{title}</Text>
              <Pressable onPress={onClose} hitSlop={8}>
                <Text style={s.close}>Tutup</Text>
              </Pressable>
            </View>
            <ScrollView
              keyboardShouldPersistTaps="handled"
              style={{ maxHeight: 560 }}
              contentContainerStyle={{ gap: 14, paddingBottom: 24 }}
            >
              {children}
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  wrap: { width: "100%", maxWidth: 520 },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  handle: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    marginTop: 10,
    marginBottom: 14,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  title: { fontSize: 17, fontWeight: "700", color: colors.text },
  close: { fontSize: 13, fontWeight: "600", color: colors.primary },
});
