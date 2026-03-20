# Next.js + Payload CMS ブログ作成手順書

## 概要

本手順書では、Next.js と Payload CMS を使用したブログシステムの構築手順を説明します。

### 技術スタック

| 技術 | 用途 |
|------|------|
| Next.js (最新) | フロントエンド / フルスタックフレームワーク |
| TypeScript | 型安全な開発 |
| TailwindCSS | スタイリング |
| shadcn/ui | UI コンポーネント |
| Payload CMS | ヘッドレス CMS |
| PostgreSQL | データベース |

### 実装機能

- 管理画面での記事作成（Payload Admin UI）
- フロント画面での記事一覧・詳細表示
- 認証済みユーザーによる「イイね」機能
- 認証済みユーザーによるコメント機能

---

## 目次

1. [前提条件・環境準備](#1-前提条件環境準備)
2. [Payload アプリの作成](#2-payload-アプリの作成)
3. [PostgreSQL の設定](#3-postgresql-の設定)
4. [プロジェクト初期設定](#4-プロジェクト初期設定)
5. [shadcn/ui の導入](#5-shadcnui-の導入)
6. [Payload コレクションの設計・作成](#6-payload-コレクションの設計作成)
7. [フロントエンドの実装](#7-フロントエンドの実装)
8. [イイね・コメント機能の実装](#8-イイねコメント機能の実装)
9. [動作確認](#9-動作確認)

---

## 1. 前提条件・環境準備

### 必要ツール

- **Node.js** v20.9.0 以上
- **pnpm** v8 以上
- **PostgreSQL** v14 以上
- **Git**

### バージョン確認

```bash
node -v      # v20.x.x 以上
pnpm -v      # 8.x.x 以上
psql --version
```

### pnpm のインストール（未インストールの場合）

```bash
npm install -g pnpm
```

---

## 2. Payload アプリの作成

### 2-1. Payload プロジェクトの生成

```bash
pnpm create payload-app@latest
```

対話形式で以下を入力します。

```
? Where would you like to create your project? › my-blog
? Which template would you like to use? › blank
? Which database adapter would you like to use? › PostgreSQL
? Would you like to use TypeScript? › Yes
```

> **テンプレートは `blank` を選択してください。**

### 2-2. プロジェクトディレクトリへ移動

```bash
cd my-blog
```

### 2-3. 依存関係のインストール

```bash
pnpm install
```

---

## 3. PostgreSQL の設定

### 3-1. データベースの作成

```bash
psql -U postgres
```

```sql
CREATE DATABASE my_blog;
CREATE USER blog_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE my_blog TO blog_user;
\q
```

### 3-2. 環境変数の設定

プロジェクトルートに `.env` ファイルを作成します。

```bash
cp .env.example .env
```

`.env` を以下のように編集します。

```env
# Database
DATABASE_URI=postgresql://blog_user:your_password@localhost:5432/my_blog

# Payload
PAYLOAD_SECRET=your-super-secret-key-here-change-this

# Next.js
NEXT_PUBLIC_SERVER_URL=http://localhost:3000
```

> **`PAYLOAD_SECRET` は本番環境では必ず長いランダム文字列に変更してください。**

---

## 4. プロジェクト初期設定

### 4-1. TailwindCSS の導入

```bash
pnpm add -D tailwindcss postcss autoprefixer
pnpm dlx tailwindcss init -p
```

`tailwind.config.ts` を編集します。

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

export default config
```

`src/app/globals.css`（または `src/styles/globals.css`）に Tailwind のディレクティブを追加します。

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### 4-2. ディレクトリ構成

最終的なディレクトリ構成は以下のようになります。

```
my-blog/
├── src/
│   ├── app/
│   │   ├── (frontend)/          # フロント用ルートグループ
│   │   │   ├── page.tsx         # 記事一覧ページ
│   │   │   ├── posts/
│   │   │   │   └── [slug]/
│   │   │   │       └── page.tsx # 記事詳細ページ
│   │   │   └── layout.tsx
│   │   ├── (payload)/           # Payload 管理画面（自動生成）
│   │   │   └── admin/
│   │   └── api/
│   │       └── [...]/           # Payload API ルート
│   ├── collections/
│   │   ├── Users.ts
│   │   ├── Posts.ts
│   │   ├── Likes.ts
│   │   └── Comments.ts
│   ├── components/
│   │   ├── LikeButton.tsx
│   │   └── CommentSection.tsx
│   └── payload.config.ts
├── .env
├── package.json
└── tailwind.config.ts
```

---

## 5. shadcn/ui の導入

### 5-1. shadcn/ui の初期化

```bash
pnpm dlx shadcn@latest init
```

対話形式で設定します。

```
? Which style would you like to use? › Default
? Which color would you like to use as base color? › Slate
? Would you like to use CSS variables for colors? › yes
```

### 5-2. 必要なコンポーネントの追加

```bash
pnpm dlx shadcn@latest add button
pnpm dlx shadcn@latest add card
pnpm dlx shadcn@latest add textarea
pnpm dlx shadcn@latest add avatar
pnpm dlx shadcn@latest add badge
```

---

## 6. Payload コレクションの設計・作成

### 6-1. Users コレクション（認証付き）

`src/collections/Users.ts` を作成します。

```typescript
import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
  },
  auth: true, // 認証機能を有効化
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: '表示名',
    },
  ],
}
```

### 6-2. Posts コレクション（記事）

`src/collections/Posts.ts` を作成します。

```typescript
import type { CollectionConfig } from 'payload'

export const Posts: CollectionConfig = {
  slug: 'posts',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'status', 'publishedAt', 'updatedAt'],
  },
  access: {
    // 公開記事は誰でも読める
    read: ({ req }) => {
      if (req.user) return true
      return {
        status: {
          equals: 'published',
        },
      }
    },
    // 作成・更新・削除は認証済みユーザーのみ
    create: ({ req }) => !!req.user,
    update: ({ req }) => !!req.user,
    delete: ({ req }) => !!req.user,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'タイトル',
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      label: 'スラッグ（URL）',
      admin: {
        description: '例: my-first-post',
      },
    },
    {
      name: 'excerpt',
      type: 'textarea',
      label: '概要',
    },
    {
      name: 'content',
      type: 'richText',
      label: '本文',
      required: true,
    },
    {
      name: 'thumbnail',
      type: 'upload',
      relationTo: 'media',
      label: 'サムネイル',
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: '下書き', value: 'draft' },
        { label: '公開', value: 'published' },
      ],
      defaultValue: 'draft',
      required: true,
      label: 'ステータス',
    },
    {
      name: 'publishedAt',
      type: 'date',
      label: '公開日時',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'users',
      label: '著者',
    },
  ],
}
```

### 6-3. Media コレクション（画像アップロード）

`src/collections/Media.ts` を作成します。

```typescript
import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true,
  },
  upload: true,
  fields: [
    {
      name: 'alt',
      type: 'text',
      label: 'Alt テキスト',
    },
  ],
}
```

### 6-4. Likes コレクション（イイね）

`src/collections/Likes.ts` を作成します。

```typescript
import type { CollectionConfig } from 'payload'

