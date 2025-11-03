import { useState, useEffect } from 'react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Download, FileText, Image, Video, Music } from 'lucide-react'
import { buildFileUrl } from '../../config/environment'

interface FileViewModalProps {
  isOpen: boolean
  onClose: () => void
  fileUrl: string
  fileName: string
  materialType?: string
}

export function FileViewModal({ 
  isOpen, 
  onClose, 
  fileUrl, 
  fileName,
  materialType 
}: FileViewModalProps) {
  // Construir la URL completa usando la función centralizada que asegura HTTPS
  const fullUrl = buildFileUrl(fileUrl)

  const getFileExtension = (url: string): string => {
    const match = url.match(/\.([^.]+)(\?|$)/)
    return match ? match[1].toLowerCase() : ''
  }

  const getFileType = (): 'pdf' | 'image' | 'video' | 'audio' | 'text' | 'excel' | 'document' | 'other' => {
    const ext = getFileExtension(fileUrl)
    const mimeType = materialType?.toUpperCase()

    // Determinar tipo por extensión
    if (ext === 'pdf') return 'pdf'
    if (['txt', 'text', 'log', 'md', 'readme'].includes(ext)) return 'text'
    if (['xls', 'xlsx'].includes(ext)) return 'excel'
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) return 'image'
    if (['mp4', 'webm', 'ogg'].includes(ext)) return 'video'
    if (['mp3', 'wav', 'ogg'].includes(ext)) return 'audio'
    if (['doc', 'docx', 'ppt', 'pptx'].includes(ext)) return 'document'

    // Determinar tipo por material_type
    if (mimeType === 'IMAGE') return 'image'
    if (mimeType === 'VIDEO') return 'video'
    if (mimeType === 'AUDIO') return 'audio'
    if (mimeType === 'DOCUMENT') return 'document'

    return 'other'
  }

  const fileType = getFileType()
  const [textContent, setTextContent] = useState<string>('')
  const [loadingText, setLoadingText] = useState(false)
  const [textError, setTextError] = useState<string | null>(null)
  const [showExcelViewer, setShowExcelViewer] = useState(false)

  // Cargar contenido de archivos de texto
  useEffect(() => {
    if (isOpen && fileType === 'text') {
      setLoadingText(true)
      setTextError(null)
      fetch(fullUrl)
        .then(response => {
          if (!response.ok) {
            throw new Error('Error al cargar el archivo')
          }
          return response.text()
        })
        .then(text => {
          setTextContent(text)
          setLoadingText(false)
        })
        .catch(error => {
          console.error('Error loading text file:', error)
          setTextError('No se pudo cargar el contenido del archivo')
          setLoadingText(false)
        })
    } else {
      setTextContent('')
      setTextError(null)
    }
  }, [isOpen, fileType, fullUrl])

  // Resetear el visor de Excel cuando se cierra el modal o cambia el archivo
  useEffect(() => {
    if (!isOpen) {
      setShowExcelViewer(false)
    }
  }, [isOpen])

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = fullUrl
    link.download = fileName
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const renderContent = () => {
    switch (fileType) {
      case 'pdf':
        return (
          <div className="w-full h-full overflow-hidden" style={{ width: '100%', maxWidth: '100%' }}>
            <iframe
              src={`${fullUrl}#toolbar=1&navpanes=0&scrollbar=1&zoom=page-width`}
              className="w-full border-0"
              title={fileName}
              style={{ 
                height: '80vh',
                minHeight: '600px',
                maxHeight: '800px',
                width: '100%',
                maxWidth: '100%',
                display: 'block',
                boxSizing: 'border-box'
              }}
              allow="fullscreen"
            />
          </div>
        )

      case 'image':
        return (
          <div className="w-full flex justify-center items-center bg-gray-100 rounded-lg p-4">
            <img
              src={fullUrl}
              alt={fileName}
              className="max-w-full max-h-[600px] object-contain rounded-lg"
            />
          </div>
        )

      case 'video':
        return (
          <div className="w-full flex justify-center items-center bg-black rounded-lg p-4">
            <video
              src={fullUrl}
              controls
              className="max-w-full max-h-[600px] rounded-lg"
            >
              Tu navegador no soporta el elemento de video.
            </video>
          </div>
        )

      case 'audio':
        return (
          <div className="w-full flex justify-center items-center bg-gray-100 rounded-lg p-8">
            <div className="w-full max-w-md">
              <div className="bg-white rounded-lg p-6 shadow-lg">
                <div className="flex justify-center mb-4">
                  <Music className="w-16 h-16 text-blue-600" />
                </div>
                <audio
                  src={fullUrl}
                  controls
                  className="w-full"
                >
                  Tu navegador no soporta el elemento de audio.
                </audio>
                <p className="text-center text-sm text-gray-600 mt-4">{fileName}</p>
              </div>
            </div>
          </div>
        )

      case 'text':
        return (
          <div className="w-full h-full overflow-hidden" style={{ width: '100%', maxWidth: '100%' }}>
            {loadingText ? (
              <div className="flex flex-col items-center justify-center p-8 min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-sm text-gray-600">Cargando contenido del archivo...</p>
              </div>
            ) : textError ? (
              <div className="w-full flex flex-col items-center justify-center bg-gray-100 rounded-lg p-8 min-h-[400px]">
                <div className="bg-white rounded-lg p-8 shadow-lg text-center max-w-md">
                  <FileText className="w-20 h-20 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Error al cargar archivo</h3>
                  <p className="text-sm text-gray-600 mb-6">{textError}</p>
                  <Button
                    onClick={handleDownload}
                    variant="primary"
                    className="w-full"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Descargar archivo
                  </Button>
                </div>
              </div>
            ) : (
              <div className="w-full h-[600px] min-h-[500px] max-h-[800px] overflow-auto bg-gray-50 p-4">
                <pre className="whitespace-pre-wrap font-mono text-sm text-gray-900 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                  {textContent || 'El archivo está vacío'}
                </pre>
              </div>
            )}
          </div>
        )

      case 'excel':
        return (
          <div className="w-full h-full overflow-hidden" style={{ width: '100%', maxWidth: '100%' }}>
            {showExcelViewer ? (
              <div className="w-full h-[600px] min-h-[500px] max-h-[800px] overflow-hidden bg-gray-50">
                <div className="bg-white border-b border-gray-200 p-3 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium text-gray-900">{fileName}</span>
                  </div>
                  <Button
                    onClick={() => setShowExcelViewer(false)}
                    variant="outline"
                    size="sm"
                  >
                    Cerrar Vista
                  </Button>
                </div>
                <iframe
                  src={fullUrl}
                  className="w-full border-0"
                  style={{ 
                    height: 'calc(100% - 57px)',
                    width: '100%',
                    maxWidth: '100%',
                    display: 'block',
                    boxSizing: 'border-box'
                  }}
                  title={fileName}
                  allow="fullscreen"
                />
              </div>
            ) : (
              <div className="w-full h-[600px] min-h-[500px] max-h-[800px] overflow-auto bg-gray-50 p-4">
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                  <div className="mb-4">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <FileText className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900">Archivo de Excel</h4>
                        <p className="text-xs text-gray-600">{fileName}</p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 mb-4">
                      Los archivos de Excel se pueden visualizar usando diferentes métodos. Selecciona la opción que prefieras.
                    </p>
                  </div>
                  <div className="space-y-3">
                    {/* Opción 1: Visualizar en iframe */}
                    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="text-sm font-medium text-gray-900 mb-1">Visualizar en el navegador</h5>
                          <p className="text-xs text-gray-600">Intenta abrir el archivo directamente en el modal</p>
                        </div>
                        <Button
                          onClick={() => setShowExcelViewer(true)}
                          variant="primary"
                          size="sm"
                        >
                          Ver Aquí
                        </Button>
                      </div>
                    </div>
                    
                    {/* Opción 2: Abrir en Office Online */}
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="text-sm font-medium text-gray-900 mb-1">Abrir en Office Online</h5>
                          <p className="text-xs text-gray-600">Visualiza el archivo usando Microsoft Office Online</p>
                        </div>
                        <Button
                          onClick={() => {
                            const officeViewerUrl = `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(fullUrl)}`
                            window.open(officeViewerUrl, '_blank')
                          }}
                          variant="outline"
                          size="sm"
                        >
                          Abrir Online
                        </Button>
                      </div>
                    </div>
                    
                    {/* Opción 3: Descargar */}
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="text-sm font-medium text-gray-900 mb-1">Descargar archivo</h5>
                          <p className="text-xs text-gray-600">Abre el archivo con Excel o aplicación compatible</p>
                        </div>
                        <Button
                          onClick={handleDownload}
                          variant="outline"
                          size="sm"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Descargar
                        </Button>
                      </div>
                    </div>

                    {/* Opción 4: Abrir directamente en nueva pestaña */}
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="text-sm font-medium text-gray-900 mb-1">Abrir en nueva pestaña</h5>
                          <p className="text-xs text-gray-600">Abre el archivo en una nueva pestaña del navegador</p>
                        </div>
                        <Button
                          onClick={() => window.open(fullUrl, '_blank')}
                          variant="outline"
                          size="sm"
                        >
                          Abrir
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Información adicional */}
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-xs text-blue-800">
                      <strong>Nota:</strong> Si tienes Microsoft Excel instalado, puedes hacer clic en "Descargar" y abrir el archivo directamente. 
                      También puedes usar "Abrir Online" para visualizarlo sin descargar o "Ver Aquí" para intentar visualizarlo en el modal.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )

      case 'document':
      case 'other':
      default:
        return (
          <div className="w-full flex flex-col items-center justify-center bg-gray-100 rounded-lg p-8 min-h-[400px]">
            <div className="bg-white rounded-lg p-8 shadow-lg text-center max-w-md">
              <FileText className="w-20 h-20 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {fileType === 'document' ? 'Documento no visualizable' : 'Archivo no visualizable'}
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                Este tipo de archivo no se puede visualizar directamente en el navegador.
                Por favor, descárgalo para abrirlo con una aplicación compatible.
              </p>
              <Button
                onClick={handleDownload}
                variant="primary"
                className="w-full"
              >
                <Download className="w-4 h-4 mr-2" />
                Descargar archivo
              </Button>
            </div>
          </div>
        )
    }
  }

  const getIcon = () => {
    switch (fileType) {
      case 'pdf':
        return <FileText className="w-5 h-5" />
      case 'image':
        return <Image className="w-5 h-5" />
      case 'video':
        return <Video className="w-5 h-5" />
      case 'audio':
        return <Music className="w-5 h-5" />
      case 'text':
        return <FileText className="w-5 h-5" />
      default:
        return <FileText className="w-5 h-5" />
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center space-x-2">
          {getIcon()}
          <span className="truncate">{fileName}</span>
        </div>
      }
      size="xl"
    >
      <div className="w-full" style={{ maxWidth: '100%', boxSizing: 'border-box' }}>
        {/* Barra de acciones */}
        <div className="flex justify-end mb-4 gap-2">
          <Button
            onClick={handleDownload}
            variant="outline"
            size="sm"
          >
            <Download className="w-4 h-4 mr-2" />
            Descargar
          </Button>
        </div>

        {/* Contenido del archivo */}
        <div 
          className="bg-white rounded-lg border border-gray-200 overflow-hidden"
          style={{ 
            width: '100%', 
            maxWidth: '100%',
            boxSizing: 'border-box',
            margin: '0 auto'
          }}
        >
          {renderContent()}
        </div>
      </div>
      <style>{`
        /* Asegurar que el iframe del PDF se ajuste correctamente */
        iframe[title="${fileName}"] {
          width: 100% !important;
          max-width: 100% !important;
          box-sizing: border-box !important;
        }
        /* Ajustar el contenido del modal para PDFs */
        .max-w-4xl {
          max-width: 95vw !important;
        }
        @media (min-width: 1280px) {
          .max-w-4xl {
            max-width: 90vw !important;
          }
        }
      `}</style>
    </Modal>
  )
}

