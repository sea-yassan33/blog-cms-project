# 既存 Payload プロジェクトへの Live Preview 追加手順

既にプロジェクトが動いている前提で、**追加・変更が必要なファイルだけ**を記載しています。

---

## 全体の流れ

```
① payload.config.ts にブレークポイントを追加
② Collection に livePreview URL を追加
③ useLivePreview フックを作成
④ フロントエンドページをサーバー/クライアントに分割
⑤ 動作確認
```

---

## Step 1 — payload.config.ts にブレークポイントを追加

`admin` フィールドに `livePreview` の設定を追加します。

```ts
// payload.config.ts
export default buildConfig({
  admin: {
    // ... 既存の設定 ...

    // ✅ これを追加
    livePreview: {
      breakpoints: [
        { label: "Mobile",  name: "mobile",  width: 375,  height: 667 },
        { label: "Tablet",  name: "tablet",  width: 768,  height: 1024 },
        { label: "Desktop", name: "desktop", width: 1440, height: 900 },
      ],
    },
  },
  // ... 既存の設定 ...
});
```

---

## Step 2 — Collection に livePreview URL を追加

Live Preview したい Collection の `admin` に URL を追加します。

```ts
// src/collections/Pages.ts（例）
export const Pages: CollectionConfig = {
  slug: "pages",
  admin: {
    useAsTitle: "title",

    // ✅ これを追加
    livePreview: {
      url: ({ data }) =>
        `${process.env.NEXT_PUBLIC_SERVER_URL}/pages/${data?.slug}`,
    },
  },
  fields: [
    // ... 既存のフィールド ...
  ],
};
```

> `data` には現在編集中のドキュメントデータが入ります。URL は実際のフロントエンドのパスに合わせて変更してください。

---

## Step 3 — useLivePreview フックを作成

新規ファイルを作成します。既存コードへの変更はありません。

```ts
// src/hooks/useLivePreview.ts
"use client";

import { useEffect, useState } from "react";

type LivePreviewMessage<T> = {
  data: T;
};

export function useLivePreview<T>(props: {
  initialData: T;
  serverURL: string;
}): { data: T } {
  const { initialData, serverURL } = props;
  const [data, setData] = useState<T>(initialData);

  useEffect(() => {
    const handleMessage = (event: MessageEvent<LivePreviewMessage<T>>) => {
      // 送信元が Payload 管理画面のオリジンと一致する場合のみ処理
      if (event.origin !== serverURL) return;

      if (event.data && typeof event.data === "object" && "data" in event.data) {
        setData(event.data.data);
      }
    };

    window.addEventListener("message", handleMessage);

    // Payload 管理画面に「iframe の準備ができた」と通知
    window.parent?.postMessage({ type: "PAYLOAD_LIVE_PREVIEW_READY" }, serverURL);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [serverURL]);

  return { data };
}
```

---

## Step 4 — フロントエンドページを分割する

Live Preview は `postMessage` を使うため、受信側は **Client Component** である必要があります。
既存のページを **サーバー側（データ取得）** と **クライアント側（表示）** に分割します。

### Before（既存の構成）

```
src/app/(frontend)/pages/[slug]/
└── page.tsx   ← サーバーコンポーネントで全部やっている
```

### After（分割後の構成）

```
src/app/(frontend)/pages/[slug]/
├── page.tsx         ← サーバーコンポーネント（データ取得のみ）
└── page.client.tsx  ← クライアントコンポーネント（表示 + Live Preview）
```

---

### page.tsx（サーバーコンポーネント）

既存の `page.tsx` を以下のように書き換えます。  
**変更点:** データ取得後、表示を `PageClient` に委譲するだけ。

