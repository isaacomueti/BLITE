import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Card, EmptyState, Icon, IconButton, IconName, SumRow, tap, Txt } from '@/components/ui';
import { business, delivery } from '@/lib/data';
import { useStore } from '@/lib/store';
import { C, F, money, R } from '@/lib/theme';

const PAYMENTS: { id: string; label: string; icon: IconName }[] = [
  { id: 'apple', label: 'Apple Pay', icon: 'logo-apple' },
  { id: 'google', label: 'Google Pay', icon: 'logo-google' },
  { id: 'card', label: 'Credit or debit card', icon: 'card-outline' },
  { id: 'revolut', label: 'Revolut Pay', icon: 'wallet-outline' },
];

/** Next four delivery days — deliveries run Monday to Saturday. */
function dayList(startTomorrow: boolean) {
  const out: Date[] = [];
  for (let i = startTomorrow ? 1 : 0; out.length < 4; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    if (d.getDay() !== delivery.noDeliveryDay) out.push(d);
  }
  return out;
}
const dayLabel = (d: Date) => {
  const diff = Math.round((new Date(d.toDateString()).getTime() - new Date(new Date().toDateString()).getTime()) / 864e5);
  return diff === 0 ? 'Today' : diff === 1 ? 'Tomorrow' : d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric' });
};

