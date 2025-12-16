# P4 - To-Do App MVP: Scope & Requerimientos

## 1. Visión del Producto

**Propuesta de valor**: Aplicación web de gestión de tareas personales con autenticación segura, datos persistentes en tiempo real y arquitectura escalable.

**Usuario objetivo**: Usuarios individuales que necesitan organizar tareas diarias con acceso desde cualquier dispositivo.

## 2. Objetivos del MVP

### Funcionales
- ✅ Registro y autenticación de usuarios (email/password)
- ✅ CRUD completo de tareas (crear, leer, actualizar, eliminar)
- ✅ Marcar tareas como completadas/pendientes
- ✅ Persistencia en tiempo real con Supabase
- ✅ Seguridad a nivel de fila (RLS) - cada usuario solo ve sus tareas

### No Funcionales
- ⚡ Tiempo de carga inicial < 3s
- 🔒 Autenticación segura con JWT
- 📱 Responsive design (mobile-first)
- ♿ Accesibilidad básica (ARIA labels, navegación por teclado)
- 🚀 Deploy automático en Vercel

## 3. Fuera del Scope (v1)

### 3.1 Features NO Incluidas en MVP

| Feature | Razón de Exclusión | Prioridad Post-MVP | Esfuerzo Estimado |
|---------|-------------------|-------------------|------------------|
| ❌ **Compartir tareas** con otros usuarios | Complejidad de permisos, no crítico para v1 | 🟡 Media (v2) | 8 puntos |
| ❌ **Categorías** o etiquetas | Añade complejidad UX, no validado con usuarios | 🟢 Baja (v3) | 5 puntos |
| ❌ **Fechas de vencimiento** y recordatorios | Requiere cron jobs, notificaciones push | 🔴 Alta (v2) | 13 puntos |
| ❌ **Búsqueda** y filtros avanzados | Nice-to-have, no bloqueante para uso básico | 🟡 Media (v2) | 5 puntos |
| ❌ **Autenticación OAuth** (Google, GitHub) | Configuración compleja, email/pwd suficiente | 🟡 Media (v2) | 8 puntos |
| ❌ **Temas personalizados** (dark mode) | Cosmético, no afecta funcionalidad core | 🟢 Baja (v3) | 3 puntos |
| ❌ **Modo offline** con sync | Complejidad técnica alta, edge case | 🟢 Baja (v4) | 21 puntos |
| ❌ **Attachments** (archivos adjuntos) | Requiere storage, no validado con usuarios | 🟢 Baja (v3) | 13 puntos |
| ❌ **Subtareas** (nested todos) | Complejidad de data model y UI | 🟡 Media (v3) | 13 puntos |
| ❌ **Ordenar manualmente** (drag & drop) | No crítico, orden por fecha suficiente | 🟢 Baja (v3) | 5 puntos |
| ❌ **Exportar** tareas (PDF, CSV) | Use case no validado | 🟢 Baja (v4) | 5 puntos |
| ❌ **Email notifications** | Requiere email service, no crítico | 🟡 Media (v2) | 8 puntos |
| ❌ **Analytics del usuario** (progreso, stats) | Nice-to-have, no core | 🟢 Baja (v3) | 8 puntos |
| ❌ **Templates** de tareas | Caso de uso avanzado | 🟢 Baja (v4) | 8 puntos |

### 3.2 Decisiones Técnicas Excluidas

- ❌ **Internacionalización (i18n)**: Solo español en v1, inglés en v2
- ❌ **Server-Side Rendering (SSR)**: SPA suficiente para MVP, SEO no crítico
- ❌ **Progressive Web App (PWA)**: No offline mode, no push notifications
- ❌ **Real-time collaboration**: Solo usuarios individuales
- ❌ **GraphQL**: REST via Supabase suficiente
- ❌ **Redis cache**: Supabase cache + Vercel CDN suficiente

### 3.3 Criterios para Incluir en Futuras Versiones

Una feature sale del "No-Scope" si cumple **2 de 3**:
1. **Validación de usuarios**: 5+ usuarios lo solicitan explícitamente
2. **Impacto en métricas**: Mejora proyectada >20% en retención o engagement
3. **Esfuerzo razonable**: <= 8 puntos de estimación

## 4. Stack Tecnológico

