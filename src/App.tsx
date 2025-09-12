import { useAuthStore } from './store/auth'
import { AppRouter } from './app/router'
import { AppProviders } from './app/providers'

function App() {
  const { isAuthenticated } = useAuthStore()

  return (
    <AppProviders>
      <div className="min-h-screen bg-gray-50">
        <AppRouter />
      </div>
    </AppProviders>
  )
}

export default App