# 9.admin画面カスタマイズ

- admin側をカスタマイズ

## 9-1.TailwindCSSを適応

- blog-cms\src\app\(payload)\custom.scss

- 下記の様に修正
```scss
/* CSS変数だけを共有（preflight・@layer base は読み込まない）*/
@import '../(frontend)/variables.css';

/* Tailwind は preflight を除いてユーティリティだけ読み込む */
@layer theme {
  @import "tailwindcss/theme";
}
@layer utilities {
  @import "tailwindcss/utilities";
}

/* Payload は .dark クラスではなく data-theme 属性でダークモードを制御する */
@custom-variant dark ([data-theme='dark'] &);
```

- 【追加修正】blog-cms\src\payload.config.ts

```ts
export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    //　下記追加
    // @ts-expect-error: CSSはPayload v3の型定義には含まれていませんが、実行時には動作します。
    css: path.resolve(dirname, './app/(payload)/custom.scss'),
  },
  collections: [Users, Posts, Media, Likes, Comments],
  {省略}
})
```

## 9-3.admin画面用のコンポーネント作成

- [【新規】ナビゲーションメニューコンポーネント](../../blog-cms/src/components/admin/CustomNav/index.tsx)
  - blog-cms\src\components\admin\CustomNav\index.tsx 

- [【新規】ダッシュボードコンポーネント](../../blog-cms/src/components/admin/CustomDashboard/index.tsx)
  - blog-cms\src\components\admin\CustomDashboard\index.tsx

## 9-4.作成したコンポーネントをadmin画面に適応

- 【追加修正】blog-cms\src\payload.config.ts

```ts
export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    // @ts-expect-error: CSSはPayload v3の型定義には含まれていませんが、実行時には動作します。
    css: path.resolve(dirname, './app/(payload)/custom.scss'),
    //　下記追加
    // カスタマイズコンポーネント
    components: {
      Nav: '@/components/admin/CustomNav/index',
      views: {
        dashboard: {
          Component: '@/components/admin/CustomDashboard/index',
        },
      },
    },
  },
  collections: [Users, Posts, Media, Likes, Comments],
  {省略}
})
```

## 9-5.実装例

[![管理画面実装例](https://i.gyazo.com/01d3e40187a3d992bcc5e0140f5b612b.png)](https://gyazo.com/01d3e40187a3d992bcc5e0140f5b612b)