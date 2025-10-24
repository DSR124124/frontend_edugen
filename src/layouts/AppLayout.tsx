import { ReactNode } from 'react'
import { useUIStore } from '../store/ui'
import { Header } from '../components/layout/Header'
import { Sidebar } from '../components/layout/Sidebar'
import { TourProvider } from '../contexts/TourContext'

interface AppLayoutProps {
  children: ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const { sidebarOpen } = useUIStore()

  return (
    <TourProvider>
      <div className="min-h-screen bg-base-200">
        <div className="flex min-h-screen">
          <Sidebar />
          <div className={`flex-1 transition-all duration-300 ${
            sidebarOpen ? 'md:ml-64 ml-0' : 'ml-0'
          }`}>
            <Header />
            <main className="min-h-0 flex-1">
              <div className="p-3 sm:p-4 lg:p-6 min-h-0">
                {children}
              </div>
            </main>
          </div>
        </div>
      </div>
    </TourProvider>
  )
}
