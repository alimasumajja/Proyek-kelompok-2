export type ValidasiStatus = "lengkap" | "tinjau";
export type AktaStatus = "terbit" | "draf";

export interface ValidasiData {
  id: string;
  judul: string;
  deskripsi: string;
  status: ValidasiStatus;
}

export interface Akta {
  id: string;
  nomorUrut: string;
  nomorAkta: string;
  tanggal: string; // format YYYY-MM-DD
  jenis: string;
  pihak: string;
  sifat: string;
  status: AktaStatus;
  catatan: string;
}

export interface LaporanData {
  periode: string;
  terakhirDiperbarui: string;
  progress: number;
  stats: { jumlahAkta: number; selesai: number; perluTinjau: number };
  validasi: ValidasiData[];
}
