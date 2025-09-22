import { useCallback, useState } from 'react'
import { Document } from '../types/block-schema'

interface HistoryState {
  documents: Document[]
  currentIndex: number
  maxHistorySize: number
}

export function useDocumentHistory(
  initialDocument: Document,
  onDocumentChange: (document: Document) => void
) {
  const [history, setHistory] = useState<HistoryState>({
    documents: [initialDocument],
    currentIndex: 0,
    maxHistorySize: 50 // Limit history to prevent memory issues
  })

  const canUndo = history.currentIndex > 0
  const canRedo = history.currentIndex < history.documents.length - 1

  // Add document to history
  const addToHistory = useCallback((document: Document) => {
    setHistory(prev => {
      const newDocuments = [...prev.documents]
      const currentDoc = newDocuments[prev.currentIndex]

      // Only add if document has actually changed
      if (JSON.stringify(document) !== JSON.stringify(currentDoc)) {
        // Remove any documents after current index (when branching from history)
        const trimmedDocuments = newDocuments.slice(0, prev.currentIndex + 1)
        
        // Add new document
        const updatedDocuments = [...trimmedDocuments, document]
        
        // Limit history size
        const finalDocuments = updatedDocuments.length > prev.maxHistorySize
          ? updatedDocuments.slice(-prev.maxHistorySize)
          : updatedDocuments

        return {
          ...prev,
          documents: finalDocuments,
          currentIndex: Math.min(prev.currentIndex + 1, finalDocuments.length - 1)
        }
      }

      return prev
    })
  }, [])

  // Undo function
  const undo = useCallback(() => {
    if (!canUndo) return

    setHistory(prev => {
      const newIndex = prev.currentIndex - 1
      const document = prev.documents[newIndex]
      
      // Update the document in the parent component
      onDocumentChange(document)
      
      return {
        ...prev,
        currentIndex: newIndex
      }
    })
  }, [canUndo, onDocumentChange])

  // Redo function
  const redo = useCallback(() => {
    if (!canRedo) return

    setHistory(prev => {
      const newIndex = prev.currentIndex + 1
      const document = prev.documents[newIndex]
      
      // Update the document in the parent component
      onDocumentChange(document)
      
      return {
        ...prev,
        currentIndex: newIndex
      }
    })
  }, [canRedo, onDocumentChange])

  // Clear history
  const clearHistory = useCallback(() => {
    setHistory(prev => ({
      ...prev,
      documents: [prev.documents[prev.currentIndex]],
      currentIndex: 0
    }))
  }, [])

  // Get current document from history
  const getCurrentDocument = useCallback(() => {
    return history.documents[history.currentIndex]
  }, [history])

  // Get history info
  const getHistoryInfo = useCallback(() => {
    return {
      totalSteps: history.documents.length,
      currentStep: history.currentIndex + 1,
      canUndo,
      canRedo
    }
  }, [history, canUndo, canRedo])

  return {
    addToHistory,
    undo,
    redo,
    clearHistory,
    getCurrentDocument,
    getHistoryInfo,
    canUndo,
    canRedo
  }
}
