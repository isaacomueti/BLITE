/**
 * Catalogue — the live B-Lite menu, hire list, events, delivery areas and shop settings, read
 * from the website API (src/lib/api.ts). The last good copy is cached on the device so the app
 * opens instantly and still shows the menu when offline; it refreshes on every launch.
 *
 * Allergens are not published by the website yet: `allergens: null` means "not confirmed".
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

import { api, ApiCategory, ApiConfig, ApiCounty, ApiEquipment, ApiFood, ApiGallery } from './api';

export type Portion = { id: string; name: string; price: number };
export type Addon = { id: string; name: string; price: number };
export type Product = {
  /** URL-safe id (the website slug). */
  id: string;
  dbId: number;
  name: string; cat: string; price: number; desc: string; long?: string; prep?: string;
  quick: boolean; featured: boolean; available: boolean; portions: Portion[]; addons: Addon[]; allergens: string[] | null; photo: string | null;
};
export type Category = { id: string; name: string; title: string; blurb: string; cover: string | null; coverIsCutout: boolean; tint: string };
export type Equipment = {
  id: string; dbId: number; name: string; price: number; per?: string; group: string; desc: string;
  caution: number; bookable: boolean; photo: string | null; photos: string[];
};
export type BliteEvent = { id: string; title: string; type: string; label: string; photos: string[] };
export type County = ApiCounty;
export type Business = {
  name: string; address: string; phone: string; phoneHref: string; email: string; whatsapp: string; chatUrl: string;
  pickupLocation: string; pickupTime: string; checkoutOpen: boolean; maintenance: boolean; leadHours: number; maxRentalDays: number;
  bank: ApiConfig['bank'];
};

const TINTS = ['#FFE9DA', '#FFF1DB', '#FFE3E6', '#FDF0D8', '#FFF4E3', '#FFF6D6', '#FBE4EA', '#F3EEE9', '#E9F2EC', '#FDE8DF'];
/** The website's "quick meal" category: its dishes are featured first on the home screen. */
export const QUICK_CATEGORY = 'quick-meal';

/* Module-level catalogue. Screens only render after loadCatalogue() has filled it (see _layout). */
export let products: Product[] = [];
export let categories: Category[] = [];
export let equipment: Equipment[] = [];
export let events: BliteEvent[] = [];
export let counties: County[] = [];
export let business: Business = {
  name: 'B-Lite Food', address: '', phone: '', phoneHref: '', email: '', whatsapp: '', chatUrl: '', pickupLocation: '', pickupTime: '',
  checkoutOpen: true, maintenance: false, leadHours: 24, maxRentalDays: 4, bank: null,
};

type Raw = { config: ApiConfig; categories: ApiCategory[]; foods: ApiFood[]; equipment: ApiEquipment[]; galleries: ApiGallery[]; counties: ApiCounty[] };
const CACHE_KEY = 'blite.catalogue.v2';

export const toProduct = (f: ApiFood): Product => ({
  id: f.slug,
  dbId: f.id,
  name: f.name,
  cat: f.category?.slug ?? '',
  price: f.price_from ?? 0,
  desc: f.description,
  quick: false,
  featured: f.is_featured,
  available: f.is_available,
  portions: f.sizes.map((s) => ({ id: String(s.size_id), name: s.label, price: s.price })),
  addons: [],
  allergens: null,
  photo: f.image,
});

