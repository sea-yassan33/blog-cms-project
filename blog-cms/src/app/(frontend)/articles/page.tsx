import { getPayload } from 'payload'
import config from '@payload-config'
import { Clock } from 'lucide-react'
import ArticleCard from '@/components/articles/ArticleCard'
import EmptyState from '@/components/pages/EmptyState'
import Header from '@/components/home/Header'

export const revalidate = 60 // 60秒ごとに再生成

export default async function ArticlesPage() {
  // pageデータを取得
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: "articles",
    where: {
      _status: {
        equals: "published",
      },
    },
    limit: 10,
  });
  const articles = result.docs;
  return (
    <>
      <Header />
      <div className="min-h-screen bg-[#f8f9fb]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
          {/* ヘッダーセクション */}
          <div className="mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200 text-xs font-medium text-slate-500 mb-5 shadow-sm">
              <Clock className="w-3.5 h-3.5" />
              <span>公開中の記事一覧</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight leading-tight mb-3">
              Articles
            </h1>
            <p className="text-slate-500 text-sm sm:text-base leading-relaxed">
              公開中の記事を一覧表示しています。各ページをクリックして内容を確認できます。
            </p>
          </div>
          {/* 統計バー */}
          {articles.length > 0 && (
            <div className="flex items-center gap-4 mb-6 px-4 py-3 rounded-xl bg-white border border-slate-100 shadow-sm">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-xs text-slate-500 font-medium">
                  {articles.length} 記事公開中
                </span>
              </div>
              <div className="h-4 w-px bg-slate-200" />
              <span className="text-xs text-slate-400">
                最終更新: 自動更新（60秒ごと）
              </span>
            </div>
          )}
          {/* ページリスト / 空状態 */}
          {articles.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
              <EmptyState />
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {articles.map((article, index) => (
                <ArticleCard
                  key={article.id}
                  page={{
                    id: article.id,
                    title: article.title,
                    slug: article.slug,
                    description: article.description ?? null,
                    publishedAt: article.publishedAt
                      ? String(article.publishedAt)
                      : null,
                  }}
                  index={index}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}