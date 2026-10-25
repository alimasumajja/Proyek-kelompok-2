import { useLocalSearchParams, useRouter } from 'expo-router';
import { ServiceDetailScreen } from '@/screens/ServiceDetailScreen';

/**
 * Route Detail Layanan: /layanan/[id].
 * Berada di luar grup (tabs) sehingga bottom navigation tersembunyi, sesuai desain Figma.
 */
export default function ServiceDetailRoute() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)/layanan');
  };

  return <ServiceDetailScreen serviceId={String(id)} onBack={goBack} />;
}
