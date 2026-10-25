import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NotaryColors, Radius } from '@/constants/notary-theme';
import {
  BULAN,
  JENIS_AKTA,
  KATEGORI_VALIDASI,
  SIFAT_AKTA,
  STATUS_AKTA,
  TAHUN_OPSI,
  addAkta,
  confirmKategoriKosong,
  isInPeriode,
  nextNomorUrut,
  setPeriode,
  todayInput,
  updateAkta,
  useLaporan,
  useLaporanStore,
} from '@/context/laporan-store';
import { useToast } from '@/context/toast';
import type { Akta, AktaInput, SifatAkta, StatusAkta } from '@/types/laporan';
import { parseInputDate } from '@/utils/date';
import { AppText, Button, Input } from '../atoms';
import { BottomSheet, DateField, FormField, InfoNote, SelectField } from '../molecules';

/** Tiga bottom sheet fitur Laporan: pilih periode, validasi kategori, dan tambah/koreksi akta. */

// ───────────────────────── Pilih periode ─────────────────────────

type Bulan = (typeof BULAN)[number];
type Tahun = (typeof TAHUN_OPSI)[number];

interface PeriodeSheetProps {
  visible: boolean;
  onClose: () => void;
}

/** Memilih bulan dan tahun laporan yang ditampilkan. */
export function PeriodeSheet({ visible, onClose }: PeriodeSheetProps) {
  return (
    <BottomSheet visible={visible} onClose={onClose} title="Pilih Periode Laporan">
      {/* Form hanya ter-mount saat sheet terbuka, sehingga pilihan selalu mulai dari periode aktif. */}
      <PeriodeForm onClose={onClose} />
    </BottomSheet>
  );
}

function PeriodeForm({ onClose }: { onClose: () => void }) {
  const { bulan: bulanAktif, tahun: tahunAktif } = useLaporanStore();
  const { showToast } = useToast();
  const [bulan, setBulan] = useState<Bulan>(BULAN[bulanAktif] ?? BULAN[0]);
  const [tahun, setTahun] = useState<Tahun>(
    TAHUN_OPSI.find((t) => t === String(tahunAktif)) ?? TAHUN_OPSI[2]
  );

  const apply = () => {
    setPeriode(BULAN.indexOf(bulan), Number(tahun));
    showToast(`Periode diubah ke ${bulan} ${tahun}`);
    onClose();
  };

  return (
    <View style={periodeStyles.form}>
      <View style={periodeStyles.row}>
        <View style={periodeStyles.col}>
          <SelectField label="Bulan" value={bulan} options={BULAN} onChange={setBulan} />
        </View>
        <View style={periodeStyles.col}>
          <SelectField label="Tahun" value={tahun} options={TAHUN_OPSI} onChange={setTahun} />
        </View>
      </View>
      <InfoNote
        tone="neutral"
        text="Periode hanya mengubah tampilan laporan. Data di luar periode akan ditandai, bukan dipindahkan otomatis."
      />
      <Button label="Terapkan Periode" onPress={apply} />
    </View>
  );
}

const periodeStyles = StyleSheet.create({
  form: { gap: 16 },
  row: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  col: { flex: 1 },
});

// ───────────────────────── Validasi kategori ─────────────────────────

interface ValidasiKategoriSheetProps {
  visible: boolean;
  onClose: () => void;
}

/** Konfirmasi kategori yang tidak memiliki data pada periode berjalan. */
export function ValidasiKategoriSheet({ visible, onClose }: ValidasiKategoriSheetProps) {
  return (
    <BottomSheet visible={visible} onClose={onClose} title="Validasi Kategori Laporan">
      <ValidasiForm onClose={onClose} />
    </BottomSheet>
  );
}

