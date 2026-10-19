import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, EmptyState, Icon, Pill, Txt } from '@/components/ui';
import { ApiOrder } from '@/lib/api';
import { useStore } from '@/lib/store';
import { C, money, R } from '@/lib/theme';


function statusPill(o: ApiOrder) {
  if (o.status === 'cancelled') return <Pill tone="muted">Cancelled</Pill>;
  if (o.status === 'completed') return <Pill tone="muted">Completed</Pill>;
  if (o.payment_status === 'pending') return <Pill tone="orange" icon="time">Awaiting payment</Pill>;
  return <Pill tone="green" icon="radio-button-on">In progress</Pill>;
}

export default function Orders() {
  const insets = useSafeAreaInsets();
  const { orders, user, refreshOrders } = useStore();
  const [refreshing, setRefreshing] = useState(false);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await refreshOrders().catch(() => {});
    setRefreshing(false);
  }, [refreshOrders]);
  useFocusEffect(useCallback(() => { refreshOrders().catch(() => {}); }, [refreshOrders]));

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={[s.head, { paddingTop: insets.top + 10 }]}><Txt v="h1">Your orders</Txt></View>
      {!user ? (
        <View>
          <EmptyState icon="receipt-outline" title="Sign in to see your orders." text="Orders from the app and blitefood.co.uk show up here." action="Sign in" onAction={() => router.push('/login')} />
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(o) => o.reference}
          contentContainerStyle={{ padding: 16, gap: 12, flexGrow: 1 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={C.red} />}
          ListEmptyComponent={<EmptyState icon="receipt-outline" title="Your order history is empty." text="Once you order, you can track it here." action="Explore the menu" onAction={() => router.push('/store')} />}
          renderItem={({ item: o }) => (
            <Pressable onPress={() => router.push({ pathname: '/order/[id]', params: { id: o.reference } })} style={({ pressed }) => [s.card, pressed && { opacity: 0.9 }]}>
              <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
                <View style={s.thumb}><Icon name={o.order_type === 'pickup' ? 'storefront' : 'bicycle'} size={24} color={C.red} /></View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <Txt v="h3">{o.reference.toUpperCase()}</Txt>
                    {statusPill(o)}
                  </View>
                  <Txt v="small">{o.item_count} {o.item_count === 1 ? 'item' : 'items'} · {o.order_type === 'pickup' ? 'Pickup' : 'Delivery'}</Txt>
                  <Txt v="small">{new Date(o.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} · {money(o.total)}</Txt>
                </View>
                <Icon name="chevron-forward" size={18} color={C.muted} />
              </View>
              {o.payment_status === 'pending' && o.status !== 'cancelled' && (
                <Button title="See payment details" variant="secondary" size="sm" icon="card-outline" style={{ marginTop: 12 }} onPress={() => router.push({ pathname: '/order/[id]', params: { id: o.reference } })} />
              )}
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  head: { paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.border },
  card: { backgroundColor: '#fff', borderRadius: R.card, borderWidth: 1, borderColor: C.border, padding: 14 },
  thumb: { width: 56, height: 56, borderRadius: 14, backgroundColor: C.blush, alignItems: 'center', justifyContent: 'center' },
});
