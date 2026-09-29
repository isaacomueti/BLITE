"""Read the price for every size of every dish, the same way the live site's size dropdown does
(one Livewire update per size). Polite: sequential, small delay."""
import re, html, json, time, http.cookiejar, urllib.request, sys

BASE = 'https://blitefood.co.uk'
cj = http.cookiejar.CookieJar()
op = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cj))
op.addheaders = [('User-Agent', 'Mozilla/5.0')]

items = json.load(open('items.json'))
foods = [d for d in items if d['kind'] == 'food']
if len(sys.argv) > 1:
    foods = [d for d in foods if d['slug'] in sys.argv[1:]]
out = {}
for d in foods:
    page = op.open(f"{BASE}/food/{d['slug']}", timeout=60).read().decode('utf-8', 'ignore')
    csrf = re.search(r'data-csrf="([^"]+)"', page).group(1)
    snap_raw = re.search(r'wire:snapshot="([^"]*customer\.food-info[^"]*)"', page).group(1)
    snap = html.unescape(snap_raw)
    sel = re.search(r'wire:model\.live="(selectedSize\.\d+)"', page).group(1)
    opts = re.findall(r'<option value="(\d+)">\s*([^<]+?)\s*</option>', page.split(sel, 1)[1].split('</select>', 1)[0])
    prices = []
    for val, label in opts:
        body = json.dumps({'_token': csrf, 'components': [{'snapshot': snap, 'updates': {sel: val}, 'calls': []}]}).encode()
        req = urllib.request.Request(BASE + '/livewire/update', data=body, method='POST', headers={
            'Content-Type': 'application/json', 'X-Livewire': '', 'X-CSRF-TOKEN': csrf,
            'Referer': f"{BASE}/food/{d['slug']}", 'Accept': 'application/json'})
        try:
            r = json.loads(op.open(req, timeout=60).read())
            h = r['components'][0]['effects'].get('html', '')
            m = re.search(r'Price <span[^>]*>(.*?)</span>', h, re.S)
            price = re.sub(r'<[^>]+>|<!--.*?-->|\s', '', m.group(1)) if m else None
        except Exception as e:
            price = 'ERR ' + str(e)[:60]
        prices.append((label, price))
        time.sleep(0.4)
    out[d['slug']] = prices
    print(d['slug'], prices, flush=True)
    json.dump(out, open('sizes.json' if len(sys.argv) == 1 else 'sizes_test.json', 'w'), indent=1)
