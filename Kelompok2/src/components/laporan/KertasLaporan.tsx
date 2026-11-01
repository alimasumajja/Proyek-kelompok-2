import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { NotaryColors, Radius, Shadow } from '@/constants/notary-theme';
import type { IsiDokumen } from '@/utils/laporan-template';

const SERIF = Platform.select({ ios: 'Georgia', default: 'serif' });
const GARIS = '#B9C2BD';

interface KertasLaporanProps {
  isi: IsiDokumen;
}

/** Tampilan "kertas" laporan di layar, dibuat dari `IsiDokumen` yang sama dengan PDF dan Word. */
export function KertasLaporan({ isi }: KertasLaporanProps) {
  return (
    <View
      style={styles.kertas}
      accessible
      accessibilityLabel={`Pratinjau ${isi.judul}, periode ${isi.periodeLabel}, ${isi.baris.length} akta`}>
      <View style={styles.kop}>
        <View style={styles.logo}>
          <Text style={styles.logoHuruf}>N</Text>
        </View>
        <View style={styles.kopTeks}>
          <Text style={styles.kantor}>{isi.kop.namaKantor}</Text>
          <Text style={styles.kopKecil}>{isi.kop.alamat}</Text>
          <Text style={styles.kopKecil}>{isi.kop.namaNotaris}</Text>
        </View>
      </View>
      <View style={styles.garis} />

      <Text style={styles.judul}>{isi.judul}</Text>
      <Text style={styles.periode}>Periode {isi.periodeLabel}</Text>

      <View style={styles.tabel}>
        <View style={[styles.baris, styles.kepala]}>
          {isi.kolom.map((k) => (
            <Text
              key={k.label}
              style={[styles.sel, styles.selKepala, { flex: k.lebar }, k.rata && styles.tengah]}>
              {k.label}
            </Text>
          ))}
        </View>
        {isi.baris.length === 0 ? (
          <View style={styles.baris}>
            <Text style={[styles.sel, styles.tengah, { flex: 1 }]}>Tidak ada akta pada periode ini.</Text>
          </View>
        ) : (
          isi.baris.map((sel, r) => (
            <View key={r} style={styles.baris}>
              {sel.map((teks, c) => (
                <Text
                  key={c}
                  numberOfLines={2}
                  style={[styles.sel, { flex: isi.kolom[c]?.lebar ?? 1 }, isi.kolom[c]?.rata && styles.tengah]}>
                  {teks}
                </Text>
              ))}
            </View>
          ))
        )}
      </View>

      <View style={styles.ttd}>
        <Text style={styles.ttdTeks}>{isi.lokasiTanggal}</Text>
        <View style={styles.ttdRuang} />
        <Text style={styles.ttdNama}>{isi.penandatangan}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  kertas: {
    padding: 16,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: NotaryColors.border,
    backgroundColor: '#FFFFFF',
    ...Shadow.card,
  },
  kop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logo: {
    width: 30,
    height: 30,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: NotaryColors.primary,
  },
  logoHuruf: { color: NotaryColors.gold, fontSize: 15, fontFamily: SERIF, fontWeight: '700' },
  kopTeks: { flex: 1 },
  kantor: { fontSize: 10, fontFamily: SERIF, fontWeight: '700', letterSpacing: 0.6, color: '#111' },
  kopKecil: { fontSize: 8, fontFamily: SERIF, color: '#555' },
  garis: { height: 2, marginVertical: 8, backgroundColor: NotaryColors.primary },
  judul: { marginTop: 8, textAlign: 'center', fontSize: 12, fontFamily: SERIF, fontWeight: '700', color: '#111' },
  periode: { marginTop: 2, marginBottom: 10, textAlign: 'center', fontSize: 9, fontFamily: SERIF, color: '#333' },
  tabel: { borderTopWidth: 1, borderLeftWidth: 1, borderColor: GARIS },
  baris: { flexDirection: 'row' },
  kepala: { backgroundColor: '#EEF3EF' },
  sel: {
    paddingHorizontal: 5,
    paddingVertical: 4,
    fontSize: 8.5,
    fontFamily: SERIF,
    color: '#111',
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: GARIS,
  },
  selKepala: { fontWeight: '700' },
  tengah: { textAlign: 'center' },
  ttd: { marginTop: 18, alignItems: 'flex-end' },
  ttdTeks: { fontSize: 8.5, fontFamily: SERIF, color: '#111' },
  ttdRuang: { height: 36 },
  ttdNama: {
    fontSize: 8.5,
    fontFamily: SERIF,
    fontWeight: '700',
    textDecorationLine: 'underline',
    color: '#111',
  },
});