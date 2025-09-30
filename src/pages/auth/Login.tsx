import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/auth";
import { useNotificationContext } from "../../hooks/useNotificationContext";
import { authApi } from "../../api/endpoints";
import { 
  GraduationCap, 
  User, 
  Lock, 
  Eye, 
  EyeOff, 
  LogIn, 
  Loader2,
  ArrowLeft,
  Menu,
  X
} from "lucide-react";
import logoImage from "../../assets/images/logos/logo.png";

export function Login() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { login } = useAuthStore();
  const { showSuccess, showError } = useNotificationContext();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authApi.login(formData);
      const { user, access, refresh } = response.data;

      login(user, access, refresh);
      
      // Mostrar notificación de éxito
      showSuccess(
        "¡Inicio de Sesión Exitoso!",
        `Bienvenido de vuelta, ${user.first_name} ${user.last_name}. Has iniciado sesión correctamente.`,
        { duration: 4000 }
      );
      
      navigate("/dashboard");
    } catch (err: unknown) {
      const errorMessage =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { error?: string } } }).response?.data
              ?.error
          : "Error al iniciar sesión";
      
      // Mostrar notificación de error
      showError(
        "Error al Iniciar Sesión",
        errorMessage || "Credenciales incorrectas. Verifica tu usuario y contraseña.",
        { duration: 5000 }
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Navigation */}
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center">
              <div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center mr-2 sm:mr-3">
                <img
                  src={logoImage}
                  alt="EDUGEN Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                EDUGEN
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/" className="text-gray-700 hover:text-primary transition-colors flex items-center">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver al inicio
              </Link>
              <Link to="/contact" className="text-gray-700 hover:text-primary transition-colors">
                Contacto
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-gray-700 hover:text-primary"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden bg-white border-t">
              <div className="px-2 pt-2 pb-3 space-y-1">
                <Link to="/" className="block px-3 py-2 text-gray-700 hover:text-primary flex items-center">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Volver al inicio
                </Link>
                <Link to="/contact" className="block px-3 py-2 text-gray-700 hover:text-primary">
                  Contacto
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Login Section */}
      <section className="py-8 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Section - Information - Hidden on mobile */}
            <div className="hidden lg:block lg:order-1">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Bienvenido a
                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  {' '}EDUGEN
                </span>
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Plataforma educativa integral con Inteligencia Artificial para instituciones modernas.
                Accede a tu cuenta para comenzar.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                  <div className="bg-gradient-to-r from-primary to-secondary p-3 rounded-lg text-white mb-4 w-fit">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Gestión Académica</h3>
                  <p className="text-gray-600">Sistema completo para administrar cursos, estudiantes y profesores</p>
                </div>
                
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                  <div className="bg-gradient-to-r from-primary to-secondary p-3 rounded-lg text-white mb-4 w-fit">
                    <User className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Roles Específicos</h3>
                  <p className="text-gray-600">Funcionalidades adaptadas para directores, profesores y estudiantes</p>
                </div>
              </div>

              <div className="mt-8 p-6 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl border border-primary/20">
                <h4 className="font-semibold text-gray-800 mb-2">¿Primera vez en EDUGEN?</h4>
                <p className="text-gray-600 text-sm mb-4">
                  Contáctanos para obtener acceso a nuestra plataforma educativa y descubrir cómo puede transformar tu institución.
                </p>
                <Link
                  to="/contact"
                  className="inline-flex items-center text-primary hover:text-primary-focus font-medium"
                >
                  Solicitar acceso
                  <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
                </Link>
              </div>
            </div>

            {/* Login Form - Full width on mobile, half width on desktop */}
            <div className="w-full lg:max-w-md lg:mx-auto lg:order-2">
              <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-2xl border border-gray-100">
                <div className="text-center mb-6 sm:mb-8">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center mx-auto mb-4">
                    <img
                      src={logoImage}
                      alt="EDUGEN Logo"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Iniciar Sesión</h2>
                  <p className="text-sm sm:text-base text-gray-600">Accede a tu plataforma educativa</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
                  <div>
                    <label
                      htmlFor="username"
                      className="flex items-center text-gray-700 text-sm font-medium mb-2"
                    >
                      <User className="w-4 h-4 mr-2" />
                      Usuario o Email
                    </label>
                    <input
                      type="text"
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 sm:py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 text-base"
                      placeholder="tu@email.com"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="password"
                      className="flex items-center text-gray-700 text-sm font-medium mb-2"
                    >
                      <Lock className="w-4 h-4 mr-2" />
                      Contraseña
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 sm:py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent pr-12 transition-all duration-200 text-base"
                        placeholder="••••••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-primary to-secondary text-white font-semibold py-4 px-6 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center hover:shadow-lg transform hover:-translate-y-1 text-base"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    ) : (
                      <LogIn className="w-5 h-5 mr-2" />
                    )}
                    {loading ? "Iniciando sesión..." : "Ingresar"}
                  </button>
                </form>

                <div className="text-center mt-6 sm:mt-8">
                  <p className="text-gray-500 text-sm">
                    © 2024 EDUGEN. Todos los derechos reservados.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
