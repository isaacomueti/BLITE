/**
 * Catalogue — the live B-Lite menu, hire list and photography, imported from the website in
 * this repo (../assets) by `scripts/import-catalogue.mjs`. Re-run that script after the
 * website's data changes; in production both clients read the same data from the API.
 *
 * Allergens are not published on the live site yet: `allergens: null` means "not confirmed".
 */
import catalogue from './catalogue.json';

export type Portion = { id: string; name: string; price: number };
export type Addon = { id: string; name: string; price: number };
export type Product = {
  id: string; name: string; cat: string; price: number; desc: string; long?: string; prep?: string;
  quick: boolean; featured: boolean; portions: Portion[]; addons: Addon[]; allergens: string[] | null; photo: string | null;
};
export type Category = { id: string; name: string; title: string; blurb: string; cover: string | null; coverIsCutout: boolean; tint: string };
export type Equipment = { id: string; name: string; price: number; per?: string; group: string; desc: string; stock: number; photo: string | null };
export type BliteEvent = { id: string; title: string; type: string; label: string; photos: string[] };

const TINTS = ['#FFE9DA', '#FFF1DB', '#FFE3E6', '#FDF0D8', '#FFF4E3', '#FFF6D6', '#FBE4EA', '#F3EEE9', '#E9F2EC', '#FDE8DF'];

export const products: Product[] = catalogue.products as Product[];
export const categories: Category[] = catalogue.categories.map((c, i) => ({ ...c, tint: TINTS[i % TINTS.length] }));
export const equipment: Equipment[] = catalogue.equipment as Equipment[];
export const events: BliteEvent[] = catalogue.events;
export const extras = catalogue.extras;
export const deliveryZones = catalogue.deliveryZones;
export const business = catalogue.business;

/** Deliveries run 08:00–18:00, Monday to Saturday; same-day ASAP is offered until 17:00. */
export const delivery = { firstSlot: 8, lastSlot: 18, asapCutoff: 17, noDeliveryDay: 0 /* Sunday */ };

export const allergenNames: Record<string, string> = {
  celery: 'celery', gluten: 'gluten', crustaceans: 'crustaceans', eggs: 'eggs', fish: 'fish', lupin: 'lupin', milk: 'milk',
  molluscs: 'molluscs', mustard: 'mustard', nuts: 'tree nuts', peanuts: 'peanuts', sesame: 'sesame', soya: 'soya', sulphites: 'sulphites',
};

export const productById = (id: string) => products.find((p) => p.id === id);
export const categoryName = (id: string) => categories.find((c) => c.id === id)?.name ?? '';
const SHORT: Record<string, string> = { quick: 'Quick meals', soups: 'Soups', pastries: 'Snacks', sides: 'Sides', meat: 'Meat' };
/** Short label for the round category bubbles. */
export const shortName = (c: Category) => SHORT[c.id] ?? c.name;

export function normalisePostcode(v: string): string | null {
  const s = v.toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (s.length < 5 || s.length > 7) return null;
  const out = s.slice(0, -3) + ' ' + s.slice(-3);
  return /^[A-Z]{1,2}[0-9][A-Z0-9]? [0-9][A-Z]{2}$/.test(out) ? out : null;
}

export type DeliveryCheck =
  | { ok: true; postcode: string; fee: number; eta: string }
  | { ok: false; reason: 'invalid' | 'out'; postcode?: string };

export function checkDelivery(pc: string): DeliveryCheck {
  const norm = normalisePostcode(pc);
  if (!norm) return { ok: false, reason: 'invalid' };
  const area = norm.match(/^[A-Z]+/)![0];
  const zone = deliveryZones.find((z) => z.prefixes.includes(area));
  return zone ? { ok: true, postcode: norm, fee: zone.fee, eta: zone.eta } : { ok: false, reason: 'out', postcode: norm };
}
