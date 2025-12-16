# P4 - To-Do App: Arquitectura Conceptual e Integración Vue + Supabase

## 0. Visión General de la Arquitectura

### Capas de la Aplicación

```
┌─────────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER (Vue 3)                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ LoginView    │  │RegisterView  │  │DashboardView │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         │                 │                  │                  │
│  ┌──────▼─────────────────▼──────────────────▼───────┐          │
│  │          Components & Composables Layer           │          │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐        │          │
│  │  │useAuth() │  │useTodos()│  │useToast()│        │          │
│  │  └────┬─────┘  └────┬─────┘  └──────────┘        │          │
│  └───────┼─────────────┼─────────────────────────────┘          │
└──────────┼─────────────┼────────────────────────────────────────┘
           │             │
           │    ┌────────▼────────┐
           │    │  Supabase SDK   │ (Client Library)
           │    └────────┬────────┘
           │             │
┌──────────▼─────────────▼────────────────────────────────────────┐
│                    BACKEND LAYER (Supabase)                     │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              Authentication Service                     │    │
│  │  • JWT Generation/Validation                           │    │
│  │  • Session Management                                  │    │
│  │  • Password Hashing (bcrypt)                          │    │
│  └─────────────────┬───────────────────────────────────────┘    │
│                    │                                            │
│  ┌─────────────────▼───────────────────────────────────────┐    │
│  │              PostgreSQL Database                        │    │
│  │  ┌──────────────────────────────────────────────────┐   │    │
│  │  │  Row Level Security (RLS) Policies              │   │    │
│  │  │  • SELECT: auth.uid() = user_id                │   │    │
│  │  │  • INSERT: auth.uid() = user_id                │   │    │
│  │  │  • UPDATE: auth.uid() = user_id                │   │    │
│  │  │  • DELETE: auth.uid() = user_id                │   │    │
│  │  └──────────────────────────────────────────────────┘   │    │
│  │  ┌──────────────┐  ┌──────────────┐                     │    │
│  │  │ auth.users   │  │public.todos  │                     │    │
│  │  │ (Managed)    │  │ (Custom)     │                     │    │
│  │  └──────────────┘  └──────────────┘                     │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 1. Arquitectura de Componentes Vue

### 1.1 Árbol de Componentes

```
App.vue (Root)
│
├── Router View
│   │
│   ├─── LoginView.vue (/login)
│   │    ├── LoginForm.vue
│   │    │   ├── BaseInput (email)
│   │    │   ├── BaseInput (password)
│   │    │   └── BaseButton (submit)
│   │    └── [useAuth composable]
│   │
│   ├─── RegisterView.vue (/register)
│   │    ├── RegisterForm.vue
│   │    │   ├── BaseInput (email)
│   │    │   ├── BaseInput (password)
│   │    │   ├── BaseInput (confirm)
│   │    │   └── BaseButton (submit)
│   │    └── [useAuth composable]
│   │
│   └─── DashboardView.vue (/dashboard) [Protected]
│        ├── AppHeader.vue
│        │   ├── UserAvatar
│        │   └── LogoutButton
│        │
│        ├── CreateTodoForm.vue
│        │   ├── BaseInput (title)
│        │   ├── BaseInput (description)
│        │   └── BaseButton (create)
│        │
│        ├── TodoList.vue
│        │   ├── TodoItem.vue (v-for)
│        │   │   ├── Checkbox (toggle complete)
│        │   │   ├── TodoContent (title + desc)
│        │   │   ├── EditButton
│        │   │   └── DeleteButton
│        │   │
│        │   └── EmptyState.vue (if no todos)
│        │
│        └── [useTodos composable]
│
└── Global Components
    ├── BaseToast.vue (notification system)
    └── BaseModal.vue (confirmations)
