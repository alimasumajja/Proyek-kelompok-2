import React, { useMemo } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { NotaryColors, Radius, Shadow } from '@/constants/notary-theme';
import type { KopLaporan, LebarMargin, UkuranFont } from '@/types/laporan';
import { KOLOM_DAFTAR_AKTA, type IsiDokumen } from '@/utils/laporan-template';

const SANS = Platform.select({ ios: 'Helvetica', default: 'sans-serif' });
const GARIS = '#444';

const SKALA_FONT: Record<UkuranFont, number> = { Kecil: 0.9, Sedang: 1, Besar: 1.15 };
const PADDING: Record<LebarMargin, number> = { Sempit: 10, Normal: 16, Lebar: 24 };

interface KertasLaporanProps {
  isi: IsiDokumen;
}

/**
 * Tampilan "kertas" laporan di layar: halaman 1 surat pengantar dan halaman berikutnya
 * Salinan Buku Daftar Akta. Dibuat dari `IsiDokumen` yang sama dengan PDF dan Word.
 */
export function KertasLaporan({ isi }: KertasLaporanProps) {
  const gaya = useMemo(() => buatGaya(SKALA_FONT[isi.ukuranFont], PADDING[isi.margin]), [isi.ukuranFont, isi.margin]);
  const { surat, daftar } = isi;

  const kop = (k: KopLaporan) => (
    <View>
      <Text style={gaya.kopNama}>{k.namaNotaris}</Text>
      <Text style={gaya.kopKecil}>{k.wilayah ? `${k.jabatan} – ${k.wilayah}` : k.jabatan}</Text>
      <Text style={gaya.kopKecil}>{k.alamat}</Text>
      {k.telepon ? <Text style={gaya.kopKecil}>{k.telepon}</Text> : null}
      <View style={gaya.garis} />
    </View>
  );

  const ttd = (
    <View style={gaya.ttd}>
      <Text style={gaya.teks}>{isi.lokasiTanggal}</Text>
      <Text style={gaya.teks}>{isi.jabatanTtd}</Text>
      <View style={gaya.ttdRuang} />
      <Text style={gaya.teks}>{isi.namaTtd}</Text>
    </View>
  );

  return (
    <View style={gaya.kumpulan}>
      {/* Halaman 1: surat pengantar */}
      <View
        style={gaya.kertas}
        accessible
        accessibilityLabel={`Halaman 1, surat pengantar laporan bulanan ${isi.periodeLabel}`}>
        <Text style={gaya.label}>Halaman 1 · Surat Pengantar</Text>
        {kop(isi.kop)}

        <View style={gaya.meta}>
          <View style={gaya.metaKiri}>
            {(
              [
                ['Nomor', surat.nomor],
                ['Lampiran', surat.lampiran],
                ['Perihal', surat.perihal],
              ] as const
            ).map(([k, v]) => (
              <View key={k} style={gaya.metaBaris}>
                <Text style={[gaya.teks, gaya.metaKunci]}>{k}</Text>
                <Text style={gaya.teks}>: </Text>
                <Text style={[gaya.teks, gaya.metaNilai]}>{v}</Text>
              </View>
            ))}
          </View>
          <View style={gaya.metaKanan}>
            <Text style={gaya.teks}>Kepada Yth.</Text>
            {surat.kepada.map((baris, i) => (
              <Text key={i} style={gaya.teks}>
                {baris}
              </Text>
            ))}
          </View>
        </View>

        <Text style={[gaya.teks, gaya.paragraf]}>{surat.salam}</Text>
        <Text style={[gaya.teks, gaya.paragraf]}>{surat.dasar}</Text>
        {surat.butir.map((butir, i) => (
          <View key={i} style={gaya.butir}>
            <Text style={[gaya.teks, gaya.butirNomor]}>{i + 1}.</Text>
            <Text style={[gaya.teks, gaya.butirIsi]}>{butir}</Text>
          </View>
        ))}
        <Text style={[gaya.teks, gaya.paragraf, gaya.penutup]}>{surat.penutup}</Text>
        {ttd}
      </View>

      {/* Halaman 2 dan seterusnya: Salinan Buku Daftar Akta */}
      <View
        style={gaya.kertas}
        accessible
        accessibilityLabel={`Salinan buku daftar akta, ${daftar.periode}, ${daftar.baris.length} akta`}>
        <Text style={gaya.label}>Halaman 2 · Salinan Buku Daftar Akta</Text>
        {kop(isi.kop)}
        <Text style={gaya.judul}>{daftar.judul}</Text>
        <Text style={gaya.judul}>{daftar.periode}</Text>

        <View style={gaya.tabel}>
          <View style={gaya.baris}>
            {KOLOM_DAFTAR_AKTA.map((k) => (
              <Text key={k.label} style={[gaya.sel, gaya.selKepala, { flex: k.lebar }]}>
                {k.label}
              </Text>
            ))}
          </View>
          {daftar.baris.length === 0 ? (
            <View style={gaya.baris}>
              <Text style={[gaya.sel, gaya.nihil, { flex: 1 }]}>N I H I L</Text>
            </View>
          ) : (
            daftar.baris.map((b, r) => (
              <View key={r} style={gaya.baris}>
                <Text style={[gaya.sel, gaya.tengah, { flex: KOLOM_DAFTAR_AKTA[0].lebar }]}>{b.urut}</Text>
                <Text style={[gaya.sel, gaya.tengah, { flex: KOLOM_DAFTAR_AKTA[1].lebar }]}>{b.bulanan}</Text>
                <Text style={[gaya.sel, gaya.tengah, { flex: KOLOM_DAFTAR_AKTA[2].lebar }]}>{b.tanggal}</Text>
                <Text style={[gaya.sel, gaya.tengah, { flex: KOLOM_DAFTAR_AKTA[3].lebar }]}>{b.sifat}</Text>
                <View style={[gaya.sel, { flex: KOLOM_DAFTAR_AKTA[4].lebar }]}>
                  {b.penghadap.map((p, i) => (
                    <Text key={i} style={[gaya.teksTabel, p.qq && gaya.qq]}>
                      {p.qq ? '' : '- '}
                      {p.teks}
                    </Text>
                  ))}
                </View>
              </View>
            ))
          )}
        </View>
        {ttd}
      </View>
    </View>
  );
}

