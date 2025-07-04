'use client'

import { useState, useEffect } from 'react'

interface HeaderEditModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (newHeader: string) => void
  currentHeader: string
  headerIndex: number
}

export default function HeaderEditModal({ 
  isOpen, 
  onClose, 
  onSave,
  currentHeader,
  headerIndex
}: HeaderEditModalProps) {
  const [headerName, setHeaderName] = useState(currentHeader)

  useEffect(() => {
    setHeaderName(currentHeader)
  }, [currentHeader])

  if (!isOpen) return null

  const handleSave = () => {
    if (headerName.trim()) {
      onSave(headerName.trim())
      onClose()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave()
    } else if (e.key === 'Escape') {
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-sm sm:max-w-md transform transition-all duration-300 scale-100 animate-slideIn">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
          列名を編集
        </h2>
        
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            列{headerIndex + 1}の名前
          </label>
          <input
            type="text"
            value={headerName}
            onChange={(e) => setHeaderName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="列名を入力"
            className="input-modern"
            autoFocus
          />
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
            className={`${headerName.trim() ? 'btn-primary' : 'bg-gray-200 text-gray-400 cursor-not-allowed px-5 py-2.5 rounded-xl font-medium'}`}
            disabled={!headerName.trim()}
          >
            保存
          </button>
        </div>
      </div>
    </div>
  )
}