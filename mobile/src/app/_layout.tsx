import { Fraunces_600SemiBold_Italic } from '@expo-google-fonts/fraunces/600SemiBold_Italic';
import { Fraunces_700Bold } from '@expo-google-fonts/fraunces/700Bold';
import { Inter_400Regular } from '@expo-google-fonts/inter/400Regular';
import { Inter_500Medium } from '@expo-google-fonts/inter/500Medium';
import { Inter_600SemiBold } from '@expo-google-fonts/inter/600SemiBold';
import { Inter_700Bold } from '@expo-google-fonts/inter/700Bold';
import { useFonts } from 'expo-font';
import { DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { StoreProvider, useStore } from '@/lib/store';
import { C } from '@/lib/theme';

SplashScreen.preventAutoHideAsync().catch(() => {});

// The app is light-only for now: brand colours are tuned for a cream background.
const theme = { ...DefaultTheme, colors: { ...DefaultTheme.colors, background: C.bg, primary: C.red, card: C.bg, text: C.dark, border: C.border } };

function Navigator() {
  const { ready } = useStore();
  const [fontsLoaded] = useFonts({ Fraunces_700Bold, Fraunces_600SemiBold_Italic, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold });
  const loaded = ready && fontsLoaded;

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync().catch(() => {});
  }, [loaded]);
  if (!loaded) return null;

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: C.bg } }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="store" />
      <Stack.Screen name="product/[id]" options={{ presentation: 'modal' }} />
      <Stack.Screen name="cart" options={{ presentation: 'modal' }} />
      <Stack.Screen name="address" options={{ presentation: 'modal' }} />
      <Stack.Screen name="checkout" />
      <Stack.Screen name="order/[id]" />
      <Stack.Screen name="catering" />
      <Stack.Screen name="equipment" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider value={theme}>
          <StoreProvider>
            <StatusBar style="dark" />
            <Navigator />
          </StoreProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
