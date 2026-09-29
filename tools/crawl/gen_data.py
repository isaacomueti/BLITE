"""Build blitefood/assets/js/data.js from the live-site crawl (items.json + sizes.json)."""
import json, re

items = json.load(open('items.json', encoding='utf-8'))
sizes = json.load(open('sizes.json', encoding='utf-8'))

CAT = {
    'Quick Meal': 'quick', 'Rice': 'rice', 'Soups & Stews': 'soups', 'Peppersoup': 'peppersoup', 'Porridge': 'porridge',
    'Swallow': 'swallow', 'Meat': 'meat', 'Fish': 'fish', 'Side Dishes': 'sides', 'Pastries/Snacks': 'pastries',
}
NAME_FIX = {
    'noodles-and-chicken': 'Noodles & Chicken', 'chicken': 'Soft Chicken', 'peppered-goat-meat': 'Peppered Goat Meat',
    'beef-and-chicken-stew': 'Beef & Chicken Stew', 'ogbono': 'Ogbono Soup (Assorted)', 'okra': 'Okra Soup (Assorted)',
    'yam-porridge-with-sauce': 'Yam Porridge with Sauce', 'moi-moi-foil-small-size': 'Moi Moi (Small Foil)',
    'bulgur-wheat-rice': 'Bulgur Wheat Jollof Rice',
}
FEATURED = ['assorted-egusi-soup', 'bitterleaf-soup', 'seafood-okra', 'peppered-goat-meat', 'jollof-rice', 'ayamase',
            'pounded-yam', 'goat-meat-peppersoup']


def money(s):
    return float(re.sub(r'[^0-9.]', '', s))


def size_key(label):
    l = label.lower()
    m = re.match(r'(\d+)', l)
    if m:
        return int(m.group(1))
    return {'smalltray': 1, 'mediumtray': 2, 'largetray': 3, 'combo': 0}.get(l.replace(' ', ''), 99)


def size_name(label):
    l = label.strip()
    m = re.match(r'^(\d+)\s*L$', l, re.I)
    if m:
        return f"{m.group(1)} litre{'s' if m.group(1) != '1' else ''}"
    m = re.match(r'^(\d+)\s*Pcs$', l, re.I)
    if m:
        return f"{m.group(1)} piece{'s' if m.group(1) != '1' else ''}"
    return {'smalltray': 'Small tray', 'mediumtray': 'Medium tray', 'largetray': 'Large tray', 'combo': 'Combo'}.get(
        l.lower().replace(' ', ''), l)


def tidy(desc):
    d = (desc or '').strip()
    d = d.replace('Nigerian made with rice cooked', 'Nigerian jollof: rice cooked')
    d = d.replace('rent , ideal', 'rent, ideal')
    d = re.sub(r'\bnigerian\b', 'Nigerian', d)
    d = re.sub(r'\bflavor', 'flavour', d)
    d = re.sub(r'\bSavory\b', 'Savoury', d)
    d = re.sub(r'\s+,', ',', d)
    d = re.sub(r'(^|[.!?]\s+)([a-z])', lambda m: m.group(1) + m.group(2).upper(), d)
    return d


def title(n):
    return ' '.join(w if w.isupper() else w[:1].upper() + w[1:] for w in n.split())


products = []
for d in items:
    if d['kind'] != 'food':
        continue
    slug = d['slug']
    s = sorted(sizes.get(slug, []), key=lambda x: size_key(x[0]))
    portions = []
    base = min(money(p) for _, p in s) if s else money(d['price'])
    for lab, pr in s:
        portions.append({'id': re.sub(r'[^a-z0-9]', '', lab.lower()), 'name': size_name(lab), 'price': money(pr)})
    long = tidy(d['desc'])
    short = long.split('. ')[0].rstrip('.') + '.'
    products.append({
        'id': slug, 'name': NAME_FIX.get(slug, title(d['name'])), 'cat': CAT[d['cat']], 'price': base,
        'desc': short, 'long': long, 'portions': portions, 'prep': (d['prep'] or '').replace('hrs', ' hours'),
        'quick': CAT[d['cat']] == 'quick', 'featured': slug in FEATURED,
        'img': f'assets/img/menu/{slug}.webp',
    })

