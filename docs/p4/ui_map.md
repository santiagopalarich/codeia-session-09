# P4 - To-Do App: Mapa de Componentes UI

## 1. Arquitectura de Componentes Vue

```
App.vue (Root)
│
├── Router (vue-router)
│   │
│   ├── /login ────────► LoginView.vue
│   │                    └── LoginForm.vue
│   │
│   ├── /register ─────► RegisterView.vue
│   │                    └── RegisterForm.vue
│   │
│   └── /dashboard ────► DashboardView.vue (Protected Route)
│                        ├── AppHeader.vue
│                        ├── TodoList.vue
│                        │   ├── TodoItem.vue (loop)
│                        │   └── EmptyState.vue
│                        ├── CreateTodoForm.vue
│                        └── AppFooter.vue
│
└── Global Components
    ├── BaseButton.vue
    ├── BaseInput.vue
    ├── BaseModal.vue
    └── BaseToast.vue
```

---

## 2. Inventario de Componentes

### 2.1 Layout Components

| Componente | Responsabilidad | Props | Emits |
|------------|----------------|-------|-------|
| `App.vue` | Root, router-view, global state | - | - |
| `AppHeader.vue` | Logo, usuario, logout button | `user: User` | `logout` |
| `AppFooter.vue` | Copyright, links | - | - |

---

### 2.2 View Components (Pages)

| Componente | Ruta | Protegida | Descripción |
|------------|------|-----------|-------------|
| `LoginView.vue` | `/login` | No | Página de login |
| `RegisterView.vue` | `/register` | No | Página de registro |
| `DashboardView.vue` | `/dashboard` | Sí | Página principal con tareas |

---

### 2.3 Feature Components

#### `LoginForm.vue`
**Responsabilidad**: Formulario de autenticación

**Props**: Ninguno

**Emits**:
- `login-success`: Cuando login es exitoso

**Estado Interno**:
```typescript
{
  email: string,
  password: string,
  loading: boolean,
  error: string | null
}
```

**API Calls**:
- `supabase.auth.signInWithPassword()`

---

#### `RegisterForm.vue`
**Responsabilidad**: Formulario de registro

**Props**: Ninguno

**Emits**:
- `register-success`: Cuando registro es exitoso

**Estado Interno**:
```typescript
{
  email: string,
  password: string,
  passwordConfirm: string,
  loading: boolean,
  error: string | null
}
```

**Validaciones**:
- Email válido (regex)
- Password >= 8 caracteres
- Passwords coinciden

**API Calls**:
- `supabase.auth.signUp()`

---

#### `TodoList.vue`
**Responsabilidad**: Lista de tareas del usuario

**Props**:
```typescript
{
  todos: Todo[],
  loading: boolean
}
```

**Emits**:
- `todo-update`: Cuando se edita una tarea
- `todo-delete`: Cuando se elimina una tarea
- `todo-toggle`: Cuando se marca como completada

**Slots**: Ninguno

**Lógica**:
- Renderiza `TodoItem` por cada tarea
- Muestra `EmptyState` si `todos.length === 0`
- Ordenamiento por `created_at DESC`

---

#### `TodoItem.vue`
**Responsabilidad**: Tarjeta individual de tarea

**Props**:
```typescript
{
  todo: Todo,
  editable: boolean = true
}
```

**Emits**:
- `update`: Cuando se edita
- `delete`: Cuando se elimina
- `toggle-complete`: Cuando se marca checkbox

**Estado Interno**:
```typescript
{
  isEditing: boolean,
  localTitle: string,
  localDescription: string
}
```

**Acciones**:
- Click en checkbox → emit `toggle-complete`
- Click en "Edit" → `isEditing = true`
- Click en "Delete" → modal confirmación → emit `delete`

---

#### `CreateTodoForm.vue`
**Responsabilidad**: Formulario para crear nueva tarea

**Props**: Ninguno

**Emits**:
- `todo-created`: Cuando se crea exitosamente

**Estado Interno**:
```typescript
{
  title: string,
  description: string,
  loading: boolean,
  error: string | null
}
```

**Validaciones**:
- Título no vacío
- Título <= 500 caracteres

**API Calls**:
- `supabase.from('todos').insert()`

---

#### `EmptyState.vue`
**Responsabilidad**: Mensaje cuando no hay tareas

**Props**:
```typescript
{
  message?: string = "No tienes tareas aún"
}
```

**UI**: Ilustración + texto + botón "Crear primera tarea" (opcional)

---

### 2.4 Base Components (Reusables)

#### `BaseButton.vue`
**Props**:
```typescript
{
  variant: 'primary' | 'secondary' | 'danger' = 'primary',
  loading: boolean = false,
  disabled: boolean = false
}
```

