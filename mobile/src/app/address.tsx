import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { Button, Icon, IconButton, tap, Txt } from '@/components/ui';
import { counties, normalisePostcode } from '@/lib/data';
import { useStore } from '@/lib/store';
import { C, F, money, R } from '@/lib/theme';

/** Delivery address in the website's model: county → delivery area (which sets the fee) → street. */
export default function AddressSheet() {
  const { address, setAddress } = useStore();
  const [countyId, setCountyId] = useState<number | null>(address?.countyId ?? null);
  const [areaId, setAreaId] = useState<number | null>(address?.areaId ?? null);
  const [line1, setLine1] = useState(address?.line1 ?? '');
  const [city, setCity] = useState(address?.city ?? '');
  const [pc, setPc] = useState(address?.postcode ?? '');
  const [error, setError] = useState('');
  const close = () => (router.canGoBack() ? router.back() : router.replace('/'));

  const county = counties.find((c) => c.id === countyId);
  const area = county?.areas.find((a) => a.id === areaId);

  const save = () => {
    setError('');
    if (!county || !area) return setError('Choose your county and delivery area.');
    if (!line1.trim()) return setError('Add your house number and street.');
    if (!city.trim()) return setError('Add your town or city.');
    const postcode = normalisePostcode(pc);
    if (!postcode) return setError('Enter a valid UK postcode, like AL10 9AB.');
    setAddress({ countyId: county.id, county: county.name, areaId: area.id, area: area.name, eta: area.eta, line1: line1.trim(), city: city.trim(), postcode });
    close();
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={s.head}>
        <IconButton name="close" label="Close" onPress={close} />
        <Txt v="h3" style={{ flex: 1, textAlign: 'center' }}>Delivery address</Txt>
        <View style={{ width: 42 }} />
      </View>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
        <Txt v="h1">Where should we deliver?</Txt>
        <Txt style={{ marginTop: 6, marginBottom: 8 }}>Your delivery area sets the fee, which also depends on your basket’s weight.</Txt>

        <Txt v="label" style={s.label}>County</Txt>
        <View style={s.chips}>
          {counties.map((c) => (
            <Pressable key={c.id} onPress={() => { tap(); setCountyId(c.id); setAreaId(null); }} style={[s.chip, countyId === c.id && s.chipOn]} accessibilityRole="radio" accessibilityState={{ checked: countyId === c.id }}>
              <Text style={[s.chipText, countyId === c.id && { color: '#fff' }]}>{c.name}</Text>
            </Pressable>
          ))}
        </View>
        {counties.length === 0 && <Txt v="small">Delivery areas aren’t set up yet — choose pickup at checkout.</Txt>}

        {county && (
          <>
            <Txt v="label" style={s.label}>Delivery area</Txt>
            {county.areas.length === 0 ? (
              <Txt v="small">We don’t deliver in {county.name} yet. You can still order for pickup.</Txt>
            ) : (
              <View style={s.list}>
                {county.areas.map((a) => {
                  const on = areaId === a.id;
                  return (
                    <Pressable key={a.id} onPress={() => { tap(); setAreaId(a.id); }} style={s.opt} accessibilityRole="radio" accessibilityState={{ checked: on }}>
                      <View style={[s.radio, on && { borderColor: C.red }]}>{on && <View style={s.radioDot} />}</View>
                      <View style={{ flex: 1 }}>
                        <Txt v="label">{a.name}</Txt>
                        <Txt v="small">From {money(a.base_fee)}{a.fee_per_kg ? ` + ${money(a.fee_per_kg)}/kg` : ''}{a.eta ? ` · ${a.eta}` : ''}</Txt>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            )}
          </>
        )}

        {area && (
          <>
            <Txt v="label" style={s.label}>House number and street</Txt>
            <TextInput value={line1} onChangeText={setLine1} placeholder="e.g. 12 High Street" placeholderTextColor="#B5ADA8" autoComplete="street-address" textContentType="streetAddressLine1" style={s.input} />
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={{ flex: 1 }}>
                <Txt v="label" style={s.label}>Town / city</Txt>
                <TextInput value={city} onChangeText={setCity} autoComplete="postal-address-locality" textContentType="addressCity" style={s.input} />
              </View>
              <View style={{ flex: 1 }}>
                <Txt v="label" style={s.label}>Postcode</Txt>
                <TextInput value={pc} onChangeText={(t) => setPc(t.toUpperCase())} placeholder="AL10 9AB" placeholderTextColor="#B5ADA8" autoCapitalize="characters" autoComplete="postal-code" textContentType="postalCode" style={s.input} />
              </View>
            </View>
          </>
        )}

        {!!error && (
          <View style={s.error} accessibilityRole="alert">
            <Icon name="alert-circle" size={18} color="#B0101F" />
            <Txt v="small" color="#B0101F" style={{ flex: 1 }}>{error}</Txt>
          </View>
        )}
      </ScrollView>
      <View style={s.bar}>
        <Button title="Save address" disabled={!area} onPress={save} />
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', padding: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.border },
  label: { marginTop: 18, marginBottom: 8 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 16, height: 40, borderRadius: 20, borderWidth: 1.5, borderColor: C.border, justifyContent: 'center', backgroundColor: '#fff' },
  chipOn: { backgroundColor: C.red, borderColor: C.red },
  chipText: { fontFamily: F.semibold, fontSize: 14, color: C.dark },
  list: { backgroundColor: '#fff', borderRadius: R.card, borderWidth: 1, borderColor: C.border, paddingHorizontal: 14 },
  opt: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.border },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: '#CFC8C3', alignItems: 'center', justifyContent: 'center' },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: C.red },
  input: { height: 54, borderRadius: R.input, borderWidth: 1.5, borderColor: C.border, backgroundColor: '#fff', paddingHorizontal: 16, fontFamily: F.semibold, fontSize: 16, color: C.dark },
  error: { flexDirection: 'row', gap: 8, padding: 12, borderRadius: 12, backgroundColor: '#FFF1F2', marginTop: 16 },
  bar: { padding: 16, paddingBottom: 28, borderTopWidth: 1, borderTopColor: C.border, backgroundColor: '#fff' },
});
