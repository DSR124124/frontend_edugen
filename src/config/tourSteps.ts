import { Step } from 'react-joyride'

// Tours específicos para Director
const getDirectorTourSteps = (tourType: string, commonSteps: Step[]): Step[] => {
  switch (tourType) {
    case 'general':
      return [
        ...commonSteps,
        {
          target: '[data-tour="director-dashboard"]',
          content: 'Bienvenido al panel del Director. Aquí puedes ver un resumen general de la institución y acceder a todos los módulos.',
          placement: 'bottom',
        },
        {
          target: '[data-tour="dashboard-stats"]',
          content: 'En esta sección puedes ver estadísticas importantes de tu institución: número de estudiantes, profesores y secciones.',
          placement: 'top',
        },
        {
          target: '[data-tour="dashboard-actions"]',
          content: 'Aquí tienes acceso rápido a las acciones más comunes como crear usuarios y gestionar la institución.',
          placement: 'top',
        },
        {
          target: '[data-tour="dashboard-content"]',
          content: 'En el área principal del dashboard puedes ver listas de usuarios, estadísticas detalladas y gestionar toda la información de la institución.',
          placement: 'top',
        },
        {
          target: '[data-tour="academic-section"]',
          content: 'Módulo Académico: Gestiona grados, períodos y secciones de tu institución.',
          placement: 'right',
        },
        {
          target: '[data-tour="people-section"]',
          content: 'Módulo Personas: Administra estudiantes y profesores de la institución.',
          placement: 'right',
        },
        {
          target: '[data-tour="administration-section"]',
          content: 'Módulo Administración: Configura los datos de la institución y ajustes del sistema.',
          placement: 'right',
        },
      ]

    case 'academic':
      return [
        {
          target: '[data-tour="academic-section"]',
          content: 'Módulo Académico: Aquí gestionas toda la estructura académica de la institución. El tour te llevará automáticamente por cada sub-módulo.',
          placement: 'right',
        },
        {
          target: '[data-tour="grades-link"]',
          content: 'Grados: Define los niveles educativos de tu institución. El tour navegará automáticamente a esta página.',
          placement: 'right',
          disableBeacon: true,
        },
        {
          target: '[data-tour="grades-page"]',
          content: 'Página de Grados: Aquí puedes ver y gestionar todos los niveles académicos de tu institución.',
          placement: 'bottom',
          disableBeacon: true,
        },
        {
          target: '[data-tour="grades-header"]',
          content: 'Header de Grados: Información general sobre la gestión de grados académicos.',
          placement: 'bottom',
          disableBeacon: true,
        },
        {
          target: '[data-tour="create-grade-button"]',
          content: 'Botón Crear Grado: Usa este botón para agregar nuevos niveles académicos a tu institución.',
          placement: 'left',
          disableBeacon: true,
        },
        {
          target: '[data-tour="grades-stats"]',
          content: 'Estadísticas de Grados: Aquí puedes ver el resumen de los grados configurados en tu institución.',
          placement: 'top',
          disableBeacon: true,
        },
        {
          target: '[data-tour="grades-content"]',
          content: 'Contenido Principal: Lista de todos los grados creados con opciones para editar y eliminar.',
          placement: 'top',
          disableBeacon: true,
        },
        {
          target: '[data-tour="periods-link"]',
          content: 'Períodos: Configura los períodos académicos. El tour navegará automáticamente a esta página.',
          placement: 'right',
          disableBeacon: true,
        },
        {
          target: '[data-tour="terms-page"]',
          content: 'Página de Períodos: Aquí puedes ver y gestionar todos los períodos académicos de tu institución.',
          placement: 'bottom',
          disableBeacon: true,
        },
        {
          target: '[data-tour="terms-header"]',
          content: 'Header de Períodos: Información general sobre la gestión de períodos académicos.',
          placement: 'bottom',
          disableBeacon: true,
        },
        {
          target: '[data-tour="create-term-button"]',
          content: 'Botón Crear Período: Usa este botón para agregar nuevos períodos académicos a tu institución.',
          placement: 'left',
          disableBeacon: true,
        },
        {
          target: '[data-tour="terms-stats"]',
          content: 'Estadísticas de Períodos: Aquí puedes ver el resumen de los períodos configurados en tu institución.',
          placement: 'top',
          disableBeacon: true,
        },
        {
          target: '[data-tour="terms-content"]',
          content: 'Contenido Principal: Lista de todos los períodos creados con opciones para editar y eliminar.',
          placement: 'top',
          disableBeacon: true,
        },
        {
          target: '[data-tour="sections-link"]',
          content: 'Secciones: Crea y gestiona las secciones de cada grado y período. El tour navegará automáticamente a esta página.',
          placement: 'right',
          disableBeacon: true,
        },
        {
          target: '[data-tour="sections-page"]',
          content: 'Página de Secciones: Aquí puedes ver y gestionar todas las secciones académicas de tu institución.',
          placement: 'bottom',
          disableBeacon: true,
        },
        {
          target: '[data-tour="sections-header"]',
          content: 'Header de Secciones: Información general sobre la gestión de secciones académicas.',
          placement: 'bottom',
          disableBeacon: true,
        },
        {
          target: '[data-tour="create-section-button"]',
          content: 'Botón Crear Sección: Usa este botón para agregar nuevas secciones académicas a tu institución.',
          placement: 'left',
          disableBeacon: true,
        },
        {
          target: '[data-tour="sections-stats"]',
          content: 'Estadísticas de Secciones: Aquí puedes ver el resumen de las secciones configuradas en tu institución.',
          placement: 'top',
          disableBeacon: true,
        },
        {
          target: '[data-tour="sections-content"]',
          content: 'Contenido Principal: Lista de todas las secciones creadas con opciones para editar y eliminar.',
          placement: 'top',
          disableBeacon: true,
        },
      ]

    case 'people':
      return [
        {
          target: '[data-tour="people-section"]',
          content: 'Módulo Personas: Administra todos los usuarios de la institución. El tour te llevará automáticamente por cada sub-módulo.',
          placement: 'right',
        },
        {
          target: '[data-tour="students-link"]',
          content: 'Estudiantes: Gestiona el registro, matrícula y datos de todos los estudiantes. El tour navegará automáticamente a esta página.',
          placement: 'right',
          disableBeacon: true,
        },
        {
          target: '[data-tour="students-page"]',
          content: 'Página de Estudiantes: Aquí puedes ver y gestionar todos los estudiantes de tu institución.',
          placement: 'bottom',
          disableBeacon: true,
        },
        {
          target: '[data-tour="students-header"]',
          content: 'Header de Estudiantes: Información general sobre la gestión de estudiantes.',
          placement: 'bottom',
          disableBeacon: true,
        },
        {
          target: '[data-tour="create-student-button"]',
          content: 'Botón Crear Estudiante: Usa este botón para agregar nuevos estudiantes a tu institución.',
          placement: 'left',
          disableBeacon: true,
        },
        {
          target: '[data-tour="students-stats"]',
          content: 'Estadísticas de Estudiantes: Aquí puedes ver el resumen de los estudiantes registrados en tu institución.',
          placement: 'top',
          disableBeacon: true,
        },
        {
          target: '[data-tour="students-content"]',
          content: 'Contenido Principal: Lista de todos los estudiantes con opciones para ver, editar y eliminar.',
          placement: 'top',
          disableBeacon: true,
        },
        {
          target: '[data-tour="professors-link"]',
          content: 'Profesores: Administra el personal docente y sus asignaciones. El tour navegará automáticamente a esta página.',
          placement: 'right',
          disableBeacon: true,
        },
        {
          target: '[data-tour="professors-page"]',
          content: 'Página de Profesores: Aquí puedes ver y gestionar todo el personal docente de tu institución.',
          placement: 'bottom',
          disableBeacon: true,
        },
        {
          target: '[data-tour="professors-header"]',
          content: 'Header de Profesores: Información general sobre la gestión del personal docente.',
          placement: 'bottom',
          disableBeacon: true,
        },
        {
          target: '[data-tour="create-professor-button"]',
          content: 'Botón Crear Profesor: Usa este botón para agregar nuevos profesores a tu institución.',
          placement: 'left',
          disableBeacon: true,
        },
        {
          target: '[data-tour="professors-stats"]',
          content: 'Estadísticas de Profesores: Aquí puedes ver el resumen del personal docente registrado en tu institución.',
          placement: 'top',
          disableBeacon: true,
        },
        {
          target: '[data-tour="professors-content"]',
          content: 'Contenido Principal: Lista de todos los profesores con opciones para ver, editar y eliminar.',
          placement: 'top',
          disableBeacon: true,
        },
      ]

    case 'administration':
      return [
        {
          target: '[data-tour="administration-section"]',
          content: 'Módulo Administración: Configuración general del sistema. El tour te llevará automáticamente por cada sub-módulo.',
          placement: 'right',
        },
        {
          target: '[data-tour="institution-link"]',
          content: 'Institución: Configura los datos básicos de tu institución educativa. El tour navegará automáticamente a esta página.',
          placement: 'right',
          disableBeacon: true,
        },
        {
          target: '[data-tour="institution-page"]',
          content: 'Página de Institución: Aquí puedes ver y gestionar la información principal de tu institución educativa.',
          placement: 'bottom',
          disableBeacon: true,
        },
        {
          target: '[data-tour="institution-header"]',
          content: 'Header de Institución: Información general sobre la gestión de datos institucionales.',
          placement: 'bottom',
          disableBeacon: true,
        },
        {
          target: '[data-tour="edit-institution-button"]',
          content: 'Botón Editar Institución: Usa este botón para modificar los datos de tu institución educativa.',
          placement: 'left',
          disableBeacon: true,
        },
        {
          target: '[data-tour="institution-content"]',
          content: 'Contenido Principal: Formulario con todos los datos de la institución (nombre, código, dirección, teléfono, email).',
          placement: 'top',
          disableBeacon: true,
        },
        {
          target: '[data-tour="settings-link"]',
          content: 'Configuración: Ajustes del sistema y preferencias de usuario. El tour navegará automáticamente a esta página.',
          placement: 'right',
          disableBeacon: true,
        },
        {
          target: '[data-tour="settings-page"]',
          content: 'Página de Configuración: Aquí puedes ver y gestionar tu perfil personal y configuración del sistema.',
          placement: 'bottom',
          disableBeacon: true,
        },
        {
          target: '[data-tour="settings-header"]',
          content: 'Header de Configuración: Información general sobre la gestión de tu perfil personal.',
          placement: 'bottom',
          disableBeacon: true,
        },
        {
          target: '[data-tour="edit-profile-button"]',
          content: 'Botón Editar Perfil: Usa este botón para modificar tu información personal (nombre, apellido, email).',
          placement: 'left',
          disableBeacon: true,
        },
        {
          target: '[data-tour="settings-content"]',
          content: 'Contenido Principal: Información de tu perfil de usuario y formulario de edición de datos personales.',
          placement: 'top',
          disableBeacon: true,
        },
      ]

    default:
      return getDirectorTourSteps('general', commonSteps)
  }
}