```

---

## 2. Flujo de Autenticación

### 2.1 Diagrama de Secuencia: Login

```
┌────────┐          ┌──────────┐          ┌─────────┐          ┌──────────┐
│ User   │          │LoginView │          │useAuth()│          │Supabase  │
└───┬────┘          └────┬─────┘          └────┬────┘          └────┬─────┘
    │                    │                     │                    │
    │ 1. Enter email/pwd │                     │                    │
    ├───────────────────>│                     │                    │
    │                    │                     │                    │
    │ 2. Click "Login"   │                     │                    │
    ├───────────────────>│                     │                    │
    │                    │                     │                    │
    │                    │ 3. signIn()         │                    │
    │                    ├────────────────────>│                    │
    │                    │                     │                    │
    │                    │                     │ 4. signInWithPassword()
    │                    │                     ├───────────────────>│
    │                    │                     │                    │
    │                    │                     │ 5. Validate credentials
    │                    │                     │                    │
    │                    │                     │ 6. Generate JWT    │
    │                    │                     │<───────────────────┤
    │                    │                     │   {user, session}  │
    │                    │                     │                    │
    │                    │ 7. Store session    │                    │
    │                    │<────────────────────┤   (localStorage)   │
    │                    │                     │                    │
    │ 8. Redirect /dashboard                  │                    │
    │<───────────────────┤                     │                    │
    │                    │                     │                    │
```

### 2.2 Flujo de Estados: Autenticación

```
┌─────────────┐
│   INITIAL   │ (loading: true, user: null)
└──────┬──────┘
       │
       │ App mounts, call getSession()
       │
       ▼
┌──────────────┐ NO    ┌──────────────┐
│ Has Session? ├──────>│ UNAUTHENTICATED │ (loading: false, user: null)
└──────┬───────┘       └──────────────┘   → Redirect to /login
       │                      │
       │ YES                  │ User submits login
       │                      ▼
       │               ┌──────────────┐
       │               │  LOGGING_IN  │ (loading: true)
       │               └──────┬───────┘
       │                      │
       │                      │ signIn() success
       │                      ▼
       └─────────────>┌──────────────┐
                      │AUTHENTICATED │ (loading: false, user: {...})
                      └──────┬───────┘   → Redirect to /dashboard
                             │
                             │ User clicks logout
                             ▼
                      ┌──────────────┐
                      │ LOGGING_OUT  │ (loading: true)
                      └──────┬───────┘
                             │
                             │ signOut() success
                             ▼
                      ┌──────────────┐
                      │UNAUTHENTICATED │
                      └──────────────┘
```

---

## 3. Flujo de Operaciones CRUD

### 3.1 Diagrama de Secuencia: Create Todo

```
┌────────┐     ┌────────────┐     ┌──────────┐     ┌──────────┐     ┌──────┐
│ User   │     │CreateTodo  │     │useTodos()│     │Supabase  │     │  DB  │
│        │     │   Form     │     │          │     │  Client  │     │ +RLS │
└───┬────┘     └─────┬──────┘     └────┬─────┘     └────┬─────┘     └───┬──┘
    │                │                  │                │               │
    │ 1. Type title  │                  │                │               │
    ├───────────────>│                  │                │               │
    │                │                  │                │               │
    │ 2. Click "Add" │                  │                │               │
    ├───────────────>│                  │                │               │
    │                │                  │                │               │
    │                │ 3. createTodo()  │                │               │
    │                ├─────────────────>│                │               │
    │                │  {title, desc}   │                │               │
    │                │                  │                │               │
    │                │                  │ 4. insert()    │               │
    │                │                  ├───────────────>│               │
    │                │                  │  + JWT header  │               │
    │                │                  │                │               │
    │                │                  │                │ 5. Validate JWT
    │                │                  │                ├──────────────>│
    │                │                  │                │   Extract uid │
    │                │                  │                │               │
    │                │                  │                │ 6. Apply RLS  │
    │                │                  │                │   (INSERT OK) │
    │                │                  │                │               │
    │                │                  │                │ 7. INSERT INTO todos
    │                │                  │                │<──────────────┤
    │                │                  │                │   RETURNING * │
    │                │                  │                │               │
    │                │                  │ 8. {data, error}               │
    │                │                  │<───────────────┤               │
    │                │                  │                │               │
    │                │ 9. Update local  │                │               │
    │                │<─────────────────┤   todos array  │               │
    │                │                  │                │               │
    │ 10. Show toast │                  │                │               │
    │  "✓ Created"   │                  │                │               │
    │<───────────────┤                  │                │               │
    │                │                  │                │               │
```

### 3.2 Estados de CRUD Operations

```
CREATE TODO:
┌──────────┐ submit  ┌──────────┐ API call ┌──────────┐ success ┌──────────┐
│  IDLE    ├────────>│ CREATING ├─────────>│VALIDATING├────────>│ SUCCESS  │
└──────────┘         └────┬─────┘          └────┬─────┘         └──────────┘
                          │                     │
                          │ validation error    │ API error
                          ▼                     ▼
                     ┌──────────┐          ┌──────────┐
                     │  ERROR   │          │  ERROR   │
                     │(frontend)│          │(backend) │
                     └──────────┘          └──────────┘

