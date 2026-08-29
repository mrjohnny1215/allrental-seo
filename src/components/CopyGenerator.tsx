import { useState, useMemo } from 'react';
import { Brand, Category, GeneratorInput } from '../types';
import catalog from '../data/products-catalog.json';

const brands: Brand[] = [
  '전체','코웨이','청호나이스','쿠쿠','SK매직','LG전자','교원웰스','현대큐밍','세스코'
];
const categories: Category[] = ['전체','정수기','공기청정기','비데','매트리스','안마의자'];

const initial: GeneratorInput = {
  targetProduct: '',
  brand: '코웨이',
  category: '정수기',
  keyword: '',
  tone: '일반',
};

type ProductItem = { label: string; brand: string; category: string };

function generateCopy(input: GeneratorInput): string {
  const product = input.targetProduct.trim() || '렌탈 상품';
  const keyword = input.keyword.trim() || product;
  const brand = input.brand;
  const category = input.category;
  const tone = input.tone;

  const opening =
    tone === '전문적'
      ? `[${brand} ${category}] ${keyword} 제품 도입 문구를 전문적 톤으로 정리합니다.`
      : tone === '친근한'
      ? `${keyword} 고르시는 분들께 도움 될 만한 후기예요.`
      : `${keyword}에 관심 있으신 분들을 위해 ${brand} ${category} 관련 내용을 정리해봤어요.`;

  const bodyLines = [
    `1) ${keyword}의 핵심 장점`,
    `- ${brand} ${category}의 주요 특장점`,
    `- ${keyword} 실사용 시 만족도가 높은 이유`,
    '',
    `2) 약정·비교·혜택`,
    `- 장기 약정 조건과 실제 월 부담 비교`,
    `- ${keyword}와 비슷한 제품과의 차이`,
    '',
    `3) 추천 대상`,
    `- ${keyword}로 기대할 수 있는 효과`,
    `- 설치/관리 포인트`,
  ];

  const cta = `지금 상담하시면 ${keyword} 관련 맞춤 안내와 사은품 혜택을 카톡으로 빠르게 받아보세요.`;

  return [opening, '', ...bodyLines, '', cta].join('\n');
}

export default function CopyGenerator() {
  const [form, setForm] = useState<GeneratorInput>(initial);
  const [copy, setCopy] = useState('');
  const [copied, setCopied] = useState(false);

  const update = (patch: Partial<GeneratorInput>) => {
    setForm((f) => {
      const next = { ...f, ...patch };
      if (patch.brand || patch.category) {
        const filtered = filterCatalog(next.brand, next.category);
        const first = filtered[0]?.label || '';
        if (!filtered.find((item) => item.label === next.targetProduct)) {
          next.targetProduct = first;
        }
      }
      return next;
    });
    setCopied(false);
  };

  const filtered = useMemo(() => {
    return filterCatalog(form.brand, form.category);
  }, [form.brand, form.category]);

  const run = () => {
    setCopy(generateCopy(form));
    setCopied(false);
  };

  const copyText = async () => {
    if (!copy) return;
    await navigator.clipboard.writeText(copy);
    setCopied(true);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-3">
        <h2 className="text-base font-semibold">원고 생성 입력</h2>
        <label className="block text-xs text-slate-400">타겟 상품</label>
        <select
          value={form.targetProduct}
          onChange={(e) => setForm((f) => ({ ...f, targetProduct: e.target.value }))}
          className="w-full rounded-lg bg-slate-900 border border-white/10 px-3 py-2 text-sm outline-none focus:border-brand-500"
        >
          <option value="">선택</option>
          {filtered.map((p) => (
            <option key={p.label} value={p.label}>{p.label}</option>
          ))}
        </select>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-slate-400 mb-1">브랜드</label>
            <select
              value={form.brand}
              onChange={(e) => update({ brand: e.target.value as Brand })}
              className="w-full rounded-lg bg-slate-900 border border-white/10 px-3 py-2 text-sm outline-none focus:border-brand-500"
            >
              {brands.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">품목</label>
            <select
              value={form.category}
              onChange={(e) => update({ category: e.target.value as Category })}
              className="w-full rounded-lg bg-slate-900 border border-white/10 px-3 py-2 text-sm outline-none focus:border-brand-500"
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        <label className="block text-xs text-slate-400">메인 키워드</label>
        <input
          value={form.keyword}
          onChange={(e) => setForm((f) => ({ ...f, keyword: e.target.value }))}
          placeholder="예: 아이콘3, 얼음정수기, 사은품"
          className="w-full rounded-lg bg-slate-900 border border-white/10 px-3 py-2 text-sm outline-none focus:border-brand-500"
        />

        <label className="block text-xs text-slate-400">톤</label>
        <select
          value={form.tone}
          onChange={(e) => setForm((f) => ({ ...f, tone: e.target.value as GeneratorInput['tone'] }))}
          className="w-full rounded-lg bg-slate-900 border border-white/10 px-3 py-2 text-sm outline-none focus:border-brand-500"
        >
          <option value="일반">일반</option>
          <option value="전문적">전문적</option>
          <option value="친근한">친근한</option>
        </select>

        <button
          onClick={run}
          className="w-full rounded-lg bg-brand-600 px-3 py-2 text-sm font-semibold text-white hover:bg-brand-500"
        >
          SEO 최적화 원고 생성
        </button>
      </div>

      <div className="rounded-xl border border-white/10 bg-slate-900/40">
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-2">
          <span className="text-xs text-slate-400">생성 결과</span>
          <button
            onClick={copyText}
            disabled={!copy}
            className="rounded-md bg-white/10 px-2 py-1 text-xs hover:bg-white/15 disabled:opacity-40"
          >
            {copied ? '복사됨' : '복사'}
          </button>
        </div>
        <pre className="whitespace-pre-wrap p-4 text-xs leading-relaxed text-slate-200">
          {copy || '왼쪽 입력 후 생성 버튼을 누르면 원고가 여기에 표시됩니다.'}
        </pre>
      </div>
    </div>
  );
}

function filterCatalog(brand: Brand, category: Category): ProductItem[] {
  const items: ProductItem[] = Array.isArray(catalog) ? catalog : [];
  if (brand === '전체' && category === '전체') return items.slice(0, 300);
  return items.filter((item) => {
    const matchBrand = brand === '전체' || item.brand === brand;
    const matchCategory = category === '전체' || item.category === category;
    return matchBrand && matchCategory;
  });
}
