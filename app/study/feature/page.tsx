'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Suspense, useState, useEffect } from 'react'
import { useData } from '@/contexts/DataContext'
import HelpModal from '@/components/HelpModal'

function FeatureStudyContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const type = searchParams.get('type')
  const { fileData } = useData()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [randomOrder, setRandomOrder] = useState<number[]>([])
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false)

  useEffect(() => {
    if (!fileData || fileData.headers.length !== 2) {
      router.push('/top')
      return
    }

    // Create random order
    const indices = Array.from({ length: fileData.rows.length }, (_, i) => i)
    const shuffled = [...indices].sort(() => Math.random() - 0.5)
    setRandomOrder(shuffled)
  }, [fileData, router])

  if (!fileData || randomOrder.length === 0) {
    return null
  }

  const currentRow = fileData.rows[randomOrder[currentIndex]]
  const primaryIndex = type === 'key' ? 0 : 1
  const secondaryIndex = type === 'key' ? 1 : 0

  const handleNext = () => {
    setShowAnswer(false)
    if (currentIndex < randomOrder.length - 1) {
      setCurrentIndex(currentIndex + 1)
    } else {
      // Reshuffle when reaching the end
      const indices = Array.from({ length: fileData.rows.length }, (_, i) => i)
      const shuffled = [...indices].sort(() => Math.random() - 0.5)
      setRandomOrder(shuffled)
      setCurrentIndex(0)
    }
  }

  const handlePrevious = () => {
    setShowAnswer(false)
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  const toggleAnswer = () => {
    setShowAnswer(!showAnswer)
  }

  const helpContent = {
    title: type === 'key' ? '用語学習の使い方' : '説明学習の使い方',
    sections: [
      {
        heading: '学習の流れ',
        description: type === 'key' 
          ? '1列目の用語が問題として表示されます。\nカードをクリックすると、2列目の説明が答えとして表示されます。'
          : '2列目の説明が問題として表示されます。\nカードをクリックすると、1列目の用語が答えとして表示されます。'
      },
      {
        heading: '操作方法',
        description: '• カードをクリック：答えの表示/非表示\n• 前へボタン：前の問題に戻る\n• 次へボタン：次の問題に進む'
      },
      {
        heading: '出題順序',
        description: '問題はランダムな順序で出題されます。\n最後まで進むと、再度ランダムな順序で最初から始まります。'
      },
      {
        heading: 'カードの色',
        description: '• 白色のカード：問題が表示されている状態\n• 緑色のカード：答えが表示されている状態'
      }
    ]
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4 sm:mb-6">
          <div className="relative inline-block">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent inline-block">
              {type === 'key' ? '用語学習' : '説明学習'}
            </h1>
            <button
              onClick={() => setIsHelpModalOpen(true)}
              className="absolute -right-8 bottom-0 w-8 h-8 bg-white/80 backdrop-blur text-blue-600 border-2 border-blue-200 rounded-full hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 flex items-center justify-center text-sm font-bold shadow-md hover:shadow-lg"
              aria-label="ヘルプ"
            >
              ?
            </button>
          </div>
          <Link
            href="/top"
            className="btn-secondary flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            戻る
          </Link>
        </div>

        <div className="card p-6 sm:p-8">
          <div className="text-center mb-4 sm:mb-6">
            <div className="inline-flex items-center space-x-2 bg-gray-100 rounded-full px-4 py-2">
              <span className="text-sm font-medium text-gray-600">進捗</span>
              <span className="text-lg font-bold text-gray-800">{currentIndex + 1}</span>
              <span className="text-sm text-gray-600">/</span>
              <span className="text-lg font-bold text-gray-800">{fileData.rows.length}</span>
            </div>
          </div>

          <div 
            className={`relative rounded-2xl p-8 sm:p-10 lg:p-12 cursor-pointer min-h-[200px] sm:min-h-[250px] flex items-center justify-center transition-all duration-500 transform hover:scale-[1.02] ${
              showAnswer 
                ? 'bg-gradient-to-br from-green-50 to-emerald-100 shadow-2xl' 
                : 'bg-gradient-to-br from-white to-gray-50 shadow-xl hover:shadow-2xl'
            }`}
            onClick={toggleAnswer}
          >
            <div className="absolute top-4 right-4">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                showAnswer 
                  ? 'bg-green-200 text-green-800' 
                  : 'bg-gray-200 text-gray-800'
              }`}>
                {showAnswer ? '答え' : '問題'}
              </span>
            </div>
            <div className="text-center max-w-lg">
              <p className={`text-xl sm:text-2xl lg:text-3xl font-bold leading-relaxed ${
                showAnswer ? 'text-green-900' : 'text-gray-900'
              }`}>
                {showAnswer 
                  ? currentRow[secondaryIndex].value 
                  : currentRow[primaryIndex].value
                }
              </p>
            </div>
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
              <svg className={`w-6 h-6 animate-bounce ${showAnswer ? 'text-green-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13l-3 3m0 0l-3-3m3 3V8m0 13a9 9 0 110-18 9 9 0 010 18z" />
              </svg>
            </div>
          </div>

          <p className="text-center text-sm text-gray-500 mt-4">
            カードをクリックして{showAnswer ? '問題' : '答え'}を表示
          </p>

          <div className="flex justify-between gap-4 mt-6 sm:mt-8">
            <button
              onClick={handlePrevious}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 flex-1 sm:flex-none flex items-center justify-center ${
                currentIndex === 0
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'btn-secondary'
              }`}
              disabled={currentIndex === 0}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              前へ
            </button>
            <button
              onClick={handleNext}
              className="btn-primary px-6 py-3 flex-1 sm:flex-none flex items-center justify-center"
            >
              次へ
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      <HelpModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
        content={helpContent}
      />
    </div>
  )
}

export default function FeatureStudyPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <FeatureStudyContent />
    </Suspense>
  )
}