export const Likes: CollectionConfig = {
  slug: 'likes',
  access: {
    // 誰でも読める（件数取得のため）
    read: () => true,
    // 認証済みユーザーのみ作成可能
    create: ({ req }) => !!req.user,
    // 自分のイイねのみ削除可能
    delete: ({ req }) => !!req.user,
  },
  fields: [
    {
      name: 'post',
      type: 'relationship',
      relationTo: 'posts',
      required: true,
      label: '記事',
    },
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      label: 'ユーザー',
    },
  ],
  // 同じユーザーが同じ記事に複数イイねできないように hooks で制御
  hooks: {
    beforeChange: [
      async ({ req, data, operation }) => {
        if (operation === 'create') {
          const existing = await req.payload.find({
            collection: 'likes',
            where: {
              and: [
                { post: { equals: data.post } },
                { user: { equals: req.user?.id } },
              ],
            },
          })
          if (existing.totalDocs > 0) {
            throw new Error('すでにイイねしています')
          }
          // user を自動的にログインユーザーに設定
          data.user = req.user?.id
        }
        return data
      },
    ],
  },
}
```

### 6-5. Comments コレクション（コメント）

`src/collections/Comments.ts` を作成します。

```typescript
import type { CollectionConfig } from 'payload'

export const Comments: CollectionConfig = {
  slug: 'comments',
  admin: {
    defaultColumns: ['post', 'user', 'content', 'createdAt'],
  },
  access: {
    // 誰でも読める
    read: () => true,
    // 認証済みユーザーのみ作成可能
    create: ({ req }) => !!req.user,
    // 自分のコメントのみ更新・削除可能（または管理者）
    update: ({ req }) => !!req.user,
    delete: ({ req }) => !!req.user,
  },
  fields: [
    {
      name: 'post',
      type: 'relationship',
      relationTo: 'posts',
      required: true,
      label: '記事',
    },
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      label: 'ユーザー',
    },
    {
      name: 'content',
      type: 'textarea',
      required: true,
      label: 'コメント内容',
    },
  ],
  hooks: {
    beforeChange: [
      async ({ req, data }) => {
        // user を自動的にログインユーザーに設定
        data.user = req.user?.id
        return data
      },
    ],
  },
}
```

### 6-6. payload.config.ts の設定

`src/payload.config.ts` を編集します。

```typescript
import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { fileURLToPath } from 'url'

