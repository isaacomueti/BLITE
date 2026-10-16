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
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { Button, EmptyState } from '@/components/ui';
import { hydrateCatalogue, loadCatalogue } from '@/lib/data';
import { StoreProvider, useStore } from '@/lib/store';
import { C } from '@/lib/theme';

SplashScreen.preventAutoHideAsync().catch(() => {});

// The app is light-only for now: brand colours are tuned for a cream background.
const theme = { ...DefaultTheme, colors: { ...DefaultTheme.colors, background: C.bg, primary: C.red, card: C.bg, text: C.dark, border: C.border } };

/** Menu, prices and settings come from the website: use the cached copy at once, refresh in the background. */
function useCatalogue() {
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let live = true;
    hydrateCatalogue().then(async (cached) => {
      if (live && cached) setState('ready');
      try {
        await loadCatalogue();
        if (live) setState('ready');
      } catch {
        if (live && !cached) setState('error');
      }
    });
    return () => {
      live = false;
    };
  }, [attempt]);
  return {
    state,
    retry: () => {
      setState('loading');
      setAttempt((n) => n + 1);
    },
  };
}

function Navigator() {
  const { ready } = useStore();
  const catalogue = useCatalogue();
  const [fontsLoaded] = useFonts({ Fraunces_700Bold, Fraunces_600SemiBold_Italic, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold });
  const loaded = ready && fontsLoaded && catalogue.state !== 'loading';

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync().catch(() => {});
  }, [loaded]);
  if (!loaded) return null;
  if (catalogue.state === 'error') {
    return (
      <View style={{ flex: 1, justifyContent: 'center', backgroundColor: C.bg }}>
        <EmptyState icon="cloud-offline-outline" title="We can't load the menu." text="Check your internet connection, then try again." />
        <Button title="Try again" onPress={catalogue.retry} style={{ marginHorizontal: 32 }} />
      </View>
    );
  }

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
      <Stack.Screen name="login" options={{ presentation: 'modal' }} />
      <Stack.Screen name="register" options={{ presentation: 'modal' }} />
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
