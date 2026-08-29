import { Post } from '../types';
import { rankBadge } from '../utils/seo';

type Props = {
  items: Post[];
  onOpen: (id: string) => void;
};

export default function PostTable({ items, onOpen }: Props) {
  if (!items.length) {
    return (
      <div className="rounded-xl border border-dashed border-white/10 bg-slate-900/40 p-6 text-center text-sm text-slate-400">
        조건에 맞는 게시글이 없습니다.
        <span className="block mt-1 text-xs text-slate-500">
          현재 수집된 데이터는 정수기 위주라 다른 품목은 결과가 적을 수 있습니다.
        </span>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-white/10 bg-slate-900/40">
      <table className="w-full text-left text-sm">
        <thead className="bg-white/5 text-xs text-slate-300">
          <tr>
            <th className="px-3 py-2">랭킹</th>
            <th className="px-3 py-2">제목</th>
            <th className="px-3 py-2">키워드</th>
            <th className="px-3 py-2">블로거</th>
            <th className="px-3 py-2">발행일</th>
            <th className="px-3 py-2 text-right">글자/이미지</th>
            <th className="px-3 py-2 text-right">작업</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {items.map((p) => {
            const badge = rankBadge(p.rank);
            return (
              <tr key={p.id} className="hover:bg-white/5">
                <td className="px-3 py-2">
                  <span
                    className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-bold ${badge.className}`}
                  >
                    {badge.label}
                  </span>
                </td>
                <td className="px-3 py-2 font-medium text-slate-100">
                  {p.title}
                </td>
                <td className="px-3 py-2 text-slate-300">{p.keyword}</td>
                <td className="px-3 py-2 text-slate-300">{p.blogger}</td>
                <td className="px-3 py-2 text-slate-300">{p.publishedAt}</td>
                <td className="px-3 py-2 text-right text-slate-300">
                  {p.charCount.toLocaleString()} / {p.imageCount}
                </td>
                <td className="px-3 py-2 text-right">
                  <div className="flex justify-end gap-2">
                    <a
                      href={p.url}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-md bg-white/10 px-2 py-1 text-xs hover:bg-white/15"
                    >
                      원문 보기
                    </a>
                    <button
                      onClick={() => onOpen(p.id)}
                      className="rounded-md bg-brand-600 px-2 py-1 text-xs text-white hover:bg-brand-500"
                    >
                      분석
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
