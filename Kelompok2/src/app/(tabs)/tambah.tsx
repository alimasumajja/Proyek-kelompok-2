import { useRouter } from 'expo-router';
import { TambahLayananScreen } from '@/screens/services/TambahLayananScreen';

/** Route Tambah Layanan — tab 3 (tombol tengah menonjol). Setelah disimpan, pindah ke daftar Layanan. */
export default function TambahRoute() {
  const router = useRouter();

  return (
    <TambahLayananScreen
      onBack={() => router.navigate('/(tabs)/layanan')}
      onSaved={() => router.navigate('/(tabs)/layanan')}
    />
  );
}