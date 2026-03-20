# blog-cms開発

## 追加モジュール

```sh
# 2.payload導入
npm install tailwindcss @tailwindcss/postcss postcss
npx shadcn@latest init -d
npx shadcn@latest add  button card badge separator

# 4.Payload 設定ファイルの更新
npm install @payloadcms/translations
npm add @payloadcms/email-nodemailer nodemailer
npm i --save-dev @types/nodemailer
```