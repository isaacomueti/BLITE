import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { ComponentProps, memo, ReactNode, useMemo } from 'react';
import { ActivityIndicator, ImageStyle, Platform, Pressable, StyleProp, StyleSheet, Text, TextProps, View, ViewStyle } from 'react-native';
import Animated, { FadeInDown, FadeOutDown, useAnimatedStyle, useSharedValue, withSequence, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SvgXml } from 'react-native-svg';

import BliteArt from '@/lib/art';
import { Product } from '@/lib/data';
import { photos } from '@/lib/photos';
import { useStore } from '@/lib/store';
import { C, F, money, R, shadow } from '@/lib/theme';

export type IconName = ComponentProps<typeof Ionicons>['name'];
export const Icon = ({ name, size = 22, color = C.dark }: { name: IconName; size?: number; color?: string }) => (
  <Ionicons name={name} size={size} color={color} />
);

export const tap = (style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light) => {
  if (Platform.OS !== 'web') Haptics.impactAsync(style).catch(() => {});
};

/* ---------- Text ---------- */
type TxtProps = TextProps & { v?: keyof typeof txt; color?: string };
export function Txt({ v = 'body', color, style, ...rest }: TxtProps) {
  return <Text {...rest} style={[txt[v], color ? { color } : null, style]} />;
}
const txt = StyleSheet.create({
  hero: { fontFamily: F.display, fontSize: 32, lineHeight: 36, color: C.dark, letterSpacing: -0.5 },
  h1: { fontFamily: F.display, fontSize: 26, lineHeight: 31, color: C.dark, letterSpacing: -0.3 },
  h2: { fontFamily: F.bold, fontSize: 20, lineHeight: 26, color: C.dark },
  h3: { fontFamily: F.bold, fontSize: 16, lineHeight: 21, color: C.dark },
  body: { fontFamily: F.regular, fontSize: 15, lineHeight: 21, color: C.body },
  small: { fontFamily: F.regular, fontSize: 13, lineHeight: 18, color: C.muted },
  label: { fontFamily: F.semibold, fontSize: 14, lineHeight: 19, color: C.dark },
  price: { fontFamily: F.bold, fontSize: 15, color: C.dark, fontVariant: ['tabular-nums'] },
  eyebrow: { fontFamily: F.bold, fontSize: 11, letterSpacing: 1.4, color: C.red, textTransform: 'uppercase' },
});

/* ---------- Photos ---------- */
/**
 * A photo: either a full URL from the website API, or a key for the bundled photos in
 * src/lib/photos.ts. `cutout` photos are transparent dishes shown whole; everything else fills
 * its box. Missing photos fall back to drawn art.
 */
export function Photo({ k, style, cutout, fallback = 'rice', alt }: { k: string | null | undefined; style?: StyleProp<ImageStyle>; cutout?: boolean; fallback?: string; alt?: string }) {
  const src = k ? (/^https?:\/\//.test(k) ? { uri: k } : photos[k]) : undefined;
  if (!src) {
    // Only the width is needed; React Native 0.88 types flatten() for animated styles, so read it loosely.
    const flat = (StyleSheet.flatten as (s: unknown) => { width?: unknown } | undefined)(style) ?? {};
    const size = typeof flat.width === 'number' ? flat.width : 100;
    return <View style={[style as StyleProp<ViewStyle>, { alignItems: 'center', justifyContent: 'center' }]}><Dish kind={fallback} seed={k ?? ''} size={size * 0.9} /></View>;
  }
  return <Image source={src} style={style} contentFit={cutout ? 'contain' : 'cover'} transition={180} accessibilityLabel={alt} accessible={!!alt} />;
}

/* ---------- Drawn food art (fallback, decorative) ---------- */
export const Dish = memo(function Dish({ kind, seed = '', size }: { kind: string; seed?: string; size: number }) {
  const xml = useMemo(() => BliteArt.dish(kind, seed), [kind, seed]);
  return <SvgXml xml={xml} width={size} height={size} />;
});

/* ---------- Buttons ---------- */
type BtnProps = {
  title: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'dark' | 'ghost';
  icon?: IconName;
  right?: ReactNode;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  size?: 'lg' | 'md' | 'sm';
};
export function Button({ title, onPress, variant = 'primary', icon, right, disabled, loading, style, size = 'lg' }: BtnProps) {
  const v = btn[variant];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled || loading}
      onPress={() => {
        tap();
        onPress?.();
      }}
      style={({ pressed }) => [
        styles.btn,
        size === 'md' && { height: 46 },
        size === 'sm' && { height: 38, paddingHorizontal: 14, borderRadius: 10 },
        v.box,
        pressed && { opacity: 0.88, transform: [{ scale: 0.985 }] },
        disabled && { backgroundColor: '#EDE7E3', borderColor: '#EDE7E3' },
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={v.fg} />
      ) : (
        <>
          {icon && <Icon name={icon} size={size === 'sm' ? 16 : 19} color={disabled ? '#A39C97' : v.fg} />}
          <Text style={[styles.btnText, size === 'sm' && { fontSize: 14 }, { color: disabled ? '#A39C97' : v.fg }]} numberOfLines={1}>
            {title}
          </Text>
          {right}
        </>
      )}
    </Pressable>
  );
}
const btn = {
  primary: { box: { backgroundColor: C.red, borderColor: C.red }, fg: '#fff' },
  secondary: { box: { backgroundColor: '#fff', borderColor: C.red }, fg: C.red },
  dark: { box: { backgroundColor: C.dark, borderColor: C.dark }, fg: '#fff' },
  ghost: { box: { backgroundColor: '#fff', borderColor: C.border }, fg: C.dark },
};

