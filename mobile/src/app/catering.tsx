import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, { FadeInRight, ZoomIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Icon, IconButton, IconName, Photo, Stepper, tap, Txt } from '@/components/ui';
import { normalisePostcode } from '@/lib/data';
import { C, F, R } from '@/lib/theme';

const TYPES: { id: string; icon: IconName }[] = [
  { id: 'Wedding', icon: 'heart-outline' },
  { id: 'Birthday', icon: 'gift-outline' },
  { id: 'Corporate', icon: 'briefcase-outline' },
  { id: 'Private party', icon: 'wine-outline' },
  { id: 'Memorial', icon: 'flower-outline' },
  { id: 'Other', icon: 'sparkles-outline' },
];
const DIET = ['Vegetarian', 'Vegan', 'Halal', 'Gluten-free', 'Allergies'];
const EXTRAS = ['Serving staff', 'Equipment hire', 'Set-up & clear-down', 'Tasting session'];
const STEPS = ['Your event', 'Food & venue', 'Your details'];

function parseUkDate(v: string) {
  const m = v.trim().match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{2,4})$/);
  if (!m) return null;
  const y = m[3].length === 2 ? 2000 + +m[3] : +m[3];
  const d = new Date(y, +m[2] - 1, +m[1]);
  return d.getDate() === +m[1] && d.getTime() > Date.now() ? d : null;
}