// Tours específicos para Profesor
const getProfessorTourSteps = (tourType: string, commonSteps: Step[]): Step[] => {
  switch (tourType) {
    case 'general':
      return [
        ...commonSteps,
        {
          target: '[data-tour="professor-dashboard"]',
          content: 'Bienvenido al panel del Profesor. Aquí tienes acceso a todas las herramientas de enseñanza.',
          placement: 'bottom',
        },
        {
          target: '[data-tour="teaching-section"]',
          content: 'Módulo Docencia: Gestiona tus cursos, secciones, estudiantes y portafolios.',
          placement: 'right',
        },
        {
          target: '[data-tour="ai-content-section"]',
          content: 'Módulo Contenido & IA: Accede al generador de contenido con IA y revisa tus contenidos generados.',
          placement: 'right',
        },
        {
          target: '[data-tour="management-section"]',
          content: 'Módulo Gestión: Revisa las analíticas de materiales y configura tus preferencias.',
          placement: 'right',
        },
      ]

    case 'teaching':
      return [
        {
          target: '[data-tour="teaching-section"]',
          content: 'Módulo Docencia: Aquí gestionas toda tu actividad docente. El tour te llevará automáticamente por cada sub-módulo.',
          placement: 'right',
        },
        {
          target: '[data-tour="courses-link"]',
          content: 'Mis Cursos: Gestiona tus cursos asignados. El tour navegará automáticamente a esta página.',
          placement: 'right',
          disableBeacon: true,
        },
        {
          target: '[data-tour="courses-page"]',
          content: 'Página de Mis Cursos: Aquí puedes ver y gestionar todos los cursos que tienes asignados.',
          placement: 'bottom',
          disableBeacon: true,
        },
        {
          target: '[data-tour="courses-header"]',
          content: 'Header de Cursos: Información general sobre la gestión de tus cursos.',
          placement: 'bottom',
          disableBeacon: true,
        },
        {
          target: '[data-tour="courses-content"]',
          content: 'Contenido Principal: Lista de todos tus cursos con opciones para gestionar cada uno.',
          placement: 'top',
          disableBeacon: true,
        },
        {
          target: '[data-tour="sections-link"]',
          content: 'Mis Secciones: Administra las secciones que tienes asignadas. El tour navegará automáticamente a esta página.',
          placement: 'right',
          disableBeacon: true,
        },
        {
          target: '[data-tour="sections-page"]',
          content: 'Página de Mis Secciones: Aquí puedes ver y gestionar todas las secciones que tienes asignadas.',
          placement: 'bottom',
          disableBeacon: true,
        },
        {
          target: '[data-tour="sections-header"]',
          content: 'Header de Secciones: Información general sobre la gestión de tus secciones.',
          placement: 'bottom',
          disableBeacon: true,
        },
        {
          target: '[data-tour="sections-content"]',
          content: 'Contenido Principal: Lista de todas tus secciones con opciones para gestionar cada una.',
          placement: 'top',
          disableBeacon: true,
        },
        {
          target: '[data-tour="students-link"]',
          content: 'Mis Estudiantes: Ve y gestiona a tus estudiantes. El tour navegará automáticamente a esta página.',
          placement: 'right',
          disableBeacon: true,
        },
        {
          target: '[data-tour="students-page"]',
          content: 'Página de Mis Estudiantes: Aquí puedes ver y gestionar a todos tus estudiantes.',
          placement: 'bottom',
          disableBeacon: true,
        },
        {
          target: '[data-tour="students-header"]',
          content: 'Header de Estudiantes: Información general sobre la gestión de tus estudiantes.',
          placement: 'bottom',
          disableBeacon: true,
        },
        {
          target: '[data-tour="students-content"]',
          content: 'Contenido Principal: Lista de todos tus estudiantes con opciones para gestionar cada uno.',
          placement: 'top',
          disableBeacon: true,
        },
        {
          target: '[data-tour="portfolios-link"]',
          content: 'Portafolios: Gestiona los portafolios de tus estudiantes. El tour navegará automáticamente a esta página.',
          placement: 'right',
          disableBeacon: true,
        },
        {
          target: '[data-tour="portfolios-page"]',
          content: 'Página de Portafolios: Aquí puedes ver y gestionar los portafolios de tus estudiantes.',
          placement: 'bottom',
          disableBeacon: true,
        },
        {
          target: '[data-tour="portfolios-header"]',
          content: 'Header de Portafolios: Información general sobre la gestión de portafolios.',
          placement: 'bottom',
          disableBeacon: true,
        },
        {
          target: '[data-tour="portfolios-content"]',
          content: 'Contenido Principal: Lista de todos los portafolios con opciones para gestionar cada uno.',
          placement: 'top',
          disableBeacon: true,
        },
        {
          target: '[data-tour="topics-link"]',
          content: 'Temas: Organiza y gestiona los temas de tus cursos. El tour navegará automáticamente a esta página.',
          placement: 'right',
          disableBeacon: true,
        },
        {
          target: '[data-tour="topics-page"]',
          content: 'Página de Temas: Aquí puedes ver y gestionar todos los temas de tus cursos.',
          placement: 'bottom',
          disableBeacon: true,
        },
        {
          target: '[data-tour="topics-header"]',
          content: 'Header de Temas: Información general sobre la gestión de temas.',
          placement: 'bottom',
          disableBeacon: true,
        },
        {
          target: '[data-tour="topics-content"]',
          content: 'Contenido Principal: Lista de todos los temas con opciones para gestionar cada uno.',
          placement: 'top',
          disableBeacon: true,
        },
      ]

    case 'ai-content':
      return [
        {
          target: '[data-tour="ai-content-section"]',
          content: 'Módulo Contenido & IA: Aquí tienes acceso a las herramientas de IA para generar contenido educativo.',
          placement: 'right',
        },
        {
          target: '[data-tour="ai-generator-link"]',
          content: 'IA Generador: Crea contenido educativo usando inteligencia artificial. El tour navegará automáticamente a esta página.',
          placement: 'right',
          disableBeacon: true,
        },
        {
          target: '[data-tour="ai-generator-page"]',
          content: 'Página de IA Generador: Aquí puedes crear contenido educativo usando inteligencia artificial.',
          placement: 'bottom',
          disableBeacon: true,
        },
        {
          target: '[data-tour="ai-generator-header"]',
          content: 'Header de IA Generador: Información general sobre la generación de contenido con IA.',
          placement: 'bottom',
          disableBeacon: true,
        },
        {
          target: '[data-tour="ai-generator-content"]',
          content: 'Contenido Principal: Herramientas y formularios para generar contenido educativo con IA.',
          placement: 'top',
          disableBeacon: true,
        },
        {
          target: '[data-tour="generated-content-link"]',
          content: 'Contenidos Generados: Revisa y gestiona todo el contenido que has generado con IA. El tour navegará automáticamente a esta página.',
          placement: 'right',
          disableBeacon: true,
        },
        {
          target: '[data-tour="generated-content-page"]',
          content: 'Página de Contenidos Generados: Aquí puedes ver y gestionar todo el contenido que has generado con IA.',
          placement: 'bottom',
          disableBeacon: true,
        },
        {
          target: '[data-tour="generated-content-header"]',
          content: 'Header de Contenidos Generados: Información general sobre tus contenidos generados.',
          placement: 'bottom',
          disableBeacon: true,
        },
        {
          target: '[data-tour="generated-content-content"]',
          content: 'Contenido Principal: Lista de todos tus contenidos generados con opciones para gestionar cada uno.',
          placement: 'top',
          disableBeacon: true,
        },
      ]

    case 'management':
      return [
        {
          target: '[data-tour="management-section"]',
          content: 'Módulo Gestión: Aquí puedes revisar analíticas y configuraciones avanzadas.',
          placement: 'right',
        },
        {
          target: '[data-tour="analytics-link"]',
          content: 'Analytics: Revisa estadísticas y métricas de tus materiales. El tour navegará automáticamente a esta página.',
          placement: 'right',
          disableBeacon: true,
        },
        {
          target: '[data-tour="analytics-page"]',
          content: 'Página de Analytics: Aquí puedes ver estadísticas y métricas detalladas de tus materiales.',
          placement: 'bottom',
          disableBeacon: true,
        },
        {
          target: '[data-tour="analytics-header"]',
          content: 'Header de Analytics: Información general sobre las métricas y estadísticas.',
          placement: 'bottom',
          disableBeacon: true,
        },
        {
          target: '[data-tour="analytics-content"]',
          content: 'Contenido Principal: Gráficos y métricas detalladas de rendimiento de tus materiales.',
          placement: 'top',
          disableBeacon: true,
        },
        {
          target: '[data-tour="settings-link"]',
          content: 'Configuración: Ajusta tus preferencias personales. El tour navegará automáticamente a esta página.',
          placement: 'right',
          disableBeacon: true,
        },
        {
          target: '[data-tour="settings-page"]',
          content: 'Página de Configuración: Aquí puedes ajustar tus preferencias personales y configuración.',
          placement: 'bottom',
          disableBeacon: true,
        },
        {
          target: '[data-tour="settings-header"]',
          content: 'Header de Configuración: Información general sobre la configuración personal.',
          placement: 'bottom',
          disableBeacon: true,
        },
        {
          target: '[data-tour="settings-content"]',
          content: 'Contenido Principal: Formularios y opciones para configurar tus preferencias personales.',
          placement: 'top',
          disableBeacon: true,
        },
      ]

    default:
      return getProfessorTourSteps('general', commonSteps)
  }
}

