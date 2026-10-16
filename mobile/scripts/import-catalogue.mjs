#!/usr/bin/env node
/**
 * Imports the real menu, hire equipment and photography from the website in this repo
 * (../assets/js/data.js and ../assets/img) into the app.
 *
 *   cd mobile && node scripts/import-catalogue.mjs     # or pass another path to the site root
 *
 * Writes:
 *   src/lib/catalogue.json   menu, categories, equipment, events and business details
 *   src/lib/photos.ts        static require() map so Metro bundles every photo
 *   assets/photos/**         photos resized for phones (WebP)
 *
 * Re-run whenever the website's assets/js/data.js or assets/img change.
 */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import sharp from 'sharp';

const app = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const site = path.resolve(process.argv[2] ?? path.join(app, '..'));
const dataFile = path.join(site, 'assets/js/data.js');
if (!fs.existsSync(dataFile)) {
  console.error(`Can't find ${dataFile}. Run this from the mobile/ folder of the BLITE repo, or pass the site root.`);
  process.exit(1);
}

// data.js is a browser script that assigns window.BliteData — run it in a sandbox.
const sandbox = { window: {} };
vm.runInNewContext(fs.readFileSync(dataFile, 'utf8'), sandbox, { filename: dataFile });
const D = sandbox.window.BliteData;

const outDir = path.join(app, 'assets/photos');
fs.rmSync(outDir, { recursive: true, force: true });
const photos = new Map(); // key → relative path from src/lib

/** Resize one website image into the app; returns its photo key (or null if missing). */
async function importImage(rel, key, { width, height, fit = 'cover', quality = 72 }) {
  const src = path.join(site, rel);
  if (!rel || !fs.existsSync(src)) return null;
  const dest = path.join(outDir, key + '.webp');
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  await sharp(src).resize({ width, height, fit, withoutEnlargement: true }).webp({ quality, alphaQuality: 90 }).toFile(dest);
  photos.set(key, path.relative(path.join(app, 'src/lib'), dest).split(path.sep).join('/'));
  return key;
}

const CARD = { width: 720, height: 540 };
const round2 = (n) => Math.round(n * 100) / 100;

const products = [];
for (const p of D.products) {
  const photo = await importImage(p.img, `menu/${p.id}`, CARD);
  products.push({
    id: p.id,
    name: p.name,
    cat: p.cat,
    price: round2(p.price),
    desc: p.desc,
    long: p.long && p.long !== p.desc ? p.long : undefined,
    prep: p.prep,
    quick: !!p.quick,
    featured: !!p.featured,
    portions: p.portions.map((o) => ({ id: o.id, name: o.name, price: round2(o.price) })),
    addons: (p.addons ?? []).map((a) => ({ id: a.id, name: a.name, price: round2(a.price) })),
    allergens: p.allergens ?? null, // null = not yet confirmed by the kitchen
    photo,
  });
}

// Category covers: the website's dedicated category art where it exists, else a featured dish photo.
const categoryArt = Object.fromEntries(D.featuredCategories.map((c) => [c.id, c.img]));
const categories = [];
for (const c of D.categories) {
  const items = products.filter((p) => p.cat === c.id);
  if (!items.length) continue;
  let cover = categoryArt[c.id] ? await importImage(categoryArt[c.id], `categories/${c.id}`, { width: 360, height: 360, fit: 'contain' }) : null;
  const coverIsCutout = !!cover;
  if (!cover) cover = (items.find((p) => p.featured) ?? items[0]).photo;
  categories.push({ id: c.id, name: c.name, title: c.title, blurb: c.blurb, cover, coverIsCutout });
}

const equipment = [];
for (const e of D.equipment) {
  equipment.push({
    id: e.id,
    name: e.name,
    price: round2(e.price),
    per: e.per || undefined,
    group: e.group,
    desc: e.desc,
    stock: e.stock,
    photo: await importImage(e.img, `hire/${e.id}`, CARD),
  });
}

const events = [];
for (const ev of D.events) {
  const shots = [];
  for (const [i, img] of (ev.images ?? [ev.img]).entries()) {
    const k = await importImage(img, `events/${ev.id}${i ? '-' + (i + 1) : ''}`, { width: 1000, height: 750 });
    if (k) shots.push(k);
  }
  events.push({ id: ev.id, title: ev.title, type: ev.type, label: ev.label, photos: shots });
}

// Hero cut-out and service banners used around the app
const extras = {
  hero: await importImage('assets/img/hero/jollof-hero.webp', 'hero/jollof', { width: 900, height: 900, fit: 'contain' }),
  cateringHero: await importImage('assets/img/events/catering-hero.webp', 'events/catering-hero', { width: 1000, height: 600 }),
  cateringBand: await importImage('assets/img/events/catering-band.webp', 'events/catering-band', { width: 1000, height: 600 }),
  equipmentHero: await importImage('assets/img/equipment/hero.webp', 'hire/hero', { width: 900, height: 600 }),
};

const b = D.business;
const catalogue = {
  source: 'assets/js/data.js (website in this repo)',
  categories,
  products,
  equipment,
  events,
  extras,
  deliveryZones: D.deliveryZones.map((z) => ({ prefixes: z.prefixes, fee: z.fee, eta: z.eta.replace(' minutes', ' min') })),
  business: {
    name: b.name, address: b.address, phone: b.phone, phoneHref: 'tel:' + b.phoneHref, email: b.email,
    whatsapp: b.whatsapp, orderHours: b.orderHours, deliveryHours: b.deliveryHours, prepTime: b.prepTime,
  },
};

fs.writeFileSync(path.join(app, 'src/lib/catalogue.json'), JSON.stringify(catalogue, null, 2) + '\n');
const lines = [...photos].sort(([a], [b2]) => a.localeCompare(b2)).map(([k, rel]) => `  '${k}': require('${rel.startsWith('.') ? rel : './' + rel}'),`);
fs.writeFileSync(
  path.join(app, 'src/lib/photos.ts'),
  `// Generated by scripts/import-catalogue.mjs — do not edit by hand.\n// Metro resolves each require() to a bundled asset id.\n\n` +
    `export const photos: Record<string, number> = {\n${lines.join('\n')}\n};\n`
);

const bytes = [...photos.values()].reduce((s, rel) => s + fs.statSync(path.join(app, 'src/lib', rel)).size, 0);
console.log(`Imported ${products.length} dishes, ${categories.length} categories, ${equipment.length} hire items, ${events.length} events.`);
console.log(`${photos.size} photos, ${(bytes / 1024 / 1024).toFixed(1)} MB total.`);
const missing = products.filter((p) => !p.photo).map((p) => p.id);
if (missing.length) console.log('No photo for:', missing.join(', '));