order = list(CAT.values())
products.sort(key=lambda p: (order.index(p['cat']), p['name']))

equip_fix = {
    'chaffing-dishes': ('chafing-dishes', 'Chafing Dish', 'Serving'),
    'silver-chaffing-dish': ('silver-chafing-dish', 'Silver Chafing Dish', 'Serving'),
    'plates': ('plates', 'Dinner Plates', 'Tableware'), 'charger-plates': ('charger-plates', 'Charger Plates', 'Tableware'),
    'knives': ('knives', 'Knives', 'Cutlery'), 'forks': ('forks', 'Forks', 'Cutlery'), 'spoon': ('spoons', 'Spoons', 'Cutlery'),
    'wine-glasses': ('wine-glasses', 'Wine Glasses', 'Glassware'),
    'big-drums-220l': ('big-drums-220l', 'Big Drum (220L)', 'Storage'), 'small-drums-120l': ('small-drums-120l', 'Small Drum (120L)', 'Storage'),
}
img_slug = {'spoons': 'spoon'}
equipment = []
for d in items:
    if d['kind'] != 'equipment':
        continue
    eid, name, group = equip_fix[d['slug']]
    desc = tidy(d['desc'])
    per = '20 pieces' if '20 pieces' in desc else ''
    equipment.append({'id': eid, 'name': name, 'price': money(d['price']), 'per': per, 'group': group, 'desc': desc,
                      'img': f"assets/img/hire/{img_slug.get(eid, eid)}.webp"})
gorder = ['Serving', 'Tableware', 'Cutlery', 'Glassware', 'Storage']
equipment.sort(key=lambda e: (gorder.index(e['group']), e['name']))

J = lambda o: json.dumps(o, ensure_ascii=False, indent=2)

