# Payload CMS + Next.js Live Preview 実装手順書

## 技術スタック

| 技術 | バージョン |
|------|-----------|
| Next.js | 最新（App Router） |
| TypeScript | 最新 |
| TailwindCSS | 最新 |
| shadcn/ui | 最新 |
| Payload CMS | 最新（template: blank） |
| PostgreSQL | 最新 |

---

## 目次

1. [プロジェクト作成](#1-プロジェクト作成)
2. [環境変数の設定](#2-環境変数の設定)
3. [PostgreSQL の設定](#3-postgresql-の設定)
4. [shadcnui の導入](#4-shadcnui-の導入)
5. [Payload Collection の作成](#5-payload-collection-の作成)
6. [Live Preview の実装](#6-live-preview-の実装)
7. [動作確認](#7-動作確認)

---

## 1. プロジェクト作成

### 1-1. Payload アプリの作成

```bash
npm create payload-app@latest
```

対話式のプロンプトで以下のように設定します。

```
? What is your project name? › my-payload-app
? Choose your template › blank
? Choose your database › PostgreSQL
? Do you want to use TypeScript? › Yes
```

作成後、プロジェクトディレクトリに移動します。

```bash
cd my-payload-app
```

### 1-2. 依存パッケージのインストール

```bash
npm install
```

### 1-3. TailwindCSS の導入

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

`tailwind.config.ts` を以下のように編集します。

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;
```

`src/app/globals.css`（または `src/styles/globals.css`）の先頭に以下を追加します。

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

---

## 2. 環境変数の設定

プロジェクトルートに `.env` ファイルを作成します。

```env
# Payload
PAYLOAD_SECRET=your-secret-key-here-change-this-in-production

# Database (PostgreSQL)
DATABASE_URI=postgresql://postgres:password@localhost:5432/payload_db

# Next.js
NEXT_PUBLIC_SERVER_URL=http://localhost:3000
```

> **注意:** `PAYLOAD_SECRET` は本番環境では必ず強力なランダム文字列に変更してください。

---

## 3. PostgreSQL の設定

### 3-1. データベースの作成

PostgreSQL にログインし、データベースを作成します。

```sql
CREATE DATABASE payload_db;
```

### 3-2. 接続確認

```bash
psql -U postgres -d payload_db
```

接続できることを確認した後、`\q` で終了します。

---

## 4. shadcn/ui の導入

### 4-1. shadcn/ui の初期化

```bash
npx shadcn@latest init
```

対話式プロンプトで以下のように設定します。

```
? Which style would you like to use? › Default
? Which color would you like to use as base color? › Slate
? Would you like to use CSS variables for colors? › Yes
```

### 4-2. 必要なコンポーネントの追加

Live Preview で使用するコンポーネントを追加します。

```bash
npx shadcn@latest add button badge separator
```

---

## 5. Payload Collection の作成

### 5-1. Pages Collection の作成

`src/collections/Pages.ts` を作成します。

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

### 5-2. payload.config.ts の更新

`src/payload.config.ts` を以下のように編集します。

```ts
import { buildConfig } from "payload";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

import { Pages } from "./collections/Pages";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  admin: {
    user: "users",
    importMap: {
      baseDir: path.resolve(dirname),
    },
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
  collections: [
    Pages,
    // デフォルトの Users collection
    {
      slug: "users",
      auth: true,
      admin: {
        useAsTitle: "email",
      },
      fields: [],
    },
  ],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || "",
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI,
    },
  }),
  sharp,
  plugins: [],
});
```

---

## 6. Live Preview の実装

### 6-1. Live Preview フック の作成

`src/hooks/useLivePreview.ts` を作成します。

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

### 6-2. Live Preview ページコンポーネントの作成

`src/app/(frontend)/pages/[slug]/page.tsx` を作成します。

まず、ディレクトリを作成します。

```bash
mkdir -p src/app/\(frontend\)/pages/\[slug\]
```

`src/app/(frontend)/pages/[slug]/page.tsx` を作成します。

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

### 6-3. クライアントコンポーネントの作成

`src/app/(frontend)/pages/[slug]/page.client.tsx` を作成します。

```tsx
"use client";

import { useLivePreview } from "@/hooks/useLivePreview";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { Page } from "@/payload-types";

type Props = {
  initialData: Page;
  serverURL: string;
};

export function PageClient({ initialData, serverURL }: Props) {
  const { data } = useLivePreview<Page>({
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

### 6-4. フロントエンド Layout の作成

`src/app/(frontend)/layout.tsx` を作成します。

```bash
mkdir -p src/app/\(frontend\)
```

```tsx
import type { Metadata } from "next";
import "../globals.css";

export const metadata: Metadata = {
  title: "My Payload App",
  description: "Payload CMS + Next.js Live Preview",
};

export default function FrontendLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <span className="font-bold text-xl">My Payload App</span>
        </div>
      </header>
      {children}
    </div>
  );
}
```

### 6-5. トップページの作成

`src/app/(frontend)/page.tsx` を作成します。

```tsx
import Link from "next/link";
import { getPayload } from "payload";
import configPromise from "@payload-config";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default async function HomePage() {
  const payload = await getPayload({ config: configPromise });

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
    <main className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-2 tracking-tight">ページ一覧</h1>
      <p className="text-muted-foreground mb-8">公開中のページの一覧です。</p>

      <Separator className="mb-8" />

      {pages.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground mb-4">
            まだページがありません。
          </p>
          <Button asChild>
            <Link href="/admin">管理画面でページを作成する</Link>
          </Button>
        </div>
      ) : (
        <ul className="space-y-4">
          {pages.map((page) => (
            <li key={page.id}>
              <Link
                href={`/pages/${page.slug}`}
                className="block p-4 rounded-lg border hover:bg-accent transition-colors"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-lg">{page.title}</span>
                  <Badge variant="secondary">{page.slug}</Badge>
                </div>
                {page.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {page.description}
                  </p>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
```

### 6-6. next.config.ts の更新

`next.config.ts` を以下のように更新します。

```ts
import { withPayload } from "@payloadcms/next/withPayload";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 必要に応じて設定を追加
};

export default withPayload(nextConfig);
```

---

## 7. 動作確認

### 7-1. データベースのマイグレーション

```bash
npx payload migrate:create --name initial
npx payload migrate
```

### 7-2. 開発サーバーの起動

```bash
npm run dev
```

### 7-3. 管理画面へのアクセスと初期ユーザー作成

ブラウザで以下の URL にアクセスします。

```
http://localhost:3000/admin
```

初回アクセス時に管理者アカウントを作成します。

### 7-4. Live Preview の操作手順

1. 管理画面（`http://localhost:3000/admin`）にログインします。
2. 左メニューから **Pages** を選択します。
3. **Create New** ボタンをクリックし、ページを作成します。
   - **タイトル**: 任意のタイトルを入力
   - **スラッグ**: URLに使用する文字列（例: `about`）
   - **説明文**: 任意の説明文を入力
4. 上部メニューバーの **Live Preview** ボタンをクリックします。
5. 右側にプレビューウィンドウが表示されます。
6. フィールドの値を変更すると、リアルタイムでプレビューに反映されます。

### 7-5. フロントエンドの確認

公開されたページは以下の URL で確認できます。

```
http://localhost:3000/pages/{slug}
```

例えば、スラッグが `about` のページは以下でアクセスできます。

```
http://localhost:3000/pages/about
```

---

## ディレクトリ構成

```
my-payload-app/
├── src/
│   ├── app/
│   │   ├── (frontend)/         # フロントエンド用 Route Group
│   │   │   ├── layout.tsx      # フロントエンド共通レイアウト
│   │   │   ├── page.tsx        # トップページ（ページ一覧）
│   │   │   └── pages/
│   │   │       └── [slug]/
│   │   │           ├── page.tsx        # サーバーコンポーネント
│   │   │           └── page.client.tsx # クライアントコンポーネント（Live Preview）
│   │   ├── (payload)/          # Payload 管理画面用（自動生成）
│   │   ├── globals.css
│   │   └── layout.tsx
│   ├── collections/
│   │   └── Pages.ts            # Pages Collection 定義
│   ├── hooks/
│   │   └── useLivePreview.ts   # Live Preview カスタムフック
│   ├── components/
│   │   └── ui/                 # shadcn/ui コンポーネント
│   ├── payload.config.ts       # Payload 設定ファイル
│   └── payload-types.ts        # 自動生成される型定義
├── .env
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## Live Preview の仕組み

```
[Payload 管理画面]
       │
       │  postMessage（フィールド変更のたびにデータ送信）
       ▼
[フロントエンド iframe]
  useLivePreview フック
       │
       │  window.addEventListener("message", ...)
       ▼
  useState でデータを更新
       │
       ▼
  コンポーネントが再レンダリング → リアルタイム反映
```

1. Payload 管理画面の Live Preview パネルが、フロントエンドページを iframe で表示します。
2. 管理画面でフィールドを編集するたびに、`postMessage` API でデータが iframe へ送信されます。
3. `useLivePreview` フックが `message` イベントを受け取り、`useState` でデータを更新します。
4. React の再レンダリングにより、プレビューがリアルタイムで更新されます。

---

## トラブルシューティング

### Live Preview が表示されない

- `payload.config.ts` の `admin.livePreview.url` が正しく設定されているか確認してください。
- `NEXT_PUBLIC_SERVER_URL` が正しいか確認してください（`http://localhost:3000` など）。
- ブラウザのコンソールで CORS エラーが出ていないか確認してください。

### データベース接続エラー

- PostgreSQL が起動しているか確認してください。
- `.env` の `DATABASE_URI` の接続文字列が正しいか確認してください。
- データベースが存在するか確認してください。

### 型エラーが発生する

Payload の型定義を再生成してください。

```bash
npx payload generate:types
```

### マイグレーションエラー

既存のマイグレーションを削除して再実行します。

```bash
npx payload migrate:fresh
```
