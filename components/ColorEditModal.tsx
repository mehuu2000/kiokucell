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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-sm sm:max-w-md">
        <h2 className="text-xl font-bold mb-4">色の編集</h2>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">文字色</label>
          <select
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-full p-2 border rounded"
          >
            {colorOptions.filter(opt => opt.value !== 'none').map(option => (
              <option key={option.value} value={option.value}>
                {option.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">背景色</label>
          <select
            value={backColor}
            onChange={(e) => setBackColor(e.target.value)}
            className="w-full p-2 border rounded"
          >
            {colorOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">プレビュー</label>
          <div 
            className="h-12 border rounded flex items-center justify-center text-lg font-medium"
            style={{ 
              backgroundColor: backColor === 'none' ? 'white' : backColor,
              color: color 
            }}
          >
            サンプルテキスト
          </div>
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
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  )
}