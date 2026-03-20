import { getPayload } from 'payload'
import config from '@payload-config'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const revalidate = 60 // 60秒ごとに再生成

export default async function HomePage() {
  const payload = await getPayload({ config })

  const posts = await payload.find({
    collection: 'posts',
    where: {
      status: { equals: 'published' },
    },
    sort: '-publishedAt',
    depth: 1,
  })

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6 text-gray-700">記事一覧</h2>
      {posts.docs.length === 0 ? (
        <p className="text-gray-500">まだ記事がありません。</p>
      ) : (
        <div className="grid gap-6">
          {posts.docs.map((post) => (
            <Link key={post.id} href={`/${post.slug}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{post.title}</CardTitle>
                    <Badge variant="secondary">
                      {post.publishedAt
                        ? new Date(post.publishedAt).toLocaleDateString('ja-JP')
                        : ''}
                    </Badge>
                  </div>
                </CardHeader>
                {post.excerpt && (
                  <CardContent>
                    <p className="text-gray-600 text-sm">{post.excerpt}</p>
                  </CardContent>
                )}
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