js = f"""/* Blite Food — catalogue data.
 * Menu, prices (every size), descriptions, prep times and photos were imported from the live site
 * (blitefood.co.uk/food and /equipments) on 29 Sept 2026 by tools/crawl/gen_data.py.
 * In production this comes from Supabase (products, categories, equipment, events tables).
 * Allergens are NOT published on the live site — every dish needs a kitchen-confirmed allergen list
 * before launch (UK Food Information Regulations / Natasha's Law for prepacked-for-direct-sale).
 */
window.BliteData = (function () {{
  const categories = [
    {{ id: "quick", name: "Quick Meals", title: "Quick Meals", blurb: "Ready the same day." }},
    {{ id: "rice", name: "Rice", title: "Rice", blurb: "Jollof, fried, coconut and more." }},
    {{ id: "soups", name: "Soups & Stews", title: "Soups & Stews", blurb: "Rich, flavourful, traditional." }},
    {{ id: "peppersoup", name: "Peppersoup", title: "Peppersoup", blurb: "Light, spicy and warming." }},
    {{ id: "porridge", name: "Porridge", title: "Porridge", blurb: "Beans, yam and ewa agonyi." }},
    {{ id: "swallow", name: "Swallow", title: "Swallow", blurb: "Pounded yam, eba, amala." }},
    {{ id: "meat", name: "Meat", title: "Meat & Poultry", blurb: "Goat, chicken, turkey, snails." }},
    {{ id: "fish", name: "Fish", title: "Fish", blurb: "Tilapia, croaker, hake, red bream." }},
    {{ id: "sides", name: "Side Dishes", title: "Side Dishes", blurb: "Perfect with every meal." }},
    {{ id: "pastries", name: "Pastries & Snacks", title: "Pastries & Snacks", blurb: "Small chops, pies and puff puff." }},
  ];

  // Featured on the homepage (signature section). Rice and soup bowls are real photos;
  // pastries and sides cut-outs are AI-generated stand-ins (see README).
  const featuredCategories = [
    {{ id: "soups", title: "Soups & Stews", blurb: "Rich, flavourful, traditional.", dish: "soup-egusi", img: "assets/img/categories/soup.webp" }},
    {{ id: "rice", title: "Rice", blurb: "From jollof to fried rice.", dish: "rice", img: "assets/img/categories/rice.webp" }},
    {{ id: "pastries", title: "Pastries & Snacks", blurb: "Quick bites, big satisfaction.", dish: "meat-pie", img: "assets/img/categories/pastries.webp" }},
    {{ id: "sides", title: "Side Dishes", blurb: "Perfect with every meal.", dish: "plantain", img: "assets/img/categories/sides.webp" }},
  ];

  // Each portion carries its own live price; `price` on the product is the lowest ("from").
  const products = {J(products)}.map((p) => Object.assign({{ addons: [], allergens: null, dish: "rice" }}, p, {{
    portions: p.portions.map((o) => Object.assign({{ delta: Math.round((o.price - p.price) * 100) / 100 }}, o)),
    images: [p.img],
  }}));

  const allergenNames = {{
    celery: "Celery", gluten: "Cereals containing gluten", crustaceans: "Crustaceans", eggs: "Eggs", fish: "Fish", lupin: "Lupin",
    milk: "Milk", molluscs: "Molluscs", mustard: "Mustard", nuts: "Tree nuts", peanuts: "Peanuts", sesame: "Sesame", soya: "Soya", sulphites: "Sulphites",
  }};

  // Live prices are per hire (the live site does not say per day). Stock levels are placeholders
  // so the date-availability check can be demonstrated — confirm real quantities with operations.
  const equipment = {J(equipment)}.map((e) => Object.assign({{ unit: "hire", stock: 20, confirmStock: true, dish: "eq-plates" }}, e));

  const events = [
    {{ id: "pauline-at-85", title: "Pauline at 85", type: "Birthdays", label: "Classic birthday party",
      img: "assets/img/events/pauline-85.webp", images: ["assets/img/events/pauline-85.webp", "assets/img/events/pauline-85-2.webp", "assets/img/events/pauline-85-3.webp"] }},
  ];

  const deliveryZones = [
    // prefix → fee / ETA (placeholder zones centred on Hatfield, Herts — confirm with operations)
    {{ prefixes: ["AL"], fee: 2.5, eta: "30–45 minutes" }},
    {{ prefixes: ["SG", "EN", "WD", "HP", "LU"], fee: 3.5, eta: "35–50 minutes" }},
    {{ prefixes: ["N", "NW", "E", "EC", "WC", "W", "SW", "SE", "HA", "UB", "IG", "RM", "CM"], fee: 5.5, eta: "50–75 minutes" }},
  ];

  const business = {{
    name: "B-Lite Food",
    legalName: "B-LITE FOOD CATERING SERVICES LTD",
    address: "62 Featherdell, Hatfield, Hertfordshire",
    phone: "+44 7944 116960",
    phoneHref: "+447944116960",
    email: "support@blitefood.co.uk",
    infoEmail: "info@blitefood.co.uk",
    whatsapp: "https://wa.me/447944116960",
    instagram: "https://www.instagram.com/b_lite_food",
    tiktok: "https://www.tiktok.com/@blitefood",
    facebook: "https://facebook.com/",
    orderHours: {{ open: 7, close: 19 }},
    deliveryHours: "8am–6pm, Monday to Saturday",
    prepTime: "3 hours",
  }};

  return {{ categories, featuredCategories, products, equipment, events, allergenNames, deliveryZones, business }};
}})();
"""
open('../../assets/js/data.js', 'w', encoding='utf-8').write(js)
print(len(products), 'products,', len(equipment), 'equipment')
for p in products[:4]:
    print(p['id'], p['price'], [(o['name'], o['price']) for o in p['portions']])
