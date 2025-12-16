# Guía de Troubleshooting (P4)

Esta guía recopila los 5 problemas más frecuentes encontrados durante el desarrollo y despliegue de la aplicación ToDoApp, junto con sus soluciones probadas.

---

## 1. Error de Conexión: `supabaseUrl is required`

**Síntoma:**
La aplicación muestra una pantalla en blanco al inicio o falla inmediatamente. En la consola del navegador aparece: `Error: supabaseUrl is required`.

**Causa:**
Las variables de entorno no se están cargando correctamente. Esto suele pasar porque Vite expone variables solo si empiezan con `VITE_`.

**Solución:**
1.  Verifica tu archivo `.env`. Las variables DEBEN llamarse exactamente:
    *   `VITE_SUPABASE_URL`
    *   `VITE_SUPABASE_ANON_KEY`
2.  Si estás en Vercel, asegúrate de haberlas agregado en **Settings > Environment Variables**.
3.  En código, asegúrate de acceder a ellas vía `import.meta.env.VITE_SUPABASE_URL` y no `process.env`.

---

## 2. Auth Redirect Loop o No Redirige

**Síntoma:**
El usuario hace clic en el link de confirmación de email (o Magic Link) y es redirigido a `localhost:3000` incluso estando en producción, o viceversa.

**Causa:**
URL de redirección (`Site URL`) mal configurada en el dashboard de Supabase.

**Solución:**
1.  Ve a **Supabase Dashboard > Authentication > URL Configuration**.
2.  **Site URL**: Debe ser tu URL de producción (ej: `https://mi-todo-app.vercel.app`).
3.  **Redirect URLs**: Añade todas las URLs permitidas:
    *   `http://localhost:5173` (Desarrollo local Vite)
    *   `https://mi-todo-app.vercel.app` (Producción)
    *   `https://mi-todo-app-git-main.vercel.app` (Preview branches)

---

## 3. Errores de Permisos RLS (401/403)

**Síntoma:**
Las queries retornan un arreglo vacío `[]` (SELECT) o lanzan error `new row violates row-level security policy` (INSERT).

**Causa:**
La política RLS no permite la operación para el usuario autenticado (o anónimo).

**Solución:**
1.  Verifica que el usuario tenga sesión activa (`await supabase.auth.getUser()`).
2.  Revisa la política en Supabase.
    *   Para **SELECT**: ¿Tienes una política `Enable read access for own data` con `auth.uid() = user_id`?
    *   Para **INSERT**: ¿Estás enviando el `user_id` en el payload? Si no, asegúrate que la política use `default values` o que el trigger lo asigne automáticamente.
    *   Revisa `docs/p4/security_rls.md` para las políticas estándar.

---

## 4. Problemas de CORS en Localhost

**Síntoma:**
Error en consola: `Access to fetch at '...' from origin 'http://localhost:5173' has been blocked by CORS policy`.

**Causa:**
Aunque raro con el cliente oficial de JS, puede ocurrir si invocas Edge Functions mal configuradas o si hay proxys intermedios.

**Solución:**
1.  Generalmente el cliente de Supabase maneja esto. Si usas `fetch` manual a Supabase, falta algún header.
2.  Revisa que no estés bloqueando headers en tu configuración de red local/VPN.
3.  Si llamas a una Edge Function propia, asegúrate de manejar los headers `Access-Control-Allow-Origin` en la respuesta de la función para responder a `OPTIONS`.

---

## 5. Estilos o Assets no cargan (404) tras Build

**Síntoma:**
La app funciona en `npm run dev`, pero al hacer `npm run build` y `preview`, o en Vercel, se ve sin estilos o faltan imágenes.

**Causa:**
Rutas absolutas mal configuradas o falta de configuración de `base` en Vite si no se sirve desde la raíz.

**Solución:**
1.  Si tu app está en un subdirectorio, ajusta `base: '/sub-dir/'` en `vite.config.ts`. (Para Vercel raíz, `base: './'` o `/` suele estar bien).
2.  Asegúrate de importar los assets (imágenes) usando `import` en JS o referencias relativas en CSS, para que Vite los procese y hashée. No uses rutas absolutas manuales como `/public/img.png` si no estás seguro de cómo se servirá.
