import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/auth";
import { useNotificationContext } from "../../hooks/useNotificationContext";
import { authApi } from "../../api/endpoints";
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
      className="min-h-screen flex"
      style={{
        background:
          "linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)",
      }}
    >
      {/* Left Section - Background and Info */}
      <div className="hidden lg:flex lg:w-2/3 relative overflow-hidden">
        {/* Gradient Overlay */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${estudiantesImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />

        <div className="relative z-10 p-12 flex flex-col justify-center text-white">
          <h2 className="text-6xl font-bold mb-8 leading-tight text-white drop-shadow-2xl" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8), 0 0 20px rgba(0,0,0,0.5)' }}>Sistema Educativo EduGen</h2>
          <div className="mb-12 max-w-2xl">
            <div className="bg-secondary/20 backdrop-blur-sm rounded-xl p-8 border border-secondary/30">
              <p className="text-2xl leading-relaxed font-medium text-white drop-shadow-lg" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.7)' }}>
                Plataforma integral para la gestión educativa que conecta
                directores, profesores y estudiantes en un entorno digital moderno y
                eficiente.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div className="bg-secondary/15 backdrop-blur-sm rounded-xl p-6 border border-secondary/25 hover:bg-secondary/20 transition-all duration-300">
              <div className="w-12 h-12 bg-secondary/30 rounded-xl flex items-center justify-center mb-4">
                <FiShield className="w-7 h-7 text-secondary" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-white">Administración</h3>
              <p className="text-base text-white/80">Gestión académica completa</p>
            </div>

            <div className="bg-secondary/15 backdrop-blur-sm rounded-xl p-6 border border-secondary/25 hover:bg-secondary/20 transition-all duration-300">
              <div className="w-12 h-12 bg-secondary/30 rounded-xl flex items-center justify-center mb-4">
                <FiBookOpen className="w-7 h-7 text-secondary" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-white">Portafolios</h3>
              <p className="text-base text-white/80">Seguimiento digital</p>
            </div>

            <div className="bg-secondary/15 backdrop-blur-sm rounded-xl p-6 border border-secondary/25 hover:bg-secondary/20 transition-all duration-300">
              <div className="w-12 h-12 bg-secondary/30 rounded-xl flex items-center justify-center mb-4">
                <FiCpu className="w-7 h-7 text-secondary" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-white">IA Educativa</h3>
              <p className="text-base text-white/80">Contenido automatizado</p>
            </div>

            <div className="bg-secondary/15 backdrop-blur-sm rounded-xl p-6 border border-secondary/25 hover:bg-secondary/20 transition-all duration-300">
              <div className="w-12 h-12 bg-secondary/30 rounded-xl flex items-center justify-center mb-4">
                <FiDownload className="w-7 h-7 text-secondary" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-white">SCORM</h3>
              <p className="text-base text-white/80">Exportación estándar</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Section - Login Form */}
      <div className="w-full lg:w-1/3 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div
            className="rounded-2xl p-8 shadow-2xl"
            style={{
              background:
                "linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)",
            }}
          >
            {/* Logo */}
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-white/10 rounded-xl flex items-center justify-center mx-auto mb-4 p-2 border-2 border-white/30 hover:bg-white/20 transition-all duration-300">
                <img
                  src={logoImage}
                  alt="EduGen Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <h2 className="text-3xl font-bold text-white mb-2 drop-shadow-lg">¡Bienvenido!</h2>
              <p className="text-white/80 text-lg">Accede a tu plataforma educativa</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
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
                  className="w-full px-4 py-3 bg-white rounded-lg border-0 focus:ring-2 focus:ring-white/50 focus:outline-none text-gray-900 placeholder-gray-500 transition-all duration-200 hover:shadow-lg focus:shadow-xl"
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
                    className="w-full px-4 py-3 bg-white rounded-lg border-0 focus:ring-2 focus:ring-white/50 focus:outline-none text-gray-900 placeholder-gray-500 pr-12 transition-all duration-200 hover:shadow-lg focus:shadow-xl"
                    placeholder="••••••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    {showPassword ? (
                      <FiEyeOff className="w-5 h-5" />
                    ) : (
                      <FiEye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>


              <button
                type="submit"
                disabled={loading}
                className="w-full font-semibold py-3 px-6 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center hover:scale-105 active:scale-95"
                style={{
                  background:
                    "linear-gradient(90deg, var(--color-base-100) 0%, rgba(255,255,255,0.9) 100%)",
                  color: "var(--color-primary)",
                }}
              >
                {loading ? (
                  <FiLoader className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                  <FiLogIn className="w-5 h-5 mr-2" />
                )}
                {loading ? "Iniciando sesión..." : "Ingresar"}
              </button>
            </form>

            <div className="text-center mt-8">
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
