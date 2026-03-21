import { getPayload } from 'payload'
import config from '@payload-config'
import Link from 'next/link'

export const revalidate = 60

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}/${m}/${day}`
}

function getMonthLabel(dateStr: string | null | undefined): string {
  if (!dateStr) return '日付なし'
  const d = new Date(dateStr)
  return `${d.getFullYear()}年${d.getMonth() + 1}月`
}

function groupByMonth(posts: any[]): Record<string, any[]> {
  const groups: Record<string, any[]> = {}
  for (const post of posts) {
    const label = getMonthLabel(post.publishedAt)
    if (!groups[label]) groups[label] = []
    groups[label].push(post)
  }
  return groups
}

function AuthorAvatar({ author }: { author: any }) {
  const initial =
    typeof author === 'object' && author?.email
      ? author.email.charAt(0).toUpperCase()
      : '?'
  return (
    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 text-white text-[10px] font-bold shrink-0">
      {initial}
    </span>
  )
}

export default async function HomePage() {
  const payload = await getPayload({ config })

  const posts = await payload.find({
    collection: 'posts',
    where: { status: { equals: 'published' } },
    sort: '-publishedAt',
    depth: 1,
  })

  const grouped = groupByMonth(posts.docs)
  const months = Object.keys(grouped)

  return (
    <div className="flex min-h-screen bg-[#f5f6f7] text-[13px] text-[#333640]">

      {/* ===== Sidebar ===== */}
      <aside className="fixed top-0 left-0 bottom-0 w-[220px] bg-[#2e3d5b] flex flex-col z-50 shrink-0">
        {/* Logo */}
        <div className="px-5 py-4 border-b border-white/10">
          <span className="text-lg font-bold text-white tracking-wide">📋 Blog</span>
          <small className="block text-[10px] text-white/40 mt-0.5 tracking-widest uppercase">Project Space</small>
        </div>

        {/* Nav */}
        <nav className="py-3 flex-1">
          <p className="px-5 py-2 text-[10px] font-semibold text-white/40 tracking-widest uppercase">メニュー</p>
          <SidebarItem icon={<IconHome />} label="ダッシュボード" active />
          <SidebarItem icon={<IconDoc />} label="記事一覧" />
          <SidebarItem icon={<IconCalendar />} label="カレンダー" />
          <p className="px-5 py-2 mt-2 text-[10px] font-semibold text-white/40 tracking-widest uppercase">設定</p>
          <SidebarItem icon={<IconSettings />} label="設定" />
        </nav>
      </aside>

      {/* ===== Main ===== */}
      <div className="ml-[220px] flex-1 flex flex-col">

        {/* Top bar */}
        <header className="sticky top-0 z-40 bg-white border-b border-[#dde0e3] h-12 px-6 flex items-center justify-between">
          <span className="text-[15px] font-semibold">📄 記事タイムライン</span>
          <div className="flex items-center gap-3">
            <span className="text-xs text-[#6b7280]">全 {posts.total} 件</span>
            <a
              href="/admin/collections/posts/create"
              className="inline-flex items-center gap-1 bg-[#1f76c8] hover:bg-[#1560a8] text-white text-xs font-semibold px-3.5 py-1.5 rounded transition-colors"
            >
              <span className="text-base leading-none">＋</span>
              新規追加
            </a>
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
              {posts.total}
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
                                {formatDate(post.publishedAt)}
                              </span>
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-px rounded bg-[#e8f0fb] text-[#1f76c8] border border-[#c5d9f5] tracking-wide">
                                ● 公開
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

// ===== Sub-components =====

function SidebarItem({
  icon,
  label,
  active = false,
}: {
  icon: React.ReactNode
  label: string
  active?: boolean
}) {
  return (
    <a
      className={[
        'flex items-center gap-2.5 py-2 text-[13px] cursor-pointer transition-colors',
        active
          ? 'bg-[#1f76c8]/30 text-white border-l-[3px] border-[#1f76c8] pl-[17px] pr-5'
          : 'text-white/75 hover:bg-white/10 hover:text-white px-5',
      ].join(' ')}
    >
      <span className="w-4 h-4 shrink-0 opacity-80">{icon}</span>
      <span>{label}</span>
    </a>
  )
}

function FilterChip({ label, active = false }: { label: string; active?: boolean }) {
  return (
    <span
      className={[
        'inline-flex items-center px-2.5 py-0.5 rounded-full border text-[11px] cursor-pointer transition-colors select-none',
        active
          ? 'border-[#1f76c8] text-[#1f76c8] bg-[#e8f0fb] font-semibold'
          : 'border-[#dde0e3] text-[#6b7280] bg-[#f9fafb] hover:border-[#1f76c8] hover:text-[#1f76c8]',
      ].join(' ')}
    >
      {label}
    </span>
  )
}

// ===== SVG Icons =====

function IconHome() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full">
      <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  )
}

function IconDoc() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full">
      <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  )
}

function IconCalendar() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full">
      <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  )
}

function IconSettings() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full">
      <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}