/**
 * Client for the B-Lite website API (Laravel, /api/v1). The website and the app share one
 * database: menu, prices, delivery areas, accounts and orders all come from there.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

export const API_URL: string = ((Constants.expoConfig?.extra as { apiUrl?: string } | undefined)?.apiUrl ?? 'https://blitefood.co.uk/api/v1').replace(/\/$/, '');

const TOKEN_KEY = 'blite.token';
let token: string | null = null;

export async function loadToken() {
  token = await AsyncStorage.getItem(TOKEN_KEY).catch(() => null);
  return token;
}
export async function setToken(t: string | null) {
  token = t;
  if (t) await AsyncStorage.setItem(TOKEN_KEY, t).catch(() => {});
  else await AsyncStorage.removeItem(TOKEN_KEY).catch(() => {});
}
export const hasToken = () => !!token;

export class ApiError extends Error {
  status: number;
  fields: Record<string, string[]>;
  constructor(message: string, status: number, fields: Record<string, string[]> = {}) {
    super(message);
    this.status = status;
    this.fields = fields;
  }
  /** First message for a field, e.g. err.field('email'). */
  field(name: string) {
    return this.fields[name]?.[0];
  }
}

type Opts = { method?: 'GET' | 'POST' | 'PUT' | 'DELETE'; body?: unknown; query?: Record<string, string | number | boolean | undefined> };

export async function api<T = unknown>(path: string, { method = 'GET', body, query }: Opts = {}): Promise<T> {
  const qs = query
    ? '?' + Object.entries(query).filter(([, v]) => v !== undefined && v !== '').map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`).join('&')
    : '';
  let res: Response;
  try {
    res = await fetch(API_URL + path + qs, {
      method,
      headers: {
        Accept: 'application/json',
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : null),
        ...(token ? { Authorization: `Bearer ${token}` } : null),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError("Can't reach B-Lite right now. Check your connection and try again.", 0);
  }

  const text = await res.text();
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }
  if (!res.ok) {
    if (res.status === 401 && token) await setToken(null);
    const fields = (data?.errors ?? {}) as Record<string, string[]>;
    const first = Object.values(fields)[0]?.[0];
    throw new ApiError(first ?? data?.message ?? `Something went wrong (${res.status}).`, res.status, fields);
  }
  return data as T;
}

/* ---------- API shapes ---------- */
export type ApiSize = { size_id: number; label: string; price: number; weight: number };
export type ApiFood = {
  id: number; slug: string; name: string; description: string; image: string | null;
  category: { id: number; name: string; slug: string } | null;
  is_available: boolean; is_special: boolean; is_featured: boolean; price_from: number | null; sizes: ApiSize[];
  rating?: number; review_count?: number;
  reviews?: { id: number; rating: number; comment: string; name: string; date: string }[];
};
export type ApiCategory = { id: number; name: string; slug: string; image: string | null; is_featured: boolean };
export type ApiEquipment = {
  id: number; slug: string; name: string; description: string; size: string; price_per_day: number;
  caution_fee: number; weight: number; is_featured: boolean; bookable: boolean; images: string[];
};
export type ApiGallery = { id: number; slug: string; title: string; description: string | null; cover: string | null; images: string[] | null };
export type ApiArea = { id: number; name: string; base_fee: number; fee_per_kg: number; eta: string | null };
export type ApiCounty = { id: number; name: string; areas: ApiArea[] };
export type ApiConfig = {
  checkout_open: boolean; maintenance: boolean; min_lead_hours: number; max_rental_days: number;
  pickup: { location: string | null; time: string | null };
  contact: { location: string | null; email: string | null; phone: string | null };
  social: Partial<Record<'facebook' | 'instagram' | 'tiktok' | 'whatsapp', string>>;
  bank: { bank_name: string; account_name: string; account_number: string; sort_code: string | null } | null;
  chat_url: string;
};
export type ApiUser = { id: number; name: string; email: string; role: 'admin' | 'customer'; email_verified: boolean };
export type ApiOrderItem = {
  type: 'food' | 'equipment'; product_id: number; name: string; slug: string | null; image: string | null; size: string | null;
  quantity: number; unit_price: number; total: number; rental_start: string | null; rental_end: string | null; rental_days: number | null; caution_fee: number | null;
};
export type ApiOrder = {
  reference: string; order_type: 'delivery' | 'pickup'; status: 'pending' | 'processing' | 'completed' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded'; total: number; scheduled_for: string | null; created_at: string; item_count: number;
  note?: string | null; phone_number?: string | null; coupon?: { code: string; percent: number } | null;
  address?: { address: string; city: string; postcode: string | null; area: string | null; county: string | null; phone_number: string } | null;
  items?: ApiOrderItem[];
};
export type ApiQuote = {
  subtotal: number; caution_fee: number; delivery_fee: number; discount: number; total: number; weight: number;
  coupon: { code: string; percent: number } | null; coupon_valid: boolean | null; area: { id: number; name: string; eta: string | null } | null;
};
export type BasketItem =
  | { type: 'food'; food_id: number; size_id: number; quantity: number }
  | { type: 'equipment'; equipment_id: number; rental_start: string; days: number; quantity: number };
