import { saveAs } from 'file-saver'
import { CellData, FileData } from '@/types/cell'

export const formatCellForExport = (cell: CellData): string => {
  const parts = [cell.value]
  
  if (cell.backColor !== 'none') {
    parts.push(`backColor=${cell.backColor}`)
  }
  
  if (cell.color !== 'black') {
    parts.push(`color=${cell.color}`)
  }
  
  if (cell.status) {
    parts.push(`status=${cell.status}`)
  }
  
  return parts.join('?')
}

export const exportToKiokucellCsv = (fileData: FileData) => {
  const lines: string[] = []
  
  // ヘッダー行
  lines.push(fileData.headers.join(','))
  
  // データ行
  fileData.rows.forEach(row => {
    const formattedCells = row.map(cell => formatCellForExport(cell))
    lines.push(formattedCells.join(','))
  })
  
  const csvContent = lines.join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' })
  
  const fileName = fileData.fileName.includes('.kiokucell.')
    ? fileData.fileName
    : fileData.fileName.replace(/\.[^.]+$/, '.kiokucell.csv')
  
  saveAs(blob, fileName)
}