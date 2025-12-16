# P4 - To-Do App: Modelo de Datos

## 1. Diagrama Entidad-Relación

```
┌─────────────────────┐
│   auth.users        │ (Supabase Auth - gestionado automáticamente)
│─────────────────────│
│ id (uuid) PK        │
│ email               │
│ created_at          │
│ ...metadata         │
└─────────────────────┘
          │
          │ 1:N
          │
          ▼
┌─────────────────────┐
│   public.todos      │
│─────────────────────│
│ id (uuid) PK        │
│ user_id (uuid) FK   │───► auth.users.id
│ title (text)        │
│ description (text)  │
│ is_completed (bool) │
│ created_at (tz)     │
│ updated_at (tz)     │
└─────────────────────┘
```

## 2. Esquema de Base de Datos

### 2.1 Tabla: `auth.users`
**Nota**: Gestionada automáticamente por Supabase Auth. No requiere creación manual.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | uuid | ID único del usuario (PK) |
| `email` | varchar | Email del usuario |
| `encrypted_password` | varchar | Contraseña hasheada |
| `email_confirmed_at` | timestamptz | Fecha de verificación de email |
| `created_at` | timestamptz | Fecha de creación |

---

### 2.2 Tabla: `public.todos`

| Campo | Tipo | Constraints | Descripción |
|-------|------|-------------|-------------|
| `id` | uuid | PRIMARY KEY DEFAULT uuid_generate_v4() | ID único de la tarea |
| `user_id` | uuid | REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL | Propietario de la tarea |
| `title` | text | NOT NULL CHECK (length(trim(title)) > 0) | Título de la tarea (1-500 chars) |
| `description` | text | NULL | Descripción opcional (max 2000 chars) |
| `is_completed` | boolean | NOT NULL DEFAULT false | Estado de completitud |
| `created_at` | timestamptz | NOT NULL DEFAULT now() | Timestamp de creación |
| `updated_at` | timestamptz | NOT NULL DEFAULT now() | Timestamp de última actualización |

**Índices**:
```sql
-- Índice compuesto para consultas filtradas por usuario
CREATE INDEX idx_todos_user_created ON public.todos(user_id, created_at DESC);

-- Índice para filtrado por estado (si se añade en futuro)
CREATE INDEX idx_todos_user_completed ON public.todos(user_id, is_completed);
```

---

## 3. Script de Creación (SQL)

```sql
-- ==============================================
-- P4 To-Do App - Database Schema
-- ==============================================

-- Habilitar extensión UUID (si no está activa)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla principal de tareas
CREATE TABLE public.todos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL CHECK (length(trim(title)) > 0 AND length(title) <= 500),
    description TEXT CHECK (description IS NULL OR length(description) <= 2000),
    is_completed BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices para optimización de consultas
CREATE INDEX idx_todos_user_created ON public.todos(user_id, created_at DESC);
CREATE INDEX idx_todos_user_completed ON public.todos(user_id, is_completed);

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_todos_updated_at
    BEFORE UPDATE ON public.todos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Comentarios para documentación
COMMENT ON TABLE public.todos IS 'Tareas de usuarios con RLS habilitado';
COMMENT ON COLUMN public.todos.user_id IS 'FK a auth.users - propietario de la tarea';
COMMENT ON COLUMN public.todos.title IS 'Título obligatorio (1-500 caracteres)';
COMMENT ON COLUMN public.todos.description IS 'Descripción opcional (max 2000 caracteres)';
```

---

## 4. Reglas de Validación

### 4.1 Validaciones en Base de Datos (PostgreSQL)

| Campo | Regla | Mensaje de Error |
|-------|-------|------------------|
| `title` | NOT NULL + longitud > 0 | "El título es obligatorio" |
| `title` | longitud <= 500 | "El título no puede exceder 500 caracteres" |
| `description` | longitud <= 2000 | "La descripción no puede exceder 2000 caracteres" |
| `user_id` | FK válida + EXISTS | "Usuario no válido" |

### 4.2 Validaciones en Frontend (Vue)

```typescript
interface TodoValidationRules {
  title: {
    required: true,
    minLength: 1,
    maxLength: 500,
    trim: true
  },
  description: {
    required: false,
    maxLength: 2000
  }
}
```

