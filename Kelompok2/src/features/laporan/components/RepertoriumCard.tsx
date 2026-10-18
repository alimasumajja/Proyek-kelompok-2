import { Pressable, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../colors';

type Props = { onPress?: () => void };

export default function RepertoriumCard({ onPress }: Props) {
  return (
    <Pressable style={s.card} onPress={onPress}>
      <View style={s.iconBox}>
        <Ionicons name="document-text-outline" size={20} color={colors.primary} />
      </View>
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={s.title}>Repertorium</Text>
        <Text style={s.desc}>Daftar semua akta yang tercatat</Text>
      </View>
      <View style={s.tag}>
        <Text style={s.tagText}>Siap</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.muted} style={{ marginLeft: 8 }} />
    </Pressable>
  );
}

const s = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 14,
    backgroundColor: colors.card,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: colors.successBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 14, fontWeight: '600', color: colors.text },
  desc: { fontSize: 11, color: colors.muted, marginTop: 2 },
  tag: {
    backgroundColor: colors.warningBg,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  tagText: { fontSize: 11, fontWeight: '600', color: colors.warning },
});