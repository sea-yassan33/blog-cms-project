import { getPayload } from 'payload'
import config from '@payload-config'
import { notFound } from 'next/navigation'
import { LikeButton } from '@/components/parts/LikeButton'
import { CommentSection } from '@/components/parts/CommentSection'
import { RichText } from '@/components/parts/richText'
import Link from 'next/link'
import Header from '@/components/home/Header'

type Props = { params: Promise<{ slug: string }> }

export default async function BlogDetailPage({ params }: Props) {
  const payload = await getPayload({ config })

  const result = await payload.find({
    collection: 'posts',
    where: {
      and: [
        { slug: { equals: (await params).slug } },
        { status: { equals: 'published' } },
      ],
    },
    depth: 2,
  })

  const post = result.docs[0]
  if (!post) notFound()

  const likes = await payload.find({
    collection: 'likes',
    where: { post: { equals: post.id } },
  })

  const comments = await payload.find({
    collection: 'comments',
    where: { post: { equals: post.id } },
    sort: 'createdAt', // 古い順（下に積み重なっていく）
    depth: 1,
  })

  const authorName =
    post.author && typeof post.author === 'object'
      ? (post.author as any).name ?? '不明'
      : '不明'

  return (
    <>
      <Header />

      {/* ページ全体の背景 */}
      <div className="min-h-screen bg-[#f4f5f7]">

        {/* パンくずナビ */}
        <div className="bg-white border-b border-[#dfe1e6] px-6 py-2">
          <nav className="max-w-5xl mx-auto flex items-center gap-1 text-xs text-[#5e6c84]">
            <Link href="/" className="hover:text-[#0052cc] hover:underline transition-colors">
              ホーム
            </Link>
            <span className="mx-1">/</span>
            <Link href="/" className="hover:text-[#0052cc] hover:underline transition-colors">
              記事一覧
            </Link>
            <span className="mx-1">/</span>
            <span className="text-[#172b4d] font-medium truncate max-w-xs">{post.title}</span>
          </nav>
        </div>

        {/* メインコンテンツ */}
        <div className="max-w-5xl mx-auto px-4 py-6 flex gap-6">

          {/* 左カラム：記事本体 */}
          <main className="flex-1 min-w-0">

            {/* 記事ヘッダーカード */}
            <div className="bg-white rounded border border-[#dfe1e6] mb-4">
              {/* タイトルバー */}
              <div className="border-b border-[#dfe1e6] px-6 py-4">
                <h1 className="text-[#172b4d] text-xl font-bold leading-snug mb-3">
                  {post.title}
                </h1>
                {/* メタ情報バッジ行 */}
                <div className="flex flex-wrap items-center gap-3 text-xs">
                  {post.publishedAt && (
                    <span className="flex items-center gap-1 text-[#5e6c84]">
                      {/* カレンダーアイコン */}
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <rect x="3" y="4" width="18" height="18" rx="2" strokeWidth="2"/>
                        <line x1="16" y1="2" x2="16" y2="6" strokeWidth="2" strokeLinecap="round"/>
                        <line x1="8" y1="2" x2="8" y2="6" strokeWidth="2" strokeLinecap="round"/>
                        <line x1="3" y1="10" x2="21" y2="10" strokeWidth="2"/>
                      </svg>
                      {new Date(post.publishedAt).toLocaleDateString('ja-JP', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  )}
                  <span className="flex items-center gap-1 text-[#5e6c84]">
                    {/* ユーザーアイコン */}
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <circle cx="12" cy="8" r="4" strokeWidth="2"/>
                      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    {authorName}
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#e3fcef] text-[#006644] border border-[#57d9a3]">
                    公開中
                  </span>
                </div>
              </div>

              {/* 本文エリア */}
              <div className="px-6 py-6">
                {post.excerpt && (
                  <div className="mb-5 p-3 bg-[#f4f5f7] rounded border-l-4 border-[#0052cc] text-sm text-[#5e6c84] leading-relaxed">
                    {post.excerpt}
                  </div>
                )}
                <div className="prose prose-sm max-w-none text-[#172b4d]
                  prose-headings:text-[#172b4d] prose-headings:font-bold
                  prose-h1:text-lg prose-h2:text-base prose-h3:text-sm
                  prose-a:text-[#0052cc] prose-a:no-underline hover:prose-a:underline
                  prose-code:bg-[#f4f5f7] prose-code:text-[#172b4d] prose-code:rounded prose-code:px-1
                  prose-pre:bg-[#172b4d] prose-pre:text-[#f4f5f7]
                  prose-blockquote:border-l-[#0052cc] prose-blockquote:text-[#5e6c84]
                  prose-strong:text-[#172b4d]
                ">
                  <RichText data={post.content} />
                </div>
              </div>

              {/* フッター：イイね */}
              <div className="border-t border-[#dfe1e6] px-6 py-3 bg-[#fafbfc] flex items-center justify-between rounded-b">
                <LikeButton postId={String(post.id)} initialCount={likes.totalDocs} />
                <Link
                  href="/"
                  className="text-xs text-[#5e6c84] hover:text-[#0052cc] hover:underline transition-colors flex items-center gap-1"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M19 12H5M5 12l7-7M5 12l7 7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  記事一覧に戻る
                </Link>
              </div>
            </div>

            {/* コメントセクション */}
            <CommentSection
              postId={String(post.id)}
              initialComments={comments.docs.map((c) => ({
                id: String(c.id),
                content: c.content,
                userName: typeof c.user === 'object' ? (c.user as any).name : '匿名',
                createdAt: c.createdAt,
              }))}
            />
          </main>

          {/* 右サイドバー */}
          <aside className="w-56 flex-shrink-0 hidden lg:block">
            <div className="bg-white rounded border border-[#dfe1e6] overflow-hidden">
              <div className="bg-[#0052cc] px-4 py-2.5">
                <h3 className="text-white text-xs font-bold tracking-wide uppercase">詳細情報</h3>
              </div>
              <div className="divide-y divide-[#dfe1e6]">
                {/* ステータス */}
                <div className="px-4 py-3">
                  <p className="text-[10px] font-semibold text-[#5e6c84] uppercase tracking-wide mb-1">ステータス</p>
                  <span className="inline-flex items-center gap-1 text-xs text-[#006644] font-medium">
                    <span className="w-2 h-2 rounded-full bg-[#36b37e] inline-block"></span>
                    公開中
                  </span>
                </div>

                {/* 著者 */}
                <div className="px-4 py-3">
                  <p className="text-[10px] font-semibold text-[#5e6c84] uppercase tracking-wide mb-1.5">著者</p>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-[#0052cc] flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                      {authorName.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <span className="text-xs text-[#172b4d] font-medium truncate">{authorName}</span>
                  </div>
                </div>

                {/* 公開日 */}
                {post.publishedAt && (
                  <div className="px-4 py-3">
                    <p className="text-[10px] font-semibold text-[#5e6c84] uppercase tracking-wide mb-1">公開日</p>
                    <p className="text-xs text-[#172b4d]">
                      {new Date(post.publishedAt).toLocaleDateString('ja-JP', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                )}

                {/* いいね数 */}
                <div className="px-4 py-3">
                  <p className="text-[10px] font-semibold text-[#5e6c84] uppercase tracking-wide mb-1">いいね</p>
                  <p className="text-xs text-[#172b4d] font-semibold">{likes.totalDocs} 件</p>
                </div>

                {/* コメント数 */}
                <div className="px-4 py-3">
                  <p className="text-[10px] font-semibold text-[#5e6c84] uppercase tracking-wide mb-1">コメント</p>
                  <p className="text-xs text-[#172b4d] font-semibold">{comments.totalDocs} 件</p>
                </div>
              </div>
            </div>
          </aside>

        </div>
      </div>
    </>
  )
}
