import { SeoSummary } from '../types';

type Props = { summary: SeoSummary };

const cards = (summary: SeoSummary) => [
  {
    label: '평균 글자 수',
    value: `${summary.avgCharCount.toLocaleString()}자`,
    hint: '권장 2,000자 이상',
  },
  {
    label: '평균 이미지 수',
    value: `${summary.avgImageCount}장`,
    hint: '사진 + GIF 포함',
  },
  {
    label: '핵심 키워드 밀도',
    value: `${summary.avgKeywordDensity}회`,
    hint: '스팸 필터 주의',
  },
  {
    label: '상위 노출 제목 패턴',
    value: summary.topTitlePattern,
    hint: 'CTA + 약정 혜택 권장',
  },
];

export default function SeoSummaryCards({ summary }: Props) {
  const items = cards(summary);
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {items.map((c) => (
        <div
          key={c.label}
          className="rounded-xl border border-white/10 bg-slate-900/60 p-4"
        >
          <p className="text-xs text-slate-400">{c.label}</p>
          <p className="mt-1 text-sm font-semibold text-slate-100 break-all">
            {c.value}
          </p>
          <p className="mt-1 text-xs text-slate-500">{c.hint}</p>
        </div>
      ))}
      <div className="rounded-xl border border-white/10 bg-slate-900/60 p-4 sm:col-span-2 lg:col-span-4">
        <p className="text-xs text-slate-400">많이 쓰인 해시태그 Top 5</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {summary.topHashtags.map((h) => (
            <span
              key={h}
              className="rounded-full bg-brand-600/15 px-2 py-1 text-xs font-medium text-brand-200"
            >
              {h}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