UPDATE TODO:
┌──────────┐ edit    ┌──────────┐ save     ┌──────────┐ success ┌──────────┐
│DISPLAYING├────────>│ EDITING  ├─────────>│ SAVING   ├────────>│ SUCCESS  │
└──────────┘         └────┬─────┘          └────┬─────┘         └──────────┘
                          │                     │
                          │ cancel              │ error
                          ▼                     ▼
                     ┌──────────┐          ┌──────────┐
                     │DISPLAYING│          │  ERROR   │
                     └──────────┘          └──────────┘

DELETE TODO:
┌──────────┐ click   ┌──────────┐ confirm  ┌──────────┐ success ┌──────────┐
│DISPLAYING├────────>│CONFIRMING├─────────>│ DELETING ├────────>│ REMOVED  │
└──────────┘         └────┬─────┘          └────┬─────┘         └──────────┘
                          │                     │
                          │ cancel              │ error
                          ▼                     ▼
                     ┌──────────┐          ┌──────────┐
                     │DISPLAYING│          │  ERROR   │
                     └──────────┘          └──────────┘
```

---

## 4. Manejo de Estados UI

### 4.1 Estados de Loading

```typescript
// TodoList Component States

┌─────────────────────────────────────────────────────────┐
│                    LOADING STATES                       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  INITIAL_LOAD (loading: true, todos: [])               │
│  ┌───────────────────────────────────────┐             │
│  │  ┌─┐ ┌─┐ ┌─┐                          │             │
│  │  │░│ │░│ │░│ Skeleton Loaders         │             │
│  │  └─┘ └─┘ └─┘                          │             │
│  └───────────────────────────────────────┘             │
│                                                         │
│  LOADED_EMPTY (loading: false, todos: [])              │
│  ┌───────────────────────────────────────┐             │
│  │           📝                           │             │
│  │   No tienes tareas aún                │             │
│  │   [Crear primera tarea]               │             │
│  └───────────────────────────────────────┘             │
│                                                         │
│  LOADED_WITH_DATA (loading: false, todos: [...])       │
│  ┌───────────────────────────────────────┐             │
│  │  ☐ Comprar leche          [Edit][Del] │             │
│  │  ☑ Hacer ejercicio        [Edit][Del] │             │
│  │  ☐ Leer documentación     [Edit][Del] │             │
│  └───────────────────────────────────────┘             │
│                                                         │
│  CREATING (loading: true, optimistic update)           │
│  ┌───────────────────────────────────────┐             │
│  │  ☐ Nueva tarea (creando...) 🔄        │             │
│  │  ☐ Comprar leche          [Edit][Del] │             │
│  └───────────────────────────────────────┘             │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 4.2 Estados de Error

```typescript
// Error Handling States

┌─────────────────────────────────────────────────────────┐
│                     ERROR STATES                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  NETWORK_ERROR                                          │
│  ┌───────────────────────────────────────┐             │
│  │  ⚠️  Error de conexión                │             │
│  │  No se pudo conectar a la base de     │             │
│  │  datos. [Reintentar]                  │             │
│  └───────────────────────────────────────┘             │
│                                                         │
│  VALIDATION_ERROR (Frontend)                            │
│  ┌───────────────────────────────────────┐             │
│  │  [Título: ____________]               │             │
│  │  ❌ El título es obligatorio           │             │
│  │  [Crear] (disabled)                   │             │
│  └───────────────────────────────────────┘             │
│                                                         │
│  AUTH_ERROR (RLS Violation)                             │
│  ┌───────────────────────────────────────┐             │
│  │  🔒 No tienes permisos                │             │
│  │  Esta acción no está autorizada.      │             │
│  │  [Volver al login]                    │             │
│  └───────────────────────────────────────┘             │
│                                                         │
│  SERVER_ERROR (500)                                     │
│  ┌───────────────────────────────────────┐             │
│  │  💥 Error del servidor                │             │
│  │  Inténtalo de nuevo más tarde.        │             │
│  │  [Reportar error]                     │             │
│  └───────────────────────────────────────┘             │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 5. Consideraciones de Seguridad (RLS)

### 5.1 Flujo de Seguridad con RLS

```
┌────────────────────────────────────────────────────────────┐
│                 SECURITY FLOW DIAGRAM                      │
└────────────────────────────────────────────────────────────┘