export function IconButton({ name, onPress, label, style, color = C.dark, size = 22 }: { name: IconName; onPress: () => void; label: string; style?: StyleProp<ViewStyle>; color?: string; size?: number }) {
  return (
    <Pressable accessibilityLabel={label} accessibilityRole="button" hitSlop={8} onPress={onPress} style={({ pressed }) => [styles.iconBtn, pressed && { opacity: 0.7 }, style]}>
      <Icon name={name} color={color} size={size} />
    </Pressable>
  );
}

/* ---------- Quantity stepper ---------- */
export function Stepper({ value, onChange, min = 0, compact }: { value: number; onChange: (n: number) => void; min?: number; compact?: boolean }) {
  const h = compact ? 32 : 44;
  return (
    <View style={[styles.stepper, { height: h }]}>
      <Pressable accessibilityLabel="Decrease quantity" onPress={() => { tap(); onChange(value - 1); }} disabled={value <= min} style={[styles.stepBtn, { width: h }]}>
        <Icon name={value <= 1 && min === 0 ? 'trash-outline' : 'remove'} size={compact ? 16 : 20} color={value <= min ? '#CFC8C3' : C.dark} />
      </Pressable>
      <Text style={[txt.price, { minWidth: 22, textAlign: 'center' }]}>{value}</Text>
      <Pressable accessibilityLabel="Increase quantity" onPress={() => { tap(); onChange(value + 1); }} style={[styles.stepBtn, { width: h }]}>
        <Icon name="add" size={compact ? 16 : 20} />
      </Pressable>
    </View>
  );
}

/* ---------- "+" add button with a quantity badge (Glovo pattern) ---------- */
export function AddBubble({ product, style }: { product: Product; style?: StyleProp<ViewStyle> }) {
  const { qtyOf, add } = useStore();
  const qty = qtyOf(product.id);
  const scale = useSharedValue(1);
  const anim = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const hasOptions = product.portions.length > 1 || product.addons.length > 0;
  if (!product.available) return <Pill tone="muted" style={style}>Sold out</Pill>;
  return (
    <Animated.View style={[anim, style]}>
      <Pressable
        accessibilityLabel={qty ? `${product.name}, ${qty} in basket. Add another` : `Add ${product.name}`}
        onPress={() => {
          tap(Haptics.ImpactFeedbackStyle.Medium);
          scale.set(withSequence(withSpring(1.18, { damping: 6 }), withSpring(1)));
          // Dishes with choices open the product sheet; simple ones add straight away.
          if (hasOptions) router.push({ pathname: '/product/[id]', params: { id: product.id } });
          else add(product.id);
        }}
        style={[styles.addBubble, qty > 0 && { backgroundColor: C.red, borderColor: C.red }]}>
        {qty > 0 ? <Text style={styles.addBubbleQty}>{qty}</Text> : <Icon name="add" size={22} color={C.red} />}
      </Pressable>
    </Animated.View>
  );
}

