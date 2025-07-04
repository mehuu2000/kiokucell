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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-sm sm:max-w-md transform transition-all duration-300 scale-100 animate-slideIn">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">新規ファイル作成</h2>
        
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-3">ファイル名</label>
          <input
            type="text"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="例: 英単語学習"
            className="input-modern"
            autoFocus
          />
          <p className="text-xs text-gray-500 mt-2">
            ※ 拡張子は自動的に .kiokucell.csv が付きます
          </p>
        </div>

        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="btn-secondary"
          >
            キャンセル
          </button>
          <button
            onClick={handleSave}
            className={`${fileName.trim() ? 'btn-primary' : 'bg-gray-200 text-gray-400 cursor-not-allowed px-5 py-2.5 rounded-xl font-medium'}`}
            disabled={!fileName.trim()}
          >
            作成
          </button>
        </div>
      </div>
    </div>
  )
}