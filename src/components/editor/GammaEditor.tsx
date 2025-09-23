import { useState, useCallback, useEffect, memo } from 'react'
import { Document, Block, createBlock, HeroBlock, HeadingBlock, ImageBlock, ListBlock, CalloutBlock, ParagraphBlock, BlockMedia, BlockProps } from '../../types/block-schema'
import { ContextualToolbar } from './ContextualToolbar'
import { BlockSelector } from './BlockSelector'
import { useDocumentHistory } from '../../hooks/useDocumentHistory'
import { createBlockByType, BlockType } from './BlockTools'
import { 
  Menu,
  X
} from 'lucide-react'

// Función para comprimir imágenes
const compressImage = (dataUrl: string, maxWidth: number, maxHeight: number): Promise<string> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new window.Image()
    
    img.onload = () => {
      // Calcular nuevas dimensiones manteniendo la proporción
      let { width, height } = img
      
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height
          height = maxHeight
        }
      }
      
      canvas.width = width
      canvas.height = height
      
      // Dibujar imagen redimensionada
      ctx?.drawImage(img, 0, 0, width, height)
      
      // Convertir a base64 con compresión
      const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8)
      resolve(compressedDataUrl)
    }
    
    img.src = dataUrl
  })
}

interface GammaEditorProps {
  document?: Document
  onSave?: (document: Document) => void
  onUpdate?: (document: Document) => void
  readOnly?: boolean
  enableAI?: boolean
  className?: string
}

interface BlockComponentProps {
  block: Block
  isSelected: boolean
  isNewlyAdded: boolean
  readOnly: boolean
  enableAI: boolean
  isLoading: boolean
  onSelect: (blockId: string) => void
  onUpdateContent: (blockId: string, content: string) => void
  onUpdateCalloutTitle: (blockId: string, title: string) => void
  onUpdateImageProperties: (blockId: string, media: { src: string; alt: string }) => void
  onUpdateVideoProperties: (blockId: string, media: { src: string; alt: string }) => void
  onUpdateListItems: (blockId: string, items: string[]) => void
  onUpdateTableData: (blockId: string, tableData: { headers: string[]; rows: string[][] }) => void
  onBlockAction: (action: string, blockId: string) => void
  onAIAction: (action: string, prompt: string) => void
  openAccordions: Set<string>
  onToggleAccordion: (blockId: string) => void
}

