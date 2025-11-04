import { useState, useEffect } from 'react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { GeneratedContent } from '../../api/endpoints'
import { FiDownload, FiLoader, FiCheckCircle, FiAlertCircle } from 'react-icons/fi'

interface ExportSCORMModalProps {
  isOpen: boolean
  onClose: () => void
  content: GeneratedContent | null
  onExport: (contentId: number, params: SCORMExportParams) => Promise<void>
}

export interface SCORMExportParams {
  version: '1.2' | '2004'
  title: string
  identifier: string
  description?: string
}

type ExportStep = 'select' | 'configure' | 'exporting' | 'success' | 'error'

export function ExportSCORMModal({
  isOpen,
  onClose,
  content,
  onExport
}: ExportSCORMModalProps) {
  const [step, setStep] = useState<ExportStep>('select')
  const [exportFormat, setExportFormat] = useState<'scorm' | ''>('')
  const [exportParams, setExportParams] = useState<SCORMExportParams>({
    version: '1.2',
    title: content?.title || '',
    identifier: `scorm_${Date.now()}`,
    description: content?.description || ''
  })
  const [errorMessage, setErrorMessage] = useState<string>('')

  // Resetear estado cuando se abre el modal o cambia el contenido
  useEffect(() => {
    if (isOpen && content) {
      setStep('select')
      setExportFormat('')
      setExportParams({
        version: '1.2',
        title: content.title || '',
        identifier: `scorm_${Date.now()}`,
        description: content.description || ''
      })
      setErrorMessage('')
    }
  }, [isOpen, content])

  // Resetear cuando se cierra
  const handleClose = () => {
    setStep('select')
    setExportFormat('')
    setErrorMessage('')
    onClose()
  }

  // Paso 1: Seleccionar formato SCORM
  const handleSelectFormat = (format: 'scorm') => {
    setExportFormat(format)
    setStep('configure')
  }

  // Paso 2: Configurar parámetros
  const handleConfigure = () => {
    if (!exportParams.title.trim()) {
      setErrorMessage('El título es obligatorio')
      return
    }
    setErrorMessage('')
    setStep('exporting')
  }

  // Ejecutar exportación cuando se llega al paso de exporting
  useEffect(() => {
    if (step === 'exporting' && exportFormat === 'scorm' && content) {
      const executeExport = async () => {
        try {
          setErrorMessage('')
          await onExport(content.id, exportParams)
          setStep('success')
        } catch (error) {
          setStep('error')
          setErrorMessage(error instanceof Error ? error.message : 'Error desconocido al exportar')
        }
      }
      executeExport()
    }
  }, [step, exportFormat, content, exportParams, onExport])

  if (!isOpen || !content) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Exportar Contenido"
      size="lg"
    >
      <div className="space-y-6">
        {/* Paso 1: Seleccionar Formato */}
        {step === 'select' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-base-content mb-2">
                Seleccionar Formato de Exportación
              </h3>
              <p className="text-sm text-base-content/70 mb-4">
                Elige el formato en el que deseas exportar tu contenido
              </p>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={() => handleSelectFormat('scorm')}
                className="w-full p-4 border-2 border-base-300 rounded-lg hover:border-primary hover:bg-primary-50 transition-all duration-200 text-left"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary-100 rounded-lg">
                    <FiDownload className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-base-content">SCORM</div>
                    <div className="text-sm text-base-content/70">
                      Estándar SCORM para plataformas LMS (Moodle, Blackboard, etc.)
                    </div>
                  </div>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Paso 2: Configurar Parámetros */}
        {step === 'configure' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-base-content mb-2">
                Configurar Parámetros de Exportación SCORM
              </h3>
              <p className="text-sm text-base-content/70 mb-4">
                Configura los parámetros específicos para el paquete SCORM
              </p>
            </div>

            <div className="space-y-4">
              <Input
                label="Título del Paquete SCORM"
                value={exportParams.title}
                onChange={(e) => setExportParams(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Ingrese el título del paquete"
                required
              />

              <Select
                label="Versión SCORM"
                value={exportParams.version}
                onChange={(e) => setExportParams(prev => ({ ...prev, version: e.target.value as '1.2' | '2004' }))}
                name="version"
                options={[
                  { value: '1.2', label: 'SCORM 1.2 (Recomendado)' },
                  { value: '2004', label: 'SCORM 2004' }
                ]}
              />

              <Input
                label="Identificador (ID)"
                value={exportParams.identifier}
                onChange={(e) => setExportParams(prev => ({ ...prev, identifier: e.target.value }))}
                placeholder="Identificador único del paquete"
                required
              />

              <div>
                <label className="block text-sm font-medium text-base-content mb-2">
                  Descripción (Opcional)
                </label>
                <textarea
                  value={exportParams.description || ''}
                  onChange={(e) => setExportParams(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descripción del paquete SCORM"
                  rows={3}
                  className="w-full px-3 py-2 border border-base-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              {errorMessage && (
                <div className="p-3 bg-error-50 border border-error-200 rounded-lg text-sm text-error">
                  {errorMessage}
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-base-300">
              <Button
                type="button"
                onClick={() => setStep('select')}
                variant="outline"
              >
                Atrás
              </Button>
              <Button
                type="button"
                onClick={handleConfigure}
                variant="primary"
                leftIcon={<FiDownload className="w-4 h-4" />}
              >
                Exportar/Generar SCORM
              </Button>
            </div>
          </div>
        )}

        {/* Paso 3: Procesando Exportación */}
        {step === 'exporting' && (
          <div className="space-y-4 text-center py-8">
            <div className="flex justify-center">
              <FiLoader className="w-12 h-12 text-primary animate-spin" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-base-content mb-2">
                Generando SCORM...
              </h3>
              <p className="text-sm text-base-content/70">
                Por favor espera mientras se genera tu paquete SCORM
              </p>
            </div>
            <div className="w-full bg-base-200 rounded-full h-2 overflow-hidden">
              <div className="bg-primary h-full rounded-full animate-pulse" style={{ width: '60%' }}></div>
            </div>
          </div>
        )}

        {/* Paso 4: Éxito */}
        {step === 'success' && (
          <div className="space-y-4 text-center py-8">
            <div className="flex justify-center">
              <div className="p-3 bg-success-100 rounded-full">
                <FiCheckCircle className="w-12 h-12 text-success" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-base-content mb-2">
                Paquete SCORM exportado exitosamente
              </h3>
              <p className="text-sm text-base-content/70">
                Tu paquete SCORM se ha descargado correctamente
              </p>
            </div>
            <div className="flex justify-center pt-4">
              <Button
                type="button"
                onClick={handleClose}
                variant="primary"
              >
                Cerrar
              </Button>
            </div>
          </div>
        )}

        {/* Paso 5: Error */}
        {step === 'error' && (
          <div className="space-y-4 text-center py-8">
            <div className="flex justify-center">
              <div className="p-3 bg-error-100 rounded-full">
                <FiAlertCircle className="w-12 h-12 text-error" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-base-content mb-2">
                Error al exportar
              </h3>
              <p className="text-sm text-base-content/70 mb-4">
                {errorMessage || 'Ocurrió un error al generar el paquete SCORM'}
              </p>
            </div>
            <div className="flex justify-center space-x-3 pt-4">
              <Button
                type="button"
                onClick={() => setStep('configure')}
                variant="outline"
              >
                Reintentar
              </Button>
              <Button
                type="button"
                onClick={handleClose}
                variant="primary"
              >
                Cerrar
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}

