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

## Productos y Precios (NUEVA SECCIÓN)

[NEW] Product categories / subcategories

- Añadir modelo `Category` y `Subcategory` en el backend y relaciones en `Product`.
- En frontend, actualizar la UI de `Products` para navegar por `Categorías > Subcategorías > Productos`.

[NEW] Price management and history

- Añadir modelo `ProductPrice` con campos: `id`, `productId`, `date`, `currency`, `price`, `createdByRole`, `createdByUserId`.
- Endpoint `POST /api/products/:id/prices` para que `Contable` y `Administrador` publiquen el precio vigente (multi-moneda).
- Endpoint `GET /api/products/:id/prices?date=YYYY-MM-DD` para obtener el precio vigente en una fecha.
- Ajustar `createBudget` y `updateBudget` para que:
  - Si el request incluye `unitPrice` y el usuario tiene rol `Contable` o `Administrador`, usar ese `unitPrice` y almacenar un registro de precio histórico si corresponde.
  - Si el request NO incluye `unitPrice`, consultar `ProductPrice` vigente para la fecha del presupuesto y usarlo en la creación/cálculo del presupuesto.

[MODIFY] Frontend `BudgetForm.jsx`

- Para usuarios con rol `Usuario`: ocultar la columna de edición de `unitPrice`, permitir solo seleccionar producto y cantidad. No enviar `unitPrice` en el payload.
- Para roles `Contable`/`Administrador`: permitir editar `unitPrice` y enviarlo en el payload.
- Mostrar la fila `Total` solo si el usuario puede ver precios (roles `Contable`/`Administrador`/`Comercial`) o si el presupuesto ya está `APPROVED`.

### Migraciones (PRISMA)

- Añadir migración para `Category`, `Subcategory` y `ProductPrice`.
- Añadir índices útiles: `(productId, date)` en `ProductPrice`.

### Backend - Endpoints y lógica

- `POST /api/products/:id/prices` (privilegiados) — publicar precio vigente por moneda.
- `GET /api/products/:id/prices?date=YYYY-MM-DD` — recuperar precio por fecha.
- Ajustar `createBudget`/`updateBudget` en `budgetController.ts` para respetar la fuente del `unitPrice` y consultar historial de precios si hace falta.

### Tests

- Backend: tests para `ProductPrice` y para `createBudget`/`updateBudget` con y sin `unitPrice` en payload.
- Frontend: pruebas de integración que verifiquen la UI de `BudgetForm` según rol (Usuario vs Contable/Administrador).

## Verification Plan (actualizado)

### Automated Tests

Backend: Añadir test en `tests/productPrice.test.ts` que verifique la creación y consulta de precios históricos y que `calculateTotal` use correctamente precios históricos.

Frontend: Test de integración con React Testing Library para `BudgetForm` que verifica que el rol `Usuario` no pueda enviar `unitPrice` y que `Contable`/`Administrador` sí puedan.

### Manual Verification

1. Migrar la base de datos y crear algunos `ProductPrice` para fechas concretas.
2. Iniciar la app y entrar con un usuario `Usuario`: crear un presupuesto y confirmar que no se envía `unitPrice` y que el total se calcula con el precio histórico del día.
3. Entrar con `Contable` o `Administrador`: editar/crear un presupuesto incluyendo `unitPrice` y confirmar que el precio enviado prevalece y que se registra en `ProductPrice` (si está implementado así).

## Implementation Notes

- Mantener la separación de responsabilidades: el cálculo final del `total` debe ser responsabilidad del backend (no confiar en cálculos del cliente). El frontend puede mostrar un preview, pero el backend decide el `total` persistido.
- Registrar auditoría: cuando un `Contable`/`Administrador` publique precios, almacenar `createdByUserId` y `createdByRole` para trazabilidad.
