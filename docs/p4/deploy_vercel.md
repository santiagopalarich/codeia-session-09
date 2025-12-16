# Guía de Despliegue en Vercel (Vue + Vite)

Esta guía detalla el proceso para desplegar la aplicación ToDoApp (Vue 3 + Vite) en Vercel, desde la conexión con el repositorio hasta las validaciones en producción.

---

## 1. Prerrequisitos y Configuración Inicial

### En GitHub
1.  Asegúrate de que tu código esté pusheado a un repositorio remoto (GitHub, GitLab o Bitbucket).
2.  La rama `main` debe contener la versión estable para producción.

### En Vercel
1.  Crea una cuenta en [Vercel](https://vercel.com) si no tienes una.
2.  Instala Vercel CLI (opcional pero recomendado para troubleshooting):
    ```bash
    npm i -g vercel
    ```

---

## 2. Conexión y Setup del Proyecto

1.  **Nuevo Proyecto**: En el dashboard de Vercel, haz clic en **"Add New..."** -> **"Project"**.
2.  **Importar Repo**: Selecciona tu proveedor de git (ej. GitHub) y busca el repositorio `ToDoApp`. Haz clic en **"Import"**.
3.  **Configurar Framework**:
    *   Vercel debería detectar automáticamente **Vite**.
    *   **Build Command**: `npm run build` (o `vite build`)
    *   **Output Directory**: `dist`
    *   **Install Command**: `npm install`
4.  No hagas clic en "Deploy" todavía. Primero configura las variables.

---

## 3. Configuración de Variables de Entorno

Es crucial configurar las variables `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` para que la app funcione.

### Entornos en Vercel
Vercel maneja tres tipos de entornos:
*   **Production**: Tu rama `main`.
*   **Preview**: Pull Requests y otras ramas.
*   **Development**: Para uso con `vercel dev` localmente.

### Pasos
1.  En la pantalla de configuración (o en **Settings > Environment Variables** después):
2.  Añade las siguientes claves:

    | Variable                 | Valor (Ejemplo)              | Entornos Seleccionados           |
    | :----------------------- | :--------------------------- | :------------------------------- |
    | `VITE_SUPABASE_URL`      | `https://xyz.supabase.co`    | Production, Preview, Development |
    | `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR...` | Production, Preview, Development |

    > **Nota**: Si tienes un proyecto Supabase separado para Dev/Staging, asigna las credenciales de ese proyecto solo a "Preview" y "Development", y las de Producción solo a "Production".

---

## 4. Despliegue

1.  Haz clic en **"Deploy"**.
2.  Espera a que termine el build. Vercel ejecutará `npm install`, luego `npm run build`.
3.  Si es exitoso, verás una pantalla de felicitaciones con el thumbnail de tu app.

---

## 5. Validaciones Post-Deploy

Una vez que la aplicación esté "Live", realiza las siguientes verificaciones críticas:

### Checklist Técnico
- [ ] **Acceso HTTPS**: La URL `https://tu-proyecto.vercel.app` carga sin alertas de seguridad.
- [ ] **Carga de Assets**: Abre la consola (F12) -> Network. Verifica que los archivos `.js` y `.css` carguen (status 200) y no den 404.
- [ ] **Single Page Application (SPA)**: Navega a una ruta interna (ej. `/login`), y recarga la página (F5). **No** debería dar error 404. Vercel maneja esto automáticamente si detecta Vite/Vue, pero validalo.

### Checklist Funcional (Smoke Test)
- [ ] **Conexión a Supabase**: Intenta hacer Log In o Sign Up. Si falla, verifica la variable `VITE_SUPABASE_URL` en la consola (Network tab -> requests a supabase.co).
- [ ] **Estilos**: Verifica que Tailwind (si se usa) o los estilos CSS se vean igual que en local.
- [ ] **Persistencia**: Crea una tarea, recarga la página. La tarea debe seguir ahí.

---

## 6. Troubleshooting Común

| Síntoma                   | Causa Probable            | Solución                                                                                                         |
| :------------------------ | :------------------------ | :--------------------------------------------------------------------------------------------------------------- |
| **Pantalla en blanco**    | Error en JS runtime       | Revisa la consola del navegador. A veces `import.meta.env` no está definido si no es un build de Vite.           |
| **Error 404 al recargar** | Rewrites mal configurados | Crea un archivo `vercel.json` en la raíz con configuración de rewrites para SPA.                                 |
| **Auth falla**            | Variables de entorno      | Revisa "Settings > Environment Variables" en Vercel. Asegúrate de haber hecho un Redeploy después de cambiarlas. |

### Ejemplo de `vercel.json` (solo si es necesario)
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```
