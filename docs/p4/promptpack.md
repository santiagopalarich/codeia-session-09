# P4 - To-Do App: Documentación del Proyecto

## Resumen Ejecutivo

Documentación completa para el MVP de To-Do App, una aplicación web de gestión de tareas con arquitectura moderna basada en Vue 3 + Supabase + Vercel.

**Propósito**: Guiar al equipo de desarrollo desde la conceptualización hasta el deploy en producción, con énfasis en contratos, arquitectura y validaciones.

**Audiencia**: Equipos de Producto, Frontend, Backend, Plataforma y DevOps.

---

## Índice de Documentos

### 1. [Scope & Requerimientos del MVP](scope.md)
**Contenido**:
- Visión del producto y propuesta de valor
- Objetivos funcionales y no funcionales
- Historias de usuario (HU-1 a HU-7)
- Flujos críticos de usuario
- Métricas de éxito y criterios de salida
- Riesgos identificados

**Cuándo usar**: Antes de comenzar el desarrollo para alinear expectativas y validar scope con stakeholders.

---

### 2. [Modelo de Datos](data_model.md)
**Contenido**:
- Diagrama Entidad-Relación
- Esquema de base de datos (tabla `todos`)
- Scripts SQL de creación
- Reglas de validación (DB + Frontend)
- Contratos de API (Supabase Client)
- Consideraciones de performance

**Cuándo usar**: Durante el setup de Supabase y antes de implementar composables de datos.

---

### 3. [Políticas RLS (Row Level Security)](security_rls.md)
**Contenido**:
- Fundamentos de RLS y arquitectura de seguridad
- Políticas completas para SELECT, INSERT, UPDATE, DELETE
- Scripts SQL de implementación
- Testing de políticas con múltiples usuarios
- Troubleshooting de problemas comunes
- Mejores prácticas de seguridad

**Cuándo usar**: Inmediatamente después de crear las tablas en Supabase, ANTES de insertar datos reales.

---

### 4. [Mapa de Componentes UI](ui_map.md)
**Contenido**:
- Arquitectura de componentes Vue 3
- Inventario completo de componentes (Layout, Views, Features, Base)
- Composables (`useAuth`, `useTodos`, `useToast`)
- Flujos de navegación y estados de UI
- Responsive design y accesibilidad
- Contratos de Props/Emits

**Cuándo usar**: Durante el diseño de la arquitectura frontend y antes de comenzar la implementación de componentes.

---

### 5. [Plan de Integración Vue + Supabase](integration_plan.md)
**Contenido**:
- Setup inicial del proyecto
- Configuración de variables de entorno
- Implementación de autenticación (`useAuth`)
- CRUD de tareas (`useTodos`)
- Manejo de errores y optimizaciones
- Testing de integración con mocks

**Cuándo usar**: Durante la fase de implementación para conectar frontend con backend.

---

### 6. [Checklist de Deployment en Vercel](deploy_vercel.md)
**Contenido**:
- Pre-deployment (build local, tests, validaciones)
- Configuración de Supabase para producción
- Deploy en Vercel (Dashboard y CLI)
- Post-deployment (validación funcional, monitoreo)
- CI/CD pipeline y rollback strategy
- Optimizaciones de performance y seguridad

**Cuándo usar**: Durante la fase de deploy y para validaciones post-lanzamiento.

### 7. [Roadmap (Next Steps)](next_steps.md)
**Contenido**:
- Planificación de versiones v2.0 (Q1 2026) y v3.0 (Q2 2026)
- Features futuras (Etiquetas, OAuth, Colaboración)
- Prioridades, fechas estimadas y asignación de roles
- Plan de reducción de deuda técnica

**Cuándo usar**: Para planificación de sprints futuros y gestión de expectativas post-MVP.

### 8. [Guía de Troubleshooting](troubleshooting.md)
**Contenido**:
- Problemas comunes de conexión (`supabaseUrl`)
- Errores de redirección en Auth
- Debugging de políticas RLS (401/403)
- Problemas de CORS y Assets

**Cuándo usar**: Cuando te encuentres con errores bloqueantes durante desarrollo o deploy.

---

## Flujo de Trabajo Recomendado

```
1. Planning
   ├─ Leer scope.md
   ├─ Validar con stakeholders
   └─ Definir timelines

2. Backend Setup (Supabase)
   ├─ Leer data_model.md
   ├─ Crear proyecto Supabase
   ├─ Ejecutar scripts SQL (tablas + índices)
   ├─ Leer security_rls.md
   ├─ Aplicar políticas RLS
   └─ Testear con usuarios de prueba

3. Frontend Setup (Vue 3)
   ├─ Leer ui_map.md
   ├─ Crear proyecto Vue 3
   ├─ Implementar componentes base
   ├─ Leer integration_plan.md
   ├─ Configurar Supabase Client
   ├─ Implementar composables
   └─ Conectar UI con backend

4. Testing
   ├─ Tests unitarios (composables)
   ├─ Tests de integración (flujos completos)
   ├─ Validación de RLS en todos los endpoints
   └─ Testing manual E2E

5. Deployment
   ├─ Leer deploy_vercel.md
   ├─ Validar pre-deployment checklist
   ├─ Deploy a Vercel
   ├─ Configurar variables de entorno
   ├─ Validar post-deployment checklist
   └─ Configurar monitoreo

6. Post-Launch
   ├─ Monitorear analytics y errores
   ├─ Validar métricas de éxito
   └─ Iterar basado en feedback

7. Future Planning
   └─ Leer next_steps.md para features v2.0
```

