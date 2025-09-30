import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { 
  BookOpen, 
  Brain, 
  BarChart3, 
  Zap, 
  ArrowRight,
  Menu,
  X
} from 'lucide-react'
import logoImage from '../../assets/images/logos/logo.png'


export function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-neutral to-secondary-800 relative overflow-hidden">
      {/* Futuristic Energy Points Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Energy Orbs - Floating Light Points */}
        <div className="absolute inset-0">
          {/* Primary Energy Points */}
          <div className="absolute top-20 right-20 w-4 h-4 bg-accent rounded-full opacity-70 animate-pulse" style={{animationDuration: '2s', boxShadow: '0 0 20px #00CFFF'}}></div>
          <div className="absolute top-40 left-32 w-3 h-3 bg-primary rounded-full opacity-60 animate-pulse" style={{animationDelay: '1s', animationDuration: '3s', boxShadow: '0 0 15px #005CFF'}}></div>
          <div className="absolute bottom-32 right-40 w-5 h-5 bg-secondary rounded-full opacity-80 animate-pulse" style={{animationDelay: '0.5s', animationDuration: '2.5s', boxShadow: '0 0 25px #A142F5'}}></div>
          <div className="absolute top-60 left-20 w-2 h-2 bg-accent rounded-full opacity-50 animate-pulse" style={{animationDelay: '2s', animationDuration: '4s', boxShadow: '0 0 10px #00CFFF'}}></div>
          <div className="absolute bottom-60 left-60 w-4 h-4 bg-primary rounded-full opacity-70 animate-pulse" style={{animationDelay: '1.5s', animationDuration: '3.5s', boxShadow: '0 0 18px #005CFF'}}></div>
          
          {/* Additional Scattered Points */}
          <div className="absolute top-32 left-3/4 w-3 h-3 bg-secondary rounded-full opacity-60 animate-pulse" style={{animationDelay: '0.8s', animationDuration: '3.2s', boxShadow: '0 0 12px #A142F5'}}></div>
          <div className="absolute bottom-40 left-1/4 w-2 h-2 bg-accent rounded-full opacity-55 animate-pulse" style={{animationDelay: '2.3s', animationDuration: '2.8s', boxShadow: '0 0 8px #00CFFF'}}></div>
          <div className="absolute top-3/4 right-1/3 w-4 h-4 bg-primary rounded-full opacity-65 animate-pulse" style={{animationDelay: '1.2s', animationDuration: '4.2s', boxShadow: '0 0 16px #005CFF'}}></div>
          <div className="absolute top-1/6 left-1/2 w-2 h-2 bg-secondary rounded-full opacity-45 animate-pulse" style={{animationDelay: '3s', animationDuration: '2.6s', boxShadow: '0 0 9px #A142F5'}}></div>
          <div className="absolute bottom-1/5 right-1/6 w-3 h-3 bg-accent rounded-full opacity-75 animate-pulse" style={{animationDelay: '0.3s', animationDuration: '3.8s', boxShadow: '0 0 14px #00CFFF'}}></div>
          
          {/* Micro Points for Depth */}
          <div className="absolute top-1/3 left-1/5 w-1 h-1 bg-primary rounded-full opacity-40 animate-pulse" style={{animationDelay: '1.8s', animationDuration: '2.2s', boxShadow: '0 0 6px #005CFF'}}></div>
          <div className="absolute bottom-1/4 left-3/5 w-1 h-1 bg-accent rounded-full opacity-35 animate-pulse" style={{animationDelay: '2.7s', animationDuration: '3.4s', boxShadow: '0 0 4px #00CFFF'}}></div>
          <div className="absolute top-2/3 right-1/5 w-1 h-1 bg-secondary rounded-full opacity-30 animate-pulse" style={{animationDelay: '0.7s', animationDuration: '2.9s', boxShadow: '0 0 5px #A142F5'}}></div>
          <div className="absolute top-1/5 right-2/5 w-1 h-1 bg-primary rounded-full opacity-45 animate-pulse" style={{animationDelay: '2.1s', animationDuration: '3.1s', boxShadow: '0 0 7px #005CFF'}}></div>
          <div className="absolute bottom-2/3 left-2/3 w-1 h-1 bg-accent rounded-full opacity-40 animate-pulse" style={{animationDelay: '1.4s', animationDuration: '2.4s', boxShadow: '0 0 5px #00CFFF'}}></div>
        </div>
        
        {/* Holographic Glow Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse" style={{animationDuration: '6s'}}></div>
          <div className="absolute bottom-10 right-10 w-80 h-80 bg-primary/8 rounded-full blur-3xl animate-pulse" style={{animationDelay: '3s', animationDuration: '7s'}}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-secondary/6 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1.5s', animationDuration: '8s'}}></div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="bg-black/30 backdrop-blur-xl border-b border-white/5 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center mr-2 sm:mr-3">
                <img
                  src={logoImage}
                  alt="EDUGEN Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
                EDUGEN
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/contact" className="text-white/80 hover:text-accent transition-colors font-medium">
                Contacto
              </Link>
              <button
                onClick={() => navigate('/login')}
                className="text-white/80 hover:text-accent transition-colors font-medium"
              >
                Demo
              </button>
              <button
                onClick={() => navigate('/login')}
                className="bg-gradient-to-r from-primary to-secondary text-white px-6 py-2 rounded-lg hover:shadow-2xl hover:shadow-primary/25 transition-all duration-300 transform hover:-translate-y-1 border border-accent/20 backdrop-blur-sm"
              >
                Iniciar Sesión
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-white/80 hover:text-accent"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden bg-black/50 backdrop-blur-xl border-t border-white/10">
              <div className="px-2 pt-2 pb-3 space-y-1">
                <Link 
                  to="/contact" 
                  className="block px-3 py-2 text-white/80 hover:text-accent font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Contacto
                </Link>
                <button
                  onClick={() => {
                    navigate('/login')
                    setMobileMenuOpen(false)
                  }}
                  className="block w-full text-left px-3 py-2 text-white/80 hover:text-accent font-medium"
                >
                  Demo
                </button>
                <button
                  onClick={() => {
                    navigate('/login')
                    setMobileMenuOpen(false)
                  }}
                  className="w-full text-left bg-gradient-to-r from-primary to-secondary text-white px-3 py-2 rounded-lg mt-2 border border-accent/20"
                >
                  Iniciar Sesión
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-8 animate-fade-in-up">
              <Brain className="w-4 h-4 text-accent mr-2" />
              <span className="text-white/90 text-sm font-medium">Potenciado por Inteligencia Artificial</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-8 animate-fade-in-up leading-tight" style={{ animationDelay: '200ms' }}>
              El Futuro de la
              <br />
              <span className="bg-gradient-to-r from-accent via-primary to-secondary bg-clip-text text-transparent">
                Educación Digital
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-white/80 mb-12 max-w-4xl mx-auto animate-fade-in-up leading-relaxed" style={{ animationDelay: '400ms' }}>
              Plataforma educativa de próxima generación que integra 
              <span className="text-accent font-semibold"> Inteligencia Artificial </span>
              para revolucionar la enseñanza y el aprendizaje.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center animate-fade-in-up" style={{ animationDelay: '600ms' }}>
              <button
                onClick={() => navigate('/login')}
                className="group bg-gradient-to-r from-primary to-secondary text-white px-10 py-5 rounded-xl text-lg font-semibold hover:shadow-2xl hover:shadow-primary/25 transition-all duration-500 transform hover:-translate-y-2 flex items-center justify-center border border-accent/20 backdrop-blur-sm"
              >
                <span>Comenzar Ahora</span>
                <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="group border-2 border-accent/50 text-white px-10 py-5 rounded-xl text-lg font-semibold hover:bg-accent/10 hover:border-accent transition-all duration-500 backdrop-blur-sm">
                <span>Ver Demo</span>
                <Zap className="w-5 h-5 ml-3 inline group-hover:text-accent transition-colors" />
              </button>
            </div>

            {/* Floating Tech Elements - Hidden on mobile, visible on large screens */}
            <div className="hidden xl:block absolute top-20 left-20 animate-bounce" style={{animationDelay: '1s', animationDuration: '4s'}}>
              <div className="w-16 h-16 bg-accent/20 rounded-xl backdrop-blur-sm border border-accent/30 flex items-center justify-center">
                <Brain className="w-8 h-8 text-accent" />
              </div>
            </div>
            <div className="hidden xl:block absolute top-40 right-32 animate-bounce" style={{animationDelay: '2s', animationDuration: '5s'}}>
              <div className="w-12 h-12 bg-secondary/20 rounded-lg backdrop-blur-sm border border-secondary/30 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-secondary" />
              </div>
            </div>
            <div className="hidden xl:block absolute bottom-32 left-32 animate-bounce" style={{animationDelay: '0.5s', animationDuration: '6s'}}>
              <div className="w-14 h-14 bg-primary/20 rounded-2xl backdrop-blur-sm border border-primary/30 flex items-center justify-center">
                <BarChart3 className="w-7 h-7 text-primary" />
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}
