# Blite Food — mobile app (Expo / React Native)

The Blite ordering app. It uses Glovo's interaction patterns (address bar and search on a
coloured header, category bubbles, promo carousel, store page with sticky category tabs,
"+" quantity bubbles, floating **View basket** bar, product sheet, one-page checkout and
order tracking) styled with Blite's own design system (red/orange, Fraunces + Inter).
It lives in `mobile/` of the website repo and uses the **live B-Lite menu, prices and
photography** from the website in the same repo (deployed at blite-six.vercel.app).

## Updating the menu and photos

```bash
cd mobile
node scripts/import-catalogue.mjs
```

This reads the website's `assets/js/data.js` and `assets/img/`, resizes every photo for phones
(≈2.8 MB for 71 photos), and regenerates `src/lib/catalogue.json`, `src/lib/photos.ts` and
`assets/photos/`. Commit the result. Anything without a photo falls back to drawn art.

Built on **Expo SDK 58** with Expo Router, TypeScript and Reanimated.

## Run it

```bash
cd mobile
npm install
npx expo start          # scan the QR code with Expo Go (iOS/Android), or press w for web
```

Everything used is available in Expo Go: vector icons, SVG, AsyncStorage, haptics,
linear gradient and Google Fonts. No custom native build is needed yet.

Checks:

```bash
npx tsc --noEmit
npx expo lint
npx expo export -p web   # static web build in dist/
```

## Screens

| Route | Screen |
| --- | --- |
| `/(tabs)/index` | Home: delivery address, search, open/closed status, category bubbles, promo carousel, store card, quick meals, popular, catering/equipment |
| `/(tabs)/search` | Live search, popular searches, categories, empty state |
| `/(tabs)/orders` | Order history with live badge and reorder |
| `/(tabs)/profile` | Account placeholder, favourites, services, help (WhatsApp, call, email) |
| `/store?cat=` | Store page: hero, rating/ETA/fee, category tabs that pin under the header and follow scroll, product rows |
| `/product/[id]` | Product sheet: portion (required), add-ons, allergens, quantity, favourite |
| `/cart` | Basket: steppers, next-day notice, upsell carousel, totals |
| `/address` | Postcode-first delivery check (UK), saves fee and ETA |
| `/checkout` | Delivery/pickup, ASAP or scheduled slot, rider note, mobile number, payment method, totals |
| `/order/[id]` | Confirmation + tracking: animated progress, timeline, receipt, help |
| `/catering` | 3-step enquiry with progressive disclosure and dietary capture |
| `/equipment` | Equipment hire: live per-hire prices, hire length, quote request |

## Business rules carried over from the site

- Deliveries run 08:00–18:00, Monday to Saturday (no Sunday slots).
- Quick meals can arrive the same day if ordered by 17:00. Everything else is cooked to order (3 hours' prep) for delivery from **tomorrow**: ASAP is disabled when the basket contains any of it.
- Each portion has its own live price (e.g. Egusi 1 litre £25, 2 litres £45, 4 litres £86).
- Hire equipment is priced per hire, as on the live site; stock and availability are confirmed with the quote.
- Delivery fee and ETA come from the postcode zone (`src/lib/data.ts`, placeholder zones around Hatfield; confirm with operations).
- Allergens aren't published on the live site yet, so every dish asks customers to tell the kitchen about allergies. Confirmed allergen lists must be added before launch.

## What's simulated (prototype) vs production

| Prototype | Production |
| --- | --- |
| Menu imported into `src/lib/catalogue.json` | Supabase API shared with the website |
| Photos bundled in the app (imported from the website) | Photos served from Supabase Storage / a CDN |
| Basket, orders, favourites in AsyncStorage | Basket on device; orders from the API |
| "Place order" creates the order locally | Server re-prices the basket → **Revolut Business** hosted checkout (Apple Pay, Google Pay, cards, Revolut Pay) → **webhook** confirms the order |
| Tracking progress from elapsed time | Supabase Realtime subscription to the order's status (set by the kitchen in admin) |
| Sign-in buttons show a notice | Supabase Auth: email magic link, Sign in with Apple, Google |

## Shipping to the stores

Use EAS (`npx eas-cli@latest build`, `submit`, `update`). The app identifiers are set
in `app.json` (`uk.co.blitefood.app`). Before the first build, the app needs the backend
endpoints above, confirmed allergen data, and Apple/Google developer accounts.
