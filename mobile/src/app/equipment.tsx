import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Icon, IconButton, Photo, Stepper, Txt } from '@/components/ui';
import { equipment, normalisePostcode } from '@/lib/data';
import { C, F, money, R, shadow } from '@/lib/theme';

/** Rental request — kept separate from the food basket (inventory, not immediate consumption).
 *  Live prices are per hire; stock levels aren't published yet, so availability is confirmed with the quote. */
export default function EquipmentHire() {
  const insets = useSafeAreaInsets();
  const [items, setItems] = useState<Record<string, number>>({});
  const [days, setDays] = useState(1);
  const [postcode, setPostcode] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState<string | null>(null);
  const chosen = equipment.filter((e) => items[e.id]);
  const itemCount = chosen.reduce((n, e) => n + items[e.id], 0);
  const total = chosen.reduce((s, e) => s + e.price * items[e.id], 0);
  const set = (id: string, n: number) => setItems((x) => ({ ...x, [id]: Math.max(0, Math.min(n, 99)) }));

  if (sent) {
    return (
      <View style={[s.done, { paddingTop: insets.top + 60 }]}>
        <Animated.View entering={ZoomIn.springify().damping(12)} style={s.doneIcon}><Icon name="checkmark" size={40} color="#fff" /></Animated.View>
        <Txt v="h1" style={{ textAlign: 'center' }}>Request sent</Txt>
        <Txt style={{ textAlign: 'center', marginTop: 8 }}>Reference {sent}. We’ll confirm availability for your dates and email a quote shortly.</Txt>
        <Button title="Need food too? Book catering" variant="secondary" style={{ alignSelf: 'stretch', marginTop: 28 }} onPress={() => router.replace('/catering')} />
        <Button title="Back to home" style={{ alignSelf: 'stretch', marginTop: 10 }} onPress={() => router.replace('/')} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <ScrollView contentContainerStyle={{ paddingBottom: chosen.length ? 230 : 40 }} keyboardShouldPersistTaps="handled">
        <View style={[s.hero, { paddingTop: insets.top + 8 }]}>
          <Photo k="hire/hero" style={StyleSheet.absoluteFill} />
          <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(25,25,25,0.45)' }]} />
          <IconButton name="arrow-back" label="Back" onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} />
          <Txt v="eyebrow" color="#FFD3D9" style={{ marginTop: 56 }}>Equipment hire</Txt>
          <Txt v="hero" color="#fff" style={{ marginTop: 6, maxWidth: '80%' }}>Everything to serve the occasion.</Txt>
        </View>

        <View style={s.daysRow}>
          <Icon name="calendar-outline" size={20} color={C.red} />
          <Txt v="label" style={{ flex: 1 }}>How long do you need it?</Txt>
          <Stepper compact min={1} value={days} onChange={(n) => setDays(Math.max(1, Math.min(14, n)))} />
          <Txt v="small" style={{ width: 40 }}>{days === 1 ? 'day' : 'days'}</Txt>
        </View>

        {equipment.map((e) => (
          <View key={e.id} style={s.row}>
            <Photo k={e.photo} style={s.img} alt={e.name} />
            <View style={{ flex: 1 }}>
              <Txt v="h3">{e.name}</Txt>
              <Txt v="small" numberOfLines={2}>{e.desc}</Txt>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
                <Txt v="price">{money(e.price)}<Txt v="small">{e.per ? ' per ' + e.per.replace('20 pieces', 'pack of 20') : ' each'}</Txt></Txt>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
                <Txt v="small" style={{ fontFamily: F.semibold }}>{e.group}</Txt>
                {items[e.id] ? <Stepper compact value={items[e.id]} onChange={(n) => set(e.id, n)} /> : <Button title="Add" size="sm" variant="secondary" icon="add" onPress={() => set(e.id, 1)} />}
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      {chosen.length > 0 && (
        <Animated.View entering={FadeInDown} style={[s.sheet, { paddingBottom: Math.max(insets.bottom, 14) }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
            <Txt v="label">{itemCount} {itemCount === 1 ? 'item' : 'items'} · {days} {days === 1 ? 'day' : 'days'}</Txt>
            <Txt v="h3">Est. {money(total)}</Txt>
          </View>
          <TextInput value={postcode} onChangeText={(v) => { setPostcode(v.toUpperCase()); setError(''); }} placeholder="Delivery postcode" placeholderTextColor="#B5ADA8" autoCapitalize="characters" style={s.input} />
          {!!error && <Txt v="small" color="#B0101F" style={{ marginTop: 6 }}>{error}</Txt>}
          <Button
            title="Check availability & get quote"
            style={{ marginTop: 10 }}
            onPress={() => {
              if (!normalisePostcode(postcode)) return setError('Enter a valid UK postcode.');
              // PRODUCTION: POST /api/rentals → availability check against reservations for the date range.
              setSent('RNT-' + Math.floor(300 + Math.random() * 600));
            }}
          />
        </Animated.View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  hero: { backgroundColor: C.dark, paddingHorizontal: 16, paddingBottom: 26, borderBottomLeftRadius: 28, borderBottomRightRadius: 28, overflow: 'hidden' },
  daysRow: { flexDirection: 'row', alignItems: 'center', gap: 10, margin: 16, padding: 12, borderRadius: R.card, backgroundColor: '#fff', borderWidth: 1, borderColor: C.border },
  row: { flexDirection: 'row', gap: 14, paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.border },
  img: { width: 96, height: 96, borderRadius: R.img, backgroundColor: '#F4EFEB' },
  sheet: { position: 'absolute', left: 0, right: 0, bottom: 0, padding: 16, backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, ...shadow.md },
  input: { height: 50, borderRadius: R.input, borderWidth: 1.5, borderColor: C.border, paddingHorizontal: 14, fontFamily: F.semibold, fontSize: 15, color: C.dark },
  done: { flex: 1, backgroundColor: C.bg, alignItems: 'center', paddingHorizontal: 28 },
  doneIcon: { width: 84, height: 84, borderRadius: 42, backgroundColor: C.red, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
});
