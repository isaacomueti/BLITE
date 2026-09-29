import re, html, glob, json


def clean(x):
    return html.unescape(re.sub(r'<[^>]+>', '', re.sub(r'<!--.*?-->', '', x, flags=re.S))).strip()


items = []
for f in sorted(glob.glob('detail/*.html')):
    s = open(f, encoding='utf-8', errors='ignore').read()
    kind, slug = f.replace('\\', '/').split('/')[-1][:-5].split('__')
    d = {'kind': kind, 'slug': slug}
    m = re.search(r'class="detail-media[^>]*>\s*<img src="([^"]+)"', s)
    d['img'] = m.group(1) if m else None
    d['imgs'] = sorted(set(re.findall(r'https://blitefood\.co\.uk/storage/[^"\')\s]+', s)))
    m = re.search(r'<h2 class="mb-2[^>]*>(.*?)</h2>', s, re.S)
    d['name'] = clean(m.group(1)) if m else None
    m = re.search(r'<span\s+class="badge[^>]*>.*?</svg>(.*?)</span>', s, re.S)
    d['cat'] = clean(m.group(1)) if m else None
    m = re.search(r'<p class="text-\[15px\] mt-5[^>]*>(.*?)</p>', s, re.S)
    d['desc'] = clean(m.group(1)) if m else None
    m = re.search(r'Price <span[^>]*>(.*?)</span>', s, re.S)
    d['price'] = clean(m.group(1)) if m else None
    m = re.search(r'Sizes<br>(.*?)</select>', s, re.S)
    d['sizes'] = [clean(o) for o in re.findall(r'<option[^>]*>(.*?)</option>', m.group(1), re.S)] if m else []
    m = re.search(r'Estimated prepare time\s*</td>\s*<td[^>]*>(.*?)</td>', s, re.S)
    d['prep'] = clean(m.group(1)) if m else None
    items.append(d)

json.dump(items, open('items.json', 'w'), indent=1)
for d in items:
    print(d['kind'][:4], d['slug'][:24].ljust(24), (d['name'] or '')[:22].ljust(22), (d['cat'] or '')[:16].ljust(16),
          (d['price'] or '').ljust(8), ','.join(d['sizes'])[:26].ljust(26), d['prep'], len(d['imgs']), (d['desc'] or '')[:60])
