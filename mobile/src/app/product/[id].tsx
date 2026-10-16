import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, EmptyState, Icon, IconButton, Photo, Pill, Stepper, tap, Txt } from '@/components/ui';
import { allergenNames, categoryName, productById } from '@/lib/data';
import { unitPrice, useStore } from '@/lib/store';
import { C, F, money, R } from '@/lib/theme';

export default function ProductSheet() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const p = productById(id);
  const insets = useSafeAreaInsets();
  const { add, favs, toggleFav } = useStore();
  const [portion, setPortion] = useState(p?.portions[0].id ?? '');
  const [addons, setAddons] = useState<string[]>([]);
  const [qty, setQty] = useState(1);

  if (!p) {
    return (
      <View style={{ flex: 1, paddingTop: insets.top + 40, backgroundColor: C.bg }}>
        <EmptyState icon="search" title="We couldn't find that dish." text="It may have come off the menu." action="Back to the menu" onAction={() => router.replace('/store')} />
      </View>
    );
  }

  const unit = unitPrice({ id: p.id, portion, addons });
  const fav = favs.includes(p.id);
  const close = () => (router.canGoBack() ? router.back() : router.replace('/store'));

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 140 }} showsVerticalScrollIndicator={false}>
        <View style={s.hero}>
          <Photo k={p.photo} style={s.heroPhoto} alt={p.name} />
          <View style={[s.heroBtns, { top: 14 }]}>
            <IconButton name="close" label="Close" onPress={close} />
            <IconButton name={fav ? 'heart' : 'heart-outline'} color={fav ? C.red : C.dark} label={fav ? 'Remove from favourites' : 'Save to favourites'} onPress={() => { tap(); toggleFav(p.id); }} />
          </View>
        </View>

        <View style={{ padding: 20 }}>
          <View style={{ flexDirection: 'row', gap: 6, marginBottom: 10 }}>
            {p.quick ? <Pill tone="green" icon="flash">Same-day delivery</Pill> : <Pill tone="orange" icon="time">Cooked to order · from tomorrow</Pill>}
            {!!p.prep && <Pill tone="muted" icon="hourglass-outline">{`Prep ${p.prep}`}</Pill>}
          </View>
          <Txt v="h1">{p.name}</Txt>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 6 }}>
            <Txt v="price" style={{ fontSize: 20 }}>{p.portions.length > 1 ? 'from ' : ''}{money(p.price)}</Txt>
            <Txt v="small">{categoryName(p.cat)}</Txt>
          </View>
          <Txt style={{ marginTop: 12 }}>{p.long ?? p.desc}</Txt>

          <View style={s.allergen}>
            <Icon name="information-circle" size={20} color="#6E4300" />
            <Txt v="small" color="#6E4300" style={{ flex: 1 }}>
              <Txt v="small" color="#6E4300" style={{ fontFamily: F.bold }}>Allergens. </Txt>
              {p.allergens === null
                ? 'Please tell us about any allergy or intolerance before you order — we’ll confirm what’s in this dish. '
                : p.allergens.length
                  ? 'Contains: ' + p.allergens.map((a) => allergenNames[a]).join(', ') + '. '
                  : 'No major allergens as an ingredient. '}
              Prepared in a kitchen that handles all 14 allergens.
            </Txt>
          </View>

          {p.portions.length > 1 && (
            <View style={s.group}>
              <View style={s.groupHead}><Txt v="h3">Choose your portion</Txt><Pill tone="muted">Required</Pill></View>
              {p.portions.map((o) => {
                const on = portion === o.id;
                return (
                  <Pressable key={o.id} accessibilityRole="radio" accessibilityState={{ checked: on }} onPress={() => { tap(); setPortion(o.id); }} style={s.opt}>
                    <View style={[s.radio, on && s.radioOn]}>{on && <View style={s.radioDot} />}</View>
                    <Txt v="label" style={{ flex: 1, fontFamily: on ? F.semibold : F.regular }}>{o.name}</Txt>
                    <Txt v="label" color={C.dark}>{money(o.price)}</Txt>
                  </Pressable>
                );
              })}
            </View>
          )}

          {p.addons.length > 0 && (
            <View style={s.group}>
              <View style={s.groupHead}><Txt v="h3">Add-ons</Txt><Pill tone="muted">Optional</Pill></View>
              {p.addons.map((a) => {
                const on = addons.includes(a.id);
                return (
                  <Pressable key={a.id} accessibilityRole="checkbox" accessibilityState={{ checked: on }} onPress={() => { tap(); setAddons((x) => (on ? x.filter((y) => y !== a.id) : [...x, a.id])); }} style={s.opt}>
                    <View style={[s.check, on && s.checkOn]}>{on && <Icon name="checkmark" size={15} color="#fff" />}</View>
                    <Txt v="label" style={{ flex: 1, fontFamily: on ? F.semibold : F.regular }}>{a.name}</Txt>
                    <Txt v="small" color={C.dark}>+{money(a.price)}</Txt>
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>

      <View style={[s.bar, { paddingBottom: Math.max(insets.bottom, 14) }]}>
        <Stepper value={qty} min={1} onChange={(n) => setQty(Math.max(1, Math.min(20, n)))} />
        <Button
          title={`Add ${qty} · ${money(unit * qty)}`}
          style={{ flex: 1 }}
          onPress={() => {
            add(p.id, { portion, addons, qty });
            tap(Haptics.ImpactFeedbackStyle.Medium);
            close();
          }}
        />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  hero: { height: 320, backgroundColor: C.blush, borderBottomLeftRadius: 28, borderBottomRightRadius: 28, overflow: 'hidden' },
  heroPhoto: { width: '100%', height: '100%' },
  heroBtns: { position: 'absolute', left: 14, right: 14, flexDirection: 'row', justifyContent: 'space-between' },
  allergen: { flexDirection: 'row', gap: 10, backgroundColor: '#FFF7E8', borderRadius: 14, padding: 12, marginTop: 16 },
  group: { marginTop: 24 },
  groupHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  opt: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.border },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: '#CFC8C3', alignItems: 'center', justifyContent: 'center' },
  radioOn: { borderColor: C.red },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: C.red },
  check: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: '#CFC8C3', alignItems: 'center', justifyContent: 'center' },
  checkOn: { backgroundColor: C.red, borderColor: C.red },
  bar: { position: 'absolute', left: 0, right: 0, bottom: 0, flexDirection: 'row', gap: 12, paddingHorizontal: 16, paddingTop: 12, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: C.border, borderTopLeftRadius: R.card, borderTopRightRadius: R.card },
});
