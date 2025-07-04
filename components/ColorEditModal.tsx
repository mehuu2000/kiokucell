'use client'

import { useState } from 'react'

interface ColorEditModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (backColor: string, color: string) => void
  initialBackColor?: string
  initialColor?: string
}

const colorOptions = [
  { name: 'なし', value: 'none' },
  { name: '黒', value: 'black' },
  { name: '白', value: 'white' },
  { name: '赤', value: '#ff9999' },
  { name: '青', value: '#99ccff' },
  { name: '緑', value: '#99dd99' },
  { name: '黄', value: '#fff099' },
  { name: 'オレンジ', value: '#ffcc99' },
  { name: '紫', value: '#cc99ff' },
  { name: 'ピンク', value: '#ffb3d9' },
  { name: '灰色', value: '#cccccc' },
]

export default function ColorEditModal({ 
  isOpen, 
  onClose, 
  onSave, 
  initialBackColor = 'none',
  initialColor = 'black' 
}: ColorEditModalProps) {
  const [backColor, setBackColor] = useState(initialBackColor)
  const [color, setColor] = useState(initialColor)

  if (!isOpen) return null

  const handleSave = () => {
    onSave(backColor, color)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-sm sm:max-w-md transform transition-all duration-300 scale-100 animate-slideIn">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-6">色の編集</h2>
        
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-3">文字色</label>
          <select
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="input-modern"
          >
            {colorOptions.filter(opt => opt.value !== 'none').map(option => (
              <option key={option.value} value={option.value}>
                {option.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-3">背景色</label>
          <select
            value={backColor}
            onChange={(e) => setBackColor(e.target.value)}
            className="input-modern"
          >
            {colorOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-8">
          <label className="block text-sm font-semibold text-gray-700 mb-3">プレビュー</label>
          <div 
            className="h-16 rounded-xl shadow-inner flex items-center justify-center text-xl font-bold transition-all duration-300"
            style={{ 
              backgroundColor: backColor === 'none' ? '#f9fafb' : backColor,
              color: color 
            }}
          >
            サンプルテキスト
          </div>
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
            className="btn-primary"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  )
}