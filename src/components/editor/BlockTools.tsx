import { createBlock, Block, HeadingBlock, ImageBlock, ListBlock, CalloutBlock, ParagraphBlock, VideoBlock, TableBlock, FormBlock, QuizBlock, FlashcardBlock } from '../../types/block-schema'
import {
  Type,
  Image,
  List,
  Heading,
  Quote,
  Table,
  Video,
  FileText,
  BookOpen,
  HelpCircle
} from 'lucide-react'

// Tipos de bloques disponibles
export type BlockType = 
  | 'paragraph' 
  | 'heading' 
  | 'image' 
  | 'list' 
  | 'callout'
  | 'table'
  | 'video'
  | 'quote'
  | 'divider'
  | 'math'
  | 'timeline'
  | 'accordion'
  | 'card'
  | 'alert'
  | 'progress'
  | 'stats'
  | 'testimonial'
  | 'pricing'
  | 'faq'
  | 'contact'
  | 'form'
  | 'quiz'
  | 'flashcard'

// Configuración de cada tipo de bloque
export interface BlockConfig {
  type: BlockType
  name: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  category: 'basic' | 'content' | 'interactive'
  isPremium?: boolean
  isComingSoon?: boolean
}

// Configuración de todos los bloques disponibles
export const BLOCK_CONFIGS: BlockConfig[] = [
  // Bloques básicos
  {
    type: 'paragraph',
    name: 'Párrafo',
    description: 'Texto simple con formato',
    icon: Type,
    category: 'basic'
  },
  {
    type: 'heading',
    name: 'Encabezado',
    description: 'Títulos y subtítulos',
    icon: Heading,
    category: 'basic'
  },
  {
    type: 'list',
    name: 'Lista',
    description: 'Listas ordenadas y no ordenadas',
    icon: List,
    category: 'basic'
  },
  {
    type: 'quote',
    name: 'Cita',
    description: 'Citas y testimonios',
    icon: Quote,
    category: 'basic'
  },
  {
    type: 'divider',
    name: 'Separador',
    description: 'Línea divisoria',
    icon: FileText,
    category: 'basic'
  },

  // Contenido
  {
    type: 'image',
    name: 'Imagen',
    description: 'Imágenes y galerías',
    icon: Image,
    category: 'content'
  },
  {
    type: 'video',
    name: 'Video',
    description: 'Videos embebidos',
    icon: Video,
    category: 'content'
  },
  {
    type: 'table',
    name: 'Tabla',
    description: 'Tablas de datos',
    icon: Table,
    category: 'content'
  },

  // Interactivos
  {
    type: 'callout',
    name: 'Callout',
    description: 'Notas y alertas',
    icon: Quote,
    category: 'interactive'
  },
  {
    type: 'accordion',
    name: 'Acordeón',
    description: 'Contenido expandible',
    icon: BookOpen,
    category: 'interactive'
  },
  {
    type: 'form',
    name: 'Formulario',
    description: 'Formularios de contacto',
    icon: FileText,
    category: 'interactive'
  },
  {
    type: 'quiz',
    name: 'Quiz',
    description: 'Preguntas y respuestas',
    icon: HelpCircle,
    category: 'interactive'
  },
  {
    type: 'flashcard',
    name: 'Tarjeta de Memoria',
    description: 'Tarjetas para estudiar',
    icon: FileText,
    category: 'interactive'
  },


]

// Categorías de bloques
export const BLOCK_CATEGORIES = {
  basic: 'Básicos',
  content: 'Contenido',
  interactive: 'Interactivos',
  pexels: 'Imágenes Pexels'
}