| Capa | Tecnología | Justificación |
|------|------------|---------------|
| Frontend | Vue 3 (Composition API) | Reactivo, TypeScript-friendly, ecosistema maduro |
| UI Framework | Vanilla CSS / Tailwind | Rápido prototipado, diseño consistente |
| Backend | Supabase | BaaS completo (DB + Auth + RLS + Realtime) |
| Base de Datos | PostgreSQL (Supabase) | Relacional, transaccional, RLS nativo |
| Autenticación | Supabase Auth | JWT, manejo de sesiones, recuperación de contraseña |
| Hosting | Vercel | Deploy automático, CDN global, SSL |

## 5. Historias de Usuario (MVP)

### HU-1: Registro de Usuario
**Como** usuario nuevo
**Quiero** registrarme con email y contraseña
**Para** acceder a la aplicación y guardar mis tareas

**Prioridad**: 🔴 Crítica | **Estimación**: 3 puntos | **Sprint**: 1

**Criterios de aceptación**:
- [ ] Formulario con email, contraseña y confirmación de contraseña
- [ ] Validación en frontend: email válido (regex), contraseña >= 8 caracteres
- [ ] Validación en backend: contraseñas coinciden
- [ ] Mensaje de error claro si el email ya existe ("Este email ya está registrado")
- [ ] Mensaje de error si el formato de email es inválido
- [ ] Redirección automática al dashboard después del registro exitoso
- [ ] Loading state durante el proceso de registro (botón deshabilitado + spinner)
- [ ] Email de bienvenida enviado (opcional MVP, configurar en Supabase)

**Definition of Done (DoD)**:
- [ ] Código revisado por al menos 1 desarrollador
- [ ] Tests unitarios escritos (validaciones de formulario)
- [ ] Test E2E: registro exitoso + redirección
- [ ] Test E2E: email duplicado muestra error
- [ ] Documentación actualizada (README)
- [ ] Deploy en preview environment exitoso

**Criterios de Demo**:
1. Abrir `/register`
2. Ingresar email válido y contraseña >= 8 chars
3. Confirmar contraseña
4. Click "Registrarse"
5. Verificar redirección a `/dashboard`
6. Verificar usuario creado en Supabase Dashboard

---

### HU-2: Inicio de Sesión
**Como** usuario registrado
**Quiero** iniciar sesión con mis credenciales
**Para** acceder a mis tareas guardadas

**Prioridad**: 🔴 Crítica | **Estimación**: 2 puntos | **Sprint**: 1

**Criterios de aceptación**:
- [ ] Formulario con email y contraseña
- [ ] Validación: campos no vacíos
- [ ] Mensaje de error si las credenciales son incorrectas ("Email o contraseña incorrectos")
- [ ] Sesión persistente (localStorage via Supabase SDK)
- [ ] Al recargar página, sesión se restaura automáticamente
- [ ] Botón de cerrar sesión visible en header del dashboard
- [ ] Loading state durante login (botón deshabilitado + spinner)
- [ ] Redirección a `/dashboard` después de login exitoso
- [ ] Si ya está autenticado, redirect `/login` → `/dashboard`

**Definition of Done (DoD)**:
- [ ] Código revisado
- [ ] Tests unitarios (validaciones)
- [ ] Test E2E: login exitoso + persistencia de sesión
- [ ] Test E2E: credenciales incorrectas muestran error
- [ ] Test E2E: sesión persiste después de refresh
- [ ] Documentación actualizada

**Criterios de Demo**:
1. Usuario previamente registrado
2. Abrir `/login`
3. Ingresar credenciales correctas
4. Click "Iniciar sesión"
5. Verificar redirección a `/dashboard`
6. Recargar página → seguir autenticado

---

### HU-3: Crear Tarea
**Como** usuario autenticado
**Quiero** crear una nueva tarea
**Para** organizar mis pendientes

**Prioridad**: 🔴 Crítica | **Estimación**: 3 puntos | **Sprint**: 1

**Criterios de aceptación**:
- [ ] Campo de texto para título (obligatorio, max 500 caracteres)
- [ ] Campo de texto para descripción (opcional, max 2000 caracteres)
- [ ] Contador de caracteres visible (ej: "450/500")
- [ ] Botón "Crear" deshabilitado si título está vacío
- [ ] La tarea aparece inmediatamente en la lista (optimistic update)
- [ ] Se guarda automáticamente en Supabase
- [ ] Mensaje de éxito ("Tarea creada exitosamente")
- [ ] Formulario se limpia después de crear
- [ ] Loading state durante creación
- [ ] Si API falla, rollback optimistic update + mensaje de error

