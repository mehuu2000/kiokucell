# kiokucell

学習支援Webアプリケーション

## 概要

kiokucellは、テスト対策や資格取得の勉強を支援するWebアプリケーションです。CSVやExcelファイルを読み込み、用語や説明の記憶をサポートします。

## 機能

- **ファイル読み込み**: CSV、Excelファイルの読み込み
- **通常学習**: セル単位での情報管理と編集
- **用語学習**: 1列目の情報を表示し、クリックで2列目を表示
- **説明学習**: 2列目の情報を表示し、クリックで1列目を表示
- **ファイル書き出し**: .kiokucell.csv形式での書き出し
- **ローカルストレージ**: 学習データの保存

## 開発環境のセットアップ

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev
```

## ビルドとデプロイ

```bash
# プロダクションビルド
npm run build

# Cloudflare Pagesへのデプロイ
# 1. GitHubリポジトリをCloudflare Pagesに接続
# 2. ビルドコマンド: npm run build
# 3. ビルド出力ディレクトリ: out
```

## 技術スタック

- Next.js (React)
- TypeScript
- Tailwind CSS
- PapaParse (CSV解析)
- xlsx (Excel解析)
- file-saver (ファイル保存)