**Validaciones en tiempo real**:
- ✅ Título: deshabilitar botón "Guardar" si está vacío
- ✅ Contador de caracteres (ej: "450/500")
- ✅ Mensajes de error inline

---

## 5. Contratos de API (Supabase Client)

### 5.1 Crear Tarea
```typescript
// POST (insert)
const { data, error } = await supabase
  .from('todos')
  .insert({
    title: string,        // required
    description?: string, // optional
    is_completed: false   // default
    // user_id se inyecta automáticamente por RLS
  })
  .select()
  .single();

// Response exitoso
{
  id: "uuid",
  user_id: "uuid",
  title: "Comprar leche",
  description: null,
  is_completed: false,
  created_at: "2025-12-16T10:00:00Z",
  updated_at: "2025-12-16T10:00:00Z"
}

// Error
{
  error: {
    message: "new row violates check constraint",
    code: "23514"
  }
}
```

---

### 5.2 Listar Tareas del Usuario
```typescript
// GET (select)
const { data, error } = await supabase
  .from('todos')
  .select('*')
  .order('created_at', { ascending: false });

// Response
[
  {
    id: "uuid-1",
    title: "Tarea 1",
    is_completed: true,
    created_at: "2025-12-16T09:00:00Z",
    ...
  },
  {
    id: "uuid-2",
    title: "Tarea 2",
    is_completed: false,
    created_at: "2025-12-16T10:00:00Z",
    ...
  }
]
```

---

### 5.3 Actualizar Tarea
```typescript
// PATCH (update)
const { data, error } = await supabase
  .from('todos')
  .update({
    title?: string,
    description?: string,
    is_completed?: boolean
  })
  .eq('id', todoId)
  .select()
  .single();

// Response: objeto actualizado con nuevo updated_at
```

---

### 5.4 Eliminar Tarea
```typescript
// DELETE
const { error } = await supabase
  .from('todos')
  .delete()
  .eq('id', todoId);

// Response exitoso: error = null
```

---

## 6. Consideraciones de Performance

### 6.1 Límites de Paginación (Futuro)
```typescript
// Para listas con >100 tareas
const PAGE_SIZE = 50;

const { data } = await supabase
  .from('todos')
  .select('*')
  .range(0, PAGE_SIZE - 1)
  .order('created_at', { ascending: false });
```

### 6.2 Proyección Selectiva
```typescript
// Si solo necesitas ciertos campos
const { data } = await supabase
  .from('todos')
  .select('id, title, is_completed')
  .eq('is_completed', false);
```

### 6.3 Realtime Subscriptions
```typescript
// Escuchar cambios en tiempo real
const channel = supabase
  .channel('todos-changes')
  .on('postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'todos',
      filter: `user_id=eq.${userId}`
    },
    (payload) => {
      console.log('Change received!', payload);
    }
  )
  .subscribe();
```

---

## 7. Migraciones y Versiones

### Estrategia de Migraciones
- **Herramienta**: Supabase Migrations CLI
- **Versionado**: `YYYYMMDDHHMMSS_description.sql`
- **Rollback**: Mantener scripts de reversión

### Migración Inicial
```bash
# Archivo: 20251216000000_initial_schema.sql
# Contiene: CREATE TABLE todos + índices + triggers

# Aplicar
supabase db push

# Verificar
supabase db diff
```

---

## 8. Plan de Backup

| Aspecto | Configuración |
|---------|---------------|
| **Frecuencia** | Diaria automática (Supabase) |
| **Retención** | 7 días (Free Tier) |
| **Restauración** | Via Supabase Dashboard |
| **Testing** | Restauración mensual en entorno staging |

---

## 9. Checklist de Validación del Modelo

- [ ] Tabla `todos` creada con todas las columnas
- [ ] Índices creados correctamente
- [ ] Trigger `update_updated_at` funcionando
- [ ] Constraints de validación testeados (título vacío, longitud)
- [ ] Foreign key a `auth.users` configurada con CASCADE
- [ ] Comentarios SQL añadidos para documentación
- [ ] RLS habilitado (ver documento 3-rls-policies.md)

---

**Documento**: Data Model
**Versión**: 1.0
**Fecha**: 2025-12-16
**Propietario**: Equipo Plataforma P4