export default function Checkout() {
  const insets = useSafeAreaInsets();
  const { cart, subtotal, address, needsTomorrow, placeOrder } = useStore();
  const now = new Date();
  const open = now.getHours() >= business.orderHours.open && now.getHours() < business.orderHours.close;
  // Same-day ASAP: quick meals only, Monday–Saturday, ordered before 17:00.
  const canAsap = open && !needsTomorrow && now.getDay() !== delivery.noDeliveryDay && now.getHours() < delivery.asapCutoff;

  const [type, setType] = useState<'delivery' | 'pickup'>('delivery');
  const [when, setWhen] = useState<'asap' | 'schedule'>(canAsap ? 'asap' : 'schedule');
  const days = useMemo(() => dayList(!canAsap), [canAsap]);
  const [day, setDay] = useState(days[0].toDateString());
  const [slot, setSlot] = useState<string | null>(null);
  const [payment, setPayment] = useState('apple');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!cart.length) {
    return (
      <View style={{ flex: 1, paddingTop: insets.top + 40, backgroundColor: C.bg }}>
        <EmptyState icon="bag-handle-outline" title="Your basket is empty." text="Add something delicious first." action="Browse the menu" onAction={() => router.replace('/store')} />
      </View>
    );
  }

  const fee = type === 'pickup' ? 0 : address?.fee ?? 0;
  const total = subtotal + fee;
  const slots: string[] = [];
  for (let h = delivery.firstSlot; h <= delivery.lastSlot; h++) for (const m of [0, 30]) if (!(h === delivery.lastSlot && m)) slots.push(`${String(h).padStart(2, '0')}:${m ? '30' : '00'}`);
  const isToday = day === new Date().toDateString();
  const slotPast = (t: string) => isToday && +t.slice(0, 2) * 60 + +t.slice(3) < now.getHours() * 60 + now.getMinutes() + 60;

  /* PRODUCTION: POST the basket to /api/checkout → server re-prices it and creates a Revolut
     Business order (Merchant API); the app opens its hosted checkout. The order is confirmed
     only by the Revolut order-completed webhook — never by the app. */
  const pay = () => {
    setError(null);
    if (type === 'delivery' && !address) return setError('Add a delivery address first.');
    if (!/^(44|0)\d{9,10}$/.test(phone.replace(/\D/g, ''))) return setError('Add a UK mobile number so the rider can reach you.');
    if (when === 'schedule' && !slot) return setError('Choose a delivery time.');
    setBusy(true);
    setTimeout(() => {
      const due = new Date(when === 'asap' ? Date.now() + (type === 'pickup' ? 30 : 45) * 60000 : day);
      if (when === 'schedule' && slot) due.setHours(+slot.slice(0, 2), +slot.slice(3), 0, 0);
      const order = placeOrder({ dueAt: due.toISOString(), type, fee, address: type === 'delivery' ? address ?? undefined : undefined, notes, payment });
      // Drop checkout and the basket modal from history so "back" from tracking goes home.
      router.dismissAll();
      router.push({ pathname: '/order/[id]', params: { id: order.id, fresh: '1' } });
    }, 900);
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={[s.head, { paddingTop: insets.top + 6 }]}>
        <IconButton name="arrow-back" label="Back" onPress={() => router.back()} />
        <Txt v="h3" style={{ flex: 1, textAlign: 'center' }}>Checkout</Txt>
        <View style={{ width: 42 }} />
      </View>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 150, gap: 14 }} keyboardShouldPersistTaps="handled">
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
                <Txt v="small">{address ? `Estimated ${address.eta} · ${money(address.fee)} delivery` : 'We check your postcode first'}</Txt>
              </View>
              <Icon name="chevron-forward" size={18} color={C.muted} />
            </Pressable>
            <TextInput value={notes} onChangeText={setNotes} placeholder="Note for the rider (flat number, gate code…)" placeholderTextColor="#B5ADA8" style={s.note} />
          </Card>
        ) : (
          <Card>
            <View style={s.rowLine}>
              <View style={s.ico}><Icon name="storefront" size={20} color={C.red} /></View>
              <View style={{ flex: 1 }}><Txt v="label">Collect from B-Lite Food</Txt><Txt v="small">{business.address}</Txt></View>
            </View>
          </Card>
        )}

        {/* When */}
        <Card>
          <Txt v="h3" style={{ marginBottom: 10 }}>When?</Txt>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Choice on={when === 'asap'} disabled={!canAsap} title="As soon as possible" sub={canAsap ? (type === 'pickup' ? 'Ready in ~30 min' : address?.eta ?? '30–50 min') : needsTomorrow ? 'Cooked to order — from tomorrow' : 'Same-day delivery closed'} onPress={() => setWhen('asap')} />
            <Choice on={when === 'schedule'} title="Schedule" sub={slot ? `${dayLabel(new Date(day))}, ${slot}` : 'Pick a time'} onPress={() => setWhen('schedule')} />
          </View>
          {when === 'schedule' && (
            <>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingTop: 14 }}>
                {days.map((d) => (
                  <Pressable key={d.toDateString()} onPress={() => { tap(); setDay(d.toDateString()); setSlot(null); }} style={[s.chip, day === d.toDateString() && s.chipOn]}>
                    <Text style={[s.chipText, day === d.toDateString() && { color: '#fff' }]}>{dayLabel(d)}</Text>
                  </Pressable>
                ))}
              </ScrollView>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingTop: 10 }}>
                {slots.map((t) => (
                  <Pressable key={t} disabled={slotPast(t)} onPress={() => { tap(); setSlot(t); }} style={[s.slot, slot === t && s.chipOn, slotPast(t) && { opacity: 0.35 }]}>
                    <Text style={[s.chipText, slot === t && { color: '#fff' }]}>{t}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </>
          )}
        </Card>

        {/* Contact */}
        <Card>
          <Txt v="h3" style={{ marginBottom: 10 }}>Mobile number</Txt>
          <TextInput value={phone} onChangeText={setPhone} placeholder="07123 456789" placeholderTextColor="#B5ADA8" keyboardType="phone-pad" autoComplete="tel" textContentType="telephoneNumber" style={s.input} />
          <Txt v="small" style={{ marginTop: 6 }}>For order updates by text and the rider.</Txt>
        </Card>

        {/* Payment */}
        <Card>
          <Txt v="h3" style={{ marginBottom: 4 }}>Payment</Txt>
          {PAYMENTS.map((pm) => (
            <Pressable key={pm.id} onPress={() => { tap(); setPayment(pm.id); }} style={s.payRow} accessibilityRole="radio" accessibilityState={{ checked: payment === pm.id }}>
              <View style={s.payIco}><Icon name={pm.icon} size={18} /></View>
              <Txt v="label" style={{ flex: 1, fontFamily: payment === pm.id ? F.semibold : F.regular }}>{pm.label}</Txt>
              <View style={[s.radio, payment === pm.id && { borderColor: C.red }]}>{payment === pm.id && <View style={s.radioDot} />}</View>
            </Pressable>
          ))}
          <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center', marginTop: 10 }}>
            <Icon name="lock-closed" size={13} color={C.muted} />
            <Txt v="small">Payments are processed securely by Revolut.</Txt>
          </View>
        </Card>

        {/* Summary */}
        <Card>
          <SumRow label={`Subtotal (${cart.reduce((n, l) => n + l.qty, 0)} items)`} value={money(subtotal)} />
          <SumRow label={type === 'pickup' ? 'Pickup' : 'Delivery'} value={fee ? money(fee) : 'Free'} />
          <View style={{ height: 1, backgroundColor: C.border, marginVertical: 8 }} />
          <SumRow label="Total" value={money(total)} bold />
        </Card>
        {error && (
          <View style={s.error} accessibilityRole="alert">
            <Icon name="alert-circle" size={18} color="#B0101F" />
            <Txt v="small" color="#B0101F" style={{ flex: 1 }}>{error}</Txt>
          </View>
        )}
      </ScrollView>

      <View style={[s.bar, { paddingBottom: Math.max(insets.bottom, 14) }]}>
        <Button title={`Place order · ${money(total)}`} loading={busy} onPress={pay} />
        <Txt v="small" style={{ textAlign: 'center', marginTop: 8 }}>By placing your order you agree to our terms and refund policy.</Txt>
      </View>
    </View>
  );
}

