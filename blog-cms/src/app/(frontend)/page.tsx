import { getPayload } from 'payload'
import config from '@payload-config'
import Link from 'next/link'
import { formatDate } from '@/components/function/formatDate'
import { groupByMonth } from '@/components/function/groupByMonth'
import AuthorAvatar from '@/components/parts/AuthorAvatar'
import SidebarItem from '@/components/parts/SidebarItem'
import FilterChip from '@/components/parts/FilterChip'
import IconHome from '@/components/icons/IconHome'
import IconCalendar from '@/components/icons/IconCalender'
import IconSettings from '@/components/icons/IconSettings'

export const revalidate = 60 // 60秒ごとに再生成

export default async function HomePage() {
  // postsデータを取得
  const payload = await getPayload({ config })
  const posts = await payload.find({
    collection: 'posts',
    where: { status: { equals: 'published' }, },
    sort: '-publishedAt',
    depth: 1,
  })
  console.log(posts);
  // データを月毎にグループ化
  const grouped = groupByMonth(posts.docs)
  // 月毎のグループキーを抽出
  const months = Object.keys(grouped)
  return (
    <div className="flex min-h-screen bg-[#f5f6f7] text-[13px] text-[#333640]">
      {/* ===== Sidebar ===== */}
      <aside className="fixed top-0 left-0 bottom-0 w-[220px] bg-[#2e3d5b] flex flex-col z-40 shrink-0">
        {/* Logo */}
        <div className="px-5 py-4 border-b border-white/10">
          <span className="text-lg font-bold text-white tracking-wide">📋 Blog List</span>
          <small className="block text-[10px] text-white/40 mt-0.5 tracking-widest uppercase">Blog CMS Sample</small>
        </div>
        {/* Nav */}
        <nav className="py-3 flex-1">
          <p className="px-5 py-2 text-[10px] font-semibold text-white/40 tracking-widest uppercase">メニュー</p>
          <Link href="/admin/collections/posts?depth=1&limit=10">
            <SidebarItem icon={<IconHome />} label="記事管理" active />
          </Link>
          <Link href="#">
            <SidebarItem icon={<IconCalendar />} label="カレンダー" />
          </Link>
          <p className="px-5 py-2 mt-2 text-[10px] font-semibold text-white/40 tracking-widest uppercase">設定</p>
          <Link href="/admin">
            <SidebarItem icon={<IconSettings />} label="管理画面" />
          </Link>
        </nav>
      </aside>
      {/* ===== Main ===== */}
      <div className="ml-[220px] flex-1 flex flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-40 bg-white border-b border-[#dde0e3] h-12 px-6 flex items-center justify-between">
          <span className="text-[15px] font-semibold">📄 記事タイムライン</span>
          <div className="flex items-center gap-3">
            <span className="text-xs text-[#6b7280]">全 {posts.totalDocs} 件</span>
            <Link
              href="#"
              className="inline-flex items-center gap-1 bg-[#1f76c8] hover:bg-[#1560a8] text-white text-xs font-semibold px-3.5 py-1.5 rounded transition-colors"
            >
              <span className="text-base leading-none">＋</span>
              新規追加
            </Link>
          </div>
        </header>
        {/* Content */}
        <main className="flex-1 p-6">
          {/* Filter bar */}
          <div className="flex items-center gap-2 mb-4 bg-white border border-[#dde0e3] rounded-md px-4 py-2.5">
            <span className="text-xs text-[#6b7280] font-medium whitespace-nowrap">フィルター：</span>
            <FilterChip label="すべて" active />
            <FilterChip label="今月" />
            <FilterChip label="先月" />
            <FilterChip label="今年" />
            <span className="ml-auto inline-flex items-center justify-center bg-[#1f76c8] text-white text-[10px] font-bold rounded-full px-1.5 h-4 min-w-[18px]">
              {posts.totalDocs}
            </span>
          </div>
          {/* Timeline */}
          {posts.docs.length === 0 ? (
            <div className="bg-white border border-[#dde0e3] rounded-md px-6 py-12 text-center text-[#6b7280]">
              <div className="text-4xl mb-3 opacity-40">📭</div>
              <p className="text-sm font-medium">公開記事がありません</p>
              <p className="text-xs text-[#9ca3af] mt-1">記事を作成して公開してみましょう</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {months.map((month) => {
                const items = grouped[month]
                return (
                  <div key={month} className="mb-6">
                    {/* Month header */}
                    <div className="flex items-center gap-2.5 mb-2">
                      <span className="text-xs font-bold text-[#4a5568] bg-[#eef2f7] border border-[#dde0e3] rounded px-2.5 py-1 whitespace-nowrap tracking-wide">
                        📅 {month}
                      </span>
                      <span className="flex-1 h-px bg-[#dde0e3]" />
                      <span className="text-[11px] text-[#9ca3af] whitespace-nowrap">{items.length} 件</span>
                    </div>
                    {/* Post list card */}
                    <div className="bg-white border border-[#dde0e3] rounded-md overflow-hidden">
                      {items.map((post: any, index: number) => (
                        <Link
                          key={post.id}
                          href={`/${post.slug}`}
                          className={[
                            'group flex items-start hover:bg-[#f0f4fb] transition-colors relative',
                            index < items.length - 1 ? 'border-b border-[#dde0e3]' : '',
                          ].join(' ')}
                        >
                          {/* Timeline dot column */}
                          <div className="relative w-10 shrink-0 flex flex-col items-center pt-[18px]">
                            {/* Dot */}
                            <span className="relative z-10 w-2.5 h-2.5 rounded-full bg-[#1f76c8] border-2 border-white ring-[1.5px] ring-[#1f76c8] shrink-0 group-hover:bg-[#1560a8] group-hover:ring-[#1560a8] transition-colors" />
                            {/* Vertical line (hidden on last item) */}
                            {index < items.length - 1 && (
                              <span className="absolute top-8 bottom-0 left-1/2 -translate-x-1/2 w-px bg-[#d1d9e6]" />
                            )}
                          </div>
                          {/* Body */}
                          <div className="flex-1 min-w-0 py-3 pr-2">
                            {/* Meta row */}
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[11px] text-[#9ca3af] tabular-nums tracking-wide">
                                {formatDate(post.createdAt)}
                              </span>
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-px rounded bg-[#e8f0fb] text-[#1f76c8] border border-[#c5d9f5] tracking-wide">
                              {formatDate(post.updatedAt)} 更新
                              </span>
                            </div>
                            {/* Title */}
                            <p className="text-[13px] font-semibold text-[#1f76c8] truncate leading-snug mb-0.5 group-hover:underline">
                              {post.title}
                            </p>
                            {/* Excerpt */}
                            {post.excerpt && (
                              <p className="text-[11.5px] text-[#6b7280] line-clamp-1 leading-relaxed">
                                {post.excerpt}
                              </p>
                            )}
                          </div>
                          {/* Right column: avatar + chevron */}
                          <div className="shrink-0 flex flex-col items-end justify-center gap-1.5 py-3 pr-4 pl-2">
                            <AuthorAvatar author={post.author} />
                            <svg className="w-4 h-4 text-[#9ca3af]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M9 18l6-6-6-6" />
                            </svg>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
