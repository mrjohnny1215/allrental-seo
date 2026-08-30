#!/usr/bin/env python3
"""Daily incremental crawl + sync + deploy pipeline for allrental-seo (optimized)."""
import json
import os
import subprocess
import sys
import time
import urllib.parse
import urllib.request
import re
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.abspath(os.path.join(BASE_DIR, '..'))
CRAWL_DIR = '/opt/data/naver_blog_crawl'
DEST_JSON = os.path.join(PROJECT_DIR, 'src', 'data', 'posts_final.json')
LOG_PATH = os.path.join(BASE_DIR, 'daily_sync.log')

UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36"
BASE = "https://search.naver.com/search.naver?ssc=tab.blog.all&sm=tab_jum&query={q}&start={start}"
URL_RE = re.compile(r'data-url="(https://blog\.naver\.com/([A-Za-z0-9_\-]+)/(\d+))"')
DATE_RE = re.compile(r'profile-info-subtext">\s*([^<]+(?:전|\d{4}\.\d{2}\.\d{2}))\s*<')

BRANDS = ['전체','코웨이','청호나이스','쿠쿠','SK매직','LG전자','교원웰스','현대큐밍','세스코']
CATEGORIES = ['전체','정수기','공기청정기','비데','매트리스','안마의자']

KEYWORDS = {
    '정수기': [
        '정수기렌탈',
        '얼음정수기 렌탈',
        '직수정수기 렌탈',
        '정수기 렌탈 사은품',
        '정수기 렌탈 가격비교',
    ],
    '공기청정기': [
        '공기청정기 렌탈',
        '대용량 공기청정기 렌탈',
        '원룸 공기청정기 추천',
        '공기청정기 렌탈 사은품',
        '공기청정기 렌탈 가격비교',
    ],
    '비데': [
        '비데 렌탈',
        '방수 비데 렌탈',
        '비데 살균 케어 렌탈',
        '비데 렌탈 사은품',
        '비데 렌탈 가격비교',
    ],
    '매트리스': [
        '매트리스 렌탈',
        '모션베드 렌탈',
        '매트리스 케어 클리닝 렌탈',
        '매트리스 렌탈 사은품',
        '매트리스 렌탈 가격비교',
    ],
    '안마의자': [
        '안마의자 렌탈',
        '컴팩트 안마의자 렌탈',
        '안마의자 가격 비교 렌탈',
        '안마의자 렌탈 사은품',
        '안마의자 렌탈 할인',
    ],
}

BASE_FILES = {
    '정수기': os.path.join(CRAWL_DIR, 'posts_final.json'),
    '공기청정기': os.path.join(CRAWL_DIR, '공기청정기렌탈_full.json'),
    '비데': os.path.join(CRAWL_DIR, '비데렌탈_full.json'),
    '매트리스': os.path.join(CRAWL_DIR, '매트리스렌탈_full.json'),
    '안마의자': os.path.join(CRAWL_DIR, '안마의자렌탈_full.json'),
}

def log(msg: str):
    line = f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] {msg}"
    print(line, flush=True)
    with open(LOG_PATH, 'a', encoding='utf-8') as f:
        f.write(line + '\n')

def fetch_page(start: int, query: str):
    url = BASE.format(q=urllib.parse.quote(query), start=start)
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept-Language": "ko-KR,ko;q=0.9"})
    with urllib.request.urlopen(req, timeout=15) as r:
        return r.read().decode("utf-8", "ignore")

def extract_posts(html: str):
    """Extract (blog_id, post_seq, posted_date) tuples from HTML."""
    events = []
    for m in URL_RE.finditer(html):
        events.append((m.start(), "u", (m.group(2), m.group(3))))
    for m in DATE_RE.finditer(html):
        events.append((m.start(), "d", m.group(1).strip()))
    events.sort()
    results = []
    for i, (pos, typ, val) in enumerate(events):
        if typ == "u":
            nxt = next((e for e in events[i + 1:] if e[1] == "d"), None)
            if nxt:
                results.append((val[0], val[1], nxt[2]))
    return results

def crawl_keyword(args):
    """Crawl all pages for a single keyword. Returns list of posts."""
    q, category = args
    seen = {}
    order = []
    for start in range(1, 1001, 30):
        try:
            html = fetch_page(start, q)
        except Exception as e:
            log(f"  [WARN] {q} start={start}: {e}")
            time.sleep(1.5)
            continue
        posts = extract_posts(html)
        if not posts:
            break
        for blog_id, post_seq, posted in posts:
            key = f"{blog_id}/{post_seq}"
            if key not in seen:
                seen[key] = {
                    "blog_id": blog_id,
                    "post_seq": post_seq,
                    "url": f"https://blog.naver.com/{blog_id}/{post_seq}",
                    "posted": posted,
                    "category": category,
                }
                order.append(key)
        time.sleep(0.25)
    return [seen[k] for k in order]

def crawl_category(category: str):
    merged = []
    queries = KEYWORDS.get(category, [])
    if not queries:
        return merged
    # Use thread pool to crawl keywords concurrently
    with ThreadPoolExecutor(max_workers=2) as executor:
        futures = {executor.submit(crawl_keyword, (q, category)): q for q in queries}
        for future in as_completed(futures):
            q = futures[future]
            try:
                result = future.result()
                merged.extend(result)
                log(f"  {q}: +{len(result)} posts")
            except Exception as e:
                log(f"  [ERROR] {q}: {e}")
    return merged

def load_existing(path: str):
    if not os.path.exists(path):
        return []
    with open(path, 'r', encoding='utf-8') as f:
        return json.load(f)

def upsert(existing, incoming):
    by_key = {}
    for item in existing:
        key = f"{item.get('blog_id')}_{item.get('post_seq')}"
        by_key[key] = item
    added = 0
    for item in incoming:
        key = f"{item.get('blog_id')}_{item.get('post_seq')}"
        if key not in by_key:
            by_key[key] = item
            added += 1
    return list(by_key.values()), added

def write_json(path, data):
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

def git_commit_and_push(message: str):
    cmds = [
        ['git', 'add', '.'],
        ['git', 'commit', '-m', message],
        ['git', 'push', 'origin', 'main'],
    ]
    for cmd in cmds:
        subprocess.run(cmd, cwd=PROJECT_DIR, check=True)

def vercel_deploy():
    token = os.environ.get('VERCEL_TOKEN')
    if not token:
        log('[WARN] VERCEL_TOKEN not set, skip deploy')
        return
    subprocess.run(
        ['npx', 'vercel', '--prod', '--token', token, '--yes'],
        cwd=PROJECT_DIR,
        check=False,
    )

def main():
    log('=== daily sync start ===')
    # 1) incremental crawl + upsert
    final_merged = []
    for category in ['정수기', '공기청정기', '비데', '매트리스', '안마의자']:
        log(f'crawl category={category}')
        incoming = crawl_category(category)
        existing_path = BASE_FILES.get(category)
        existing = load_existing(existing_path) if existing_path else []
        merged, added = upsert(existing, incoming)
        if existing_path:
            write_json(existing_path, merged)
        final_merged.extend(merged)
        log(f' {category}: existing={len(existing)} incoming={len(incoming)} added={added} total={len(merged)}')
    # 2) write posts_final.json
    write_json(DEST_JSON, final_merged)
    log(f' posts_final.json written: {len(final_merged)}')
    # 3) git + deploy
    git_commit_and_push(f'chore: daily incremental crawl sync {datetime.now().strftime("%Y-%m-%d %H:%M")}')
    vercel_deploy()
    log('=== daily sync done ===')

if __name__ == '__main__':
    main()