**Slots**: `default` (contenido del botón)

---

#### `BaseInput.vue`
**Props**:
```typescript
{
  modelValue: string,
  type: 'text' | 'email' | 'password' = 'text',
  label?: string,
  error?: string,
  maxlength?: number
}
```

**Emits**: `update:modelValue`

**Features**:
- Contador de caracteres si `maxlength` presente
- Mensaje de error inline

---

#### `BaseModal.vue`
**Props**:
```typescript
{
  show: boolean,
  title?: string,
  closable: boolean = true
}
```

**Emits**: `close`

**Slots**:
- `default`: Contenido del modal
- `footer`: Botones de acción

---

#### `BaseToast.vue`
**Props**:
```typescript
{
  message: string,
  type: 'success' | 'error' | 'info' = 'info',
  duration: number = 3000
}
```

**Comportamiento**: Auto-cierre después de `duration` ms

---

## 3. Composables (Composition API)

### 3.1 `useAuth.ts`
**Responsabilidad**: Gestión de autenticación

**Exports**:
```typescript
{
  user: Ref<User | null>,
  session: Ref<Session | null>,
  loading: Ref<boolean>,

  signIn(email: string, password: string): Promise<void>,
  signUp(email: string, password: string): Promise<void>,
  signOut(): Promise<void>,

  isAuthenticated: ComputedRef<boolean>
}
```

**Inicialización**:
```typescript
const { user, session } = useAuth();

onMounted(async () => {
  // Restaurar sesión desde localStorage
  const { data } = await supabase.auth.getSession();
  session.value = data.session;
  user.value = data.session?.user ?? null;
});
```

---

### 3.2 `useTodos.ts`
**Responsabilidad**: CRUD de tareas

**Exports**:
```typescript
{
  todos: Ref<Todo[]>,
  loading: Ref<boolean>,
  error: Ref<string | null>,

  fetchTodos(): Promise<void>,
  createTodo(todo: Partial<Todo>): Promise<Todo>,
  updateTodo(id: string, updates: Partial<Todo>): Promise<Todo>,
  deleteTodo(id: string): Promise<void>,
  toggleComplete(id: string): Promise<void>,

  // Realtime subscription
  subscribeToChanges(): () => void
}
```

**Ejemplo de uso**:
```typescript
const { todos, loading, createTodo } = useTodos();

await createTodo({ title: 'Nueva tarea' });
```

---

### 3.3 `useToast.ts`
**Responsabilidad**: Notificaciones globales

**Exports**:
```typescript
{
  toasts: Ref<Toast[]>,

  showToast(message: string, type?: ToastType): void,
  showSuccess(message: string): void,
  showError(message: string): void,

  removeToast(id: string): void
}
```

---

## 4. Flujos de Navegación

### 4.1 Flujo: Usuario Nuevo
```
Landing Page (/)
  │
  ├─ Click "Registrarse"
  │
  ▼
RegisterView (/register)
  │
  ├─ Llenar formulario
  ├─ Submit
  │
  ▼
supabase.auth.signUp()
  │
  ├─ Éxito ✓
  │
  ▼
Redirect → DashboardView (/dashboard)
  │
  ▼
EmptyState (sin tareas)
  │
  ├─ Click "Crear tarea"
  │
  ▼
CreateTodoForm
  │
  ▼
Primera tarea creada
```

---

### 4.2 Flujo: Usuario Existente
```
Landing Page (/)
  │
  ├─ Click "Iniciar sesión"
  │
  ▼
LoginView (/login)
  │
  ├─ Llenar formulario
  ├─ Submit
  │
  ▼
supabase.auth.signInWithPassword()
  │
  ├─ Éxito ✓
  │
  ▼
Redirect → DashboardView (/dashboard)
  │
  ▼
TodoList (con tareas existentes)
```

---

### 4.3 Flujo: CRUD Tarea
```
DashboardView
  │
  ├─ CreateTodoForm
  │   └─ Submit → API INSERT → Refresh TodoList
  │
  ├─ TodoItem (click edit)
  │   └─ Inline editing → API UPDATE → Refresh
  │
  ├─ TodoItem (click checkbox)
  │   └─ API UPDATE (is_completed) → Refresh
  │
  └─ TodoItem (click delete)
      └─ Modal confirmación → API DELETE → Refresh
```

---

## 5. Estados de UI

### 5.1 Loading States
| Componente | Estado Loading | UI |
|------------|---------------|-----|
| `LoginForm` | `loading: true` | Botón con spinner |
| `TodoList` | `loading: true` | Skeleton loaders |
| `CreateTodoForm` | `loading: true` | Botón deshabilitado |