function apply(raw: Raw) {
  const c = raw.config;
  const phone = c.contact.phone ?? '';
  const digits = phone.replace(/[^0-9+]/g, '');
  business = {
    name: 'B-Lite Food',
    address: c.contact.location ?? '',
    phone,
    phoneHref: digits ? 'tel:' + digits : '',
    email: c.contact.email ?? '',
    whatsapp: c.social.whatsapp ?? (digits ? 'https://wa.me/' + digits.replace(/^0/, '44').replace(/^\+/, '') : ''),
    chatUrl: c.chat_url,
    pickupLocation: c.pickup.location ?? '',
    pickupTime: c.pickup.time ?? '',
    checkoutOpen: c.checkout_open,
    maintenance: c.maintenance,
    leadHours: c.min_lead_hours,
    maxRentalDays: c.max_rental_days,
    bank: c.bank,
  };
  products = raw.foods.filter((f) => f.sizes.length > 0).map(toProduct);
  const used = new Set(products.map((p) => p.cat));
  categories = raw.categories
    .filter((cat) => used.has(cat.slug))
    .sort((a, b) => Number(b.is_featured) - Number(a.is_featured))
    .map((cat, i) => ({ id: cat.slug, name: cat.name, title: cat.name, blurb: '', cover: cat.image, coverIsCutout: true, tint: TINTS[i % TINTS.length] }));
  equipment = raw.equipment.map((e) => ({
    id: e.slug, dbId: e.id, name: e.name, price: e.price_per_day, per: 'day', group: e.size, desc: e.description,
    caution: e.caution_fee, bookable: e.bookable, photo: e.images[0] ?? null, photos: e.images,
  }));
  events = raw.galleries.map((g) => ({ id: g.slug, title: g.title, type: '', label: '', photos: g.cover ? [g.cover] : [] }));
  counties = raw.counties;
}

/** Show the cached catalogue straight away. Returns false when nothing is cached yet. */
export async function hydrateCatalogue() {
  try {
    const cached = await AsyncStorage.getItem(CACHE_KEY);
    if (!cached) return false;
    apply(JSON.parse(cached));
    return true;
  } catch {
    return false;
  }
}

/** Fetch the latest catalogue from the website and cache it. */
export async function loadCatalogue() {
  const [config, cats, foods, eq, galleries, cs] = await Promise.all([
    api<ApiConfig>('/config'),
    api<ApiCategory[]>('/categories'),
    api<{ data: ApiFood[] }>('/foods', { query: { per_page: 100 } }),
    api<ApiEquipment[]>('/equipment'),
    api<ApiGallery[]>('/galleries'),
    api<ApiCounty[]>('/counties'),
  ]);
  const raw: Raw = { config, categories: cats, foods: foods.data, equipment: eq, galleries, counties: cs };
  apply(raw);
  AsyncStorage.setItem(CACHE_KEY, JSON.stringify(raw)).catch(() => {});
}

export const allergenNames: Record<string, string> = {
  celery: 'celery', gluten: 'gluten', crustaceans: 'crustaceans', eggs: 'eggs', fish: 'fish', lupin: 'lupin', milk: 'milk',
  molluscs: 'molluscs', mustard: 'mustard', nuts: 'tree nuts', peanuts: 'peanuts', sesame: 'sesame', soya: 'soya', sulphites: 'sulphites',
};

export const productById = (id: string) => products.find((p) => p.id === id);
export const productByDbId = (id: number) => products.find((p) => p.dbId === id);
export const equipmentById = (id: string) => equipment.find((e) => e.id === id);
export const categoryName = (id: string) => categories.find((c) => c.id === id)?.name ?? '';
/** Short label for the round category bubbles. */
export const shortName = (c: Category) => (c.name.length > 12 ? c.name.split(/[\s&]+/)[0] : c.name);

export function normalisePostcode(v: string): string | null {
  const s = v.toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (s.length < 5 || s.length > 7) return null;
  const out = s.slice(0, -3) + ' ' + s.slice(-3);
  return /^[A-Z]{1,2}[0-9][A-Z0-9]? [0-9][A-Z]{2}$/.test(out) ? out : null;
}

/** Earliest bookable delivery/pickup moment: the website requires at least 24 hours' notice. */
export const earliestSlot = () => new Date(Date.now() + business.leadHours * 3600e3 + 60e3);

/** "2026-10-18 14:30:00" in UK local time, the format the website stores. */
export function toApiDateTime(d: Date) {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:00`;
}
export function toApiDate(d: Date) {
  return toApiDateTime(d).slice(0, 10);
}
