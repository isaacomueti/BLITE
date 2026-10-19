# Blite Food — mobile app (Expo / React Native)

The Blite ordering app. It uses Glovo's interaction patterns (address bar and search on a
coloured header, category bubbles, promo carousel, store page with sticky category tabs,
"+" quantity bubbles, floating **View basket** bar, product sheet, one-page checkout and
order tracking) styled with Blite's own design system (red/orange, Fraunces + Inter).
It reads the **live menu, prices, delivery areas, accounts and orders from blitefood.co.uk**
through the website's JSON API (`/api/v1`, Laravel), so the app and the website share one
database: an order placed in the app appears in the website's admin, and customers sign in
with their existing website email and password.

## Where the data comes from

| Data | Source |
| --- | --- |
| Menu, sizes and prices, categories, equipment, events | `GET /foods`, `/categories`, `/equipment`, `/galleries` — cached on the device for offline start |
| Delivery areas and fees | `GET /counties` (county → area, fee = base + basket weight × per-kg rate) |
| Shop status, pickup point, contact, bank details | `GET /config` (the admin's checkout / maintenance switches) |
| Prices at checkout | `POST /quote` — the server prices the basket, coupon and delivery |
| Accounts | `POST /auth/login`, `/auth/register`, `/auth/forgot-password` (bearer token) |
| Orders | `POST /orders`, `GET /orders`, `GET /orders/{reference}`, `POST /orders/{reference}/cancel` |
| Catering enquiries | `POST /bookings` |

The API address is `expo.extra.apiUrl` in `app.json` (default `https://blitefood.co.uk/api/v1`).
Point it at a local Laravel server (for example `http://192.168.1.20:8000/api/v1`) to test
against a copy of the database. Bundled photos in `assets/photos/` are only used for
decorative promo art; dish and equipment photos come from the website.

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

## Install on an Android phone

**Quickest, no build:** install **Expo Go** from the Play Store, then on your computer run
`cd mobile && npm install && npx expo start` and scan the QR code with Expo Go
(phone and computer on the same Wi-Fi; add `--tunnel` if they aren't).

**A real APK you can install and share:** builds in Expo's cloud, so no Android Studio is needed.

```bash
cd mobile
npx eas-cli@latest login                                   # free Expo account
npx eas-cli@latest build --platform android --profile preview
```

When the build finishes (about 10–20 minutes) EAS prints a link and QR code. Open it on the phone,
download the `.apk` and install it (Android will ask you to allow installs from your browser).
The `preview` profile in `eas.json` produces an installable APK; `production` produces the
Play Store bundle (`.aab`).

## Screens

| Route | Screen |
| --- | --- |
| `/(tabs)/index` | Home: delivery address, search, shop status, category bubbles, promo carousel, store card, quick meals, popular, catering/equipment |
| `/(tabs)/search` | Live search, popular searches, categories, empty state |
| `/(tabs)/orders` | Order history from the website (app and web orders), pull to refresh |
| `/(tabs)/profile` | Sign in / account, favourites, services, help (live chat, WhatsApp, call, email) |
| `/store?cat=` | Store page: category tabs that pin under the header and follow scroll, product rows |
| `/product/[id]` | Product sheet: size (required), quantity, favourite |
| `/cart` | Basket: food and equipment hire, steppers, upsell carousel, totals |
| `/address` | County → delivery area → street, town and postcode |
| `/checkout` | Sign-in gate, delivery/pickup, date and time (24 hours ahead), phone, note, coupon, bank transfer, server-priced totals |
| `/order/[id]` | Confirmation, bank transfer details, status timeline, receipt, cancel unpaid order |
| `/login`, `/register` | Website account sign-in, password reset email, registration |
| `/catering` | 2-step catering enquiry (date, time, guests, contact) |
| `/equipment` | Equipment hire: start date, 1–4 days, quantity, added to the basket |

## Business rules (same as the website)

- Customers must be signed in to place an order.
- Every order needs at least 24 hours' notice; the customer picks a delivery or pickup date and time.
- Delivery fee = area base fee + basket weight × the area's per-kg rate. Pickup is free.
- Coupons take a percentage off the subtotal (including equipment caution fees).
- Equipment is hired per day for 1–4 days, starting tomorrow at the earliest, with a refundable caution fee per item.
- Payment is by bank transfer: the order page shows the bank details and the order reference.
- When the admin pauses checkout or turns on maintenance, the app stops taking orders.
- Allergens aren't published by the website yet, so every dish asks customers to tell the kitchen about allergies.

## Shipping to the stores

Use EAS (`npx eas-cli@latest build`, `submit`, `update`). The app identifiers are set
in `app.json` (`uk.co.blitefood.app`). Before the first build, the app needs the backend
endpoints above, confirmed allergen data, and Apple/Google developer accounts.
