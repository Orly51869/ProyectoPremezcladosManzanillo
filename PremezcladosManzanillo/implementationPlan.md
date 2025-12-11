# Implementation Plan

## Goal Description
Crear una interfaz de administración que permita a usuarios con rol Administrador modificar los roles de otros usuarios directamente desde la aplicación, reemplazando la gestión manual en el Dashboard de Auth0. Además, generar dos documentos Markdown: una Guía de Usuario y una Guía de Desarrollo.

## Proposed Changes

### Backend
[NEW] src/routes/users.ts
Añadir endpoint PUT /api/users/:id/role para actualizar el rol de un usuario.
Aplicar middleware requireAdmin para restringir acceso.

[NEW] src/controllers/userController.ts
Implementar updateUserRole que llama al Management API de Auth0.
Utilizar token de Management API almacenado en variable de entorno AUTH0_MANAGEMENT_TOKEN.

[NEW] src/middleware/requireAdmin.ts
Middleware que verifica que req.user.roles incluya Administrador.

### Frontend
[NEW] src/pages/AdminRolesPage.jsx
Página que muestra una tabla de usuarios (obtenida de /api/users).
Cada fila tiene un selector de rol (Administrador, Comercial, Contable, Usuario).
Botón "Guardar" envía PUT /api/users/:id/role.
Mostrar notificaciones de éxito/error.

[MODIFY] src/components/DashboardNavbar.jsx
Añadir enlace a "Gestión de Roles" visible solo para administradores.

## Documentation
[PENDING] [NEW] docs/User_Guide.md
Guía de Usuario con descripción de la nueva sección "Gestión de Roles" y pasos para usarla. Incluir marcadores de posición para imágenes.

[PENDING] [NEW] docs/Developer_Guide.md
Guía de Desarrollo que explica la arquitectura del nuevo endpoint, uso del Management API y cómo extender la UI.

## Verification Plan

### Automated Tests
Backend: Añadir test en tests/userController.test.ts que simula una llamada a updateUserRole con mock del Management API y verifica que se envía la petición correcta.
Frontend: Test de integración con React Testing Library para AdminRolesPage que verifica que al cambiar el selector y pulsar "Guardar" se llama al endpoint y muestra mensaje de éxito.

### Manual Verification
Iniciar la aplicación en modo desarrollo.
Iniciar sesión con un usuario que tenga rol Administrador.
Navegar a "Gestión de Roles" desde el sidebar.
Ver la lista de usuarios y cambiar el rol de un usuario de prueba.
Guardar y confirmar que el cambio se refleja en Auth0 (puede verificarse en el Dashboard de Auth0).
Repetir con un usuario sin rol administrador y confirmar que el acceso está denegado.

**Nota:** Se asume que el proyecto ya cuenta con autenticación JWT y que req.user está poblado con id y roles.