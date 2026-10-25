import { useLocalSearchParams, useRouter } from 'expo-router';
import { LayananScreen } from '@/screens/services/LayananScreen';
import { parseServiceTab } from '@/utils/service';

/** Route Layanan — tab 2. Membaca parameter `filter` dari Beranda. */
export default function LayananRoute() {
  const router = useRouter();
  const { filter, ts } = useLocalSearchParams<{ filter?: string; ts?: string }>();

  return (
    <LayananScreen
      initialTab={parseServiceTab(filter)}
      requestKey={ts}
      onAddService={() => router.navigate('/(tabs)/tambah')}
      onOpenService={(id) => router.push({ pathname: '/layanan/[id]', params: { id } })}
    />
  );
}
