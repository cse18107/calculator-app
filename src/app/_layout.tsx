import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from '@expo-google-fonts/inter';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { AppStateProvider } from '@/features/calculator/AppStateProvider';
import { ThemeProvider } from '@/theme/ThemeProvider';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  // Render nothing until Inter is ready, so text never flashes in the system font.
  if (!fontsLoaded) {
    return null;
  }

  return (
    <ThemeProvider>
      <AppStateProvider>
        <StatusBar style="auto" />
        <Stack screenOptions={{ headerShown: false }} />
      </AppStateProvider>
    </ThemeProvider>
  );
}
