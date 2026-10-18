/**
 * App state: basket, delivery address, favourites and the signed-in account.
 * Basket, address and favourites live on the device; orders and the account live on the
 * website (src/lib/api.ts), so they match what the customer sees on blitefood.co.uk.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import { api, ApiOrder, ApiUser, BasketItem, loadToken, setToken } from './api';
import { equipmentById, onCatalogueChange, productById, toApiDate } from './data';

export type CartLine = {
  key: string;
  kind: 'food' | 'equipment';
  /** Product or equipment slug. */
  id: string;
  /** Food: the size id. */
  portion: string;
  addons: string[];
  qty: number;
  /** Equipment hire: first day (YYYY-MM-DD) and number of days (1–4). */
  start?: string;
  days?: number;
};
/** A delivery address in the website's county → area model. */
export type Address = { countyId: number; county: string; areaId: number; area: string; eta: string | null; line1: string; city: string; postcode: string };

type State = { cart: CartLine[]; address: Address | null; favs: string[]; phone: string };
const EMPTY: State = { cart: [], address: null, favs: [], phone: '' };
const KEY = 'blite.state.v2';

export function unitPrice(line: Pick<CartLine, 'kind' | 'id' | 'portion' | 'addons' | 'days'>) {
  if (line.kind === 'equipment') {
    const e = equipmentById(line.id);
    return e ? e.price * (line.days ?? 1) : 0;
  }
  const p = productById(line.id);
  if (!p) return 0;
  const portion = p.portions.find((x) => x.id === line.portion) ?? p.portions[0];
  const addons = line.addons.reduce((s, a) => s + (p.addons.find((x) => x.id === a)?.price ?? 0), 0);
  return (portion?.price ?? p.price) + addons;
}

export function lineLabel(line: CartLine) {
  if (line.kind === 'equipment') {
    const d = line.days ?? 1;
    const start = line.start ? new Date(line.start + 'T12:00:00').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }) : '';
    return `${d} ${d === 1 ? 'day' : 'days'} from ${start}`;
  }
  const p = productById(line.id);
  if (!p) return '';
  const portion = p.portions.find((x) => x.id === line.portion);
  return portion && p.portions.length > 1 ? portion.name : '';
}

export const lineName = (l: CartLine) => (l.kind === 'equipment' ? equipmentById(l.id)?.name : productById(l.id)?.name) ?? '';
export const linePhoto = (l: CartLine) => (l.kind === 'equipment' ? equipmentById(l.id)?.photo : productById(l.id)?.photo) ?? null;

/** Basket in the shape the website API prices and orders. */
export function toBasketItems(cart: CartLine[]): BasketItem[] {
  const out: BasketItem[] = [];
  for (const l of cart) {
    if (l.kind === 'equipment') {
      const e = equipmentById(l.id);
      if (e) out.push({ type: 'equipment', equipment_id: e.dbId, rental_start: l.start ?? toApiDate(new Date(Date.now() + 864e5)), days: l.days ?? 1, quantity: l.qty });
    } else {
      const p = productById(l.id);
      if (p) out.push({ type: 'food', food_id: p.dbId, size_id: Number(l.portion), quantity: l.qty });
    }
  }
  return out;
}