export default function Catering() {
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(0);
  const [type, setType] = useState('');
  const [date, setDate] = useState('');
  const [guests, setGuests] = useState(50);
  const [venue, setVenue] = useState('');
  const [diet, setDiet] = useState<string[]>([]);
  const [allergies, setAllergies] = useState('');
  const [extras, setExtras] = useState<string[]>([]);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState<string | null>(null);

  const toggle = (list: string[], set: (v: string[]) => void, v: string) => { tap(); set(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]); };

  const next = () => {
    setError('');
    if (step === 0 && (!type || !parseUkDate(date))) return setError(!type ? 'Choose the type of event.' : 'Enter a future date as DD/MM/YYYY.');
    if (step === 1 && !normalisePostcode(venue)) return setError('Enter the venue postcode.');
    if (step === 2) {
      if (!name.trim()) return setError('Add your name.');
      if (!/^(44|0)\d{9,10}$/.test(phone.replace(/\D/g, ''))) return setError('Add a UK phone number.');
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError('Add a valid email address.');
      // PRODUCTION: POST /api/catering → CRM, auto-reply email, team notification.
      return setSent('CAT-' + Math.floor(200 + Math.random() * 700));
    }
    setStep(step + 1);
  };

  if (sent) {
    return (
      <View style={[s.done, { paddingTop: insets.top + 60 }]}>
        <Animated.View entering={ZoomIn.springify().damping(12)} style={s.doneIcon}><Icon name="checkmark" size={40} color="#fff" /></Animated.View>
        <Txt v="h1" style={{ textAlign: 'center' }}>Enquiry received</Txt>
        <Txt style={{ textAlign: 'center', marginTop: 8 }}>Reference {sent}. We’ll call within one working day to talk through your menu, then email a quote with a secure deposit link.</Txt>
        <Button title="Back to home" style={{ alignSelf: 'stretch', marginTop: 28 }} onPress={() => router.replace('/')} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: C.bg }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 140 }} keyboardShouldPersistTaps="handled">
        <View style={[s.hero, { paddingTop: insets.top + 8 }]}>
          <Photo k="events/pauline-at-85" style={StyleSheet.absoluteFill} />
          <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(25,25,25,0.55)' }]} />
          <IconButton name="arrow-back" label="Back" onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} />
          <Txt v="eyebrow" color="#FF8A98" style={{ marginTop: 20 }}>Catering</Txt>
          <Txt v="hero" color="#fff" style={{ marginTop: 6, maxWidth: '75%' }}>Catering people <Txt v="hero" color="#FF8A98" style={{ fontFamily: F.displayItalic }}>remember.</Txt></Txt>
          <Txt color="rgba(255,255,255,0.75)" style={{ marginTop: 8, maxWidth: '80%' }}>20 to 300+ guests. Tailored menus, quoted within one working day.</Txt>
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
          {step === 0 && (
            <>
              <Txt v="h3" style={s.q}>What’s the occasion?</Txt>
              <View style={s.grid}>
                {TYPES.map((t) => (
                  <Pressable key={t.id} onPress={() => { tap(); setType(t.id); }} style={[s.tile, type === t.id && s.tileOn]} accessibilityRole="radio" accessibilityState={{ checked: type === t.id }}>
                    <Icon name={t.icon} size={22} color={type === t.id ? C.red : C.dark} />
                    <Txt v="label" style={{ fontSize: 13 }}>{t.id}</Txt>
                  </Pressable>
                ))}
              </View>
              <Txt v="h3" style={s.q}>Event date</Txt>
              <TextInput value={date} onChangeText={setDate} placeholder="DD/MM/YYYY" placeholderTextColor="#B5ADA8" keyboardType="numbers-and-punctuation" style={s.input} />
              <Txt v="h3" style={s.q}>Number of guests</Txt>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                <Stepper value={guests} min={10} onChange={(n) => setGuests(Math.max(10, n > guests ? guests + 10 : guests - 10))} />
                <Txt v="small">{guests <= 20 ? 'Small gathering' : guests <= 50 ? 'Private event' : guests <= 150 ? 'Corporate / medium' : 'Large event'}</Txt>
              </View>
            </>
          )}
          {step === 1 && (
            <>
              <Txt v="h3" style={s.q}>Venue postcode</Txt>
              <TextInput value={venue} onChangeText={(v) => setVenue(v.toUpperCase())} placeholder="e.g. AL10 9AB" placeholderTextColor="#B5ADA8" autoCapitalize="characters" style={s.input} />
              <Txt v="h3" style={s.q}>Dietary requirements</Txt>
              <View style={s.chips}>
                {DIET.map((d) => <Chip key={d} label={d} on={diet.includes(d)} onPress={() => toggle(diet, setDiet, d)} />)}
              </View>
              {diet.includes('Allergies') && (
                <TextInput value={allergies} onChangeText={setAllergies} placeholder="Tell us about the allergies" placeholderTextColor="#B5ADA8" multiline style={[s.input, { height: 90, paddingTop: 14, marginTop: 10 }]} />
              )}
              <Txt v="h3" style={s.q}>Extras</Txt>
              <View style={s.chips}>
                {EXTRAS.map((d) => <Chip key={d} label={d} on={extras.includes(d)} onPress={() => toggle(extras, setExtras, d)} />)}
              </View>
            </>
          )}
          {step === 2 && (
            <>
              <Txt v="h3" style={s.q}>Your name</Txt>
              <TextInput value={name} onChangeText={setName} autoComplete="name" style={s.input} />
              <Txt v="h3" style={s.q}>Phone</Txt>
              <TextInput value={phone} onChangeText={setPhone} placeholder="07123 456789" placeholderTextColor="#B5ADA8" keyboardType="phone-pad" autoComplete="tel" style={s.input} />
              <Txt v="h3" style={s.q}>Email</Txt>
              <TextInput value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoComplete="email" style={s.input} />
              <Txt v="small" style={{ marginTop: 10 }}>No payment now. A deposit secures your date once you accept the quote.</Txt>
            </>
          )}
          {!!error && <View style={s.error}><Icon name="alert-circle" size={18} color="#B0101F" /><Txt v="small" color="#B0101F" style={{ flex: 1 }}>{error}</Txt></View>}
        </Animated.View>
      </ScrollView>
      <View style={[s.footer, { paddingBottom: Math.max(insets.bottom, 14) }]}>
        {step > 0 && <Button title="Back" variant="ghost" style={{ paddingHorizontal: 22 }} onPress={() => setStep(step - 1)} />}
        <Button title={step === 2 ? 'Send enquiry' : 'Continue'} style={{ flex: 1 }} onPress={next} />
      </View>
    </KeyboardAvoidingView>
  );
}

function Chip({ label, on, onPress }: { label: string; on: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[s.chip, on && s.chipOn]} accessibilityRole="checkbox" accessibilityState={{ checked: on }}>
      {on && <Icon name="checkmark" size={14} color="#fff" />}
      <Text style={[s.chipText, on && { color: '#fff' }]}>{label}</Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  hero: { backgroundColor: C.dark, paddingHorizontal: 16, paddingBottom: 28, borderBottomLeftRadius: 28, borderBottomRightRadius: 28, overflow: 'hidden' },
  stepper: { flexDirection: 'row', gap: 8, padding: 16, paddingTop: 20 },
  bar: { height: 4, borderRadius: 2, backgroundColor: C.border },
  stepText: { marginTop: 6, fontFamily: F.semibold, fontSize: 12, color: C.muted },
  q: { marginTop: 18, marginBottom: 10 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tile: { width: '31%', flexGrow: 1, height: 80, borderRadius: 16, borderWidth: 1.5, borderColor: C.border, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', gap: 6 },
  tileOn: { borderColor: C.red, backgroundColor: '#FFF8F8' },
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
