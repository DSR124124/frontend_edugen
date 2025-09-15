import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/auth";
import { useNotificationContext } from "../../contexts/NotificationContext";
import { authApi } from "../../api/endpoints";
import estudiantesImage from "../../assets/images/backgrounds/estudiantes.jpg?url";
import logoImage from "../../assets/images/logos/logo.png?url";

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
        4000
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
        "❌ Error al Iniciar Sesión",
        errorMessage || "Credenciales incorrectas. Verifica tu usuario y contraseña.",
        5000
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
          <h2 className="headline-4xl mb-6">Sistema Educativo EduGen</h2>
          <p className="text-large mb-12 max-w-lg">
            Plataforma integral para la gestión educativa que conecta
            directores, profesores y estudiantes en un entorno digital moderno y
            eficiente.
          </p>

          <div className="grid grid-cols-2 gap-6">
            <div
              className="bg-white/20 backdrop-blur-sm rounded-lg p-4"
              style={{
                backgroundColor: "var(--color-secondary)",
                backgroundSize: "cover",
              }}
            >
              <div className="w-8 h-8 bg-white/30 rounded-lg flex items-center justify-center mb-3">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.429 3.054 9.087 9.087 0 01-1.944.761z" />
                </svg>
              </div>
              <h3 className="font-semibold mb-1">Administración</h3>
              <p className="text-sm opacity-90">Gestión académica completa</p>
            </div>

            <div
              className="bg-white/20 backdrop-blur-sm rounded-lg p-4"
              style={{
                backgroundColor: "var(--color-secondary)",
                backgroundSize: "cover",
              }}
            >
              <div className="w-8 h-8 bg-white/30 rounded-lg flex items-center justify-center mb-3">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm2 6a2 2 0 114 0 2 2 0 01-4 0zm2 4a2 2 0 100 4 2 2 0 000-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <h3 className="font-semibold mb-1">Portafolios</h3>
              <p className="text-sm opacity-90">Seguimiento digital</p>
            </div>

            <div
              className="bg-white/20 backdrop-blur-sm rounded-lg p-4"
              style={{
                backgroundColor: "var(--color-secondary)",
                backgroundSize: "cover",
              }}
            >
              <div className="w-8 h-8 bg-white/30 rounded-lg flex items-center justify-center mb-3">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <h3 className="font-semibold mb-1">IA Educativa</h3>
              <p className="text-sm opacity-90">Contenido automatizado</p>
            </div>

            <div
              className="bg-white/20 backdrop-blur-sm rounded-lg p-4"
              style={{
                backgroundColor: "var(--color-secondary)",
                backgroundSize: "cover",
              }}
            >
              <div className="w-8 h-8 bg-white/30 rounded-lg flex items-center justify-center mb-3">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <h3 className="font-semibold mb-1">SCORM</h3>
              <p className="text-sm opacity-90">Exportación estándar</p>
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
              <div className="w-20 h-20 bg-white/10 rounded-xl flex items-center justify-center mx-auto mb-4 p-2 border-2 border-white/30">
                <img
                  src={logoImage}
                  alt="EduGen Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <h2 className="headline-2xl text-white mb-2">¡Bienvenido!</h2>
              <p className="text-white/80">Accede a tu plataforma educativa</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="username"
                  className="flex items-center text-white/90 text-sm font-medium mb-2"
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Usuario o Email
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-white rounded-lg border-0 focus:ring-2 focus:ring-white/50 focus:outline-none text-gray-900 placeholder-gray-500"
                  placeholder="246810diegosr@gmail.com"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="flex items-center text-white/90 text-sm font-medium mb-2"
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                      clipRule="evenodd"
                    />
                  </svg>
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
                    className="w-full px-4 py-3 bg-white rounded-lg border-0 focus:ring-2 focus:ring-white/50 focus:outline-none text-gray-900 placeholder-gray-500 pr-12"
                    placeholder="••••••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      {showPassword ? (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                        />
                      ) : (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      )}
                    </svg>
                  </button>
                </div>
              </div>


              <button
                type="submit"
                disabled={loading}
                className="w-full font-semibold py-3 px-6 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                style={{
                  background:
                    "linear-gradient(90deg, var(--color-base-100) 0%, rgba(255,255,255,0.9) 100%)",
                  color: "var(--color-primary)",
                }}
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
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
