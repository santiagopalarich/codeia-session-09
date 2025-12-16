# P4 - To-Do App: Políticas RLS (Row Level Security)

## 1. Fundamentos de RLS

### ¿Qué es RLS?
Row Level Security permite definir políticas que restringen qué filas puede acceder cada usuario en las consultas SQL. Es la **primera línea de defensa** contra acceso no autorizado a datos.

### Principio de Seguridad
**Zero Trust**: Aunque el cliente envíe queries correctos, la base de datos valida que el usuario autenticado solo acceda a **sus propias filas**.

---

## 2. Arquitectura de Seguridad

```
Cliente (Vue)
    │
    ├─ Supabase Client (con JWT)
    │
    ▼
Supabase Auth
    │
    ├─ Valida JWT
    ├─ Extrae user_id
    │
    ▼
PostgreSQL + RLS
    │
    ├─ Aplica políticas RLS
    ├─ Filtra filas por user_id
    │
    ▼
Resultados (solo datos del usuario)
```

### Variables de Contexto
Supabase inyecta automáticamente:
```sql
auth.uid()        -- UUID del usuario autenticado
auth.jwt()        -- Token JWT completo
auth.role()       -- Rol del usuario (authenticated, anon)
```

---

## 3. Políticas RLS para `public.todos`

### 3.1 Habilitar RLS en la Tabla
```sql
-- CRÍTICO: Sin esto, las políticas no se aplican
ALTER TABLE public.todos ENABLE ROW LEVEL SECURITY;
```

---

### 3.2 Política: SELECT (Leer Tareas)
**Objetivo**: Los usuarios solo pueden ver sus propias tareas.

```sql
CREATE POLICY "Users can view own todos"
ON public.todos
FOR SELECT
USING (auth.uid() = user_id);
```

**Explicación**:
- `FOR SELECT`: Aplica al leer datos
- `USING`: Condición que debe cumplirse (user_id debe coincidir con auth.uid())
- Si no coincide, la fila se filtra automáticamente

**Test SQL**:
```sql
-- Como usuario A (UUID: aaa-bbb-ccc)
SELECT * FROM todos;
-- Solo devuelve filas donde user_id = 'aaa-bbb-ccc'
```

---

### 3.3 Política: INSERT (Crear Tareas)
**Objetivo**: Los usuarios solo pueden crear tareas asignadas a sí mismos.

```sql
CREATE POLICY "Users can insert own todos"
ON public.todos
FOR INSERT
WITH CHECK (auth.uid() = user_id);
```

**Explicación**:
- `FOR INSERT`: Aplica al crear nuevas filas
- `WITH CHECK`: Valida que `user_id` en el INSERT coincida con el usuario autenticado
- Si un usuario intenta insertar con `user_id` ajeno, **falla con error 403**

**Test SQL**:
```sql
-- Esto funciona (user_id coincide con auth.uid())
INSERT INTO todos (user_id, title) VALUES (auth.uid(), 'Mi tarea');

-- Esto FALLA (intentando crear tarea para otro usuario)
INSERT INTO todos (user_id, title) VALUES ('otro-uuid', 'Hackear');
-- Error: new row violates row-level security policy
```

**Nota**: En el cliente, NO enviaremos `user_id` explícitamente. Se añadirá automáticamente con un trigger o función (ver sección 6).

---

### 3.4 Política: UPDATE (Actualizar Tareas)
**Objetivo**: Los usuarios solo pueden modificar sus propias tareas.

```sql
CREATE POLICY "Users can update own todos"
ON public.todos
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
```

**Explicación**:
- `USING`: Valida que la fila a actualizar pertenece al usuario
- `WITH CHECK`: Valida que el nuevo valor de `user_id` no cambie a otro usuario
- Protege contra: `UPDATE todos SET user_id = 'otro-uuid' WHERE id = 'mi-tarea'`

**Test SQL**:
```sql
-- Funciona (mi tarea, mis datos)
UPDATE todos SET title = 'Nuevo título' WHERE id = 'mi-tarea-id';

-- FALLA (intentando modificar tarea ajena)
UPDATE todos SET title = 'Hack' WHERE id = 'tarea-de-otro-usuario';
-- Sin error, pero 0 filas afectadas (RLS filtra la fila)

-- FALLA (intentando cambiar user_id)
UPDATE todos SET user_id = 'otro-uuid' WHERE id = 'mi-tarea-id';
-- Error: new row violates row-level security policy
```

