# 🏗️ Premezclados Manzanillo, C.A. — Sistema de Gestión

Sistema web integral para la gestión de presupuestos, clientes, productos, pagos y facturación de la empresa **Premezclados Manzanillo, C.A.**, dedicada a la producción y comercialización de concreto premezclado.

---

## 📋 Índice

- [Tecnologías](#-tecnologías)
- [Arquitectura](#-arquitectura)
- [Requisitos Previos](#-requisitos-previos)
- [Instalación Local](#-instalación-local)
- [Despliegue en Producción](#-despliegue-en-producción)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Roles y Permisos](#-roles-y-permisos)

---

## 🛠️ Tecnologías

| Capa | Tecnología |
|------|-----------|
| **Frontend** | React 18 + Vite, Tailwind CSS, Framer Motion |
| **Backend** | Node.js + Express + TypeScript |
| **Base de Datos** | PostgreSQL (Render) + Prisma ORM |
| **Autenticación** | Auth0 (OAuth 2.0 / OpenID Connect) |
| **Correo Electrónico** | Nodemailer (Gmail SMTP) |
| **Hosting Frontend** | Netlify |
| **Hosting Backend** | Render |
| **Control de Versiones** | Git + GitHub |

---

## 🏛️ Arquitectura

```
┌────────────────────┐     HTTPS     ┌─────────────────────┐
│   Frontend (React)  │ ──────────── │   Backend (Express)   │
│    Netlify / Local  │              │    Render / Local     │
└────────────────────┘              └─────────────────────┘
         │                                    │
         │ Auth0 SDK                          │ Prisma ORM
         ▼                                    ▼
┌────────────────────┐              ┌─────────────────────┐
│      Auth0          │              │    PostgreSQL (DB)    │
│  (Autenticación)    │              │      Render           │
└────────────────────┘              └─────────────────────┘
```

---

## ✅ Requisitos Previos

- **Node.js** v18 o superior → [Descargar](https://nodejs.org/)
- **npm** (incluido con Node.js)
- **Git** → [Descargar](https://git-scm.com/)
- **Cuenta de Auth0** → [Registrarse](https://auth0.com/)
- **Base de datos PostgreSQL** (puede ser local o en Render)

---

## 💻 Instalación Local

### 1. Clonar el Repositorio

```bash
git clone https://github.com/TU_USUARIO/ProyectoPremezcladosManzanillo.git
cd ProyectoPremezcladosManzanillo/PremezcladosManzanillo
```

### 2. Configurar el Backend

```bash
cd Backend
npm install
```

Copia el archivo de ejemplo y configura tus credenciales:

```bash
cp .env.example .env
# Edita .env con tus credenciales reales (Auth0, DB, Email)
```

Genera el cliente Prisma y ejecuta las migraciones:

```bash
npx prisma generate
npx prisma db push
```

Inicia el servidor de desarrollo:

```bash
npm run dev
```

El backend estará disponible en `http://localhost:3001`

### 3. Configurar el Frontend

```bash
cd ../Frontend
npm install
```

Copia el archivo de ejemplo y configura:

```bash
cp .env.example .env
# Edita .env con tu dominio Auth0 y la URL del backend
```

Inicia el servidor de desarrollo:

```bash
npm run dev
```

El frontend estará disponible en `http://localhost:5173`

---

## 🌐 Despliegue en Producción

### Frontend (Netlify)

1. Conectar el repositorio de GitHub a Netlify
2. Configurar:
   - **Base directory:** `PremezcladosManzanillo/Frontend`
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
3. Variables de entorno en Netlify:
   - `VITE_REACT_APP_AUTH0_DOMAIN`
   - `VITE_REACT_APP_AUTH0_CLIENT_ID`
   - `VITE_REACT_APP_API_URL` (URL del backend en Render)

### Backend (Render)

1. Crear un nuevo Web Service en Render
2. Conectar el repositorio de GitHub
3. Configurar:
   - **Root directory:** `PremezcladosManzanillo/Backend`
   - **Build command:** `npm install && npx prisma generate && npm run build`
   - **Start command:** `npm start`
4. Agregar todas las variables de `.env.example` en Environment Variables

### Auth0

1. Crear una aplicación SPA en Auth0
2. Configurar los **Allowed Callback URLs**, **Allowed Logout URLs**, y **Allowed Web Origins** con las URLs de producción
3. Crear una API con el audience `https://premezclados-api.com`
4. Crear los roles: `Administrador`, `Comercial`, `Contable`, `Usuario`
5. Crear una Action en el Login Flow para agregar roles al token:

```javascript
exports.onExecutePostLogin = async (event, api) => {
  const namespace = 'https://premezcladomanzanillo.com';
  const roles = event.authorization?.roles || [];
  api.idToken.setCustomClaim(`${namespace}/roles`, roles);
  api.accessToken.setCustomClaim(`${namespace}/roles`, roles);
};
```

---

## 📁 Estructura del Proyecto

```
PremezcladosManzanillo/
├── Backend/
│   ├── prisma/              # Esquema de BD y migraciones
│   ├── src/
│   │   ├── controllers/     # Lógica de negocio
│   │   ├── middleware/       # Auth, roles, provisioning
│   │   ├── routes/           # Definición de rutas API
│   │   ├── services/         # Servicios (email, Auth0)
│   │   └── index.ts          # Punto de entrada del servidor
│   ├── .env.example          # Plantilla de variables de entorno
│   └── package.json
├── Frontend/
│   ├── public/               # Assets estáticos (logo, imágenes)
│   ├── src/
│   │   ├── components/       # Componentes reutilizables
│   │   ├── context/          # Contextos de React (moneda, settings)
│   │   ├── layouts/          # Layouts (Dashboard)
│   │   ├── pages/            # Páginas principales
│   │   ├── sections/         # Secciones de páginas (PDF, reportes)
│   │   ├── utils/            # Utilidades (API, helpers)
│   │   └── App.jsx           # Enrutamiento principal
│   ├── .env.example          # Plantilla de variables de entorno
│   └── package.json
├── docs/                     # Documentación adicional
└── netlify.toml              # Configuración de despliegue en Netlify
```

---

## 👥 Roles y Permisos

| Módulo | Administrador | Comercial | Contable | Usuario |
|--------|:---:|:---:|:---:|:---:|
| Dashboard | ✅ | ✅ | ✅ | ✅ |
| Clientes | ✅ | ✅ | ✅ | ✅ |
| Presupuestos | ✅ | ✅ | ❌ | ✅ |
| Productos | ✅ | ❌ | ✅ | ❌ |
| Comprobantes de Pago | ✅ | ❌ | ✅ | ✅ |
| Facturas | ✅ | ❌ | ✅ | ✅ |
| Reportes | ✅ | ✅ | ✅ | ❌ |
| Personalización | ✅ | ❌ | ❌ | ❌ |
| Configuración | ✅ | ❌ | ❌ | ❌ |
| Gestión de Roles | ✅ | ❌ | ❌ | ❌ |

---

## 📄 Licencia

Este proyecto fue desarrollado como parte de un Trabajo de Grado. Todos los derechos reservados.
