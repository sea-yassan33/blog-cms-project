# 概要

- payloadを使用して、ブログ用CMSを作成

## 技術要件

| 技術 | 用途 |
|------|------|
| Next.js | フロントエンド / フルスタックフレームワーク |
| TypeScript | 型安全な開発 |
| TailwindCSS | スタイリング |
| shadcn/ui | UI コンポーネント |
| Payload CMS | ヘッドレス CMS |
| PostgreSQL | データベース |

## 実装機能

- 管理画面での記事作成（Payload Admin UI）
- フロント画面での記事一覧・詳細表示
- 認証済みユーザーによる「イイね」機能
- 認証済みユーザーによるコメント機能

## ディレクトリ構成

```sh
blog-cms/
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