User A (JWT: user_id=aaa)           User B (JWT: user_id=bbb)
     │                                        │
     │ 1. SELECT * FROM todos                │ 1. SELECT * FROM todos
     │    (with JWT in header)               │    (with JWT in header)
     ▼                                        ▼
┌────────────────────┐                  ┌────────────────────┐
│  Supabase API      │                  │  Supabase API      │
│  (validates JWT)   │                  │  (validates JWT)   │
└────────┬───────────┘                  └────────┬───────────┘
         │                                        │
         │ 2. Extract uid from JWT                │
         │    auth.uid() = 'aaa'                  │ auth.uid() = 'bbb'
         ▼                                        ▼
┌─────────────────────────────────────────────────────────────┐
│                    PostgreSQL + RLS                         │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  RLS Policy: SELECT ... USING (auth.uid() = user_id) │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  3. Apply filter AUTOMATICALLY:                             │
│                                                             │
│     User A Query:                   User B Query:          │
│     SELECT * FROM todos             SELECT * FROM todos    │
│     WHERE user_id = 'aaa'           WHERE user_id = 'bbb'  │
│           ↓                                 ↓               │
│  ┌─────────────────┐              ┌─────────────────┐      │
│  │ id │ user_id    │              │ id │ user_id    │      │
│  ├────┼────────────┤              ├────┼────────────┤      │
│  │ 1  │ aaa        │              │ 3  │ bbb        │      │
│  │ 2  │ aaa        │              │ 4  │ bbb        │      │
│  └────┴────────────┘              └────┴────────────┘      │
│  (Only User A's)                  (Only User B's)          │
└─────────────────────────────────────────────────────────────┘
         │                                        │
         │ 4. Return filtered results             │
         ▼                                        ▼
    User A sees                              User B sees
    only their todos                         only their todos
