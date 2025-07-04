'use client'

import { useState, useRef } from 'react'
import { CellData } from '@/types/cell'

interface CellEditorProps {
  cell: CellData
  onUpdate: (cell: CellData) => void
  isSelected: boolean
  onToggleSelect: () => void
  onToggleStatus: () => void
  isEditMode: boolean
}

export default function CellEditor({ 
  cell, 
  onUpdate, 
  isSelected, 
  onToggleSelect,
  onToggleStatus,
  isEditMode 
}: CellEditorProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(cell.value)
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleDoubleClick = () => {
    // ダブルクリック時はシングルクリックのタイマーをキャンセル
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current)
      clickTimeoutRef.current = null
    }
    onToggleSelect()
  }

  const handleClick = () => {
    // シングルクリックの処理を遅延実行
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current)
    }
    
    clickTimeoutRef.current = setTimeout(() => {
      if (isEditMode) {
        handleEdit()
      } else {
        onToggleStatus()
      }
    }, 200) // 200ms待機してダブルクリックかどうか判定
  }

  const handleEdit = () => {
    setIsEditing(true)
    setEditValue(cell.value)
  }

  const handleSave = () => {
    onUpdate({ ...cell, value: editValue })
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditValue(cell.value)
    setIsEditing(false)
  }

  const cellStyle = {
    backgroundColor: cell.backColor === 'none' ? 'white' : cell.backColor,
    color: cell.color,
    cursor: 'pointer'
  }

  if (isEditing) {
    return (
      <td className="border p-2">
        <textarea
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleSave()
            }
            if (e.key === 'Escape') handleCancel()
          }}
          className="w-full p-1 border rounded resize-none"
          autoFocus
          rows={Math.max(1, editValue.split('\n').length)}
          style={{ minHeight: '1.5rem' }}
        />
      </td>
    )
  }

  return (
    <td 
      className="border p-2 relative"
      style={{
        ...cellStyle,
        borderColor: isSelected ? '#3B82F6' : undefined,
        borderWidth: isSelected ? '2px' : undefined
      }}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
    >
      <div className="min-h-[1.5rem] relative">
        {cell.status ? (
          <div className="relative w-full">
            <span className="invisible whitespace-pre-wrap break-words">{cell.value || '\u00A0'}</span>
            <div 
              className="absolute rounded"
              style={{ 
                backgroundColor: cell.color,
                height: '1.5rem',
                width: '100%',
                top: '50%',
                left: 0,
                transform: 'translateY(-50%)'
              }}
            />
          </div>
        ) : (
          <span className="whitespace-pre-wrap break-words">
            {cell.value || '\u00A0'}
          </span>
        )}
      </div>
    </td>
  )
}