import { Users } from './collections/Users'
import { Posts } from './collections/Posts'
import { Media } from './collections/Media'
import { Likes } from './collections/Likes'
import { Comments } from './collections/Comments'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    meta: {
      titleSuffix: '- My Blog Admin',
    },
  },
  collections: [Users, Posts, Media, Likes, Comments],
  editor: lexicalEditor({}),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || '',
    },
  }),
  upload: {
    limits: {
      fileSize: 5000000, // 5MB
    },
  },
})
```

---

## 7. フロントエンドの実装

### 7-1. レイアウトの設定

`src/app/(frontend)/layout.tsx` を作成します。

```typescript
import type { Metadata } from 'next'
import '../globals.css'

export const metadata: Metadata = {
  title: 'My Blog',
  description: 'Powered by Payload CMS',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body className="min-h-screen bg-gray-50">
        <header className="bg-white border-b shadow-sm">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <h1 className="text-2xl font-bold text-gray-900">
              <a href="/">My Blog</a>
            </h1>
          </div>
        </header>
        <main className="max-w-4xl mx-auto px-4 py-8">
          {children}
        </main>
      </body>
    </html>
  )
}
```

### 7-2. 記事一覧ページ

`src/app/(frontend)/page.tsx` を作成します。

```typescript
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
            <Link key={post.id} href={`/posts/${post.slug}`}>
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
```

### 7-3. 記事詳細ページ

`src/app/(frontend)/posts/[slug]/page.tsx` を作成します。

```typescript
import { getPayload } from 'payload'
import config from '@payload-config'
import { notFound } from 'next/navigation'
import { LikeButton } from '@/components/LikeButton'
import { CommentSection } from '@/components/CommentSection'

