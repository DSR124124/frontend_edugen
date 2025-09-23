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
  const isSavingRef = useRef(false)

  // Check if document has changed
  const hasDocumentChanged = useCallback((currentDoc: Document, lastDoc: Document | null) => {
    if (!lastDoc) {
      console.log('No last document, considering as changed')
      return true
    }
    
    const versionChanged = currentDoc.version !== lastDoc.version
    const timeChanged = currentDoc.updatedAt !== lastDoc.updatedAt
    const blocksChanged = JSON.stringify(currentDoc.blocks) !== JSON.stringify(lastDoc.blocks)
    
    const hasChanges = versionChanged || timeChanged || blocksChanged
    
    console.log('Document change check:', {
      versionChanged,
      timeChanged,
      blocksChanged,
      hasChanges,
      currentBlocks: currentDoc.blocks.length,
      lastBlocks: lastDoc.blocks.length
    })
    
    return hasChanges
  }, [])

  // Save document function
  const saveDocument = useCallback(async (doc?: Document) => {
    const documentToSave = doc || document
    
    // Prevent concurrent saves
    if (isSavingRef.current) {
      console.log('Save already in progress, skipping')
      return
    }
    
    if (!hasDocumentChanged(documentToSave, lastDocumentRef.current)) {
      console.log('Document has not changed, skipping save')
      return
    }

    console.log('Document has changed, saving...')
    isSavingRef.current = true
    setIsSaving(true)
    setHasUnsavedChanges(true)

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500))

      // Here you would typically make an API call to save the document
      // For now, we'll just simulate success
      console.log('Auto-saving document:', documentToSave.id, 'with', documentToSave.blocks.length, 'blocks')
      
      // Update last saved time
      setLastSaved(new Date())
      setHasUnsavedChanges(false)
      lastDocumentRef.current = documentToSave
      
      // Call the onSave callback
      onSave?.(documentToSave)
      
    } catch (error) {
      console.error('Auto-save failed:', error)
      onError?.(error as Error)
    } finally {
      isSavingRef.current = false
      setIsSaving(false)
    }
  }, [document, onSave, onError, hasDocumentChanged])

  // Debounced auto-save
  const debouncedSave = useCallback((doc: Document) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      console.log('Debounced save triggered for document:', doc.id, 'with', doc.blocks.length, 'blocks')
      saveDocument(doc)
    }, delay)
  }, [saveDocument, delay])

  // Effect to trigger auto-save when document changes
  useEffect(() => {
    // Skip if already saving
    if (isSavingRef.current) {
      console.log('Save in progress, skipping auto-save check')
      return
    }
    
    console.log('Document changed, checking if auto-save needed:', document.id, 'with', document.blocks.length, 'blocks')
    if (hasDocumentChanged(document, lastDocumentRef.current)) {
      console.log('Document has changes, triggering debounced save')
      debouncedSave(document)
    } else {
      console.log('Document has no changes, skipping auto-save')
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
