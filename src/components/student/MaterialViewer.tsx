import { useState, useEffect, useRef } from 'react'
import { Material } from '../../api/endpoints'
import { useMaterialTracking } from '../../hooks/useMaterialTracking'

// Componente para renderizar contenido SCORM
function SCORMContentRenderer({ fileUrl }: { fileUrl: string }) {
  const [scormData, setScormData] = useState<{
    html_content?: string
    css_content?: string
    js_content?: string
  } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSCORMContent = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(fileUrl)
        if (!response.ok) {
          throw new Error('Error al cargar el contenido SCORM')
        }
        const data = await response.json()
        setScormData(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido')
      } finally {
        setIsLoading(false)
      }
    }

    fetchSCORMContent()
  }, [fileUrl])

  if (isLoading) {
    return (
      <div className="w-full h-96 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Cargando contenido...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full h-96 flex items-center justify-center">
        <div className="text-center text-red-600">
          <p>Error: {error}</p>
        </div>
      </div>
    )
  }

  if (!scormData) {
    return (
      <div className="w-full h-96 flex items-center justify-center">
        <div className="text-center text-gray-600">
          <p>No se pudo cargar el contenido</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-96 overflow-auto">
      <style dangerouslySetInnerHTML={{ __html: scormData.css_content || '' }} />
      <div dangerouslySetInnerHTML={{ __html: scormData.html_content || '' }} />
      {scormData.js_content && (
        <script dangerouslySetInnerHTML={{ __html: scormData.js_content }} />
      )}
    </div>
  )
}

interface MaterialViewerProps {
  material: Material
  isOpen: boolean
  onClose: () => void
}