function useStoreValue() {
  const [state, setState] = useState<State>(EMPTY);
  const [user, setUser] = useState<ApiUser | null>(null);
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [ready, setReady] = useState(false);
  // Bumped when the menu loads or refreshes, so basket prices and totals are recalculated.
  const [catalogueVersion, setCatalogueVersion] = useState(0);
  useEffect(() => onCatalogueChange(() => setCatalogueVersion((v) => v + 1)), []);
  const hydrated = useRef(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(KEY);
        if (raw) setState({ ...EMPTY, ...JSON.parse(raw) });
      } catch {}
      const t = await loadToken();
      if (t) {
        // Show the cached profile at once; confirm the token in the background.
        AsyncStorage.getItem('blite.user').then((u) => u && setUser(JSON.parse(u))).catch(() => {});
        api<ApiUser>('/me')
          .then((u) => setUser(u))
          .catch((e) => {
            if (e?.status === 401) setUser(null);
          });
      }
      hydrated.current = true;
      setReady(true);
    })();
  }, []);

  useEffect(() => {
    if (hydrated.current) AsyncStorage.setItem(KEY, JSON.stringify(state)).catch(() => {});
  }, [state]);
  useEffect(() => {
    if (!hydrated.current) return;
    if (user) AsyncStorage.setItem('blite.user', JSON.stringify(user)).catch(() => {});
    else AsyncStorage.removeItem('blite.user').catch(() => {});
  }, [user]);

  /* ---------- basket ---------- */
  const add = useCallback((id: string, opts: { portion?: string; addons?: string[]; qty?: number } = {}) => {
    const p = productById(id);
    if (!p || !p.available) return;
    const portion = opts.portion ?? p.portions[0]?.id;
    if (!portion) return;
    const addons = [...(opts.addons ?? [])].sort();
    const key = ['food', id, portion, addons.join('+')].join('|');
    const qty = opts.qty ?? 1;
    setState((s) => {
      const ex = s.cart.find((l) => l.key === key);
      const cart = ex ? s.cart.map((l) => (l.key === key ? { ...l, qty: Math.min(99, l.qty + qty) } : l)) : [...s.cart, { key, kind: 'food' as const, id, portion, addons, qty }];
      return { ...s, cart };
    });
  }, []);

  /** Add or update an equipment hire. One line per item, like the website basket. */
  const hire = useCallback((id: string, opts: { start: string; days: number; qty: number }) => {
    const key = 'equipment|' + id;
    setState((s) => {
      const line: CartLine = { key, kind: 'equipment', id, portion: '', addons: [], qty: Math.max(1, Math.min(100, opts.qty)), start: opts.start, days: opts.days };
      const ex = s.cart.some((l) => l.key === key);
      return { ...s, cart: ex ? s.cart.map((l) => (l.key === key ? line : l)) : [...s.cart, line] };
    });
  }, []);

  const setQty = useCallback((key: string, qty: number) => {
    setState((s) => ({ ...s, cart: qty <= 0 ? s.cart.filter((l) => l.key !== key) : s.cart.map((l) => (l.key === key ? { ...l, qty: Math.min(qty, 99) } : l)) }));
  }, []);
  const clearCart = useCallback(() => setState((s) => ({ ...s, cart: [] })), []);

  /** Quantity of a product across all its option combinations (for the "+ / 2" badges). */
  const qtyOf = useCallback((id: string) => state.cart.filter((l) => l.kind === 'food' && l.id === id).reduce((s, l) => s + l.qty, 0), [state.cart]);

  const setAddress = useCallback((address: Address | null) => setState((s) => ({ ...s, address })), []);
  const setPhone = useCallback((phone: string) => setState((s) => ({ ...s, phone })), []);
  const toggleFav = useCallback(
    (id: string) => {
      const on = !state.favs.includes(id);
      setState((s) => ({ ...s, favs: on ? [...s.favs.filter((x) => x !== id), id] : s.favs.filter((x) => x !== id) }));
      return on;
    },
    [state.favs]
  );

  /* ---------- account ---------- */
  const signIn = useCallback(async (email: string, password: string) => {
    const r = await api<{ token: string; user: ApiUser }>('/auth/login', { method: 'POST', body: { email, password, device_name: 'B-Lite app' } });
    await setToken(r.token);
    setUser(r.user);
    return r.user;
  }, []);
  const register = useCallback(async (body: { name: string; email: string; password: string; password_confirmation: string; terms: boolean }) => {
    const r = await api<{ token: string; user: ApiUser }>('/auth/register', { method: 'POST', body: { ...body, device_name: 'B-Lite app' } });
    await setToken(r.token);
    setUser(r.user);
    return r.user;
  }, []);
  const signOut = useCallback(async () => {
    await api('/auth/logout', { method: 'POST' }).catch(() => {});
    await setToken(null);
    setUser(null);
    setOrders([]);
  }, []);
  const updateName = useCallback(async (name: string) => {
    const u = await api<ApiUser>('/me', { method: 'PUT', body: { name } });
    setUser(u);
  }, []);

  /* ---------- orders (from the website) ---------- */
  const refreshOrders = useCallback(async () => {
    if (!user) return;
    const r = await api<{ data: ApiOrder[] }>('/orders');
    setOrders(r.data);
  }, [user]);
  useEffect(() => {
    if (!user) return;
    let live = true;
    api<{ data: ApiOrder[] }>('/orders')
      .then((r) => live && setOrders(r.data))
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [user]);

  const count = state.cart.reduce((s, l) => s + l.qty, 0);
  // Prices come from the module-level catalogue, which React can't see change: recompute when
  // the basket or the catalogue version changes (the React Compiler would otherwise keep a stale
  // total from before the menu loaded).
  const { subtotal, caution } = useMemo(
    () => ({
      subtotal: state.cart.reduce((s, l) => s + unitPrice(l) * l.qty, 0),
      // The website charges an item's caution fee once per booking line, whatever the quantity.
      caution: state.cart.reduce((s, l) => s + (l.kind === 'equipment' ? equipmentById(l.id)?.caution ?? 0 : 0), 0),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state.cart, catalogueVersion]
  );

  return useMemo(
    () => ({
      ...state, ready, user, orders, count, subtotal, caution, catalogueVersion,
      add, hire, setQty, clearCart, qtyOf, setAddress, setPhone, toggleFav,
      signIn, register, signOut, updateName, refreshOrders, setOrders,
    }),
    [state, ready, user, orders, count, subtotal, caution, catalogueVersion, add, hire, setQty, clearCart, qtyOf, setAddress, setPhone, toggleFav, signIn, register, signOut, updateName, refreshOrders]
  );
}

type Store = ReturnType<typeof useStoreValue>;
const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const value = useStoreValue();
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useStore must be used inside <StoreProvider>');
  return v;
}
