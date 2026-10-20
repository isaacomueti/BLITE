import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { Easing, FadeInDown, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Photo, Txt } from '@/components/ui';
import { business } from '@/lib/data';
import { useStore } from '@/lib/store';
import { C, F } from '@/lib/theme';

/** First-launch welcome: sign in with a blitefood.co.uk account, create one, or browse as a guest. */
export default function Welcome() {
  const insets = useSafeAreaInsets();
  const { setWelcomed } = useStore();
  const spin = useSharedValue(0);
  useEffect(() => {
    spin.set(withRepeat(withTiming(360, { duration: 40000, easing: Easing.linear }), -1));
  }, [spin]);
  const plate = useAnimatedStyle(() => ({ transform: [{ rotate: `${spin.value}deg` }] }));

  const go = (path: '/login' | '/register' | null) => {
    if (!path) {
      setWelcomed();
      router.replace('/');
      return;
    }
    router.push({ pathname: path, params: { from: 'welcome' } });
  };

  return (
    <View style={[s.screen, { paddingTop: insets.top + 24, paddingBottom: Math.max(insets.bottom, 20) }]}>
      <StatusBar style="light" />
      <Animated.View entering={FadeInDown.duration(500)}>
        <Txt v="eyebrow" color="rgba(255,255,255,0.8)">Authentic Nigerian food</Txt>
        <Txt style={s.title}>Home of{'\n'}<Txt style={[s.title, s.italic]}>Yummy Delight</Txt></Txt>
        <Txt color="rgba(255,255,255,0.85)" style={{ marginTop: 12, maxWidth: 320 }}>
          Jollof, soups, small chops and party trays, freshly cooked to order. Catering and equipment hire for your event.
        </Txt>
      </Animated.View>

      <View style={s.plateWrap}>
        <Animated.View style={[s.plate, plate]}>
          <Photo k="hero/jollof" cutout style={{ width: '100%', height: '100%' }} alt="A plate of jollof rice" />
        </Animated.View>
      </View>

      <Animated.View entering={FadeInDown.delay(200).duration(500)} style={{ gap: 10 }}>
        <Button title="Sign in" variant="dark" icon="log-in-outline" onPress={() => go('/login')} />
        <Button title="Create an account" variant="secondary" onPress={() => go('/register')} style={{ borderColor: '#fff' }} />
        <Button title="Browse as guest" variant="onRed" onPress={() => go(null)} />
        <Txt v="small" color="rgba(255,255,255,0.75)" style={{ textAlign: 'center', marginTop: 4 }}>
          {business.offline ? 'You can browse the full menu now. Online ordering opens soon.' : 'Use the same account as blitefood.co.uk.'}
        </Txt>
      </Animated.View>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.red, paddingHorizontal: 22, justifyContent: 'space-between' },
  title: { fontFamily: F.display, fontSize: 44, lineHeight: 48, color: '#fff', marginTop: 10, letterSpacing: -0.5 },
  italic: { fontFamily: F.displayItalic, color: '#FFD3D9' },
  plateWrap: { alignItems: 'center', justifyContent: 'center', flex: 1, paddingVertical: 12 },
  plate: { width: '86%', aspectRatio: 1, maxWidth: 360 },
});
