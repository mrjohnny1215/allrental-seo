export type Brand =
  | '전체'
  | '코웨이'
  | '청호나이스'
  | '쿠쿠'
  | 'SK매직'
  | 'LG전자'
  | '교원웰스'
  | '현대큐밍'
  | '세스코';

export type Category =
  | '전체'
  | '정수기'
  | '공기청정기'
  | '비데'
  | '매트리스'
  | '안마의자';

export interface Post {
  id: string;
  rank: number;
  keyword: string;
  title: string;
  blogger: string;
  publishedAt: string;
  brand: Brand;
  category: Category;
  charCount: number;
  imageCount: number;
  keywordDensity: number;
  url: string;
  hook: string;
  keyPoints: string[];
  cta: string;
  hashtags: string[];
  likeCount: number;
  commentCount: number;
}

export interface SeoSummary {
  avgCharCount: number;
  avgImageCount: number;
  avgKeywordDensity: number;
  topTitlePattern: string;
  topHashtags: string[];
}

export interface GeneratorInput {
  targetProduct: string;
  brand: Brand;
  category: Category;
  keyword: string;
  tone: '일반' | '전문적' | '친근한';
}
