# Plan de Mejoras y Roadmap - ToDo App

Basado en la auditoría de navegación y diseño, se ha elaborado el siguiente plan de acción.

## 1. Mejoras Visuales y UX (Prioridad Alta)

### 📱 Responsividad Móvil (Critical)
Actualmente, la aplicación no es utilizable en dispositivos móviles (375px) porque la barra lateral es fija y aplasta el contenido principal.
- **Acción**: Implementar un menú "Hamburguesa" para móviles que oculte/muestre la barra lateral.
- **Acción**: Ajustar el tablero Kanban para que sea navegable horizontalmente en móviles o apile las columnas verticalmente.

### 🎨 Scroll del Kanban
- **Problema**: Actualmente, si hay muchas tareas, toda la columna se desplaza, ocultando el encabezado "To Do".
- **Solución**: Fijar la altura de las columnas (`calc(100vh - header)`) y hacer scrollable únicamente el contenedor de la lista de tareas (`.task-list`).

### ✨ Estados Vacíos y Carga
- Mejorar la visualización cuando no hay tareas en "In Progress" o "Done".
- Añadir transiciones suaves (fade-in) al cargar tareas o cambiar de tema.

## 2. Corrección de Errores y Calidad de Código

### 🚫 Reemplazar `window.prompt`
- **Problema**: El uso de alertas nativas del navegador para crear tareas es una mala experiencia de usuario.
- **Solución**: Crear un componente `Modal` o un formulario en línea (inline-input) en la parte superior de la columna "To Do" para añadir tareas rápidamente.

### 🐛 Ajustes de Estilo
- Revisar contrastes en Modo Light para asegurar que todos los textos sean legibles sobre los fondos grisáceos nuevos.

## 3. Nuevas Funcionalidades (Roadmap)

### 🏗️ Estado "In Progress" Real
- **Estado Actual**: La base de datos solo soporta `is_completed` (Booleano).
- **Acción**: Migrar el esquema de Base de Datos para usar un campo `status` ('todo', 'in_progress', 'done').

### 🖱️ Drag & Drop (Arrastrar y Soltar)
- Implementar la capacidad de mover tarjetas entre columnas arrastrándolas para actualizar su estado automáticamente.

### 📝 Detalles de Tarea
- Permitir hacer clic en una tarjeta para abrir un modal con detalles, editar descripción y cambiar etiquetas.

---
**Siguientes Pasos Recomendados:**
1. Arreglar la responsividad móvil inmediatamente.
2. Reemplazar el `prompt` de creación de tareas.
3. Implementar Drag & Drop junto con la migración de DB para estados.
