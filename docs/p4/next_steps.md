# Roadmap del Proyecto (Post-MVP)

Este documento detalla la hoja de ruta para las siguientes iteraciones del proyecto ToDoApp, priorizando funcionalidades de negocio y deuda técnica.

---

## 📅 Q1 2026: Expansión de Funcionalidades (v2.0)

| Feature                    | Prioridad |   Estado    | Due Date | Colaboración      |
| :------------------------- | :-------: | :---------: | :------: | :---------------- |
| **Etiquetas / Categorías** |   Alta    | 🔴 Pendiente |  15 Ene  | Frontend + Diseño |
| **Fechas de Vencimiento**  |   Alta    | 🔴 Pendiente |  30 Ene  | Backend (Schema)  |
| **Modo Oscuro/Claro**      |   Media   | 🟡 En Diseño |  10 Feb  | Frontend          |
| **Búsqueda y Filtros**     |   Media   | 🔴 Pendiente |  25 Feb  | Frontend          |

### Detalles de Implementación
*   **Etiquetas**: Relación many-to-many entre `todos` y `tags`.
*   **Fechas**: Nuevo campo `due_date` (timestamp) en tabla `todos`. Envío de notificaciones (future scope).

---

## 🤝 Q2 2026: Colaboración y Social (v3.0)

| Feature                   | Prioridad |   Estado    | Due Date | Colaboración           |
| :------------------------ | :-------: | :---------: | :------: | :--------------------- |
| **Compartir Listas**      |  Crítica  | 🔴 Pendiente |  15 Abr  | Backend (RLS policies) |
| **Comentarios en Tareas** |   Baja    | 🔴 Pendiente |  30 May  | Fullstack              |
| **OAuth (Google/GitHub)** |   Media   | 🔴 Pendiente |  15 Jun  | DevOps / Auth          |

### Detalles de Implementación
*   **Compartir**: Requerirá una tabla `todo_shares` y actualizaciones complejas a las políticas RLS.
*   **OAuth**: Configuración en Supabase Auth providers.

---

## 🛠 Deuda Técnica y Mantenimiento

Estas tareas se ejecutarán en paralelo a los sprints de producto (20% del esfuerzo).

- [ ] **Tests E2E**: Implementar Playwright para flujos críticos (Login, Create Todo).
- [ ] **CI/CD**: Pipeline automatizado que corra tests antes del deploy a Production.
- [ ] **Monitoreo**: Integrar Sentry para tracking de errores en frontend.
- [ ] **Accesibilidad**: Auditoría WCAG 2.1 AA completa.

---

## Leyenda de Estados
- 🔴 **Pendiente**: No iniciado.
- 🟡 **En Progreso / Diseño**: Se está trabajando activamente.
- 🟢 **Listo**: Completado y desplegado.
