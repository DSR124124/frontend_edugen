// Pexels API Service
// Documentation: https://www.pexels.com/api/documentation/

import { PEXELS_CONFIG } from '../config/pexels'

export interface PexelsPhoto {
  id: number
  width: number
  height: number
  url: string
  photographer: string
  photographer_url: string
  photographer_id: number
  avg_color: string
  src: {
    original: string
    large2x: string
    large: string
    medium: string
    small: string
    portrait: string
    landscape: string
    tiny: string
  }
  liked: boolean
  alt: string
}

export interface PexelsSearchResponse {
  total_results: number
  page: number
  per_page: number
  photos: PexelsPhoto[]
  next_page?: string
  prev_page?: string
}

export interface PexelsSearchParams {
  query: string
  orientation?: 'landscape' | 'portrait' | 'square'
  size?: 'large' | 'medium' | 'small'
  color?: 'red' | 'orange' | 'yellow' | 'green' | 'turquoise' | 'blue' | 'violet' | 'pink' | 'brown' | 'black' | 'gray' | 'white' | string
  locale?: string
  page?: number
  per_page?: number
}

class PexelsService {
  private apiKey: string
  private baseUrl = 'https://api.pexels.com/v1'

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  private async makeRequest<T>(endpoint: string, params?: Record<string, string | number>): Promise<T> {
    if (!this.apiKey) {
      throw new Error('Pexels API key not configured. Please set VITE_PEXELS_API_KEY in your environment variables.')
    }

    const url = new URL(`${this.baseUrl}${endpoint}`)
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, value.toString())
        }
      })
    }

    try {
      const response = await fetch(url.toString(), {
        headers: {
          'Authorization': this.apiKey,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Pexels API error: ${response.status} ${response.statusText} - ${errorText}`)
      }

      return response.json()
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        throw new Error('Network error: Unable to connect to Pexels API. Please check your internet connection.')
      }
      throw error
    }
  }

  async searchPhotos(params: PexelsSearchParams): Promise<PexelsSearchResponse> {
    const searchParams: Record<string, string | number> = {
      query: params.query,
      page: params.page || 1,
      per_page: Math.min(params.per_page || 15, 80), // Max 80 per page
    }

    if (params.orientation) {
      searchParams.orientation = params.orientation
    }
    if (params.size) {
      searchParams.size = params.size
    }
    if (params.color) {
      searchParams.color = params.color
    }
    if (params.locale) {
      searchParams.locale = params.locale
    }

    return this.makeRequest<PexelsSearchResponse>('/search', searchParams)
  }

  async getCuratedPhotos(page = 1, perPage = 15): Promise<PexelsSearchResponse> {
    return this.makeRequest<PexelsSearchResponse>('/curated', {
      page,
      per_page: Math.min(perPage, 80),
    })
  }

  async getPhoto(id: number): Promise<PexelsPhoto> {
    return this.makeRequest<PexelsPhoto>(`/photos/${id}`)
  }
}

// Create singleton instance
const pexelsApiKey = PEXELS_CONFIG.apiKey

export const pexelsService = new PexelsService(pexelsApiKey)

// Helper function to convert Pexels photo to BlockMedia format
export const convertPexelsPhotoToBlockMedia = (photo: PexelsPhoto): {
  type: 'image'
  src: string
  alt: string
  caption?: string
  width?: number
  height?: number
  pexelsData?: {
    id: number
    photographer: string
    photographer_url: string
    url: string
  }
} => ({
  type: 'image',
  src: photo.src.large, // Use large size by default
  alt: photo.alt || `Photo by ${photo.photographer}`,
  caption: `Photo by ${photo.photographer}`,
  width: photo.width,
  height: photo.height,
  pexelsData: {
    id: photo.id,
    photographer: photo.photographer,
    photographer_url: photo.photographer_url,
    url: photo.url,
  },
})
