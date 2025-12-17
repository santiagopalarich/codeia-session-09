# Roadmap del Proyecto - ToDo App v2

Este documento detalla el plan de evolución para la aplicación, consolidando las mejoras recientes (Gestión Avanzada de Tareas) y definiendo los próximos pasos hacia un producto listo para producción.

## 🚀 Fase 1: Consolidación y UX (Prioridad Inmediata)

### 1.1. Responsividad Móvil (Critical)
**Problema:** La aplicación actual rompe su diseño en pantallas menores a 768px (móviles y tablets verticales).
- [ ] **Sidebar Colapsable:** Implementar un menú "hamburguesa" que permita ocultar/mostrar la barra lateral en móviles.
- [ ] **Layout Adaptable:** Ajustar `grid` y `flex` en `DashboardView` para que las columnas Kanban se apilen verticalmente o sean navegables mediante pestañas/scroll horizontal en móvil.

### 1.2. Mejora de Interacciones
- [ ] **Feedback de Usuario:** Reemplazar los `alert()` nativos por un sistema de notificaciones "Toast" (e.g., "Tarea creada con éxito", "Error al guardar").
- [ ] **Confirmación de Destrucción:** Añadir diálogos de confirmación antes de eliminar tareas o equipos.
- [ ] **Estados de Carga (Skeletons):** Implementar "Skeleton Loaders" en las tarjetas de tareas mientras se cargan los datos, en lugar del texto "Loading...".

---

## 🛠 Fase 2: Funcionalidades Colaborativas

### 2.1. Gestión de Miembros de Equipo
**Estado Actual:** Existe la vista de equipos pero el botón "Manage Members" es un placeholder.
- [ ] **Invitar Usuarios:** Permitir agregar usuarios a un equipo mediante búsqueda por email.
- [ ] **Roles:** Implementar roles reales (Admin vs Miembro) que restrinjan quién puede editar/eliminar tareas del equipo.

### 2.2. Filtros y Búsqueda Avanzada
**Problema:** A medida que crecen las tareas, el tablero se vuelve inmanejable.
- [ ] **Barra de Búsqueda:** Filtrar tareas por título en tiempo real.
- [ ] **Filtros por Atributo:** "Mis Tareas" (asignadas a mí), "Tareas de mi Equipo", "Vencidas".
- [ ] **Ordenamiento:** Permitir ordenar columnas por Fecha de Creación, Deadline Vencido, o Prioridad.

---

## 📦 Fase 3: Enriquecimiento de Tareas

### 3.1. Adjuntos y Archivos
- [ ] **Supabase Storage:** Permitir subir imágenes o documentos a una tarea.
- [ ] **Previsualización:** Mostrar miniaturas de adjuntos en la tarjeta o el modal.

### 3.2. Subtareas (Checklists)
- [ ] **Lista de Pasos:** Añadir una lista de verificación dentro de la tarea (e.g., 0/5 completado) para granular el progreso.
- [ ] **Progreso Visual:** Mostrar una barra de progreso en la tarjeta si tiene subtareas.

### 3.3. Comentarios
- [ ] **Chat por Tarea:** Habilitar un hilo de comentarios en el modal de detalles para discutir sobre la tarea específica.

---

## 🏗 Fase 4: Arquitectura y Calidad (Técnico)

### 4.1. Gestión de Estado Global (Pinia)
**Problema Actual:** `useTodos`, `useTeams`, `useProfiles` manejan estado localmente o reactivamente pero sin una fuente de verdad global robusta para caché.
- [ ] **Migración a Pinia:** Centralizar el estado para evitar re-fetchings innecesarios al navegar entre vistas.

### 4.2. Refactorización de Componentes
- [ ] **Atomic Design:** Separar componentes UI puros (Botones, Inputs, Badges) de componentes de lógica de negocio.
- [ ] **Types:** Asegurar cobertura de TypeScript al 100% y eliminar cualquier `any` residual.

---

## ✅ Historial de Logros Recientes
- [x] **Gestión Avanzada de Tareas:** Implementado Modal de edición completo.
- [x] **Campos Nuevos:** Asignado, Responsable, Deadline, Equipo.
- [x] **Drag & Drop:** Implementado funcionalidad básica de arrastrar entre columnas.
- [x] **Base de Datos:** Migración de esquema a Supabase con tablas relacionales (`teams`, `profiles`).
