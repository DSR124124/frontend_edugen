import { Document } from '../../types/block-schema'
import { Card } from '../ui/Card'
import { Eye, X } from 'lucide-react'

interface PreviewModalProps {
  isOpen: boolean
  onClose: () => void
  onEdit: () => void
  document: Document | null
  title: string
}

export function PreviewModal({ 
  isOpen, 
  onClose, 
  onEdit, 
  document, 
  title 
}: PreviewModalProps) {
  if (!isOpen || !document) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      <div className="relative bg-white rounded-lg shadow-xl w-[95vw] h-[95vh] max-w-6xl flex flex-col">
        {/* Header del Modal */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-3">
            <Eye className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Vista Previa: {title}
            </h2>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={onEdit}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Editar
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Preview Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <Card className="p-6">
            <div className="prose max-w-none">
              {document.blocks.map((block, index) => (
                <div key={block.id || index} className="mb-4">
                  {block.type === 'hero' && (
                    <div className="text-center py-12 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg">
                      <h1 className="text-4xl font-bold mb-4">{block.title}</h1>
                      {block.subtitle && <p className="text-xl mb-4">{block.subtitle}</p>}
                      {block.body && <p className="text-lg">{block.body}</p>}
                    </div>
                  )}
                   {block.type === 'paragraph' && (
                     <>
                       {block.content === '' && block.props?.style === 'divider' ? (
                         <div className="flex items-center justify-center py-4">
                           <div className="flex-1 h-px bg-gray-300"></div>
                           <div className="px-4 text-gray-500 text-sm">Separador</div>
                           <div className="flex-1 h-px bg-gray-300"></div>
                         </div>
                       ) : block.props?.style === 'quote' ? (
                         <div className="border-l-4 border-blue-500 pl-4 italic text-gray-700">
                           <p>"{block.content}"</p>
                         </div>
                       ) : block.props?.style === 'code' ? (
                         <div className="bg-gray-100 p-4 rounded-lg">
                           <pre className="text-sm text-gray-800 font-mono whitespace-pre-wrap">{block.content}</pre>
                         </div>
                       ) : (
                         <p className="text-gray-700 leading-relaxed">{block.content}</p>
                       )}
                     </>
                   )}
                  {block.type === 'heading' && (
                    <h2 className="text-2xl font-bold text-gray-900 mt-6 mb-4">
                      {block.content}
                    </h2>
                  )}
                  {block.type === 'list' && (
                    <ul className="list-disc list-inside space-y-2">
                      {block.items.map((item: string, itemIndex: number) => (
                        <li key={itemIndex} className="text-gray-700">{item}</li>
                      ))}
                    </ul>
                  )}
                  {block.type === 'image' && (
                    <div className="text-center my-6">
                      {block.media?.src ? (
                        <div>
                          <img 
                            src={block.media.src} 
                            alt={block.media.alt || 'Imagen'} 
                            className="max-w-full max-h-96 mx-auto rounded-lg shadow-lg"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none'
                              e.currentTarget.nextElementSibling?.classList.remove('hidden')
                            }}
                          />
                          <div className="hidden text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                            <p className="text-gray-500">Imagen no disponible</p>
                            <p className="text-sm text-gray-400 mt-2">URL: {block.media.src}</p>
                          </div>
                          {block.media.alt && (
                            <p className="text-sm text-gray-600 mt-2 italic">{block.media.alt}</p>
                          )}
                        </div>
                      ) : (
                        <div className="py-8 border-2 border-dashed border-gray-300 rounded-lg">
                          <p className="text-gray-500">Imagen no disponible</p>
                        </div>
                      )}
                    </div>
                  )}
                  {block.type === 'callout' && (
                    <div className={`p-4 rounded-lg border-l-4 ${
                      block.variant === 'info' ? 'bg-blue-50 border-blue-400' :
                      block.variant === 'warning' ? 'bg-yellow-50 border-yellow-400' :
                      block.variant === 'success' ? 'bg-green-50 border-green-400' :
                      'bg-red-50 border-red-400'
                    }`}>
                      {block.title && <h3 className="font-semibold mb-2">{block.title}</h3>}
                      <p className="text-gray-700">{block.content}</p>
                    </div>
                  )}
                  {block.type === 'table' && (
                    <div className="my-6 overflow-x-auto">
                      <table className={`w-full border-collapse ${
                        block.striped ? 'table-striped' : ''
                      } ${block.bordered ? 'border border-gray-300' : ''} ${
                        block.hoverable ? 'table-hover' : ''
                      }`}>
                        <thead>
                          <tr className="bg-gray-50">
                            {block.tableData.headers.map((header, index) => (
                              <th key={index} className="px-4 py-2 text-left font-semibold text-gray-700 border-b">
                                {header}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {block.tableData.rows.map((row, rowIndex) => (
                            <tr key={rowIndex} className="hover:bg-gray-50">
                              {row.map((cell, cellIndex) => (
                                <td key={cellIndex} className="px-4 py-2 border-b text-gray-700">
                                  {cell}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  {block.type === 'video' && (
                    <div className="text-center my-6">
                      {block.media?.src ? (
                        <div>
                          <video 
                            src={block.media.src} 
                            controls
                            className="max-w-full max-h-96 mx-auto rounded-lg shadow-lg"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none'
                              e.currentTarget.nextElementSibling?.classList.remove('hidden')
                            }}
                          />
                          <div className="hidden text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                            <p className="text-gray-500">Video no disponible</p>
                            <p className="text-sm text-gray-400 mt-2">URL: {block.media.src}</p>
                          </div>
                          {block.media.alt && (
                            <p className="text-sm text-gray-600 mt-2 italic">{block.media.alt}</p>
                          )}
                        </div>
                      ) : (
                        <div className="py-8 border-2 border-dashed border-gray-300 rounded-lg">
                          <p className="text-gray-500">Video no disponible</p>
                        </div>
                      )}
                    </div>
                  )}
                  {block.type === 'code' && (
                    <div className="my-6">
                      <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto">
                        <code className="text-sm text-gray-800">{block.code}</code>
                      </pre>
                    </div>
                  )}
                  {/* Para bloques que no tienen renderizado específico */}
                  {!['hero', 'paragraph', 'heading', 'list', 'image', 'callout', 'table', 'video', 'code'].includes(block.type) && (
                    <div className="my-6 p-4 bg-gray-50 rounded-lg border-l-4 border-orange-400">
                      <p className="text-gray-600 text-sm">
                        <strong>Tipo de bloque:</strong> {block.type}
                      </p>
                      <p className="text-gray-500 text-xs mt-1">
                        Este tipo de bloque no tiene renderizado específico en la vista previa.
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
