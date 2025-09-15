import { useUIStore } from '../store/ui'

export function useSidebar() {
  const { sidebarOpen, setSidebarOpen, toggleSidebar } = useUIStore()

  const closeSidebarOnMobile = () => {
    if (window.innerWidth < 768) {
      setSidebarOpen(false)
    }
  }

  return {
    sidebarOpen,
    setSidebarOpen,
    toggleSidebar,
    closeSidebarOnMobile,
  }
}