---

### 3.5 Política: DELETE (Eliminar Tareas)
**Objetivo**: Los usuarios solo pueden eliminar sus propias tareas.

```sql
CREATE POLICY "Users can delete own todos"
ON public.todos
FOR DELETE
USING (auth.uid() = user_id);
```

**Explicación**:
- Similar a UPDATE, pero más simple (no hay `WITH CHECK` porque no hay nuevos datos)
- Si intentas borrar tarea ajena, **0 filas afectadas** (sin error explícito)

**Test SQL**:
```sql
-- Funciona
DELETE FROM todos WHERE id = 'mi-tarea-id';

-- FALLA silenciosamente (0 filas afectadas)
DELETE FROM todos WHERE id = 'tarea-de-otro-usuario';
```

---

## 4. Script Completo de RLS

```sql
-- ==============================================
-- P4 To-Do App - Row Level Security Policies
-- ==============================================

-- Habilitar RLS en la tabla
ALTER TABLE public.todos ENABLE ROW LEVEL SECURITY;

-- Política 1: SELECT (Leer)
CREATE POLICY "Users can view own todos"
ON public.todos
FOR SELECT
USING (auth.uid() = user_id);

-- Política 2: INSERT (Crear)
CREATE POLICY "Users can insert own todos"
ON public.todos
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Política 3: UPDATE (Actualizar)
CREATE POLICY "Users can update own todos"
ON public.todos
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Política 4: DELETE (Eliminar)
CREATE POLICY "Users can delete own todos"
ON public.todos
FOR DELETE
USING (auth.uid() = user_id);

-- Verificar políticas creadas
SELECT schemaname, tablename, policyname, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'todos';
```

---

## 5. Políticas para Roles Anónimos (Opcional)

Si queremos permitir que usuarios NO autenticados vean tareas públicas (NO APLICA AL MVP):

```sql
-- SOLO COMO EJEMPLO (no implementar en MVP)
CREATE POLICY "Anon users can view public todos"
ON public.todos
FOR SELECT
USING (
  (auth.role() = 'anon' AND is_public = true)
  OR
  (auth.uid() = user_id)
);
```

**Para el MVP**: Solo usuarios autenticados tienen acceso (auth.role() = 'authenticated').

---

## 6. Auto-Asignar `user_id` en INSERT

Para evitar que el cliente envíe `user_id` manualmente (y prevenir errores):

### Opción A: Trigger de Base de Datos (Recomendado)
```sql
CREATE OR REPLACE FUNCTION set_user_id()
RETURNS TRIGGER AS $$
BEGIN
    NEW.user_id = auth.uid();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER set_user_id_on_insert
BEFORE INSERT ON public.todos
FOR EACH ROW
EXECUTE FUNCTION set_user_id();
```

**Ventaja**: El cliente solo envía `{ title, description }`, y `user_id` se asigna automáticamente.

### Opción B: En el Cliente (Más explícito)
```typescript
const { data, error } = await supabase
  .from('todos')
  .insert({
    user_id: (await supabase.auth.getUser()).data.user?.id,
    title: 'Mi tarea'
  });
```

**Recomendación MVP**: Usar Opción A (trigger) para simplificar el código del cliente y evitar errores.

---

## 7. Testing de Políticas RLS

### 7.1 Test Manual en Supabase SQL Editor
```sql
-- 1. Crear dos usuarios de prueba en Supabase Auth Dashboard
--    Usuario A: testA@example.com
--    Usuario B: testB@example.com

-- 2. Obtener tokens JWT de ambos (Login via API o Dashboard)

-- 3. En SQL Editor, simular usuario A
SET request.jwt.claim.sub = 'uuid-usuario-A';

-- 4. Insertar tarea como usuario A
INSERT INTO todos (title) VALUES ('Tarea de A');

-- 5. Verificar que solo veo mis tareas
SELECT * FROM todos; -- Solo tarea de A

-- 6. Cambiar contexto a usuario B
SET request.jwt.claim.sub = 'uuid-usuario-B';

-- 7. Verificar aislamiento
SELECT * FROM todos; -- Vacío (no ve tareas de A)

-- 8. Intentar actualizar tarea de A (debe fallar)
UPDATE todos SET title = 'Hack' WHERE user_id = 'uuid-usuario-A';
-- Resultado: 0 rows affected
```

