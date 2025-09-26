import { Document, FormBlock, QuizBlock, FlashcardBlock } from '../../types/block-schema'
import { Card } from '../ui/Card'
import { Eye, X } from 'lucide-react'

interface PreviewModalProps {
  isOpen: boolean
  onClose: () => void
  document: Document | null
  title: string
}

export function PreviewModal({ 
  isOpen, 
  onClose, 
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
                  {block.type === 'form' && (
                    <div className="my-6 p-6 bg-orange-50 border border-orange-200 rounded-lg">
                      <div className="bg-orange-100 px-4 py-2 border-b border-orange-200 font-semibold text-orange-800 mb-4">
                        📝 Formulario
                      </div>
                      {(() => {
                        const formBlock = block as FormBlock
                        return (
                          <div className="space-y-4">
                            {formBlock.title && (
                              <h3 className="text-lg font-semibold text-gray-800">{formBlock.title}</h3>
                            )}
                            {formBlock.description && (
                              <p className="text-gray-600">{formBlock.description}</p>
                            )}
                            <div className="space-y-3">
                              {formBlock.fields?.map((field) => (
                                <div key={field.id}>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {field.label}
                                    {field.required && <span className="text-red-500 ml-1">*</span>}
                                  </label>
                                  {field.type === 'textarea' ? (
                                    <textarea
                                      placeholder={field.placeholder}
                                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                      rows={3}
                                      disabled
                                    />
                                  ) : (
                                    <input
                                      type={field.type}
                                      placeholder={field.placeholder}
                                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                      disabled
                                    />
                                  )}
                                </div>
                              ))}
                            </div>
                            <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700">
                              Enviar
                            </button>
                          </div>
                        )
                      })()}
                    </div>
                  )}
                  {block.type === 'quiz' && (
                    <div className="my-6 p-6 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="bg-blue-100 px-4 py-2 border-b border-blue-200 font-semibold text-blue-800 mb-4">
                        ❓ Quiz
                      </div>
                      {(() => {
                        const quizBlock = block as QuizBlock
                        return (
                          <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-800">{quizBlock.question}</h3>
                            <div className="space-y-2">
                              {quizBlock.options.map((option, index) => (
                                <label key={index} className="flex items-center space-x-2 cursor-pointer">
                                  <input
                                    type="radio"
                                    name={`quiz-${block.id}`}
                                    className="text-blue-600 focus:ring-blue-500"
                                    disabled
                                  />
                                  <span className="text-gray-700">{option}</span>
                                </label>
                              ))}
                            </div>
                            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                              Enviar respuesta
                            </button>
                            {quizBlock.explanation && (
                              <div className="mt-4 p-3 bg-blue-100 rounded-lg">
                                <p className="text-sm text-blue-800">
                                  <strong>Explicación:</strong> {quizBlock.explanation}
                                </p>
                              </div>
                            )}
                            {quizBlock.points && (
                              <div className="text-sm text-gray-600">
                                Puntos: {quizBlock.points}
                              </div>
                            )}
                          </div>
                        )
                      })()}
                    </div>
                  )}
                  {block.type === 'flashcard' && (
                    <div className="my-6 p-6 bg-green-50 border border-green-200 rounded-lg">
                      <div className="bg-green-100 px-4 py-2 border-b border-green-200 font-semibold text-green-800 mb-4 flex items-center justify-between">
                        <span>🃏 Tarjeta de Memoria</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs bg-green-200 px-2 py-1 rounded">
                            {(block as FlashcardBlock).category || 'General'}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded ${
                            (block as FlashcardBlock).difficulty === 'easy' ? 'bg-green-200' :
                            (block as FlashcardBlock).difficulty === 'medium' ? 'bg-yellow-200' :
                            'bg-red-200'
                          }`}>
                            {(block as FlashcardBlock).difficulty === 'easy' ? 'Fácil' :
                             (block as FlashcardBlock).difficulty === 'medium' ? 'Medio' : 'Difícil'}
                          </span>
                        </div>
                      </div>
                      {(() => {
                        const flashcardBlock = block as FlashcardBlock
                        return (
                          <div className="space-y-4">
                            {/* Tarjeta estática mostrando ambos lados */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="bg-white p-4 rounded-lg border-2 border-green-300">
                                <div className="text-sm text-green-600 mb-2 font-medium">FRENTE</div>
                                <div className="text-lg font-semibold text-gray-800">
                                  {flashcardBlock.front}
                                </div>
                              </div>
                              <div className="bg-white p-4 rounded-lg border-2 border-green-300">
                                <div className="text-sm text-green-600 mb-2 font-medium">REVERSO</div>
                                <div className="text-lg font-semibold text-gray-800">
                                  {flashcardBlock.back}
                                </div>
                              </div>
                            </div>
                            
                            {/* Tags si existen */}
                            {flashcardBlock.tags && flashcardBlock.tags.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {flashcardBlock.tags.map((tag, index) => (
                                  <span key={index} className="px-2 py-1 bg-green-200 text-green-800 text-xs rounded">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        )
                      })()}
                    </div>
                  )}
                  {/* Para bloques que no tienen renderizado específico */}
                  {!['hero', 'paragraph', 'heading', 'list', 'image', 'callout', 'table', 'video', 'code', 'form', 'quiz', 'flashcard'].includes(block.type) && (
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