function ValidasiForm({ onClose }: { onClose: () => void }) {
  const { kategoriKosong } = useLaporanStore();
  const { luarPeriode } = useLaporan();
  const { showToast } = useToast();
  const [dicentang, setDicentang] = useState<string[]>([]);

  const belum = KATEGORI_VALIDASI.filter((k) => !kategoriKosong.includes(k));

  const toggle = (kategori: string) =>
    setDicentang((prev) =>
      prev.includes(kategori) ? prev.filter((k) => k !== kategori) : [...prev, kategori]
    );

  const simpan = () => {
    confirmKategoriKosong(dicentang);
    showToast('Konfirmasi kategori disimpan');
    onClose();
  };

  return (
    <View style={validasiStyles.form}>
      <AppText variant="caption" color={NotaryColors.textSecondary}>
        Periksa kategori tanpa data. Sistem tidak akan menyimpan nilai nol tanpa konfirmasi Anda.
      </AppText>

      {belum.length === 0 ? (
        <InfoNote tone="neutral" icon="checkmark-circle-outline" text="Semua kategori sudah dikonfirmasi." />
      ) : (
        belum.map((kategori) => {
          const checked = dicentang.includes(kategori);
          return (
            <Pressable
              key={kategori}
              onPress={() => toggle(kategori)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked }}
              accessibilityLabel={`${kategori} tidak memiliki data`}
              style={[validasiStyles.check, checked && validasiStyles.checkOn]}>
              <View style={[validasiStyles.box, checked && validasiStyles.boxOn]}>
                {checked ? <Ionicons name="checkmark" size={14} color="#FFFFFF" /> : null}
              </View>
              <View style={validasiStyles.texts}>
                <AppText variant="bodyStrong">{kategori} tidak memiliki data</AppText>
                <AppText variant="caption" color={NotaryColors.textSecondary}>
                  Konfirmasi sebagai nilai nol untuk periode bulan ini.
                </AppText>
              </View>
            </Pressable>
          );
        })
      )}

      {luarPeriode > 0 ? (
        <InfoNote
          title={`${luarPeriode} data di luar periode`}
          text="Data tersebut tidak dihitung pada periode ini dan perlu dipastikan secara manual."
        />
      ) : null}

      {belum.length > 0 ? (
        <Button label="Simpan Konfirmasi" disabled={dicentang.length === 0} onPress={simpan} />
      ) : null}
    </View>
  );
}

const validasiStyles = StyleSheet.create({
  form: { gap: 14 },
  check: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: NotaryColors.border,
    backgroundColor: '#FFFFFF',
  },
  checkOn: { borderColor: NotaryColors.primary },
  box: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: NotaryColors.textSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxOn: { backgroundColor: NotaryColors.primary, borderColor: NotaryColors.primary },
  texts: { flex: 1, gap: 2 },
});

// ───────────────────────── Tambah / koreksi akta ─────────────────────────

interface KoreksiSheetProps {
  visible: boolean;
  /** Akta yang dikoreksi. `null` berarti menambah akta baru. */
  akta: Akta | null;
  onClose: () => void;
}

type Errors = Partial<Record<'nomorAkta' | 'tanggal' | 'pihak', string>>;
type Jenis = (typeof JENIS_AKTA)[number];

/** Form koreksi (atau tambah) akta pada Repertorium. */
export function KoreksiSheet({ visible, akta, onClose }: KoreksiSheetProps) {
  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title={akta ? 'Koreksi Akta' : 'Tambah Akta'}>
      {/* Form hanya ter-mount saat sheet terbuka, sehingga isian selalu mulai dari data akta. */}
      <AktaForm akta={akta} onClose={onClose} />
    </BottomSheet>
  );
}

/**
 * Tanggal awal untuk akta baru: hari ini bila masih di periode yang sedang dilihat,
 * jika tidak tanggal 1 pada periode tersebut. Dengan begitu akta baru langsung tampil di daftar.
 */
function defaultTanggal(bulan: number, tahun: number): string {
  const hariIni = todayInput();
  return isInPeriode(hariIni, bulan, tahun)
    ? hariIni
    : `01-${String(bulan + 1).padStart(2, '0')}-${tahun}`;
}

