// Configuración temporal de Pexels para debugging
// En producción, esto debería venir de las variables de entorno

export const PEXELS_CONFIG = {
  // Clave de API hardcodeada temporalmente para testing
  API_KEY: 'YtfEKdhkHCLouK3p62qgjrWtBOrYQXQ8prLKcfiN6dsJvAiCnMSWUm0Y',
  
  // También intentar cargar desde variables de entorno
  get apiKey() {
    const envKey = import.meta.env.VITE_PEXELS_API_KEY
    
    // Priorizar la variable de entorno si existe, sino usar la hardcodeada
    const finalKey = envKey || this.API_KEY
    
    return finalKey
  }
}