// Memoized BlockComponent to prevent unnecessary re-renders
const BlockComponent = memo<BlockComponentProps>(({
  block,
  isSelected,
  isNewlyAdded,
  readOnly,
  enableAI,
  isLoading,
  onSelect,
  onUpdateContent,
  onUpdateCalloutTitle,
  onUpdateImageProperties,
  onUpdateVideoProperties,
  onUpdateListItems,
  onUpdateTableData,
  onBlockAction,
  onAIAction,
  openAccordions,
  onToggleAccordion
}) => {
  return (
    <div
      className={`relative group ${
        isSelected ? 'ring-2 ring-blue-500' : ''
      } ${
        isNewlyAdded ? 'ring-2 ring-green-500 bg-green-50 animate-pulse' : ''
      } transition-all duration-200`}
      onClick={() => onSelect(block.id)}
    >
      {block.type === 'hero' && (
        <div className={`text-center py-12 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg ${block.props?.padding === 'medium' ? 'p-6' : ''}`}>
          <h1 className="text-4xl font-bold mb-4">{block.title}</h1>
          {block.subtitle && <p className="text-xl mb-4">{block.subtitle}</p>}
          {block.body && <p className="text-lg">{block.body}</p>}
        </div>
      )}

      {block.type === 'paragraph' && (
        <div className={`${block.props?.padding === 'medium' ? 'p-4' : ''}`}>
          {block.content === '' && block.props?.style === 'divider' ? (
            // Renderizar como separador
            <div className="flex items-center justify-center py-4">
              <div className="flex-1 h-px bg-gray-300"></div>
              <div className="px-4 text-gray-500 text-sm">Separador</div>
              <div className="flex-1 h-px bg-gray-300"></div>
            </div>
          ) : block.content === '' && block.props?.style === 'quote' ? (
            // Renderizar como cita
            <div className="border-l-4 border-blue-500 pl-4 italic text-gray-700">
              <textarea
                value={block.content}
                onChange={(e) => onUpdateContent(block.id, e.target.value)}
                className="w-full min-h-[60px] p-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent italic"
                placeholder="Escribe tu cita aquí..."
              />
            </div>
          ) : block.props?.style === 'accordion' ? (
            // Renderizar como acordeón interactivo
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div 
                className="bg-gray-50 px-4 py-3 border-b border-gray-200 font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors flex items-center justify-between"
                onClick={() => onToggleAccordion(block.id)}
              >
                <span className="flex items-center space-x-2">
                  <span>📁</span>
                  <span>Acordeón</span>
                </span>
                <span className={`transform transition-transform duration-200 ${openAccordions.has(block.id) ? 'rotate-180' : ''}`}>
                  ▼
                </span>
              </div>
              <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
                openAccordions.has(block.id) ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
              }`}>
                <div className="p-4">
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Título del acordeón:</label>
                      <input
                        type="text"
                        value={block.content.split('\n')[0] || ''}
                        onChange={(e) => {
                          const lines = block.content.split('\n')
                          lines[0] = e.target.value
                          onUpdateContent(block.id, lines.join('\n'))
                        }}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Título del acordeón..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Contenido:</label>
                      <textarea
                        value={block.content.split('\n').slice(1).join('\n')}
                        onChange={(e) => {
                          const title = block.content.split('\n')[0] || ''
                          onUpdateContent(block.id, `${title}\n${e.target.value}`)
                        }}
                        className="w-full min-h-[100px] p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Contenido del acordeón..."
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : block.props?.style === 'tabs' ? (
            // Renderizar como pestañas
            <div className="border border-gray-200 rounded-lg">
              <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 font-semibold text-gray-700">
                📑 Pestañas
              </div>
              <div className="p-4">
                <textarea
                  value={block.content}
                  onChange={(e) => onUpdateContent(block.id, e.target.value)}
                  className="w-full min-h-[100px] p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Contenido de las pestañas..."
                />
              </div>
            </div>
          ) : block.props?.style === 'quiz' ? (
            // Renderizar como quiz
            <div className="border border-blue-200 rounded-lg bg-blue-50">
              <div className="bg-blue-100 px-4 py-2 border-b border-blue-200 font-semibold text-blue-800">
                ❓ Quiz
              </div>
              <div className="p-4">
                <textarea
                  value={block.content}
                  onChange={(e) => onUpdateContent(block.id, e.target.value)}
                  className="w-full min-h-[120px] p-3 border border-blue-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Pregunta: ¿Cuál es la respuesta correcta?&#10;&#10;A) Opción 1&#10;B) Opción 2&#10;C) Opción 3&#10;D) Opción 4"
                />
              </div>
            </div>
          ) : block.props?.style === 'flashcard' ? (
            // Renderizar como tarjeta de memoria
            <div className="border border-green-200 rounded-lg bg-green-50">
              <div className="bg-green-100 px-4 py-2 border-b border-green-200 font-semibold text-green-800">
                🃏 Tarjeta de Memoria
              </div>
              <div className="p-4">
                <textarea
                  value={block.content}
                  onChange={(e) => onUpdateContent(block.id, e.target.value)}
                  className="w-full min-h-[120px] p-3 border border-green-300 rounded-lg resize-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Frente: Término o concepto&#10;&#10;Reverso: Definición o explicación"
                />
              </div>
            </div>
          ) : block.props?.style === 'poll' ? (
            // Renderizar como encuesta
            <div className="border border-purple-200 rounded-lg bg-purple-50">
              <div className="bg-purple-100 px-4 py-2 border-b border-purple-200 font-semibold text-purple-800">
                📊 Encuesta
              </div>
              <div className="p-4">
                <textarea
                  value={block.content}
                  onChange={(e) => onUpdateContent(block.id, e.target.value)}
                  className="w-full min-h-[100px] p-3 border border-purple-300 rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Pregunta de la encuesta:&#10;&#10;• Opción 1&#10;• Opción 2&#10;• Opción 3"
                />
              </div>
            </div>
          ) : block.props?.style === 'form' ? (
            // Renderizar como formulario
            <div className="border border-orange-200 rounded-lg bg-orange-50">
              <div className="bg-orange-100 px-4 py-2 border-b border-orange-200 font-semibold text-orange-800">
                📝 Formulario
              </div>
              <div className="p-4">
                <textarea
                  value={block.content}
                  onChange={(e) => onUpdateContent(block.id, e.target.value)}
                  className="w-full min-h-[100px] p-3 border border-orange-300 rounded-lg resize-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Formulario:&#10;&#10;Nombre: _____________&#10;Email: _____________&#10;Mensaje: _____________"
                />
              </div>
            </div>
          ) : block.props?.style === 'carousel' ? (
            // Renderizar como carrusel
            <div className="border border-indigo-200 rounded-lg bg-indigo-50">
              <div className="bg-indigo-100 px-4 py-2 border-b border-indigo-200 font-semibold text-indigo-800">
                🎠 Carrusel
              </div>
              <div className="p-4">
                <textarea
                  value={block.content}
                  onChange={(e) => onUpdateContent(block.id, e.target.value)}
                  className="w-full min-h-[100px] p-3 border border-indigo-300 rounded-lg resize-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Carrusel de imágenes:&#10;&#10;Imagen 1: Descripción&#10;Imagen 2: Descripción&#10;Imagen 3: Descripción"
                />
              </div>
            </div>
          ) : block.props?.style === 'gallery' ? (
            // Renderizar como galería
            <div className="border border-teal-200 rounded-lg bg-teal-50">
              <div className="bg-teal-100 px-4 py-2 border-b border-teal-200 font-semibold text-teal-800">
                🖼️ Galería
              </div>
              <div className="p-4">
                <textarea
                  value={block.content}
                  onChange={(e) => onUpdateContent(block.id, e.target.value)}
                  className="w-full min-h-[100px] p-3 border border-teal-300 rounded-lg resize-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="Galería de imágenes:&#10;&#10;• Imagen 1: Descripción&#10;• Imagen 2: Descripción&#10;• Imagen 3: Descripción"
                />
              </div>
            </div>
          ) : block.props?.style === 'embed' ? (
            // Renderizar como embed
            <div className="border border-gray-200 rounded-lg bg-gray-50">
              <div className="bg-gray-100 px-4 py-2 border-b border-gray-200 font-semibold text-gray-800">
                🔗 Embed
              </div>
              <div className="p-4">
                <textarea
                  value={block.content}
                  onChange={(e) => onUpdateContent(block.id, e.target.value)}
                  className="w-full min-h-[100px] p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  placeholder="Contenido embebido:&#10;&#10;URL: https://ejemplo.com&#10;Título: Contenido embebido&#10;Descripción: Descripción del contenido"
                />
              </div>
            </div>
          ) : block.props?.style === 'audio' ? (
            // Renderizar como audio
            <div className="border border-pink-200 rounded-lg bg-pink-50">
              <div className="bg-pink-100 px-4 py-2 border-b border-pink-200 font-semibold text-pink-800">
                🎵 Audio
              </div>
              <div className="p-4">
                <textarea
                  value={block.content}
                  onChange={(e) => onUpdateContent(block.id, e.target.value)}
                  className="w-full min-h-[100px] p-3 border border-pink-300 rounded-lg resize-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="Archivo de audio:&#10;&#10;Título: Nombre del audio&#10;Duración: 00:00&#10;Descripción: Descripción del contenido de audio"
                />
              </div>
            </div>
          ) : block.props?.style === 'slideshow' ? (
            // Renderizar como presentación
            <div className="border border-cyan-200 rounded-lg bg-cyan-50">
              <div className="bg-cyan-100 px-4 py-2 border-b border-cyan-200 font-semibold text-cyan-800">
                📊 Presentación
              </div>
              <div className="p-4">
                <textarea
                  value={block.content}
                  onChange={(e) => onUpdateContent(block.id, e.target.value)}
                  className="w-full min-h-[100px] p-3 border border-cyan-300 rounded-lg resize-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  placeholder="Presentación:&#10;&#10;Diapositiva 1: Título y contenido&#10;Diapositiva 2: Título y contenido&#10;Diapositiva 3: Título y contenido"
                />
              </div>
            </div>
          ) : block.props?.style === 'card' ? (
            // Renderizar como tarjeta
            <div className="border border-slate-200 rounded-lg bg-slate-50 shadow-sm">
              <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 font-semibold text-slate-800">
                🃏 Tarjeta
              </div>
              <div className="p-4">
                <textarea
                  value={block.content}
                  onChange={(e) => onUpdateContent(block.id, e.target.value)}
                  className="w-full min-h-[100px] p-3 border border-slate-300 rounded-lg resize-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                  placeholder="Tarjeta de contenido:&#10;&#10;Título: Título de la tarjeta&#10;Contenido: Descripción o información importante&#10;Acción: Botón o enlace opcional"
                />
              </div>
            </div>
          ) : block.props?.style === 'spacer' ? (
            // Renderizar como espaciador
            <div className="py-8 text-center text-gray-400">
              <div className="border-t border-gray-200 pt-4">
                <span className="text-sm">Espaciador</span>
              </div>
            </div>
          ) : block.props?.style === 'columns' ? (
            // Renderizar como columnas
            <div className="border border-amber-200 rounded-lg bg-amber-50">
              <div className="bg-amber-100 px-4 py-2 border-b border-amber-200 font-semibold text-amber-800">
                📰 Columnas
              </div>
              <div className="p-4">
                <textarea
                  value={block.content}
                  onChange={(e) => onUpdateContent(block.id, e.target.value)}
                  className="w-full min-h-[100px] p-3 border border-amber-300 rounded-lg resize-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="Contenido en columnas:&#10;&#10;Columna 1: Contenido de la primera columna&#10;Columna 2: Contenido de la segunda columna&#10;Columna 3: Contenido de la tercera columna"
                />
              </div>
            </div>
          ) : block.props?.style === 'highlight' ? (
            // Renderizar como resaltado
            <div className="border border-yellow-200 rounded-lg bg-yellow-50">
              <div className="bg-yellow-100 px-4 py-2 border-b border-yellow-200 font-semibold text-yellow-800">
                ⭐ Resaltado
              </div>
              <div className="p-4">
                <textarea
                  value={block.content}
                  onChange={(e) => onUpdateContent(block.id, e.target.value)}
                  className="w-full min-h-[80px] p-3 border border-yellow-300 rounded-lg resize-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent font-semibold"
                  placeholder="Texto resaltado importante que llama la atención del estudiante"
                />
              </div>
            </div>
          ) : block.props?.style === 'math' ? (
            // Renderizar como matemáticas
            <div className="border border-red-200 rounded-lg bg-red-50">
              <div className="bg-red-100 px-4 py-2 border-b border-red-200 font-semibold text-red-800">
                🧮 Matemáticas
              </div>
              <div className="p-4">
                <textarea
                  value={block.content}
                  onChange={(e) => onUpdateContent(block.id, e.target.value)}
                  className="w-full min-h-[100px] p-3 border border-red-300 rounded-lg resize-none focus:ring-2 focus:ring-red-500 focus:border-transparent font-mono"
                  placeholder="Fórmula matemática:&#10;&#10;Ejemplo: E = mc²&#10;&#10;Otra fórmula: a² + b² = c²"
                />
              </div>
            </div>
          ) : block.props?.style === 'timeline' ? (
            // Renderizar como línea de tiempo
            <div className="border border-emerald-200 rounded-lg bg-emerald-50">
              <div className="bg-emerald-100 px-4 py-2 border-b border-emerald-200 font-semibold text-emerald-800">
                ⏰ Línea de Tiempo
              </div>
              <div className="p-4">
                <textarea
                  value={block.content}
                  onChange={(e) => onUpdateContent(block.id, e.target.value)}
                  className="w-full min-h-[100px] p-3 border border-emerald-300 rounded-lg resize-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Línea de tiempo:&#10;&#10;1900: Evento importante&#10;1950: Otro evento&#10;2000: Evento reciente&#10;2024: Evento actual"
                />
              </div>
            </div>
          ) : block.props?.style === 'chart' ? (
            // Renderizar como gráfico
            <div className="border border-violet-200 rounded-lg bg-violet-50">
              <div className="bg-violet-100 px-4 py-2 border-b border-violet-200 font-semibold text-violet-800">
                📈 Gráfico
              </div>
              <div className="p-4">
                <textarea
                  value={block.content}
                  onChange={(e) => onUpdateContent(block.id, e.target.value)}
                  className="w-full min-h-[100px] p-3 border border-violet-300 rounded-lg resize-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  placeholder="Gráfico:&#10;&#10;Título: Nombre del gráfico&#10;Tipo: Barras, líneas, circular&#10;Datos: Información a mostrar"
                />
              </div>
            </div>
          ) : block.props?.style === 'map' ? (
            // Renderizar como mapa
            <div className="border border-lime-200 rounded-lg bg-lime-50">
              <div className="bg-lime-100 px-4 py-2 border-b border-lime-200 font-semibold text-lime-800">
                🗺️ Mapa
              </div>
              <div className="p-4">
                <textarea
                  value={block.content}
                  onChange={(e) => onUpdateContent(block.id, e.target.value)}
                  className="w-full min-h-[100px] p-3 border border-lime-300 rounded-lg resize-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
                  placeholder="Mapa interactivo:&#10;&#10;Ubicación: Ciudad, país&#10;Tipo: Físico, político, temático&#10;Descripción: Información del mapa"
                />
              </div>
            </div>
          ) : block.props?.style === 'button' ? (
            // Renderizar como botón
            <div className="border border-indigo-200 rounded-lg bg-indigo-50">
              <div className="bg-indigo-100 px-4 py-2 border-b border-indigo-200 font-semibold text-indigo-800">
                🔘 Botón
              </div>
              <div className="p-4">
                <textarea
                  value={block.content}
                  onChange={(e) => onUpdateContent(block.id, e.target.value)}
                  className="w-full min-h-[100px] p-3 border border-indigo-300 rounded-lg resize-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Botón de acción:&#10;&#10;Texto: Hacer clic aquí&#10;Acción: Enlace o función&#10;Estilo: Primario, secundario, outline"
                />
              </div>
            </div>
          ) : block.props?.style === 'stats' ? (
            // Renderizar como estadísticas
            <div className="border border-emerald-200 rounded-lg bg-emerald-50">
              <div className="bg-emerald-100 px-4 py-2 border-b border-emerald-200 font-semibold text-emerald-800">
                📊 Estadísticas
              </div>
              <div className="p-4">
                <textarea
                  value={block.content}
                  onChange={(e) => onUpdateContent(block.id, e.target.value)}
                  className="w-full min-h-[100px] p-3 border border-emerald-300 rounded-lg resize-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Estadísticas:&#10;&#10;Métrica 1: Valor con descripción&#10;Métrica 2: Valor con descripción&#10;Métrica 3: Valor con descripción"
                />
              </div>
            </div>
          ) : block.props?.style === 'testimonial' ? (
            // Renderizar como testimonio
            <div className="border border-amber-200 rounded-lg bg-amber-50">
              <div className="bg-amber-100 px-4 py-2 border-b border-amber-200 font-semibold text-amber-800">
                💬 Testimonio
              </div>
              <div className="p-4">
                <textarea
                  value={block.content}
                  onChange={(e) => onUpdateContent(block.id, e.target.value)}
                  className="w-full min-h-[100px] p-3 border border-amber-300 rounded-lg resize-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="Testimonio:&#10;&#10;&quot;Esta es una cita de testimonio que destaca la experiencia del usuario.&quot;&#10;&#10;- Nombre del usuario, Cargo"
                />
              </div>
            </div>
          ) : block.props?.style === 'pricing' ? (
            // Renderizar como precios
            <div className="border border-rose-200 rounded-lg bg-rose-50">
              <div className="bg-rose-100 px-4 py-2 border-b border-rose-200 font-semibold text-rose-800">
                💰 Precios
              </div>
              <div className="p-4">
                <textarea
                  value={block.content}
                  onChange={(e) => onUpdateContent(block.id, e.target.value)}
                  className="w-full min-h-[100px] p-3 border border-rose-300 rounded-lg resize-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  placeholder="Tabla de precios:&#10;&#10;Plan Básico: $10/mes - Características incluidas&#10;Plan Pro: $25/mes - Más características&#10;Plan Premium: $50/mes - Todas las características"
                />
              </div>
            </div>
          ) : block.props?.style === 'faq' ? (
            // Renderizar como FAQ
            <div className="border border-sky-200 rounded-lg bg-sky-50">
              <div className="bg-sky-100 px-4 py-2 border-b border-sky-200 font-semibold text-sky-800">
                ❓ FAQ
              </div>
              <div className="p-4">
                <textarea
                  value={block.content}
                  onChange={(e) => onUpdateContent(block.id, e.target.value)}
                  className="w-full min-h-[100px] p-3 border border-sky-300 rounded-lg resize-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  placeholder="Preguntas frecuentes:&#10;&#10;P: ¿Pregunta frecuente 1?&#10;R: Respuesta detallada aquí.&#10;&#10;P: ¿Pregunta frecuente 2?&#10;R: Otra respuesta detallada."
                />
              </div>
            </div>
          ) : block.props?.style === 'contact' ? (
            // Renderizar como contacto
            <div className="border border-teal-200 rounded-lg bg-teal-50">
              <div className="bg-teal-100 px-4 py-2 border-b border-teal-200 font-semibold text-teal-800">
                📞 Contacto
              </div>
              <div className="p-4">
                <textarea
                  value={block.content}
                  onChange={(e) => onUpdateContent(block.id, e.target.value)}
                  className="w-full min-h-[100px] p-3 border border-teal-300 rounded-lg resize-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="Información de contacto:&#10;&#10;Teléfono: +1 (555) 123-4567&#10;Email: contacto@ejemplo.com&#10;Dirección: 123 Calle Principal, Ciudad"
                />
              </div>
            </div>
          ) : block.props?.style === 'alert' ? (
            // Renderizar como alerta
            <div className="border border-red-200 rounded-lg bg-red-50">
              <div className="bg-red-100 px-4 py-2 border-b border-red-200 font-semibold text-red-800">
                ⚠️ Alerta
              </div>
              <div className="p-4">
                <textarea
                  value={block.content}
                  onChange={(e) => onUpdateContent(block.id, e.target.value)}
                  className="w-full min-h-[100px] p-3 border border-red-300 rounded-lg resize-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Alerta importante:&#10;&#10;Este es un mensaje de alerta que requiere atención inmediata del usuario."
                />
              </div>
            </div>
          ) : block.props?.style === 'progress' ? (
            // Renderizar como progreso
            <div className="border border-purple-200 rounded-lg bg-purple-50">
              <div className="bg-purple-100 px-4 py-2 border-b border-purple-200 font-semibold text-purple-800">
                📈 Progreso
              </div>
              <div className="p-4">
                <textarea
                  value={block.content}
                  onChange={(e) => onUpdateContent(block.id, e.target.value)}
                  className="w-full min-h-[100px] p-3 border border-purple-300 rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Barra de progreso:&#10;&#10;Tarea 1: 75% completado&#10;Tarea 2: 50% completado&#10;Tarea 3: 25% completado"
                />
              </div>
            </div>
          ) : (
            // Renderizar como párrafo normal
            <textarea
              value={block.content}
              onChange={(e) => onUpdateContent(block.id, e.target.value)}
              className="w-full min-h-[100px] p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Escribe tu párrafo aquí..."
            />
          )}
        </div>
      )}

      {block.type === 'heading' && (
        <div className={`${block.props?.padding === 'medium' ? 'p-4' : ''}`}>
          <input
            type="text"
            value={block.content}
            onChange={(e) => onUpdateContent(block.id, e.target.value)}
            className="w-full text-2xl font-bold border-none outline-none bg-transparent"
            placeholder="Escribe tu encabezado aquí..."
          />
        </div>
      )}

      {block.type === 'image' && (
        <div className={`${block.props?.padding === 'medium' ? 'p-4' : ''}`}>
          <div 
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors"
            onDragOver={(e) => {
              e.preventDefault()
              e.currentTarget.classList.add('border-blue-400', 'bg-blue-50')
            }}
            onDragLeave={(e) => {
              e.currentTarget.classList.remove('border-blue-400', 'bg-blue-50')
            }}
            onDrop={(e) => {
              e.preventDefault()
              e.currentTarget.classList.remove('border-blue-400', 'bg-blue-50')
              
              const files = Array.from(e.dataTransfer.files)
              const imageFile = files.find(file => file.type.startsWith('image/'))
              
              if (imageFile) {
                const reader = new FileReader()
                reader.onload = async (event) => {
                  const imageUrl = event.target?.result as string
                  
                  // Comprimir imagen si es muy grande
                  const compressedUrl = await compressImage(imageUrl, 800, 600)
                  
                  onUpdateImageProperties(block.id, {
                    src: compressedUrl,
                    alt: block.media?.alt || imageFile.name
                  })
                }
                reader.readAsDataURL(imageFile)
              }
            }}
          >
            {block.media?.src && !block.media.src.startsWith('data:') && !block.media.src.startsWith('http') ? (
              // Mostrar placeholder si no es una imagen válida
              <div>
                <div className="w-12 h-12 mx-auto text-gray-400 mb-4 flex items-center justify-center">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-gray-500 mb-2">Arrastra una imagen aquí</p>
              </div>
            ) : block.media?.src ? (
              // Mostrar imagen real
              <div>
                <img 
                  src={block.media.src} 
                  alt={block.media.alt || 'Imagen'} 
                  className="max-w-full max-h-64 mx-auto rounded-lg mb-4"
                  onError={(e) => {
                    // Si la imagen falla al cargar, mostrar placeholder
                    e.currentTarget.style.display = 'none'
                    e.currentTarget.nextElementSibling?.classList.remove('hidden')
                  }}
                />
                <div className="hidden">
                  <div className="w-12 h-12 mx-auto text-gray-400 mb-4 flex items-center justify-center">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                  <p className="text-gray-500 mb-2">Arrastra una imagen aquí</p>
                </div>
              </div>
            ) : (
              // Mostrar placeholder por defecto
              <div>
                <div className="w-12 h-12 mx-auto text-gray-400 mb-4 flex items-center justify-center">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-gray-500 mb-2">Arrastra una imagen aquí</p>
              </div>
            )}
            
            <div className="space-y-2">
              <input
                type="text"
                value={block.media?.alt || ''}
                onChange={(e) => onUpdateImageProperties(block.id, { 
                  src: block.media?.src || '', 
                  alt: e.target.value 
                })}
                className="w-full text-center text-gray-500 border-none outline-none bg-transparent"
                placeholder="Título de la imagen..."
              />
              <input
                type="text"
                value={block.media?.src || ''}
                onChange={(e) => onUpdateImageProperties(block.id, { 
                  src: e.target.value, 
                  alt: block.media?.alt || '' 
                })}
                className="w-full text-center text-sm text-gray-400 border-none outline-none bg-transparent"
                placeholder="URL de la imagen..."
              />
              <div className="flex flex-col items-center space-y-2">
                <p className="text-xs text-gray-400">O arrastra una imagen desde tu computadora</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      const reader = new FileReader()
                      reader.onload = async (event) => {
                        const imageUrl = event.target?.result as string
                        
                        // Comprimir imagen si es muy grande
                        const compressedUrl = await compressImage(imageUrl, 800, 600)
                        
                        onUpdateImageProperties(block.id, {
                          src: compressedUrl,
                          alt: block.media?.alt || file.name
                        })
                      }
                      reader.readAsDataURL(file)
                    }
                  }}
                  className="hidden"
                  id={`file-input-${block.id}`}
                />
                <button
                  onClick={() => document.getElementById(`file-input-${block.id}`)?.click()}
                  className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                  Seleccionar archivo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {block.type === 'list' && (
        <div className={`${block.props?.padding === 'medium' ? 'p-4' : ''}`}>
          <div className="space-y-2">
            {block.items.map((item, index) => (
              <div key={index} className="flex items-center space-x-2">
                <span className="text-gray-400">•</span>
                <input
                  type="text"
                  value={item}
                  onChange={(e) => {
                    const newItems = [...block.items]
                    newItems[index] = e.target.value
                    onUpdateListItems(block.id, newItems)
                  }}
                  className="flex-1 text-gray-700 border-none outline-none bg-transparent"
                  placeholder="Elemento de la lista..."
                />
                <button
                  onClick={() => {
                    const newItems = block.items.filter((_, i) => i !== index)
                    onUpdateListItems(block.id, newItems)
                  }}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  ×
                </button>
              </div>
            ))}
            <button
              onClick={() => {
                const newItems = [...block.items, 'Nuevo elemento']
                onUpdateListItems(block.id, newItems)
              }}
              className="text-blue-500 hover:text-blue-700 text-sm"
            >
              + Agregar elemento
            </button>
          </div>
        </div>
      )}

      {block.type === 'callout' && (
        <div className={`p-4 rounded-lg border-l-4 ${
          block.variant === 'info' ? 'bg-blue-50 border-blue-400' :
          block.variant === 'warning' ? 'bg-yellow-50 border-yellow-400' :
          block.variant === 'success' ? 'bg-green-50 border-green-400' :
          'bg-red-50 border-red-400'
        }`}>
          <input
            type="text"
            value={block.title || ''}
            onChange={(e) => onUpdateCalloutTitle(block.id, e.target.value)}
            className="w-full font-semibold mb-2 border-none outline-none bg-transparent"
            placeholder="Título del callout (opcional)..."
          />
          <textarea
            value={block.content}
            onChange={(e) => onUpdateContent(block.id, e.target.value)}
            className="w-full text-gray-700 border-none outline-none bg-transparent resize-none"
            placeholder="Contenido del callout..."
            rows={3}
          />
        </div>
      )}

      {block.type === 'table' && (
        <div className={`${block.props?.padding === 'medium' ? 'p-4' : ''}`}>
          <div className="overflow-x-auto">
            <table className={`w-full border-collapse ${
              block.striped ? 'table-striped' : ''
            } ${block.bordered ? 'border border-gray-300' : ''} ${
              block.hoverable ? 'table-hover' : ''
            }`}>
              <thead>
                <tr className="bg-gray-50">
                  {block.tableData.headers.map((header, index) => (
                    <th key={index} className="px-4 py-2 text-left font-semibold text-gray-700 border-b">
                      <input
                        type="text"
                        value={header}
                        onChange={(e) => {
                          const newHeaders = [...block.tableData.headers]
                          newHeaders[index] = e.target.value
                          onUpdateTableData(block.id, {
                            headers: newHeaders,
                            rows: block.tableData.rows
                          })
                        }}
                        className="w-full bg-transparent border-none outline-none"
                        placeholder="Encabezado..."
                      />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {block.tableData.rows.map((row, rowIndex) => (
                  <tr key={rowIndex} className="hover:bg-gray-50">
                    {row.map((cell, cellIndex) => (
                      <td key={cellIndex} className="px-4 py-2 border-b">
                        <input
                          type="text"
                          value={cell}
                          onChange={(e) => {
                            const newRows = [...block.tableData.rows]
                            newRows[rowIndex] = [...row]
                            newRows[rowIndex][cellIndex] = e.target.value
                            onUpdateTableData(block.id, {
                              headers: block.tableData.headers,
                              rows: newRows
                            })
                          }}
                          className="w-full bg-transparent border-none outline-none"
                          placeholder="Celda..."
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-2 flex space-x-2">
              <button
                onClick={() => {
                  const newRows = [...block.tableData.rows, new Array(block.tableData.headers.length).fill('')]
                  onUpdateTableData(block.id, {
                    headers: block.tableData.headers,
                    rows: newRows
                  })
                }}
                className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                + Fila
              </button>
              <button
                onClick={() => {
                  const newHeaders = [...block.tableData.headers, 'Nueva Columna']
                  const newRows = block.tableData.rows.map(row => [...row, ''])
                  onUpdateTableData(block.id, {
                    headers: newHeaders,
                    rows: newRows
                  })
                }}
                className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600"
              >
                + Columna
              </button>
            </div>
          </div>
        </div>
      )}

      {block.type === 'video' && (
        <div className={`${block.props?.padding === 'medium' ? 'p-4' : ''}`}>
          <div 
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors"
            onDragOver={(e) => {
              e.preventDefault()
              e.currentTarget.classList.add('border-blue-400', 'bg-blue-50')
            }}
            onDragLeave={(e) => {
              e.currentTarget.classList.remove('border-blue-400', 'bg-blue-50')
            }}
            onDrop={(e) => {
              e.preventDefault()
              e.currentTarget.classList.remove('border-blue-400', 'bg-blue-50')
              
              const files = Array.from(e.dataTransfer.files)
              const videoFile = files.find(file => file.type.startsWith('video/'))
              
              if (videoFile) {
                const reader = new FileReader()
                reader.onload = (event) => {
                  const videoUrl = event.target?.result as string
                  onUpdateVideoProperties(block.id, {
                    src: videoUrl,
                    alt: block.media?.alt || videoFile.name
                  })
                }
                reader.readAsDataURL(videoFile)
              }
            }}
          >
            {block.media?.src ? (
              <div>
                <video 
                  src={block.media.src} 
                  controls
                  className="max-w-full max-h-64 mx-auto rounded-lg mb-4"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                    e.currentTarget.nextElementSibling?.classList.remove('hidden')
                  }}
                />
                <div className="hidden">
                  <div className="w-12 h-12 mx-auto text-gray-400 mb-4 flex items-center justify-center">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-gray-500 mb-2">Video no disponible</p>
                </div>
              </div>
            ) : (
              <div>
                <div className="w-12 h-12 mx-auto text-gray-400 mb-4 flex items-center justify-center">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-gray-500 mb-2">Arrastra un video aquí</p>
              </div>
            )}
            
            <div className="space-y-2">
              <input
                type="text"
                value={block.media?.alt || ''}
                onChange={(e) => onUpdateVideoProperties(block.id, { 
                  src: block.media?.src || '', 
                  alt: e.target.value 
                })}
                className="w-full text-center text-gray-500 border-none outline-none bg-transparent"
                placeholder="Título del video..."
              />
              <input
                type="text"
                value={block.media?.src || ''}
                onChange={(e) => onUpdateVideoProperties(block.id, { 
                  src: e.target.value, 
                  alt: block.media?.alt || '' 
                })}
                className="w-full text-center text-sm text-gray-400 border-none outline-none bg-transparent"
                placeholder="URL del video..."
              />
              <div className="flex flex-col items-center space-y-2">
                <p className="text-xs text-gray-400">O arrastra un video desde tu computadora</p>
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      const reader = new FileReader()
                      reader.onload = (event) => {
                        const videoUrl = event.target?.result as string
                        onUpdateVideoProperties(block.id, {
                          src: videoUrl,
                          alt: block.media?.alt || file.name
                        })
                      }
                      reader.readAsDataURL(file)
                    }
                  }}
                  className="hidden"
                  id={`video-input-${block.id}`}
                />
                <button
                  onClick={() => document.getElementById(`video-input-${block.id}`)?.click()}
                  className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                  Seleccionar video
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contextual Toolbar */}
      {isSelected && !readOnly && (
        <ContextualToolbar
          blockId={block.id}
          onAction={onBlockAction}
          onAIAction={onAIAction}
          enableAI={enableAI}
          isLoading={isLoading}
        />
      )}
    </div>
  )
})

BlockComponent.displayName = 'BlockComponent'

export function GammaEditor({
  document: initialDocument,
  onSave,
  onUpdate,
  readOnly = false,
  enableAI = true,
  className = ''
}: GammaEditorProps) {
  const [document, setDocument] = useState<Document>(
    initialDocument || {
      id: `doc_${Date.now()}`,
      title: 'Untitled Document',
      blocks: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1
    }
  )

  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [newlyAddedBlockId, setNewlyAddedBlockId] = useState<string | null>(null)
  const [showSidebar, setShowSidebar] = useState(true)
  const [openAccordions, setOpenAccordions] = useState<Set<string>>(new Set())

  // Manual save functionality (auto-save disabled to prevent conflicts)
  const [isSaving, setIsSaving] = useState(false)
  
  const saveDocument = useCallback(async () => {
    if (isSaving) return
    
    setIsSaving(true)
    try {
      await onSave?.(document)
    } catch (error) {
      console.error('Manual save failed:', error)
    } finally {
      setIsSaving(false)
    }
  }, [document, onSave, isSaving])

  // Document history for undo/redo
  const { 
    canUndo, 
    canRedo, 
    undo, 
    redo, 
    addToHistory 
  } = useDocumentHistory(document, setDocument)

  // Handle AI actions
  const handleAIAction = useCallback(async (action: string, prompt: string) => {
    if (!enableAI) return

    setIsLoading(true)
    try {
      // Si el prompt es JSON (viene de AIActions), parsearlo
      let blocksToAdd: unknown[] = []
      
      try {
        const parsedBlocks = JSON.parse(prompt)
        if (Array.isArray(parsedBlocks)) {
          blocksToAdd = parsedBlocks
        } else {
          throw new Error('Not an array')
        }
      } catch {
        // Si no es JSON, generar usando la API
        const response = await fetch('/api/v1/ai/gamma/generate-blocks/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          },
          body: JSON.stringify({
            prompt: `${action}: ${prompt}`,
            content_type: 'lesson',
            educational_level: 'intermediate',
            language: 'es'
          })
        })

        if (response.ok) {
          const data = await response.json()
          if (data.success && data.blocks) {
            blocksToAdd = data.blocks
          } else {
            throw new Error('No blocks generated')
          }
        } else {
          throw new Error('API request failed')
        }
      }
      
      // Convertir bloques a formato del editor
      const newBlocks = blocksToAdd.map((block: unknown) => {
        const blockData = block as Record<string, unknown>
        // Mapear tipos de bloques
        switch (blockData.type) {
          case 'hero':
            return createBlock<HeroBlock>('hero', {
              title: String(blockData.title || 'Título'),
              subtitle: blockData.subtitle ? String(blockData.subtitle) : undefined,
              body: blockData.body ? String(blockData.body) : undefined,
              media: blockData.media as BlockMedia,
              props: (blockData.props as BlockProps) || { padding: 'medium' }
            })
          case 'heading':
            return createBlock<HeadingBlock>('heading', {
              level: (blockData.level as 1 | 2 | 3 | 4 | 5 | 6) || 2,
              content: String(blockData.content || blockData.title || 'Encabezado'),
              props: (blockData.props as BlockProps) || { padding: 'medium' }
            })
          case 'image':
            return createBlock<ImageBlock>('image', {
              media: (blockData.media as BlockMedia) || { type: 'image', src: '/api/placeholder/400/300', alt: 'Imagen' },
              caption: blockData.caption ? String(blockData.caption) : undefined,
              props: (blockData.props as BlockProps) || { padding: 'medium' }
            })
          case 'list':
            return createBlock<ListBlock>('list', {
              listType: (blockData.listType as 'ordered' | 'unordered') || 'unordered',
              items: (blockData.items as string[]) || ['Elemento 1', 'Elemento 2'],
              props: (blockData.props as BlockProps) || { padding: 'medium' }
            })
          case 'callout':
            return createBlock<CalloutBlock>('callout', {
              variant: (blockData.variant as 'info' | 'warning' | 'success' | 'error' | 'tip') || 'info',
              title: blockData.title ? String(blockData.title) : undefined,
              content: String(blockData.content || blockData.body || 'Contenido'),
              props: (blockData.props as BlockProps) || { padding: 'medium' }
            })
          default:
            return createBlock<ParagraphBlock>('paragraph', {
              content: String(blockData.content || blockData.body || `[AI Generated] ${action}`),
              props: (blockData.props as BlockProps) || { padding: 'medium' }
            })
        }
      })
      
      const updatedDocument = {
        ...document,
        blocks: [...document.blocks, ...newBlocks],
        updatedAt: new Date().toISOString(),
        version: document.version + 1
      }
      
      setDocument(updatedDocument)
      addToHistory(updatedDocument)
      onUpdate?.(updatedDocument)
    } catch (error) {
      console.error('AI generation error:', error)
      
      // Fallback: crear un bloque simple
      const newBlock = createBlock<ParagraphBlock>('paragraph', {
        content: `[AI Generated] ${prompt || action}`,
        props: {
          padding: 'medium'
        }
      })
      
      const updatedDocument = {
        ...document,
        blocks: [...document.blocks, newBlock],
        updatedAt: new Date().toISOString(),
        version: document.version + 1
      }
      
      setDocument(updatedDocument)
      addToHistory(updatedDocument)
      onUpdate?.(updatedDocument)
    } finally {
      setIsLoading(false)
    }
  }, [document, enableAI, addToHistory, onUpdate])

  // Handle block actions
  const handleBlockAction = useCallback((action: string, blockId: string) => {
    const blockIndex = document.blocks.findIndex(b => b.id === blockId)
    if (blockIndex === -1) return

    const updatedBlocks = [...document.blocks]

    switch (action) {
      case 'duplicate': {
        const blockToDuplicate = document.blocks[blockIndex]
        const duplicatedBlock = {
          ...blockToDuplicate,
          id: `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        updatedBlocks.splice(blockIndex + 1, 0, duplicatedBlock)
        break
      }

      case 'delete':
        updatedBlocks.splice(blockIndex, 1)
        break

      case 'move_up':
        if (blockIndex > 0) {
          const temp = updatedBlocks[blockIndex - 1]
          updatedBlocks[blockIndex - 1] = updatedBlocks[blockIndex]
          updatedBlocks[blockIndex] = temp
        }
        break

      case 'move_down':
        if (blockIndex < updatedBlocks.length - 1) {
          const temp = updatedBlocks[blockIndex + 1]
          updatedBlocks[blockIndex + 1] = updatedBlocks[blockIndex]
          updatedBlocks[blockIndex] = temp
        }
        break
    }

    const updatedDocument = {
      ...document,
      blocks: updatedBlocks,
      updatedAt: new Date().toISOString(),
      version: document.version + 1
    }

    setDocument(updatedDocument)
    addToHistory(updatedDocument)
  }, [document, addToHistory])

  // Add new block using the new system
  const addBlock = useCallback((type: BlockType) => {
    const newBlock = createBlockByType(type)

    const updatedDocument = {
      ...document,
      blocks: [...document.blocks, newBlock],
      updatedAt: new Date().toISOString(),
      version: document.version + 1
    }
    
    setDocument(updatedDocument)
    addToHistory(updatedDocument)
    
    // Mark the newly added block for visual feedback
    setNewlyAddedBlockId(newBlock.id)
    setSelectedBlockId(newBlock.id)
    
    // Clear the visual feedback after animation
    setTimeout(() => {
      setNewlyAddedBlockId(null)
    }, 2000)
  }, [document, addToHistory])

  // Update block content
  const updateBlockContent = useCallback((blockId: string, content: string) => {
    const updatedBlocks = document.blocks.map(block => {
      if (block.id === blockId) {
        if (block.type === 'paragraph') {
          return { ...block, content } as Block
        } else if (block.type === 'heading') {
          return { ...block, content } as Block
        } else if (block.type === 'callout') {
          return { ...block, content } as Block
        }
      }
      return block
    })

    const updatedDocument = {
      ...document,
      blocks: updatedBlocks,
      updatedAt: new Date().toISOString(),
      version: document.version + 1
    }

    setDocument(updatedDocument)
    addToHistory(updatedDocument)
  }, [document, addToHistory])

  // Update callout title
  const updateCalloutTitle = useCallback((blockId: string, title: string) => {
    const updatedBlocks = document.blocks.map(block => {
      if (block.id === blockId && block.type === 'callout') {
        return { ...block, title } as Block
      }
      return block
    })

    const updatedDocument = {
      ...document,
      blocks: updatedBlocks,
      updatedAt: new Date().toISOString(),
      version: document.version + 1
    }

    setDocument(updatedDocument)
    addToHistory(updatedDocument)
  }, [document, addToHistory])

  // Update image properties
  const updateImageProperties = useCallback((blockId: string, media: { src: string; alt: string }) => {
    const updatedBlocks = document.blocks.map(block => {
      if (block.id === blockId && block.type === 'image') {
        return { ...block, media: { ...block.media, ...media } } as Block
      }
      return block
    })

    const updatedDocument = {
      ...document,
      blocks: updatedBlocks,
      updatedAt: new Date().toISOString(),
      version: document.version + 1
    }

    setDocument(updatedDocument)
    addToHistory(updatedDocument)
  }, [document, addToHistory])

  // Update list items
  const updateListItems = useCallback((blockId: string, items: string[]) => {
    const updatedBlocks = document.blocks.map(block => {
      if (block.id === blockId && block.type === 'list') {
        return { ...block, items } as Block
      }
      return block
    })

    const updatedDocument = {
      ...document,
      blocks: updatedBlocks,
      updatedAt: new Date().toISOString(),
      version: document.version + 1
    }

    setDocument(updatedDocument)
    addToHistory(updatedDocument)
  }, [document, addToHistory])

  // Update video properties
  const updateVideoProperties = useCallback((blockId: string, media: { src: string; alt: string }) => {
    const updatedBlocks = document.blocks.map(block => {
      if (block.id === blockId && block.type === 'video') {
        return { ...block, media: { ...block.media, ...media } } as Block
      }
      return block
    })

    const updatedDocument = {
      ...document,
      blocks: updatedBlocks,
      updatedAt: new Date().toISOString(),
      version: document.version + 1
    }

    setDocument(updatedDocument)
    addToHistory(updatedDocument)
  }, [document, addToHistory])

  // Update table data
  const updateTableData = useCallback((blockId: string, tableData: { headers: string[]; rows: string[][] }) => {
    const updatedBlocks = document.blocks.map(block => {
      if (block.id === blockId && block.type === 'table') {
        return { ...block, tableData } as Block
      }
      return block
    })

    const updatedDocument = {
      ...document,
      blocks: updatedBlocks,
      updatedAt: new Date().toISOString(),
      version: document.version + 1
    }

    setDocument(updatedDocument)
    addToHistory(updatedDocument)
  }, [document, addToHistory])

  // Update document when initialDocument changes (only if it's a different document)
  useEffect(() => {
    if (initialDocument && initialDocument.id !== document.id) {
      setDocument(initialDocument)
    }
  }, [initialDocument, document.id])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 's':
            e.preventDefault()
            saveDocument()
            break
          case 'z':
            e.preventDefault()
            if (e.shiftKey) {
              redo()
            } else {
              undo()
            }
            break
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [saveDocument, undo, redo])

  // Memoized callbacks to prevent unnecessary re-renders
  const handleSelectBlock = useCallback((blockId: string) => {
    setSelectedBlockId(blockId)
  }, [])

  const handleUpdateBlockContent = useCallback((blockId: string, content: string) => {
    updateBlockContent(blockId, content)
  }, [updateBlockContent])

  const handleUpdateCalloutTitle = useCallback((blockId: string, title: string) => {
    updateCalloutTitle(blockId, title)
  }, [updateCalloutTitle])

  const handleUpdateImageProperties = useCallback((blockId: string, media: { src: string; alt: string }) => {
    updateImageProperties(blockId, media)
  }, [updateImageProperties])

  const handleUpdateListItems = useCallback((blockId: string, items: string[]) => {
    updateListItems(blockId, items)
  }, [updateListItems])

  const handleUpdateVideoProperties = useCallback((blockId: string, media: { src: string; alt: string }) => {
    updateVideoProperties(blockId, media)
  }, [updateVideoProperties])

  const handleUpdateTableData = useCallback((blockId: string, tableData: { headers: string[]; rows: string[][] }) => {
    updateTableData(blockId, tableData)
  }, [updateTableData])

  // Toggle accordion
  const toggleAccordion = useCallback((blockId: string) => {
    setOpenAccordions(prev => {
      const newSet = new Set(prev)
      if (newSet.has(blockId)) {
        newSet.delete(blockId)
      } else {
        newSet.add(blockId)
      }
      return newSet
    })
  }, [])

  return (
    <div className={`gamma-editor flex h-full ${className}`}>
      {/* Sidebar de Herramientas */}
      {!readOnly && showSidebar && (
        <div className="w-80 bg-gray-50 border-r border-gray-200 flex flex-col">
          {/* Header del Sidebar */}
          <div className="p-4 border-b border-gray-200 bg-white">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">Herramientas</h3>
              <button
                onClick={() => setShowSidebar(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>
          
          {/* Contenido del Sidebar */}
          <div className="flex-1 overflow-auto p-4">
            <BlockSelector onAddBlock={addBlock} />
          </div>
        </div>
      )}

      {/* Contenido Principal */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar Principal */}
        <div className="flex items-center justify-between p-4 border-b bg-gray-50 flex-shrink-0">
          <div className="flex items-center space-x-2">
            {!readOnly && (
              <button
                onClick={() => setShowSidebar(!showSidebar)}
                className="p-2 hover:bg-gray-100 rounded"
                title={showSidebar ? "Ocultar herramientas" : "Mostrar herramientas"}
              >
                <Menu className="w-5 h-5 text-gray-600" />
              </button>
            )}
            <button
              onClick={undo}
              disabled={!canUndo}
              className="px-3 py-1 text-sm bg-white border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ↶ Undo
            </button>
            <button
              onClick={redo}
              disabled={!canRedo}
              className="px-3 py-1 text-sm bg-white border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ↷ Redo
            </button>
          </div>

          <div className="flex items-center space-x-2">
            {isSaving && (
              <span className="text-sm text-gray-500 flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                Guardando...
              </span>
            )}
            <button
              onClick={saveDocument}
              disabled={isSaving}
              className="px-4 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 font-semibold"
            >
              <span>💾</span>
              <span>{isSaving ? 'Guardando...' : 'Guardar Cambios'}</span>
            </button>
          </div>
        </div>

        {/* Editor Content */}
        <div className="flex-1 overflow-auto p-6 space-y-4">
          {document.blocks.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg mb-4">No hay bloques en este documento</p>
              <p className="text-sm">
                {!readOnly ? 'Haz clic en el botón de menú para ver las herramientas' : 'Este documento está vacío'}
              </p>
            </div>
          ) : (
            document.blocks.map(block => (
              <BlockComponent
                key={block.id}
                block={block}
                isSelected={selectedBlockId === block.id}
                isNewlyAdded={newlyAddedBlockId === block.id}
                readOnly={readOnly}
                enableAI={enableAI}
                isLoading={isLoading}
                onSelect={handleSelectBlock}
                onUpdateContent={handleUpdateBlockContent}
                onUpdateCalloutTitle={handleUpdateCalloutTitle}
                onUpdateImageProperties={handleUpdateImageProperties}
                onUpdateVideoProperties={handleUpdateVideoProperties}
                onUpdateListItems={handleUpdateListItems}
                onUpdateTableData={handleUpdateTableData}
                onBlockAction={handleBlockAction}
                onAIAction={handleAIAction}
                openAccordions={openAccordions}
                onToggleAccordion={toggleAccordion}
              />
            ))
          )}
        </div>
      </div>
    </div>
  )
}
