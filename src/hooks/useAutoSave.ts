import { useCallback, useEffect, useRef, useState } from 'react'
import { Document } from '../types/block-schema'

interface UseAutoSaveOptions {
  delay?: number
  onSave?: (document: Document) => void
  onError?: (error: Error) => void
}

export function useAutoSave(
  document: Document,
  onSave?: (document: Document) => void,
  options: UseAutoSaveOptions = {}
) {
  const { delay = 2000, onError } = options
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  
  const timeoutRef = useRef<number | null>(null)
  const lastDocumentRef = useRef<Document | null>(null)

  // Check if document has changed
  const hasDocumentChanged = useCallback((currentDoc: Document, lastDoc: Document | null) => {
    if (!lastDoc) return true
    
    return (
      currentDoc.version !== lastDoc.version ||
      currentDoc.updatedAt !== lastDoc.updatedAt ||
      JSON.stringify(currentDoc.blocks) !== JSON.stringify(lastDoc.blocks)
    )
  }, [])

  // Save document function
  const saveDocument = useCallback(async (doc: Document = document) => {
    if (!hasDocumentChanged(doc, lastDocumentRef.current)) {
      return
    }

    setIsSaving(true)
    setHasUnsavedChanges(true)

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500))

      // Here you would typically make an API call to save the document
      // For now, we'll just simulate success
      console.log('Auto-saving document:', doc.id)
      
      // Update last saved time
      setLastSaved(new Date())
      setHasUnsavedChanges(false)
      lastDocumentRef.current = doc
      
      // Call the onSave callback
      onSave?.(doc)
      
    } catch (error) {
      console.error('Auto-save failed:', error)
      onError?.(error as Error)
    } finally {
      setIsSaving(false)
    }
  }, [document, onSave, onError, hasDocumentChanged])

  // Debounced auto-save
  const debouncedSave = useCallback((doc: Document) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      saveDocument(doc)
    }, delay)
  }, [saveDocument, delay])

  // Effect to trigger auto-save when document changes
  useEffect(() => {
    if (hasDocumentChanged(document, lastDocumentRef.current)) {
      debouncedSave(document)
    }
  }, [document, debouncedSave, hasDocumentChanged])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  // Manual save function
  const manualSave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    return saveDocument()
  }, [saveDocument])

  return {
    saveDocument: manualSave,
    isSaving,
    lastSaved,
    hasUnsavedChanges
  }
}
