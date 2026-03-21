import { getPayload } from 'payload'
import config from '@payload-config'
import { notFound } from 'next/navigation'
import { LikeButton } from '@/components/parts/LikeButton'
import { CommentSection } from '@/components/parts/CommentSection'
import { RichText } from '@/components/parts/richText'
import Link from 'next/link'
import Header from '@/components/home/Header'

// propsの定義
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

  // イイね数を取得
  const likes = await payload.find({
    collection: 'likes',
    where: { post: { equals: post.id } },
  })

  // コメントを取得
  const comments = await payload.find({
    collection: 'comments',
    where: { post: { equals: post.id } },
    sort: '-createdAt',
    depth: 1,
  })

  return (
    <>
    <Header/>
    <article className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">{post.title}</h1>

      {post.publishedAt && (
        <p className="text-gray-500 text-sm mb-6">
          {new Date(post.publishedAt).toLocaleDateString('ja-JP', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      )}

      {/* 本文（リッチテキストのシンプルな表示） */}
      <div className="prose prose-gray max-w-none mb-8">
        <RichText data={post.content} />
      </div>

      {/* イイねボタン */}
      <LikeButton postId={String(post.id)} initialCount={likes.totalDocs} />

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
      <Link href="/" className="text-sm text-muted-foreground hover:underline">
        ← 記事一覧に戻る
      </Link>
    </article>
    </>
  )
}