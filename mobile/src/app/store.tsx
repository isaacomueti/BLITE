import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { LayoutChangeEvent, NativeScrollEvent, NativeSyntheticEvent, Pressable, ScrollView, ScrollViewInstance, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BasketBar, Icon, IconButton, Photo, Pill, ProductRow, Txt } from '@/components/ui';
import { business, categories, products } from '@/lib/data';
import { useStore } from '@/lib/store';
import { C, F, R, shadow } from '@/lib/theme';

type Section = { id: string; title: string; items: typeof products };

export default function Store() {
  const insets = useSafeAreaInsets();
  const { cat } = useLocalSearchParams<{ cat?: string }>();
  const { address } = useStore();

  const sections = useMemo<Section[]>(
    () => [
      { id: 'popular', title: 'Popular', items: products.filter((p) => p.featured) },
      ...categories.map((c) => ({ id: c.id, title: c.name, items: products.filter((p) => p.cat === c.id) })),
    ].filter((sct) => sct.items.length > 0),
    []
  );

  const scroll = useRef<ScrollViewInstance>(null);
  const tabs = useRef<ScrollViewInstance>(null);
  const offsets = useRef<Record<string, number>>({});
  const tabX = useRef<Record<string, number>>({});
  const tabsTop = useRef(0);
  const listTop = useRef(0);
  const [active, setActive] = useState(sections[0].id);
  const [solid, setSolid] = useState(false);
  const [pinned, setPinned] = useState(false);
  const jumping = useRef(false);
  const TAB_H = 52;
  const headerH = insets.top + 56;

  const jumpTo = (id: string, animated = true) => {
    const y = offsets.current[id];
    if (y == null) return;
    jumping.current = true;
    setActive(id);
    scroll.current?.scrollTo({ y: listTop.current + y - TAB_H - headerH + 1, animated });
    setTimeout(() => (jumping.current = false), animated ? 450 : 50);
  };

  // Deep link from a home category bubble
  const didJump = useRef(false);
  const onSectionLayout = (id: string) => (e: LayoutChangeEvent) => {
    offsets.current[id] = e.nativeEvent.layout.y;
    if (!didJump.current && cat && id === cat) {
      didJump.current = true;
      setTimeout(() => jumpTo(cat, false), 60);
    }
  };

  useEffect(() => {
    const x = tabX.current[active];
    if (x != null) tabs.current?.scrollTo({ x: Math.max(0, x - 24), animated: true });
  }, [active]);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = e.nativeEvent.contentOffset.y;
    setSolid(y > 120);
    setPinned(y >= tabsTop.current - headerH);
    if (jumping.current) return;
    const probe = y - listTop.current + TAB_H + headerH + 8;
    let cur = sections[0].id;
    for (const sct of sections) if ((offsets.current[sct.id] ?? Infinity) <= probe) cur = sct.id;
    if (cur !== active) setActive(cur);
  };

  const tabBar = (ref?: typeof tabs) => (
    <View style={s.tabsWrap}>
      <ScrollView ref={ref} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 12, gap: 6, alignItems: 'center' }}>
        {sections.map((sct) => (
          <Pressable
            key={sct.id}
            onLayout={ref ? (e) => (tabX.current[sct.id] = e.nativeEvent.layout.x) : undefined}
            onPress={() => jumpTo(sct.id)}
            style={[s.tab, active === sct.id && s.tabOn]}
            accessibilityRole="tab"
            accessibilityState={{ selected: active === sct.id }}>
            <Text style={[s.tabText, active === sct.id && { color: '#fff' }]}>{sct.title}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      {/* Floating header that turns solid on scroll */}
      <View style={[s.topbar, { paddingTop: insets.top + 6, height: headerH }, solid && s.topbarSolid]}>
        <IconButton name="arrow-back" label="Back" onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} />
        <Text style={[s.topTitle, { opacity: solid ? 1 : 0 }]} numberOfLines={1}>B-Lite Food</Text>
        <IconButton name="search" label="Search the menu" onPress={() => router.push('/search')} />
      </View>

      {/* Category tabs pinned under the header once the in-page tabs scroll away */}
      {pinned && <View style={[s.pinned, { top: headerH }]}>{tabBar(tabs)}</View>}

      <ScrollView ref={scroll} onScroll={onScroll} scrollEventThrottle={16} contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        {/* Hero + store info */}
        <View>
          <View style={[s.hero, { height: 200 + insets.top }]}>
            <Photo k="menu/jollof-rice" style={StyleSheet.absoluteFill} />
          </View>
          <View style={s.info}>
            <View style={s.logo}><Text style={{ fontFamily: F.displayItalic, fontSize: 26, color: C.red }}>B</Text></View>
            <Txt v="h1" style={{ marginTop: 8 }}>B-Lite Food</Txt>
            <Txt v="small" style={{ marginTop: 2 }}>Authentic Nigerian{business.address ? ' · ' + business.address : ''}</Txt>
            <View style={s.stats}>
              <View style={s.stat}><View style={s.statRow}><Icon name="hourglass-outline" size={14} /><Txt v="label">24 hours</Txt></View><Txt v="small">Notice</Txt></View>
              <View style={s.statSep} />
              <View style={s.stat}><View style={s.statRow}><Icon name="restaurant-outline" size={14} /><Txt v="label">{products.length}</Txt></View><Txt v="small">Dishes</Txt></View>
              <View style={s.statSep} />
              <View style={s.stat}><View style={s.statRow}><Icon name="bicycle-outline" size={15} /><Txt v="label" numberOfLines={1}>{address ? address.area : 'Choose area'}</Txt></View><Txt v="small">Delivery</Txt></View>
            </View>
            <View style={s.notice}>
              <Icon name="information-circle" size={18} color="#8A5300" />
              <Txt v="small" color="#8A5300" style={{ flex: 1 }}>Everything is cooked fresh to order. Choose a delivery or pickup time at least 24 hours ahead at checkout.</Txt>
            </View>
          </View>
        </View>

        {/* In-page category tabs */}
        <View style={{ marginTop: 16 }} onLayout={(e) => (tabsTop.current = e.nativeEvent.layout.y)}>{tabBar()}</View>

        {/* Sections */}
        <View onLayout={(e) => (listTop.current = e.nativeEvent.layout.y)}>
          {sections.map((sct) => (
            <View key={sct.id} onLayout={onSectionLayout(sct.id)}>
              <View style={s.secHead}>
                <Txt v="h2">{sct.title}</Txt>
                {sct.id === 'popular' && <Pill tone="orange" icon="flame">Top picks</Pill>}
              </View>
              {sct.items.map((p) => <ProductRow key={p.id} p={p} />)}
            </View>
          ))}
          <View style={{ padding: 20 }}>
            <Txt v="small" style={{ textAlign: 'center' }}>Got an allergy? Tell us before you order — our kitchen handles all 14 major allergens.</Txt>
          </View>
        </View>
      </ScrollView>
      <BasketBar />
    </View>
  );
}

