import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import { Nunito_400Regular } from '@expo-google-fonts/nunito/400Regular';
import { Nunito_600SemiBold } from '@expo-google-fonts/nunito/600SemiBold';
import { Nunito_700Bold } from '@expo-google-fonts/nunito/700Bold';
import { Nunito_800ExtraBold } from '@expo-google-fonts/nunito/800ExtraBold';
import { AuthProvider } from './src/auth';
import Navigation from './src/navigation';
import { LoadingState } from './src/ui';

export default function App() {
  const [loaded, fontError] = useFonts({ Nunito_400Regular, Nunito_600SemiBold, Nunito_700Bold, Nunito_800ExtraBold });
  // If the font fails to load we still render with system fonts instead of blocking the app.
  if (!loaded && !fontError) return <LoadingState />;
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="dark" />
        <Navigation />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
