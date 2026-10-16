import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { Alert, FlatList, Linking, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, ListRow, ProductTile, Txt } from '@/components/ui';
import { business, productById } from '@/lib/data';
import { useStore } from '@/lib/store';
import { C, F, R } from '@/lib/theme';

const open = (url: string) => WebBrowser.openBrowserAsync(url).catch(() => {});
const title = (n: string) => n.replace(/\b\w/g, (c) => c.toUpperCase());

export default function Profile() {
  const insets = useSafeAreaInsets();
  const { address, favs, orders, user, signOut } = useStore();
  const favProducts = favs.map(productById).filter((p): p is NonNullable<typeof p> => !!p);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.bg }} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={[s.head, { paddingTop: insets.top + 16 }]}>
        <View style={s.avatar}><Txt style={{ fontFamily: F.displayItalic, fontSize: 26, color: C.red }}>{user ? user.name.charAt(0).toUpperCase() : 'B'}</Txt></View>
        {user ? (
          <>
            <Txt v="h1">Hi, {title(user.name.split(' ')[0])}</Txt>
            <Txt style={{ marginTop: 4 }}>{user.email}</Txt>
          </>
        ) : (
          <>
            <Txt v="h1">Welcome to B-Lite</Txt>
            <Txt style={{ marginTop: 4, marginBottom: 16 }}>Sign in with your blitefood.co.uk account to order and track deliveries.</Txt>
            <Button title="Sign in" icon="mail-outline" onPress={() => router.push('/login')} />
            <Button title="Create an account" variant="ghost" size="md" style={{ marginTop: 10 }} onPress={() => router.push('/register')} />
          </>
        )}
      </View>

      {favProducts.length > 0 && (
        <View style={{ marginTop: 24 }}>
          <Txt v="h2" style={{ paddingHorizontal: 16, marginBottom: 12 }}>Favourites</Txt>
          <FlatList horizontal data={favProducts} keyExtractor={(p) => p.id} showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }} renderItem={({ item }) => <ProductTile p={item} width={132} />} />
        </View>
      )}

      <View style={s.group}>
        <ListRow icon="location-outline" title="Delivery address" sub={address ? `${address.line1}, ${address.postcode} · ${address.area}` : 'Add your address'} onPress={() => router.push('/address')} />
        <ListRow icon="receipt-outline" title="Orders" sub={user ? (orders.length ? `${orders.length} orders` : 'No orders yet') : 'Sign in to see your orders'} onPress={() => router.push('/orders')} />
        <ListRow icon="heart-outline" title="Favourites" sub={favs.length ? `${favs.length} saved` : 'Tap ♥ on a dish to save it'} />
        {user && <ListRow icon="key-outline" title="Change name or password" sub="On blitefood.co.uk" onPress={() => open('https://blitefood.co.uk/profile')} />}
      </View>

      <Txt v="eyebrow" style={s.label}>Services</Txt>
      <View style={s.group}>
        <ListRow icon="restaurant-outline" title="Catering" sub="Weddings, birthdays and corporate events" onPress={() => router.push('/catering')} />
        <ListRow icon="cube-outline" title="Equipment hire" sub="Chafing dishes, plates, drums" onPress={() => router.push('/equipment')} />
      </View>

      <Txt v="eyebrow" style={s.label}>Help</Txt>
      <View style={s.group}>
        <ListRow icon="chatbubbles-outline" title="Live chat" sub="Chat to the B-Lite team" onPress={() => open(business.chatUrl)} />
        {!!business.whatsapp && <ListRow icon="logo-whatsapp" title="WhatsApp" sub={business.phone} onPress={() => Linking.openURL(business.whatsapp)} />}
        {!!business.phoneHref && <ListRow icon="call-outline" title="Call B-Lite" sub={business.phone} onPress={() => Linking.openURL(business.phoneHref)} />}
        {!!business.email && <ListRow icon="mail-outline" title="Email" sub={business.email} onPress={() => Linking.openURL('mailto:' + business.email)} />}
        <ListRow icon="document-text-outline" title="Policy" onPress={() => open('https://blitefood.co.uk/policy')} />
        <ListRow icon="document-outline" title="Terms & conditions" onPress={() => open('https://blitefood.co.uk/guide')} />
      </View>

      {user && (
        <Button
          title="Sign out"
          variant="ghost"
          icon="log-out-outline"
          style={{ marginHorizontal: 16, marginTop: 24 }}
          onPress={() => Alert.alert('Sign out?', '', [{ text: 'Cancel', style: 'cancel' }, { text: 'Sign out', style: 'destructive', onPress: () => signOut() }])}
        />
      )}
      {!!business.address && <Txt v="small" style={{ textAlign: 'center', marginTop: 20 }}>B-Lite Food · {business.address}</Txt>}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  head: { paddingHorizontal: 16, paddingBottom: 20, backgroundColor: C.blush, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
  avatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  group: { marginHorizontal: 16, marginTop: 16, borderRadius: R.card, overflow: 'hidden', borderWidth: 1, borderColor: C.border, backgroundColor: '#fff' },
  label: { marginTop: 24, marginHorizontal: 20, marginBottom: -6 },
});