**Definition of Done (DoD)**:
- [ ] Código revisado
- [ ] Tests unitarios (validaciones, optimistic update)
- [ ] Test E2E: crear tarea exitosamente
- [ ] Test E2E: validación de título vacío
- [ ] Test E2E: límite de caracteres respetado
- [ ] RLS policy validada (tarea solo visible para el creador)
- [ ] Documentación actualizada

**Métricas de Éxito**:
- Tiempo desde click "Crear" hasta tarea visible: **< 500ms**
- Tasa de éxito de creación: **> 98%**

**Criterios de Demo**:
1. Usuario autenticado en `/dashboard`
2. Escribir título "Comprar leche"
3. Escribir descripción (opcional)
4. Click "Crear"
5. Verificar tarea aparece en lista
6. Verificar tarea guardada en Supabase

---

### HU-4: Listar Tareas
**Como** usuario autenticado
**Quiero** ver todas mis tareas
**Para** saber qué tengo pendiente

**Prioridad**: 🔴 Crítica | **Estimación**: 2 puntos | **Sprint**: 1

**Criterios de aceptación**:
- [ ] Lista ordenada por `created_at` DESC (más reciente primero)
- [ ] Indicador visual de completado (checkbox marcado + tachado)
- [ ] Indicador visual de pendiente (checkbox vacío)
- [ ] Scroll si hay >10 tareas (overflow-y: auto)
- [ ] Mensaje amigable si no hay tareas ("No tienes tareas aún. ¡Crea tu primera tarea!")
- [ ] Skeleton loaders mientras carga
- [ ] Solo muestra tareas del usuario autenticado (RLS)
- [ ] Actualización en tiempo real (realtime subscription opcional MVP)

**Definition of Done (DoD)**:
- [ ] Código revisado
- [ ] Tests unitarios (ordenamiento, filtrado)
- [ ] Test E2E: lista muestra solo tareas propias
- [ ] Test E2E: empty state cuando no hay tareas
- [ ] Test RLS: Usuario A no ve tareas de Usuario B
- [ ] Documentación actualizada

**Métricas de Éxito**:
- Tiempo de carga inicial de tareas: **< 1s**
- Precisión de aislamiento de datos: **100%** (RLS)

**Criterios de Demo**:
1. Usuario A autenticado con 5 tareas
2. Abrir `/dashboard`
3. Verificar 5 tareas visibles
4. Crear Usuario B (sin tareas)
5. Login como B → ver empty state
6. Login como A → seguir viendo 5 tareas

---

### HU-5: Completar/Reactivar Tarea
**Como** usuario autenticado
**Quiero** marcar una tarea como completada o pendiente
**Para** trackear mi progreso

**Prioridad**: 🟡 Alta | **Estimación**: 2 puntos | **Sprint**: 1

**Criterios de aceptación**:
- [ ] Checkbox en cada tarea
- [ ] Click checkbox → toggle `is_completed` (true/false)
- [ ] Cambio visual inmediato (optimistic update):
  - Completada: checkbox marcado, texto tachado, color gris
  - Pendiente: checkbox vacío, texto normal, color negro
- [ ] Actualización en base de datos en tiempo real
- [ ] Si API falla, rollback visual + mensaje de error
- [ ] No se requiere confirmación (acción reversible)

**Definition of Done (DoD)**:
- [ ] Código revisado
- [ ] Tests unitarios (toggle logic, optimistic update)
- [ ] Test E2E: marcar completada y reactivar
- [ ] Test RLS: solo propietario puede marcar
- [ ] Documentación actualizada

**Métricas de Éxito**:
- Tiempo de respuesta visual: **< 100ms** (optimistic)
- Tasa de sincronización exitosa: **> 99%**

---

### HU-6: Editar Tarea
**Como** usuario autenticado
**Quiero** modificar el título o descripción de una tarea
**Para** corregir o actualizar información

**Prioridad**: 🟡 Alta | **Estimación**: 3 puntos | **Sprint**: 2

