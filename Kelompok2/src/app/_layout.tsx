import { useEffect } from 'react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
  Manrope_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/manrope';
import { ServiceStoreProvider } from '@/context/service-store';
import { ToastProvider } from '@/context/toast';

// Tahan splash bawaan sampai font siap agar tidak ada kedipan font sistem.
SplashScreen.preventAutoHideAsync();

/**
 * Root Layout aplikasi NotarisAI.
 * Stack navigator utama; navigasi tab ada di grup (tabs). Halaman turunan
 * (Detail Layanan, Notifikasi) berada di luar tab sehingga bottom nav tersembunyi (sesuai Figma).
 */
export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
    Manrope_800ExtraBold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) SplashScreen.hideAsync();
  }, [fontsLoaded, fontError]);

  // Bila font gagal dimuat, aplikasi tetap jalan dengan font sistem.
  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <ServiceStoreProvider>
        <ToastProvider>
          <Stack screenOptions={{ headerShown: false }}>
            {/* Splash & Auth screens */}
            <Stack.Screen name="screenawal" />
            <Stack.Screen name="login" />
            {/* Tab group — bottom navigation */}
            <Stack.Screen name="(tabs)" />
            {/* Halaman turunan (tanpa bottom navigation) */}
            <Stack.Screen name="layanan/[id]" />
            <Stack.Screen name="notifikasi" />
          </Stack>
        </ToastProvider>
      </ServiceStoreProvider>
    </SafeAreaProvider>
  );
}
