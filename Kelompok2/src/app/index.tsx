import { Redirect } from 'expo-router';

// Saat aplikasi dijalankan, langsung arahkan ke halaman profil.
export default function Index() {
  return <Redirect href="/profil" />;
}