**Criterios de aceptación**:
- [ ] Botón "Editar" en cada tarea
- [ ] Click "Editar" → modo edición (inline o modal)
- [ ] Campos pre-rellenados con valores actuales
- [ ] Validación: título no vacío, límites de caracteres
- [ ] Botón "Guardar" y "Cancelar"
- [ ] "Guardar" → actualiza tarea + mensaje de éxito
- [ ] "Cancelar" → restaura valores originales
- [ ] Loading state durante guardado
- [ ] Si API falla, mensaje de error + mantener en modo edición

**Definition of Done (DoD)**:
- [ ] Código revisado
- [ ] Tests unitarios (validaciones, cancelar)
- [ ] Test E2E: editar título y descripción
- [ ] Test E2E: cancelar restaura valores
- [ ] Test RLS: solo propietario puede editar
- [ ] Documentación actualizada

---

### HU-7: Eliminar Tarea
**Como** usuario autenticado
**Quiero** eliminar una tarea
**Para** mantener mi lista limpia

**Prioridad**: 🟡 Alta | **Estimación**: 2 puntos | **Sprint**: 2

**Criterios de aceptación**:
- [ ] Botón "Eliminar" (ícono de papelera) en cada tarea
- [ ] Click "Eliminar" → modal de confirmación:
  - Título: "¿Eliminar tarea?"
  - Mensaje: "Esta acción no se puede deshacer"
  - Botones: "Cancelar" y "Eliminar" (rojo)
- [ ] "Eliminar" → elimina tarea + mensaje de éxito
- [ ] "Cancelar" → cierra modal sin cambios
- [ ] Tarea desaparece inmediatamente de la lista (optimistic)
- [ ] Si API falla, restaura tarea + mensaje de error
- [ ] No se puede deshacer (warning claro)

**Definition of Done (DoD)**:
- [ ] Código revisado
- [ ] Tests unitarios (confirmación, optimistic delete)
- [ ] Test E2E: eliminar con confirmación
- [ ] Test E2E: cancelar mantiene tarea
- [ ] Test RLS: solo propietario puede eliminar
- [ ] Documentación actualizada

**Métricas de Éxito**:
- Tasa de confirmación (no cancelación): **> 70%**

---

## 6. Flujos Críticos

### Flujo 1: Onboarding Completo
```
Usuario nuevo → Registro → Verificación email (opcional MVP) → Login automático → Dashboard vacío → Tour rápido (opcional) → Crear primera tarea
```

### Flujo 2: Sesión Existente
```
Landing → Login → Dashboard con tareas → CRUD operaciones → Logout
```

### Flujo 3: Recuperación de Contraseña (Post-MVP)
```
Login → "Olvidé mi contraseña" → Email de recuperación → Reset password → Login
```

## 7. Métricas de Éxito del MVP

### 7.1 Métricas de Usuario (User-Centric)

| Métrica | Target MVP | Método de medición | Herramienta |
|---------|------------|-------------------|-------------|
| **Tiempo a primera tarea** | < 2 minutos | Desde registro hasta crear 1ra tarea | Google Analytics / Custom Event |
| Tiempo de registro completo | < 30 segundos | Desde `/register` hasta `/dashboard` | GA Event Tracking |
| Tareas creadas por usuario (primera sesión) | >= 3 tareas | Query Supabase `created_at` dentro de 1h de registro | Supabase SQL Dashboard |
| Tasa de retención (D1) | >= 40% | Usuarios que vuelven al día siguiente | GA Cohort Analysis |
| Tasa de completitud de tareas | >= 60% | `COUNT(is_completed=true) / COUNT(*)` | Supabase Queries |

### 7.2 Métricas Técnicas (Performance)

| Métrica | Target MVP | Método de medición | Herramienta |
|---------|------------|-------------------|-------------|
| **First Contentful Paint (FCP)** | < 1.5s | Lighthouse | Vercel Analytics |
| **Time to Interactive (TTI)** | < 3s | Lighthouse | Vercel Analytics |
| **Largest Contentful Paint (LCP)** | < 2.5s | Web Vitals | Vercel Web Vitals |
| Tiempo de respuesta API (p95) | < 500ms | Supabase API logs | Supabase Dashboard |
| Tiempo de respuesta API (p50) | < 200ms | Supabase API logs | Supabase Dashboard |
| Bundle size (initial load) | < 200 KB | Build output | Vite bundle analyzer |

### 7.3 Métricas de Confiabilidad

