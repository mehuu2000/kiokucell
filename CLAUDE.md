# kiokucell プロジェクト -Claude code ガイド

## プロジェクト概要
**kiokucell*は学校のテスト対策や資格取得の際の勉強などを補助するWebアプリケーションです。
実現方法としては、.xlsxや.csvなどのセル単位で情報を扱うファイルをユーザーファイルから読み込み、それらの情報を整理・加工することで用語や説明の記憶をサポートします。また、加工したものを.csvで書き出すことでいつでも読み出し、再度加工をすることができ、Noデータベースで実現します。

・アプリ名：kiokucell
・主要機能：ファイルの読み取り・書き出し、読み取ったファイル情報の表示・加工、行単位でのランダム出題

## 技術スタック

### フロントエンド
フレームワーク：Next.js (React)
言語：TypeScript
ルーティング：Next.jsのディレクトリベースルーティング (Directory-based Routing)
デプロイ：Cloudflare Pages (Edge Runtime)

### バックエンド
フレームワーク：Next.js
デプロイ：Cloudflare Pages (Edge Runtime)

## 開発ルール

### 宣言
* 変数：キャメルケース(testExample)
* 定数：アッパースネークケース(TEST_EXAMPLE)
* ファイル名：キャメルケース(testExample)
* 関数・コンポーネント名：パスカルケース (TestExample)

### 配慮して欲しいこと
* コンポーネント：なるべく分けて、再利用できるようにしてほしい。
* デプロイについて：Cloudeflare Pagesにデプロイするので、それを踏まえて開発してほしい。
