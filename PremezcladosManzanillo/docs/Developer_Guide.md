# 🛠️ Guía Técnica para Desarrolladores - Premezclado Manzanillo

Esta guía detalla la arquitectura técnica y los estándares de desarrollo para la plataforma.

---

## 1. Arquitectura de Alto Nivel
La aplicación sigue un modelo de **Desacoplamiento Front-Back**, lo que permite escalar cada parte de forma independiente.

-   **Backend (API Restful):** Construido con Node.js y Express en TypeScript. Utiliza Prisma ORM para interactuar con SQLite (o PostgreSQL en producción).
-   **Frontend (SPA):** Desarrollado con React 18, Vite y Tailwind CSS. Gestiona el estado de forma local y vía Context API para temas globales (Moneda, Autenticación).

---

## 2. Flujo de Autenticación y Autorización
Utilizamos **Auth0** con el flujo de *Authorization Code Flow with PKCE*.

1.  **Token JWT:** El frontend obtiene un Access Token de Auth0.
2.  **Validación:** El backend usa el middleware `jwtCheck` para validar la firma del emisor (Auth0).
3.  **Aprovisionamiento Local:** El middleware `userProvisioningMiddleware` verifica si el `sub` del JWT existe en la base de datos local. Si no existe, lo crea automáticamente para mantener la integridad de las relaciones (Clientes -> Usuarios).
4.  **Roles:** Los roles se inyectan en el token como un *Custom Claim* (`https://premezcladomanzanillo.com/roles`). El backend verifica estos roles para proteger rutas sensibles.

---

## 3. Sistema de Configuración Dinámica (CMS Interno)
Para permitir que el rol **Comercial** edite la Web, implementamos un sistema de Clave-Valor en la base de datos:

-   **Modelo `Setting`:** Tiene campos `key` (PK), `value` (JSON String) y `type`.
-   **Endpoint `GET /api/settings`:** Es público. Devuelve un mapa de todas las configuraciones para que la Landing Page se "hidrate" con los textos e imágenes actuales.
-   **Endpoint `POST /api/settings`:** Protegido por roles. Almacena las configuraciones serializadas. Los componentes de React (`HeroSection`, etc.) usan `JSON.parse()` para procesarlos.

---

## 4. Implementación de Auditoría (Audit Log)
Cada acción que mueva dinero o cambie la configuración del sistema debe ser auditada.

**Uso del Logger:**
```typescript
import { logActivity } from '../utils/auditLogger';

// Dentro de un controlador
await logActivity({
  userId: req.auth.payload.sub,
  userName: req.user.name,
  action: 'UPDATE',
  entity: 'SETTING',
  details: 'Banner principal actualizado por el comercial.'
});
```

---

## 5. Gestión de Moneda e IVA
El sistema es multi-moneda de forma visual pero opera sobre una base única.
-   **CurrencyContext:** Gestiona el estado global de la moneda (USD/BS).
-   **Cálculos:** Todos los cálculos financieros deben centralizarse en el frontend usando las utilidades de formato para evitar errores de redondeo en decimales.
-   **IVA:** El porcentaje de IVA se recupera desde la tabla `Setting` (`key: 'vat_rate'`), permitiendo cambios legales sin tocar código.

---

## 6. Procedimientos de Despliegue y Base de Datos
-   **Generar esquemas:** `npx prisma generate` después de cualquier cambio en `schema.prisma`.
-   **Sincronización:** En desarrollo, usar `pnpm exec prisma migrate dev`. En producción, usar `npx prisma migrate deploy`.
-   **Prevenir conflictos binarios:** El archivo `dev.db` debe estar en el `.gitignore` para evitar conflictos de mezcla (merge conflicts) entre desarrolladores. La estructura se sincroniza vía migraciones.
-   **M2M Credentials:** Asegure que el servidor tenga acceso a las variables `AUTH0_M2M_CLIENT_ID` y `SECRET` para que la eliminación de usuarios y gestión de roles funcione.

---

## 📂 Estructura del Backend

- `src/controllers/`:
    - `settingController.ts`: Maneja las configuraciones dinámicas de la landing (Hero, Productos, Servicios).
    - `userController.ts`: Incluye `deleteUser` que limpia datos en Auth0 y DB.
    - `auditController.ts`: Consulta los logs de actividad.
    - `reportsController.ts`: Motor de agregación de datos para el BI.
- `src/routes/`:
    - `settings.ts`: Endpoints para lectura pública y escritura protegida de configuraciones.
    - `audit.ts`: Acceso restringido a logs de auditoría.
    - `reports.ts`: Rutas para los tres motores de reportes (Comercial, Contabilidad, Operaciones).
- `prisma/schema.prisma`:
    - Modelo `Setting`: Almacena claves/valores para la personalización.
    - Modelo `AuditLog`: Registro histórico de acciones.

---

## 📂 Estructura del Frontend

- `src/pages/`:
    - `CustomizationPage.jsx`: Interfaz de administración para el rol Comercial.
    - `AdminRolesPage.jsx`: Gestión de usuarios y eliminación definitiva.
- `src/sections/dashboard/`:
    - `Reports.jsx`: Centro de Inteligencia con lógica de pestañas reactivas y gráficos de ChartJS.
- `src/sections/home/`:
    - `HeroSection.jsx`, `ProductsSection.jsx`, `ServicesSection.jsx`: Ahora cargan sus datos dinámicamente desde `/api/settings`.
- `src/components/ContentCard.jsx`: Estandarizado con altura `h-80` para simetría visual.

---

## 🚀 Flujo de Personalización Dinámica
1. El Administrador cambia una imagen en `CustomizationPage`.
2. Se envía un `POST` a `/api/settings` con la nueva URL (almacenada como JSON en el campo `value`).
3. La landing page, al cargar, hace un `fetch` a `/api/settings` y actualiza el estado local de los componentes.

---

## ⚠️ Notas de Mantenimiento
- **Sincronización:** Si cambias el esquema de Prisma, usa `npx prisma db push` para aplicar cambios rápidos o `migrate dev` para producción.
- **Auth0:** La eliminación de usuarios requiere que las credenciales M2M en el `.env` tengan el permiso `delete:users`.
- **Estética:** Mantener el uso de Tailwind y Framer Motion para asegurar que la UI siga sintiéndose premium y fluida.

