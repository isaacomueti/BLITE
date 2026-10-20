import { Image } from 'expo-image';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeOut, ZoomIn } from 'react-native-reanimated';

import { Txt } from '@/components/ui';
import { C, F } from '@/lib/theme';

/**
 * Branded launch screen shown over the app for a moment after the native splash (same red and
 * the same B mark, so the hand-off is seamless). Calls onDone when it should fade away.
 */
export function LaunchScreen({ onDone, durationMs = 1400 }: { onDone: () => void; durationMs?: number }) {
  useEffect(() => {
    const t = setTimeout(onDone, durationMs);
    return () => clearTimeout(t);
  }, [onDone, durationMs]);

  return (
    <Animated.View style={s.screen} exiting={FadeOut.duration(350)} pointerEvents="none">
      <StatusBar style="light" />
      <Animated.View entering={ZoomIn.springify().damping(14)}>
        <Image source={require('@/assets/images/splash-icon.png')} style={s.mark} contentFit="contain" accessibilityLabel="B-Lite" />
      </Animated.View>
      <Animated.View entering={FadeInDown.delay(250).duration(450)} style={{ alignItems: 'center' }}>
        <Txt style={s.name}>B-Lite Food</Txt>
        <Txt v="eyebrow" color="rgba(255,255,255,0.8)" style={{ marginTop: 6 }}>Authentic Nigerian food</Txt>
      </Animated.View>
      <Animated.View entering={FadeIn.delay(600)} style={s.footer}>
        <Txt v="small" color="rgba(255,255,255,0.7)" style={s.motto}>Good food · Happy people · Great memories</Txt>
      </Animated.View>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  screen: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: C.red, alignItems: 'center', justifyContent: 'center', zIndex: 100 },
  mark: { width: 200, height: 200 },
  name: { fontFamily: F.display, fontSize: 34, color: '#fff', marginTop: 8, letterSpacing: -0.4 },
  footer: { position: 'absolute', bottom: 48, left: 0, right: 0, alignItems: 'center' },
  motto: { fontFamily: F.displayItalic, fontSize: 15 },
});
