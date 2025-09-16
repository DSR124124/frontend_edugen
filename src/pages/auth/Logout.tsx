import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export function Logout() {
  const navigate = useNavigate()

  useEffect(() => {
    // Redirigir inmediatamente al login
    navigate('/login')
  }, [navigate])

  return (
    <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: 'var(--color-base-200)' }}>
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-primary-100)' }}>
          <svg className="w-8 h-8 animate-spin" style={{ color: 'var(--color-primary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </div>
        <h2 className="headline-xl text-base-content mb-2">Redirigiendo...</h2>
        <p className="text-base-content/70">Volviendo al login</p>
      </div>
    </div>
  )
}
