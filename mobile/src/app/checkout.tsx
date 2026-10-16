import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Card, EmptyState, Icon, IconButton, SumRow, tap, Txt } from '@/components/ui';
import { api, ApiError, ApiOrder, ApiQuote } from '@/lib/api';
import { business, earliestSlot, toApiDateTime } from '@/lib/data';
import { toBasketItems, useStore } from '@/lib/store';
import { C, F, money, R } from '@/lib/theme';

/** Times offered for delivery or pickup, every 30 minutes. */
const SLOTS: string[] = [];
for (let h = 8; h <= 20; h++) for (const m of [0, 30]) if (!(h === 20 && m)) SLOTS.push(`${String(h).padStart(2, '0')}:${m ? '30' : '00'}`);

/** Fourteen days starting from the first day with a bookable slot (orders need 24 hours' notice). */
function dayList() {
  const first = earliestSlot();
  const out: Date[] = [];
  for (let i = 0; out.length < 14; i++) {
    const d = new Date(first.getFullYear(), first.getMonth(), first.getDate() + i, 12);
    out.push(d);
  }
  return out;
}
const dayLabel = (d: Date) => {
  const diff = Math.round((new Date(d.toDateString()).getTime() - new Date(new Date().toDateString()).getTime()) / 864e5);
  return diff === 1 ? 'Tomorrow' : d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
};
const at = (day: Date, slot: string) => new Date(day.getFullYear(), day.getMonth(), day.getDate(), +slot.slice(0, 2), +slot.slice(3));

