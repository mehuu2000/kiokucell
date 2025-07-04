import type { Metadata } from 'next'
import './globals.css'
import { DataProvider } from '@/contexts/DataContext'

export const metadata: Metadata = {
  title: 'kiokucell - 学習支援アプリ',
  description: 'テスト対策や資格取得のための学習支援Webアプリケーション',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body>
        <DataProvider>
          {children}
        </DataProvider>
      </body>
    </html>
  )
}