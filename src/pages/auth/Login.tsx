import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/auth";
import { useNotificationContext } from "../../hooks/useNotificationContext";
import { authApi } from "../../api/endpoints";
import fondoImage from "../../assets/images/backgrounds/fondo.png?url";
import estudiantesImage from "../../assets/images/backgrounds/estudiantes.jpg?url";
import logoImage from "../../assets/images/logos/logo.png?url";
import { 
  FiUser, 
  FiLock, 
  FiEye, 
  FiEyeOff, 
  FiLogIn, 
  FiLoader,
  FiBookOpen,
  FiCpu,
  FiDownload,
  FiShield
} from "react-icons/fi";

export function Login() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
    <div
      className="h-screen flex flex-col lg:flex-row relative overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)",
      }}
    >
      {/* Mobile Background Image - Only visible on mobile, shows complete image */}
      <div className="lg:hidden absolute inset-0 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${fondoImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        />
        {/* Gradient overlay for better text readability - with increased opacity */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-black/30" />
      </div>

      {/* Mobile Header - Only visible on mobile */}
      <div className="lg:hidden w-full pt-8 pb-2 px-4 relative z-10">
        <div className="flex items-center justify-center">
          {/* Logo a la izquierda */}
          <div className="w-16 h-16 flex items-center justify-center mr-2">
            <img
              src={logoImage}
              alt="EduGen Logo"
              className="w-full h-full object-contain"
            />
          </div>
          
          {/* EduGen y Sistema Educativo Integral al lado derecho */}
          <div className="text-left">
            <h1 className="text-2xl font-bold text-white drop-shadow-lg mb-1">EduGen</h1>
            <p className="text-white/80 text-sm">Sistema Educativo Integral</p>
          </div>
        </div>
      </div>

      {/* Left Section - Background and Info - Hidden on mobile, visible on tablet+ */}
      <div className="hidden md:flex md:w-1/2 lg:w-2/3 relative overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${estudiantesImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />

        <div className="relative z-10 p-6 lg:p-12 flex flex-col justify-center text-white">
          <h2 className="text-3xl lg:text-6xl font-bold mb-6 lg:mb-8 leading-tight text-white drop-shadow-2xl" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8), 0 0 20px rgba(0,0,0,0.5)' }}>
            Sistema Educativo EduGen
          </h2>
          <div className="mb-8 lg:mb-12 max-w-2xl">
            <div className="bg-secondary/20 backdrop-blur-sm rounded-xl p-4 lg:p-8 border border-secondary/30">
              <p className="text-lg lg:text-2xl leading-relaxed font-medium text-white drop-shadow-lg" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.7)' }}>
                Plataforma integral para la gestión educativa que conecta
                directores, profesores y estudiantes en un entorno digital moderno y
                eficiente.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-8">
            <div className="bg-secondary/15 backdrop-blur-sm rounded-xl p-4 lg:p-6 border border-secondary/25 hover:bg-secondary/20 transition-all duration-300">
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-secondary/30 rounded-xl flex items-center justify-center mb-3 lg:mb-4">
                <FiShield className="w-5 h-5 lg:w-7 lg:h-7 text-secondary" />
              </div>
              <h3 className="text-lg lg:text-xl font-bold mb-2 text-white">Administración</h3>
              <p className="text-sm lg:text-base text-white/80">Gestión académica completa</p>
            </div>

            <div className="bg-secondary/15 backdrop-blur-sm rounded-xl p-4 lg:p-6 border border-secondary/25 hover:bg-secondary/20 transition-all duration-300">
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-secondary/30 rounded-xl flex items-center justify-center mb-3 lg:mb-4">
                <FiBookOpen className="w-5 h-5 lg:w-7 lg:h-7 text-secondary" />
              </div>
              <h3 className="text-lg lg:text-xl font-bold mb-2 text-white">Portafolios</h3>
              <p className="text-sm lg:text-base text-white/80">Seguimiento digital</p>
            </div>

            <div className="bg-secondary/15 backdrop-blur-sm rounded-xl p-4 lg:p-6 border border-secondary/25 hover:bg-secondary/20 transition-all duration-300">
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-secondary/30 rounded-xl flex items-center justify-center mb-3 lg:mb-4">
                <FiCpu className="w-5 h-5 lg:w-7 lg:h-7 text-secondary" />
              </div>
              <h3 className="text-lg lg:text-xl font-bold mb-2 text-white">IA Educativa</h3>
              <p className="text-sm lg:text-base text-white/80">Contenido automatizado</p>
            </div>

            <div className="bg-secondary/15 backdrop-blur-sm rounded-xl p-4 lg:p-6 border border-secondary/25 hover:bg-secondary/20 transition-all duration-300">
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-secondary/30 rounded-xl flex items-center justify-center mb-3 lg:mb-4">
                <FiDownload className="w-5 h-5 lg:w-7 lg:h-7 text-secondary" />
              </div>
              <h3 className="text-lg lg:text-xl font-bold mb-2 text-white">SCORM</h3>
              <p className="text-sm lg:text-base text-white/80">Exportación estándar</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Section - Login Form */}
      <div className="w-full md:w-1/2 lg:w-1/3 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative z-10 flex-1 lg:flex-none h-full md:h-auto">
        <div className="w-full max-w-sm sm:max-w-md mx-auto">
          <div
            className="rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-sm"
            style={{
              background:
                "linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)",
            }}
          >
            {/* Logo - Hidden on mobile, shown on tablet+ */}
            <div className="hidden md:block text-center mb-6 lg:mb-8">
              <div className="w-16 h-16 lg:w-20 lg:h-20 bg-white/10 rounded-xl flex items-center justify-center mx-auto mb-4 p-2 border-2 border-white/30 hover:bg-white/20 transition-all duration-300">
                <img
                  src={logoImage}
                  alt="EduGen Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <h2 className="text-2xl lg:text-3xl font-bold text-white mb-2 drop-shadow-lg">¡Bienvenido!</h2>
              <p className="text-white/80 text-base lg:text-lg">Accede a tu plataforma educativa</p>
            </div>

            {/* Mobile Welcome Text */}
            <div className="md:hidden text-center mb-6">
              <h2 className="text-2xl font-bold text-white mb-2 drop-shadow-lg">¡Bienvenido!</h2>
              <p className="text-white/80 text-sm">Accede a tu plataforma educativa</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div>
                <label
                  htmlFor="username"
                  className="flex items-center text-white/90 text-sm font-medium mb-2"
                >
                  <FiUser className="w-4 h-4 mr-2" />
                  Usuario o Email
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white rounded-lg border-0 focus:ring-2 focus:ring-white/50 focus:outline-none text-gray-900 placeholder-gray-500 transition-all duration-200 hover:shadow-lg focus:shadow-xl text-sm sm:text-base"
                  placeholder="246810diegosr@gmail.com"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="flex items-center text-white/90 text-sm font-medium mb-2"
                >
                  <FiLock className="w-4 h-4 mr-2" />
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
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white rounded-lg border-0 focus:ring-2 focus:ring-white/50 focus:outline-none text-gray-900 placeholder-gray-500 pr-10 sm:pr-12 transition-all duration-200 hover:shadow-lg focus:shadow-xl text-sm sm:text-base"
                    placeholder="••••••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors p-1"
                  >
                    {showPassword ? (
                      <FiEyeOff className="w-4 h-4 sm:w-5 sm:h-5" />
                    ) : (
                      <FiEye className="w-4 h-4 sm:w-5 sm:h-5" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full font-semibold py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center hover:scale-105 active:scale-95 text-sm sm:text-base"
                style={{
                  background:
                    "linear-gradient(90deg, var(--color-base-100) 0%, rgba(255,255,255,0.9) 100%)",
                  color: "var(--color-primary)",
                }}
              >
                {loading ? (
                  <FiLoader className="w-4 h-4 sm:w-5 sm:h-5 mr-2 animate-spin" />
                ) : (
                  <FiLogIn className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                )}
                {loading ? "Iniciando sesión..." : "Ingresar"}
              </button>
            </form>

            <div className="text-center mt-6 sm:mt-8">
              <p className="text-white/60 text-xs">
                © 2025 Sistema Educativo EduGen
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