export function MaterialViewer({ material, isOpen, onClose }: MaterialViewerProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  
  const {
    progress,
    duration: trackingDuration,
    startTracking,
    pauseTracking,
    resumeTracking,
    updateProgress,
    completeTracking,
    abandonTracking
  } = useMaterialTracking()

  // Iniciar tracking cuando se abre el modal
  useEffect(() => {
    if (isOpen && material) {
      startTracking(material.id)
    }
    
    return () => {
      if (isOpen && material) {
        abandonTracking(material.id)
      }
    }
  }, [isOpen, material, startTracking, abandonTracking])

  // Manejar cierre del modal
  const handleClose = () => {
    if (material) {
      abandonTracking(material.id)
    }
    onClose()
  }

  // Manejar eventos de video/audio
  const handlePlay = () => {
    if (material) {
      resumeTracking(material.id)
    }
  }

  const handlePause = () => {
    if (material) {
      pauseTracking(material.id)
    }
  }

  const handleTimeUpdate = (event: React.SyntheticEvent<HTMLVideoElement | HTMLAudioElement>) => {
    const target = event.currentTarget
    const newTime = target.currentTime
    const newDuration = target.duration
    
    setCurrentTime(newTime)
    setDuration(newDuration)
    
    if (newDuration > 0) {
      const progressPercentage = (newTime / newDuration) * 100
      updateProgress(progressPercentage, material.id)
    }
  }

  const handleEnded = () => {
    if (material) {
      completeTracking(material.id)
    }
  }

  const handleSeeked = (event: React.SyntheticEvent<HTMLVideoElement | HTMLAudioElement>) => {
    const target = event.currentTarget
    const newTime = target.currentTime
    const newDuration = target.duration
    
    if (newDuration > 0) {
      const progressPercentage = (newTime / newDuration) * 100
      updateProgress(progressPercentage, material.id)
    }
  }

  if (!isOpen) return null

  const getMaterialIcon = (type: string) => {
    switch (type) {
      case 'VIDEO':
        return (
          <div className="w-16 h-16 bg-red-100 rounded-lg flex items-center justify-center">
            <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
            </svg>
          </div>
        )
      case 'DOCUMENT':
        return (
          <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
            <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
            </svg>
          </div>
        )
      case 'AUDIO':
        return (
          <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center">
            <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
            </svg>
          </div>
        )
      case 'LINK':
        return (
          <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center">
            <svg className="w-8 h-8 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
            </svg>
          </div>
        )
      default:
        return (
          <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
            </svg>
          </div>
        )
    }
  }

  const handleDownload = () => {
    if (material.file) {
      setIsLoading(true)
      // Create a temporary link to download the file
      const link = document.createElement('a')
      link.href = material.file
      link.download = material.name
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      setIsLoading(false)
    }
  }

  const handleOpenLink = () => {
    if (material.url) {
      window.open(material.url, '_blank', 'noopener,noreferrer')
    }
  }

  const renderMaterialContent = () => {
    if (material.material_type === 'VIDEO' && material.file) {
      return (
        <div className="w-full">
          <video
            ref={videoRef}
            controls
            className="w-full h-auto rounded-lg"
            preload="metadata"
            onPlay={handlePlay}
            onPause={handlePause}
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleEnded}
            onSeeked={handleSeeked}
          >
            <source src={material.file} type="video/mp4" />
            <source src={material.file} type="video/webm" />
            <source src={material.file} type="video/ogg" />
            Tu navegador no soporta la reproducción de video.
          </video>
          {/* Barra de progreso personalizada */}
          <div className="mt-2">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span>{Math.floor(currentTime / 60)}:{(currentTime % 60).toFixed(0).padStart(2, '0')}</span>
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(currentTime / duration) * 100}%` }}
                />
              </div>
              <span>{Math.floor(duration / 60)}:{(duration % 60).toFixed(0).padStart(2, '0')}</span>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Progreso: {progress.toFixed(1)}% • Tiempo de visualización: {Math.floor(trackingDuration / 60)}:{(trackingDuration % 60).toFixed(0).padStart(2, '0')}
            </div>
          </div>
        </div>
      )
    }

    if (material.material_type === 'AUDIO' && material.file) {
      return (
        <div className="w-full">
          <audio
            ref={audioRef}
            controls
            className="w-full"
            preload="metadata"
            onPlay={handlePlay}
            onPause={handlePause}
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleEnded}
            onSeeked={handleSeeked}
          >
            <source src={material.file} type="audio/mpeg" />
            <source src={material.file} type="audio/wav" />
            <source src={material.file} type="audio/ogg" />
            Tu navegador no soporta la reproducción de audio.
          </audio>
          {/* Barra de progreso personalizada */}
          <div className="mt-2">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span>{Math.floor(currentTime / 60)}:{(currentTime % 60).toFixed(0).padStart(2, '0')}</span>
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(currentTime / duration) * 100}%` }}
                />
              </div>
              <span>{Math.floor(duration / 60)}:{(duration % 60).toFixed(0).padStart(2, '0')}</span>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Progreso: {progress.toFixed(1)}% • Tiempo de escucha: {Math.floor(trackingDuration / 60)}:{(trackingDuration % 60).toFixed(0).padStart(2, '0')}
            </div>
          </div>
        </div>
      )
    }

    if (material.material_type === 'DOCUMENT' && material.file) {
      // Si es un archivo SCORM (JSON), procesarlo directamente
      if (material.file.endsWith('.json')) {
        return <SCORMContentRenderer fileUrl={material.file} />
      }
      
      // Para otros tipos de documentos, usar iframe
      return (
        <div className="w-full h-96">
          <iframe
            src={material.file}
            className="w-full h-full rounded-lg border"
            title={material.name}
          />
        </div>
      )
    }

    if (material.material_type === 'LINK' && material.url) {
      return (
        <div className="w-full">
          <div className="bg-gray-50 rounded-lg p-6 text-center">
            <div className="mb-4">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </div>
            <p className="text-gray-600 mb-4">Este material es un enlace externo</p>
            <button
              onClick={handleOpenLink}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Abrir Enlace
            </button>
          </div>
        </div>
      )
    }

    return (
      <div className="w-full">
        <div className="bg-gray-50 rounded-lg p-6 text-center">
          <div className="mb-4">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-gray-600 mb-4">Este material no se puede previsualizar</p>
          {material.file && (
            <button
              onClick={handleDownload}
              disabled={isLoading}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Descargando...' : 'Descargar Archivo'}
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {getMaterialIcon(material.material_type)}
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{material.name}</h2>
              <p className="text-sm text-gray-600">
                {material.material_type} • {material.topic_name}
              </p>
              <p className="text-xs text-gray-500">
                Prof. {material.professor_name}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-auto">
          {material.description && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Descripción</h3>
              <p className="text-gray-600">{material.description}</p>
            </div>
          )}

          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Contenido</h3>
            {renderMaterialContent()}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span>
                {material.is_shared ? 'Material de clase' : 'Material personalizado'}
              </span>
              <span>•</span>
              <span>
                Creado: {new Date(material.created_at).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center space-x-3">
              {material.file && (
                <button
                  onClick={handleDownload}
                  disabled={isLoading}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>{isLoading ? 'Descargando...' : 'Descargar'}</span>
                </button>
              )}
              {material.url && (
                <button
                  onClick={handleOpenLink}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  <span>Abrir Enlace</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
