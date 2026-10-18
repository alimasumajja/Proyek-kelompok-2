import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../colors';

type Props = { progress: number };

export default function LaporanBulananHeader({ progress }: Props) {
  return (
    <View>
      <View style={s.badge}>
        <Text style={s.badgeText}>Validasi Diperlukan</Text>
      </View>
      <View style={s.row}>
        <View style={{ flex: 1, paddingRight: 12 }}>
          <Text style={s.title}>Laporan Bulanan</Text>
          <Text style={s.desc}>
            Data diambil dari aktivitas akta yang tercatat di sistem.
          </Text>
        </View>
        <View style={s.ring}>
          <Text style={s.ringValue}>{progress}</Text>
          <Text style={s.ringUnit}>%</Text>
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.warningBg,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    marginBottom: 8,
  },
  badgeText: { color: colors.warning, fontSize: 11, fontWeight: '600' },
  row: { flexDirection: 'row', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: '700', color: colors.text },
  desc: { fontSize: 12, color: colors.muted, marginTop: 4 },
  ring: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 5,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringValue: { fontSize: 18, fontWeight: '700', color: colors.text },
  ringUnit: { fontSize: 10, color: colors.muted, marginTop: -2 },
});
