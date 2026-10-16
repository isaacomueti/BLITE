import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { Button, Icon, IconButton, Txt } from '@/components/ui';
import { checkDelivery, DeliveryCheck } from '@/lib/data';
import { useStore } from '@/lib/store';
import { C, F, money, R } from '@/lib/theme';

/** Postcode-first delivery check — the UK-native replacement for a city picker. */
export default function AddressSheet() {
  const { address, setAddress } = useStore();
  const [pc, setPc] = useState(address?.postcode ?? '');
  const [line1, setLine1] = useState(address?.line1 ?? '');
  const [result, setResult] = useState<DeliveryCheck | null>(address ? checkDelivery(address.postcode) : null);
  const close = () => (router.canGoBack() ? router.back() : router.replace('/'));

  const check = () => {
    const r = checkDelivery(pc);
    setResult(r);
    if (r.ok) setPc(r.postcode);
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={s.head}>
        <IconButton name="close" label="Close" onPress={close} />
        <Txt v="h3" style={{ flex: 1, textAlign: 'center' }}>Delivery address</Txt>
        <View style={{ width: 42 }} />
      </View>
      <ScrollView contentContainerStyle={{ padding: 20 }} keyboardShouldPersistTaps="handled">
        <Txt v="h1">Where should we deliver?</Txt>
        <Txt style={{ marginTop: 6, marginBottom: 20 }}>Enter your postcode to see delivery times and fees.</Txt>

        <Txt v="label" style={{ marginBottom: 6 }}>Postcode</Txt>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <TextInput
            value={pc}
            onChangeText={(t) => { setPc(t.toUpperCase()); setResult(null); }}
            placeholder="e.g. AL10 9AB"
            placeholderTextColor="#B5ADA8"
            autoCapitalize="characters"
            autoComplete="postal-code"
            textContentType="postalCode"
            returnKeyType="search"
            onSubmitEditing={check}
            style={[s.input, { flex: 1 }]}
          />
          <Button title="Check" variant="dark" onPress={check} style={{ paddingHorizontal: 22 }} />
        </View>

        {result && !result.ok && (
          <View style={[s.result, { backgroundColor: result.reason === 'invalid' ? '#FFF1F2' : C.orangeSoft }]}>
            <Icon name="alert-circle" size={20} color={result.reason === 'invalid' ? '#B0101F' : '#8A5300'} />
            <Txt v="small" color={result.reason === 'invalid' ? '#B0101F' : '#8A5300'} style={{ flex: 1 }}>
              {result.reason === 'invalid' ? "That doesn't look like a UK postcode. Try something like AL10 9AB." : `We don't deliver to ${result.postcode} yet. You can still order for pickup in Hatfield.`}
            </Txt>
          </View>
        )}
        {result?.ok && (
          <>
            <View style={[s.result, { backgroundColor: C.greenSoft }]}>
              <Icon name="checkmark-circle" size={20} color={C.green} />
              <View style={{ flex: 1 }}>
                <Txt v="label" color="#16663A">Delivery available to {result.postcode}</Txt>
                <Txt v="small" color="#16663A">Estimated {result.eta} · Delivery fee {money(result.fee)}</Txt>
              </View>
            </View>
            <Txt v="label" style={{ marginTop: 20, marginBottom: 6 }}>House number and street</Txt>
            <TextInput value={line1} onChangeText={setLine1} placeholder="e.g. 12 High Street" placeholderTextColor="#B5ADA8" autoComplete="street-address" textContentType="streetAddressLine1" style={s.input} />
          </>
        )}
      </ScrollView>
      <View style={s.bar}>
        <Button
          title="Save address"
          disabled={!result?.ok || !line1.trim()}
          onPress={() => {
            if (!result?.ok) return;
            setAddress({ postcode: result.postcode, line1: line1.trim(), fee: result.fee, eta: result.eta });
            close();
          }}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', padding: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.border },
  input: { height: 54, borderRadius: R.input, borderWidth: 1.5, borderColor: C.border, backgroundColor: '#fff', paddingHorizontal: 16, fontFamily: F.semibold, fontSize: 16, color: C.dark },
  result: { flexDirection: 'row', gap: 10, alignItems: 'flex-start', padding: 14, borderRadius: 14, marginTop: 14 },
  bar: { padding: 16, paddingBottom: 28, borderTopWidth: 1, borderTopColor: C.border, backgroundColor: '#fff' },
});