---

### 5.2 Error States
| Escenario | Componente | UI |
|-----------|-----------|-----|
| Login fallido | `LoginForm` | Mensaje rojo debajo del form |
| Network error | `TodoList` | Banner "Error de conexión. Reintentar" |
| Validación fallida | `BaseInput` | Borde rojo + mensaje de error |

---

### 5.3 Empty States
| Componente | Condición | UI |
|-----------|-----------|-----|
| `TodoList` | `todos.length === 0` | `EmptyState` component |
| `DashboardView` | Sin sesión | Redirect a `/login` |

---

## 6. Responsive Design

### Breakpoints
```css
/* Mobile-first approach */
:root {
  --breakpoint-sm: 640px;   /* Tablets */
  --breakpoint-md: 768px;   /* Small laptops */
  --breakpoint-lg: 1024px;  /* Desktops */
}
```

### Adaptaciones por Pantalla

| Componente | Mobile (<640px) | Desktop (>=640px) |
|-----------|----------------|-------------------|
| `TodoItem` | Stack vertical | Flex horizontal |
| `DashboardView` | Single column | Sidebar + main |
| `CreateTodoForm` | Full width | Max 500px centered |
| `AppHeader` | Hamburger menu | Full navbar |

---

## 7. Accesibilidad (A11y)

### Checklist de Componentes

- [ ] `BaseButton`: `role="button"`, `aria-label` si solo ícono
- [ ] `BaseInput`: `<label>` asociado con `for`, `aria-invalid` si error
- [ ] `TodoItem`: Checkbox con `aria-checked`, `aria-label` para botones de acción
- [ ] `BaseModal`: `role="dialog"`, `aria-modal="true"`, focus trap
- [ ] Navegación por teclado: Tab order lógico, Enter para submit
- [ ] Contraste de colores: WCAG AA (4.5:1 para texto normal)

---

## 8. Estructura de Archivos

```
src/
├── components/
│   ├── base/
│   │   ├── BaseButton.vue
│   │   ├── BaseInput.vue
│   │   ├── BaseModal.vue
│   │   └── BaseToast.vue
│   ├── layout/
│   │   ├── AppHeader.vue
│   │   └── AppFooter.vue
│   └── todos/
│       ├── TodoList.vue
│       ├── TodoItem.vue
│       ├── CreateTodoForm.vue
│       └── EmptyState.vue
├── views/
│   ├── LoginView.vue
│   ├── RegisterView.vue
│   └── DashboardView.vue
├── composables/
│   ├── useAuth.ts
│   ├── useTodos.ts
│   └── useToast.ts
├── router/
│   └── index.ts
├── types/
│   └── index.ts
└── App.vue
```

---

## 9. Contratos de Props/Emits

### Convenciones de Naming
- **Props**: camelCase (`isLoading`, `userName`)
- **Emits**: kebab-case (`todo-created`, `user-logout`)
- **Slots**: kebab-case (`header-title`)

### Validación de Props
```typescript
// TodoItem.vue
defineProps<{
  todo: Todo,          // required
  editable?: boolean   // optional con default
}>();

// Con validación runtime
defineProps({
  todo: {
    type: Object as PropType<Todo>,
    required: true
  },
  editable: {
    type: Boolean,
    default: true
  }
});
```

---

## 10. Testing Strategy por Componente

| Componente | Test Type | Prioridad | Casos Clave |
|-----------|-----------|-----------|-------------|
| `LoginForm` | Unit | Alta | Validación, submit, error handling |
| `TodoItem` | Unit | Alta | Toggle, delete, edit mode |
| `useTodos` | Unit | Alta | CRUD operations, error handling |
| `DashboardView` | Integration | Media | Protected route, data fetching |
| `BaseButton` | Unit | Baja | Props variants, disabled state |

---

## 11. Checklist de Implementación UI

- [ ] Todos los componentes base creados (`BaseButton`, `BaseInput`, etc.)
- [ ] Composables `useAuth` y `useTodos` funcionando
- [ ] Router configurado con rutas protegidas
- [ ] LoginView y RegisterView con validación
- [ ] DashboardView con CRUD completo
- [ ] Loading states en todos los componentes
- [ ] Error handling con `useToast`
- [ ] Responsive design validado en mobile/desktop
- [ ] Accesibilidad: navegación por teclado funciona
- [ ] Tests unitarios para componentes críticos

---

**Documento**: UI Component Map
**Versión**: 1.0
**Fecha**: 2025-12-16
**Propietario**: Equipo Frontend P4
