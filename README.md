# Blite Food — redesign prototype

A working, framework-free front end of the new Blite Food direction:
*"a premium, editorial Nigerian food experience built for the UK."*
Open `index.html` directly, serve the folder locally, or deploy to Vercel (static, no build step — see `vercel.json`):

```bash
python3 -m http.server 8080   # → http://localhost:8080
```

No build step and no dependencies. State (basket, orders, favourites, enquiries) lives in
`localStorage` so every flow can be clicked through end to end.

## Pages

| Page | File | What it demonstrates |
| --- | --- | --- |
| Home | `index.html` | Hero with rotating food, trust strip, quick meals, orange→red category cards, menu rail, services, equipment, catering CTA, gallery + lightbox, testimonials, newsletter |
| Menu | `menu.html` | Search, category chips, sort, instant filtering with shareable URLs (`?cat=soups&q=egusi`), mobile filter bottom sheet, skeletons, empty state |
| Product | `product.html?id=…` | Portions, add-ons, live price, quantity, allergens, zoom + full-screen viewer, swipe gallery on mobile |
| Basket | `cart.html` + right-side drawer | Quantity, remove with undo, next-day notice, empty state |
| Checkout | `checkout.html` | Guest-first, delivery/pickup, **postcode-first delivery check**, ASAP vs scheduled slots, UK validation, error state (`?demo=fail`) |
| Order | `order.html?id=…` | Animated confirmation, delivery window, tracking timeline, create-account prompt |
| Catering | `catering.html` | Packages (quote, not fixed prices), how-it-works, 3-step enquiry with progressive disclosure and dietary/allergy capture |
| Equipment | `equipment.html` | Date-based rental basket (separate from food), availability per date range, quote request |
| Events | `events.html` | Filterable editorial gallery + lightbox |
| About / Contact | `about.html`, `contact.html` | Story, principles, kitchen, team; contact details, hours, form, map |
| Account | `account.html` | Email sign-in, overview, orders, addresses, payment methods (held by Revolut), favourites, catering bookings, profile, settings |
| Legal & help | `legal.html?page=…` | Delivery, allergen matrix (generated from menu data), privacy, cookies, terms, refunds, catering & rental terms |
| Admin | `admin.html` | Dashboard, order status (updates the customer's tracking page), menu availability, catering CRM pipeline, equipment inventory |

## Design system

All tokens are in `assets/css/blite.css` (`:root`).

- **Colour:** Blite Red `#F5223A` = primary / hover / active / commit. Food Orange `#FF9F0A` = default category state, badges. Blush `#FFF3F3`, background `#FFFDFC`, dark `#191919`, body `#4B4B4B`, muted `#858585`, borders `#EAE4E0`.
- **Type:** Fraunces for display (hero 46–88px, H2 32–52px), Inter for all UI. No script font.
- **Grid:** 1280px max, 40 / 24 / 16px gutters.
- **Radius:** cards 20, category cards 24, buttons 12, inputs 10, images 16.
- **Motion:** fast 180ms (buttons, icons), standard 380ms (cards, drawers, category states), expressive 900ms (hero entrance), ambient 3–30s (garnish float, 28s food rotation). The category hover is staggered: background 0ms → food 80ms → card 120ms → CTA 180ms.
- **Reduced motion:** `prefers-reduced-motion` switches off rotation, floating, stagger and long transitions.
- **Every state is defined:** buttons (normal/hover/pressed/disabled/loading), product (normal/hover/added/sold out), category (orange/red), basket (empty/has items), nav (normal/hover/active).

## Photography — drop-in slots

Every image points at its real path first. If the file is missing, a generated illustration
(`assets/js/art.js`) or a captioned placeholder naming the shot needed is shown instead.
Add real photos with the same filenames and they replace the stand-ins, with no code changes.

```
assets/img/hero/jollof-hero.webp            transparent cut-out, overhead, 2000px+
assets/img/categories/{soup,rice,pastries,sides}.webp
                                            transparent, same angle, lighting and scale
assets/img/food/<product-id>.webp           card/detail photo (4:3), plus -2 and -3 for the gallery
assets/img/equipment/<equipment-id>.webp
assets/img/events/<event-id>.webp           plus catering-band.webp, catering-hero.webp
assets/img/about/{founder,story,kitchen-1..3,team-1..4,delivery,catering,equipment,events}.webp
```

Product and equipment ids are listed in `assets/js/data.js`.

## Before launch: things to confirm

Search the code for `confirm: true` and `placeholder: true`.

- **Prices** for dishes not on the current live site (fried rice, coconut rice, party tray, egusi, ogbono, stews, sides, pastries, snacks, drinks) and new equipment lines. Existing prices (jollof £12, noodles £15, goat meat £60, bitterleaf £55, seafood okra £26, pounded yam £15, chafing dishes £15, silver chafing dish £10, plates £6, charger plates £12, knives £5) are carried over.
- **Allergens** for every dish. They must be signed off by the kitchen.
- **Delivery zones and fees** (`deliveryZones` in `data.js`).
- **Testimonials** on the homepage, and every event except "Pauline at 85", are placeholders. Replace them with real, permissioned content.
- **About page** story and team roles are draft copy.
- **Legal pages** are structured drafts and must be reviewed by an adviser.

### Content imported from the live site (29 Sept 2026)

`tools/crawl/` holds the scripts (run them from that folder): `parse.py` reads every page on blitefood.co.uk/food,
/equipments and /galleries, `sizes.py` reads the price of every size exactly as the size dropdown does,
and `gen_data.py` writes `assets/js/data.js`. Re-run them to refresh the menu.

- 50 dishes in the live site's 10 categories, with every size and its price, prep time, description and photo (`assets/img/menu/`).
- 10 hire items with prices and photos (`assets/img/hire/`). Prices are per item, or per pack of 20 for tableware.
- The "Pauline at 85" gallery (3 photos, `assets/img/events/pauline-85*.webp`).
- About, Terms & Conditions, privacy, refund, delivery, food safety & hygiene and sustainability text.
- Company name, both email addresses, delivery hours (8am–6pm, Mon–Sat), social links.

Still to confirm before launch:
- **Allergens:** not published on the live site. Every dish needs a kitchen-confirmed list.
- **Refund window:** the live Terms say claims within 24 hours of delivery; the live refund policy says within 1–6 hours of ordering.
- **Equipment photos:** on the live site "Chafing dishes" shows the gold event set and "Silver chafing dish" shows the steel ones; both drums share one photo.
- **Equipment stock** (placeholder), delivery postcode zones and fees (placeholder).
- **Testimonials** on the homepage are placeholders; the live site has no reviews yet.

### AI-generated images still in use (Higgsfield)

- `assets/img/categories/`: pastries, sides (homepage category cards)
- `assets/img/hero/garnish-*.webp`: chilli, leaf, pepper, grain

AI dish, equipment and event images replaced by real photos are not included in this repo.

## From prototype to production (Next.js · Supabase · Revolut Business)

Each shared block in `assets/js/app.js` maps onto a component or route in the planned stack:

| Prototype | Production |
| --- | --- |
| `BliteData` (`data.js`) | Supabase tables: `products`, `categories`, `equipment`, `equipment_reservations`, `events`, `orders`, `catering_bookings` |
| `Blite.cart` (localStorage) | Same client-side basket (strictly necessary, so cookie-exempt), re-priced on the server |
| Checkout "Pay securely" | `POST /api/checkout` → Revolut Business Merchant API order → hosted checkout page (cards, Apple Pay, Google Pay, Revolut Pay) → redirect |
| `B.saveOrder` | **Only** Revolut's `ORDER_COMPLETED` webhook creates or confirms a paid order. The browser is never trusted. |
| Catering enquiry | `POST /api/catering` → CRM row → quote → Revolut payment link for the deposit → webhook moves it to "Deposit paid" |
| Equipment request | Availability check in a transaction against `equipment_reservations` for the date range |
| Account sign-in | Supabase Auth magic link (+ Google/Apple) |
| Email | Resend (receipts, enquiry auto-replies) |
| `admin.html` | `/admin/*` behind a staff role with row-level security |
| Cookie banner | Gates GA4. Equal-weight *Accept all* / *Reject non-essential* / *Manage preferences* (ICO guidance) |
