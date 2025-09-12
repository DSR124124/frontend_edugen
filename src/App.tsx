import { AppRouter } from './app/router'
import { AppProviders } from './app/providers'
import { ErrorBoundary } from './components/ErrorBoundary'
import { ErrorProvider } from './contexts/ErrorContext'
import { ToastContainer } from './components/ui/Toast'
import { TokenExpiredModal } from './components/TokenExpiredModal'
import { LoadingScreen } from './components/LoadingScreen'
import { useTokenExpiry } from './hooks/useTokenExpiry'

// Componente interno que usa el hook dentro del ErrorProvider
function AppContent() {
  const { isTokenExpired, isRedirecting, handleRedirectToLogin, dismissModal } = useTokenExpiry()

  return (
    <div className="min-h-screen bg-gray-50">
      <AppRouter />
      <ToastContainer />
      <TokenExpiredModal
        isOpen={isTokenExpired}
        onClose={dismissModal}
        onRedirectToLogin={handleRedirectToLogin}
      />
      {isRedirecting && (
        <LoadingScreen message="Redirigiendo al login..." />
      )}
    </div>
  )
}

function App() {
  return (
    <ErrorBoundary>
      <ErrorProvider>
        <AppProviders>
          <AppContent />
        </AppProviders>
      </ErrorProvider>
    </ErrorBoundary>
  )
}

export default App