/* ---------- Product row (store list) ---------- */
export function ProductRow({ p }: { p: Product }) {
  return (
    <Pressable onPress={() => router.push({ pathname: '/product/[id]', params: { id: p.id } })} style={({ pressed }) => [styles.row, pressed && { backgroundColor: '#FBF7F4' }]}>
      <View style={{ flex: 1, paddingRight: 14 }}>
        <Txt v="h3" numberOfLines={2}>{p.name}</Txt>
        <Txt v="small" numberOfLines={2} style={{ marginTop: 4 }}>{p.desc}</Txt>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
          <Txt v="price">{p.portions.length > 1 ? 'from ' : ''}{money(p.price)}</Txt>
          {p.featured ? <Pill tone="orange" icon="flame">Popular</Pill> : null}
        </View>
      </View>
      <View style={styles.rowImg}>
        <Photo k={p.photo} style={styles.rowPhoto} alt={p.name} />
        <AddBubble product={p} style={{ position: 'absolute', right: -6, bottom: -6 }} />
      </View>
    </Pressable>
  );
}

/* ---------- Product tile (horizontal carousels) ---------- */
export function ProductTile({ p, width = 156 }: { p: Product; width?: number }) {
  return (
    <Pressable onPress={() => router.push({ pathname: '/product/[id]', params: { id: p.id } })} style={({ pressed }) => [{ width }, pressed && { opacity: 0.9 }]}>
      <View style={[styles.tileImg, { width, height: width * 0.86 }]}>
        <Photo k={p.photo} style={{ width, height: width * 0.86, borderRadius: R.img }} alt={p.name} />
        <AddBubble product={p} style={{ position: 'absolute', right: 8, bottom: 8 }} />
      </View>
      <Txt v="label" numberOfLines={1} style={{ marginTop: 8 }}>{p.name}</Txt>
      <Txt v="small" style={{ marginTop: 1 }}>
        {p.portions.length > 1 ? 'from ' : ''}<Text style={{ fontFamily: F.bold, color: C.dark }}>{money(p.price)}</Text>
      </Txt>
    </Pressable>
  );
}

/* ---------- Category bubble (Glovo home grid) ---------- */
export function CategoryBubble({ label, photo, cutout, dish, tint, onPress, size = 72 }: { label: string; photo?: string | null; cutout?: boolean; dish?: string; tint: string; onPress: () => void; size?: number }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={() => { tap(); onPress(); }} style={({ pressed }) => [{ alignItems: 'center', width: size + 14 }, pressed && { transform: [{ scale: 0.95 }] }]}>
      <View style={[styles.bubble, { width: size, height: size, borderRadius: size / 2, backgroundColor: tint }]}>
        {photo !== undefined ? (
          <Photo k={photo} cutout={cutout} style={cutout ? { width: size * 0.92, height: size * 0.92 } : { width: size, height: size }} />
        ) : dish ? (
          <Dish kind={dish} seed={'cat' + label} size={size * 0.86} />
        ) : null}
      </View>
      <Txt v="label" numberOfLines={1} style={{ marginTop: 6, fontSize: 13 }}>{label}</Txt>
    </Pressable>
  );
}

/* ---------- Pill ---------- */
export function Pill({ children, tone = 'red', icon, style }: { children: ReactNode; tone?: 'red' | 'green' | 'orange' | 'white' | 'muted'; icon?: IconName; style?: StyleProp<ViewStyle> }) {
  const t = { red: [C.blush, C.red], green: [C.greenSoft, C.green], orange: [C.orangeSoft, '#B56A00'], white: ['rgba(255,255,255,0.95)', C.red], muted: ['#F2EEEB', C.body] }[tone];
  return (
    <View style={[styles.pill, { backgroundColor: t[0] }, style]}>
      {icon && <Icon name={icon} size={11} color={t[1]} />}
      <Text style={[styles.pillText, { color: t[1] }]}>{children}</Text>
    </View>
  );
}

export function SectionTitle({ title, action, onAction, eyebrow }: { title: string; action?: string; onAction?: () => void; eyebrow?: string }) {
  return (
    <View style={styles.sectionTitle}>
      <View style={{ flex: 1 }}>
        {eyebrow && <Txt v="eyebrow" style={{ marginBottom: 2 }}>{eyebrow}</Txt>}
        <Txt v="h2">{title}</Txt>
      </View>
      {action && (
        <Pressable onPress={onAction} hitSlop={8}>
          <Txt v="label" color={C.red}>{action}</Txt>
        </Pressable>
      )}
    </View>
  );
}