```tsx
// src/app/(frontend)/pages/[slug]/page.tsx
import { notFound } from "next/navigation";
import { getPayload } from "payload";
import configPromise from "@payload-config";
import { PageClient } from "./page.client";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ preview?: string }>;
};

export default async function Page({ params, searchParams }: Props) {
  const { slug } = await params;
  const { preview } = await searchParams;

  const payload = await getPayload({ config: configPromise });

  const result = await payload.find({
    collection: "pages",
    where: { slug: { equals: slug } },
    draft: preview === "true", // ✅ 下書きも取得できるようにする
    limit: 1,
  });

  const page = result.docs?.[0];
  if (!page) return notFound();

  return (
    <PageClient
      initialData={page}
      serverURL={process.env.NEXT_PUBLIC_SERVER_URL || ""}
    />
  );
}
```

---

### page.client.tsx（クライアントコンポーネント）

新規作成します。**既存の JSX 表示部分をここに移動**し、`useLivePreview` を追加します。

```tsx
// src/app/(frontend)/pages/[slug]/page.client.tsx
"use client";

import { useLivePreview } from "@/hooks/useLivePreview";
import type { Page } from "@/payload-types"; // 自動生成の型

type Props = {
  initialData: Page;
  serverURL: string;
};

export function PageClient({ initialData, serverURL }: Props) {
  // ✅ useLivePreview を追加するだけ。あとは data を使って既存の JSX を表示する
  const { data } = useLivePreview<Page>({
    initialData,
    serverURL,
  });

  // ↓ 既存の表示ロジックをここに移動（data を使う）
  return (
    <main>
      <h1>{data.title}</h1>
      <p>{data.description}</p>
      {/* ... 既存の JSX ... */}
    </main>
  );
}
```

> **ポイント:** 表示 JSX はほぼそのままで、`useLivePreview` から返る `data` を使うように変数名を変えるだけです。

---

## Step 5 — 環境変数の確認

`.env` に `NEXT_PUBLIC_SERVER_URL` が設定されているか確認します。

```env
NEXT_PUBLIC_SERVER_URL=http://localhost:3000
```

---

## 動作確認

1. 開発サーバーを起動します。

   ```bash
   npm run dev
   ```

2. 管理画面（`/admin`）から Pages を開き、ドキュメントを編集します。

3. 上部バーに **Live Preview** ボタンが表示されます。クリックするとプレビューパネルが開きます。

4. フィールドを編集すると、右側のプレビューにリアルタイムで反映されます。

---

## チェックリスト

| 対応箇所 | 内容 | 完了 |
|----------|------|------|
| `payload.config.ts` | `admin.livePreview.breakpoints` を追加 | ☐ |
| `Collections/*.ts` | `admin.livePreview.url` を追加 | ☐ |
| `src/hooks/useLivePreview.ts` | フックを新規作成 | ☐ |
| `page.tsx` | `PageClient` へデータを渡すだけに変更 | ☐ |
| `page.client.tsx` | `useLivePreview` を使ったクライアントコンポーネントを新規作成 | ☐ |
| `.env` | `NEXT_PUBLIC_SERVER_URL` を確認 | ☐ |

---

## よくある問題

### Live Preview ボタンが管理画面に表示されない

Collection の `admin.livePreview.url` が設定されているか確認してください。URL が空や `undefined` を返す場合はボタンが表示されません。

```ts
// data.slug が undefined の場合も考慮する
url: ({ data }) =>
  data?.slug
    ? `${process.env.NEXT_PUBLIC_SERVER_URL}/pages/${data.slug}`
    : "",
```

### プレビューに変更が反映されない

`page.client.tsx` に `"use client"` ディレクティブがあるか確認してください。また、表示に使っている変数が `initialData` ではなく `useLivePreview` が返す `data` になっているか確認してください。

```tsx
// ❌ initialData をそのまま使っている（Live Preview が効かない）
<h1>{initialData.title}</h1>

// ✅ data を使う
const { data } = useLivePreview({ initialData, serverURL });
<h1>{data.title}</h1>
```

### `postMessage` の origin エラーが出る

`useLivePreview` フック内の `serverURL` と、実際に管理画面が動いているオリジンが一致しているか確認してください。`NEXT_PUBLIC_SERVER_URL` が `http://localhost:3000` のようにポートまで含んでいるか確認します。