| Métrica | Target MVP | Método de medición | Herramienta |
|---------|------------|-------------------|-------------|
| **Disponibilidad (uptime)** | >= 99.5% | Ping cada 5 min | UptimeRobot |
| Tasa de error en autenticación | < 5% | `errors / total_attempts` | Supabase Auth Logs |
| Tasa de éxito en CRUD | >= 98% | `success / total_operations` | Sentry Error Tracking |
| Tasa de sincronización (optimistic updates) | >= 99% | Rollbacks / total ops | Custom logging |

### 7.4 Métricas de Seguridad

| Métrica | Target MVP | Método de medición | Herramienta |
|---------|------------|-------------------|-------------|
| **RLS violations detectadas** | 0 | Intentos de acceso no autorizado | Supabase Logs + Alerts |
| Sesiones expiradas correctamente | 100% | Logout automático después de 7 días | Supabase Auth Config |
| Contraseñas débiles rechazadas | 100% | Validación >= 8 caracteres | Frontend + Backend |

### 7.5 Plan de Medición (Implementation)

**Fase 1: Setup Inicial (Día 1)**
```javascript
// Google Analytics Events
gtag('event', 'user_registered', { method: 'email' });
gtag('event', 'first_todo_created', { time_since_signup: seconds });
gtag('event', 'todo_completed', { todo_id: id });
```

**Fase 2: Custom Metrics (Semana 1)**
```sql
-- Query en Supabase Dashboard (ejecutar diariamente)
-- Tiempo promedio a primera tarea
SELECT
  AVG(EXTRACT(EPOCH FROM (first_todo.created_at - users.created_at))) as avg_time_to_first_todo
FROM auth.users
LEFT JOIN LATERAL (
  SELECT created_at
  FROM todos
  WHERE user_id = users.id
  ORDER BY created_at
  LIMIT 1
) first_todo ON true
WHERE users.created_at > NOW() - INTERVAL '7 days';
```

**Fase 3: Dashboards (Semana 2)**
- [ ] Vercel Analytics Dashboard configurado
- [ ] Supabase SQL queries guardadas para métricas semanales
- [ ] Sentry dashboard con alertas para errores críticos
- [ ] UptimeRobot configurado con alertas por email

## 8. Restricciones y Dependencias

### Restricciones
- Supabase Free Tier: 500 MB storage, 2 GB bandwidth/mes
- Vercel Free Tier: 100 GB bandwidth/mes
- Solo desktop y mobile (no native apps)

### Dependencias Externas
- Supabase disponible (API + DB)
- Vercel disponible para deploy
- DNS configurado (si dominio custom)

## 9. Riesgos Identificados

### 9.1 Riesgos Técnicos

| ID | Riesgo | Probabilidad | Impacto | Severidad | Mitigación | Plan de Contingencia |
|----|--------|--------------|---------|-----------|------------|---------------------|
| **R-T1** | **Límite Free Tier Supabase** (500 MB, 2 GB bandwidth) | 🟡 Media | 🔴 Alto | **ALTA** | • Monitoreo semanal de uso en Dashboard<br>• Alert cuando >80% del límite<br>• Optimizar queries (SELECT solo campos necesarios) | • Upgrade a Pro ($25/mes) en 24h<br>• Comunicar a usuarios downtime potencial |
| **R-T2** | **Vulnerabilidad RLS mal configurada** (data leak) | 🟢 Baja | 🔴 Crítico | **CRÍTICA** | • Testing con 2+ usuarios reales<br>• Auditoría de políticas pre-deploy<br>• Penetration testing manual<br>• Revisar logs de Supabase semanalmente | • Rollback inmediato<br>• Notificación a usuarios afectados<br>• Auditoría completa de accesos |
| **R-T3** | **Pérdida de datos por bug en CRUD** | 🟢 Baja | 🔴 Alto | **ALTA** | • Tests E2E para todos los flujos CRUD<br>• Validaciones frontend + backend<br>• Optimistic updates con rollback<br>• Backups automáticos diarios (Supabase) | • Restaurar desde backup (últimas 7 días)<br>• Investigar logs de error |
| **R-T4** | **Deploy fallido en Vercel** | 🟡 Media | 🟡 Medio | **MEDIA** | • Build local antes de push<br>• Preview deployments en PRs<br>• Rollback automático si health check falla | • Rollback a versión anterior (1-click)<br>• Fix + redeploy en <30 min |
| **R-T5** | **Performance degradation** (>3s load time) | 🟡 Media | 🟡 Medio | **MEDIA** | • Lighthouse CI en cada PR<br>• Bundle size monitoring<br>• Code splitting (vendor, app)<br>• Lazy loading de componentes | • Identificar componentes pesados<br>• Añadir caching agresivo<br>• CDN optimization |
| **R-T6** | **Session hijacking** (JWT theft) | 🟢 Baja | 🔴 Alto | **ALTA** | • HTTPS obligatorio (Vercel)<br>• HttpOnly cookies (Supabase)<br>• Short-lived JWT (7 días)<br>• Security headers (CSP, X-Frame-Options) | • Invalidar todas las sesiones<br>• Forzar re-login<br>• Investigación de seguridad |
| **R-T7** | **Supabase outage** (servicio caído) | 🟢 Baja | 🔴 Alto | **ALTA** | • Status page monitoring<br>• Uptime alerts configurados<br>• Multi-region (no en free tier) | • Mostrar banner "Servicio temporalmente no disponible"<br>• Comunicar ETA via Twitter/email |

