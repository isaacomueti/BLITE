import { router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { Linking, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, useAnimatedStyle, useSharedValue, withDelay, withSpring, ZoomIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Card, EmptyState, Icon, IconButton, SumRow, Txt } from '@/components/ui';
import { business, productById } from '@/lib/data';
import { lineLabel, unitPrice, useStore } from '@/lib/store';
import { useNow } from '@/lib/use-now';
import { C, money } from '@/lib/theme';

const DELIVERY = ['Order received', 'Payment confirmed', 'Preparing your food', 'Ready', 'Out for delivery', 'Delivered'];
const PICKUP = ['Order received', 'Payment confirmed', 'Preparing your food', 'Ready for collection', 'Collected'];
const HEADLINE: Record<string, string> = {
  'Preparing your food': 'Your food is being cooked',
  Ready: 'Packed and ready',
  'Ready for collection': 'Ready for collection',
  'Out for delivery': 'Your rider is on the way',
  Delivered: 'Delivered — enjoy!',
  Collected: 'Collected — enjoy!',
};
const fmt = (d: Date) => d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

export default function OrderTracking() {
  const { id, fresh } = useLocalSearchParams<{ id: string; fresh?: string }>();
  const insets = useSafeAreaInsets();
  const { orders } = useStore();
  const o = orders.find((x) => x.id === id);
  const now = useNow();
  const progress = useSharedValue(0);

  const steps = o?.type === 'pickup' ? PICKUP : DELIVERY;
  const due = o ? new Date(o.dueAt) : new Date();
  const scheduledLater = o ? due.getTime() - now > 2 * 3600e3 : false;
  // Simulated from elapsed time; production subscribes to the order's status (Supabase realtime).
  const mins = o ? (now - new Date(o.placedAt).getTime()) / 60000 : 0;
  const cur = scheduledLater ? 1 : Math.min(steps.length - 1, 2 + Math.floor(mins / 15));
  const pct = (cur + 1) / steps.length;
  useEffect(() => {
    progress.set(withDelay(300, withSpring(pct, { damping: 18 })));
  }, [pct, progress]);
  const bar = useAnimatedStyle(() => ({ width: `${progress.value * 100}%` }));

  if (!o) {
    return (
      <View style={{ flex: 1, paddingTop: insets.top + 40, backgroundColor: C.bg }}>
        <EmptyState icon="receipt-outline" title="We couldn't find that order." text="Check your orders list." action="Your orders" onAction={() => router.replace('/orders')} />
      </View>
    );
  }

  const done = cur === steps.length - 1;
  const windowEnd = new Date(due.getTime() + 20 * 60000);
  const sameDay = due.toDateString() === new Date().toDateString();

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={[s.top, { paddingTop: insets.top + 8 }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <IconButton name="close" label="Close" onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} />
            <IconButton name="help-buoy-outline" label="Help with this order" onPress={() => Linking.openURL(business.whatsapp)} />
          </View>
          {fresh === '1' && (
            <Animated.View entering={ZoomIn.springify().damping(12)} style={s.check}>
              <Icon name="checkmark" size={38} color="#fff" />
            </Animated.View>
          )}
          <Animated.View entering={FadeIn.delay(200)} style={{ alignItems: 'center' }}>
            {fresh === '1' && <Txt v="eyebrow" color="#FFD3D9" style={{ marginBottom: 6 }}>Order confirmed</Txt>}
            <Txt v="h1" color="#fff" style={{ textAlign: 'center' }}>{scheduledLater ? 'Scheduled' : HEADLINE[steps[cur]] ?? steps[cur]}</Txt>
            <Txt color="rgba(255,255,255,0.85)" style={{ marginTop: 6, textAlign: 'center' }}>
              {done ? `#${o.id}` : `${o.type === 'pickup' ? 'Ready' : 'Arriving'} ${sameDay ? '' : due.toLocaleDateString('en-GB', { weekday: 'long' }) + ' '}${fmt(due)}–${fmt(windowEnd)}`}
            </Txt>
          </Animated.View>
          <View style={s.track}><Animated.View style={[s.trackFill, bar]} /></View>
        </View>

        <View style={{ padding: 16, gap: 14 }}>
          <Card>
            {steps.map((st, i) => {
              const state = i < cur || (done && i === cur) ? 'done' : i === cur ? 'now' : 'todo';
              return (
                <View key={st} style={s.step}>
                  <View style={{ alignItems: 'center' }}>
                    <View style={[s.dot, state === 'done' && s.dotDone, state === 'now' && s.dotNow]}>
                      {state === 'done' && <Icon name="checkmark" size={13} color="#fff" />}
                    </View>
                    {i < steps.length - 1 && <View style={[s.line, i < cur && { backgroundColor: C.red }]} />}
                  </View>
                  <Txt v="label" color={state === 'todo' ? C.muted : C.dark} style={{ paddingTop: 2 }}>{st}</Txt>
                </View>
              );
            })}
            <Txt v="small" style={{ marginTop: 8 }}>Live rider tracking will appear here once a delivery partner is connected.</Txt>
          </Card>

          <Card>
            <Txt v="h3" style={{ marginBottom: 8 }}>Order #{o.id}</Txt>
            {o.lines.map((l) => {
              const p = productById(l.id);
              return p ? (
                <View key={l.key} style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12, paddingVertical: 5 }}>
                  <View style={{ flex: 1 }}>
                    <Txt v="label">{l.qty}× {p.name}</Txt>
                    {!!lineLabel(l) && <Txt v="small">{lineLabel(l)}</Txt>}
                  </View>
                  <Txt color={C.dark}>{money(unitPrice(l) * l.qty)}</Txt>
                </View>
              ) : null;
            })}
            <View style={{ height: 1, backgroundColor: C.border, marginVertical: 8 }} />
            <SumRow label={o.type === 'pickup' ? 'Pickup' : 'Delivery'} value={o.fee ? money(o.fee) : 'Free'} />
            <SumRow label="Total paid" value={money(o.total)} bold />
            {o.address && <Txt v="small" style={{ marginTop: 8 }}>Delivering to {o.address.line1}, {o.address.postcode}</Txt>}
          </Card>

          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Button title="Call us" variant="ghost" icon="call-outline" size="md" style={{ flex: 1 }} onPress={() => Linking.openURL(business.phoneHref)} />
            <Button title="WhatsApp" variant="ghost" icon="logo-whatsapp" size="md" style={{ flex: 1 }} onPress={() => Linking.openURL(business.whatsapp)} />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  top: { backgroundColor: C.red, paddingHorizontal: 16, paddingBottom: 28, borderBottomLeftRadius: 28, borderBottomRightRadius: 28, overflow: 'hidden' },
  check: { alignSelf: 'center', width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(255,255,255,0.22)', alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  track: { height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.3)', marginTop: 20, overflow: 'hidden' },
  trackFill: { height: '100%', backgroundColor: '#fff', borderRadius: 3 },
  step: { flexDirection: 'row', gap: 12, minHeight: 40 },
  dot: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: C.border, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  dotDone: { backgroundColor: C.red, borderColor: C.red },
  dotNow: { borderColor: C.red, borderWidth: 6 },
  line: { width: 2, flex: 1, backgroundColor: C.border, marginVertical: 2 },
});
