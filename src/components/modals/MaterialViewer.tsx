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
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Cargando contenido...</p>
        </div>
      </div>  
    )
  }

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center text-red-600">
          <p className="text-lg">Error: {error}</p>
        </div>
      </div>
    )
  }

  if (!scormData) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center text-gray-600">
          <p className="text-lg">No se pudo cargar el contenido</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full overflow-auto">
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
        <div className="w-full h-full">
          <div className="relative bg-black h-full w-full overflow-hidden">
            <video
              ref={videoRef}
              controls
              className="w-full h-full object-contain"
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
          </div>
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
        <div className="w-full h-full flex flex-col items-center justify-center">
          <audio
            ref={audioRef}
            controls
            className="w-full max-w-2xl"
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

    if (material.material_type === 'SCORM' && material.file) {
      // Si es un material SCORM, procesarlo directamente
      return <SCORMContentRenderer fileUrl={material.file} />
    }
    
    if (material.material_type === 'DOCUMENT' && material.file) {
      // Si es un archivo SCORM (JSON) pero con tipo DOCUMENT, procesarlo como SCORM
      if (material.file.endsWith('.json')) {
        return <SCORMContentRenderer fileUrl={material.file} />
      }
      
      // Para otros tipos de documentos, usar iframe con altura completa
      return (
        <div className="w-full h-full min-h-[80vh]">
          <iframe
            src={material.file}
            className="w-full h-full min-h-[80vh] rounded-lg border-0"
            title={material.name}
            style={{ minHeight: '80vh' }}
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
          />
        </div>
      )
    }

    if (material.material_type === 'LINK' && material.url) {
      return (
        <div className="w-full h-full">
          <div className="bg-gray-50 rounded-lg p-6 text-center h-full flex flex-col items-center justify-center">
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
      <div className="w-full h-full">
        <div className="bg-gray-50 rounded-lg p-6 text-center h-full flex flex-col items-center justify-center">
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
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-xl w-full max-w-7xl h-[95vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center space-x-4">
            {getMaterialIcon(material.material_type)}
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold text-gray-900 truncate">{material.name}</h2>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {material.material_type}
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {material.topic_name}
                </span>
                <span className="text-sm text-gray-600">
                  Prof. {material.professor_name}
                </span>
              </div>
              {material.description && (
                <p className="text-sm text-gray-600 mt-2 line-clamp-2">{material.description}</p>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleDownload}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Descargar</span>
            </button>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-auto bg-gray-50">
          <div className="max-w-none">
            {material.description && (
              <div className="mb-6 p-4 bg-white rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Descripción
                </h3>
                <p className="text-gray-600 leading-relaxed">{material.description}</p>
              </div>
            )}

            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden min-h-[85vh]">
              <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Contenido del Material
                </h3>
              </div>
              <div className="p-0 h-full">
                <div className="h-full w-full">
                  {renderMaterialContent()}
                </div>
              </div>
            </div>
          </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
          <div className="flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0">
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${material.is_shared ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                <span className="font-medium">
                  {material.is_shared ? 'Material de Clase' : 'Material Personalizado'}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Creado: {new Date(material.created_at).toLocaleDateString('es-ES')}</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Actualizado: {new Date(material.updated_at).toLocaleDateString('es-ES')}</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {material.url && (
                <button
                  onClick={handleOpenLink}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2"
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
    </div>
  )
}
