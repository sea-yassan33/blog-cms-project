import { getPayload } from 'payload'
import config from '@payload-config'
import Link from 'next/link'

export const revalidate = 60

// 日付を「YYYY/MM/DD」形式に変換
function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}/${m}/${day}`
}

// 月ラベル「YYYY年M月」
function getMonthLabel(dateStr: string | null | undefined): string {
  if (!dateStr) return '日付なし'
  const d = new Date(dateStr)
  return `${d.getFullYear()}年${d.getMonth() + 1}月`
}

// 記事を月ごとにグループ化
function groupByMonth(posts: any[]): Record<string, any[]> {
  const groups: Record<string, any[]> = {}
  for (const post of posts) {
    const label = getMonthLabel(post.publishedAt)
    if (!groups[label]) groups[label] = []
    groups[label].push(post)
  }
  return groups
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
    <>
      <style>{`
        /* ===== Backlog-style Timeline ===== */
        :root {
          --bl-bg: #f5f6f7;
          --bl-sidebar-bg: #2e3d5b;
          --bl-header-bg: #ffffff;
          --bl-blue: #1f76c8;
          --bl-blue-hover: #1560a8;
          --bl-border: #dde0e3;
          --bl-text: #333640;
          --bl-text-sub: #6b7280;
          --bl-text-light: #9ca3af;
          --bl-dot: #1f76c8;
          --bl-line: #d1d9e6;
          --bl-tag-bg: #e8f0fb;
          --bl-tag-text: #1f76c8;
          --bl-row-hover: #f0f4fb;
          --bl-month-bg: #eef2f7;
          --bl-month-text: #4a5568;
          --font-main: 'Noto Sans JP', 'Hiragino Sans', 'Meiryo', sans-serif;
        }

        * { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          font-family: var(--font-main);
          background: var(--bl-bg);
          color: var(--bl-text);
          font-size: 13px;
          line-height: 1.5;
        }

        /* ===== Layout ===== */
        .bl-layout {
          display: flex;
          min-height: 100vh;
        }

        /* ===== Sidebar ===== */
        .bl-sidebar {
          width: 220px;
          flex-shrink: 0;
          background: var(--bl-sidebar-bg);
          display: flex;
          flex-direction: column;
          position: fixed;
          top: 0; left: 0; bottom: 0;
          z-index: 100;
        }

        .bl-sidebar-logo {
          padding: 16px 20px;
          border-bottom: 1px solid rgba(255,255,255,0.1);
        }

        .bl-sidebar-logo span {
          font-size: 18px;
          font-weight: 700;
          color: #ffffff;
          letter-spacing: 0.02em;
        }

        .bl-sidebar-logo small {
          display: block;
          font-size: 10px;
          color: rgba(255,255,255,0.5);
          margin-top: 2px;
          letter-spacing: 0.05em;
        }

        .bl-sidebar-nav {
          padding: 12px 0;
          flex: 1;
        }

        .bl-sidebar-section {
          padding: 8px 20px 4px;
          font-size: 10px;
          font-weight: 600;
          color: rgba(255,255,255,0.4);
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        .bl-sidebar-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 20px;
          color: rgba(255,255,255,0.75);
          font-size: 13px;
          text-decoration: none;
          transition: background 0.15s, color 0.15s;
          cursor: pointer;
        }

        .bl-sidebar-item:hover {
          background: rgba(255,255,255,0.08);
          color: #ffffff;
        }

        .bl-sidebar-item.active {
          background: rgba(31,118,200,0.3);
          color: #ffffff;
          border-left: 3px solid var(--bl-blue);
          padding-left: 17px;
        }

        .bl-sidebar-icon {
          width: 16px;
          height: 16px;
          flex-shrink: 0;
          opacity: 0.8;
        }

        /* ===== Main ===== */
        .bl-main {
          margin-left: 220px;
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        /* ===== Top bar ===== */
        .bl-topbar {
          background: var(--bl-header-bg);
          border-bottom: 1px solid var(--bl-border);
          padding: 0 24px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: sticky;
          top: 0;
          z-index: 50;
        }

        .bl-topbar-title {
          font-size: 15px;
          font-weight: 600;
          color: var(--bl-text);
        }

        .bl-topbar-actions {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .bl-btn-primary {
          background: var(--bl-blue);
          color: #ffffff;
          border: none;
          border-radius: 4px;
          padding: 6px 14px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          transition: background 0.15s;
        }

        .bl-btn-primary:hover {
          background: var(--bl-blue-hover);
        }

        /* ===== Content ===== */
        .bl-content {
          padding: 24px;
          flex: 1;
        }

        /* ===== Filter bar ===== */
        .bl-filterbar {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 16px;
          background: #ffffff;
          border: 1px solid var(--bl-border);
          border-radius: 6px;
          padding: 10px 16px;
        }

        .bl-filter-label {
          font-size: 12px;
          color: var(--bl-text-sub);
          font-weight: 500;
          white-space: nowrap;
        }

        .bl-filter-chip {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 3px 10px;
          border-radius: 100px;
          border: 1px solid var(--bl-border);
          font-size: 11px;
          color: var(--bl-text-sub);
          background: #f9fafb;
          cursor: pointer;
          transition: border-color 0.15s, color 0.15s;
        }

        .bl-filter-chip.active {
          border-color: var(--bl-blue);
          color: var(--bl-blue);
          background: var(--bl-tag-bg);
          font-weight: 600;
        }

        .bl-count-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: var(--bl-blue);
          color: #fff;
          font-size: 10px;
          font-weight: 700;
          border-radius: 100px;
          padding: 0 6px;
          min-width: 18px;
          height: 16px;
          margin-left: auto;
        }

        /* ===== Timeline ===== */
        .bl-timeline {
          display: flex;
          flex-direction: column;
          gap: 0;
        }

        /* Month group */
        .bl-month-group {
          margin-bottom: 24px;
        }

        .bl-month-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 8px;
        }

        .bl-month-label {
          font-size: 12px;
          font-weight: 700;
          color: var(--bl-month-text);
          background: var(--bl-month-bg);
          border: 1px solid var(--bl-border);
          border-radius: 4px;
          padding: 3px 10px;
          letter-spacing: 0.03em;
          white-space: nowrap;
        }

        .bl-month-line {
          flex: 1;
          height: 1px;
          background: var(--bl-border);
        }

        .bl-month-count {
          font-size: 11px;
          color: var(--bl-text-light);
          white-space: nowrap;
        }

        /* Post list */
        .bl-post-list {
          background: #ffffff;
          border: 1px solid var(--bl-border);
          border-radius: 6px;
          overflow: hidden;
        }

        .bl-post-item {
          display: flex;
          align-items: flex-start;
          padding: 0;
          border-bottom: 1px solid var(--bl-border);
          text-decoration: none;
          color: inherit;
          transition: background 0.1s;
          position: relative;
        }

        .bl-post-item:last-child {
          border-bottom: none;
        }

        .bl-post-item:hover {
          background: var(--bl-row-hover);
        }

        /* Timeline indicator column */
        .bl-post-indicator {
          width: 40px;
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding-top: 18px;
          position: relative;
        }

        .bl-post-indicator::after {
          content: '';
          position: absolute;
          top: 32px;
          bottom: -1px;
          left: 50%;
          transform: translateX(-50%);
          width: 1px;
          background: var(--bl-line);
        }

        .bl-post-item:last-child .bl-post-indicator::after {
          display: none;
        }

        .bl-post-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: var(--bl-dot);
          border: 2px solid #ffffff;
          box-shadow: 0 0 0 1.5px var(--bl-dot);
          flex-shrink: 0;
          z-index: 1;
        }

        .bl-post-item:hover .bl-post-dot {
          background: var(--bl-blue-hover);
          box-shadow: 0 0 0 1.5px var(--bl-blue-hover);
        }

        /* Main content area */
        .bl-post-body {
          flex: 1;
          padding: 12px 16px 12px 8px;
          min-width: 0;
        }

        .bl-post-meta-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 4px;
        }

        .bl-post-date {
          font-size: 11px;
          color: var(--bl-text-light);
          white-space: nowrap;
          font-variant-numeric: tabular-nums;
          letter-spacing: 0.02em;
        }

        .bl-post-status {
          display: inline-flex;
          align-items: center;
          gap: 3px;
          font-size: 10px;
          font-weight: 600;
          padding: 1px 7px;
          border-radius: 3px;
          letter-spacing: 0.03em;
          background: var(--bl-tag-bg);
          color: var(--bl-tag-text);
          border: 1px solid #c5d9f5;
        }

        .bl-post-title {
          font-size: 13px;
          font-weight: 600;
          color: var(--bl-blue);
          line-height: 1.4;
          margin-bottom: 3px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          transition: color 0.15s;
        }

        .bl-post-item:hover .bl-post-title {
          color: var(--bl-blue-hover);
          text-decoration: underline;
        }

        .bl-post-excerpt {
          font-size: 11.5px;
          color: var(--bl-text-sub);
          line-height: 1.5;
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        /* Right info column */
        .bl-post-right {
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          justify-content: center;
          padding: 12px 16px 12px 8px;
          gap: 6px;
          min-width: 100px;
        }

        .bl-author-avatar {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea, #764ba2);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: 700;
          color: #ffffff;
          flex-shrink: 0;
        }

        .bl-arrow {
          width: 16px;
          height: 16px;
          color: var(--bl-text-light);
          flex-shrink: 0;
        }

        /* Empty state */
        .bl-empty {
          background: #ffffff;
          border: 1px solid var(--bl-border);
          border-radius: 6px;
          padding: 48px 24px;
          text-align: center;
          color: var(--bl-text-sub);
        }

        .bl-empty-icon {
          font-size: 32px;
          margin-bottom: 12px;
          opacity: 0.4;
        }

        .bl-empty-text {
          font-size: 14px;
          font-weight: 500;
        }

        .bl-empty-sub {
          font-size: 12px;
          color: var(--bl-text-light);
          margin-top: 4px;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .bl-sidebar { width: 64px; }
          .bl-sidebar-logo span { display: none; }
          .bl-sidebar-logo small { display: none; }
          .bl-sidebar-section { display: none; }
          .bl-sidebar-item span { display: none; }
          .bl-main { margin-left: 64px; }
          .bl-post-excerpt { display: none; }
          .bl-post-right { display: none; }
        }
      `}</style>

      <div className="bl-layout">

        {/* ===== Sidebar ===== */}
        <aside className="bl-sidebar">
          <div className="bl-sidebar-logo">
            <span>📋 Blog</span>
            <small>PROJECT SPACE</small>
          </div>
          <nav className="bl-sidebar-nav">
            <div className="bl-sidebar-section">メニュー</div>
            <a className="bl-sidebar-item active">
              <svg className="bl-sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span>ダッシュボード</span>
            </a>
            <a className="bl-sidebar-item">
              <svg className="bl-sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>記事一覧</span>
            </a>
            <a className="bl-sidebar-item">
              <svg className="bl-sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>カレンダー</span>
            </a>
            <div className="bl-sidebar-section" style={{ marginTop: 8 }}>設定</div>
            <a className="bl-sidebar-item">
              <svg className="bl-sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><circle cx="12" cy="12" r="3" />
              </svg>
              <span>設定</span>
            </a>
          </nav>
        </aside>

        {/* ===== Main ===== */}
        <main className="bl-main">

          {/* Top bar */}
          <div className="bl-topbar">
            <span className="bl-topbar-title">
              📄 記事タイムライン
            </span>
            <div className="bl-topbar-actions">
              <span style={{ fontSize: 12, color: 'var(--bl-text-sub)' }}>
                全 {posts.total} 件
              </span>
              <a href="/admin/collections/posts/create" className="bl-btn-primary">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                新規追加
              </a>
            </div>
          </div>

          {/* Content */}
          <div className="bl-content">

            {/* Filter bar */}
            <div className="bl-filterbar">
              <span className="bl-filter-label">フィルター：</span>
              <span className="bl-filter-chip active">すべて</span>
              <span className="bl-filter-chip">今月</span>
              <span className="bl-filter-chip">先月</span>
              <span className="bl-filter-chip">今年</span>
              <span className="bl-count-badge">{posts.total}</span>
            </div>

            {/* Timeline */}
            {posts.docs.length === 0 ? (
              <div className="bl-empty">
                <div className="bl-empty-icon">📭</div>
                <div className="bl-empty-text">公開記事がありません</div>
                <div className="bl-empty-sub">記事を作成して公開してみましょう</div>
              </div>
            ) : (
              <div className="bl-timeline">
                {months.map((month) => {
                  const items = grouped[month]
                  return (
                    <div key={month} className="bl-month-group">
                      {/* Month header */}
                      <div className="bl-month-header">
                        <span className="bl-month-label">📅 {month}</span>
                        <span className="bl-month-line" />
                        <span className="bl-month-count">{items.length} 件</span>
                      </div>

                      {/* Post list */}
                      <div className="bl-post-list">
                        {items.map((post: any) => {
                          const authorName =
                            typeof post.author === 'object' && post.author?.email
                              ? post.author.email.charAt(0).toUpperCase()
                              : '?'
                          return (
                            <Link
                              key={post.id}
                              href={`/${post.slug}`}
                              className="bl-post-item"
                            >
                              {/* Timeline dot & line */}
                              <div className="bl-post-indicator">
                                <div className="bl-post-dot" />
                              </div>

                              {/* Body */}
                              <div className="bl-post-body">
                                <div className="bl-post-meta-row">
                                  <span className="bl-post-date">
                                    {formatDate(post.publishedAt)}
                                  </span>
                                  <span className="bl-post-status">
                                    ● 公開
                                  </span>
                                </div>
                                <div className="bl-post-title">{post.title}</div>
                                {post.excerpt && (
                                  <div className="bl-post-excerpt">{post.excerpt}</div>
                                )}
                              </div>

                              {/* Right: author + arrow */}
                              <div className="bl-post-right">
                                <div className="bl-author-avatar">{authorName}</div>
                                <svg className="bl-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M9 18l6-6-6-6" />
                                </svg>
                              </div>
                            </Link>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

          </div>
        </main>
      </div>
    </>
  )
}