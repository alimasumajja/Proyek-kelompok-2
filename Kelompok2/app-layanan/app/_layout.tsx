import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { LayananProvider } from '../store/LayananContext';

export default function RootLayout() {
  return (
    <LayananProvider>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }} />
    </LayananProvider>
  );
}
