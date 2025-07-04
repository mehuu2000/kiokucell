'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useData } from '@/contexts/DataContext'
import { CellData } from '@/types/cell'
import CellEditor from '@/components/CellEditor'
import ColorEditModal from '@/components/ColorEditModal'
import HelpModal from '@/components/HelpModal'
import HeaderEditModal from '@/components/HeaderEditModal'
import { exportToKiokucellCsv } from '@/utils/fileExporter'

export default function NormalStudyPage() {
  const router = useRouter()
  const { fileData, setFileData, saveToLocalStorage } = useData()
  const [selectedCells, setSelectedCells] = useState<Set<string>>(new Set())
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set())
  const [selectedColumns, setSelectedColumns] = useState<Set<number>>(new Set())
  const [isEditMode, setIsEditMode] = useState(false)
  const [isColorModalOpen, setIsColorModalOpen] = useState(false)
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false)
  const [isHeaderEditModalOpen, setIsHeaderEditModalOpen] = useState(false)
  const [editingHeaderIndex, setEditingHeaderIndex] = useState<number | null>(null)
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!fileData) {
      router.push('/top')
    } else if (fileData.rows.length === 0) {
      // 空のファイルの場合、初期行を追加
      const initialRow = fileData.headers.map(() => ({
        value: '',
        backColor: 'none',
        color: 'black',
        status: false
      }))
      setFileData({ ...fileData, rows: [initialRow] })
    }
  }, [fileData, router, setFileData])

  if (!fileData) {
    return null
  }

  const toggleCellSelection = (rowIndex: number, colIndex: number) => {
    const key = `${rowIndex}-${colIndex}`
    const newSelected = new Set(selectedCells)
    
    if (newSelected.has(key)) {
      newSelected.delete(key)
    } else {
      newSelected.add(key)
    }
    
    setSelectedCells(newSelected)
  }

  const toggleRowSelection = (rowIndex: number) => {
    const newSelectedRows = new Set(selectedRows)
    const newSelectedCells = new Set(selectedCells)
    
    if (newSelectedRows.has(rowIndex)) {
      newSelectedRows.delete(rowIndex)
      // Remove all cells in this row from selection
      fileData.rows[rowIndex].forEach((_, colIndex) => {
        newSelectedCells.delete(`${rowIndex}-${colIndex}`)
      })
    } else {
      newSelectedRows.add(rowIndex)
      // Add all cells in this row to selection
      fileData.rows[rowIndex].forEach((_, colIndex) => {
        newSelectedCells.add(`${rowIndex}-${colIndex}`)
      })
    }
    
    setSelectedRows(newSelectedRows)
    setSelectedCells(newSelectedCells)
  }

  const toggleAllRows = () => {
    if (selectedRows.size === fileData.rows.length) {
      // 全て選択されている場合は全て解除
      setSelectedRows(new Set())
      setSelectedCells(new Set())
    } else {
      // それ以外は全て選択
      const newSelectedRows = new Set<number>()
      const newSelectedCells = new Set<string>()
      
      fileData.rows.forEach((row, rowIndex) => {
        newSelectedRows.add(rowIndex)
        row.forEach((_, colIndex) => {
          newSelectedCells.add(`${rowIndex}-${colIndex}`)
        })
      })
      
      setSelectedRows(newSelectedRows)
      setSelectedCells(newSelectedCells)
    }
  }

  const toggleColumnSelection = (colIndex: number) => {
    const newSelectedColumns = new Set(selectedColumns)
    const newSelectedCells = new Set(selectedCells)
    
    if (newSelectedColumns.has(colIndex)) {
      newSelectedColumns.delete(colIndex)
      // Remove all cells in this column
      fileData.rows.forEach((_, rowIndex) => {
        newSelectedCells.delete(`${rowIndex}-${colIndex}`)
      })
    } else {
      newSelectedColumns.add(colIndex)
      // Add all cells in this column
      fileData.rows.forEach((_, rowIndex) => {
        newSelectedCells.add(`${rowIndex}-${colIndex}`)
      })
    }
    
    setSelectedColumns(newSelectedColumns)
    setSelectedCells(newSelectedCells)
  }

  const updateCell = (rowIndex: number, colIndex: number, newCell: CellData) => {
    const newRows = [...fileData.rows]
    newRows[rowIndex][colIndex] = newCell
    setFileData({ ...fileData, rows: newRows })
  }

  const toggleCellStatus = (rowIndex: number, colIndex: number) => {
    const cell = fileData.rows[rowIndex][colIndex]
    updateCell(rowIndex, colIndex, { ...cell, status: !cell.status })
  }

  const hideSelectedCells = () => {
    const newRows = [...fileData.rows]
    selectedCells.forEach(key => {
      const [rowIndex, colIndex] = key.split('-').map(Number)
      newRows[rowIndex][colIndex] = { ...newRows[rowIndex][colIndex], status: true }
    })
    setFileData({ ...fileData, rows: newRows })
  }

  const showSelectedCells = () => {
    const newRows = [...fileData.rows]
    selectedCells.forEach(key => {
      const [rowIndex, colIndex] = key.split('-').map(Number)
      newRows[rowIndex][colIndex] = { ...newRows[rowIndex][colIndex], status: false }
    })
    setFileData({ ...fileData, rows: newRows })
  }

  const deleteSelectedRows = () => {
    const rowCount = selectedRows.size
    const message = `選択した${rowCount}行を削除してもよろしいですか？\nこの操作は取り消せません。`
    
    if (!window.confirm(message)) {
      return
    }
    
    const sortedRows = Array.from(selectedRows).sort((a, b) => b - a)
    const newRows = [...fileData.rows]
    
    sortedRows.forEach(rowIndex => {
      newRows.splice(rowIndex, 1)
    })
    
    setFileData({ ...fileData, rows: newRows })
    setSelectedRows(new Set())
    setSelectedCells(new Set())
  }

  const deleteSelectedColumns = () => {
    const columnCount = selectedColumns.size
    const message = `選択した${columnCount}列を削除してもよろしいですか？\nこの操作は取り消せません。`
    
    if (!window.confirm(message)) {
      return
    }
    
    const sortedColumns = Array.from(selectedColumns).sort((a, b) => b - a)
    const newHeaders = [...fileData.headers]
    const newRows = fileData.rows.map(row => [...row])
    
    sortedColumns.forEach(colIndex => {
      newHeaders.splice(colIndex, 1)
      newRows.forEach(row => {
        row.splice(colIndex, 1)
      })
    })
    
    setFileData({ ...fileData, headers: newHeaders, rows: newRows })
    setSelectedColumns(new Set())
    setSelectedCells(new Set())
  }

  const deleteSelected = () => {
    if (selectedRows.size > 0) {
      deleteSelectedRows()
    } else if (selectedColumns.size > 0) {
      deleteSelectedColumns()
    }
  }

  const getDeleteButtonText = () => {
    if (selectedRows.size > 0) {
      return `行を削除 (${selectedRows.size}行)`
    } else if (selectedColumns.size > 0) {
      return `列を削除 (${selectedColumns.size}列)`
    }
    return '削除'
  }

  const canDelete = selectedRows.size > 0 || selectedColumns.size > 0

  const clearAllSelections = () => {
    setSelectedCells(new Set())
    setSelectedRows(new Set())
    setSelectedColumns(new Set())
  }

  const hasAnySelection = selectedCells.size > 0 || selectedRows.size > 0 || selectedColumns.size > 0

  const addNewRow = () => {
    const newRow = fileData.headers.map(() => ({
      value: '',
      backColor: 'none',
      color: 'black',
      status: false
    }))
    
    setFileData({ ...fileData, rows: [...fileData.rows, newRow] })
  }

  const addNewColumn = () => {
    const newHeaders = [...fileData.headers, `列${fileData.headers.length + 1}`]
    const newRows = fileData.rows.map(row => [
      ...row,
      {
        value: '',
        backColor: 'none',
        color: 'black',
        status: false
      }
    ])
    
    setFileData({ ...fileData, headers: newHeaders, rows: newRows })
  }

  const handleExport = () => {
    exportToKiokucellCsv(fileData)
    saveToLocalStorage(fileData)
  }

  const handleColorEdit = (backColor: string, color: string) => {
    const newRows = [...fileData.rows]
    selectedCells.forEach(key => {
      const [rowIndex, colIndex] = key.split('-').map(Number)
      newRows[rowIndex][colIndex] = { 
        ...newRows[rowIndex][colIndex], 
        backColor, 
        color 
      }
    })
    setFileData({ ...fileData, rows: newRows })
  }

  const handleHeaderEdit = (index: number) => {
    setEditingHeaderIndex(index)
    setIsHeaderEditModalOpen(true)
  }

  const handleHeaderSave = (newHeader: string) => {
    if (editingHeaderIndex !== null) {
      const newHeaders = [...fileData.headers]
      newHeaders[editingHeaderIndex] = newHeader
      setFileData({ ...fileData, headers: newHeaders })
      setEditingHeaderIndex(null)
    }
  }

  const handleHeaderContextMenu = (e: React.MouseEvent, index: number) => {
    e.preventDefault()
    handleHeaderEdit(index)
  }

  const handleHeaderTouchStart = (index: number) => {
    const timer = setTimeout(() => {
      handleHeaderEdit(index)
    }, 500) // 500ms長押し
    setLongPressTimer(timer)
  }

  const handleHeaderTouchEnd = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer)
      setLongPressTimer(null)
    }
  }

  const helpContent = {
    title: '通常学習の使い方',
    sections: [
      {
        heading: 'モードについて',
        description: '• 通常モード：セルの表示/非表示の切り替えと色の編集ができます\n• 編集モード：セルの内容を編集、行・列の追加・削除ができます'
      },
      {
        heading: 'セルの操作',
        description: '• シングルクリック：表示/非表示の切り替え（通常モード）、内容の編集（編集モード）\n• ダブルクリック：セルの選択\n• 列ヘッダーをクリック：列全体を選択\n• チェックボックス：行の選択'
      },
      {
        heading: 'ヘッダーの編集',
        description: '• 右クリック：列名を編集（PC）\n• 長押し：列名を編集（スマホ・タブレット）'
      },
      {
        heading: '機能説明',
        description: '• 隠す/表示する：選択したセルの表示状態を変更\n• 色編集：選択したセルの文字色と背景色を変更\n• 削除：選択した行または列を削除（確認あり）\n• 行/列を追加：表の最後に新しい行または列を追加'
      },
      {
        heading: 'データの保存',
        description: '「書き出し」ボタンで.kiokucell.csv形式で保存できます。\nこの形式では、セルの色や表示状態も保存されます。'
      }
    ]
  }

  return (
    <div className="min-h-screen p-2 sm:p-4 lg:p-8">
      <div className="max-w-full mx-auto">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4 sm:mb-6">
          <div className="relative inline-block">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent inline-block">通常学習</h1>
            <button
              onClick={() => setIsHelpModalOpen(true)}
              className="absolute -right-8 bottom-0 w-8 h-8 bg-white/80 backdrop-blur text-blue-600 border-2 border-blue-200 rounded-full hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 flex items-center justify-center text-sm font-bold shadow-md hover:shadow-lg"
              aria-label="ヘルプ"
            >
              ?
            </button>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleExport}
              className="btn-success flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              書き出し
            </button>
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
        </div>

        <div className="card p-4 sm:p-6 mb-4">
          <div className="flex flex-col lg:flex-row gap-3 mb-4 lg:justify-between">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={clearAllSelections}
                className={`px-4 py-2.5 rounded-xl font-medium transition-all duration-200 text-sm sm:text-base ${
                  hasAnySelection
                    ? 'bg-gray-600 text-white hover:bg-gray-700 shadow-md hover:shadow-lg hover:-translate-y-0.5'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
                disabled={!hasAnySelection}
              >
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  選択解除
                </span>
              </button>
              {!isEditMode ? (
                <>
                  <div className="relative group inline-block">
                    <button
                      onClick={hideSelectedCells}
                      className={`px-4 py-2.5 rounded-xl font-medium transition-all duration-200 text-sm sm:text-base flex items-center ${
                        selectedCells.size > 0
                          ? 'btn-danger'
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                      disabled={selectedCells.size === 0}
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                      隠す
                    </button>
                    {selectedCells.size === 0 && (
                      <div className="absolute left-1/2 transform -translate-x-1/2 bottom-full mb-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                        セルを選択してください
                        <div className="absolute left-1/2 transform -translate-x-1/2 top-full w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-4 border-t-gray-800"></div>
                      </div>
                    )}
                  </div>
                  <div className="relative group inline-block">
                    <button
                      onClick={showSelectedCells}
                      className={`px-4 py-2.5 rounded-xl font-medium transition-all duration-200 text-sm sm:text-base flex items-center ${
                        selectedCells.size > 0
                          ? 'btn-primary'
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                      disabled={selectedCells.size === 0}
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      表示する
                    </button>
                    {selectedCells.size === 0 && (
                      <div className="absolute left-1/2 transform -translate-x-1/2 bottom-full mb-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                        セルを選択してください
                        <div className="absolute left-1/2 transform -translate-x-1/2 top-full w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-4 border-t-gray-800"></div>
                      </div>
                    )}
                  </div>
                  <div className="relative group inline-block">
                    <button
                      onClick={() => setIsColorModalOpen(true)}
                      className={`px-4 py-2.5 rounded-xl font-medium transition-all duration-200 text-sm sm:text-base flex items-center ${
                        selectedCells.size > 0
                          ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 shadow-lg hover:shadow-xl hover:-translate-y-0.5'
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                      disabled={selectedCells.size === 0}
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                      </svg>
                      色編集
                    </button>
                    {selectedCells.size === 0 && (
                      <div className="absolute left-1/2 transform -translate-x-1/2 bottom-full mb-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                        セルを選択してください
                        <div className="absolute left-1/2 transform -translate-x-1/2 top-full w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-4 border-t-gray-800"></div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div className="relative group inline-block">
                    <button
                      onClick={deleteSelected}
                      className={`px-4 py-2.5 rounded-xl font-medium transition-all duration-200 text-sm sm:text-base flex items-center ${
                        canDelete
                          ? 'btn-danger'
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                      disabled={!canDelete}
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      {getDeleteButtonText()}
                    </button>
                    {!canDelete && (
                      <div className="absolute left-1/2 transform -translate-x-1/2 bottom-full mb-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                        行または列を選択してください
                        <div className="absolute left-1/2 transform -translate-x-1/2 top-full w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-4 border-t-gray-800"></div>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={addNewRow}
                    className="btn-success flex items-center text-sm sm:text-base"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    行を追加
                  </button>
                  <button
                    onClick={addNewColumn}
                    className="btn-success flex items-center text-sm sm:text-base"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    列を追加
                  </button>
                </>
              )}
            </div>
            <div className="flex justify-end lg:justify-start">
              <button
                onClick={() => setIsEditMode(!isEditMode)}
                className={`px-5 py-2.5 rounded-xl font-medium transition-all duration-200 text-sm sm:text-base w-full sm:w-auto flex items-center justify-center shadow-lg hover:shadow-xl hover:-translate-y-0.5 ${
                  isEditMode 
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600' 
                    : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600'
                }`}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isEditMode ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  )}
                </svg>
                {isEditMode ? '編集モード' : '通常モード'}
              </button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl">
            <table className="w-full" style={{ tableLayout: 'fixed' }}>
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <th 
                    className="p-3 border-b border-gray-200 cursor-pointer hover:bg-gray-200/50 transition-colors duration-200 rounded-tl-xl"
                    style={{ width: '48px' }}
                    onClick={toggleAllRows}
                  >
                    <div className="flex items-center justify-center">
                      {selectedRows.size === fileData.rows.length ? (
                        <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <div className="w-5 h-5 border-2 border-gray-300 rounded"></div>
                      )}
                    </div>
                  </th>
                  {fileData.headers.map((header, index) => {
                    const columnWidth = `${(100 - 5) / fileData.headers.length}%`
                    const isLast = index === fileData.headers.length - 1
                    return (
                      <th
                        key={index}
                        className={`p-3 border-b border-gray-200 cursor-pointer hover:bg-gray-200/50 transition-colors duration-200 select-none ${isLast ? 'rounded-tr-xl' : ''}`}
                        style={{ width: columnWidth }}
                        onClick={() => toggleColumnSelection(index)}
                        onContextMenu={(e) => handleHeaderContextMenu(e, index)}
                        onTouchStart={() => handleHeaderTouchStart(index)}
                        onTouchEnd={handleHeaderTouchEnd}
                        onTouchMove={handleHeaderTouchEnd}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-gray-700 overflow-hidden text-ellipsis whitespace-nowrap">{header}</span>
                          {selectedColumns.has(index) && (
                            <svg className="w-4 h-4 text-blue-600 ml-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                      </th>
                    )
                  })}
                </tr>
              </thead>
              <tbody>
                {fileData.rows.map((row, rowIndex) => (
                  <tr key={rowIndex} className="hover:bg-gray-50/50 transition-colors duration-150">
                    <td className="p-2 border-b border-gray-100 text-center" style={{ width: '48px' }}>
                      <label className="flex items-center justify-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedRows.has(rowIndex)}
                          onChange={() => toggleRowSelection(rowIndex)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                      </label>
                    </td>
                    {row.map((cell, colIndex) => (
                      <CellEditor
                        key={`${rowIndex}-${colIndex}`}
                        cell={cell}
                        onUpdate={(newCell) => updateCell(rowIndex, colIndex, newCell)}
                        isSelected={selectedCells.has(`${rowIndex}-${colIndex}`)}
                        onToggleSelect={() => toggleCellSelection(rowIndex, colIndex)}
                        onToggleStatus={() => toggleCellStatus(rowIndex, colIndex)}
                        isEditMode={isEditMode}
                      />
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      <ColorEditModal
        isOpen={isColorModalOpen}
        onClose={() => setIsColorModalOpen(false)}
        onSave={handleColorEdit}
      />
      
      <HelpModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
        content={helpContent}
      />
      
      {editingHeaderIndex !== null && (
        <HeaderEditModal
          isOpen={isHeaderEditModalOpen}
          onClose={() => {
            setIsHeaderEditModalOpen(false)
            setEditingHeaderIndex(null)
          }}
          onSave={handleHeaderSave}
          currentHeader={fileData.headers[editingHeaderIndex]}
          headerIndex={editingHeaderIndex}
        />
      )}
    </div>
  )
}