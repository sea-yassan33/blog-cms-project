# 11_LivePreview機能（リッチテキスト形式）の実装

- 管理画面にてリッチテキストでページコンテンツを作成する方法

## 11-1.ArticlesCollectionの作成

```ts
import type { CollectionConfig } from "payload";

export const Articles: CollectionConfig = {
  slug: "articles",
  admin: {
    useAsTitle: "title",
    livePreview: {
      url: ({ data }) =>
        `${process.env.NEXT_PUBLIC_SERVER_URL}/articles/${data?.slug}`,
    },
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
      label: "タイトル",
    },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      label: "スラッグ",
      admin: {
        description: "URLに使用されます（例: about, contact）",
      },
    },
    {
      name: "content",
      type: "richText",
      label: "コンテンツ",
    },
    {
      name: "description",
      type: "textarea",
      label: "説明文",
    },
    {
      name: "publishedAt",
      type: "date",
      label: "公開日",
    },
    {
      name: "_status",
      type: "select",
      options: [
        { label: "下書き", value: "draft" },
        { label: "公開", value: "published" },
      ],
      defaultValue: "draft",
      label: "ステータス",
    },
  ],
};
```

## 11-2.payload.config.tsの更新

- 【追加】blog-cms\src\payload.config.ts

```ts
// 下記追加
import { Articles } from './collections/Articles'

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    {省略}
    // LivePreview機能追加(10_LivePreview機能パターン1で実装済み)
    livePreview: {
      breakpoints: [
        {
          label: "Mobile",
          name: "mobile",
          width: 375,
          height: 667,
        },
        {
          label: "Tablet",
          name: "tablet",
          width: 768,
          height: 1024,
        },
        {
          label: "Desktop",
          name: "desktop",
          width: 1440,
          height: 900,
        },
      ],
    },
  },
  // コレクションを追加
  collections: [Users, Posts, Media, Likes, Comments, Pages, Articles],
  {省略}
})

```

## 11-3.型の自動生成

```sh
npx payload generate:types
```

## 11-4. クライアントコンポーネントの作成

- 【新規】blog-cms\src\app\(frontend)\pages\articles\[slug]\page.client.tsx

```tsx
"use client";

import { useLivePreview } from "@/hooks/useLivePreview";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { Article } from "@/payload-types";

type Props = {
  initialData: Article;
  serverURL: string;
};

export function PageClient({ initialData, serverURL }: Props) {
  const { data } = useLivePreview<Article>({
    initialData,
    serverURL,
  });

  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <div className="mb-4 flex items-center gap-2">
        <Badge
          variant={data._status === "published" ? "default" : "secondary"}
        >
          {data._status === "published" ? "公開中" : "下書き"}
        </Badge>
        {data.publishedAt && (
          <span className="text-sm text-muted-foreground">
            {new Date(data.publishedAt).toLocaleDateString("ja-JP")}
          </span>
        )}
      </div>

      <h1 className="text-4xl font-bold mb-4 tracking-tight">{data.title}</h1>

      {data.description && (
        <p className="text-muted-foreground text-lg mb-6">{data.description}</p>
      )}

      <Separator className="mb-8" />

      <div className="prose prose-neutral max-w-none">
        {/* RichText の表示（Lexical エディタのレンダリング） */}
        <p className="text-base leading-relaxed">
          {typeof data.content === "string"
            ? data.content
            : "コンテンツがここに表示されます。"}
        </p>
      </div>
    </main>
  );
}
```

## 11-5. LivePreviewページコンポーネントの作成

- src/app/(frontend)/articles/[slug]/page.tsx

```tsx
import { notFound } from "next/navigation";
import { getPayload } from "payload";
import configPromise from "@payload-config";
import Header from '@/components/home/Header'
import { PageClient } from "./page.client";

type Props = {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    preview?: string;
  }>;
};

export default async function Article({ params, searchParams }: Props) {
  const { slug } = await params;
  const { preview } = await searchParams;

  const payload = await getPayload({ config: configPromise });

  const result = await payload.find({
    collection: "articles",
    where: {
      slug: {
        equals: slug,
      },
    },
    draft: preview === "true",
    limit: 1,
  });

  const article = result.docs?.[0];

  if (!article) {
    return notFound();
  }

  return (
    <>
    <Header />
    <PageClient
      initialData={article}
      serverURL={process.env.NEXT_PUBLIC_SERVER_URL || ""}
      />
    </>
  );
}
```

## 11-6．Articls一覧ページ作成

- blog-cms\src\app\(frontend)\articles\page.tsx

```tsx
import { getPayload } from 'payload'
import config from '@payload-config'
import { Clock } from 'lucide-react'
import ArticleCard from '@/components/articles/articleCard'
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
```

```txt
※別途コンポーネント作成しております。
blog-cms\src\components配下のコードを作成してからページを作成してください。
```

## 11-7.admin側ページにPageコレクションの導線を作成

- 【追加】blog-cms\src\components\admin\CustomNav\index.tsx

```tsx
// ─── ナビリンク定義 ────────────────────────────────────────
// プロジェクトの collections/ に合わせて編集
const NAV_LINKS = [
  { label: 'Dashboard', href: '/admin', exact: true },
] as const
const COLLECTION_LINKS = [
  { label: 'Posts', href: '/admin/collections/posts' },
  { label: 'Comments', href: '/admin/collections/comments' },
  { label: 'Likes', href: '/admin/collections/likes' },
  { label: 'Media', href: '/admin/collections/media' },
  { label: 'Users', href: '/admin/collections/users' },
  { label: 'Pages', href: '/admin/collections/pages' },
  // 下記追加
  { label: 'Articles', href: '/admin/collections/articles' },
] as const
const SETTING_LINKS = [
  { label: 'Setting', href: '/admin/account' },
] as const
``` 

## 10-8.DBマイグレーション
```sh
# マイグレーションファイルを生成
## npx payload migrate:create --name add_{slug名}
npx payload migrate:create --name add_articles

# DBに適用
npx payload migrate
```