import { useState, useMemo } from 'react'

export interface UsePaginationProps {
  totalItems: number
  itemsPerPage?: number
  initialPage?: number
}

export interface UsePaginationReturn {
  currentPage: number
  totalPages: number
  itemsPerPage: number
  totalItems: number
  startIndex: number
  endIndex: number
  hasNextPage: boolean
  hasPreviousPage: boolean
  goToPage: (page: number) => void
  nextPage: () => void
  previousPage: () => void
  goToFirstPage: () => void
  goToLastPage: () => void
  setItemsPerPage: (itemsPerPage: number) => void
}

export function usePagination({
  totalItems,
  itemsPerPage = 10,
  initialPage = 1,
}: UsePaginationProps): UsePaginationReturn {
  const [currentPage, setCurrentPage] = useState(initialPage)
  const [currentItemsPerPage, setCurrentItemsPerPage] = useState(itemsPerPage)

  const totalPages = Math.ceil(totalItems / currentItemsPerPage)
  const startIndex = (currentPage - 1) * currentItemsPerPage
  const endIndex = Math.min(startIndex + currentItemsPerPage, totalItems)
  const hasNextPage = currentPage < totalPages
  const hasPreviousPage = currentPage > 1

  const goToPage = (page: number) => {
    const pageNumber = Math.max(1, Math.min(page, totalPages))
    setCurrentPage(pageNumber)
  }

  const nextPage = () => {
    if (hasNextPage) {
      setCurrentPage(prev => prev + 1)
    }
  }

  const previousPage = () => {
    if (hasPreviousPage) {
      setCurrentPage(prev => prev - 1)
    }
  }

  const goToFirstPage = () => {
    setCurrentPage(1)
  }

  const goToLastPage = () => {
    setCurrentPage(totalPages)
  }

  const setItemsPerPage = (newItemsPerPage: number) => {
    setCurrentItemsPerPage(newItemsPerPage)
    setCurrentPage(1) // Reset to first page when changing items per page
  }

  return {
    currentPage,
    totalPages,
    itemsPerPage: currentItemsPerPage,
    totalItems,
    startIndex,
    endIndex,
    hasNextPage,
    hasPreviousPage,
    goToPage,
    nextPage,
    previousPage,
    goToFirstPage,
    goToLastPage,
    setItemsPerPage,
  }
}