const s = StyleSheet.create({
  topbar: { position: 'absolute', left: 0, right: 0, top: 0, zIndex: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12 },
  topbarSolid: { backgroundColor: C.bg, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.border },
  topTitle: { flex: 1, textAlign: 'center', fontFamily: F.bold, fontSize: 16, color: C.dark },
  hero: { backgroundColor: '#FBE3D6', overflow: 'hidden' },
  info: { marginTop: -28, marginHorizontal: 16, backgroundColor: '#fff', borderRadius: R.card, padding: 16, paddingTop: 30, ...shadow.md },
  logo: { position: 'absolute', top: -26, left: 16, width: 54, height: 54, borderRadius: 16, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: C.border },
  stats: { flexDirection: 'row', marginTop: 14, paddingVertical: 10, borderTopWidth: 1, borderBottomWidth: 1, borderColor: C.border },
  stat: { flex: 1, alignItems: 'center' },
  statRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statSep: { width: 1, backgroundColor: C.border },
  notice: { flexDirection: 'row', gap: 8, marginTop: 12, backgroundColor: C.orangeSoft, padding: 10, borderRadius: 12 },
  pinned: { position: 'absolute', left: 0, right: 0, zIndex: 9 },
  tabsWrap: { height: 52, backgroundColor: C.bg, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.border, justifyContent: 'center' },
  tab: { paddingHorizontal: 14, height: 36, borderRadius: 18, justifyContent: 'center' },
  tabOn: { backgroundColor: C.dark },
  tabText: { fontFamily: F.semibold, fontSize: 14, color: C.dark },
  secHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 24, paddingBottom: 4 },
});
