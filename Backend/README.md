<p align="center">
  <img src="../Frontend/public/assets/LOGO_PREMEZCLADOS.svg" alt="Logo Premezclado Manzanillo" width="200">
</p>

# Backend - Premezclado Manzanillo

Este directorio contiene el código fuente del servidor backend para la aplicación web de Premezclado Manzanillo.

---

## 🚀 Guía de Inicio

### 1. Instalación

Instala las dependencias del proyecto con npm:

```bash
npm install
```

### 2. Configuración

Crea un archivo `.env` en la raíz de este directorio (`Backend/`) y configura las siguientes variables de entorno:

```
# Clave de API para el servicio de chat con IA (Groq)
GROQ_API_KEY=tu_api_key_de_groq

# Credenciales del proveedor de autenticación (Auth0)
AUTH0_CLIENT_ID=tu_client_id_de_auth0
AUTH0_CLIENT_SECRET=tu_client_secret_de_auth0
AUTH0_ISSUER=https://tu-dominio.auth0.com
```

### 3. Ejecución

Para iniciar el servidor en modo de desarrollo (con recarga automática), ejecuta:

```bash
npm start
```

El servidor se iniciará en el puerto `3001` por defecto.

---

## 🛠️ Stack Tecnológico

*   **Framework:** [Express.js](https://expressjs.com/)
*   **Lenguaje:** [TypeScript](https://www.typescriptlang.org/)
*   **Autenticación:** [Auth0](https://auth0.com/)
*   **IA / Chat:** [Groq](https://groq.com/)

---

## 📄 Licencia

Este proyecto se distribuye bajo la Licencia MIT. Consulta el archivo `LICENSE` en la raíz del proyecto para más detalles.
