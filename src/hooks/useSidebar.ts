import { useEffect } from 'react'
import { useUIStore } from '../store/ui'

export function useSidebar() {
  const { sidebarOpen, setSidebarOpen, toggleSidebar } = useUIStore()

  const closeSidebarOnMobile = () => {
    if (window.innerWidth < 768) {
      setSidebarOpen(false)
    }
  }

  const isMobile = () => window.innerWidth < 768

  // Handle window resize to close sidebar on mobile when switching to desktop
  useEffect(() => {
    const handleResize = () => {
      if (!isMobile() && sidebarOpen) {
        // On desktop, keep sidebar open if it was open
        return
      }
      if (isMobile() && sidebarOpen) {
        // On mobile, close sidebar when resizing
        setSidebarOpen(false)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [sidebarOpen, setSidebarOpen])

  // Initialize sidebar state based on screen size
  useEffect(() => {
    if (isMobile()) {
      setSidebarOpen(false)
    }
  }, [setSidebarOpen])

  return {
    sidebarOpen,
    setSidebarOpen,
    toggleSidebar,
    closeSidebarOnMobile,
    isMobile: isMobile(),
  }
}