### 7.2 Test Automatizado (Vitest + Supabase Client)
```typescript
describe('RLS Policies', () => {
  it('should isolate todos by user', async () => {
    // Login como usuario A
    const clientA = createClient(SUPABASE_URL, SUPABASE_KEY);
    await clientA.auth.signInWithPassword({
      email: 'testA@example.com',
      password: 'password'
    });

    // Crear tarea como A
    const { data: todoA } = await clientA.from('todos').insert({ title: 'A Task' }).select().single();

    // Login como usuario B
    const clientB = createClient(SUPABASE_URL, SUPABASE_KEY);
    await clientB.auth.signInWithPassword({
      email: 'testB@example.com',
      password: 'password'
    });

    // Usuario B no debe ver tareas de A
    const { data: todosB } = await clientB.from('todos').select();
    expect(todosB).not.toContain(todoA);

    // Usuario B no puede actualizar tarea de A
    const { error } = await clientB.from('todos').update({ title: 'Hack' }).eq('id', todoA.id);
    expect(error).toBeTruthy(); // O verificar 0 rows affected
  });
});
```

---

## 8. Checklist de Validación RLS

- [ ] RLS habilitado en tabla `todos` (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY`)
- [ ] Política SELECT creada y testeada (usuarios solo ven sus tareas)
- [ ] Política INSERT creada y testeada (no se puede crear tareas para otros)
- [ ] Política UPDATE creada y testeada (no se puede modificar tareas ajenas)
- [ ] Política DELETE creada y testeada (no se puede borrar tareas ajenas)
- [ ] Trigger `set_user_id` funcionando (user_id auto-asignado en INSERT)
- [ ] Test con 2 usuarios reales (A no ve tareas de B y viceversa)
- [ ] Verificado en Supabase Dashboard: Table Editor aplica RLS (solo muestra datos del usuario logeado)

---

## 9. Troubleshooting Común

### Error: "RLS policy violation"
**Causa**: Intentando acceder a filas de otro usuario.
**Solución**: Verificar que `auth.uid()` está correctamente configurado en el cliente (JWT válido).

### Error: "Infinite recursion detected"
**Causa**: Política RLS que hace SELECT dentro de su propia condición.
**Solución**: Simplificar políticas, evitar subqueries recursivas.

### Usuario no puede ver NINGUNA fila (ni propias)
**Causa**: RLS habilitado pero sin políticas, o JWT no presente.
**Solución**:
```sql
-- Verificar políticas
SELECT * FROM pg_policies WHERE tablename = 'todos';

-- Verificar JWT en cliente
const { data: { user } } = await supabase.auth.getUser();
console.log(user?.id); // Debe tener valor
```

### Usuario puede ver tareas de TODOS
**Causa**: RLS no habilitado.
**Solución**:
```sql
ALTER TABLE public.todos ENABLE ROW LEVEL SECURITY;
```

---

## 10. Mejores Prácticas

1. **Siempre habilitar RLS** antes de insertar datos reales
2. **Testear políticas** con usuarios reales antes de producción
3. **Usar `SECURITY DEFINER`** con cuidado (solo en funciones confiables)
4. **Auditar políticas** mensualmente (revisar `pg_policies`)
5. **Logging**: Habilitar logs de RLS en Supabase (Settings > Database > Logs)
6. **Documentar excepciones**: Si alguna tabla NO tiene RLS, justificar por qué

---

## 11. Recursos Adicionales

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL RLS Policies](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Supabase Auth Helpers](https://supabase.com/docs/guides/auth/auth-helpers)

---

**Documento**: RLS Policies
**Versión**: 1.0
**Fecha**: 2025-12-16
**Propietario**: Equipo Seguridad + Plataforma P4
