import { router } from 'expo-router';
import { FlatList, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, EmptyState, Icon, IconButton, Photo, ProductTile, Stepper, SumRow, Txt } from '@/components/ui';
import { productById, products } from '@/lib/data';
import { lineLabel, unitPrice, useStore } from '@/lib/store';
import { C, money, R } from '@/lib/theme';

export default function Cart() {
  const insets = useSafeAreaInsets();
  const { cart, setQty, subtotal, count, address, needsTomorrow } = useStore();
  const close = () => (router.canGoBack() ? router.back() : router.replace('/'));
  const inCart = new Set(cart.map((l) => l.id));
  const upsell = products.filter((p) => ['sides', 'pastries', 'swallow'].includes(p.cat) && !inCart.has(p.id)).slice(0, 8);
  const fee = address?.fee;

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={[s.head, { paddingTop: 14 }]}>
        <IconButton name="close" label="Close basket" onPress={close} />
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Txt v="h3">Your basket</Txt>
          <Txt v="small">B-Lite Food · Hatfield</Txt>
        </View>
        <View style={{ width: 42 }} />
      </View>

      {!cart.length ? (
        <EmptyState icon="bag-handle-outline" title="Your basket is waiting." text="Looks like you haven't added anything delicious yet." action="Browse the menu" onAction={() => router.replace('/store')} />
      ) : (
        <>
          <ScrollView contentContainerStyle={{ paddingBottom: 140 }}>
            {needsTomorrow && (
              <View style={s.notice}>
                <Icon name="time" size={18} color="#8A5300" />
                <Txt v="small" color="#8A5300" style={{ flex: 1 }}>Your basket includes dishes cooked to order, so the earliest delivery is tomorrow.</Txt>
              </View>
            )}
            {cart.map((l) => {
              const p = productById(l.id)!;
              return (
                <View key={l.key} style={s.line}>
                  <Photo k={p.photo} style={s.lineImg} alt={p.name} />
                  <View style={{ flex: 1 }}>
                    <Txt v="label" numberOfLines={2}>{p.name}</Txt>
                    {!!lineLabel(l) && <Txt v="small" numberOfLines={2}>{lineLabel(l)}</Txt>}
                    <Txt v="price" style={{ marginTop: 4 }}>{money(unitPrice(l) * l.qty)}</Txt>
                  </View>
                  <Stepper compact value={l.qty} onChange={(n) => setQty(l.key, n)} />
                </View>
              );
            })}

            {upsell.length > 0 && (
              <View style={{ marginTop: 24 }}>
                <Txt v="h2" style={{ paddingHorizontal: 16, marginBottom: 12 }}>Add something else?</Txt>
                <FlatList horizontal data={upsell} keyExtractor={(p) => p.id} showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }} renderItem={({ item }) => <ProductTile p={item} width={128} />} />
              </View>
            )}

            <View style={s.summary}>
              <SumRow label="Subtotal" value={money(subtotal)} />
              <SumRow label="Delivery" value={fee != null ? money(fee) : 'Set your postcode'} />
              <View style={s.rule} />
              <SumRow label="Total" value={money(subtotal + (fee ?? 0))} bold />
            </View>
          </ScrollView>
          <View style={[s.bar, { paddingBottom: Math.max(insets.bottom, 14) }]}>
            <Button title={`Go to checkout · ${money(subtotal + (fee ?? 0))}`} onPress={() => router.push('/checkout')} />
            <Txt v="small" style={{ textAlign: 'center', marginTop: 8 }}>{count} {count === 1 ? 'item' : 'items'} · Secure payment by Revolut</Txt>
          </View>
        </>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingBottom: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.border },
  notice: { flexDirection: 'row', gap: 8, margin: 16, marginBottom: 4, backgroundColor: C.orangeSoft, padding: 12, borderRadius: 12 },
  line: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.border },
  lineImg: { width: 68, height: 68, borderRadius: 14, backgroundColor: C.blush },
  summary: { margin: 16, marginTop: 28, padding: 16, borderRadius: R.card, backgroundColor: '#fff', borderWidth: 1, borderColor: C.border },
  rule: { height: 1, backgroundColor: C.border, marginVertical: 8 },
  bar: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 16, paddingTop: 12, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: C.border },
});
