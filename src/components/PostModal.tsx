import { Post } from '../types';

type Props = { post: Post; onClose: () => void };

export default function PostModal({ post, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-slate-900 shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
          <h3 className="text-sm font-semibold text-slate-100">{post.title}</h3>
          <button
            onClick={onClose}
            className="rounded-md bg-white/10 px-2 py-1 text-xs hover:bg-white/15"
          >
            닫기
          </button>
        </div>
        <div className="space-y-4 px-5 py-4 text-sm text-slate-200">
          <section>
            <h4 className="text-xs font-semibold text-slate-400">서론 후킹</h4>
            <p className="mt-1">{post.hook}</p>
          </section>
          <section>
            <h4 className="text-xs font-semibold text-slate-400">본문 핵심 소구점</h4>
            <ul className="mt-1 list-disc pl-5 space-y-1">
              {post.keyPoints.map((k, i) => (
                <li key={i}>{k}</li>
              ))}
            </ul>
          </section>
          <section>
            <h4 className="text-xs font-semibold text-slate-400">하단 CTA</h4>
            <p className="mt-1 rounded-lg bg-white/5 p-3">{post.cta}</p>
          </section>
          <section className="flex flex-wrap gap-2">
            {post.hashtags.map((h) => (
              <span
                key={h}
                className="rounded-full bg-brand-600/15 px-2 py-1 text-xs font-medium text-brand-200"
              >
                {h}
              </span>
            ))}
          </section>
        </div>
      </div>
    </div>
  );
}
