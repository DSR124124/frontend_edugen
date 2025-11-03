import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Download, FileText, Image, Video, Music } from 'lucide-react'
import { getApiUrl } from '../../config/environment'

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
  const apiUrl = getApiUrl()
  const apiRoot = apiUrl.replace(/\/?api\/v1\/?$/, '')
  const fullUrl = fileUrl.startsWith('http') ? fileUrl : `${apiRoot}${fileUrl}`

  const getFileExtension = (url: string): string => {
    const match = url.match(/\.([^.]+)(\?|$)/)
    return match ? match[1].toLowerCase() : ''
  }

  const getFileType = (): 'pdf' | 'image' | 'video' | 'audio' | 'document' | 'other' => {
    const ext = getFileExtension(fileUrl)
    const mimeType = materialType?.toUpperCase()

    // Determinar tipo por extensión
    if (ext === 'pdf') return 'pdf'
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) return 'image'
    if (['mp4', 'webm', 'ogg'].includes(ext)) return 'video'
    if (['mp3', 'wav', 'ogg'].includes(ext)) return 'audio'
    if (['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(ext)) return 'document'

    // Determinar tipo por material_type
    if (mimeType === 'IMAGE') return 'image'
    if (mimeType === 'VIDEO') return 'video'
    if (mimeType === 'AUDIO') return 'audio'
    if (mimeType === 'DOCUMENT') return 'document'

    return 'other'
  }

  const fileType = getFileType()

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

