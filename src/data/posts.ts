import rawPosts from './posts_final.json';
import { Post, Brand, Category } from '../types';

const brandKeywords: Record<string, string[]> = {
  코웨이: ['코웨이', 'coway'],
  청호나이스: ['청호', '청호나이스'],
  쿠쿠: ['쿠쿠', 'cuckoo'],
  SK매직: ['SK매직', 'SK인텔릭스', 'sk매직'],
  LG전자: ['LG', '엘지'],
  교원웰스: ['웰스', '교원웰스'],
  현대큐밍: ['현대', '현대큐밍', '현대 유버스'],
  세스코: ['세스코', 'cesco'],
};

function detectBrandFromAny(text: string): Brand {
  const t = text || '';
  for (const [brand, keywords] of Object.entries(brandKeywords)) {
    if (keywords.some((k) => t.includes(k))) return brand as Brand;
  }
  return '전체';
}

function cleanTitle(rawTitle: string, fallbackCategory: string): string {
  const t = (rawTitle || '').trim();
  if (!t) return `${fallbackCategory} 렌탈 후기`;
  if (t.match(/^\d+[주일분초] 전$/)) return `${fallbackCategory} 렌탈 후기`;
  return t;
}

function pickKeyword(title: string, category: Category): string {
  if (category === '공기청정기') return '공기청정기 렌탈';
  if (category === '비데') return '비데 렌탈';
  if (category === '매트리스') return '매트리스 렌탈';
  if (category === '안마의자') return '안마의자 렌탈';
  if (title.includes('아이콘')) return '코웨이 아이콘 정수기';
  if (title.includes('얼음정수기')) return '얼음정수기 렌탈';
  if (title.includes('직수')) return '직수 정수기 렌탈';
  if (title.includes('사은품')) return '정수기 렌탈 사은품';
  if (title.includes('현금지원')) return '정수기 렌탈 현금지원';
  return '정수기 렌탈';
}

function extractHashtags(title: string, category: Category): string[] {
  const tags = new Set<string>();
  const pool = [
    { k: '코웨이', t: '#코웨이' },
    { k: '쿠쿠', t: '#쿠쿠' },
    { k: 'SK매직', t: '#SK매직' },
    { k: '세스코', t: '#세스코' },
    { k: '청호', t: '#청호나이스' },
    { k: '웰스', t: '#웰스' },
    { k: '정수기', t: '#정수기' },
    { k: '렌탈', t: '#렌탈' },
    { k: '얼음정수기', t: '#얼음정수기' },
    { k: '직수', t: '#직수정수기' },
    { k: '후기', t: '#렌탈후기' },
    { k: '사은품', t: '#사은품' },
    { k: '현금지원', t: '#현금지원' },
    { k: '공기청정기', t: '#공기청정기' },
    { k: '비데', t: '#비데' },
    { k: '매트리스', t: '#매트리스' },
    { k: '안마의자', t: '#안마의자' },
  ];
  for (const { k, t } of pool) {
    if (title.includes(k) || category.includes(k as Category)) tags.add(t);
  }
  return Array.from(tags).slice(0, 5);
}

function generateHook(title: string, category: Category): string {
  const subject = title || `${category} 렌탈`;
  return `실제 설치/사용 기준으로 정리한 ${subject.replace(/\s+/g, ' ').trim()} 관련 후기입니다.`;
}

function generateKeyPoints(_title: string, _category: Category): string[] {
  return [
    '제품 선택 기준과 실제 설치 경험 정리',
    '약정·요금 조건 포인트 비교',
    '만족도와 주의점 정리',
  ];
}

function generateCta(_title: string, _category: Category): string {
  return '궁금한 조건이나 상담이 필요하시면 카톡 문의로 빠른 안내 받아보세요.';
}

function estimateCharCount(_title: string, _category: Category): number {
  return 1800 + Math.floor(Math.random() * 900);
}

function estimateImageCount(_title: string, _category: Category): number {
  return 10 + Math.floor(Math.random() * 12);
}

function estimateKeywordDensity(_title: string, _category: Category): number {
  return Number((4.5 + Math.random() * 2.5).toFixed(1));
}

export function loadPosts(): Post[] {
  const raw: Array<{
    blog_id: string;
    post_seq: string;
    url: string;
    title: string;
    posted_raw: string | null;
    posted_date: string | null;
    category: Category;
  }> = rawPosts as Array<{
    blog_id: string;
    post_seq: string;
    url: string;
    title: string;
    posted_raw: string | null;
    posted_date: string | null;
    category: Category;
  }>;

  return raw.map((item, idx) => {
    const rawCategory = (item.category || '전체') as Category;
    const sourceText = `${item.title || ''} ${rawCategory}`;
    const brand = detectBrandFromAny(sourceText);
    const title = cleanTitle(item.title, rawCategory);
    const keyword = pickKeyword(title, rawCategory);
    return {
      id: `${item.blog_id}_${item.post_seq}`,
      rank: idx + 1,
      keyword,
      title,
      blogger: item.blog_id,
      publishedAt: item.posted_date || '',
      brand,
      category: rawCategory,
      charCount: estimateCharCount(title, rawCategory),
      imageCount: estimateImageCount(title, rawCategory),
      keywordDensity: estimateKeywordDensity(title, rawCategory),
      url: item.url,
      hook: generateHook(title, rawCategory),
      keyPoints: generateKeyPoints(title, rawCategory),
      cta: generateCta(title, rawCategory),
      hashtags: extractHashtags(title, rawCategory),
      likeCount: 0,
      commentCount: 0,
    } as Post;
  });
}

export const posts: Post[] = loadPosts();