### 9.2 Riesgos de Producto

| ID | Riesgo | Probabilidad | Impacto | Mitigación |
|----|--------|--------------|---------|------------|
| **R-P1** | **Usuarios no ven valor** (baja adopción) | 🟡 Media | 🔴 Alto | • Validar con 5 usuarios beta antes de launch<br>• Onboarding claro con tooltips<br>• Métricas de "time to first todo" |
| **R-P2** | **UX confusa** (usuarios no saben cómo editar/eliminar) | 🟡 Media | 🟡 Medio | • User testing con 3 usuarios<br>• Tooltips en primera sesión<br>• Iconos estándar (papelera = eliminar) |
| **R-P3** | **Competencia directa** (Todoist, TickTick) | 🔴 Alta | 🟡 Medio | • Enfoque en simplicidad extrema<br>• No competir en features, sino en UX |

### 9.3 Riesgos de Equipo

| ID | Riesgo | Probabilidad | Impacto | Mitigación |
|----|--------|--------------|---------|------------|
| **R-E1** | **Developer bloqueado** (enfermedad, vacaciones) | 🟡 Media | 🟡 Medio | • Documentación completa (6 docs en /docs/p4)<br>• Code reviews obligatorios (knowledge sharing)<br>• Pair programming en features críticas |
| **R-E2** | **Scope creep** (features no planificadas) | 🔴 Alta | 🟡 Medio | • Definition of Done estricta<br>• Product Owner con veto power<br>• "No-Scope" documentado públicamente |
| **R-E3** | **Burnout del equipo** | 🟡 Media | 🔴 Alto | • Sprints de 2 semanas max<br>• No overtime obligatorio<br>• Retrospectivas semanales |

### 9.4 Matriz de Riesgo (Priorización)

```
         IMPACTO
         │
Crítico  │  [R-T2]              [R-T6] [R-T7]
         │  RLS Vuln            Session│Outage
         │                      Hijack │
Alto     │  [R-T1] [R-T3]       [R-P1] [R-E3]
         │  Límite  Data Loss   Adopción│Burnout
         │  Supabase            │      │
Medio    │  [R-T4] [R-T5]       [R-P2] [R-P3] [R-E1] [R-E2]
         │  Deploy  Perf        UX│Comp│Block│Scope
         │                      │     │     │Creep
Bajo     │
         │
         └────────────────────────────────────────
            Baja    Media      Alta   PROBABILIDAD
```

### 9.5 Plan de Monitoreo de Riesgos

**Diario**:
- [ ] Check Vercel deployment status
- [ ] Review Sentry error count (threshold: <10 errors/day)
- [ ] Check uptime (UptimeRobot)

**Semanal**:
- [ ] Review Supabase usage (storage, bandwidth)
- [ ] Audit RLS policies (manual test con 2 usuarios)
- [ ] Review métricas de producto (tiempo a primera tarea)
- [ ] Retrospectiva de equipo (blockers, burnout check)

**Mensual**:
- [ ] Security audit completo (penetration testing)
- [ ] Performance audit (Lighthouse)
- [ ] Review de roadmap vs scope creep

## 10. Criterios de Salida del MVP (Definition of Ready para Launch)

