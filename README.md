# Frontend EDUGEN - Sistema de Gestión Educativa

Frontend del sistema EDUGEN construido con React + TypeScript + Vite, diseñado para gestionar instituciones educativas con funcionalidades avanzadas de IA.

## 🚀 Características Principales

- **Sistema de usuarios con roles**: Director, Profesor, Alumno
- **Gestión académica completa**: Cursos, secciones, materiales, evaluaciones
- **Portafolios digitales**: Para estudiantes con artefactos y evidencias
- **Generador de contenido con IA**: Integración con DeepSeek para creación automática
- **Analytics avanzados**: Seguimiento de materiales y rendimiento estudiantil
- **Editor visual**: GrapesJS para creación de contenido interactivo
- **Sistema de notificaciones**: Toast y modales para mejor UX

## 🛠️ Stack Tecnológico

### **Frontend Principal:**
- **React 19.1.1** - Framework principal
- **TypeScript 5.8.3** - Tipado estático
- **Vite 7.1.2** - Build tool y dev server
- **React Router DOM 7.9.0** - Enrutamiento

### **Estilos y UI:**
- **Tailwind CSS 3.4.0** - Framework de estilos
- **Lucide React 0.544.0** - Iconografía
- **Chart.js 4.5.0** - Gráficos y visualizaciones

### **Gestión de Estado:**
- **Zustand 5.0.8** - Estado global
- **TanStack Query 5.87.4** - Cache y sincronización de datos
- **Axios 1.12.1** - Cliente HTTP

### **Herramientas de Desarrollo:**
- **ESLint 9.33.0** - Linting
- **TypeScript ESLint 8.39.1** - Linting de TypeScript
- **PostCSS 8.5.6** - Procesamiento de CSS
- **Autoprefixer 10.4.21** - Prefijos CSS automáticos

## 📁 Estructura del Proyecto

```
frontend_edugen/src/
├── api/                    # Configuración de API
│   ├── client.ts          # Cliente HTTP con interceptores
│   ├── endpoints.ts       # Definición de endpoints y tipos
│   └── http.ts           # Configuración base HTTP
├── app/                   # Configuración de la aplicación
│   ├── providers.tsx     # Proveedores de contexto
│   └── router.tsx        # Configuración de rutas
├── components/            # Componentes reutilizables
│   ├── ai/               # Componentes de IA
│   ├── charts/           # Gráficos y visualizaciones
│   ├── common/           # Componentes comunes
│   ├── editor-tools/     # Herramientas de edición
│   ├── forms/            # Formularios
│   ├── kpi/              # Tarjetas de KPIs
│   ├── layout/           # Componentes de layout
│   ├── modals/           # Modales y diálogos
│   ├── notifications/    # Sistema de notificaciones
│   ├── tables/           # Tablas de datos
│   └── ui/               # Componentes UI básicos
├── contexts/             # Contextos de React
│   ├── AuthContext.tsx
│   ├── ErrorContext.tsx
│   └── NotificationContext.tsx
├── hooks/                # Hooks personalizados (21 archivos)
├── layouts/              # Layouts de página
│   ├── AppLayout.tsx
│   └── AuthLayout.tsx
├── pages/                # Páginas de la aplicación
│   ├── academic/         # Páginas académicas
│   ├── ai/              # Páginas de IA
│   ├── auth/            # Autenticación
│   ├── dashboard/       # Dashboards por rol
│   ├── director/        # Funcionalidades de director
│   ├── portfolios/      # Portafolios
│   ├── professor/       # Funcionalidades de profesor
│   ├── settings/        # Configuración
│   └── student/         # Funcionalidades de estudiante
├── store/                # Estado global (Zustand)
│   ├── auth.ts
│   ├── director.ts
│   ├── ui.ts
│   └── index.ts
├── styles/               # Estilos globales
├── utils/                # Utilidades
└── config/               # Configuración
    └── routes.ts         # Configuración de rutas
```

## 🎯 Funcionalidades por Rol

### **👨‍💼 DIRECTOR:**
- Dashboard administrativo con KPIs
- Gestión de usuarios (estudiantes, profesores)
- Gestión de secciones y niveles de grado
- Gestión de períodos académicos
- Configuración de institución
- Reportes y analytics avanzados

### **👨‍🏫 PROFESOR:**
- Dashboard de profesor con métricas
- Gestión de cursos y secciones
- Creación de temas y materiales
- Generador de contenido con IA
- Analytics de materiales y estudiantes
- Gestión de portafolios de estudiantes
- Sistema de actividades y evaluaciones

### **🎓 ALUMNO:**
- Dashboard de estudiante personalizado
- Visualización de sección asignada
- Acceso a materiales de clase
- Gestión de portafolio personal
- Seguimiento de actividades y progreso
- Sistema de notificaciones