---

## Stack Tecnológico

### Frontend
- **Framework**: Vue 3 (Composition API)
- **Language**: TypeScript
- **Build Tool**: Vite
- **Router**: Vue Router
- **State**: Composables (no Vuex/Pinia para MVP)
- **Styling**: CSS (o Tailwind opcional)

### Backend
- **BaaS**: Supabase
- **Database**: PostgreSQL
- **Authentication**: Supabase Auth (JWT)
- **Security**: Row Level Security (RLS)
- **Realtime**: Supabase Realtime (opcional MVP)

### DevOps
- **Hosting**: Vercel
- **CI/CD**: Vercel Git Integration
- **Monitoring**: Vercel Analytics + Sentry
- **Uptime**: UptimeRobot (opcional)

---

## Convenciones del Proyecto

### Nomenclatura
- **Archivos Vue**: PascalCase (`TodoItem.vue`, `LoginView.vue`)
- **Composables**: camelCase con prefix `use` (`useAuth.ts`)
- **Tipos**: PascalCase (`Todo`, `User`)
- **Constantes**: UPPER_SNAKE_CASE (`API_URL`)

### Git Workflow
- **Branches**: `main` (producción), `feature/nombre`, `fix/nombre`
- **Commits**: Conventional Commits (`feat:`, `fix:`, `docs:`, `refactor:`)
- **PRs**: Requieren review + CI passing

### Testing
- **Unit**: Vitest (composables y funciones puras)
- **E2E**: Playwright (flujos críticos)
- **Coverage**: Mínimo 70% para composables críticos

---

## Criterios de Éxito del MVP

### Técnicos
- ✅ Build sin errores
- ✅ Tests pasando (>70% coverage)
- ✅ Lighthouse Performance > 80
- ✅ RLS validado (usuarios aislados)
- ✅ Deploy exitoso en Vercel

### Funcionales
- ✅ Todas las HU implementadas (HU-1 a HU-7)
- ✅ Flujo completo: registro → CRUD → logout
- ✅ Responsive en mobile y desktop
- ✅ Accesibilidad básica (navegación por teclado)

### Negocio
- ✅ Al menos 3 tareas creadas/usuario en primera sesión
- ✅ Tasa de error en auth < 5%
- ✅ Disponibilidad >= 99.5%

---

## Recursos Adicionales

### Documentación Oficial
- [Vue 3 Docs](https://vuejs.org/)
- [Supabase Docs](https://supabase.com/docs)
- [Vercel Docs](https://vercel.com/docs)
- [PostgreSQL RLS](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)

### Tutoriales
- [Supabase Vue Quickstart](https://supabase.com/docs/guides/getting-started/quickstarts/vue)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)

### Herramientas
- [TypeScript Playground](https://www.typescriptlang.org/play)
- [Supabase SQL Editor](https://app.supabase.com/project/_/sql)
- [Vercel CLI](https://vercel.com/docs/cli)

---

## Contacto y Soporte

**Equipo de Producto P4**
- Product Owner: [Nombre]
- Tech Lead: [Nombre]
- Frontend Lead: [Nombre]
- Backend/Platform Lead: [Nombre]

**Comunicación**:
- Slack: `#p4-todo-app`
- Jira: [Link al board]
- Repo: [Link al repositorio]

---

## Changelog de Documentación

### v1.0.0 - 2025-12-16
- Documentación inicial completa
- 6 documentos publicados
- Checklist de validación incluidos
- Scripts SQL listos para uso

---

## Próximos Pasos (Post-MVP)

### Features Pendientes (v2)
- [ ] Categorías y etiquetas de tareas
- [ ] Fechas de vencimiento y recordatorios
- [ ] Compartir tareas con otros usuarios
- [ ] Búsqueda y filtros avanzados
- [ ] OAuth (Google, GitHub)
- [ ] Modo offline con sync

### Mejoras Técnicas
- [ ] E2E tests con Playwright
- [ ] Storybook para componentes
- [ ] Migraciones automáticas con Supabase CLI
- [ ] Monitoreo avanzado con Datadog
- [ ] A/B testing framework

---

**Versión de la Documentación**: 1.0
**Última actualización**: 2025-12-16
**Estado**: Production Ready ✅
