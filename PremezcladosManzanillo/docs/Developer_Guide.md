# 🛠️ Guía de Desarrollo - Premezclado Manzanillo

Esta guía está dirigida a desarrolladores que deseen mantener o extender la funcionalidad de la plataforma.

## 🏗️ Arquitectura del Proyecto

El proyecto utiliza una arquitectura **Monorepo** (virtualmente separada en carpetas) con:

- **Frontend:** React + Vite + TailwindCSS
- **Backend:** Node.js + Express + TypeScript + Prisma ORM
- **Base de Datos:** SQLite (archivo `dev.db` local)

> [IMAGEN: Diagrama de arquitectura simple]

---

## 🔧 Configuración del Entorno

### Requisitos
- Node.js (v18+)
- pnpm (recomendado) o npm

### Instalación
1. Clonar el repositorio.
2. Configurar variables de entorno:
   - Copiar `.env.example` a `.env` en `Backend/` y `Frontend/`.
   - **Backend:** Configurar `DATABASE_URL`, `AUTH0_...`, `GROQ_API_KEY`.
   - **Frontend:** Configurar `VITE_AUTH0_...`.

### Ejecución
```bash
# Terminal 1: Backend
cd Backend
pnpm install
npx prisma migrate dev
pnpm run dev

# Terminal 2: Frontend
cd Frontend
pnpm install
pnpm run dev
```

---

## 🔐 Autenticación y Roles

La autenticación se maneja vía **Auth0**.
- El frontend obtiene un Token JWT.
- El backend valida el token con `express-oauth2-jwt-bearer`.
- Los roles se gestionan mediante la **Management API** de Auth0.

### Flujo de Actualización de Roles
1. El frontend envía `PUT /api/users/:id/roles`.
2. El backend (`userController.ts`) solicita un token M2M a Auth0.
3. El backend llama a la Auth0 Management API para actualizar los roles del usuario.

> **Nota:** Asegúrate de que la aplicación M2M en Auth0 tenga permisos para `read:users`, `update:users`, `read:roles`.

---

## 📂 Estructura del Backend
- `src/controllers`: Lógica de negocio (Budget, Payment, User context).
- `src/routes`: Definición de endpoints API.
- `src/middleware`:
    - `jwtCheck`: Valida token de Auth0.
    - `requireAdmin`: Protege rutas sensibles.
    - `userProvisioning`: Crea el usuario en BD local si es su primer login.
- `prisma/schema.prisma`: Definición de modelos de datos.

### Añadir una nueva funcionalidad
1. Modificar `schema.prisma` si requiere cambios en BD.
2. Ejecutar `npx prisma migrate dev`.
3. Crear controlador y rutas.
4. Registrar rutas en `index.ts`.

---

## 🎨 Estructura del Frontend
- `src/pages`: Vistas principales (routing).
- `src/components`: Componentes reutilizables (Navbar, Cards, Modals).
- `src/sections/dashboard`: Módulos específicos del dashboard.
- `src/utils/api.js`: Instancia de Axios con interceptor para inyectar el token JWT.

---

## ⚠️ Solución de Problemas Comunes
- **Error 404 en API:** Reinicia el servidor backend para aplicar cambios en rutas.
- **Error CORS:** Verifica que el origen del frontend esté en la whitelist de `corsOptions` en `index.ts`.
- **Prisma Error:** Si cambias el esquema, no olvides `npx prisma generate`.
