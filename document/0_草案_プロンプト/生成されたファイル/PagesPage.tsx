import { getPayload } from 'payload'
import config from '@payload-config'
import Link from 'next/link'
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Header from '@/components/home/Header'
import { FileText, ArrowUpRight, Calendar, Clock } from 'lucide-react'

export const revalidate = 60

// ページカードコンポーネント
function PageCard({
  page,
  index,
}: {
  page: {
    id: string | number
    title: string
    slug: string
    description?: string | null
    publishedAt?: string | null
  }
  index: number
}) {
  const formattedDate = page.publishedAt
    ? new Date(page.publishedAt).toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : null

  return (
    <Link
      href={`/pages/${page.slug}`}
      className="group relative flex flex-col sm:flex-row sm:items-center gap-4 p-5 sm:p-6 rounded-2xl bg-white border border-slate-100 hover:border-slate-300 hover:shadow-lg transition-all duration-300 ease-out overflow-hidden"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* 左側：番号 */}
      <div className="hidden sm:flex items-center justify-center w-10 h-10 rounded-xl bg-slate-50 group-hover:bg-slate-100 transition-colors duration-200 shrink-0">
        <span className="text-sm font-semibold text-slate-400 font-mono">
          {String(index + 1).padStart(2, '0')}
        </span>
      </div>

      {/* アイコン（SP用） */}
      <div className="flex sm:hidden items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center">
            <FileText className="w-3.5 h-3.5 text-slate-500" />
          </div>
          <span className="text-xs font-mono text-slate-400">
            #{String(index + 1).padStart(2, '0')}
          </span>
        </div>
        <Badge
          variant="outline"
          className="text-xs px-2 py-0.5 font-mono bg-slate-50 text-slate-500 border-slate-200"
        >
          /{page.slug}
        </Badge>
      </div>

      {/* 中央：コンテンツ */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mb-1">
          <span className="font-semibold text-slate-800 text-base sm:text-[15px] leading-snug group-hover:text-slate-900 transition-colors line-clamp-1">
            {page.title}
          </span>
          {/* スラッグ（PC用） */}
          <Badge
            variant="outline"
            className="hidden sm:inline-flex text-xs px-2 py-0.5 font-mono bg-slate-50 text-slate-500 border-slate-200 shrink-0"
          >
            /{page.slug}
          </Badge>
        </div>

        {page.description && (
          <p className="text-sm text-slate-500 line-clamp-1 leading-relaxed">
            {page.description}
          </p>
        )}

        {formattedDate && (
          <div className="flex items-center gap-1 mt-2">
            <Calendar className="w-3 h-3 text-slate-400" />
            <span className="text-xs text-slate-400">{formattedDate}</span>
          </div>
        )}
      </div>

      {/* 右側：矢印アイコン */}
      <div className="hidden sm:flex items-center justify-center w-8 h-8 rounded-full bg-slate-50 group-hover:bg-slate-900 transition-colors duration-200 shrink-0">
        <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors duration-200" />
      </div>

      {/* ホバー時の左ボーダーアクセント */}
      <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-slate-900 scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-center rounded-full" />
    </Link>
  )
}

// 空状態コンポーネント
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-5">
        <FileText className="w-7 h-7 text-slate-400" />
      </div>
      <h3 className="text-lg font-semibold text-slate-700 mb-2">
        ページがありません
      </h3>
      <p className="text-sm text-slate-500 mb-6 max-w-xs leading-relaxed">
        まだ公開されているページがありません。管理画面からページを作成してください。
      </p>
      <Button
        asChild
        className="bg-slate-900 hover:bg-slate-700 text-white rounded-xl px-5 py-2.5 text-sm font-medium transition-colors"
      >
        <Link href="/admin">管理画面でページを作成する</Link>
      </Button>
    </div>
  )
}

export default async function PagesPage() {
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'pages',
    where: {
      _status: {
        equals: 'published',
      },
    },
    limit: 10,
  })
  const pages = result.docs

  return (
    <>
      <Header />
      <div className="min-h-screen bg-[#f8f9fb]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16">

          {/* ヘッダーセクション */}
          <div className="mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200 text-xs font-medium text-slate-500 mb-5 shadow-sm">
              <Clock className="w-3.5 h-3.5" />
              <span>公開中のページ一覧</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight leading-tight mb-3">
              Pages
            </h1>
            <p className="text-slate-500 text-sm sm:text-base leading-relaxed">
              公開中のページを一覧表示しています。各ページをクリックして内容を確認できます。
            </p>
          </div>

          {/* 統計バー */}
          {pages.length > 0 && (
            <div className="flex items-center gap-4 mb-6 px-4 py-3 rounded-xl bg-white border border-slate-100 shadow-sm">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-xs text-slate-500 font-medium">
                  {pages.length} ページ公開中
                </span>
              </div>
              <div className="h-4 w-px bg-slate-200" />
              <span className="text-xs text-slate-400">
                最終更新: 自動更新（60秒ごと）
              </span>
            </div>
          )}

          {/* ページリスト / 空状態 */}
          {pages.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
              <EmptyState />
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {pages.map((page, index) => (
                <PageCard
                  key={page.id}
                  page={{
                    id: page.id,
                    title: page.title,
                    slug: page.slug,
                    description: page.description ?? null,
                    publishedAt: page.publishedAt
                      ? String(page.publishedAt)
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
  )
}
