/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary Colors
        primary: '#005CFF',
        'primary-focus': '#0048CC',
        'primary-content': '#FFFFFF',
        
        // Secondary Colors
        secondary: '#A142F5',
        'secondary-focus': '#8535C7',
        'secondary-content': '#FFFFFF',
        
        // Accent Colors
        accent: '#00CFFF',
        'accent-focus': '#00A6CC',
        'accent-content': '#FFFFFF',
        
        // Neutral Colors
        neutral: '#3B0E6D',
        'neutral-focus': '#2F0A57',
        'neutral-content': '#FFFFFF',
        
        // Base Colors
        'base-100': '#FFFFFF',
        'base-200': '#F2F2F2',
        'base-300': '#E5E5E5',
        'base-content': '#0F0F1A',
        
        // State Colors
        info: '#0074EE',
        'info-content': '#FFFFFF',
        success: '#00BF4A',
        'success-content': '#0F0F1A',
        warning: '#F7A325',
        'warning-content': '#FFFFFF',
        error: '#FF3A24',
        'error-content': '#FFFFFF',
        
        // Additional utility colors for better contrast
        'primary-50': '#E6F2FF',
        'primary-100': '#CCE5FF',
        'primary-200': '#99CCFF',
        'primary-300': '#66B2FF',
        'primary-400': '#3399FF',
        'primary-500': '#005CFF',
        'primary-600': '#0048CC',
        'primary-700': '#003399',
        'primary-800': '#001F66',
        'primary-900': '#000A33',
      }
    },
  },
  plugins: [],
}
