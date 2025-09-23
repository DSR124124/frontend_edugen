// Block Schema for Gamma-style Editor
// Based on the JSON schema provided in the requirements

export interface BlockMedia {
  type: 'image' | 'video' | 'embed' | 'file'
  src: string
  alt?: string
  caption?: string
  width?: number
  height?: number
}

export interface BlockProps {
  bg?: 'light' | 'dark' | 'gradient' | 'transparent'
  align?: 'left' | 'center' | 'right' | 'justify'
  padding?: 'none' | 'small' | 'medium' | 'large'
  margin?: 'none' | 'small' | 'medium' | 'large'
  border?: boolean
  shadow?: boolean
  rounded?: boolean
  fullWidth?: boolean
  maxWidth?: number
  style?: 'divider' | 'quote' | 'code' | 'normal' | 'accordion' | 'tabs' | 'quiz' | 'flashcard' | 'form' | 'carousel' | 'gallery' | 'embed' | 'audio' | 'slideshow' | 'card' | 'spacer' | 'columns' | 'highlight' | 'math' | 'timeline' | 'chart' | 'map' | 'button' | 'stats' | 'testimonial' | 'pricing' | 'faq' | 'contact' | 'alert' | 'progress'
}

export interface BaseBlock {
  id: string
  type: string
  props?: BlockProps
  createdAt?: string
  updatedAt?: string
  version?: number
}

// Hero Block
export interface HeroBlock extends BaseBlock {
  type: 'hero'
  title: string
  subtitle?: string
  body?: string
  media?: BlockMedia
  cta?: {
    text: string
    action: string
    variant?: 'primary' | 'secondary' | 'outline'
  }
}

// Text Blocks
export interface ParagraphBlock extends BaseBlock {
  type: 'paragraph'
  content: string
  textAlign?: 'left' | 'center' | 'right' | 'justify'
  fontSize?: 'small' | 'medium' | 'large' | 'xlarge'
  fontWeight?: 'normal' | 'medium' | 'semibold' | 'bold'
}

export interface HeadingBlock extends BaseBlock {
  type: 'heading'
  level: 1 | 2 | 3 | 4 | 5 | 6
  content: string
  textAlign?: 'left' | 'center' | 'right'
}

export interface ListBlock extends BaseBlock {
  type: 'list'
  listType: 'ordered' | 'unordered'
  items: string[]
  nested?: boolean
}

// Media Blocks
export interface ImageBlock extends BaseBlock {
  type: 'image'
  media: BlockMedia
  caption?: string
  aspectRatio?: 'square' | 'landscape' | 'portrait' | 'auto'
}

export interface VideoBlock extends BaseBlock {
  type: 'video'
  media: BlockMedia
  autoplay?: boolean
  controls?: boolean
  loop?: boolean
  muted?: boolean
}

// Layout Blocks
export interface ColumnsBlock extends BaseBlock {
  type: 'columns'
  columns: {
    id: string
    blocks: Block[]
    width?: number
  }[]
  gap?: 'none' | 'small' | 'medium' | 'large'
}

export interface CardBlock extends BaseBlock {
  type: 'card'
  title?: string
  content: string
  media?: BlockMedia
  actions?: {
    text: string
    action: string
    variant?: 'primary' | 'secondary' | 'outline'
  }[]
}

// Interactive Blocks
export interface ButtonBlock extends BaseBlock {
  type: 'button'
  text: string
  action: string
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'small' | 'medium' | 'large'
  fullWidth?: boolean
}

export interface FormBlock extends BaseBlock {
  type: 'form'
  title?: string
  description?: string
  fields: {
    id: string
    type: 'text' | 'email' | 'textarea' | 'select' | 'checkbox' | 'radio'
    label: string
    placeholder?: string
    required?: boolean
    options?: string[]
  }[]
  submitText?: string
  action?: string
}

// Educational Blocks
export interface QuizBlock extends BaseBlock {
  type: 'quiz'
  question: string
  options: string[]
  correctAnswer: number
  explanation?: string
  points?: number
}

export interface FlashcardBlock extends BaseBlock {
  type: 'flashcard'
  front: string
  back: string
  category?: string
  difficulty?: 'easy' | 'medium' | 'hard'
  tags?: string[]
}

export interface CodeBlock extends BaseBlock {
  type: 'code'
  language: string
  code: string
  showLineNumbers?: boolean
  maxHeight?: number
}

export interface CalloutBlock extends BaseBlock {
  type: 'callout'
  variant: 'info' | 'warning' | 'success' | 'error' | 'tip'
  title?: string
  content: string
  icon?: string
}

export interface TableBlock extends BaseBlock {
  type: 'table'
  tableData: {
    headers: string[]
    rows: string[][]
  }
  caption?: string
  striped?: boolean
  bordered?: boolean
  hoverable?: boolean
}


// Union type for all blocks
export type Block = 
  | HeroBlock
  | ParagraphBlock
  | HeadingBlock
  | ListBlock
  | ImageBlock
  | VideoBlock
  | TableBlock
  | ColumnsBlock
  | CardBlock
  | ButtonBlock
  | FormBlock
  | QuizBlock
  | FlashcardBlock
  | CodeBlock
  | CalloutBlock

// Document structure
export interface Document {
  id: string
  title: string
  description?: string
  blocks: Block[]
  metadata?: {
    author?: string
    tags?: string[]
    category?: string
    difficulty?: 'beginner' | 'intermediate' | 'advanced'
    estimatedTime?: number
    language?: string
  }
  settings?: {
    theme?: 'light' | 'dark' | 'auto'
    fontSize?: 'small' | 'medium' | 'large'
    showOutline?: boolean
    allowComments?: boolean
    allowCollaboration?: boolean
  }
  createdAt: string
  updatedAt: string
  version: number
}

// Block creation helpers
export const createBlock = <T extends Block>(type: T['type'], data: Omit<T, 'id' | 'type' | 'createdAt' | 'updatedAt' | 'version'>): T => {
  const now = new Date().toISOString()
  return {
    id: `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type,
    createdAt: now,
    updatedAt: now,
    version: 1,
    ...data
  } as T
}

// Block validation
export const validateBlock = (block: unknown): block is Block => {
  if (!block || typeof block !== 'object') return false
  const b = block as Record<string, unknown>
  return !!(b.id && b.type && typeof b.id === 'string' && typeof b.type === 'string')
}

// Block type guards
export const isHeroBlock = (block: Block): block is HeroBlock => block.type === 'hero'
export const isParagraphBlock = (block: Block): block is ParagraphBlock => block.type === 'paragraph'
export const isHeadingBlock = (block: Block): block is HeadingBlock => block.type === 'heading'
export const isImageBlock = (block: Block): block is ImageBlock => block.type === 'image'
export const isVideoBlock = (block: Block): block is VideoBlock => block.type === 'video'
export const isColumnsBlock = (block: Block): block is ColumnsBlock => block.type === 'columns'
export const isCardBlock = (block: Block): block is CardBlock => block.type === 'card'
export const isButtonBlock = (block: Block): block is ButtonBlock => block.type === 'button'
export const isFormBlock = (block: Block): block is FormBlock => block.type === 'form'
export const isQuizBlock = (block: Block): block is QuizBlock => block.type === 'quiz'
export const isFlashcardBlock = (block: Block): block is FlashcardBlock => block.type === 'flashcard'
export const isCodeBlock = (block: Block): block is CodeBlock => block.type === 'code'
export const isCalloutBlock = (block: Block): block is CalloutBlock => block.type === 'callout'
export const isTableBlock = (block: Block): block is TableBlock => block.type === 'table'
