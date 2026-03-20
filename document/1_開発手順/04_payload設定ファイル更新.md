# 4.Payload 設定ファイルの更新

## 4-1.設定概要

- 日本語設定を有効化
- メール機能を無効化
- Collectionsのマイグレーション設定

## 4-2.必要なモジュールをインストール

```sh
npm install @payloadcms/translations
npm add @payloadcms/email-nodemailer nodemailer
npm i --save-dev @types/nodemailer
```

## 4-3.設定ファイルの修正

- 【追加修正】blog-cms\src\payload.config.ts

[payload.config.ts](../../blog-cms/src/payload.config.ts)

## 4-4.型の自動生成

- Payload CMSのコレクションやグローバル設定（payload.config.ts）を基に、対応するTypeScriptのインターフェース（.ts型定義ファイル）を自動生成するコマンドです。

```sh
npx payload generate:types
```