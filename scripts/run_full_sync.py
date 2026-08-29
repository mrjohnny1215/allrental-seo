#!/usr/bin/env python3
"""네이버 크롤 데이터 병합 → allrental-seo 배포 자동 동기화 스크립트."""
import json
import os
import subprocess
from datetime import datetime

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.abspath(os.path.join(BASE_DIR, '..'))
CRAWL_DIR = '/opt/data/naver_blog_crawl'
DEST_JSON = os.path.join(PROJECT_DIR, 'src', 'data', 'posts_final.json')

FILES = {
    '정수기': os.path.join(CRAWL_DIR, 'posts_final.json'),
    '공기청정기': os.path.join(CRAWL_DIR, '공기청정기렌탈_full.json'),
    '비데': os.path.join(CRAWL_DIR, '비데렌탈_full.json'),
    '매트리스': os.path.join(CRAWL_DIR, '매트리스렌탈_full.json'),
    '안마의자': os.path.join(CRAWL_DIR, '안마의자렌탈_full.json'),
}

def merge_crawl_data():
    merged = []
    for category, path in FILES.items():
        if not os.path.exists(path):
            continue
        with open(path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        for it in data:
            merged.append({
                'blog_id': it.get('blog_id'),
                'post_seq': it.get('post_seq'),
                'url': it.get('url'),
                'title': it.get('title') or it.get('posted') or '',
                'posted_raw': it.get('posted_raw') or it.get('posted'),
                'posted_date': it.get('posted_date'),
                'category': category,
            })
    return merged

def write_merged(merged):
    with open(DEST_JSON, 'w', encoding='utf-8') as f:
        json.dump(merged, f, ensure_ascii=False, indent=2)

def git_commit_and_push():
    subprocess.run(['git', 'add', '.'], cwd=PROJECT_DIR, check=True)
    subprocess.run(
        ['git', 'commit', '-m', f'feat: sync naver crawl data (all categories) {datetime.now().strftime("%Y-%m-%d %H:%M")}'],
        cwd=PROJECT_DIR,
        check=True,
    )
    subprocess.run(['git', 'push', 'origin', 'main'], cwd=PROJECT_DIR, check=True)

def vercel_deploy():
    token = os.environ.get('VERCEL_TOKEN')
    if not token:
        print('[WARN] VERCEL_TOKEN not set, skip deploy')
        return
    subprocess.run(
        ['npx', 'vercel', '--prod', '--token', token, '--yes'],
        cwd=PROJECT_DIR,
        check=False,
    )

def main():
    print('[1/4] merge crawl data...')
    merged = merge_crawl_data()
    print(f' merged posts: {len(merged)}')
    print('[2/4] write posts_final.json...')
    write_merged(merged)
    print('[3/4] git commit + push...')
    git_commit_and_push()
    print('[4/4] vercel deploy...')
    vercel_deploy()
    print('done')

if __name__ == '__main__':
    main()
