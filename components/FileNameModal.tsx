'use client'

import { useState } from 'react'

interface FileNameModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (fileName: string) => void
}

export default function FileNameModal({ 
  isOpen, 
  onClose, 
  onSave
}: FileNameModalProps) {
  const [fileName, setFileName] = useState('')

  if (!isOpen) return null

  const handleSave = () => {
    if (fileName.trim()) {
      onSave(fileName.trim())
      setFileName('')
      onClose()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave()
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-sm sm:max-w-md">
        <h2 className="text-xl font-bold mb-4">新規ファイル作成</h2>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">ファイル名</label>
          <input
            type="text"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="例: 英単語学習"
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
          <p className="text-xs text-gray-500 mt-1">
            ※ 拡張子は自動的に .kiokucell.csv が付きます
          </p>
        </div>

        <div className="flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
          >
            キャンセル
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
            disabled={!fileName.trim()}
          >
            作成
          </button>
        </div>
      </div>
    </div>
  )
}