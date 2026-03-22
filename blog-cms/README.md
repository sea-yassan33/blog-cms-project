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

# 8.AI記事自動生成機能
npm install @langchain/google-genai @langchain/core langchain

# 10.LivePrevews機能パターン1
npm install dompurify jsdom
npm install -D @types/dompurify @types/jsdom
```