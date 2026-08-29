import { Post, SeoSummary } from '../types';

export function filterPosts(
  items: Post[],
  params: {
    keyword: string;
    brand: string;
    category: string;
  }
): Post[] {
  const q = params.keyword.trim().toLowerCase();
  return items.filter((p) => {
    const matchBrand = params.brand === '전체' || p.brand === params.brand;
    const matchCategory =
      params.category === '전체' || p.category === params.category;
    const matchKeyword =
      !q ||
      p.title.toLowerCase().includes(q) ||
      p.keyword.toLowerCase().includes(q) ||
      p.hashtags.some((h) => h.toLowerCase().includes(q));
    return matchBrand && matchCategory && matchKeyword;
  });
}

export function computeSummary(items: Post[]): SeoSummary {
  const top5 = items.slice(0, 5);
  const n = top5.length || 1;
  const avgCharCount = Math.round(
    top5.reduce((sum, p) => sum + p.charCount, 0) / n
  );
  const avgImageCount = Number(
    (top5.reduce((sum, p) => sum + p.imageCount, 0) / n).toFixed(1)
  );
  const avgKeywordDensity = Number(
    (top5.reduce((sum, p) => sum + p.keywordDensity, 0) / n).toFixed(1)
  );

  const hashtagCount = new Map<string, number>();
  for (const p of top5) {
    for (const h of p.hashtags) {
      hashtagCount.set(h, (hashtagCount.get(h) || 0) + 1);
    }
  }
  const topHashtags = Array.from(hashtagCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([h]) => h);

  return {
    avgCharCount,
    avgImageCount,
    avgKeywordDensity,
    topTitlePattern: '[브랜드명] + [모델명] + [실사용/후기] + [가격/약정 혜택]',
    topHashtags,
  };
}

export function rankBadge(rank: number) {
  if (rank === 1) return { label: '1위', className: 'bg-yellow-400 text-black' };
  if (rank === 2) return { label: '2위', className: 'bg-gray-300 text-black' };
  if (rank === 3) return { label: '3위', className: 'bg-orange-300 text-black' };
  return { label: `${rank}위`, className: 'bg-white/10 text-white' };
}
