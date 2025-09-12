import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/auth'

export function Logout() {
  const { logout } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    logout()
    navigate('/login')
  }, [logout, navigate])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900">Cerrando sesión...</h2>
        <p className="text-gray-600">Redirigiendo al login</p>
      </div>
    </div>
  )
}