## 🤖 Integración con IA

### **Componentes de IA:**
- **`ContentEditor.tsx`** - Editor de contenido avanzado
- **`DeepSeekChat.tsx`** - Chat conversacional con IA
- **`GrapesJSEditor.tsx`** - Editor visual drag-and-drop

### **Funcionalidades:**
- Generación automática de contenido educativo
- Chat conversacional con DeepSeek API
- Editor visual con GrapesJS
- Plantillas de contenido personalizables
- Gestión de conversaciones y historial
- Exportación de contenido generado

## 🔒 Seguridad y Autenticación

### **Sistema de Autenticación:**
- **JWT tokens** (access + refresh)
- **Interceptores automáticos** para renovación
- **Manejo de expiración** de tokens
- **Persistencia segura** en localStorage

### **Autorización:**
- **Rutas protegidas** por rol
- **Componentes condicionales** basados en permisos
- **Validación** en frontend y backend
- **Middleware de autenticación**

## 📊 Sistema de Analytics

### **Métricas de Materiales:**
- Seguimiento de visualizaciones
- Tiempo de interacción
- Tasa de finalización
- Análisis de comportamiento estudiantil

### **KPIs del Sistema:**
- Total de cursos y estudiantes
- Actividad de profesores
- Rendimiento académico
- Uso de materiales

## 🚀 Instalación y Configuración

### **Prerrequisitos:**
- Node.js 18+
- npm o yarn
- Backend EDUGEN ejecutándose

### **Instalación:**
```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con la URL del backend

# Ejecutar en desarrollo
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview
```

### **Variables de Entorno:**
```env
VITE_API_URL=https://tu-backend-url.com/api/v1/
VITE_APP_NAME=EDUGEN
VITE_APP_VERSION=1.0.0
```

## 🎨 Componentes Principales

### **UI Components:**
- `Button.tsx` - Botones reutilizables
- `Card.tsx` - Tarjetas de contenido
- `Input.tsx` - Campos de entrada
- `Modal.tsx` - Modales base
- `Toast.tsx` - Notificaciones toast

### **Layout Components:**
- `Header.tsx` - Barra de navegación
- `Sidebar.tsx` - Menú lateral
- `AppLayout.tsx` - Layout principal
- `AuthLayout.tsx` - Layout de autenticación

### **Specialized Components:**
- **AI Components**: Editor de contenido, Chat, GrapesJS
- **Charts**: Analytics, Gráficos de rendimiento
- **Forms**: Perfil de usuario, Formularios académicos
- **Tables**: Tablas de datos con paginación
- **Modals**: 20+ modales especializados

## 📱 Responsive Design

- **Mobile-first** approach
- **Tailwind CSS** para estilos responsivos
- **Componentes adaptativos**
- **Layouts flexibles**
- **Breakpoints optimizados**

## 🔧 Hooks Personalizados

El proyecto incluye **21 hooks personalizados**:

- `useApi.ts` - Manejo de llamadas API
- `useAuth.ts` - Autenticación
- `useMaterials.ts` - Gestión de materiales
- `usePortfolios.ts` - Portafolios
- `useTokenExpiry.ts` - Manejo de tokens
- `useNotifications.ts` - Sistema de notificaciones
- `usePagination.ts` - Paginación
- `useDebounce.ts` - Debouncing para búsquedas
- Y muchos más...

## 📈 Métricas del Proyecto

- **44 componentes** en total
- **29 páginas** organizadas por rol
- **21 hooks** personalizados
- **700+ líneas** de definiciones de API
- **4 stores** de Zustand
- **3 contextos** de React
- **20+ modales** especializados
- **100% TypeScript** con tipado completo

## 🚀 Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Servidor de desarrollo

# Build
npm run build        # Build de producción
npm run preview      # Preview del build

# Linting
npm run lint         # Ejecutar ESLint
```

## 🎯 Características Destacadas

1. **Arquitectura modular** y escalable
2. **Tipado completo** con TypeScript
3. **Gestión de estado** moderna con Zustand
4. **Integración robusta** con API REST
5. **Sistema de roles** bien definido
6. **Componentes reutilizables** y modulares
7. **Integración avanzada** con IA
8. **Sistema de notificaciones** completo
9. **Manejo de errores** centralizado
10. **Performance optimizada** con React Query

## 🤝 Contribución

1. Fork el proyecto
2. Crear rama para feature: `git checkout -b feature/nueva-funcionalidad`
3. Commit cambios: `git commit -m 'Agregar nueva funcionalidad'`
4. Push a la rama: `git push origin feature/nueva-funcionalidad`
5. Crear Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 👨‍💻 Autor

Desarrollado como parte de la tesis EDUGEN - Sistema de Gestión Educativa con IA

## 📞 Soporte

Para soporte técnico o consultas, contactar a través de los issues del repositorio.
