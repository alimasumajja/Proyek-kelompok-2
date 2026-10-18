import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  TabList,
  Tabs,
  TabSlot,
  TabTrigger,
  TabTriggerSlotProps,
} from "expo-router/ui";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { openRepertorium } from "@/features/laporan/store";

const PRIMARY = "#1F4D3A";
const MUTED = "#9AA3AB";

type IconName = React.ComponentProps<typeof Ionicons>["name"];

function TabItem({
  icon,
  label,
  isFocused,
  ...props
}: TabTriggerSlotProps & { icon: IconName; label: string }) {
  return (
    <Pressable {...props} style={s.item}>
      <Ionicons name={icon} size={22} color={isFocused ? PRIMARY : MUTED} />
      <Text
        style={[
          s.label,
          {
            color: isFocused ? PRIMARY : MUTED,
            fontWeight: isFocused ? "700" : "500",
          },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export default function AppTabs() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs style={{ flex: 1 }}>
      <TabSlot style={{ flex: 1 }} />
      <TabList style={[s.bar, { paddingBottom: Math.max(insets.bottom, 8) }]}>
        <TabTrigger name="home" href="/" asChild>
          <TabItem icon="home-outline" label="Beranda" />
        </TabTrigger>

        <TabTrigger name="layanan" href="/explore" asChild>
          <TabItem icon="briefcase-outline" label="Layanan" />
        </TabTrigger>

        {/* Tombol tengah: aksi, bukan tab */}
        <View style={s.fabWrap}>
          <Pressable
            style={s.fab}
            onPress={() => {
              openRepertorium();
              router.navigate("/laporan");
            }}
          >
            <Ionicons name="add" size={28} color="#fff" />
          </Pressable>
        </View>

        <TabTrigger name="laporan" href="/laporan" asChild>
          <TabItem icon="bar-chart-outline" label="Laporan" />
        </TabTrigger>

        <TabTrigger name="profil" href="/profil" asChild>
          <TabItem icon="person-outline" label="Profil" />
        </TabTrigger>
      </TabList>
    </Tabs>
  );
}

const s = StyleSheet.create({
  bar: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-around",
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingTop: 8,
  },
  item: { flex: 1, alignItems: "center", gap: 3, paddingVertical: 4 },
  label: { fontSize: 10 },
  fabWrap: { flex: 1, alignItems: "center" },
  fab: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: PRIMARY,
    alignItems: "center",
    justifyContent: "center",
    marginTop: -26,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
});
