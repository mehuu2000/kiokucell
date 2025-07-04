'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    router.push('/top')
  }, [router])

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold">kiokucell</h1>
      <p className="mt-4 text-xl">学習支援アプリケーション</p>
    </main>
  )
}