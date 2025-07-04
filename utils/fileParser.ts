import Papa from 'papaparse'
import * as XLSX from 'xlsx'
import { CellData, FileData } from '@/types/cell'

export const parseKiokucellData = (value: string): CellData => {
  const parts = value.split('?')
  const cellData: CellData = {
    value: parts[0] || '',
    backColor: 'none',
    color: 'black',
    status: false
  }

  parts.slice(1).forEach(part => {
    const [key, val] = part.split('=')
    if (key === 'backColor') cellData.backColor = val || 'none'
    if (key === 'color') cellData.color = val || 'black'
    if (key === 'status') cellData.status = val === 'true'
  })

  return cellData
}

export const parseFile = async (file: File): Promise<FileData> => {
  const fileName = file.name
  const isKiokucell = fileName.includes('.kiokucell.')
  
  if (fileName.endsWith('.csv')) {
    return parseCsv(file, isKiokucell)
  } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
    return parseExcel(file, isKiokucell)
  } else {
    throw new Error('サポートされていないファイル形式です')
  }
}

const parseCsv = (file: File, isKiokucell: boolean): Promise<FileData> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      complete: (result) => {
        const data = result.data as string[][]
        if (data.length === 0) {
          reject(new Error('ファイルが空です'))
          return
        }

        let headers: string[] = []
        let dataRows = data

        if (isKiokucell && data.length > 0) {
          headers = data[0]
          dataRows = data.slice(1)
        } else {
          headers = data[0].map((_, index) => `列${index + 1}`)
        }

        const rows: CellData[][] = dataRows.map(row => 
          row.map(cell => {
            if (isKiokucell) {
              return parseKiokucellData(cell)
            } else {
              return {
                value: cell,
                backColor: 'none',
                color: 'black',
                status: false
              }
            }
          })
        )

        resolve({
          headers,
          rows,
          fileName: file.name,
          isKiokucell
        })
      },
      error: (error) => {
        reject(error)
      }
    })
  })
}

const parseExcel = async (file: File, isKiokucell: boolean): Promise<FileData> => {
  const arrayBuffer = await file.arrayBuffer()
  const workbook = XLSX.read(arrayBuffer)
  const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
  const data = XLSX.utils.sheet_to_json<string[]>(firstSheet, { header: 1 })

  if (data.length === 0) {
    throw new Error('ファイルが空です')
  }

  let headers: string[] = []
  let dataRows = data

  if (isKiokucell && data.length > 0) {
    headers = data[0]
    dataRows = data.slice(1)
  } else {
    headers = data[0].map((_, index) => `列${index + 1}`)
  }

  const rows: CellData[][] = dataRows.map(row => 
    row.map(cell => {
      const cellValue = cell?.toString() || ''
      if (isKiokucell) {
        return parseKiokucellData(cellValue)
      } else {
        return {
          value: cellValue,
          backColor: 'none',
          color: 'black',
          status: false
        }
      }
    })
  )

  return {
    headers,
    rows,
    fileName: file.name,
    isKiokucell
  }
}