// Función para crear un bloque según su tipo
export const createBlockByType = (type: BlockType): Block => {
  switch (type) {
    case 'paragraph':
      return createBlock<ParagraphBlock>('paragraph', {
        content: 'Nuevo párrafo',
        props: { padding: 'medium' }
      })

    case 'heading':
      return createBlock<HeadingBlock>('heading', {
        level: 2,
        content: 'Nuevo encabezado',
        props: { padding: 'medium' }
      })

    case 'image':
      return createBlock<ImageBlock>('image', {
        media: {
          type: 'image',
          src: '/api/placeholder/400/300',
          alt: 'Nueva imagen'
        },
        props: { padding: 'medium' }
      })

    case 'list':
      return createBlock<ListBlock>('list', {
        listType: 'unordered',
        items: ['Elemento 1', 'Elemento 2', 'Elemento 3'],
        props: { padding: 'medium' }
      })

    case 'callout':
      return createBlock<CalloutBlock>('callout', {
        variant: 'info',
        title: 'Nota importante',
        content: 'Este es un callout de ejemplo',
        props: { padding: 'medium' }
      })

    case 'quote':
      return createBlock<ParagraphBlock>('paragraph', {
        content: 'Esta es una cita importante que destaca un punto clave.',
        props: { 
          padding: 'medium',
          style: 'quote'
        }
      })

    case 'divider':
      return createBlock<ParagraphBlock>('paragraph', {
        content: '',
        props: { 
          padding: 'medium',
          style: 'divider'
        }
      })


    case 'table':
      return createBlock<TableBlock>('table', {
        tableData: {
          headers: ['Columna 1', 'Columna 2', 'Columna 3'],
          rows: [
            ['Dato 1', 'Dato 2', 'Dato 3'],
            ['Dato 4', 'Dato 5', 'Dato 6']
          ]
        },
        striped: true,
        bordered: true,
        hoverable: true,
        props: { 
          padding: 'medium'
        }
      })

    case 'video':
      return createBlock<VideoBlock>('video', {
        media: {
          type: 'video',
          src: '',
          alt: 'Video'
        },
        controls: true,
        autoplay: false,
        loop: false,
        muted: false,
        props: { 
          padding: 'medium'
        }
      })

    case 'accordion':
      return createBlock<ParagraphBlock>('paragraph', {
        content: 'Título del acordeón\n\nContenido del acordeón que se puede expandir y contraer.',
        props: { 
          padding: 'medium',
          style: 'accordion'
        }
      })


    case 'quiz':
      return createBlock<QuizBlock>('quiz', {
        question: '¿Cuál es la respuesta correcta?',
        options: ['Opción 1', 'Opción 2', 'Opción 3', 'Opción 4'],
        correctAnswer: 0,
        explanation: 'Explicación de por qué esta es la respuesta correcta',
        points: 10,
        props: { 
          padding: 'medium'
        }
      })

    case 'flashcard':
      return createBlock<FlashcardBlock>('flashcard', {
        front: 'Término o concepto',
        back: 'Definición o explicación',
        category: 'General',
        difficulty: 'medium',
        tags: [],
        props: { 
          padding: 'medium'
        }
      })


    case 'form':
      return createBlock<FormBlock>('form', {
        title: 'Formulario de Contacto',
        description: 'Complete el formulario para contactarnos',
        fields: [
          {
            id: 'name',
            type: 'text',
            label: 'Nombre',
            placeholder: 'Ingrese su nombre',
            required: true
          },
          {
            id: 'email',
            type: 'email',
            label: 'Email',
            placeholder: 'Ingrese su email',
            required: true
          },
          {
            id: 'message',
            type: 'textarea',
            label: 'Mensaje',
            placeholder: 'Escriba su mensaje aquí',
            required: false
          }
        ],
        props: { 
          padding: 'medium'
        }
      })



    // Bloques que están en desarrollo
    default:
      return createBlock<ParagraphBlock>('paragraph', {
        content: `[${String(type).toUpperCase()}] - Herramienta disponible`,
        props: { 
          padding: 'medium'
        }
      })
  }
}

// Función para obtener la configuración de un bloque
export const getBlockConfig = (type: BlockType): BlockConfig | undefined => {
  return BLOCK_CONFIGS.find(config => config.type === type)
}

// Función para obtener bloques por categoría
export const getBlocksByCategory = (category: keyof typeof BLOCK_CATEGORIES): BlockConfig[] => {
  return BLOCK_CONFIGS.filter(config => config.category === category)
}

// Función para obtener todos los bloques disponibles (no coming soon)
export const getAvailableBlocks = (): BlockConfig[] => {
  return BLOCK_CONFIGS.filter(config => !config.isComingSoon)
}

// Función para obtener bloques premium
export const getPremiumBlocks = (): BlockConfig[] => {
  return BLOCK_CONFIGS.filter(config => config.isPremium)
}

// Función para obtener bloques en desarrollo
export const getComingSoonBlocks = (): BlockConfig[] => {
  return BLOCK_CONFIGS.filter(config => config.isComingSoon)
}
