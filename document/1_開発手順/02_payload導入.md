# 2.Payload導入

## 2-1.プロジェクト生成

```sh
npm create payload-app@latest

> npx
> create-payload-app
┌   create-payload-app
◇  Project name?
│  blog-cms
◇  Choose project template
│  blank
◇  Select a database
│  PostgreSQL
◆  Enter PostgreSQL connection string
│  postgres://blog_cms_user:blog_cms_user@127.0.0.1:{ポート番号}/blog_cms_db
│
◇  Found latest version of Payload 3.79.1
│
```
## 2-2.TailsindCSSの導入

### TailsindCSS関連のモジュールをインストール

- 下記のコマンドで関連のモジュールをインストール
```sh
cd blog-cms/
npm install tailwindcss @tailwindcss/postcss postcss
```

- 【新規作成】postcss.config.mjs
```js
// postcss.config.mjs
export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};
```

### globals.cssなどにTailwindを読み込ませる

- 【新規作成】src\app\(frontend)\globals.css
  - [サンプル](./sample/globals.css)

## 2-3.shadcn/ui の導入

- 下記のコマンドで関連のモジュールをインストール
```sh
## ui.shadcn
## https://ui.shadcn.com/
npx shadcn@latest init -d
npx shadcn@latest add  button card badge separator avatar textarea

```