function AktaForm({ akta, onClose }: { akta: Akta | null; onClose: () => void }) {
  const { bulan, tahun } = useLaporanStore();
  const { showToast } = useToast();
  const [form, setForm] = useState<AktaInput>(() =>
    akta
      ? {
          nomorUrut: akta.nomorUrut,
          nomorAkta: akta.nomorAkta,
          tanggal: akta.tanggal,
          jenis: akta.jenis,
          pihak: akta.pihak,
          sifat: akta.sifat,
          status: akta.status,
          catatan: akta.catatan,
        }
      : {
          nomorUrut: nextNomorUrut(),
          nomorAkta: '',
          tanggal: defaultTanggal(bulan, tahun),
          jenis: JENIS_AKTA[0],
          pihak: '',
          sifat: 'Minuta',
          status: 'Draf',
          catatan: '',
        }
  );
  const [errors, setErrors] = useState<Errors>({});

  const set = <K extends keyof AktaInput>(key: K, value: AktaInput[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const simpan = () => {
    const next: Errors = {};
    if (!form.nomorAkta.trim()) next.nomorAkta = 'Nomor akta wajib diisi';
    if (!form.pihak.trim()) next.pihak = 'Nama pihak terkait wajib diisi';
    if (!parseInputDate(form.tanggal)) next.tanggal = 'Tanggal tidak valid';
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    const data: AktaInput = {
      ...form,
      nomorAkta: form.nomorAkta.trim(),
      pihak: form.pihak.trim(),
      catatan: form.catatan.trim(),
    };
    if (akta) {
      updateAkta(akta.id, data);
      showToast(`Koreksi akta ${data.nomorAkta} disimpan`);
    } else {
      addAkta(data);
      showToast(`Akta ${data.nomorAkta} ditambahkan`);
    }
    onClose();
  };

  return (
    <View style={koreksiStyles.form}>
      <View style={koreksiStyles.row}>
        <View style={koreksiStyles.col}>
          <FormField label="Nomor urut">
            <Input
              value={form.nomorUrut}
              onChangeText={(v) => set('nomorUrut', v)}
              keyboardType="number-pad"
              accessibilityLabel="Nomor urut"
            />
          </FormField>
        </View>
        <View style={koreksiStyles.col}>
          <FormField label="Nomor akta" required error={errors.nomorAkta}>
            <Input
              value={form.nomorAkta}
              onChangeText={(v) => set('nomorAkta', v)}
              placeholder="12/2026"
              invalid={!!errors.nomorAkta}
              accessibilityLabel="Nomor akta"
            />
          </FormField>
        </View>
      </View>

      <DateField
        label="Tanggal akta"
        value={form.tanggal}
        onChangeText={(v) => set('tanggal', v)}
        error={errors.tanggal}
      />

      <SelectField<Jenis>
        label="Jenis akta"
        value={(JENIS_AKTA.find((j) => j === form.jenis) ?? JENIS_AKTA[0]) as Jenis}
        options={JENIS_AKTA}
        onChange={(v) => set('jenis', v)}
      />

      <FormField label="Nama pihak terkait" required error={errors.pihak}>
        <Input
          value={form.pihak}
          onChangeText={(v) => set('pihak', v)}
          invalid={!!errors.pihak}
          accessibilityLabel="Nama pihak terkait"
        />
      </FormField>

      <View style={koreksiStyles.row}>
        <View style={koreksiStyles.col}>
          <SelectField<SifatAkta>
            label="Sifat akta"
            value={form.sifat}
            options={SIFAT_AKTA}
            onChange={(v) => set('sifat', v)}
          />
        </View>
        <View style={koreksiStyles.col}>
          <SelectField<StatusAkta>
            label="Status"
            value={form.status}
            options={STATUS_AKTA}
            onChange={(v) => set('status', v)}
          />
        </View>
      </View>

      <FormField label="Catatan">
        <Input
          value={form.catatan}
          onChangeText={(v) => set('catatan', v)}
          rows={3}
          placeholder="Catatan singkat (opsional)"
          accessibilityLabel="Catatan"
        />
      </FormField>

      {akta ? (
        <InfoNote text="Koreksi tidak menghapus catatan sebelumnya dan akan ditandai dalam riwayat." />
      ) : null}

      <Button label={akta ? 'Simpan Koreksi' : 'Simpan Akta'} onPress={simpan} />
    </View>
  );
}

const koreksiStyles = StyleSheet.create({
  form: { gap: 16 },
  row: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  col: { flex: 1 },
});