export default function Checkout() {
  const insets = useSafeAreaInsets();
  const { cart, address, user, phone: savedPhone, setPhone: savePhone, clearCart, refreshOrders, setOrders, orders } = useStore();
  const [type, setType] = useState<'delivery' | 'pickup'>('delivery');
  const [days] = useState(dayList);
  const [day, setDay] = useState(days[0].toDateString());
  const [slot, setSlot] = useState<string | null>(null);
  const [phone, setPhone] = useState(savedPhone);
  const [notes, setNotes] = useState('');
  const [couponInput, setCouponInput] = useState('');
  const [coupon, setCoupon] = useState('');
  const [quote, setQuote] = useState<ApiQuote | null>(null);
  const [quoteError, setQuoteError] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const items = useMemo(() => toBasketItems(cart), [cart]);

  // Prices always come from the website so the app charges exactly what the site would.
  useEffect(() => {
    if (!items.length) return;
    let live = true;
    api<ApiQuote>('/quote', {
      method: 'POST',
      body: { items, order_type: type, county_id: address?.countyId, area_id: address?.areaId, coupon: coupon || undefined },
    })
      .then((q) => {
        if (!live) return;
        setQuote(q);
        setQuoteError('');
      })
      .catch((e) => live && setQuoteError(e instanceof ApiError ? e.message : 'Could not price your basket.'));
    return () => {
      live = false;
    };
  }, [items, type, address?.countyId, address?.areaId, coupon]);

  if (!cart.length) {
    return (
      <View style={{ flex: 1, paddingTop: insets.top + 40, backgroundColor: C.bg }}>
        <EmptyState icon="bag-handle-outline" title="Your basket is empty." text="Add something delicious first." action="Browse the menu" onAction={() => router.replace('/store')} />
      </View>
    );
  }
  if (!user) {
    return (
      <View style={{ flex: 1, paddingTop: insets.top + 40, backgroundColor: C.bg }}>
        <EmptyState icon="person-circle-outline" title="Sign in to order" text="Use your blitefood.co.uk account, or create one in a minute. Your basket is saved." action="Sign in" onAction={() => router.push('/login')} />
        <Button title="Create an account" variant="ghost" style={{ marginHorizontal: 32 }} onPress={() => router.push('/register')} />
      </View>
    );
  }

  const selectedDay = days.find((d) => d.toDateString() === day) ?? days[0];
  const min = earliestSlot();
  const slotPast = (t: string) => at(selectedDay, t).getTime() < min.getTime();
  const total = quote?.total ?? 0;

  const place = async () => {
    setError(null);
    if (!business.checkoutOpen) return setError('Checkout is paused right now. Orders will resume soon — your basket is saved.');
    if (type === 'delivery' && !address) return setError('Add a delivery address first.');
    if (!slot || slotPast(slot)) return setError(`Choose a ${type === 'pickup' ? 'pickup' : 'delivery'} time at least 24 hours from now.`);
    if (!/^(\+?44|0)\d{9,10}$/.test(phone.replace(/[\s()-]/g, ''))) return setError('Add a UK phone number so we can reach you.');
    setBusy(true);
    try {
      const order = await api<ApiOrder>('/orders', {
        method: 'POST',
        body: {
          items,
          order_type: type,
          county_id: type === 'delivery' ? address?.countyId : undefined,
          area_id: type === 'delivery' ? address?.areaId : undefined,
          address: type === 'delivery' ? address?.line1 : undefined,
          city: type === 'delivery' ? address?.city : undefined,
          zip_code: type === 'delivery' ? address?.postcode : undefined,
          phone_number: phone.trim(),
          note: notes.trim() || undefined,
          delivery_date: toApiDateTime(at(selectedDay, slot)),
          coupon: coupon || undefined,
          payment_method: 'transfer',
        },
      });
      savePhone(phone.trim());
      clearCart();
      setOrders([order, ...orders]);
      refreshOrders().catch(() => {});
      router.dismissAll();
      router.push({ pathname: '/order/[id]', params: { id: order.reference, fresh: '1' } });
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'We couldn’t place your order. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={[s.head, { paddingTop: insets.top + 6 }]}>
        <IconButton name="arrow-back" label="Back" onPress={() => router.back()} />
        <Txt v="h3" style={{ flex: 1, textAlign: 'center' }}>Checkout</Txt>
        <View style={{ width: 42 }} />
      </View>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 170, gap: 14 }} keyboardShouldPersistTaps="handled">
        {!business.checkoutOpen && (
          <View style={s.warn}><Icon name="time" size={18} color="#8A5300" /><Txt v="small" color="#8A5300" style={{ flex: 1 }}>Checkout is paused right now. Orders will resume soon — your basket is saved.</Txt></View>
        )}

        {/* Delivery / pickup */}
        <View style={s.segment}>
          {(['delivery', 'pickup'] as const).map((t) => (
            <Pressable key={t} onPress={() => { tap(); setType(t); }} style={[s.segBtn, type === t && s.segOn]} accessibilityRole="tab" accessibilityState={{ selected: type === t }}>
              <Icon name={t === 'delivery' ? 'bicycle' : 'storefront'} size={17} color={type === t ? C.dark : C.muted} />
              <Text style={[s.segText, type === t && { color: C.dark }]}>{t === 'delivery' ? 'Delivery' : 'Pickup'}</Text>
            </Pressable>
          ))}
        </View>

        {type === 'delivery' ? (
          <Card>
            <Pressable onPress={() => router.push('/address')} style={s.rowLine}>
              <View style={s.ico}><Icon name="location" size={20} color={C.red} /></View>
              <View style={{ flex: 1 }}>
                <Txt v="label">{address ? `${address.line1}, ${address.postcode}` : 'Add delivery address'}</Txt>
                <Txt v="small">{address ? `${address.area}, ${address.county}${address.eta ? ' · ' + address.eta : ''}` : 'Choose your county and area'}</Txt>
              </View>
              <Icon name="chevron-forward" size={18} color={C.muted} />
            </Pressable>
          </Card>
        ) : (
          <Card>
            <View style={s.rowLine}>
              <View style={s.ico}><Icon name="storefront" size={20} color={C.red} /></View>
              <View style={{ flex: 1 }}>
                <Txt v="label">Collect from B-Lite Food</Txt>
                <Txt v="small">{business.pickupLocation || business.address}</Txt>
                {!!business.pickupTime && <Txt v="small">{business.pickupTime}</Txt>}
              </View>
            </View>
          </Card>
        )}

        {/* When */}
        <Card>
          <Txt v="h3">{type === 'pickup' ? 'Pickup' : 'Delivery'} date &amp; time</Txt>
          <Txt v="small" style={{ marginTop: 2 }}>Food is cooked to order — choose a time at least 24 hours from now.</Txt>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingTop: 14 }}>
            {days.map((d) => (
              <Pressable key={d.toDateString()} onPress={() => { tap(); setDay(d.toDateString()); setSlot(null); }} style={[s.chip, day === d.toDateString() && s.chipOn]}>
                <Text style={[s.chipText, day === d.toDateString() && { color: '#fff' }]}>{dayLabel(d)}</Text>
              </Pressable>
            ))}
          </ScrollView>
          <View style={s.slots}>
            {SLOTS.map((t) => (
              <Pressable key={t} disabled={slotPast(t)} onPress={() => { tap(); setSlot(t); }} style={[s.slot, slot === t && s.chipOn, slotPast(t) && { opacity: 0.35 }]}>
                <Text style={[s.chipText, slot === t && { color: '#fff' }]}>{t}</Text>
              </Pressable>
            ))}
          </View>
        </Card>

        {/* Contact */}
        <Card>
          <Txt v="h3" style={{ marginBottom: 10 }}>Phone number</Txt>
          <TextInput value={phone} onChangeText={setPhone} placeholder="07123 456789" placeholderTextColor="#B5ADA8" keyboardType="phone-pad" autoComplete="tel" textContentType="telephoneNumber" style={s.input} />
          <TextInput value={notes} onChangeText={setNotes} placeholder="Order note: allergies, gate code, instructions…" placeholderTextColor="#B5ADA8" multiline maxLength={600} style={s.note} />
        </Card>

        {/* Coupon */}
        <Card>
          <Txt v="h3" style={{ marginBottom: 10 }}>Coupon</Txt>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TextInput value={couponInput} onChangeText={setCouponInput} placeholder="Coupon code" placeholderTextColor="#B5ADA8" autoCapitalize="characters" style={[s.input, { flex: 1 }]} />
            <Button title={coupon && coupon === couponInput.trim() ? 'Remove' : 'Apply'} variant="dark" size="md" style={{ paddingHorizontal: 18, height: 52 }}
              onPress={() => {
                if (coupon && coupon === couponInput.trim()) {
                  setCouponInput('');
                  setCoupon('');
                } else setCoupon(couponInput.trim());
              }} />
          </View>
          {quote?.coupon_valid === false && <Txt v="small" color="#B0101F" style={{ marginTop: 6 }}>That coupon is invalid or has expired.</Txt>}
          {quote?.coupon && <Txt v="small" color={C.green} style={{ marginTop: 6 }}>{quote.coupon.code} applied — {quote.coupon.percent}% off.</Txt>}
        </Card>

        {/* Payment */}
        <Card>
          <Txt v="h3" style={{ marginBottom: 4 }}>Payment</Txt>
          <View style={s.payRow}>
            <View style={s.payIco}><Icon name="business-outline" size={18} /></View>
            <View style={{ flex: 1 }}>
              <Txt v="label">Bank transfer</Txt>
              <Txt v="small">You’ll see our bank details and your reference next.</Txt>
            </View>
            <View style={[s.radio, { borderColor: C.red }]}><View style={s.radioDot} /></View>
          </View>
        </Card>

        {/* Summary */}
        <Card>
          {quote ? (
            <>
              <SumRow label={`Subtotal (${cart.reduce((n, l) => n + l.qty, 0)} items)`} value={money(quote.subtotal)} />
              {quote.caution_fee > 0 && <SumRow label="Refundable caution fee" value={money(quote.caution_fee)} />}
              {quote.discount > 0 && <SumRow label="Discount" value={'−' + money(quote.discount)} />}
              <SumRow label={type === 'pickup' ? 'Pickup' : 'Delivery'} value={type === 'pickup' ? 'Free' : address ? money(quote.delivery_fee) : 'Add address'} />
              <View style={{ height: 1, backgroundColor: C.border, marginVertical: 8 }} />
              <SumRow label="Total" value={money(quote.total)} bold />
            </>
          ) : (
            <Txt v="small">{quoteError || 'Pricing your basket…'}</Txt>
          )}
        </Card>
        {error && (
          <View style={s.error} accessibilityRole="alert">
            <Icon name="alert-circle" size={18} color="#B0101F" />
            <Txt v="small" color="#B0101F" style={{ flex: 1 }}>{error}</Txt>
          </View>
        )}
      </ScrollView>

      <View style={[s.bar, { paddingBottom: Math.max(insets.bottom, 14) }]}>
        <Button title={quote ? `Place order · ${money(total)}` : 'Place order'} loading={busy} disabled={!quote || !business.checkoutOpen} onPress={place} />
        <Txt v="small" style={{ textAlign: 'center', marginTop: 8 }}>By placing your order you agree to our terms and policy.</Txt>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingBottom: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.border, backgroundColor: C.bg },
  warn: { flexDirection: 'row', gap: 8, padding: 12, borderRadius: 12, backgroundColor: C.orangeSoft },
  segment: { flexDirection: 'row', backgroundColor: '#F1ECE8', borderRadius: 14, padding: 4 },
  segBtn: { flex: 1, height: 44, borderRadius: 11, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  segOn: { backgroundColor: '#fff' },
  segText: { fontFamily: F.semibold, fontSize: 15, color: C.muted },
  rowLine: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  ico: { width: 40, height: 40, borderRadius: 12, backgroundColor: C.blush, alignItems: 'center', justifyContent: 'center' },
  note: { marginTop: 12, minHeight: 70, borderRadius: R.input, backgroundColor: '#FAF7F5', paddingHorizontal: 14, paddingTop: 12, fontFamily: F.regular, fontSize: 14, color: C.dark, textAlignVertical: 'top' },
  input: { height: 52, borderRadius: R.input, borderWidth: 1.5, borderColor: C.border, paddingHorizontal: 14, fontFamily: F.semibold, fontSize: 16, color: C.dark },
  chip: { paddingHorizontal: 16, height: 38, borderRadius: 19, borderWidth: 1.5, borderColor: C.border, justifyContent: 'center', backgroundColor: '#fff' },
  chipOn: { backgroundColor: C.red, borderColor: C.red },
  chipText: { fontFamily: F.semibold, fontSize: 14, color: C.dark },
  slots: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingTop: 12 },
  slot: { paddingHorizontal: 12, height: 40, borderRadius: 10, borderWidth: 1.5, borderColor: C.border, justifyContent: 'center', backgroundColor: '#fff' },
  payRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  payIco: { width: 40, height: 28, borderRadius: 6, borderWidth: 1, borderColor: C.border, alignItems: 'center', justifyContent: 'center' },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: '#CFC8C3', alignItems: 'center', justifyContent: 'center' },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: C.red },
  error: { flexDirection: 'row', gap: 8, padding: 12, borderRadius: 12, backgroundColor: '#FFF1F2' },
  bar: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 16, paddingTop: 12, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: C.border },
});
