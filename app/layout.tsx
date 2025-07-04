import type { Metadata, Viewport } from 'next'
import './globals.css'
import { DataProvider } from '@/contexts/DataContext'

export const metadata: Metadata = {
  title: 'kiokucell - 学習支援アプリ',
  description: 'テスト対策や資格取得のための学習支援Webアプリケーション',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
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