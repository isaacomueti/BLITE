import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BasketBar, EmptyState, Icon, ProductRow, Txt } from '@/components/ui';
import { categories, products } from '@/lib/data';
import { C, F } from '@/lib/theme';

const SUGGESTED = ['Jollof', 'Egusi', 'Puff puff', 'Goat meat', 'Plantain', 'Zobo'];

export default function Search() {
  const insets = useSafeAreaInsets();
  const [q, setQ] = useState('');
  const query = q.trim().toLowerCase();
  const results = useMemo(
    () => (query ? products.filter((p) => (p.name + ' ' + p.desc + ' ' + p.cat).toLowerCase().includes(query)) : []),
    [query]
  );

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={[s.head, { paddingTop: insets.top + 10 }]}>
        <Txt v="h1" style={{ marginBottom: 12 }}>Search</Txt>
        <View style={s.box}>
          <Icon name="search" size={20} color={C.muted} />
          <TextInput
            value={q}
            onChangeText={setQ}
            placeholder="Dishes, soups, small chops…"
            placeholderTextColor="#B5ADA8"
            returnKeyType="search"
            autoCorrect={false}
            style={s.input}
            accessibilityLabel="Search the menu"
          />
          {!!q && (
            <Pressable onPress={() => setQ('')} hitSlop={10} accessibilityLabel="Clear search">
              <Icon name="close-circle" size={20} color={C.muted} />
            </Pressable>
          )}
        </View>
      </View>

      {!query ? (
        <View style={{ padding: 16 }}>
          <Txt v="h3" style={{ marginBottom: 10 }}>Popular searches</Txt>
          <View style={s.chips}>
            {SUGGESTED.map((t) => (
              <Pressable key={t} onPress={() => setQ(t)} style={s.chip}>
                <Icon name="trending-up" size={14} color={C.red} />
                <Text style={s.chipText}>{t}</Text>
              </Pressable>
            ))}
          </View>
          <Txt v="h3" style={{ marginTop: 24, marginBottom: 6 }}>Categories</Txt>
          {categories.map((c) => (
            <Pressable key={c.id} onPress={() => router.push({ pathname: '/store', params: { cat: c.id } })} style={s.cat}>
              <Txt v="label" style={{ flex: 1 }}>{c.name}</Txt>
              <Txt v="small">{products.filter((p) => p.cat === c.id).length} dishes</Txt>
              <Icon name="chevron-forward" size={16} color={C.muted} />
            </Pressable>
          ))}
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(p) => p.id}
          renderItem={({ item }) => <ProductRow p={item} />}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 100 }}
          ListEmptyComponent={<EmptyState icon="search" title="Nothing delicious here yet." text={`No dishes match “${q.trim()}”. Try another search.`} />}
        />
      )}
      <BasketBar safe={false} />
    </View>
  );
}

const s = StyleSheet.create({
  head: { paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.border },
  box: { height: 50, borderRadius: 14, backgroundColor: '#F3EEEA', flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14 },
  input: { flex: 1, fontFamily: F.medium, fontSize: 16, color: C.dark, height: '100%' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, height: 38, borderRadius: 19, borderWidth: 1.5, borderColor: C.border, backgroundColor: '#fff' },
  chipText: { fontFamily: F.semibold, fontSize: 14, color: C.dark },
  cat: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.border },
});
