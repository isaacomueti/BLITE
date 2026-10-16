import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, { FadeInRight, ZoomIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Icon, IconButton, Photo, Stepper, tap, Txt } from '@/components/ui';
import { api, ApiError } from '@/lib/api';
import { events, toApiDate } from '@/lib/data';
import { useStore } from '@/lib/store';
import { C, F, R } from '@/lib/theme';

const STEPS = ['Your event', 'Your details'];
const TIMES = ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'];

function eventDays() {
  const out: Date[] = [];
  for (let i = 1; out.length < 90; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    out.push(d);
  }
  return out;
}

/** Catering enquiry — sent to the same bookings list and email as the website's form. */
export default function Catering() {
  const insets = useSafeAreaInsets();
  const { user, phone: savedPhone } = useStore();
  const [days] = useState(eventDays);
  const [step, setStep] = useState(0);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [guests, setGuests] = useState(50);
  const [name, setName] = useState(user ? user.name.replace(/\b\w/g, (c) => c.toUpperCase()) : '');
  const [phone, setPhone] = useState(savedPhone);
  const [email, setEmail] = useState(user?.email ?? '');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const next = async () => {
    setError('');
    if (step === 0) {
      if (!date) return setError('Choose the date of your event.');
      if (!time) return setError('Choose a start time.');
      return setStep(1);
    }
    if (!name.trim()) return setError('Add your name.');
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 10) return setError('Add a UK phone number.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return setError('Add a valid email address.');
    setBusy(true);
    try {
      await api('/bookings', { method: 'POST', body: { name: name.trim(), phone_number: digits, email: email.trim(), people: guests, date, time } });
      setSent(true);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Could not send your enquiry. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  if (sent) {
    return (
      <View style={[s.done, { paddingTop: insets.top + 60 }]}>
        <Animated.View entering={ZoomIn.springify().damping(12)} style={s.doneIcon}><Icon name="checkmark" size={40} color="#fff" /></Animated.View>
        <Txt v="h1" style={{ textAlign: 'center' }}>Enquiry received</Txt>
        <Txt style={{ textAlign: 'center', marginTop: 8 }}>Thank you! Our team will be in touch to talk through your menu and send a quote.</Txt>
        <Button title="Need equipment too?" variant="secondary" style={{ alignSelf: 'stretch', marginTop: 28 }} onPress={() => router.replace('/equipment')} />
        <Button title="Back to home" style={{ alignSelf: 'stretch', marginTop: 10 }} onPress={() => router.replace('/')} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: C.bg }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 140 }} keyboardShouldPersistTaps="handled">
        <View style={[s.hero, { paddingTop: insets.top + 8 }]}>
          <Photo k={events[0]?.photos[0]} style={StyleSheet.absoluteFill} />
          <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(25,25,25,0.55)' }]} />
          <IconButton name="arrow-back" label="Back" onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} />
          <Txt v="eyebrow" color="#FF8A98" style={{ marginTop: 20 }}>Catering</Txt>
          <Txt v="hero" color="#fff" style={{ marginTop: 6, maxWidth: '75%' }}>Catering people <Txt v="hero" color="#FF8A98" style={{ fontFamily: F.displayItalic }}>remember.</Txt></Txt>
          <Txt color="rgba(255,255,255,0.75)" style={{ marginTop: 8, maxWidth: '80%' }}>Tell us about your event and we’ll get back to you with a tailored quote.</Txt>
        </View>

        <View style={s.stepper}>
          {STEPS.map((t, i) => (
            <View key={t} style={{ flex: 1 }}>
              <View style={[s.bar, i <= step && { backgroundColor: C.red }]} />
              <Text style={[s.stepText, i === step && { color: C.dark }]}>{t}</Text>
            </View>
          ))}
        </View>

        <Animated.View key={step} entering={FadeInRight.duration(260)} style={{ paddingHorizontal: 16 }}>
          {step === 0 ? (
            <>
              <Txt v="h3" style={s.q}>Event date</Txt>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                {days.map((d) => {
                  const v = toApiDate(d);
                  return (
                    <Pressable key={v} onPress={() => { tap(); setDate(v); }} style={[s.chip, date === v && s.chipOn]}>
                      <Text style={[s.chipText, date === v && { color: '#fff' }]}>{d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}</Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
              <Txt v="h3" style={s.q}>Start time</Txt>
              <View style={s.chips}>
                {TIMES.map((t) => (
                  <Pressable key={t} onPress={() => { tap(); setTime(t); }} style={[s.chip, time === t && s.chipOn]}>
                    <Text style={[s.chipText, time === t && { color: '#fff' }]}>{t}</Text>
                  </Pressable>
                ))}
              </View>
              <Txt v="h3" style={s.q}>Number of guests</Txt>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                <Stepper value={guests} min={10} onChange={(n) => setGuests(Math.max(10, n > guests ? guests + 10 : guests - 10))} />
                <Txt v="small">{guests <= 20 ? 'Small gathering' : guests <= 50 ? 'Private event' : guests <= 150 ? 'Corporate / medium' : 'Large event'}</Txt>
              </View>
            </>
          ) : (
            <>
              <Txt v="h3" style={s.q}>Your name</Txt>
              <TextInput value={name} onChangeText={setName} autoComplete="name" style={s.input} />
              <Txt v="h3" style={s.q}>Phone</Txt>
              <TextInput value={phone} onChangeText={setPhone} placeholder="07123 456789" placeholderTextColor="#B5ADA8" keyboardType="phone-pad" autoComplete="tel" style={s.input} />
              <Txt v="h3" style={s.q}>Email</Txt>
              <TextInput value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoComplete="email" style={s.input} />
              <Txt v="small" style={{ marginTop: 10 }}>No payment now. We’ll call or email you to plan the menu.</Txt>
            </>
          )}
          {!!error && <View style={s.error}><Icon name="alert-circle" size={18} color="#B0101F" /><Txt v="small" color="#B0101F" style={{ flex: 1 }}>{error}</Txt></View>}
        </Animated.View>
      </ScrollView>
      <View style={[s.footer, { paddingBottom: Math.max(insets.bottom, 14) }]}>
        {step > 0 && <Button title="Back" variant="ghost" style={{ paddingHorizontal: 22 }} onPress={() => setStep(0)} />}
        <Button title={step === 1 ? 'Send enquiry' : 'Continue'} loading={busy} style={{ flex: 1 }} onPress={next} />
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  hero: { backgroundColor: C.dark, paddingHorizontal: 16, paddingBottom: 28, borderBottomLeftRadius: 28, borderBottomRightRadius: 28, overflow: 'hidden' },
  stepper: { flexDirection: 'row', gap: 8, padding: 16, paddingTop: 20 },
  bar: { height: 4, borderRadius: 2, backgroundColor: C.border },
  stepText: { marginTop: 6, fontFamily: F.semibold, fontSize: 12, color: C.muted },
  q: { marginTop: 18, marginBottom: 10 },
  input: { height: 52, borderRadius: R.input, borderWidth: 1.5, borderColor: C.border, backgroundColor: '#fff', paddingHorizontal: 14, fontFamily: F.medium, fontSize: 16, color: C.dark },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, height: 40, borderRadius: 20, borderWidth: 1.5, borderColor: C.border, backgroundColor: '#fff' },
  chipOn: { backgroundColor: C.red, borderColor: C.red },
  chipText: { fontFamily: F.semibold, fontSize: 14, color: C.dark },
  error: { flexDirection: 'row', gap: 8, padding: 12, borderRadius: 12, backgroundColor: '#FFF1F2', marginTop: 16 },
  footer: { position: 'absolute', left: 0, right: 0, bottom: 0, flexDirection: 'row', gap: 10, paddingHorizontal: 16, paddingTop: 12, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: C.border },
  done: { flex: 1, backgroundColor: C.bg, alignItems: 'center', paddingHorizontal: 28 },
  doneIcon: { width: 84, height: 84, borderRadius: 42, backgroundColor: C.red, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
});
