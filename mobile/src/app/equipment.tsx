import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BasketBar, Button, Icon, IconButton, Photo, Stepper, tap, Txt } from '@/components/ui';
import { business, equipment, toApiDate } from '@/lib/data';
import { useStore } from '@/lib/store';
import { C, F, money, R } from '@/lib/theme';

/** Hire start dates: tomorrow onwards (the website allows up to 150 days ahead). */
function startDays() {
  const out: Date[] = [];
  for (let i = 1; out.length < 21; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    out.push(d);
  }
  return out;
}

/** Equipment hire, booked into the same basket and order as food — as on the website. */
export default function EquipmentHire() {
  const insets = useSafeAreaInsets();
  const { cart, hire, setQty } = useStore();
  const [days] = useState(startDays);
  const [start, setStart] = useState(toApiDate(days[0]));
  const [length, setLength] = useState(1);
  const maxDays = business.maxRentalDays || 4;

  const inCart = (id: string) => cart.find((l) => l.kind === 'equipment' && l.id === id);
  const setItem = (id: string, qty: number) => {
    const line = inCart(id);
    if (qty <= 0) {
      if (line) setQty(line.key, 0);
      return;
    }
    hire(id, { start, days: length, qty });
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        <View style={[s.hero, { paddingTop: insets.top + 8 }]}>
          <Photo k={equipment[0]?.photo} style={StyleSheet.absoluteFill} fallback="eq-chafing" />
          <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(25,25,25,0.5)' }]} />
          <IconButton name="arrow-back" label="Back" onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} />
          <Txt v="eyebrow" color="#FFD3D9" style={{ marginTop: 56 }}>Equipment hire</Txt>
          <Txt v="hero" color="#fff" style={{ marginTop: 6, maxWidth: '80%' }}>Everything to serve the occasion.</Txt>
        </View>

        <View style={s.panel}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Icon name="calendar-outline" size={20} color={C.red} />
            <Txt v="label" style={{ flex: 1 }}>Hire starts</Txt>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingTop: 10 }}>
            {days.map((d) => {
              const v = toApiDate(d);
              return (
                <Pressable key={v} onPress={() => { tap(); setStart(v); }} style={[s.chip, start === v && s.chipOn]}>
                  <Text style={[s.chipText, start === v && { color: '#fff' }]}>{d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 14 }}>
            <Icon name="time-outline" size={20} color={C.red} />
            <Txt v="label" style={{ flex: 1 }}>How long?</Txt>
            <Stepper compact min={1} value={length} onChange={(n) => setLength(Math.max(1, Math.min(maxDays, n)))} />
            <Txt v="small" style={{ width: 40 }}>{length === 1 ? 'day' : 'days'}</Txt>
          </View>
          <Txt v="small" style={{ marginTop: 10 }}>Up to {maxDays} days. A refundable caution fee per booked item is added at checkout.</Txt>
        </View>

        {equipment.map((e) => {
          const line = inCart(e.id);
          return (
            <View key={e.id} style={s.row}>
              <Photo k={e.photo} style={s.img} alt={e.name} fallback="eq-chafing" />
              <View style={{ flex: 1 }}>
                <Txt v="h3">{e.name}</Txt>
                {!!e.group && <Txt v="small">{e.group}</Txt>}
                <Txt v="small" numberOfLines={2}>{e.desc}</Txt>
                <Txt v="price" style={{ marginTop: 6 }}>{money(e.price)}<Txt v="small"> per day · caution {money(e.caution)} per booking</Txt></Txt>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginTop: 8 }}>
                  {!e.bookable ? (
                    <Button title="Chat to book" size="sm" variant="ghost" icon="chatbubbles-outline" onPress={() => WebBrowser.openBrowserAsync(business.chatUrl)} />
                  ) : line ? (
                    <Stepper compact value={line.qty} onChange={(n) => setItem(e.id, n)} />
                  ) : (
                    <Button title="Add" size="sm" variant="secondary" icon="add" onPress={() => setItem(e.id, 1)} />
                  )}
                </View>
                {line && (line.start !== start || line.days !== length) && (
                  <Txt v="small" color={C.red} style={{ marginTop: 4, textAlign: 'right' }} onPress={() => hire(e.id, { start, days: length, qty: line.qty })}>
                    Booked for {line.days} {line.days === 1 ? 'day' : 'days'} from {line.start} · tap to use these dates
                  </Txt>
                )}
              </View>
            </View>
          );
        })}
        {equipment.length === 0 && <Txt style={{ textAlign: 'center', padding: 24 }}>No equipment is listed right now.</Txt>}
      </ScrollView>
      <BasketBar />
    </View>
  );
}

const s = StyleSheet.create({
  hero: { backgroundColor: C.dark, paddingHorizontal: 16, paddingBottom: 26, borderBottomLeftRadius: 28, borderBottomRightRadius: 28, overflow: 'hidden' },
  panel: { margin: 16, padding: 14, borderRadius: R.card, backgroundColor: '#fff', borderWidth: 1, borderColor: C.border },
  chip: { paddingHorizontal: 14, height: 38, borderRadius: 19, borderWidth: 1.5, borderColor: C.border, justifyContent: 'center', backgroundColor: '#fff' },
  chipOn: { backgroundColor: C.red, borderColor: C.red },
  chipText: { fontFamily: F.semibold, fontSize: 14, color: C.dark },
  row: { flexDirection: 'row', gap: 14, paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.border },
  img: { width: 96, height: 96, borderRadius: R.img, backgroundColor: '#F4EFEB' },
});
