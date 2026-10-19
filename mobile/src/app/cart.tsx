import { router } from 'expo-router';
import { FlatList, Linking, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, EmptyState, Icon, IconButton, Photo, ProductTile, Stepper, SumRow, Txt } from '@/components/ui';
import { business, products } from '@/lib/data';
import { CartLine, lineLabel, lineName, linePhoto, unitPrice, useStore } from '@/lib/store';
import { C, money, R } from '@/lib/theme';

export default function Cart() {
  const insets = useSafeAreaInsets();
  const { cart, setQty, subtotal, caution, count } = useStore();
  const close = () => (router.canGoBack() ? router.back() : router.replace('/'));
  const inCart = new Set(cart.map((l) => l.id));
  const upsell = products.filter((p) => p.featured && p.available && !inCart.has(p.id)).slice(0, 8);
  // Lines whose dish or item has since come off the website are dropped from the basket.
  const lines = cart.filter((l) => !!lineName(l));

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={[s.head, { paddingTop: 14 }]}>
        <IconButton name="close" label="Close basket" onPress={close} />
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Txt v="h3">Your basket</Txt>
          <Txt v="small">B-Lite Food</Txt>
        </View>
        <View style={{ width: 42 }} />
      </View>

      {!lines.length ? (
        <EmptyState icon="bag-handle-outline" title="Your basket is waiting." text="Looks like you haven't added anything delicious yet." action="Browse the menu" onAction={() => router.replace('/store')} />
      ) : (
        <>
          <ScrollView contentContainerStyle={{ paddingBottom: 150 }}>
            <View style={s.notice}>
              <Icon name="time" size={18} color="#8A5300" />
              <Txt v="small" color="#8A5300" style={{ flex: 1 }}>Everything is cooked fresh to order — you’ll choose a delivery or pickup time at least 24 hours ahead.</Txt>
            </View>
            {lines.map((l) => (
              <View key={l.key} style={s.line}>
                <Photo k={linePhoto(l)} style={s.lineImg} alt={lineName(l)} fallback={l.kind === 'equipment' ? 'eq-chafing' : 'rice'} />
                <View style={{ flex: 1 }}>
                  <Txt v="label" numberOfLines={2}>{lineName(l)}</Txt>
                  {!!lineLabel(l) && <Txt v="small" numberOfLines={2}>{lineLabel(l)}</Txt>}
                  <Txt v="price" style={{ marginTop: 4 }}>{money(unitPrice(l) * l.qty)}</Txt>
                </View>
                <Stepper compact value={l.qty} onChange={(n) => setQty(l.key, n)} />
              </View>
            ))}

            {upsell.length > 0 && (
              <View style={{ marginTop: 24 }}>
                <Txt v="h2" style={{ paddingHorizontal: 16, marginBottom: 12 }}>Add something else?</Txt>
                <FlatList horizontal data={upsell} keyExtractor={(p) => p.id} showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }} renderItem={({ item }) => <ProductTile p={item} width={128} />} />
              </View>
            )}

            <View style={s.summary}>
              <SumRow label="Subtotal" value={money(subtotal)} />
              {caution > 0 && <SumRow label="Refundable caution fee" value={money(caution)} />}
              <SumRow label="Delivery" value="At checkout" />
              <View style={s.rule} />
              <SumRow label="Total so far" value={money(subtotal + caution)} bold />
            </View>
          </ScrollView>
          <View style={[s.bar, { paddingBottom: Math.max(insets.bottom, 14) }]}>
            {business.offline ? (
              <>
                <Button title="Send order on WhatsApp" icon="logo-whatsapp" onPress={() => Linking.openURL(whatsappOrderUrl(lines, subtotal + caution))} />
                {!!business.phoneHref && <Button title="Call to order" variant="ghost" size="md" icon="call-outline" style={{ marginTop: 8 }} onPress={() => Linking.openURL(business.phoneHref)} />}
              </>
            ) : (
              <>
                <Button title={business.checkoutOpen ? 'Go to checkout' : 'Checkout paused'} disabled={!business.checkoutOpen} onPress={() => router.push('/checkout')} />
                <Txt v="small" style={{ textAlign: 'center', marginTop: 8 }}>{count} {count === 1 ? 'item' : 'items'} · Pay by bank transfer</Txt>
              </>
            )}
          </View>
        </>
      )}
    </View>
  );
}

/** WhatsApp link with the basket written out, for ordering while in-app checkout is unavailable. */
function whatsappOrderUrl(lines: CartLine[], total: number) {
  const text = [
    'Hello B-Lite, I would like to order:',
    ...lines.map((l) => `• ${l.qty} × ${lineName(l)}${lineLabel(l) ? ` (${lineLabel(l)})` : ''} — ${money(unitPrice(l) * l.qty)}`),
    `Total before delivery: ${money(total)}`,
  ].join('\n');
  const base = business.whatsapp || 'https://wa.me/';
  return `${base}${base.includes('?') ? '&' : '?'}text=${encodeURIComponent(text)}`;
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
