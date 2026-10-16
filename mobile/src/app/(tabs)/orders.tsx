import { router } from 'expo-router';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, EmptyState, Icon, Photo, Pill, Txt } from '@/components/ui';
import { productById } from '@/lib/data';
import { Order, useStore } from '@/lib/store';
import { C, money, R } from '@/lib/theme';

const isLive = (o: Order) => Date.now() - new Date(o.placedAt).getTime() < 3 * 3600e3;

export default function Orders() {
  const insets = useSafeAreaInsets();
  const { orders, add } = useStore();

  const reorder = (o: Order) => {
    o.lines.forEach((l) => add(l.id, { portion: l.portion, addons: l.addons, qty: l.qty }));
    router.push('/cart');
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={[s.head, { paddingTop: insets.top + 10 }]}><Txt v="h1">Your orders</Txt></View>
      <FlatList
        data={orders}
        keyExtractor={(o) => o.id}
        contentContainerStyle={{ padding: 16, gap: 12, flexGrow: 1 }}
        ListEmptyComponent={<EmptyState icon="receipt-outline" title="Your order history is empty." text="Once you order, you can track it here." action="Explore the menu" onAction={() => router.push('/store')} />}
        renderItem={({ item: o }) => {
          const first = productById(o.lines[0]?.id ?? '');
          const live = isLive(o);
          return (
            <Pressable onPress={() => router.push({ pathname: '/order/[id]', params: { id: o.id } })} style={({ pressed }) => [s.card, pressed && { opacity: 0.9 }]}>
              <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
                <Photo k={first?.photo} style={s.thumb} />
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Txt v="h3">#{o.id}</Txt>
                    {live ? <Pill tone="green" icon="radio-button-on">In progress</Pill> : <Pill tone="muted">Completed</Pill>}
                  </View>
                  <Txt v="small" numberOfLines={1}>{o.lines.map((l) => `${l.qty}× ${productById(l.id)?.name ?? ''}`).join(', ')}</Txt>
                  <Txt v="small">{new Date(o.placedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} · {money(o.total)}</Txt>
                </View>
                <Icon name="chevron-forward" size={18} color={C.muted} />
              </View>
              {!live && <Button title="Reorder" variant="secondary" size="sm" icon="refresh" style={{ marginTop: 12 }} onPress={() => reorder(o)} />}
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const s = StyleSheet.create({
  head: { paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.border },
  card: { backgroundColor: '#fff', borderRadius: R.card, borderWidth: 1, borderColor: C.border, padding: 14 },
  thumb: { width: 60, height: 60, borderRadius: 14, backgroundColor: C.blush },
});