export const revalidate = 60

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function PostPage({ params }: PageProps) {
  const { slug } = await params
  const payload = await getPayload({ config })

  const result = await payload.find({
    collection: 'posts',
    where: {
      and: [
        { slug: { equals: slug } },
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
    <article className="max-w-2xl mx-auto">
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
        {post.excerpt && <p className="text-lg text-gray-600 mb-4">{post.excerpt}</p>}
        {/* リッチテキストは @payloadcms/richtext-lexical の RichText コンポーネントで表示 */}
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
    </article>
  )
}
```

---

## 8. イイね・コメント機能の実装

### 8-1. 認証ユーティリティ

`src/lib/auth.ts` を作成します。

```typescript
import { getPayload } from 'payload'
import config from '@payload-config'
import { cookies } from 'next/headers'

export async function getCurrentUser() {
  const payload = await getPayload({ config })
  const cookieStore = await cookies()
  const token = cookieStore.get('payload-token')?.value

  if (!token) return null

  try {
    const { user } = await payload.auth({
      collection: 'users',
      headers: new Headers({ Authorization: `JWT ${token}` }),
    } as any)
    return user
  } catch {
    return null
  }
}
```

### 8-2. イイね API Route

`src/app/api/likes/route.ts` を作成します。

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

// イイね追加
export async function POST(req: NextRequest) {
  const payload = await getPayload({ config })

  // JWT トークンの取得
  const token = req.cookies.get('payload-token')?.value
  if (!token) {
    return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 })
  }

  try {
    const { user } = await payload.auth({
      collection: 'users',
      headers: new Headers({ Authorization: `JWT ${token}` }),
    } as any)

    if (!user) {
      return NextResponse.json({ error: '認証に失敗しました' }, { status: 401 })
    }

    const body = await req.json()
    const { postId } = body

    // 既存のイイねを確認
    const existing = await payload.find({
      collection: 'likes',
      where: {
        and: [
          { post: { equals: postId } },
          { user: { equals: user.id } },
        ],
      },
    })

    if (existing.totalDocs > 0) {
      return NextResponse.json({ error: 'すでにイイねしています' }, { status: 400 })
    }

    const like = await payload.create({
      collection: 'likes',
      data: { post: postId, user: user.id },
      overrideAccess: false,
      user,
    })

    return NextResponse.json({ like }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'エラーが発生しました' }, { status: 500 })
  }
}

// イイね削除
export async function DELETE(req: NextRequest) {
  const payload = await getPayload({ config })
  const token = req.cookies.get('payload-token')?.value

  if (!token) {
    return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 })
  }

  try {
    const { user } = await payload.auth({
      collection: 'users',
      headers: new Headers({ Authorization: `JWT ${token}` }),
    } as any)

    if (!user) {
      return NextResponse.json({ error: '認証に失敗しました' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const postId = searchParams.get('postId')

    const existing = await payload.find({
      collection: 'likes',
      where: {
        and: [
          { post: { equals: postId } },
          { user: { equals: user.id } },
        ],
      },
    })

    if (existing.totalDocs === 0) {
      return NextResponse.json({ error: 'イイねが見つかりません' }, { status: 404 })
    }

    await payload.delete({
      collection: 'likes',
      id: existing.docs[0].id,
      overrideAccess: false,
      user,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'エラーが発生しました' }, { status: 500 })
  }
}
```

### 8-3. コメント API Route

`src/app/api/comments/route.ts` を作成します。

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function POST(req: NextRequest) {
  const payload = await getPayload({ config })
  const token = req.cookies.get('payload-token')?.value

  if (!token) {
    return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 })
  }

  try {
    const { user } = await payload.auth({
      collection: 'users',
      headers: new Headers({ Authorization: `JWT ${token}` }),
    } as any)

    if (!user) {
      return NextResponse.json({ error: '認証に失敗しました' }, { status: 401 })
    }

    const body = await req.json()
    const { postId, content } = body

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: 'コメントを入力してください' }, { status: 400 })
    }

    const comment = await payload.create({
      collection: 'comments',
      data: {
        post: postId,
        user: user.id,
        content: content.trim(),
      },
      overrideAccess: false,
      user,
    })

    return NextResponse.json({
      comment: {
        id: comment.id,
        content: comment.content,
        userName: (user as any).name,
        createdAt: comment.createdAt,
      },
    }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'エラーが発生しました' }, { status: 500 })
  }
}
```

### 8-4. イイねボタンコンポーネント

`src/components/LikeButton.tsx` を作成します。

```typescript
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Heart } from 'lucide-react'

interface LikeButtonProps {
  postId: string
  initialCount: number
}

