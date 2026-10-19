import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Linking, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Card, EmptyState, Icon, IconButton, Photo, SumRow, Txt } from '@/components/ui';
import { api, ApiError, ApiOrder } from '@/lib/api';
import { business } from '@/lib/data';
import { useStore } from '@/lib/store';
import { C, F, money } from '@/lib/theme';

const fmtDate = (s: string | null) => (s ? new Date(s.replace(' ', 'T')).toLocaleString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '');

function steps(o: ApiOrder) {
  return [
    { label: 'Order placed', sub: fmtDate(o.created_at), done: true },
    { label: 'Payment confirmed', sub: o.payment_status === 'paid' ? 'Thank you!' : 'Waiting for your bank transfer', done: o.payment_status === 'paid' },
    { label: 'Preparing', sub: 'Freshly cooked for your date', done: o.status === 'processing' || o.status === 'completed' },
    { label: o.order_type === 'pickup' ? 'Collected' : 'Delivered', sub: fmtDate(o.scheduled_for), done: o.status === 'completed' },
  ];
}

export default function OrderTracking() {
  const { id, fresh } = useLocalSearchParams<{ id: string; fresh?: string }>();
  const insets = useSafeAreaInsets();
  const { refreshOrders } = useStore();
  const [o, setO] = useState<ApiOrder | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setO(await api<ApiOrder>(`/orders/${encodeURIComponent(id)}`));
      setError('');
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Could not load this order.');
    } finally {
      setLoading(false);
    }
  }, [id]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const close = () => (router.canGoBack() ? router.back() : router.replace('/'));
  const chat = () => WebBrowser.openBrowserAsync(business.chatUrl).catch(() => {});

  if (!o) {
    return (
      <View style={{ flex: 1, paddingTop: insets.top + 40, backgroundColor: C.bg }}>
        {loading ? <ActivityIndicator color={C.red} style={{ marginTop: 60 }} /> : (
          <EmptyState icon="receipt-outline" title="We couldn't find that order." text={error || 'Check your orders list.'} action="Your orders" onAction={() => router.replace('/orders')} />
        )}
      </View>
    );
  }

  const st = steps(o);
  const current = st.findIndex((x) => !x.done);
  const cancelled = o.status === 'cancelled';
  const unpaid = o.payment_status === 'pending' && !cancelled;
  const ref = o.reference.toUpperCase();
  const bank = business.bank;

  const cancel = () =>
    Alert.alert('Cancel this order?', 'You can place a new one any time.', [
      { text: 'Keep order', style: 'cancel' },
      {
        text: 'Cancel order',
        style: 'destructive',
        onPress: async () => {
          setCancelling(true);
          try {
            await api(`/orders/${encodeURIComponent(o.reference)}/cancel`, { method: 'POST' });
            await load();
            refreshOrders().catch(() => {});
          } catch (e) {
            Alert.alert('Could not cancel', e instanceof ApiError ? e.message : 'Please chat to us.');
          } finally {
            setCancelling(false);
          }
        },
      },
    ]);

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor="#fff" />}>
        <View style={[s.top, { paddingTop: insets.top + 8 }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <IconButton name="close" label="Close" onPress={close} />
            <IconButton name="chatbubbles-outline" label="Chat to us about this order" onPress={chat} />
          </View>
          {fresh === '1' && (
            <Animated.View entering={ZoomIn.springify().damping(12)} style={s.check}>
              <Icon name="checkmark" size={38} color="#fff" />
            </Animated.View>
          )}
          <Animated.View entering={FadeIn.delay(200)} style={{ alignItems: 'center' }}>
            {fresh === '1' && <Txt v="eyebrow" color="#FFD3D9" style={{ marginBottom: 6 }}>Order placed</Txt>}
            <Txt v="h1" color="#fff" style={{ textAlign: 'center' }}>
              {cancelled ? 'Order cancelled' : unpaid ? `Transfer ${money(o.total)}` : st[current]?.label ?? 'Completed — enjoy!'}
            </Txt>
            <Txt color="rgba(255,255,255,0.85)" style={{ marginTop: 6, textAlign: 'center' }}>
              {ref} · {o.order_type === 'pickup' ? 'Pickup' : 'Delivery'} {fmtDate(o.scheduled_for)}
            </Txt>
          </Animated.View>
        </View>

        <View style={{ padding: 16, gap: 14 }}>
          {unpaid && (
            <Card>
              <Txt v="h3">Pay by bank transfer</Txt>
              <Txt v="small" style={{ marginTop: 2, marginBottom: 8 }}>Send the exact amount and use your reference so we can match your payment. We’ll email you once it’s confirmed. Long-press any detail to copy it.</Txt>
              {[
                ['Bank', bank?.bank_name],
                ['Account name', bank?.account_name],
                ['Sort code', bank?.sort_code],
                ['Account number', bank?.account_number],
                ['Reference', ref],
                ['Amount', money(o.total)],
              ].filter(([, v]) => !!v).map(([k, v]) => (
                <View key={k} style={s.bankRow}>
                  <Txt v="small">{k}</Txt>
                  <Text selectable style={s.bankVal}>{v}</Text>
                </View>
              ))}
              {!bank && <Txt v="small" color="#8A5300">Bank details are being updated — chat to us to pay.</Txt>}
              <Button title="I've sent the money" style={{ marginTop: 14 }} onPress={() => { load(); Alert.alert('Thank you!', 'We’ll confirm your payment by email as soon as it arrives.'); }} />
              <Button title="Cancel order" variant="ghost" size="md" loading={cancelling} style={{ marginTop: 8 }} onPress={cancel} />
            </Card>
          )}

          <Card>
            {cancelled ? (
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <Icon name="close-circle" size={20} color="#B0101F" />
                <Txt style={{ flex: 1 }}>This order was cancelled. Payment: {o.payment_status}.</Txt>
              </View>
            ) : (
              st.map((x, i) => {
                const state = x.done ? 'done' : i === current ? 'now' : 'todo';
                return (
                  <View key={x.label} style={s.step}>
                    <View style={{ alignItems: 'center' }}>
                      <View style={[s.dot, state === 'done' && s.dotDone, state === 'now' && s.dotNow]}>
                        {state === 'done' && <Icon name="checkmark" size={13} color="#fff" />}
                      </View>
                      {i < st.length - 1 && <View style={[s.line, x.done && { backgroundColor: C.red }]} />}
                    </View>
                    <View style={{ flex: 1, paddingBottom: 10 }}>
                      <Txt v="label" color={state === 'todo' ? C.muted : C.dark}>{x.label}</Txt>
                      {!!x.sub && <Txt v="small">{x.sub}</Txt>}
                    </View>
                  </View>
                );
              })
            )}
          </Card>

          <Card>
            <Txt v="h3" style={{ marginBottom: 8 }}>Order {ref}</Txt>
            {(o.items ?? []).map((it, i) => (
              <View key={i} style={{ flexDirection: 'row', gap: 12, alignItems: 'center', paddingVertical: 6 }}>
                <Photo k={it.image} style={s.thumb} alt={it.name} />
                <View style={{ flex: 1 }}>
                  <Txt v="label">{it.quantity}× {it.name}</Txt>
                  <Txt v="small">
                    {it.type === 'food' ? it.size : `${it.rental_days ?? 1}-day hire from ${it.rental_start ?? ''} · caution ${money(it.caution_fee ?? 0)}`}
                  </Txt>
                </View>
                <Txt color={C.dark}>{money(it.total)}</Txt>
              </View>
            ))}
            <View style={{ height: 1, backgroundColor: C.border, marginVertical: 8 }} />
            {o.coupon && <SumRow label={`Coupon ${o.coupon.code}`} value={`−${o.coupon.percent}%`} />}
            <SumRow label={o.payment_status === 'paid' ? 'Total paid' : 'Total'} value={money(o.total)} bold />
            {o.address ? (
              <Txt v="small" style={{ marginTop: 8 }}>Delivering to {o.address.address}, {o.address.city} {o.address.postcode ?? ''} ({o.address.area})</Txt>
            ) : (
              <Txt v="small" style={{ marginTop: 8 }}>Pickup from {business.pickupLocation || business.address}{business.pickupTime ? ` · ${business.pickupTime}` : ''}</Txt>
            )}
            {!!o.note && <Txt v="small" style={{ marginTop: 6 }}>Note: {o.note}</Txt>}
          </Card>

          <View style={{ flexDirection: 'row', gap: 10 }}>
            {!!business.phoneHref && <Button title="Call us" variant="ghost" icon="call-outline" size="md" style={{ flex: 1 }} onPress={() => Linking.openURL(business.phoneHref)} />}
            <Button title="Live chat" variant="ghost" icon="chatbubbles-outline" size="md" style={{ flex: 1 }} onPress={chat} />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  top: { backgroundColor: C.red, paddingHorizontal: 16, paddingBottom: 28, borderBottomLeftRadius: 28, borderBottomRightRadius: 28, overflow: 'hidden' },
  check: { alignSelf: 'center', width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(255,255,255,0.22)', alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  bankRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.border },
  bankVal: { fontFamily: F.semibold, fontSize: 15, color: C.dark, fontVariant: ['tabular-nums'] },
  step: { flexDirection: 'row', gap: 12, minHeight: 44 },
  dot: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: C.border, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  dotDone: { backgroundColor: C.red, borderColor: C.red },
  dotNow: { borderColor: C.red, borderWidth: 6 },
  line: { width: 2, flex: 1, backgroundColor: C.border, marginVertical: 2 },
  thumb: { width: 48, height: 48, borderRadius: 12, backgroundColor: C.blush },
});
