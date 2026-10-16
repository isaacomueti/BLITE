import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { Button, Icon, IconButton, tap, Txt } from '@/components/ui';
import { ApiError } from '@/lib/api';
import { useStore } from '@/lib/store';
import { C, F, R } from '@/lib/theme';

/** Create a blitefood.co.uk account. It works on the website too. */
export default function Register() {
  const { register } = useStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [terms, setTerms] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const close = () => (router.canGoBack() ? router.back() : router.replace('/'));

  const submit = async () => {
    setError('');
    if (!name.trim()) return setError('Add your name.');
    if (password.length < 8) return setError('Use at least 8 characters for your password.');
    if (password !== confirm) return setError('The passwords don’t match.');
    if (!terms) return setError('Please accept the terms and conditions.');
    setBusy(true);
    try {
      await register({ name: name.trim(), email: email.trim().toLowerCase(), password, password_confirmation: confirm, terms });
      close();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={s.head}><IconButton name="close" label="Close" onPress={close} /></View>
      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 48 }} keyboardShouldPersistTaps="handled">
        <Txt v="hero">Create your account</Txt>
        <Txt style={{ marginTop: 6, marginBottom: 12 }}>Order in a few taps and track every order. Works on blitefood.co.uk too.</Txt>

        <Txt v="label" style={s.label}>Full name</Txt>
        <TextInput value={name} onChangeText={setName} autoComplete="name" textContentType="name" style={s.input} />
        <Txt v="label" style={s.label}>Email</Txt>
        <TextInput value={email} onChangeText={setEmail} autoCapitalize="none" autoComplete="email" keyboardType="email-address" textContentType="emailAddress" style={s.input} />
        <Txt v="label" style={s.label}>Password</Txt>
        <TextInput value={password} onChangeText={setPassword} secureTextEntry autoComplete="new-password" textContentType="newPassword" style={s.input} />
        <Txt v="small" style={{ marginTop: 4 }}>At least 8 characters.</Txt>
        <Txt v="label" style={s.label}>Confirm password</Txt>
        <TextInput value={confirm} onChangeText={setConfirm} secureTextEntry autoComplete="new-password" textContentType="newPassword" style={s.input} />

        <Pressable onPress={() => { tap(); setTerms(!terms); }} style={s.terms} accessibilityRole="checkbox" accessibilityState={{ checked: terms }}>
          <View style={[s.check, terms && s.checkOn]}>{terms && <Icon name="checkmark" size={15} color="#fff" />}</View>
          <Txt v="small" style={{ flex: 1 }}>
            I accept the <Txt v="small" color={C.red} onPress={() => WebBrowser.openBrowserAsync('https://blitefood.co.uk/guide')}>terms &amp; conditions</Txt> and <Txt v="small" color={C.red} onPress={() => WebBrowser.openBrowserAsync('https://blitefood.co.uk/policy')}>policy</Txt>.
          </Txt>
        </Pressable>

        {!!error && <View style={s.error} accessibilityRole="alert"><Icon name="alert-circle" size={18} color="#B0101F" /><Txt v="small" color="#B0101F" style={{ flex: 1 }}>{error}</Txt></View>}
        <Button title="Create account" loading={busy} onPress={submit} style={{ marginTop: 20 }} />
        <Button title="I already have an account" variant="ghost" style={{ marginTop: 10 }} onPress={() => router.replace('/login')} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  head: { flexDirection: 'row', padding: 12 },
  label: { marginTop: 14, marginBottom: 6 },
  input: { height: 54, borderRadius: R.input, borderWidth: 1.5, borderColor: C.border, backgroundColor: '#fff', paddingHorizontal: 16, fontFamily: F.medium, fontSize: 16, color: C.dark },
  terms: { flexDirection: 'row', gap: 12, alignItems: 'center', marginTop: 20 },
  check: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: '#CFC8C3', alignItems: 'center', justifyContent: 'center' },
  checkOn: { backgroundColor: C.red, borderColor: C.red },
  error: { flexDirection: 'row', gap: 8, padding: 12, borderRadius: 12, backgroundColor: '#FFF1F2', marginTop: 16 },
});
