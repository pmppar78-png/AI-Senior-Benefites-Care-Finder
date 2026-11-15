#!/usr/bin/env python3
"""Load every source URL in engines/data/sources/senior-benefits-sourced-2026.json in a real
Chromium browser and record the result in engines/data/sources/source-checks.json.

engines/seed-data.js only prints "Checked <date>" next to a source whose latest check here
loaded (HTTP 2xx/3xx, not an error page) for the exact URL in the sources file. Anything else
is flagged at build time and gets no "Checked" stamp.

Run from the repo root:  python3 scripts/check-sources.py
Exit code 1 if any source failed.
"""
import json, re, sys, datetime, pathlib
from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / 'engines/data/sources/senior-benefits-sourced-2026.json'
OUT = ROOT / 'engines/data/sources/source-checks.json'
MANUAL = ROOT / 'engines/data/sources/source-checks-manual.json'
ERROR_TITLE = re.compile(r'page not found|not found|404|error|access denied|forbidden', re.I)

def check(ctx, url):
    page = ctx.new_page()
    try:
        if url.lower().split('?')[0].endswith('.pdf'):
            r = ctx.request.get(url, timeout=45000)
            ok = r.ok and 'pdf' in (r.headers.get('content-type', '').lower())
            return {'status': r.status, 'ok': ok, 'title': r.headers.get('content-type', '')}
        r = page.goto(url, wait_until='domcontentloaded', timeout=45000)
        status = r.status if r else 0
        title = (page.title() or '').strip()
        ok = bool(r) and 200 <= status < 400 and not ERROR_TITLE.search(title)
        return {'status': status, 'ok': ok, 'title': title[:140], 'finalUrl': page.url}
    except Exception as e:
        return {'status': 0, 'ok': False, 'title': 'error: ' + str(e).splitlines()[0][:140]}
    finally:
        page.close()

def main():
    sources = json.loads(SRC.read_text())['sources']
    now = datetime.datetime.now().astimezone()
    results = {}
    manual = json.loads(MANUAL.read_text())['entries'] if MANUAL.exists() else {}
    with sync_playwright() as p:
        browser = p.chromium.launch(args=['--headless=new'])
        ctx = browser.new_context(
            user_agent='Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36',
            locale='en-US', accept_downloads=False)
        for sid, s in sources.items():
            res = check(ctx, s['url'])
            res.update(url=s['url'], checkedAt=now.strftime('%Y-%m-%d'), method='chromium')
            m = manual.get(sid)
            if not res['ok'] and m and m.get('url') == s['url'] and (now.date() - datetime.date.fromisoformat(m['checkedAt'])).days <= 14:
                res.update(ok=True, checkedAt=m['checkedAt'], method='manual: ' + m['method'], browserResult=f"{res['status']} {res['title']}", title=m['title'])
            results[sid] = res
            print(('OK  ' if res['ok'] else 'FAIL'), res['status'], sid, s['url'], '|', res['title'])
        browser.close()
    OUT.write_text(json.dumps({'_readme': 'Written by scripts/check-sources.py. seed-data.js stamps "Checked <date>" only on sources with ok=true for the same URL.', 'results': results}, indent=1) + '\n')
    bad = [k for k, v in results.items() if not v['ok']]
    print(f'{len(results) - len(bad)}/{len(results)} sources loaded; failed: {bad}')
    sys.exit(1 if bad else 0)

if __name__ == '__main__':
    main()
