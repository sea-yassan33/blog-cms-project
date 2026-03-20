# PostgreSQLでDB作成

## DB作成
```sh
## ログイン
psql -U postgres

## データベース作成
CREATE DATABASE blog_cms_db ENCODING 'UTF8';

## 新しいユーザー（ロール）の作成
CREATE USER blog_cms_user WITH PASSWORD 'blog_cms_pw';

## 権限の付与
GRANT ALL PRIVILEGES ON DATABASE blog_cms_db TO blog_cms_user;

## 【PostgreSQL15以降】スキーマへの権限付与も必要
ALTER DATABASE blog_cms_db OWNER TO blog_cms_user;

## ログアウト
\q

## 再度ログインできるか確認
psql -U blog_cms_user -d blog_cms_db
```

|コマンド|何ができるか|
|:----|:----|
|\l|データベースの一覧を表示する|
|\c DB名|指定したデータベースに**接続（切り替え）する|
|\dt|現在のDBにあるテーブル一覧**を表示する|
|\d テーブル名|テーブルの**列構成（型や制約）**を確認する|
|\du|ユーザー（ロール）一覧を表示する|
|\q|psqlを**終了（ログアウト）**する|