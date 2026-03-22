import Link from 'next/link'
import { Badge } from "@/components/ui/badge";
import { FileText, ArrowUpRight, Calendar } from 'lucide-react'

export default function ArticleCard({
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
      href={`/articles/${page.slug}`}
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