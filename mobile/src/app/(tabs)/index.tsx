import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BasketBar, CategoryBubble, Icon, Photo, ProductTile, SectionTitle, Txt } from '@/components/ui';
import { business, categories, products, shortName } from '@/lib/data';
import { useStore } from '@/lib/store';
import { C, F, money, R, shadow } from '@/lib/theme';

const promos = [
  { id: 'quick', eyebrow: 'Order by 17:00', title: 'Same-day\nquick meals', cta: 'Order now', bg: C.red, fg: '#fff', photo: 'menu/jollof-rice-meal', go: () => router.push({ pathname: '/store', params: { cat: 'quick' } }) },
  { id: 'trays', eyebrow: 'Cooked to order', title: 'Soups & stews\nfor tomorrow', cta: 'See soups', bg: C.orange, fg: '#fff', photo: 'menu/assorted-egusi-soup', go: () => router.push({ pathname: '/store', params: { cat: 'soups' } }) },
  { id: 'catering', eyebrow: 'Weddings to office lunches', title: 'Catering that\npeople remember', cta: 'Get a quote', bg: C.dark, fg: '#fff', photo: 'events/pauline-at-85', go: () => router.push('/catering') },
  { id: 'equipment', eyebrow: 'From £5 per hire', title: 'Hire chafing\ndishes & more', cta: 'Browse', bg: '#FFE3E6', fg: C.dark, photo: 'hire/chafing-dishes', go: () => router.push('/equipment') },
];

function isOpen() {
  const h = new Date().getHours();
  return h >= business.orderHours.open && h < business.orderHours.close;
}

export default function Home() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { address } = useStore();
  const [slide, setSlide] = useState(0);
  const promoW = width - 48;
  const quick = products.filter((p) => p.quick);
  const popular = products.filter((p) => p.featured && !p.quick);
  const sweet = products.filter((p) => p.cat === 'pastries');
  const listRef = useRef<FlatList>(null);
  const open = isOpen();

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 110 }} showsVerticalScrollIndicator={false}>
        {/* Header: address + search (Glovo's coloured top block) */}
        <View style={[s.header, { paddingTop: insets.top + 10 }]}>
          <View style={s.headerRow}>
            <Pressable accessibilityRole="button" accessibilityLabel="Change delivery address" onPress={() => router.push('/address')} style={s.addr}>
              <View style={s.addrIcon}><Icon name="location" size={16} color={C.red} /></View>
              <View style={{ flexShrink: 1 }}>
                <Txt v="small" color="rgba(255,255,255,0.8)" style={{ fontSize: 12 }}>Deliver to</Txt>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Txt v="label" color="#fff" numberOfLines={1} style={{ fontSize: 15 }}>{address ? `${address.line1 || 'Home'}, ${address.postcode}` : 'Add your postcode'}</Txt>
                  <Icon name="chevron-down" size={16} color="#fff" />
                </View>
              </View>
            </Pressable>
            <Pressable accessibilityLabel="Profile" onPress={() => router.push('/profile')} style={s.avatar}>
              <Icon name="person" size={18} color={C.red} />
            </Pressable>
          </View>
          <Txt v="hero" color="#fff" style={{ marginTop: 18 }}>
            Hungry? <Txt v="hero" color="#FFD3D9" style={{ fontFamily: F.displayItalic }}>Let’s eat.</Txt>
          </Txt>
          <Pressable accessibilityRole="search" onPress={() => router.push('/search')} style={s.search}>
            <Icon name="search" size={20} color={C.muted} />
            <Txt color={C.muted}>Search jollof, egusi, puff puff…</Txt>
          </Pressable>
        </View>

        {/* Status strip */}
        <View style={[s.status, !open && { backgroundColor: C.orangeSoft }]}>
          <View style={[s.dot, { backgroundColor: open ? C.green : C.orange }]} />
          <Txt v="small" color={open ? '#16663A' : '#8A5300'} style={{ flex: 1 }}>
            {open ? 'Kitchen open · Quick meals arrive today' : 'Ordering opens at 07:00 · Schedule for tomorrow'}
          </Txt>
        </View>

        {/* Category bubbles */}
        <View style={s.grid}>
          {categories.map((c) => (
            <CategoryBubble key={c.id} label={shortName(c)} photo={c.cover} cutout={c.coverIsCutout} tint={c.tint} onPress={() => router.push({ pathname: '/store', params: { cat: c.id } })} />
          ))}
          <CategoryBubble label="Catering" photo="events/pauline-at-85" tint="#EFEAE6" onPress={() => router.push('/catering')} />
          <CategoryBubble label="Hire" photo="hire/chafing-dishes" tint="#EFEAE6" onPress={() => router.push('/equipment')} />
        </View>

        {/* Promo carousel */}
        <FlatList
          ref={listRef}
          data={promos}
          horizontal
          pagingEnabled={false}
          snapToInterval={promoW + 12}
          decelerationRate="fast"
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 24, gap: 12 }}
          keyExtractor={(i) => i.id}
          onScroll={(e) => setSlide(Math.round(e.nativeEvent.contentOffset.x / (promoW + 12)))}
          scrollEventThrottle={32}
          renderItem={({ item }) => (
            <Pressable onPress={item.go} style={[s.promo, { width: promoW, backgroundColor: item.bg }]}>
              <View style={{ flex: 1, justifyContent: 'center' }}>
                <Txt v="eyebrow" color={item.fg === '#fff' ? 'rgba(255,255,255,0.8)' : C.red}>{item.eyebrow}</Txt>
                <Txt v="h1" color={item.fg} style={{ fontSize: 23, lineHeight: 27, marginVertical: 6 }}>{item.title}</Txt>
                <View style={[s.promoCta, { backgroundColor: item.fg === '#fff' ? '#fff' : C.red }]}>
                  <Txt v="label" color={item.fg === '#fff' ? C.dark : '#fff'} style={{ fontSize: 13 }}>{item.cta}</Txt>
                  <Icon name="arrow-forward" size={14} color={item.fg === '#fff' ? C.dark : '#fff'} />
                </View>
              </View>
              <View style={s.promoArt}><Photo k={item.photo} style={s.promoPhoto} /></View>
            </Pressable>
          )}
        />
        <View style={s.dots}>
          {promos.map((p, i) => <View key={p.id} style={[s.pDot, i === slide && s.pDotOn]} />)}
        </View>

        {/* The store card (Glovo restaurant card) */}
        <SectionTitle title="Order from" />
        <Pressable onPress={() => router.push('/store')} style={({ pressed }) => [s.store, pressed && { transform: [{ scale: 0.99 }] }]}>
          <View style={s.storeHero}>
            <Photo k="menu/jollof-rice" style={StyleSheet.absoluteFill} />
            <View style={s.storeLogo}><Txt style={{ fontFamily: F.displayItalic, fontSize: 20, color: C.red }}>B</Txt></View>
          </View>
          <View style={{ padding: 14 }}>
            <Txt v="h3" style={{ fontSize: 17 }}>B-Lite Food · Hatfield</Txt>
            <View style={s.meta}>
              <Icon name="time-outline" size={13} color={C.muted} /><Txt v="small">{address?.eta ?? '30–50 min'}</Txt>
              <Txt v="small">·</Txt><Icon name="bicycle-outline" size={14} color={C.muted} /><Txt v="small">{address ? money(address.fee) : 'from £2.50'}</Txt>
            </View>
            <Txt v="small" style={{ marginTop: 4 }}>Nigerian · {products.length} dishes · Rice · Soups · Small chops</Txt>
          </View>
        </Pressable>

        <View style={{ height: 28 }} />
        <SectionTitle eyebrow="Arrives today" title="Quick meals" action="See all" onAction={() => router.push({ pathname: '/store', params: { cat: 'rice' } })} />
        <FlatList horizontal data={quick} keyExtractor={(p) => p.id} showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 14 }} renderItem={({ item }) => <ProductTile p={item} />} />

        <View style={{ height: 28 }} />
        <SectionTitle eyebrow="Most loved" title="Popular this week" action="See all" onAction={() => router.push('/store')} />
        <FlatList horizontal data={popular} keyExtractor={(p) => p.id} showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 14 }} renderItem={({ item }) => <ProductTile p={item} width={180} />} />

        <View style={{ height: 28 }} />
        <SectionTitle title="More from Blite" />
        <View style={{ flexDirection: 'row', gap: 12, paddingHorizontal: 16 }}>
          <Pressable onPress={() => router.push('/catering')} style={[s.service, { backgroundColor: C.dark }]}>
            <Icon name="restaurant" size={22} color="#FF8A98" />
            <Txt v="h3" color="#fff" style={{ marginTop: 10 }}>Catering</Txt>
            <Txt v="small" color="rgba(255,255,255,0.7)">Weddings, birthdays, corporate</Txt>
          </Pressable>
          <Pressable onPress={() => router.push('/equipment')} style={[s.service, { backgroundColor: C.orangeSoft }]}>
            <Icon name="cube" size={22} color={C.orange} />
            <Txt v="h3" style={{ marginTop: 10 }}>Equipment hire</Txt>
            <Txt v="small">Chafing dishes, plates, cutlery</Txt>
          </Pressable>
        </View>

        <View style={{ height: 28 }} />
        <SectionTitle title="Pastries & small chops" />
        <FlatList horizontal data={sweet} keyExtractor={(p) => p.id} showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 14 }} renderItem={({ item }) => <ProductTile p={item} />} />
      </ScrollView>
      <BasketBar safe={false} />
    </View>
  );
}

