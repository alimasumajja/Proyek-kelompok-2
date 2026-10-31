import { useRouter } from 'expo-router';
import { ServiceTypesScreen } from '@/screens/services/ServiceTypesScreen';

/** Route Kelola Jenis Layanan: /jenis-layanan (khusus Notaris, di luar tab sehingga bottom nav tersembunyi). */
export default function ServiceTypesRoute() {
  const router = useRouter();

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)/layanan');
  };

  return <ServiceTypesScreen onBack={goBack} />;
}
