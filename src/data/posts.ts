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

const categoryKeywords: Record<string, string[]> = {
  정수기: ['정수기'],
  공기청정기: ['공기청정기', '공기청정'],
  비데: ['비데'],
  매트리스: ['매트리스', '토퍼'],
  안마의자: ['안마의자', '마사지의자'],
};

function detectBrand(title: string): Brand {
  for (const [brand, keywords] of Object.entries(brandKeywords)) {
    if (keywords.some((k) => title.includes(k))) return brand as Brand;
  }
  return '전체';
}

function detectCategory(title: string): Category {
  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some((k) => title.includes(k))) return category as Category;
  }
  return '전체';
}

function extractHashtags(title: string): string[] {
  const tags = new Set<string>();
  const map: Record<string, string> = {
    코웨이: '#코웨이',
    쿠쿠: '#쿠쿠',
    SK매직: '#SK매직',
    세스코: '#세스코',
    청호: '#청호나이스',
    웰스: '#웰스',
    정수기: '#정수기',
    렌탈: '#렌탈',
    얼음정수기: '#얼음정수기',
    직수: '#직수정수기',
    후기: '#렌탈후기',
    사은품: '#사은품',
    현금지원: '#현금지원',
  };
  for (const [key, tag] of Object.entries(map)) {
    if (title.includes(key)) tags.add(tag);
  }
  return Array.from(tags).slice(0, 5);
}

function generateHook(title: string): string {
  return `실제 설치/사용 기준으로 정리한 ${title.replace(/\s+/g, ' ').trim()} 관련 후기입니다.`;
}

function generateKeyPoints(_title: string): string[] {
  return [
    '제품 선택 기준과 실제 설치 경험 정리',
    '약정·요금 조건 포인트 비교',
    '만족도와 주의점 정리',
  ];
}

function generateCta(_title: string): string {
  return '궁금한 조건이나 상담이 필요하시면 카톡 문의로 빠른 안내 받아보세요.';
}

function estimateCharCount(_title: string): number {
  return 1800 + Math.floor(Math.random() * 900);
}

function estimateImageCount(_title: string): number {
  return 10 + Math.floor(Math.random() * 12);
}

function estimateKeywordDensity(_title: string): number {
  return Number((4.5 + Math.random() * 2.5).toFixed(1));
}

function deriveKeyword(title: string): string {
  if (title.includes('아이콘')) return '코웨이 아이콘 정수기';
  if (title.includes('얼음정수기')) return '얼음정수기 렌탈';
  if (title.includes('직수')) return '직수 정수기 렌탈';
  if (title.includes('사은품')) return '정수기 렌탈 사은품';
  if (title.includes('현금지원')) return '정수기 렌탈 현금지원';
  return '정수기 렌탈';
}

export function loadPosts(): Post[] {
  const raw: Array<{
    blog_id: string;
    post_seq: string;
    url: string;
    title: string;
    posted_raw: string | null;
    posted_date: string | null;
  }> = rawPosts as Array<{
    blog_id: string;
    post_seq: string;
    url: string;
    title: string;
    posted_raw: string | null;
    posted_date: string | null;
  }>;

  return raw.map((item, idx) => {
    const title = item.title || '';
    const brand = detectBrand(title);
    const category = detectCategory(title);
    const keyword = deriveKeyword(title);
    return {
      id: `${item.blog_id}_${item.post_seq}`,
      rank: idx + 1,
      keyword,
      title,
      blogger: item.blog_id,
      publishedAt: item.posted_date || '',
      brand,
      category,
      charCount: estimateCharCount(title),
      imageCount: estimateImageCount(title),
      keywordDensity: estimateKeywordDensity(title),
      url: item.url,
      hook: generateHook(title),
      keyPoints: generateKeyPoints(title),
      cta: generateCta(title),
      hashtags: extractHashtags(title),
      likeCount: 0,
      commentCount: 0,
    } as Post;
  });
}

export const posts: Post[] = loadPosts();