const s = StyleSheet.create({
  header: { backgroundColor: C.red, paddingHorizontal: 16, paddingBottom: 24, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  addr: { flexDirection: 'row', alignItems: 'center', gap: 10, flexShrink: 1 },
  addrIcon: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  avatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  search: { marginTop: 14, height: 50, borderRadius: 14, backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, ...shadow.md },
  status: { marginHorizontal: 16, marginTop: 14, flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, paddingHorizontal: 14, backgroundColor: C.greenSoft, borderRadius: 12 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingHorizontal: 12, rowGap: 14, marginTop: 20, marginBottom: 22 },
  promo: { height: 150, borderRadius: R.card, padding: 18, flexDirection: 'row', overflow: 'hidden' },
  promoCta: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10 },
  promoArt: { position: 'absolute', right: -26, top: 0, bottom: 0, justifyContent: 'center' },
  promoPhoto: { width: 150, height: 150, borderRadius: 75, borderWidth: 4, borderColor: 'rgba(255,255,255,0.35)' },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 12, marginBottom: 26 },
  pDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#DCD3CD' },
  pDotOn: { width: 18, backgroundColor: C.red },
  store: { marginHorizontal: 16, borderRadius: R.card, backgroundColor: '#fff', borderWidth: 1, borderColor: C.border, overflow: 'hidden', ...shadow.sm },
  storeHero: { height: 132, backgroundColor: '#FBE3D6', overflow: 'hidden' },
  storeLogo: { position: 'absolute', left: 14, bottom: 12, width: 44, height: 44, borderRadius: 12, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', ...shadow.md },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4, flexWrap: 'wrap' },
  service: { flex: 1, borderRadius: R.card, padding: 16, minHeight: 130 },
});
