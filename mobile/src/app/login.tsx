import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { Button, Icon, IconButton, Txt } from '@/components/ui';
import { api, ApiError } from '@/lib/api';
import { useStore } from '@/lib/store';
import { C, F, R } from '@/lib/theme';

/** Sign in with a blitefood.co.uk account — the same email and password as the website. */
export default function Login() {
  const { signIn } = useStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [note, setNote] = useState('');
  const close = () => (router.canGoBack() ? router.back() : router.replace('/'));

  const submit = async () => {
    setError('');
    setNote('');
    if (!email.trim() || !password) return setError('Enter your email and password.');
    setBusy(true);
    try {
      await signIn(email.trim(), password);
      close();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const forgot = async () => {
    setError('');
    if (!email.trim()) return setError('Enter your email first, then tap “Forgot password?”.');
    try {
      const r = await api<{ message: string }>('/auth/forgot-password', { method: 'POST', body: { email: email.trim() } });
      setNote(r.message);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Could not send the reset email.');
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={s.head}>
        <IconButton name="close" label="Close" onPress={close} />
      </View>
      <ScrollView contentContainerStyle={{ padding: 24 }} keyboardShouldPersistTaps="handled">
        <Txt v="hero">Welcome back</Txt>
        <Txt style={{ marginTop: 6, marginBottom: 24 }}>Sign in with your B-Lite account. It’s the same one you use on blitefood.co.uk.</Txt>

        <Txt v="label" style={s.label}>Email</Txt>
        <TextInput value={email} onChangeText={setEmail} autoCapitalize="none" autoComplete="email" keyboardType="email-address" textContentType="username" style={s.input} placeholder="you@example.com" placeholderTextColor="#B5ADA8" />
        <Txt v="label" style={s.label}>Password</Txt>
        <View>
          <TextInput value={password} onChangeText={setPassword} secureTextEntry={!show} autoComplete="password" textContentType="password" style={[s.input, { paddingRight: 52 }]} onSubmitEditing={submit} returnKeyType="go" />
          <IconButton name={show ? 'eye-off-outline' : 'eye-outline'} label={show ? 'Hide password' : 'Show password'} onPress={() => setShow(!show)} style={s.eye} size={20} />
        </View>
        <Txt v="label" color={C.red} style={{ marginTop: 12, alignSelf: 'flex-end' }} onPress={forgot}>Forgot password?</Txt>

        {!!error && <View style={s.error} accessibilityRole="alert"><Icon name="alert-circle" size={18} color="#B0101F" /><Txt v="small" color="#B0101F" style={{ flex: 1 }}>{error}</Txt></View>}
        {!!note && <View style={[s.error, { backgroundColor: C.greenSoft }]}><Icon name="mail" size={18} color={C.green} /><Txt v="small" color="#16663A" style={{ flex: 1 }}>{note}</Txt></View>}

        <Button title="Sign in" loading={busy} onPress={submit} style={{ marginTop: 20 }} />
        <Button title="Create an account" variant="ghost" style={{ marginTop: 10 }} onPress={() => router.replace('/register')} />
        <Txt v="small" style={{ textAlign: 'center', marginTop: 18 }} onPress={() => WebBrowser.openBrowserAsync('https://blitefood.co.uk/guide')}>
          By continuing you agree to our terms &amp; conditions.
        </Txt>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  head: { flexDirection: 'row', padding: 12 },
  label: { marginTop: 14, marginBottom: 6 },
  input: { height: 54, borderRadius: R.input, borderWidth: 1.5, borderColor: C.border, backgroundColor: '#fff', paddingHorizontal: 16, fontFamily: F.medium, fontSize: 16, color: C.dark },
  eye: { position: 'absolute', right: 6, top: 6, backgroundColor: 'transparent', shadowOpacity: 0, elevation: 0 },
  error: { flexDirection: 'row', gap: 8, padding: 12, borderRadius: 12, backgroundColor: '#FFF1F2', marginTop: 16 },
});