/* ---------- Floating basket bar (Glovo "View basket") ---------- */
export function BasketBar({ bottom = 0, safe = true }: { bottom?: number; safe?: boolean }) {
  const { count, subtotal } = useStore();
  const insets = useSafeAreaInsets();
  if (!count) return null;
  return (
    <Animated.View entering={FadeInDown.springify().damping(16)} exiting={FadeOutDown} style={[styles.basketWrap, { bottom: bottom + (safe ? Math.max(insets.bottom, 12) : 12) }]}>
      <Pressable accessibilityRole="button" accessibilityLabel={`View basket, ${count} items, ${money(subtotal)}`} onPress={() => { tap(); router.push('/cart'); }} style={({ pressed }) => [styles.basket, pressed && { backgroundColor: C.redDark }]}>
        <View style={styles.basketCount}><Text style={styles.basketCountText}>{count}</Text></View>
        <Text style={styles.basketText}>View basket</Text>
        <Text style={styles.basketTotal}>{money(subtotal)}</Text>
      </Pressable>
    </Animated.View>
  );
}

export function EmptyState({ icon, title, text, action, onAction }: { icon: IconName; title: string; text: string; action?: string; onAction?: () => void }) {
  return (
    <View style={{ alignItems: 'center', paddingVertical: 48, paddingHorizontal: 32 }}>
      <View style={styles.emptyIcon}><Icon name={icon} size={34} color={C.red} /></View>
      <Txt v="h1" style={{ textAlign: 'center', marginBottom: 6 }}>{title}</Txt>
      <Txt style={{ textAlign: 'center', marginBottom: 22 }}>{text}</Txt>
      {action && <Button title={action} onPress={onAction} style={{ alignSelf: 'stretch' }} />}
    </View>
  );
}

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function ListRow({ icon, title, sub, onPress, right }: { icon: IconName; title: string; sub?: string; onPress?: () => void; right?: ReactNode }) {
  return (
    <Pressable onPress={onPress} disabled={!onPress} style={({ pressed }) => [styles.listRow, pressed && { backgroundColor: '#FBF7F4' }]}>
      <View style={styles.listIcon}><Icon name={icon} size={20} color={C.red} /></View>
      <View style={{ flex: 1 }}>
        <Txt v="label">{title}</Txt>
        {sub ? <Txt v="small" numberOfLines={2}>{sub}</Txt> : null}
      </View>
      {right ?? (onPress ? <Icon name="chevron-forward" size={18} color={C.muted} /> : null)}
    </Pressable>
  );
}

export function SumRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 }}>
      <Txt v={bold ? 'h3' : 'body'}>{label}</Txt>
      <Txt v={bold ? 'h3' : 'body'} color={C.dark}>{value}</Txt>
    </View>
  );
}

const styles = StyleSheet.create({
  btn: { height: 54, borderRadius: R.btn, borderWidth: 1.5, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 20 },
  btnText: { fontFamily: F.semibold, fontSize: 16 },
  iconBtn: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', ...shadow.sm },
  stepper: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: C.border, borderRadius: 12, backgroundColor: '#fff' },
  stepBtn: { height: '100%', alignItems: 'center', justifyContent: 'center' },
  addBubble: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#fff', borderWidth: 1.5, borderColor: C.border, alignItems: 'center', justifyContent: 'center', ...shadow.sm },
  addBubbleQty: { color: '#fff', fontFamily: F.bold, fontSize: 15 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 16, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.border, backgroundColor: C.bg },
  rowImg: { width: 108, height: 108, borderRadius: R.img, backgroundColor: C.blush },
  rowPhoto: { width: 108, height: 108, borderRadius: R.img },
  tileImg: { borderRadius: R.img, backgroundColor: C.blush, alignItems: 'center', justifyContent: 'center', overflow: 'visible' },
  bubble: { alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: R.pill, alignSelf: 'flex-start' },
  pillText: { fontFamily: F.semibold, fontSize: 11 },
  sectionTitle: { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 16, marginBottom: 12 },
  basketWrap: { position: 'absolute', left: 16, right: 16 },
  basket: { height: 56, borderRadius: 16, backgroundColor: C.red, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, gap: 12, ...shadow.red },
  basketCount: { minWidth: 32, height: 32, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.22)', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  basketCountText: { color: '#fff', fontFamily: F.bold, fontSize: 15 },
  basketText: { flex: 1, color: '#fff', fontFamily: F.semibold, fontSize: 16 },
  basketTotal: { color: '#fff', fontFamily: F.bold, fontSize: 16, fontVariant: ['tabular-nums'] },
  emptyIcon: { width: 84, height: 84, borderRadius: 42, backgroundColor: C.blush, alignItems: 'center', justifyContent: 'center', marginBottom: 18 },
  card: { backgroundColor: '#fff', borderRadius: R.card, borderWidth: 1, borderColor: C.border, padding: 16 },
  listRow: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14, paddingHorizontal: 16, backgroundColor: '#fff' },
  listIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: C.blush, alignItems: 'center', justifyContent: 'center' },
});