### 10.1 Funcionalidad Core
- [ ] **HU-1 a HU-7** implementadas y validadas (7/7)
- [ ] Todas las HU con DoD completado (tests + code review + docs)
- [ ] Flujo completo probado: Registro → Login → CRUD → Logout
- [ ] RLS policies validadas con 2+ usuarios reales (isolation 100%)
- [ ] Optimistic updates funcionando en Create, Update, Delete

### 10.2 Calidad y Testing
- [ ] **Tests unitarios**: Coverage >= 70% en composables críticos (useAuth, useTodos)
- [ ] **Tests E2E**: Al menos 10 escenarios críticos (Playwright/Cypress)
  - [ ] Happy path: Registro + primera tarea
  - [ ] Error path: Login fallido, validación de formularios
  - [ ] RLS: Usuario A no ve tareas de Usuario B
- [ ] **Code review**: 100% del código revisado por al menos 1 developer
- [ ] **Linter**: 0 errores de ESLint
- [ ] **TypeScript**: 0 errores de compilación

### 10.3 Performance
- [ ] **Lighthouse Score**: >= 80 en Performance
- [ ] **First Contentful Paint**: < 1.5s
- [ ] **Time to Interactive**: < 3s
- [ ] **Bundle size**: < 200 KB (gzipped)
- [ ] **API response time**: p95 < 500ms (validado en Supabase Dashboard)

### 10.4 Seguridad
- [ ] **HTTPS**: Habilitado en producción (Vercel automático)
- [ ] **RLS**: Auditado y sin vulnerabilidades detectadas
- [ ] **Security headers**: Configurados (CSP, X-Frame-Options, etc.)
- [ ] **Penetration testing**: Manual básico completado
- [ ] **Secrets management**: Variables de entorno seguras (no hardcoded)

### 10.5 Deploy y Operaciones
- [ ] **Deploy exitoso** en Vercel con HTTPS
- [ ] **Preview environment**: Funcional para PRs
- [ ] **Rollback plan**: Documentado y testeado (1-click rollback)
- [ ] **Monitoring**: Vercel Analytics + Sentry + UptimeRobot configurados
- [ ] **Alertas**: Configuradas para errors críticos (Sentry) y downtime (UptimeRobot)

### 10.6 Documentación
- [ ] **Documentación técnica completa** (6 docs en `/docs/p4/`)
  - [x] 1-scope-mvp.md
  - [x] 2-data-model.md
  - [x] 3-rls-policies.md
  - [x] 4-ui-component-map.md
  - [x] 5-integration-plan.md
  - [x] 6-deployment-checklist.md
- [ ] **README.md**: Actualizado con instrucciones de setup local
- [ ] **CHANGELOG.md**: Versión 1.0 documentada
- [ ] **Runbook**: Procedimientos para incidentes comunes

### 10.7 Product Readiness
- [ ] **User testing**: Al menos 3 usuarios beta han usado la app sin issues bloqueantes
- [ ] **Onboarding**: Primera sesión validada (time to first todo < 2 min)
- [ ] **Metrics tracking**: Analytics configurado para medir métricas clave
- [ ] **Sin bugs críticos**: 0 bugs P0 (bloqueantes)
- [ ] **Bugs menores**: <= 5 bugs P1-P2 (conocidos y documentados en backlog)

### 10.8 Legal y Compliance (Opcional MVP, Crítico v2)
- [ ] **Términos de Servicio**: Básicos (opcional MVP)
- [ ] **Privacy Policy**: Básica - qué datos guardamos (email, tareas)
- [ ] **GDPR compliance**: Data export/delete capability (post-MVP)

---

## 11. Roadmap Post-MVP

### v1.1 (Mejoras Rápidas - Semana 1 post-launch)
- [ ] Dark mode (si usuarios lo solicitan)
- [ ] Filtros básicos (completadas/pendientes)
- [ ] Búsqueda por título

### v2.0 (Features Validadas - Mes 2)
- [ ] Fechas de vencimiento
- [ ] Notificaciones por email
- [ ] OAuth (Google login)
- [ ] Compartir tareas

### v3.0+ (Roadmap Flexible)
- Basado en feedback de usuarios y métricas de adopción
- Priorizar features con mejor ROI (impacto/esfuerzo)

---

**Documento**: Scope MVP
**Versión**: 2.0 (Enriquecida)
**Fecha**: 2025-12-16
**Última actualización**: 2025-12-16
**Propietario**: Equipo Producto P4
**Revisores**: Tech Lead, Product Owner
**Estado**: ✅ Aprobado para Implementación
