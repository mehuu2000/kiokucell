'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useData } from '@/contexts/DataContext'
import { parseFile } from '@/utils/fileParser'
import FileNameModal from '@/components/FileNameModal'
import HelpModal from '@/components/HelpModal'
import { FileData } from '@/types/cell'

export default function TopPage() {
  const router = useRouter()
  const { fileData, setFileData, getAllSavedFiles, loadFromLocalStorage, deleteFromLocalStorage, saveToLocalStorage } = useData()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [savedFiles, setSavedFiles] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isFileNameModalOpen, setIsFileNameModalOpen] = useState(false)
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false)

  useEffect(() => {
    setSavedFiles(getAllSavedFiles())
  }, [getAllSavedFiles])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setSelectedFile(file)
      setError(null)
      setIsLoading(true)

      try {
        const data = await parseFile(file)
        setFileData(data)
        // ファイル読み込み時に自動保存
        saveToLocalStorage(data)
        // 保存されたファイルリストを更新
        setSavedFiles(getAllSavedFiles())
      } catch (err) {
        setError(err instanceof Error ? err.message : 'ファイルの読み込みに失敗しました')
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleSavedFileSelect = (key: string) => {
    loadFromLocalStorage(key)
  }

  const handleDeleteSavedFile = (key: string) => {
    if (window.confirm('このファイルを削除してもよろしいですか？')) {
      deleteFromLocalStorage(key)
      setSavedFiles(getAllSavedFiles())
    }
  }

  const handleNormalStudy = () => {
    if (!fileData) {
      // ファイルが選択されていない場合は新規作成モーダルを表示
      setIsFileNameModalOpen(true)
      return
    }
    router.push('/study/normal')
  }

  const handleCreateNewFile = (fileName: string) => {
    // 新規ファイルのデータを作成
    const newFileData: FileData = {
      fileName: `${fileName}.kiokucell.csv`,
      headers: ['列1', '列2'],
      rows: [],
      isKiokucell: true
    }
    
    setFileData(newFileData)
    saveToLocalStorage(newFileData)
    router.push('/study/normal')
  }

  const handleFeatureStudy = (type: 'key' | 'value') => {
    if (!fileData) {
      setError('ファイルを選択してください')
      return
    }
    
    if (fileData.headers.length !== 2) {
      setError('用語学習・説明学習は2列のデータが必要です')
      return
    }
    
    router.push(`/study/feature?type=${type}`)
  }

  const helpContent = {
    title: 'KiokuCellの使い方',
    sections: [
      {
        heading: 'ファイルの選択',
        description: 'CSV、Excel（.xlsx、.xls）ファイルを読み込むことができます。\n読み込んだファイルは自動的にローカルストレージに保存されます。'
      },
      {
        heading: '保存されたファイル',
        description: '以前に読み込んだファイルは「保存されたファイル」に表示されます。\nファイル名をクリックして選択するか、削除ボタンで削除できます。'
      },
      {
        heading: '学習モードについて',
        description: '• 通常学習：表形式でデータを確認・編集できます\n• 用語学習：1列目を問題として表示します（2列のデータが必要）\n• 説明学習：2列目を問題として表示します（2列のデータが必要）'
      },
      {
        heading: '新規作成',
        description: 'ファイルを選択せずに「通常学習」をクリックすると、新規ファイルを作成できます。'
      },
      {
        heading: 'ファイル形式',
        description: '.kiokucell.csv形式で保存されたファイルは、セルの色や表示/非表示の状態も保存されます。'
      }
    ]
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="relative">
          <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-8">KiokuCell</h1>
          <button
            onClick={() => setIsHelpModalOpen(true)}
            className="absolute right-0 bottom-0 w-6 h-6 bg-gray-50 text-blue-500 border border-blue-500 rounded-full hover:bg-blue-50 transition flex items-center justify-center text-xs font-bold"
            aria-label="ヘルプ"
          >
            ?
          </button>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">ファイルを選択</h2>
          <input
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileChange}
            className="mb-4 p-2 border rounded w-full"
            disabled={isLoading}
          />
          
          {isLoading && (
            <p className="text-sm text-blue-600">ファイルを読み込み中...</p>
          )}
          
          {error && (
            <p className="text-sm text-red-600 mb-2">{error}</p>
          )}
          
          {fileData && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 mb-4">
              <p className="text-base sm:text-lg font-semibold text-blue-900 mb-2 break-all">
                選択されたファイル: {fileData.fileName}
              </p>
              <div className="text-xs sm:text-sm text-blue-700 space-y-1">
                <p>行数: {fileData.rows.length}</p>
                <p>列数: {fileData.headers.length}</p>
              </div>
            </div>
          )}

          {savedFiles.length > 0 && (
            <div className="mt-4">
              <h3 className="text-lg font-medium mb-2">保存されたファイル</h3>
              <div className="space-y-2">
                {savedFiles.map(key => (
                  <div key={key} className="flex gap-2">
                    <button
                      onClick={() => handleSavedFileSelect(key)}
                      className="flex-1 text-left p-2 border rounded hover:bg-gray-50"
                    >
                      {key.replace('kiokucell_', '').split('_')[0]}
                    </button>
                    <button
                      onClick={() => handleDeleteSavedFile(key)}
                      className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      削除
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">学習モードを選択</h2>
          <div className="space-y-2 sm:space-y-3">
            <button
              onClick={handleNormalStudy}
              className="w-full bg-blue-500 text-white py-3 px-4 rounded hover:bg-blue-600 transition"
            >
              通常学習{!fileData && ' (新規作成)'}
            </button>
            <div className="relative group">
              <button
                onClick={() => handleFeatureStudy('key')}
                className="w-full bg-green-500 text-white py-3 px-4 rounded hover:bg-green-600 transition disabled:bg-gray-400"
                disabled={!fileData || fileData.headers.length !== 2}
              >
                用語学習（1列目を表示）
              </button>
              {!fileData && (
                <div className="absolute left-1/2 transform -translate-x-1/2 bottom-full mb-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                  ファイルを選択してください
                  <div className="absolute left-1/2 transform -translate-x-1/2 top-full w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-4 border-t-gray-800"></div>
                </div>
              )}
              {fileData && fileData.headers.length !== 2 && (
                <div className="absolute left-1/2 transform -translate-x-1/2 bottom-full mb-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                  2列のデータが必要です（現在: {fileData.headers.length}列）
                  <div className="absolute left-1/2 transform -translate-x-1/2 top-full w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-4 border-t-gray-800"></div>
                </div>
              )}
            </div>
            <div className="relative group">
              <button
                onClick={() => handleFeatureStudy('value')}
                className="w-full bg-purple-500 text-white py-3 px-4 rounded hover:bg-purple-600 transition disabled:bg-gray-400"
                disabled={!fileData || fileData.headers.length !== 2}
              >
                説明学習（2列目を表示）
              </button>
              {!fileData && (
                <div className="absolute left-1/2 transform -translate-x-1/2 bottom-full mb-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                  ファイルを選択してください
                  <div className="absolute left-1/2 transform -translate-x-1/2 top-full w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-4 border-t-gray-800"></div>
                </div>
              )}
              {fileData && fileData.headers.length !== 2 && (
                <div className="absolute left-1/2 transform -translate-x-1/2 bottom-full mb-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                  2列のデータが必要です（現在: {fileData.headers.length}列）
                  <div className="absolute left-1/2 transform -translate-x-1/2 top-full w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-4 border-t-gray-800"></div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <FileNameModal
        isOpen={isFileNameModalOpen}
        onClose={() => setIsFileNameModalOpen(false)}
        onSave={handleCreateNewFile}
      />
      
      <HelpModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
        content={helpContent}
      />
    </div>
  )
}