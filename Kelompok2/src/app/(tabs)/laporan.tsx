import { useRouter } from 'expo-router';
import { ReportsScreen } from '@/screens/reports/ReportsScreen';

/** Route Laporan — tab 4. Repertorium dibuka sebagai halaman turunan (tanpa bottom nav). */
export default function LaporanRoute() {
  const router = useRouter();

  return <ReportsScreen onOpenRepertorium={() => router.push('/laporan/repertorium')} />;
}