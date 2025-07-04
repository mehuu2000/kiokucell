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
  const [showPage, setShowPage] = useState(false)

  useEffect(() => {
    setSavedFiles(getAllSavedFiles())
    // ページ表示アニメーション
    const timer = setTimeout(() => {
      setShowPage(true)
    }, 100)
    return () => clearTimeout(timer)
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

  const handleClearSelection = () => {
    setFileData(null)
    setSelectedFile(null)
    setError(null)
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
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className={`max-w-4xl mx-auto transition-all duration-700 transform ${
        showPage ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
      }`}>
        <div className="relative text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent inline-block">
            KiokuCell
          </h1>
          <p className="text-gray-600 mt-2">効率的な学習をサポート</p>
          <button
            onClick={() => setIsHelpModalOpen(true)}
            className="absolute right-0 bottom-0 w-8 h-8 bg-white/80 backdrop-blur text-blue-600 border-2 border-blue-200 rounded-full hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 flex items-center justify-center text-sm font-bold shadow-md hover:shadow-lg"
            aria-label="ヘルプ"
          >
            ?
          </button>
        </div>
        
        <div className="card p-6 sm:p-8 mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <span className="w-1 h-6 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full mr-3"></span>
            ファイルを選択
          </h2>
          <label className="block">
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
              disabled={isLoading}
              id="file-input"
            />
            <label
              htmlFor="file-input"
              className="block w-full p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-400 transition-colors duration-200 cursor-pointer text-center"
            >
              <svg className="mx-auto h-12 w-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-gray-600">クリックまたはドラッグ＆ドロップでファイルを選択</p>
              <p className="text-sm text-gray-500 mt-1">CSV, Excel (.xlsx, .xls)</p>
            </label>
          </label>
          
          {isLoading && (
            <div className="mt-4 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="ml-3 text-blue-600">ファイルを読み込み中...</p>
            </div>
          )}
          
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-600 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {error}
              </p>
            </div>
          )}
          
          {fileData && (
            <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="text-lg font-bold text-gray-800 mb-2 break-all flex items-center">
                    <svg className="w-5 h-5 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {fileData.fileName}
                  </p>
                  <div className="text-sm text-gray-600 grid grid-cols-2 gap-2">
                    <p>📊 行数: {fileData.rows.length}</p>
                    <p>📋 列数: {fileData.headers.length}</p>
                  </div>
                </div>
                <button
                  onClick={handleClearSelection}
                  className="ml-4 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200"
                  aria-label="選択を解除"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {savedFiles.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-3 text-gray-700">保存されたファイル</h3>
              <div className="space-y-2">
                {savedFiles.map(key => (
                  <div key={key} className="flex gap-2 group">
                    <button
                      onClick={() => handleSavedFileSelect(key)}
                      className="flex-1 text-left p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-200 group-hover:shadow-md"
                    >
                      <span className="font-medium text-gray-700">
                        {key.replace('kiokucell_', '').split('_')[0]}
                      </span>
                    </button>
                    <button
                      onClick={() => handleDeleteSavedFile(key)}
                      className="px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 opacity-0 group-hover:opacity-100"
                    >
                      削除
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="card p-6 sm:p-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <span className="w-1 h-6 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full mr-3"></span>
            学習モードを選択
          </h2>
          <div className="space-y-3">
            <button
              onClick={handleNormalStudy}
              className="w-full btn-primary py-4 text-lg flex items-center justify-center group"
            >
              <svg className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              通常学習{!fileData && ' (新規作成)'}
            </button>
            <div className="relative group">
              <button
                onClick={() => handleFeatureStudy('key')}
                className={`w-full py-4 text-lg flex items-center justify-center group transition-all duration-200 ${
                  !fileData || fileData.headers.length !== 2
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'btn-success'
                }`}
                disabled={!fileData || fileData.headers.length !== 2}
              >
                <svg className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                用語学習（1列目を表示）
              </button>
              {!fileData && (
                <div className="absolute left-1/2 transform -translate-x-1/2 bottom-full mb-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                  ファイルを選択してください
                  <div className="absolute left-1/2 transform -translate-x-1/2 top-full w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-4 border-t-gray-800"></div>
                </div>
              )}
              {fileData && fileData.headers.length !== 2 && (
                <div className="absolute left-1/2 transform -translate-x-1/2 bottom-full mb-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                  2列のデータが必要です（現在: {fileData.headers.length}列）
                  <div className="absolute left-1/2 transform -translate-x-1/2 top-full w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-4 border-t-gray-800"></div>
                </div>
              )}
            </div>
            <div className="relative group">
              <button
                onClick={() => handleFeatureStudy('value')}
                className={`w-full py-4 text-lg flex items-center justify-center group transition-all duration-200 ${
                  !fileData || fileData.headers.length !== 2
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-500 to-pink-600 text-white font-medium rounded-xl hover:from-purple-600 hover:to-pink-700 shadow-lg hover:shadow-xl hover:-translate-y-0.5'
                }`}
                disabled={!fileData || fileData.headers.length !== 2}
              >
                <svg className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                説明学習（2列目を表示）
              </button>
              {!fileData && (
                <div className="absolute left-1/2 transform -translate-x-1/2 bottom-full mb-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                  ファイルを選択してください
                  <div className="absolute left-1/2 transform -translate-x-1/2 top-full w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-4 border-t-gray-800"></div>
                </div>
              )}
              {fileData && fileData.headers.length !== 2 && (
                <div className="absolute left-1/2 transform -translate-x-1/2 bottom-full mb-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
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