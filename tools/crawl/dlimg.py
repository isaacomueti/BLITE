import json, os, urllib.request, concurrent.futures as cf

items = json.load(open('items.json'))
os.makedirs('img', exist_ok=True)
jobs = []
for d in items:
    for i, u in enumerate(d['imgs']):
        ext = os.path.splitext(u)[1].lower() or '.jpg'
        jobs.append((u, f"img/{d['kind']}__{d['slug']}{'' if i == 0 else '-' + str(i + 1)}{ext}"))


def get(job):
    u, p = job
    if os.path.exists(p) and os.path.getsize(p) > 1000:
        return p, 'skip'
    try:
        req = urllib.request.Request(u, headers={'User-Agent': 'Mozilla/5.0'})
        open(p, 'wb').write(urllib.request.urlopen(req, timeout=90).read())
        return p, os.path.getsize(p)
    except Exception as e:
        return p, 'ERR ' + str(e)


with cf.ThreadPoolExecutor(8) as ex:
    res = list(ex.map(get, jobs))
bad = [r for r in res if isinstance(r[1], str) and r[1].startswith('ERR')]
print(len(res), 'images,', len(bad), 'failed', bad[:5])
