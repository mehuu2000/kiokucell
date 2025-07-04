export interface CellData {
  value: string
  backColor: string
  color: string
  status: boolean
}

export interface FileData {
  headers: string[]
  rows: CellData[][]
  fileName: string
  isKiokucell: boolean
}