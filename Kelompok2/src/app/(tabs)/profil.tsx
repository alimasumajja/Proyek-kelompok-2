import { useRouter } from 'expo-router';
import { ProfileScreen } from '@/screens/profile/ProfileScreen';

/** Route Profil — tab 5. Menghubungkan ProfileScreen dengan navigasi (keluar & Manajemen Staf). */
export default function ProfilRoute() {
  const router = useRouter();

  return (
    <ProfileScreen
      onLogout={() => router.replace('/screenawal')}
      onOpenStaffManagement={() => router.push('/profile/staf')}
    />
  );
}
