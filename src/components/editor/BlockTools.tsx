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
  Calculator,
  BookOpen,
  Target,
  Users,
  BarChart3,
  Star,
  AlertTriangle,
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
  | 'gallery'
  | 'carousel'
  | 'chart'
  | 'map'
  | 'embed'
  | 'spacer'
  | 'button'
  | 'form'
  | 'quiz'
  | 'flashcard'
  | 'audio'
  | 'slideshow'
  | 'columns'
  | 'highlight'
  | 'stats'
  | 'testimonial'
  | 'pricing'
  | 'faq'
  | 'contact'
  | 'alert'
  | 'progress'

// Configuración de cada tipo de bloque
export interface BlockConfig {
  type: BlockType
  name: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  category: 'basic' | 'content' | 'interactive' | 'media' | 'layout' | 'advanced'
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
  {
    type: 'gallery',
    name: 'Galería',
    description: 'Galería de imágenes',
    icon: Image,
    category: 'media'
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
    type: 'button',
    name: 'Botón',
    description: 'Botones de acción',
    icon: Target,
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

  // Media
  {
    type: 'carousel',
    name: 'Carrusel',
    description: 'Carrusel de contenido',
    icon: Image,
    category: 'media'
  },
  {
    type: 'embed',
    name: 'Embed',
    description: 'Contenido embebido',
    icon: FileText,
    category: 'media'
  },
  {
    type: 'audio',
    name: 'Audio',
    description: 'Archivos de audio',
    icon: FileText,
    category: 'media'
  },
  {
    type: 'slideshow',
    name: 'Presentación',
    description: 'Presentación de diapositivas',
    icon: FileText,
    category: 'media'
  },

  // Layout
  {
    type: 'card',
    name: 'Tarjeta',
    description: 'Tarjetas de contenido',
    icon: FileText,
    category: 'layout'
  },
  {
    type: 'spacer',
    name: 'Espaciador',
    description: 'Espacio en blanco',
    icon: FileText,
    category: 'layout'
  },
  {
    type: 'columns',
    name: 'Columnas',
    description: 'Contenido en columnas',
    icon: FileText,
    category: 'layout'
  },
  {
    type: 'highlight',
    name: 'Resaltado',
    description: 'Texto resaltado',
    icon: Star,
    category: 'layout'
  },

  // Avanzados
  {
    type: 'math',
    name: 'Matemáticas',
    description: 'Fórmulas matemáticas',
    icon: Calculator,
    category: 'advanced'
  },
  {
    type: 'timeline',
    name: 'Línea de tiempo',
    description: 'Cronología de eventos',
    icon: BarChart3,
    category: 'advanced'
  },
  {
    type: 'chart',
    name: 'Gráfico',
    description: 'Gráficos y visualizaciones',
    icon: BarChart3,
    category: 'advanced'
  },
  {
    type: 'map',
    name: 'Mapa',
    description: 'Mapas interactivos',
    icon: Target,
    category: 'advanced'
  },
  {
    type: 'stats',
    name: 'Estadísticas',
    description: 'Métricas y estadísticas',
    icon: BarChart3,
    category: 'advanced'
  },
  {
    type: 'testimonial',
    name: 'Testimonio',
    description: 'Testimonios de usuarios',
    icon: Users,
    category: 'advanced'
  },
  {
    type: 'pricing',
    name: 'Precios',
    description: 'Tablas de precios',
    icon: Star,
    category: 'advanced'
  },
  {
    type: 'faq',
    name: 'FAQ',
    description: 'Preguntas frecuentes',
    icon: HelpCircle,
    category: 'advanced'
  },
  {
    type: 'contact',
    name: 'Contacto',
    description: 'Información de contacto',
    icon: Users,
    category: 'advanced'
  },
  {
    type: 'alert',
    name: 'Alerta',
    description: 'Alertas y notificaciones',
    icon: AlertTriangle,
    category: 'advanced'
  },
  {
    type: 'progress',
    name: 'Progreso',
    description: 'Barras de progreso',
    icon: BarChart3,
    category: 'advanced'
  }
]

// Categorías de bloques
export const BLOCK_CATEGORIES = {
  basic: 'Básicos',
  content: 'Contenido',
  interactive: 'Interactivos',
  media: 'Media',
  layout: 'Layout',
  advanced: 'Avanzados'
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

    case 'carousel':
      return createBlock<ParagraphBlock>('paragraph', {
        content: 'Carrusel de imágenes:\n\nImagen 1: Descripción\nImagen 2: Descripción\nImagen 3: Descripción',
        props: { 
          padding: 'medium',
          style: 'carousel'
        }
      })

    case 'gallery':
      return createBlock<ParagraphBlock>('paragraph', {
        content: 'Galería de imágenes:\n\n• Imagen 1: Descripción\n• Imagen 2: Descripción\n• Imagen 3: Descripción',
        props: { 
          padding: 'medium',
          style: 'gallery'
        }
      })

    case 'embed':
      return createBlock<ParagraphBlock>('paragraph', {
        content: 'Contenido embebido:\n\nURL: https://ejemplo.com\nTítulo: Contenido embebido\nDescripción: Descripción del contenido',
        props: { 
          padding: 'medium',
          style: 'embed'
        }
      })

    case 'audio':
      return createBlock<ParagraphBlock>('paragraph', {
        content: 'Archivo de audio:\n\nTítulo: Nombre del audio\nDuración: 00:00\nDescripción: Descripción del contenido de audio',
        props: { 
          padding: 'medium',
          style: 'audio'
        }
      })

    case 'slideshow':
      return createBlock<ParagraphBlock>('paragraph', {
        content: 'Presentación:\n\nDiapositiva 1: Título y contenido\nDiapositiva 2: Título y contenido\nDiapositiva 3: Título y contenido',
        props: { 
          padding: 'medium',
          style: 'slideshow'
        }
      })

    case 'card':
      return createBlock<ParagraphBlock>('paragraph', {
        content: 'Tarjeta de contenido:\n\nTítulo: Título de la tarjeta\nContenido: Descripción o información importante\nAcción: Botón o enlace opcional',
        props: { 
          padding: 'medium',
          style: 'card'
        }
      })

    case 'spacer':
      return createBlock<ParagraphBlock>('paragraph', {
        content: '',
        props: { 
          padding: 'large',
          style: 'spacer'
        }
      })

    case 'columns':
      return createBlock<ParagraphBlock>('paragraph', {
        content: 'Contenido en columnas:\n\nColumna 1: Contenido de la primera columna\nColumna 2: Contenido de la segunda columna\nColumna 3: Contenido de la tercera columna',
        props: { 
          padding: 'medium',
          style: 'columns'
        }
      })

    case 'highlight':
      return createBlock<ParagraphBlock>('paragraph', {
        content: 'Texto resaltado importante que llama la atención del estudiante',
        props: { 
          padding: 'medium',
          style: 'highlight'
        }
      })

    case 'math':
      return createBlock<ParagraphBlock>('paragraph', {
        content: 'Fórmula matemática:\n\nEjemplo: E = mc²\n\nOtra fórmula: a² + b² = c²',
        props: { 
          padding: 'medium',
          style: 'math'
        }
      })

    case 'timeline':
      return createBlock<ParagraphBlock>('paragraph', {
        content: 'Línea de tiempo:\n\n1900: Evento importante\n1950: Otro evento\n2000: Evento reciente\n2024: Evento actual',
        props: { 
          padding: 'medium',
          style: 'timeline'
        }
      })

    case 'chart':
      return createBlock<ParagraphBlock>('paragraph', {
        content: 'Gráfico:\n\nTítulo: Nombre del gráfico\nTipo: Barras, líneas, circular\nDatos: Información a mostrar',
        props: { 
          padding: 'medium',
          style: 'chart'
        }
      })

    case 'map':
      return createBlock<ParagraphBlock>('paragraph', {
        content: 'Mapa interactivo:\n\nUbicación: Ciudad, país\nTipo: Físico, político, temático\nDescripción: Información del mapa',
        props: { 
          padding: 'medium',
          style: 'map'
        }
      })

    case 'button':
      return createBlock<ParagraphBlock>('paragraph', {
        content: 'Botón de acción:\n\nTexto: Hacer clic aquí\nAcción: Enlace o función\nEstilo: Primario, secundario, outline',
        props: { 
          padding: 'medium',
          style: 'button'
        }
      })

    case 'stats':
      return createBlock<ParagraphBlock>('paragraph', {
        content: 'Estadísticas:\n\nMétrica 1: Valor con descripción\nMétrica 2: Valor con descripción\nMétrica 3: Valor con descripción',
        props: { 
          padding: 'medium',
          style: 'stats'
        }
      })

    case 'testimonial':
      return createBlock<ParagraphBlock>('paragraph', {
        content: 'Testimonio:\n\n"Esta es una cita de testimonio que destaca la experiencia del usuario."\n\n- Nombre del usuario, Cargo',
        props: { 
          padding: 'medium',
          style: 'testimonial'
        }
      })

    case 'pricing':
      return createBlock<ParagraphBlock>('paragraph', {
        content: 'Tabla de precios:\n\nPlan Básico: $10/mes - Características incluidas\nPlan Pro: $25/mes - Más características\nPlan Premium: $50/mes - Todas las características',
        props: { 
          padding: 'medium',
          style: 'pricing'
        }
      })

    case 'faq':
      return createBlock<ParagraphBlock>('paragraph', {
        content: 'Preguntas frecuentes:\n\nP: ¿Pregunta frecuente 1?\nR: Respuesta detallada aquí.\n\nP: ¿Pregunta frecuente 2?\nR: Otra respuesta detallada.',
        props: { 
          padding: 'medium',
          style: 'faq'
        }
      })

    case 'contact':
      return createBlock<ParagraphBlock>('paragraph', {
        content: 'Información de contacto:\n\nTeléfono: +1 (555) 123-4567\nEmail: contacto@ejemplo.com\nDirección: 123 Calle Principal, Ciudad',
        props: { 
          padding: 'medium',
          style: 'contact'
        }
      })

    case 'alert':
      return createBlock<ParagraphBlock>('paragraph', {
        content: 'Alerta importante:\n\nEste es un mensaje de alerta que requiere atención inmediata del usuario.',
        props: { 
          padding: 'medium',
          style: 'alert'
        }
      })

    case 'progress':
      return createBlock<ParagraphBlock>('paragraph', {
        content: 'Barra de progreso:\n\nTarea 1: 75% completado\nTarea 2: 50% completado\nTarea 3: 25% completado',
        props: { 
          padding: 'medium',
          style: 'progress'
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