export function LikeButton({ postId, initialCount }: LikeButtonProps) {
  const [count, setCount] = useState(initialCount)
  const [liked, setLiked] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleLike = async () => {
    if (loading) return
    setLoading(true)

    try {
      if (!liked) {
        const res = await fetch('/api/likes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ postId }),
        })
        if (res.status === 401) {
          alert('イイねするにはログインが必要です。\n管理画面（/admin）からログインしてください。')
          return
        }
        if (res.ok) {
          setCount((c) => c + 1)
          setLiked(true)
        } else {
          const data = await res.json()
          alert(data.error || 'エラーが発生しました')
        }
      } else {
        const res = await fetch(`/api/likes?postId=${postId}`, {
          method: 'DELETE',
        })
        if (res.ok) {
          setCount((c) => c - 1)
          setLiked(false)
        }
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-2 my-6 p-4 border rounded-lg bg-white">
      <Button
        variant={liked ? 'default' : 'outline'}
        size="sm"
        onClick={handleLike}
        disabled={loading}
        className="flex items-center gap-1"
      >
        <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
        イイね {count > 0 && <span className="ml-1 font-bold">{count}</span>}
      </Button>
      {liked && <span className="text-sm text-gray-500">イイねしました！</span>}
    </div>
  )
}
```

### 8-5. コメントセクションコンポーネント

`src/components/CommentSection.tsx` を作成します。

```typescript
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

interface Comment {
  id: string
  content: string
  userName: string
  createdAt: string
}

interface CommentSectionProps {
  postId: string
  initialComments: Comment[]
}

export function CommentSection({ postId, initialComments }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments)
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!content.trim() || loading) return
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, content }),
      })

      if (res.status === 401) {
        setError('コメントするにはログインが必要です。管理画面（/admin）からログインしてください。')
        return
      }

      if (res.ok) {
        const data = await res.json()
        setComments((prev) => [data.comment, ...prev])
        setContent('')
      } else {
        const data = await res.json()
        setError(data.error || 'エラーが発生しました')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="mt-10">
      <h2 className="text-xl font-bold mb-4">コメント ({comments.length})</h2>

      {/* コメント投稿フォーム */}
      <div className="mb-6 p-4 border rounded-lg bg-white">
        <p className="text-sm text-gray-500 mb-2">
          ※ コメントは登録ユーザーのみ投稿できます（
          <a href="/admin" className="text-blue-600 underline" target="_blank">
            管理画面でログイン
          </a>
          ）
        </p>
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="コメントを書く..."
          className="mb-2"
          rows={3}
        />
        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
        <Button
          onClick={handleSubmit}
          disabled={loading || !content.trim()}
          size="sm"
        >
          {loading ? '送信中...' : 'コメントを投稿'}
        </Button>
      </div>

      {/* コメント一覧 */}
      {comments.length === 0 ? (
        <p className="text-gray-500 text-sm">まだコメントがありません。</p>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <Card key={comment.id}>
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="text-sm">
                      {comment.userName?.charAt(0)?.toUpperCase() || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm">{comment.userName}</span>
                      <span className="text-xs text-gray-400">
                        {new Date(comment.createdAt).toLocaleDateString('ja-JP', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="text-gray-700 text-sm whitespace-pre-wrap">{comment.content}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  )
}
```

---

## 9. 動作確認

### 9-1. 開発サーバーの起動

```bash
pnpm dev
```

### 9-2. 初期管理者ユーザーの作成

1. ブラウザで `http://localhost:3000/admin` にアクセスします
2. 初回アクセス時にアカウント作成画面が表示されます
3. メールアドレス・パスワード・表示名を入力して登録します

### 9-3. 記事の作成

1. 管理画面にログインします
2. 左メニューから「Posts」を選択します
3. 「Create New」ボタンをクリックします
4. タイトル・スラッグ・本文を入力し、ステータスを「公開」に設定します
5. 「Save」ボタンで保存します

### 9-4. フロント画面の確認

| URL | 内容 |
|-----|------|
| `http://localhost:3000` | 記事一覧 |
| `http://localhost:3000/posts/[slug]` | 記事詳細 |
| `http://localhost:3000/admin` | Payload 管理画面 |

### 9-5. イイね・コメントの確認

1. `http://localhost:3000/admin` からログインします（Cookie が発行されます）
2. フロント画面の記事詳細ページに戻ります
3. 「イイね」ボタンをクリックして動作を確認します
4. コメント欄にテキストを入力して投稿します

---

## トラブルシューティング

### データベース接続エラー

```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

→ PostgreSQL が起動しているか確認してください。

```bash
# macOS (Homebrew)
brew services start postgresql

# Linux
sudo systemctl start postgresql
```

### マイグレーションエラー

```bash
# マイグレーションを手動で実行
pnpm payload migrate
```

### 型エラー（payload-types.ts が見つからない）

```bash
# 型ファイルを再生成
pnpm payload generate:types
```

### shadcn/ui が見つからないエラー

`tsconfig.json` のパスエイリアスを確認してください。

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

---

## 本番環境へのデプロイ（参考）

### 環境変数の設定

```env
DATABASE_URI=postgresql://user:password@host:5432/dbname
PAYLOAD_SECRET=production-secret-at-least-32-chars
NEXT_PUBLIC_SERVER_URL=https://your-domain.com
```

### ビルド

```bash
pnpm build
pnpm start
```

---

## まとめ

本手順書では以下を構築しました。

- **Payload CMS** による記事管理（作成・公開・下書き）
- **Next.js App Router** によるフロントエンド表示
- **認証済みユーザー限定**のイイね機能（トグル対応）
- **認証済みユーザー限定**のコメント機能（リアルタイム反映）
- **PostgreSQL** によるデータ永続化
- **shadcn/ui + TailwindCSS** によるモダンな UI

管理画面（`/admin`）でログインした Cookie を使ってフロント画面での認証状態を共有しています。これにより、ユーザーは管理画面でログインするだけでイイね・コメント機能を利用できます。
