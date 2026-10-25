import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { TAHAP } from '../constants/data';
import { Layanan, Prioritas } from '../types/layanan';

const STORAGE_KEY = 'layanan:v1';

export interface InputLayanan {
  namaKlien: string;
  jenisLayanan: string;
  tanggalDiterima: string;
  penanggungJawab: string;
  kontakKlien?: string;
  deskripsi?: string;
  prioritas: Prioritas;
  targetSelesai?: string;
}

interface LayananContextValue {
  daftar: Layanan[];
  siap: boolean;
  tambahLayanan: (input: InputLayanan) => Promise<Layanan>;
  majuTahap: (id: string) => Promise<void>;
  getById: (id: string) => Layanan | undefined;
}

const LayananContext = createContext<LayananContextValue | null>(null);

export function LayananProvider({ children }: { children: React.ReactNode }) {
  const [daftar, setDaftar] = useState<Layanan[]>([]);
  const [siap, setSiap] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) setDaftar(JSON.parse(raw));
      } catch (e) {
        console.warn('Gagal memuat data', e);
      } finally {
        setSiap(true);
      }
    })();
  }, []);

  const simpan = useCallback(async (data: Layanan[]) => {
    setDaftar(data);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('Gagal menyimpan data', e);
    }
  }, []);

  const tambahLayanan = useCallback(
    async (input: InputLayanan) => {
      const sekarang = new Date().toISOString();
      const tahun = new Date(input.tanggalDiterima).getFullYear();
      const urut = String(daftar.length + 1).padStart(4, '0');

      const baru: Layanan = {
        ...input,
        id: Date.now().toString(),
        nomor: `LAY-${tahun}-${urut}`,
        tahapIndex: 0,
        tahapMulai: input.tanggalDiterima,
        status: 'Aktif',
        riwayat: [{ tahap: TAHAP[0], tanggal: sekarang }],
      };
      await simpan([baru, ...daftar]);
      return baru;
    },
    [daftar, simpan]
  );

  const majuTahap = useCallback(
    async (id: string) => {
      const sekarang = new Date().toISOString();
      const hasil = daftar.map((l) => {
        if (l.id !== id || l.tahapIndex >= TAHAP.length - 1) return l;
        const next = l.tahapIndex + 1;
        return {
          ...l,
          tahapIndex: next,
          tahapMulai: sekarang,
          status: next === TAHAP.length - 1 ? ('Selesai' as const) : l.status,
          riwayat: [...l.riwayat, { tahap: TAHAP[next], tanggal: sekarang }],
        };
      });
      await simpan(hasil);
    },
    [daftar, simpan]
  );

  const getById = useCallback((id: string) => daftar.find((l) => l.id === id), [daftar]);

  return (
    <LayananContext.Provider value={{ daftar, siap, tambahLayanan, majuTahap, getById }}>
      {children}
    </LayananContext.Provider>
  );
}

export function useLayanan() {
  const ctx = useContext(LayananContext);
  if (!ctx) throw new Error('useLayanan harus dipakai di dalam LayananProvider');
  return ctx;
}
