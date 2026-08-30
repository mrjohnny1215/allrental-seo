import urllib.request
import urllib.parse
import re
import time

UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36"
BASE = "https://search.naver.com/search.naver?ssc=tab.blog.all&sm=tab_jum&query={q}&start={start}"
URL_RE = re.compile(r'data-url="(https://blog\.naver\.com/([A-Za-z0-9_\-]+)/(\d+))"')
DATE_RE = re.compile(r'profile-info-subtext">\s*([^<]+(?:전|\d{4}\.\d{2}\.\d{2}))\s*<')

q = '정수기렌탈'
for start in [1, 31]:
    url = BASE.format(q=urllib.parse.quote(q), start=start)
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept-Language": "ko-KR,ko;q=0.9"})
    try:
        t0 = time.time()
        with urllib.request.urlopen(req, timeout=15) as r:
            html = r.read().decode("utf-8", "ignore")
        dt = time.time() - t0
        urls = URL_RE.findall(html)
        dates = DATE_RE.findall(html)
        print(f"start={start} len={len(html)} urls={len(urls)} dates={len(dates)} time={dt:.1f}s")
        if urls:
            print("  first url:", urls[0][0])
        time.sleep(0.5)
    except Exception as e:
        print(f"start={start} ERROR: {type(e).__name__}: {e}")
