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
| LangChain | AIエージェント |

## 実装機能
- 【管理画面】
  - 管理画面での記事作成（Payload Admin UI）
  - AIによる記事自動生成機能
- 【フロント】
  - フロント画面での記事一覧・詳細表示
  - 認証済みユーザーによる「イイね」機能
  - 認証済みユーザーによるコメント機能

## ディレクトリ構成

```sh
blog-cms/
├── src/
│   ├── app/
│   │   ├── (frontend)/          # フロント用ルートグループ
│   │   │   ├── [slug]/
│   │   │   │   └── page.tsx     # 記事詳細ページ
│   │   │   ├── globals.css
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx         # 記事一覧ページ
│   │   ├── (payload)/           # Payload 管理画面（自動生成）
│   │   │   └── admin/
│   │   ├── api/
│   │   │   ├── comments/
│   │   │   │   └── route.ts     # コメントAPI-Route
│   │   │   ├── generate-content/
│   │   │   │   └── route.ts     # 記事自動生成API-Route
│   │   │   ├── likes/
│   │   │__ │   └── route.ts     # いいねAPI-Route
│   ├── collections/
│   │   ├── Users.ts
│   │   ├── Posts.ts
│   │   ├── Media.ts
│   │   ├── Likes.ts
│   │   └── Comments.ts
│   ├── components/
│   │   ├── admin/
│   │   │   ├── AIGenerateButtonGenerateButton/
│   │   │   │   └── index.tsx     # 記事自動生成ボタン
│   │   ├── parts/
│   │   │   ├──  LikeButton.tsx
│   │   │   ├──  CommentSection.tsx
│   │   │__ └──  richText.tsx
│   └── payload.config.ts         # CMS設定ファイル
├── .env
├── package.json
├── postcss.config.mjs
└── tsconfig.json
```

## CloudCodeによる草案作成

- [プロジェクト草案](./document/0_草案_プロンプト/1_プロジェクト草案.md)
- [フロント画面（記事一覧）の画面修正提案](./document/0_草案_プロンプト/2_フロント画面修正案01.md)