import React, { useState, useEffect, useCallback } from 'react'
import { 
  FiSearch, 
  FiX, 
  FiDownload, 
  FiExternalLink, 
  FiUser,
  FiImage,
  FiChevronLeft,
  FiChevronRight,
  FiLoader
} from 'react-icons/fi'
import { pexelsService, PexelsPhoto, PexelsSearchParams } from '../../api/pexels'
import { convertPexelsPhotoToBlockMedia } from '../../api/pexels'
import { BlockMedia } from '../../types/block-schema'

interface PexelsImageSearchProps {
  isOpen: boolean
  onClose: () => void
  onSelectImage: (media: BlockMedia) => void
}

interface SearchFilters {
  orientation: 'landscape' | 'portrait' | 'square' | ''
  size: 'large' | 'medium' | 'small' | ''
  color: string
}

export function PexelsImageSearch({ isOpen, onClose, onSelectImage }: PexelsImageSearchProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [photos, setPhotos] = useState<PexelsPhoto[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalResults, setTotalResults] = useState(0)
  const [hasNextPage, setHasNextPage] = useState(false)
  const [hasPrevPage, setHasPrevPage] = useState(false)
  const [selectedPhoto, setSelectedPhoto] = useState<PexelsPhoto | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<SearchFilters>({
    orientation: '',
    size: '',
    color: ''
  })

  const searchPhotos = useCallback(async (query: string, page = 1, filters: SearchFilters) => {
    if (!query.trim()) return

    setLoading(true)
    setError(null)

    try {
      const searchParams: PexelsSearchParams = {
        query: query.trim(),
        page,
        per_page: 20,
        orientation: filters.orientation || undefined,
        size: filters.size || undefined,
        color: filters.color || undefined,
      }

      const response = await pexelsService.searchPhotos(searchParams)
      
      setPhotos(response.photos)
      setTotalResults(response.total_results)
      setCurrentPage(response.page)
      setHasNextPage(!!response.next_page)
      setHasPrevPage(!!response.prev_page)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al buscar imágenes')
      console.error('Error searching photos:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const loadCuratedPhotos = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await pexelsService.getCuratedPhotos(1, 20)
      
      setPhotos(response.photos)
      setTotalResults(response.total_results)
      setCurrentPage(response.page)
      setHasNextPage(!!response.next_page)
      setHasPrevPage(!!response.prev_page)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar imágenes'
      setError(errorMessage)
      
      // Si no hay API key, mostrar un mensaje más específico
      if (errorMessage.includes('API key not configured')) {
        setError('Clave de API de Pexels no configurada. Por favor, configura VITE_PEXELS_API_KEY en las variables de entorno.')
      }
    } finally {
      setLoading(false)
    }
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      setCurrentPage(1)
      searchPhotos(searchQuery, 1, filters)
    }
  }

  const handleLoadMore = () => {
    if (hasNextPage && searchQuery.trim()) {
      searchPhotos(searchQuery, currentPage + 1, filters)
    }
  }

  const handlePrevPage = () => {
    if (hasPrevPage && searchQuery.trim()) {
      searchPhotos(searchQuery, currentPage - 1, filters)
    }
  }

  const handleSelectPhoto = (photo: PexelsPhoto) => {
    const media = convertPexelsPhotoToBlockMedia(photo)
    onSelectImage(media)
    onClose()
  }

  const handlePreviewPhoto = (photo: PexelsPhoto) => {
    setSelectedPhoto(photo)
  }

  const handleClosePreview = () => {
    setSelectedPhoto(null)
  }

  const handleFilterChange = (key: keyof SearchFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const applyFilters = () => {
    if (searchQuery.trim()) {
      setCurrentPage(1)
      searchPhotos(searchQuery, 1, filters)
    }
  }

  const clearFilters = () => {
    setFilters({
      orientation: '',
      size: '',
      color: ''
    })
  }

  // Load curated photos on mount
  useEffect(() => {
    if (isOpen) {
      // Cargar imágenes destacadas automáticamente al abrir
      loadCuratedPhotos()
    }
  }, [isOpen, loadCuratedPhotos])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      
      <div className="relative bg-white rounded-lg w-full max-w-6xl h-[90vh] mx-4 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-2">
            <FiImage className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Buscar Imágenes en Pexels</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b">
          <div className="mb-3">
            <p className="text-sm text-gray-600">
              Explora miles de imágenes gratuitas de alta calidad. Las imágenes destacadas se cargan automáticamente.
            </p>
          </div>
          <form onSubmit={handleSearch} className="flex space-x-2">
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar imágenes (ej: naturaleza, tecnología, personas...)"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !searchQuery.trim()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {loading ? <FiLoader className="w-4 h-4 animate-spin" /> : <FiSearch className="w-4 h-4" />}
              <span>Buscar</span>
            </button>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Filtros
            </button>
          </form>

          {/* Filters */}
          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Orientación
                  </label>
                  <select
                    value={filters.orientation}
                    onChange={(e) => handleFilterChange('orientation', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Cualquiera</option>
                    <option value="landscape">Paisaje</option>
                    <option value="portrait">Retrato</option>
                    <option value="square">Cuadrada</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tamaño
                  </label>
                  <select
                    value={filters.size}
                    onChange={(e) => handleFilterChange('size', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Cualquiera</option>
                    <option value="large">Grande (24MP)</option>
                    <option value="medium">Mediano (12MP)</option>
                    <option value="small">Pequeño (4MP)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Color
                  </label>
                  <input
                    type="color"
                    value={filters.color}
                    onChange={(e) => handleFilterChange('color', e.target.value)}
                    className="w-full h-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2 mt-4">
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Limpiar
                </button>
                <button
                  onClick={applyFilters}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Aplicar Filtros
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto p-4">
          {error && (
            <div className="text-center py-8">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
                <div className="text-red-600 mb-4">
                  <FiImage className="w-12 h-12 mx-auto mb-2 text-red-400" />
                  <p className="font-medium">{error}</p>
                </div>
                
                {error.includes('API key not configured') ? (
                  <div className="text-sm text-gray-600 mb-4">
                    <p>Para usar la búsqueda de imágenes de Pexels:</p>
                    <ol className="list-decimal list-inside mt-2 space-y-1">
                      <li>Crea un archivo <code className="bg-gray-100 px-1 rounded">.env</code> en la raíz del proyecto</li>
                      <li>Agrega: <code className="bg-gray-100 px-1 rounded">VITE_PEXELS_API_KEY=tu_clave_aqui</code></li>
                      <li>Reinicia el servidor de desarrollo</li>
                    </ol>
                  </div>
                ) : (
                  <div className="text-sm text-gray-600 mb-4">
                    <p>Verifica tu conexión a internet e intenta nuevamente.</p>
                  </div>
                )}
                
                <button
                  onClick={() => loadCuratedPhotos()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Intentar Nuevamente
                </button>
              </div>
            </div>
          )}

          {loading && photos.length === 0 && (
            <div className="text-center py-12">
              <FiLoader className="w-12 h-12 animate-spin mx-auto text-blue-600 mb-4" />
              <p className="text-lg text-gray-600 mb-2">Cargando imágenes destacadas...</p>
              <p className="text-sm text-gray-500">Obteniendo las mejores imágenes de Pexels</p>
            </div>
          )}

          {!loading && !error && photos.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <FiImage className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg mb-2">No se encontraron imágenes</p>
              <p className="text-sm">Intenta con otros términos de búsqueda</p>
            </div>
          )}

          {photos.length > 0 && (
            <>
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  {totalResults.toLocaleString()} imágenes encontradas
                </p>
                <div className="flex items-center space-x-2">
                  {hasPrevPage && (
                    <button
                      onClick={handlePrevPage}
                      disabled={loading}
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                    >
                      <FiChevronLeft className="w-4 h-4" />
                    </button>
                  )}
                  <span className="text-sm text-gray-600">
                    Página {currentPage}
                  </span>
                  {hasNextPage && (
                    <button
                      onClick={handleLoadMore}
                      disabled={loading}
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                    >
                      <FiChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {photos.map((photo) => (
                  <div
                    key={photo.id}
                    className="group relative bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div className="aspect-square relative">
                      <img
                        src={photo.src.medium}
                        alt={photo.alt}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-2">
                          <button
                            onClick={() => handlePreviewPhoto(photo)}
                            className="p-2 bg-white rounded-full text-gray-700 hover:bg-gray-100"
                            title="Vista previa"
                          >
                            <FiExternalLink className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleSelectPhoto(photo)}
                            className="p-2 bg-blue-600 rounded-full text-white hover:bg-blue-700"
                            title="Seleccionar"
                          >
                            <FiDownload className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="p-3">
                      <div className="flex items-center space-x-2 text-xs text-gray-500 mb-1">
                        <FiUser className="w-3 h-3" />
                        <span className="truncate">{photo.photographer}</span>
                      </div>
                      <div className="text-xs text-gray-400">
                        {photo.width} × {photo.height}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {loading && photos.length > 0 && (
                <div className="text-center py-4">
                  <FiLoader className="w-6 h-6 animate-spin mx-auto text-blue-600" />
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center space-x-4">
              <span>Imágenes proporcionadas por</span>
              <a
                href="https://www.pexels.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-1 text-blue-600 hover:text-blue-700"
              >
                <img
                  src="https://images.pexels.com/lib/api/pexels.png"
                  alt="Pexels"
                  className="h-4"
                />
              </a>
            </div>
            <div className="flex items-center space-x-2">
              <span>Límite: 200/hora, 20,000/mes</span>
            </div>
          </div>
        </div>
      </div>

      {/* Photo Preview Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-60 flex items-center justify-center">
          <div className="fixed inset-0 bg-black bg-opacity-75" onClick={handleClosePreview}></div>
          <div className="relative bg-white rounded-lg max-w-4xl max-h-[90vh] mx-4">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Vista Previa</h3>
              <button
                onClick={handleClosePreview}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              <img
                src={selectedPhoto.src.large}
                alt={selectedPhoto.alt}
                className="max-w-full max-h-96 object-contain mx-auto"
              />
              <div className="mt-4 space-y-2">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <FiUser className="w-4 h-4" />
                  <span>Fotógrafo: {selectedPhoto.photographer}</span>
                </div>
                <div className="text-sm text-gray-600">
                  Dimensiones: {selectedPhoto.width} × {selectedPhoto.height}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleSelectPhoto(selectedPhoto)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Seleccionar Imagen
                  </button>
                  <a
                    href={selectedPhoto.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
                  >
                    <FiExternalLink className="w-4 h-4" />
                    <span>Ver en Pexels</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
