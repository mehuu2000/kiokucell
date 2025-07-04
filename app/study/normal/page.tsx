'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useData } from '@/contexts/DataContext'
import { CellData } from '@/types/cell'
import CellEditor from '@/components/CellEditor'
import ColorEditModal from '@/components/ColorEditModal'
import { exportToKiokucellCsv } from '@/utils/fileExporter'

export default function NormalStudyPage() {
  const router = useRouter()
  const { fileData, setFileData, saveToLocalStorage } = useData()
  const [selectedCells, setSelectedCells] = useState<Set<string>>(new Set())
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set())
  const [selectedColumns, setSelectedColumns] = useState<Set<number>>(new Set())
  const [isEditMode, setIsEditMode] = useState(false)
  const [isColorModalOpen, setIsColorModalOpen] = useState(false)

  useEffect(() => {
    if (!fileData) {
      router.push('/top')
    }
  }, [fileData, router])

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

  return (
    <div className="min-h-screen bg-gray-50/50 p-2 sm:p-4 lg:p-8">
      <div className="max-w-full mx-auto">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">通常学習</h1>
          <div className="flex gap-2">
            <button
              onClick={handleExport}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              書き出し
            </button>
            <Link
              href="/top"
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              戻る
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-3 sm:p-6 mb-4">
          <div className="flex flex-col lg:flex-row gap-3 mb-4 lg:justify-between">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={clearAllSelections}
                className={`px-3 sm:px-4 py-2 rounded transition text-sm sm:text-base ${
                  hasAnySelection
                    ? 'bg-gray-600 text-white hover:bg-gray-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
                disabled={!hasAnySelection}
              >
                選択解除
              </button>
              {!isEditMode ? (
                <>
                  <button
                    onClick={hideSelectedCells}
                    className={`px-3 sm:px-4 py-2 rounded transition text-sm sm:text-base ${
                      selectedCells.size > 0
                        ? 'bg-red-500 text-white hover:bg-red-600'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                    disabled={selectedCells.size === 0}
                  >
                    隠す
                  </button>
                  <button
                    onClick={showSelectedCells}
                    className={`px-3 sm:px-4 py-2 rounded transition text-sm sm:text-base ${
                      selectedCells.size > 0
                        ? 'bg-blue-500 text-white hover:bg-blue-600'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                    disabled={selectedCells.size === 0}
                  >
                    表示する
                  </button>
                  <button
                    onClick={() => setIsColorModalOpen(true)}
                    className={`px-3 sm:px-4 py-2 rounded transition text-sm sm:text-base ${
                      selectedCells.size > 0
                        ? 'bg-indigo-500 text-white hover:bg-indigo-600'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                    disabled={selectedCells.size === 0}
                  >
                    色編集
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={deleteSelected}
                    className={`px-3 sm:px-4 py-2 rounded transition text-sm sm:text-base ${
                      canDelete
                        ? 'bg-red-700 text-white hover:bg-red-800'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                    disabled={!canDelete}
                  >
                    {getDeleteButtonText()}
                  </button>
                  <button
                    onClick={addNewRow}
                    className="bg-green-500 text-white px-3 sm:px-4 py-2 rounded hover:bg-green-600 text-sm sm:text-base"
                  >
                    行を追加
                  </button>
                  <button
                    onClick={addNewColumn}
                    className="bg-green-500 text-white px-3 sm:px-4 py-2 rounded hover:bg-green-600 text-sm sm:text-base"
                  >
                    列を追加
                  </button>
                </>
              )}
            </div>
            <div className="flex justify-end lg:justify-start">
              <button
                onClick={() => setIsEditMode(!isEditMode)}
                className={`px-3 sm:px-4 py-2 rounded transition text-sm sm:text-base w-full sm:w-auto ${
                  isEditMode 
                    ? 'bg-orange-500 text-white hover:bg-orange-600' 
                    : 'bg-purple-500 text-white hover:bg-purple-600'
                }`}
              >
                {isEditMode ? '編集モード' : '通常モード'}
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse" style={{ tableLayout: 'fixed' }}>
              <thead>
                <tr>
                  <th 
                    className="border p-2 bg-gray-100 cursor-pointer hover:bg-gray-200"
                    style={{ width: '48px' }}
                    onClick={toggleAllRows}
                  >
                    {selectedRows.size === fileData.rows.length && '✓'}
                  </th>
                  {fileData.headers.map((header, index) => {
                    const columnWidth = `${(100 - 5) / fileData.headers.length}%`
                    return (
                      <th
                        key={index}
                        className="border p-2 bg-gray-100 cursor-pointer hover:bg-gray-200"
                        style={{ width: columnWidth }}
                        onClick={() => toggleColumnSelection(index)}
                      >
                        <div className="overflow-hidden text-ellipsis whitespace-nowrap">
                          {header}
                          {selectedColumns.has(index) && ' ✓'}
                        </div>
                      </th>
                    )
                  })}
                </tr>
              </thead>
              <tbody>
                {fileData.rows.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    <td className="border p-1 text-center" style={{ width: '48px' }}>
                      <input
                        type="checkbox"
                        checked={selectedRows.has(rowIndex)}
                        onChange={() => toggleRowSelection(rowIndex)}
                      />
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
    </div>
  )
}