// Tours específicos para Estudiante
const getStudentTourSteps = (tourType: string, commonSteps: Step[]): Step[] => {
  switch (tourType) {
    case 'general':
      return [
        ...commonSteps,
        {
          target: '[data-tour="student-dashboard"]',
          content: 'Bienvenido a tu panel de estudiante. Aquí puedes acceder a todos tus recursos.',
          placement: 'bottom',
        },
        {
          target: '[data-tour="my-section"]',
          content: 'Módulo Mi Sección: Aquí puedes ver información sobre tu sección y compañeros de clase.',
          placement: 'right',
        },
        {
          target: '[data-tour="my-portfolio"]',
          content: 'Módulo Mi Portafolio: Aquí puedes ver y gestionar todos tus trabajos y proyectos.',
          placement: 'right',
        },
      ]

    case 'my-section':
      return [
        {
          target: '[data-tour="my-section"]',
          content: 'Módulo Mi Sección: Aquí puedes ver información sobre tu sección y compañeros de clase. El tour navegará automáticamente a esta página.',
          placement: 'right',
        },
        {
          target: '[data-tour="my-section-page"]',
          content: 'Página de Mi Sección: Aquí puedes ver información detallada sobre tu sección.',
          placement: 'bottom',
        },
        {
          target: '[data-tour="my-section-header"]',
          content: 'Header de Mi Sección: Información general sobre tu sección.',
          placement: 'bottom',
        },
        {
          target: '[data-tour="my-section-content"]',
          content: 'Contenido Principal: Información detallada sobre tu sección y compañeros.',
          placement: 'top',
        },
      ]

    case 'my-portfolio':
      return [
        {
          target: '[data-tour="my-portfolio"]',
          content: 'Módulo Mi Portafolio: Aquí puedes ver y gestionar todos tus trabajos y proyectos. El tour navegará automáticamente a esta página.',
          placement: 'right',
        },
        {
          target: '[data-tour="my-portfolio-page"]',
          content: 'Página de Mi Portafolio: Aquí puedes ver y gestionar todos tus trabajos y proyectos.',
          placement: 'bottom',
        },
        {
          target: '[data-tour="my-portfolio-header"]',
          content: 'Header de Mi Portafolio: Información general sobre tu portafolio.',
          placement: 'bottom',
        },
        {
          target: '[data-tour="my-portfolio-content"]',
          content: 'Contenido Principal: Lista de todos tus trabajos y proyectos con opciones para gestionar cada uno.',
          placement: 'top',
        },
      ]


    default:
      return getStudentTourSteps('general', commonSteps)
  }
}

// Configuración de pasos por rol
export const getTourSteps = (role: string, tourType: string = 'general'): Step[] => {
  const commonSteps: Step[] = [
    {
      target: '[data-tour="sidebar-toggle"]',
      content: 'Aquí puedes abrir y cerrar el menú de navegación lateral.',
      placement: 'right',
      disableBeacon: true,
    },
    {
      target: '[data-tour="user-profile"]',
      content: 'Aquí puedes ver tu información de usuario y acceder a la configuración.',
      placement: 'left',
    },
    {
      target: '[data-tour="logout-button"]',
      content: 'Usa este botón para cerrar tu sesión de forma segura.',
      placement: 'left',
    },
  ]

  switch (role) {
    case 'DIRECTOR':
      return getDirectorTourSteps(tourType, commonSteps)

    case 'PROFESOR':
      return getProfessorTourSteps(tourType, commonSteps)

    case 'ALUMNO':
      return getStudentTourSteps(tourType, commonSteps)

    default:
      return getStudentTourSteps('general', commonSteps)
  }
}
