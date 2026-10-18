import {
  BULAN,
  KATEGORI_VALIDASI,
  isInPeriode,
  useLaporanStore,
} from "../store";
import type { LaporanData, ValidasiData } from "../types";

export function useLaporan() {
  const { bulan, tahun, akta, kategoriKosong } = useLaporanStore();

  const dalamPeriode = akta.filter((a) => isInPeriode(a.tanggal, bulan, tahun));
  const luarPeriode = akta.length - dalamPeriode.length;
  const aktaLengkap = dalamPeriode.every(
    (a) => a.nomorAkta && a.pihak && a.jenis,
  );

  const validasi: ValidasiData[] = [
    {
      id: "daftar-akta",
      judul: "Daftar Akta",
      deskripsi: aktaLengkap
        ? "Semua field sesuai ketentuan"
        : "Ada akta dengan data belum lengkap",
      status: aktaLengkap ? "lengkap" : "tinjau",
    },
    ...KATEGORI_VALIDASI.map((k): ValidasiData => {
      const adaData = dalamPeriode.some((a) => a.jenis === k);
      const dikonfirmasi = kategoriKosong.includes(k);
      return {
        id: k,
        judul: k,
        deskripsi: adaData
          ? "Data tersedia pada periode ini"
          : dikonfirmasi
            ? "Dikonfirmasi tidak memiliki data"
            : "Kategori kejadian belum dikonfirmasi",
        status: adaData || dikonfirmasi ? "lengkap" : "tinjau",
      };
    }),
  ];

  const jumlahLengkap = validasi.filter((v) => v.status === "lengkap").length;

  const jam = new Date()
    .toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
    .replace(":", ".");

  const data: LaporanData = {
    periode: `${BULAN[bulan]} ${tahun}`,
    terakhirDiperbarui: `Hari ini, ${jam}`,
    progress: Math.round((jumlahLengkap / validasi.length) * 100),
    stats: {
      jumlahAkta: dalamPeriode.length,
      selesai: dalamPeriode.filter((a) => a.status === "terbit").length,
      perluTinjau: validasi.length - jumlahLengkap,
    },
    validasi,
  };

  return { data, luarPeriode, loading: false };
}
