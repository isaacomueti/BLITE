import { router } from 'expo-router';
import { Alert, FlatList, Linking, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, ListRow, ProductTile, Txt } from '@/components/ui';
import { business, productById } from '@/lib/data';
import { useStore } from '@/lib/store';
import { C, F, R } from '@/lib/theme';

export default function Profile() {
  const insets = useSafeAreaInsets();
  const { address, favs, orders } = useStore();
  const signIn = () => Alert.alert('Coming with the backend', 'Accounts switch on once Supabase Auth is connected. Ordering works without an account.');
  const favProducts = favs.map(productById).filter((p): p is NonNullable<typeof p> => !!p);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.bg }} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={[s.head, { paddingTop: insets.top + 16 }]}>
        <View style={s.avatar}><Txt style={{ fontFamily: F.displayItalic, fontSize: 26, color: C.red }}>B</Txt></View>
        <Txt v="h1">Welcome to Blite</Txt>
        <Txt style={{ marginTop: 4, marginBottom: 16 }}>Sign in to sync orders, addresses and favourites across devices.</Txt>
        {/* PRODUCTION: Supabase Auth — email magic link, Sign in with Apple, Google. */}
        <Button title="Continue with email" icon="mail-outline" onPress={signIn} />
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
          <Button title="Apple" variant="ghost" icon="logo-apple" size="md" style={{ flex: 1 }} onPress={signIn} />
          <Button title="Google" variant="ghost" icon="logo-google" size="md" style={{ flex: 1 }} onPress={signIn} />
        </View>
      </View>

      {favProducts.length > 0 && (
        <View style={{ marginTop: 24 }}>
          <Txt v="h2" style={{ paddingHorizontal: 16, marginBottom: 12 }}>Favourites</Txt>
          <FlatList horizontal data={favProducts} keyExtractor={(p) => p.id} showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }} renderItem={({ item }) => <ProductTile p={item} width={132} />} />
        </View>
      )}

      <View style={s.group}>
        <ListRow icon="location-outline" title="Delivery address" sub={address ? `${address.line1}, ${address.postcode}` : 'Add your postcode'} onPress={() => router.push('/address')} />
        <ListRow icon="receipt-outline" title="Orders" sub={orders.length ? `${orders.length} orders` : 'No orders yet'} onPress={() => router.push('/orders')} />
        <ListRow icon="card-outline" title="Payment methods" sub="Held securely by Revolut" />
        <ListRow icon="heart-outline" title="Favourites" sub={favs.length ? `${favs.length} saved` : 'Tap ♥ on a dish to save it'} />
      </View>

      <Txt v="eyebrow" style={s.label}>Services</Txt>
      <View style={s.group}>
        <ListRow icon="restaurant-outline" title="Catering" sub="Weddings, birthdays and corporate events" onPress={() => router.push('/catering')} />
        <ListRow icon="cube-outline" title="Equipment hire" sub="Chafing dishes, plates, chairs" onPress={() => router.push('/equipment')} />
      </View>

      <Txt v="eyebrow" style={s.label}>Help</Txt>
      <View style={s.group}>
        <ListRow icon="logo-whatsapp" title="Chat on WhatsApp" sub={business.phone} onPress={() => Linking.openURL(business.whatsapp)} />
        <ListRow icon="call-outline" title="Call Blite" sub={`Deliveries ${business.deliveryHours}`} onPress={() => Linking.openURL(business.phoneHref)} />
        <ListRow icon="mail-outline" title="Email support" sub={business.email} onPress={() => Linking.openURL('mailto:' + business.email)} />
        <ListRow icon="information-circle-outline" title="Allergen information" sub="Listed on every dish" />
        <ListRow icon="document-text-outline" title="Terms & privacy" onPress={() => Linking.openURL('https://www.blitefood.co.uk/policy')} />
      </View>
      <Txt v="small" style={{ textAlign: 'center', marginTop: 20 }}>Blite Food · {business.address}</Txt>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  head: { paddingHorizontal: 16, paddingBottom: 20, backgroundColor: C.blush, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
  avatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  group: { marginHorizontal: 16, marginTop: 16, borderRadius: R.card, overflow: 'hidden', borderWidth: 1, borderColor: C.border, backgroundColor: '#fff' },
  label: { marginTop: 24, marginHorizontal: 20, marginBottom: -6 },
});
