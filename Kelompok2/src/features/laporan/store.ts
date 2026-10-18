import { useSyncExternalStore } from "react";
import type { Akta } from "./types";

export const BULAN = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];
const BULAN_PENDEK = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];

export const KATEGORI_VALIDASI = ["Waarmerking", "Akta Jaminan Fidusia"];
export const JENIS_AKTA = [
  "Pendirian PT",
  "Akta Jual Beli",
  "Perjanjian Kredit",
  "Waarmerking",
  "Akta Jaminan Fidusia",
];

type State = {
  bulan: number; // 0-11
  tahun: number;
  akta: Akta[];
  kategoriKosong: string[];
  repertoriumOpen: boolean;
};

let state: State = {
  bulan: 2,
  tahun: 2026,
  kategoriKosong: [],
  repertoriumOpen: false,
  akta: [
    {
      id: "1",
      nomorUrut: "001",
      nomorAkta: "12/2026",
      tanggal: "2026-03-12",
      jenis: "Pendirian PT",
      pihak: "PT Nusa Karya Sentosa",
      sifat: "Minuta",
      status: "terbit",
      catatan: "Telah dicatat dan diperiksa.",
    },
    {
      id: "2",
      nomorUrut: "002",
      nomorAkta: "13/2026",
      tanggal: "2026-03-17",
      jenis: "Akta Jual Beli",
      pihak: "Sri Rahmawati & Andre Wijaya",
      sifat: "Minuta",
      status: "terbit",
      catatan: "",
    },
    {
      id: "3",
      nomorUrut: "003",
      nomorAkta: "14/2026",
      tanggal: "2026-03-19",
      jenis: "Perjanjian Kredit",
      pihak: "Hadi Kurniawan",
      sifat: "Minuta",
      status: "draf",
      catatan: "",
    },
    {
      id: "4",
      nomorUrut: "004",
      nomorAkta: "15/2026",
      tanggal: "2026-04-02",
      jenis: "Akta Jual Beli",
      pihak: "CV Mitra Abadi",
      sifat: "Minuta",
      status: "terbit",
      catatan: "",
    },
  ],
};

const listeners = new Set<() => void>();

function emit(next: State) {
  state = next;
  listeners.forEach((l) => l());
}

export const getState = () => state;
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
};

export function useLaporanStore() {
  return useSyncExternalStore(subscribe, getState, getState);
}

export function setPeriode(bulan: number, tahun: number) {
  emit({ ...state, bulan, tahun });
}

export function confirmKosong(kategori: string[]) {
  emit({
    ...state,
    kategoriKosong: [...new Set([...state.kategoriKosong, ...kategori])],
  });
}

export function addAkta(data: Omit<Akta, "id">) {
  emit({
    ...state,
    akta: [...state.akta, { ...data, id: String(Date.now()) }],
  });
}

export function updateAkta(id: string, data: Omit<Akta, "id">) {
  emit({
    ...state,
    akta: state.akta.map((a) => (a.id === id ? { ...a, ...data } : a)),
  });
}

export function openRepertorium() {
  emit({ ...state, repertoriumOpen: true });
}

export function closeRepertorium() {
  emit({ ...state, repertoriumOpen: false });
}

export function nextNomorUrut() {
  return String(state.akta.length + 1).padStart(3, "0");
}

export function formatTanggal(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return `${d} ${BULAN_PENDEK[m - 1]} ${y}`;
}

export function isInPeriode(iso: string, bulan: number, tahun: number) {
  const [y, m] = iso.split("-").map(Number);
  return y === tahun && m - 1 === bulan;
}