function Choice({ on, title, sub, onPress, disabled }: { on: boolean; title: string; sub: string; onPress: () => void; disabled?: boolean }) {
  return (
    <Pressable disabled={disabled} onPress={() => { tap(); onPress(); }} style={[s.choice, on && s.choiceOn, disabled && { opacity: 0.45 }]} accessibilityRole="radio" accessibilityState={{ checked: on, disabled }}>
      <Txt v="label">{title}</Txt>
      <Txt v="small" numberOfLines={2}>{sub}</Txt>
    </Pressable>
  );
}

const s = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingBottom: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.border, backgroundColor: C.bg },
  segment: { flexDirection: 'row', backgroundColor: '#F1ECE8', borderRadius: 14, padding: 4 },
  segBtn: { flex: 1, height: 44, borderRadius: 11, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  segOn: { backgroundColor: '#fff' },
  segText: { fontFamily: F.semibold, fontSize: 15, color: C.muted },
  rowLine: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  ico: { width: 40, height: 40, borderRadius: 12, backgroundColor: C.blush, alignItems: 'center', justifyContent: 'center' },
  note: { marginTop: 12, height: 46, borderRadius: R.input, backgroundColor: '#FAF7F5', paddingHorizontal: 14, fontFamily: F.regular, fontSize: 14, color: C.dark },
  input: { height: 52, borderRadius: R.input, borderWidth: 1.5, borderColor: C.border, paddingHorizontal: 14, fontFamily: F.semibold, fontSize: 16, color: C.dark },
  choice: { flex: 1, borderRadius: 14, borderWidth: 1.5, borderColor: C.border, padding: 12, gap: 2 },
  choiceOn: { borderColor: C.red, backgroundColor: '#FFF8F8' },
  chip: { paddingHorizontal: 16, height: 38, borderRadius: 19, borderWidth: 1.5, borderColor: C.border, justifyContent: 'center', backgroundColor: '#fff' },
  chipOn: { backgroundColor: C.red, borderColor: C.red },
  chipText: { fontFamily: F.semibold, fontSize: 14, color: C.dark },
  slot: { paddingHorizontal: 14, height: 40, borderRadius: 10, borderWidth: 1.5, borderColor: C.border, justifyContent: 'center', backgroundColor: '#fff' },
  payRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.border },
  payIco: { width: 40, height: 28, borderRadius: 6, borderWidth: 1, borderColor: C.border, alignItems: 'center', justifyContent: 'center' },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: '#CFC8C3', alignItems: 'center', justifyContent: 'center' },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: C.red },
  error: { flexDirection: 'row', gap: 8, padding: 12, borderRadius: 12, backgroundColor: '#FFF1F2' },
  bar: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 16, paddingTop: 12, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: C.border },
});
