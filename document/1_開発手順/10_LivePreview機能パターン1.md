# 10_LivePreview機能の実装

## 10-1.必要なモジュールをインストール

```sh
npm install dompurify jsdom
npm install -D @types/dompurify @types/jsdom
```

## 10-2.PagesCollectionの作成

```ts
import type { CollectionConfig } from "payload";

export const Pages: CollectionConfig = {
  slug: "pages",
  admin: {
    useAsTitle: "title",
    livePreview: {
      url: ({ data }) =>
        `${process.env.NEXT_PUBLIC_SERVER_URL}/pages/${data?.slug}`,
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
      type: "textarea",
      label: "コンテンツ（JSX/HTML）",
      admin: {
        description: "HTMLタグやJSXに近い構造で入力してください",
        rows: 20,
      },
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

## 10-3.payload.config.tsの更新

- 【追加】blog-cms\src\payload.config.ts

```ts
// 下記追加
import { Pages } from './collections/Pages'

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    {省略}
    // LivePreview機能追加
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
  collections: [Users, Posts, Media, Likes, Comments, Pages],
  {省略}
})

```

## 10-4.型の自動生成

```sh
npx payload generate:types
```

## 10-5.LivePreviewフックの作成

- 【新規】blog-cms\src\hooks\useLivePreview.ts

```ts
"use client";

import { useEffect, useState } from "react";

type LivePreviewMessage<T> = {
  data: T;
  fieldSchemaJSON?: string;
};

export function useLivePreview<T>(props: {
  initialData: T;
  serverURL: string;
  depth?: number;
}): { data: T; isLoading: boolean } {
  const { initialData, serverURL } = props;
  const [data, setData] = useState<T>(initialData);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleMessage = (event: MessageEvent<LivePreviewMessage<T>>) => {
      if (event.origin !== serverURL) return;

      if (event.data && typeof event.data === "object" && "data" in event.data) {
        setData(event.data.data);
        setIsLoading(false);
      }
    };

    window.addEventListener("message", handleMessage);

    // Payload Admin に準備完了を通知
    window.parent?.postMessage(
      { type: "PAYLOAD_LIVE_PREVIEW_READY" },
      serverURL
    );

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [serverURL]);

  return { data, isLoading };
}
```

## 10-6.クライアントコンポーネント作成

- 【新規】blog-cms\src\app\(frontend)\pages\[slug]\page.client.tsx

```tsx
"use client";

import { useLivePreview } from "@/hooks/useLivePreview";
import { useEffect, useState } from "react";
import type { Page } from "@/payload-types";

type Props = {
  initialData: Page;
  serverURL: string;
};

export function PageClient({ initialData, serverURL }: Props) {
  const { data } = useLivePreview<Page>({ initialData, serverURL });
  const [sanitizedContent, setSanitizedContent] = useState("");

  useEffect(() => {
    // クライアント側でのみ DOMPurify を動かす
    const loadAndSanitize = async () => {
      const DOMPurify = (await import("dompurify")).default;
      setSanitizedContent(DOMPurify.sanitize(data.content ?? ""));
    };
    loadAndSanitize();
  }, [data.content]);

  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-6">{data.title}</h1>
      {sanitizedContent && (
        <div
          className="prose prose-neutral max-w-none"
          dangerouslySetInnerHTML={{ __html: sanitizedContent }}
        />
      )}
    </main>
  );
}
```

```txt
※セキュリティの注意※
dangerouslySetInnerHTML は 管理画面から入力した内容のみに使う前提です。
セキュリティ上、DOMPurifyでサニタイズを挟みます。
```

## 10-7.LivePreviewページコンポーネントの作成

- 【新規】src/app/(frontend)/pages/[slug]/page.tsx

```tsx
import { notFound } from "next/navigation";
import { getPayload } from "payload";
import configPromise from "@payload-config";
import { PageClient } from "./page.client";

type Props = {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    preview?: string;
  }>;
};

export default async function Page({ params, searchParams }: Props) {
  const { slug } = await params;
  const { preview } = await searchParams;

  const payload = await getPayload({ config: configPromise });

  const result = await payload.find({
    collection: "pages",
    where: {
      slug: {
        equals: slug,
      },
    },
    draft: preview === "true",
    limit: 1,
  });

  const page = result.docs?.[0];

  if (!page) {
    return notFound();
  }

  return (
    <PageClient
      initialData={page}
      serverURL={process.env.NEXT_PUBLIC_SERVER_URL || ""}
    />
  );
}
```

## 10-8.ページ一覧の作成

- blog-cms\src\app\(frontend)\pages\page.tsx

```tsx
import { getPayload } from 'payload'
import config from '@payload-config'
import { Clock } from 'lucide-react'
import PageCard from '@/components/pages/PageCard'
import EmptyState from '@/components/pages/EmptyState'
import Header from '@/components/home/Header'

export const revalidate = 60 // 60秒ごとに再生成

export default async function PagesPage() {
  // pageデータを取得
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: "pages",
    where: {
      _status: {
        equals: "published",
      },
    },
    limit: 10,
  });
  const pages = result.docs;
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
  );
}
```

```txt
※別途コンポーネント作成しております。
blog-cms\src\components配下のコードを作成してからページを作成してください。
（function・icons・parts等の配下にあるファイル）
```


## 10-9.admin側ページにPageコレクションの導線を作成

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
  // 下記追加
  { label: 'Pages', href: '/admin/collections/pages' },
] as const
const SETTING_LINKS = [
  { label: 'Setting', href: '/admin/account' },
] as const
``` 

## 10-8.DBマイグレーション
```sh
# マイグレーションファイルを生成
## npx payload migrate:create --name add_{slug名}
npx payload migrate:create --name add_pages

# DBに適用
npx payload migrate
```