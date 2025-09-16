import { ReactNode } from 'react'
import { useUIStore } from '../store/ui'
import { Header } from '../components/layout/Header'
import { Sidebar } from '../components/layout/Sidebar'

interface AppLayoutProps {
  children: ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const { sidebarOpen } = useUIStore()

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-base-200)' }}>
      <div className="flex">
        <Sidebar />
        <div className={`flex-1 transition-all duration-300 ${
          sidebarOpen ? 'ml-64' : 'ml-0'
        }`}>
          <Header />
          <main>
            <div className="p-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
