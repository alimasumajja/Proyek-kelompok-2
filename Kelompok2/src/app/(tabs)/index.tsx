import { useRouter } from 'expo-router';
import { HomeScreen } from '@/screens/home/HomeScreen';
import type { ServiceTab } from '@/types/service';

/** Route Beranda — tab 1. Menghubungkan HomeScreen dengan navigasi (tab & halaman turunan). */
export default function BerandaRoute() {
  const router = useRouter();

  const openServices = (tab: ServiceTab) => {
    // `ts` memastikan filter yang sama tetap diterapkan ulang pada ketukan berikutnya.
    router.navigate({
      pathname: '/(tabs)/layanan',
      params: { filter: tab, ts: String(Date.now()) },
    });
  };

  return (
    <HomeScreen
      onNavigateToServices={openServices}
      onOpenService={(id) => router.push({ pathname: '/layanan/[id]', params: { id } })}
      onOpenNotifications={() => router.push('/notifikasi')}
      onOpenProfile={() => router.navigate('/(tabs)/profil')}
      onAddService={() => router.navigate('/(tabs)/tambah')}
    />
  );
}
