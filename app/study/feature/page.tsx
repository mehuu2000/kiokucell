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
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4 sm:mb-6">
          <div className="relative inline-block">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold inline-block">
              {type === 'key' ? '用語学習' : '説明学習'}
            </h1>
            <button
              onClick={() => setIsHelpModalOpen(true)}
              className="absolute -right-8 bottom-0 w-6 h-6 bg-gray-50 text-blue-500 border border-blue-500 rounded-full hover:bg-blue-50 transition flex items-center justify-center text-xs font-bold"
              aria-label="ヘルプ"
            >
              ?
            </button>
          </div>
          <Link
            href="/top"
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            戻る
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <div className="text-center mb-3 sm:mb-4">
            <p className="text-xs sm:text-sm text-gray-600">
              {currentIndex + 1} / {fileData.rows.length}
            </p>
          </div>

          <div 
            className={`rounded-lg p-4 sm:p-6 lg:p-8 cursor-pointer min-h-[150px] sm:min-h-[200px] flex items-center justify-center transition-colors duration-300 ${
              showAnswer 
                ? 'bg-green-100 border-2 border-green-300' 
                : 'bg-white border-2 border-gray-400'
            }`}
            onClick={toggleAnswer}
          >
            <div className="text-center">
              <p className={`text-xs sm:text-sm font-medium mb-1 sm:mb-2 ${
                showAnswer ? 'text-green-600' : 'text-gray-600'
              }`}>
                {showAnswer ? '答え' : '問題'}
              </p>
              <p className={`text-lg sm:text-xl lg:text-2xl font-medium text-center ${
                showAnswer ? 'text-green-900' : 'text-gray-900'
              }`}>
                {showAnswer 
                  ? currentRow[secondaryIndex].value 
                  : currentRow[primaryIndex].value
                }
              </p>
            </div>
          </div>

          <p className="text-center text-sm text-gray-500 mt-2">
            クリックして{showAnswer ? '問題' : '答え'}を表示
          </p>

          <div className="flex justify-between gap-4 mt-4 sm:mt-6">
            <button
              onClick={handlePrevious}
              className="bg-gray-300 text-gray-700 px-3 sm:px-4 py-2 rounded hover:bg-gray-400 text-sm sm:text-base flex-1 sm:flex-none"
              disabled={currentIndex === 0}
            >
              ← 前へ
            </button>
            <button
              onClick={handleNext}
              className="bg-blue-500 text-white px-3 sm:px-4 py-2 rounded hover:bg-blue-600 text-sm sm:text-base flex-1 sm:flex-none"
            >
              次へ →
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