'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'
import { FileData } from '@/types/cell'

interface DataContextType {
  fileData: FileData | null
  setFileData: (data: FileData | null) => void
  savedFiles: FileData[]
  saveToLocalStorage: (data: FileData) => void
  loadFromLocalStorage: (fileName: string) => void
  getAllSavedFiles: () => string[]
  deleteFromLocalStorage: (key: string) => void
}

const DataContext = createContext<DataContextType | undefined>(undefined)

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [fileData, setFileData] = useState<FileData | null>(null)
  const [savedFiles, setSavedFiles] = useState<FileData[]>([])

  const saveToLocalStorage = (data: FileData) => {
    const key = `kiokucell_${data.fileName}_${Date.now()}`
    localStorage.setItem(key, JSON.stringify(data))
    setSavedFiles([...savedFiles, data])
  }

  const loadFromLocalStorage = (key: string) => {
    const data = localStorage.getItem(key)
    if (data) {
      const parsed = JSON.parse(data) as FileData
      setFileData(parsed)
    }
  }

  const getAllSavedFiles = (): string[] => {
    const keys: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith('kiokucell_')) {
        keys.push(key)
      }
    }
    return keys
  }

  const deleteFromLocalStorage = (key: string) => {
    localStorage.removeItem(key)
  }

  return (
    <DataContext.Provider 
      value={{ 
        fileData, 
        setFileData, 
        savedFiles, 
        saveToLocalStorage, 
        loadFromLocalStorage,
        getAllSavedFiles,
        deleteFromLocalStorage 
      }}
    >
      {children}
    </DataContext.Provider>
  )
}

export const useData = () => {
  const context = useContext(DataContext)
  if (!context) {
    throw new Error('useData must be used within a DataProvider')
  }
  return context
}