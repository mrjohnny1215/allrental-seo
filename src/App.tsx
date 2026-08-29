import { useState, useMemo } from 'react';
import { posts } from './data/posts';
import { filterPosts, computeSummary } from './utils/seo';
import SeoSummaryCards from './components/SeoSummaryCards';
import PostTable from './components/PostTable';
import CopyGenerator from './components/CopyGenerator';
import PostModal from './components/PostModal';

type Tab = 'dashboard' | 'generator';

export default function App() {
  const [tab, setTab] = useState<Tab>('dashboard');
  const [keyword, setKeyword] = useState('');
  const [brand, setBrand] = useState<string>('전체');
  const [category, setCategory] = useState<string>('전체');
  const [selected, setSelected] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return filterPosts(posts, { keyword, brand, category });
  }, [keyword, brand, category]);

  const summary = useMemo(() => {
    return computeSummary(filtered);
  }, [filtered]);

  const selectedPost = selected ? posts.find((p) => p.id === selected) : null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-white/10 bg-slate-900/70 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight">
              ALL렌탈 SEO 대시보드
            </h1>
            <p className="text-xs text-slate-400">
              네이버 상위 블로그 역분석 + 광고 원고 생성
            </p>
          </div>
          <nav className="flex gap-2 text-sm">
            <button
              onClick={() => setTab('dashboard')}
              className={`rounded-lg px-3 py-1.5 ${
                tab === 'dashboard'
                  ? 'bg-brand-600 text-white'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10'
              }`}
            >
              대시보드
            </button>
            <button
              onClick={() => setTab('generator')}
              className={`rounded-lg px-3 py-1.5 ${
                tab === 'generator'
                  ? 'bg-brand-600 text-white'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10'
              }`}
            >
              광고 원고 생성기
            </button>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 space-y-6">
        {tab === 'dashboard' ? (
          <>
            <section className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="md:col-span-2">
                <label className="block text-xs text-slate-400 mb-1">
                  키워드 검색
                </label>
                <input
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="예: 아이콘, 얼음정수기, 사은품"
                  className="w-full rounded-lg bg-slate-900 border border-white/10 px-3 py-2 text-sm outline-none focus:border-brand-500"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">브랜드</label>
                <select
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="w-full rounded-lg bg-slate-900 border border-white/10 px-3 py-2 text-sm outline-none focus:border-brand-500"
                >
                  {['전체','코웨이','청호나이스','쿠쿠','SK매직','LG전자','교원웰스','현대큐밍','세스코'].map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">품목</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-lg bg-slate-900 border border-white/10 px-3 py-2 text-sm outline-none focus:border-brand-500"
                >
                  {['전체','정수기','공기청정기','비데','매트리스','안마의자'].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </section>

            <section>
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold">SEO 공식 벤치마크</h2>
                <span className="text-xs text-slate-400">
                  상위 {Math.min(filtered.length, 5)}개 기준
                </span>
              </div>
              <div className="mt-3">
                <SeoSummaryCards summary={summary} />
              </div>
            </section>

            <section>
              <h2 className="text-base font-semibold">네이버 수집 게시글</h2>
              <div className="mt-3">
                <PostTable
                  items={filtered}
                  onOpen={(id: string) => setSelected(id)}
                />
              </div>
            </section>
          </>
        ) : (
          <CopyGenerator />
        )}
      </main>

      {selectedPost && (
        <PostModal post={selectedPost} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
