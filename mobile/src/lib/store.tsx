/**
 * App state: basket, delivery address, orders and favourites, persisted on device.
 * PRODUCTION: orders are created by the Revolut payment webhook on the server and read back
 * from the API — the app never marks an order as paid itself.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import { productById } from './data';

export type CartLine = { key: string; id: string; portion: string; addons: string[]; qty: number };
export type Address = { postcode: string; line1: string; fee: number; eta: string };
export type Order = {
  id: string;
  placedAt: string;
  dueAt: string;
  type: 'delivery' | 'pickup';
  lines: CartLine[];
  subtotal: number;
  fee: number;
  total: number;
  address?: Address;
  notes?: string;
  payment: string;
};

type State = { cart: CartLine[]; address: Address | null; orders: Order[]; favs: string[] };
const EMPTY: State = { cart: [], address: null, orders: [], favs: [] };
const KEY = 'blite.state.v1';

export function unitPrice(line: Pick<CartLine, 'id' | 'portion' | 'addons'>) {
  const p = productById(line.id);
  if (!p) return 0;
  // Each portion carries its own live price; add-ons are added on top.
  const portion = p.portions.find((x) => x.id === line.portion) ?? p.portions[0];
  const addons = line.addons.reduce((s, a) => s + (p.addons.find((x) => x.id === a)?.price ?? 0), 0);
  return (portion?.price ?? p.price) + addons;
}

export function lineLabel(line: CartLine) {
  const p = productById(line.id);
  if (!p) return '';
  const bits: string[] = [];
  const portion = p.portions.find((x) => x.id === line.portion);
  if (portion && p.portions.length > 1) bits.push(portion.name);
  line.addons.forEach((a) => {
    const x = p.addons.find((y) => y.id === a);
    if (x) bits.push('+ ' + x.name);
  });
  return bits.join(' · ');
}

function useStoreValue() {
  const [state, setState] = useState<State>(EMPTY);
  const [ready, setReady] = useState(false);
  const hydrated = useRef(false);

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((raw) => {
        if (raw) setState({ ...EMPTY, ...JSON.parse(raw) });
      })
      .catch(() => {})
      .finally(() => {
        hydrated.current = true;
        setReady(true);
      });
  }, []);

  useEffect(() => {
    if (hydrated.current) AsyncStorage.setItem(KEY, JSON.stringify(state)).catch(() => {});
  }, [state]);

  const add = useCallback((id: string, opts: { portion?: string; addons?: string[]; qty?: number } = {}) => {
    const p = productById(id);
    if (!p) return;
    const portion = opts.portion ?? p.portions[0].id;
    const addons = [...(opts.addons ?? [])].sort();
    const key = [id, portion, addons.join('+')].join('|');
    const qty = opts.qty ?? 1;
    setState((s) => {
      const ex = s.cart.find((l) => l.key === key);
      const cart = ex ? s.cart.map((l) => (l.key === key ? { ...l, qty: Math.min(99, l.qty + qty) } : l)) : [...s.cart, { key, id, portion, addons, qty }];
      return { ...s, cart };
    });
  }, []);

  const setQty = useCallback((key: string, qty: number) => {
    setState((s) => ({ ...s, cart: qty <= 0 ? s.cart.filter((l) => l.key !== key) : s.cart.map((l) => (l.key === key ? { ...l, qty: Math.min(qty, 99) } : l)) }));
  }, []);

  /** Quantity of a product across all its option combinations (for the "+ / 2" badges). */
  const qtyOf = useCallback((id: string) => state.cart.filter((l) => l.id === id).reduce((s, l) => s + l.qty, 0), [state.cart]);

  const setAddress = useCallback((address: Address | null) => setState((s) => ({ ...s, address })), []);
  const toggleFav = useCallback(
    (id: string) => {
      const on = !state.favs.includes(id);
      setState((s) => ({ ...s, favs: on ? [...s.favs.filter((x) => x !== id), id] : s.favs.filter((x) => x !== id) }));
      return on;
    },
    [state.favs]
  );

  const placeOrder = useCallback(
    (o: Omit<Order, 'id' | 'placedAt' | 'lines' | 'subtotal' | 'total'>) => {
      const subtotal = state.cart.reduce((s, l) => s + unitPrice(l) * l.qty, 0);
      const order: Order = {
        ...o,
        id: 'BL-' + (1048 + state.orders.length),
        placedAt: new Date().toISOString(),
        lines: state.cart,
        subtotal,
        total: subtotal + o.fee,
      };
      setState((s) => ({ ...s, cart: [], orders: [order, ...s.orders] }));
      return order;
    },
    [state.cart, state.orders.length]
  );

  const count = state.cart.reduce((s, l) => s + l.qty, 0);
  const subtotal = state.cart.reduce((s, l) => s + unitPrice(l) * l.qty, 0);
  const needsTomorrow = state.cart.some((l) => !productById(l.id)?.quick);

  return useMemo(
    () => ({ ...state, ready, count, subtotal, needsTomorrow, add, setQty, qtyOf, setAddress, toggleFav, placeOrder }),
    [state, ready, count, subtotal, needsTomorrow, add, setQty, qtyOf, setAddress, toggleFav, placeOrder]
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
