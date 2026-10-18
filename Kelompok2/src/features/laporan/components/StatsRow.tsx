import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../colors';

type Props = { jumlahAkta: number; selesai: number; perluTinjau: number };

export default function StatsRow({ jumlahAkta, selesai, perluTinjau }: Props) {
  const items = [
    { value: jumlahAkta, label: 'Jumlah Akta' },
    { value: selesai, label: 'Akta Selesai' },
    { value: perluTinjau, label: 'Perlu Tinjau' },
  ];

  return (
    <View style={s.row}>
      {items.map((it, i) => (
        <View key={it.label} style={[s.cell, i > 0 && s.divider]}>
          <Text style={s.value}>{it.value}</Text>
          <Text style={s.label}>{it.label}</Text>
        </View>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  row: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    paddingVertical: 14,
    backgroundColor: colors.card,
  },
  cell: { flex: 1, alignItems: 'center' },
  divider: { borderLeftWidth: 1, borderLeftColor: colors.border },
  value: { fontSize: 22, fontWeight: '700', color: colors.text },
  label: { fontSize: 11, color: colors.muted, marginTop: 2 },
});