```

### 5.2 Matriz de Seguridad

```
┌─────────────────────────────────────────────────────────────┐
│              RLS SECURITY MATRIX                            │
├──────────┬────────────┬─────────────┬──────────────────────┤
│Operation │ User Auth  │ RLS Check   │ Result               │
├──────────┼────────────┼─────────────┼──────────────────────┤
│ SELECT   │ ✓ Valid    │ user_id=aaa │ ✓ Returns own todos  │
│          │            │ (matches)   │                      │
├──────────┼────────────┼─────────────┼──────────────────────┤
│ SELECT   │ ✓ Valid    │ user_id=bbb │ ✗ Returns empty []   │
│          │            │(no match)   │   (filtered out)     │
├──────────┼────────────┼─────────────┼──────────────────────┤
│ INSERT   │ ✓ Valid    │ user_id=aaa │ ✓ Insert allowed     │
│          │            │ (own id)    │                      │
├──────────┼────────────┼─────────────┼──────────────────────┤
│ INSERT   │ ✓ Valid    │ user_id=bbb │ ✗ 403 Policy         │
│          │            │(other's id) │   Violation          │
├──────────┼────────────┼─────────────┼──────────────────────┤
│ UPDATE   │ ✓ Valid    │ user_id=aaa │ ✓ Update allowed     │
│          │            │ (own todo)  │                      │
├──────────┼────────────┼─────────────┼──────────────────────┤
│ UPDATE   │ ✓ Valid    │ user_id=bbb │ ✗ 0 rows affected    │
│          │            │(other todo) │   (silent fail)      │
├──────────┼────────────┼─────────────┼──────────────────────┤
│ DELETE   │ ✓ Valid    │ user_id=aaa │ ✓ Delete allowed     │
│          │            │ (own todo)  │                      │
├──────────┼────────────┼─────────────┼──────────────────────┤
│ DELETE   │ ✓ Valid    │ user_id=bbb │ ✗ 0 rows affected    │
│          │            │(other todo) │                      │
├──────────┼────────────┼─────────────┼──────────────────────┤
│ ANY      │ ✗ No Auth  │ N/A         │ ✗ 401 Unauthorized   │
│          │ (no JWT)   │             │                      │
└──────────┴────────────┴─────────────┴──────────────────────┘
```

---

## 6. Integración Técnica Detallada

---

## 2. Setup Inicial

### 2.1 Instalación de Dependencias

```bash
# Crear proyecto Vue 3 con TypeScript
npm create vue@latest todo-app-p4
# Seleccionar: TypeScript, Router, ESLint, Prettier

cd todo-app-p4

# Instalar Supabase Client
npm install @supabase/supabase-js

# Opcional: UI utilities
npm install @vueuse/core  # Composables útiles
```

---

### 2.2 Configuración de Variables de Entorno

**Archivo**: `.env`
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

**Archivo**: `.env.example` (commit to repo)
```bash
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

**Seguridad**:
- ✅ Usar `VITE_` prefix para exponer al cliente
- ✅ `.env` en `.gitignore`
- ✅ `ANON_KEY` es segura de exponer (RLS protege los datos)
- ❌ NUNCA exponer `SERVICE_ROLE_KEY`

---

### 2.3 Inicialización del Cliente Supabase

**Archivo**: `src/lib/supabase.ts`
```typescript
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});
```

**Tipos generados** (opcional pero recomendado):
```bash
# Generar tipos TypeScript desde la DB
npx supabase gen types typescript --project-id "your-project-ref" > src/types/database.types.ts
```

---

## 3. Integración de Autenticación

### 3.1 Composable `useAuth`

**Archivo**: `src/composables/useAuth.ts`
```typescript
import { ref, computed, onMounted } from 'vue';
import { supabase } from '@/lib/supabase';
import type { User, Session, AuthError } from '@supabase/supabase-js';

const user = ref<User | null>(null);
const session = ref<Session | null>(null);
const loading = ref(true);

export function useAuth() {
  const isAuthenticated = computed(() => !!user.value);

  // Inicializar sesión al cargar la app
  const initializeAuth = async () => {
    loading.value = true;
    const { data } = await supabase.auth.getSession();
    session.value = data.session;
    user.value = data.session?.user ?? null;
    loading.value = false;
  };

  // Listener de cambios de auth (login/logout)
  const { data: authListener } = supabase.auth.onAuthStateChange(
    (_event, newSession) => {
      session.value = newSession;
      user.value = newSession?.user ?? null;
    }
  );

  // Registro
  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    return data;
  };

  // Login
  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) throw error;
    return data;
  };

  // Logout
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  // Inicializar al montar (solo una vez en App.vue)
  onMounted(initializeAuth);

  return {
    user: computed(() => user.value),
    session: computed(() => session.value),
    loading: computed(() => loading.value),
    isAuthenticated,
    signUp,
    signIn,
    signOut,
    initializeAuth
  };
}
```

---

### 3.2 Router Guards (Rutas Protegidas)

**Archivo**: `src/router/index.ts`
```typescript
import { createRouter, createWebHistory } from 'vue-router';
import { supabase } from '@/lib/supabase';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/dashboard'
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/LoginView.vue'),
      meta: { requiresGuest: true }
    },
    {
      path: '/register',
      name: 'Register',
      component: () => import('@/views/RegisterView.vue'),
      meta: { requiresGuest: true }
    },
    {
      path: '/dashboard',
      name: 'Dashboard',
      component: () => import('@/views/DashboardView.vue'),
      meta: { requiresAuth: true }
    }
  ]
});

// Navigation guard
router.beforeEach(async (to, from, next) => {
  const { data } = await supabase.auth.getSession();
  const isAuthenticated = !!data.session;

  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login');
  } else if (to.meta.requiresGuest && isAuthenticated) {
    next('/dashboard');
  } else {
    next();
  }
});

export default router;
```

---

## 4. Integración de CRUD Todos

### 4.1 Composable `useTodos`

**Archivo**: `src/composables/useTodos.ts`
```typescript
import { ref, onMounted } from 'vue';
import { supabase } from '@/lib/supabase';
import type { Todo } from '@/types';

export function useTodos() {
  const todos = ref<Todo[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Fetch todos del usuario actual
  const fetchTodos = async () => {
    loading.value = true;
    error.value = null;

    const { data, error: fetchError } = await supabase
      .from('todos')
      .select('*')
      .order('created_at', { ascending: false });

    if (fetchError) {
      error.value = fetchError.message;
    } else {
      todos.value = data || [];
    }

    loading.value = false;
  };

  // Crear todo
  const createTodo = async (title: string, description?: string) => {
    const { data, error: insertError } = await supabase
      .from('todos')
      .insert({ title, description })
      .select()
      .single();

    if (insertError) throw insertError;
    todos.value.unshift(data); // Agregar al inicio
    return data;
  };

  // Actualizar todo
  const updateTodo = async (id: string, updates: Partial<Todo>) => {
    const { data, error: updateError } = await supabase
      .from('todos')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (updateError) throw updateError;

    // Actualizar localmente
    const index = todos.value.findIndex(t => t.id === id);
    if (index !== -1) todos.value[index] = data;

    return data;
  };

  // Toggle completado
  const toggleComplete = async (id: string) => {
    const todo = todos.value.find(t => t.id === id);
    if (!todo) return;

    return updateTodo(id, { is_completed: !todo.is_completed });
  };

  // Eliminar todo
  const deleteTodo = async (id: string) => {
    const { error: deleteError } = await supabase
      .from('todos')
      .delete()
      .eq('id', id);

    if (deleteError) throw deleteError;

    // Remover localmente
    todos.value = todos.value.filter(t => t.id !== id);
  };

  // Suscripción a cambios en tiempo real (opcional)
  const subscribeToChanges = () => {
    const channel = supabase
      .channel('todos-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'todos'
        },
        (payload) => {
          // Refresh todos cuando hay cambios
          fetchTodos();
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  };

  onMounted(fetchTodos);

  return {
    todos,
    loading,
    error,
    fetchTodos,
    createTodo,
    updateTodo,
    toggleComplete,
    deleteTodo,
    subscribeToChanges
  };
}
```

---

### 4.2 Tipos TypeScript

**Archivo**: `src/types/index.ts`
```typescript
export interface Todo {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  created_at: string;
}
```

---

## 5. Manejo de Errores

### 5.1 Wrapper de Error Handling

**Archivo**: `src/utils/errorHandler.ts`
```typescript
import { useToast } from '@/composables/useToast';

export function handleSupabaseError(error: any) {
  const { showError } = useToast();

  // Errores comunes de Supabase
  const errorMessages: Record<string, string> = {
    '23505': 'Este registro ya existe',
    '23503': 'Referencia inválida',
    '42501': 'No tienes permisos para esta acción',
    'PGRST116': 'No se encontró el recurso'
  };

  const message =
    errorMessages[error.code] ||
    error.message ||
    'Ocurrió un error inesperado';

  showError(message);
  console.error('Supabase error:', error);
}
```

---

### 5.2 Uso en Componentes

```typescript
// En CreateTodoForm.vue
import { handleSupabaseError } from '@/utils/errorHandler';

const handleSubmit = async () => {
  try {
    await createTodo(title.value, description.value);
    showSuccess('Tarea creada exitosamente');
  } catch (error) {
    handleSupabaseError(error);
  }
};
```

---

## 6. Optimizaciones

### 6.1 Caché Optimista

```typescript
// En useTodos.ts - versión optimista de createTodo
const createTodoOptimistic = async (title: string, description?: string) => {
  // ID temporal
  const tempId = `temp-${Date.now()}`;

  // Agregar inmediatamente a la UI
  const optimisticTodo = {
    id: tempId,
    title,
    description,
    is_completed: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  todos.value.unshift(optimisticTodo);

  try {
    // Insertar en DB
    const { data, error } = await supabase
      .from('todos')
      .insert({ title, description })
      .select()
      .single();

    if (error) throw error;

    // Reemplazar temp con real
    const index = todos.value.findIndex(t => t.id === tempId);
    if (index !== -1) todos.value[index] = data;

  } catch (error) {
    // Rollback optimista
    todos.value = todos.value.filter(t => t.id !== tempId);
    throw error;
  }
};
```

---

### 6.2 Debouncing en Búsqueda (Futuro)

```typescript
import { watchDebounced } from '@vueuse/core';

const searchQuery = ref('');

watchDebounced(
  searchQuery,
  async (query) => {
    const { data } = await supabase
      .from('todos')
      .select('*')
      .ilike('title', `%${query}%`);

    todos.value = data || [];
  },
  { debounce: 300 }
);
```

---

## 7. Testing de Integración

### 7.1 Mock de Supabase Client

**Archivo**: `src/__mocks__/supabase.ts`
```typescript
export const mockSupabase = {
  from: (table: string) => ({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: mockTodo, error: null })
  }),
  auth: {
    signIn: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
    getSession: vi.fn().mockResolvedValue({ data: { session: null } })
  }
};
```

---

### 7.2 Test de useTodos

```typescript
import { describe, it, expect, vi } from 'vitest';
import { useTodos } from '@/composables/useTodos';

vi.mock('@/lib/supabase', () => ({ supabase: mockSupabase }));

describe('useTodos', () => {
  it('should fetch todos on mount', async () => {
    const { todos, loading } = useTodos();

    // Wait for onMounted
    await nextTick();

    expect(mockSupabase.from).toHaveBeenCalledWith('todos');
    expect(loading.value).toBe(false);
  });

  it('should create todo', async () => {
    const { createTodo, todos } = useTodos();

    await createTodo('Test todo');

    expect(todos.value).toHaveLength(1);
    expect(todos.value[0].title).toBe('Test todo');
  });
});
```

---

## 8. Checklist de Integración

### 8.1 Setup Inicial
- [ ] Proyecto Vue 3 creado con TypeScript
- [ ] Supabase Client instalado (`@supabase/supabase-js`)
- [ ] Variables de entorno configuradas (`.env` + `.env.example`)
- [ ] Cliente Supabase inicializado en `src/lib/supabase.ts`
- [ ] Tipos TypeScript generados desde DB (opcional)

### 8.2 Autenticación
- [ ] `useAuth` composable implementado
- [ ] Router guards configurados (rutas protegidas)
- [ ] LoginView y RegisterView conectados
- [ ] Logout funcional
- [ ] Auth state persistence (localStorage via Supabase)

### 8.3 CRUD Todos
- [ ] `useTodos` composable implementado
- [ ] Fetch todos al montar DashboardView
- [ ] Create todo funcionando
- [ ] Update todo funcionando
- [ ] Delete todo con confirmación
- [ ] Toggle completado funcionando

### 8.4 Manejo de Errores
- [ ] Error handler global implementado
- [ ] Toast notifications para errores
- [ ] Validación de inputs en frontend
- [ ] Manejo de errores de red

### 8.5 Optimizaciones
- [ ] Loading states en todos los componentes
- [ ] Caché optimista en create (opcional)
- [ ] Realtime subscriptions configuradas (opcional)
- [ ] Debouncing en búsqueda (si aplica)

### 8.6 Testing
- [ ] Mocks de Supabase client
- [ ] Tests unitarios de composables
- [ ] Tests de integración de flujos completos
- [ ] Tests E2E con Playwright (opcional)

---

## 9. Troubleshooting Común

### Error: "Invalid API key"
**Causa**: `VITE_SUPABASE_ANON_KEY` incorrecta o no configurada.
**Solución**:
```bash
# Verificar .env
echo $VITE_SUPABASE_ANON_KEY

# Obtener nueva key desde Supabase Dashboard > Settings > API
```

---

### Error: "User not found" después de registro
**Causa**: Email confirmation requerida pero no configurada.
**Solución**: En Supabase Dashboard > Authentication > Settings:
- Desactivar "Enable email confirmations" para MVP
- O configurar email templates para confirmación

---

### Error: "RLS policy violation"
**Causa**: Políticas RLS no aplicadas o JWT no presente.
**Solución**:
```typescript
// Verificar JWT en cliente
const { data: { session } } = await supabase.auth.getSession();
console.log('Session:', session); // Debe tener access_token

// Verificar RLS en DB
SELECT * FROM pg_policies WHERE tablename = 'todos';
```

---

### Realtime no funciona
**Causa**: Realtime no habilitado en la tabla.
**Solución**: En Supabase Dashboard > Database > Replication:
- Habilitar realtime para tabla `todos`
- Recargar aplicación

---

## 10. Recursos Adicionales

- [Supabase Vue 3 Quickstart](https://supabase.com/docs/guides/getting-started/quickstarts/vue)
- [Supabase Auth Helpers](https://supabase.com/docs/guides/auth/auth-helpers)
- [Vue 3 Composition API](https://vuejs.org/guide/extras/composition-api-faq.html)
- [VueUse Utilities](https://vueuse.org/)

---

**Documento**: Integration Plan
**Versión**: 1.0
**Fecha**: 2025-12-16
**Propietario**: Equipo Full Stack P4