function buatGaya(skala: number, pad: number) {
  const f = (n: number) => Math.round(n * skala * 10) / 10;
  return StyleSheet.create({
    kumpulan: { gap: 14 },
    kertas: {
      padding: pad,
      borderRadius: Radius.md,
      borderWidth: 1,
      borderColor: NotaryColors.border,
      backgroundColor: '#FFFFFF',
      ...Shadow.card,
    },
    label: { marginBottom: 6, fontSize: 9, color: NotaryColors.textMuted, fontFamily: SANS },
    kopNama: { fontSize: f(10.5), fontFamily: SANS, fontWeight: '700', color: '#111' },
    kopKecil: { fontSize: f(7.5), fontFamily: SANS, color: '#111' },
    garis: { height: 1.5, marginTop: 5, marginBottom: 8, backgroundColor: '#111' },
    meta: { flexDirection: 'row', gap: 8, marginBottom: 8 },
    metaKiri: { flex: 1.2, gap: 1 },
    metaKanan: { flex: 1 },
    metaBaris: { flexDirection: 'row' },
    metaKunci: { width: 44 },
    metaNilai: { flex: 1 },
    teks: { fontSize: f(8), fontFamily: SANS, color: '#111', lineHeight: f(11.5) },
    paragraf: { marginBottom: 5, textAlign: 'justify' },
    butir: { flexDirection: 'row', marginBottom: 3, paddingLeft: 6 },
    butirNomor: { width: 14 },
    butirIsi: { flex: 1, textAlign: 'justify' },
    penutup: { marginTop: 4 },
    judul: { textAlign: 'center', fontSize: f(8.5), fontFamily: SANS, fontWeight: '700', color: '#111' },
    tabel: { marginTop: 8, borderTopWidth: 1, borderLeftWidth: 1, borderColor: GARIS },
    baris: { flexDirection: 'row' },
    sel: {
      paddingHorizontal: 4,
      paddingVertical: 4,
      fontSize: f(7),
      fontFamily: SANS,
      color: '#111',
      borderRightWidth: 1,
      borderBottomWidth: 1,
      borderColor: GARIS,
      justifyContent: 'center',
    },
    selKepala: { fontWeight: '700', textAlign: 'center' },
    tengah: { textAlign: 'center' },
    nihil: { textAlign: 'center', fontWeight: '700', letterSpacing: 3 },
    teksTabel: { fontSize: f(7), fontFamily: SANS, color: '#111' },
    qq: { paddingLeft: 8 },
    ttd: { marginTop: 14, marginLeft: '48%' },
    ttdRuang: { height: 34 },
  });
}
