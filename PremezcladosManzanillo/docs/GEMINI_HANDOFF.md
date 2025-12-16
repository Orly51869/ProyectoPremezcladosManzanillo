# Handoff para Gemini / Continuación del trabajo

Resumen breve

- Contexto: Se arregló un bucle infinito en el modal de cliente y se implementó control de visibilidad/edición de precios por roles en frontend. Se añadió soporte en backend para precios históricos por fecha/moneda (`ProductPrice`) y lógica para que el `budget` use precio vigente cuando `Usuario` no provea `unitPrice`.
- Estado actual: Cambios aplicados en frontend y backend, esquema Prisma modificado. Es necesario regenerar el cliente de Prisma y ejecutar la migración para que `prisma.productPrice` exista en el cliente generado; hasta entonces se añadió un shim TypeScript y casts `(prisma as any)` para compilar temporalmente.

Archivos clave (cambios recientes)

- Frontend

  - PremezcladosManzanillo/Frontend/src/sections/dashboard/ClientFormModal.jsx — arreglado el bucle de render
  - PremezcladosManzanillo/Frontend/src/sections/dashboard/BudgetForm.jsx — control por roles para edición/visualización de precios
  - PremezcladosManzanillo/Frontend/src/pages/BudgetsPage.jsx — propaga `userRoles`
  - PremezcladosManzanillo/Frontend/src/sections/dashboard/BudgetTable.jsx — oculta totales según rol
  - PremezcladosManzanillo/Frontend/src/sections/dashboard/BudgetList.jsx — idem

- Backend
  - PremezcladosManzanillo/Backend/prisma/schema.prisma — añadidos modelos: `Category`, `Subcategory`, `ProductPrice`
  - PremezcladosManzanillo/Backend/src/controllers/productPriceController.ts — nuevo: publicar / consultar precios vigentes
  - PremezcladosManzanillo/Backend/src/routes/products.ts — rutas POST/GET `/api/products/:id/prices`
  - PremezcladosManzanillo/Backend/src/controllers/budgetController.ts — lógica para preferir `unitPrice` privilegiado o buscar `ProductPrice` por fecha
  - PremezcladosManzanillo/Backend/src/middleware/jwtCheck.ts — restaurado a comportamiento seguro (no deje bypass activo)
  - PremezcladosManzanillo/Backend/src/types/prisma-extensions.d.ts — _shim_ temporal para TypeScript (eliminar después de `prisma generate`)

Estado detallado y riesgos

- Requerido: regenerar `@prisma/client` y aplicar migración. Sin esto, el cliente tipado no expone `productPrice` y TS marcará errores.
- Temporal: se agregó `src/types/prisma-extensions.d.ts` y se usaron casts `(prisma as any)` y `(tx as any)` para mitigar errores TS; esto es temporal y debe revertirse cuando el cliente generado exista.
- Auth0: hubo errores previos de obtención de metadata del issuer (p. ej. "Failed to fetch authorization server metadata"). Asegúrate de que la máquina puede alcanzar el `issuer` de Auth0 y que las variables de env como `AUTH0_ISSUER_BASE_URL` y `AUTH0_AUDIENCE` están correctas.

Comandos obligatorios (ejecutar en la carpeta Backend)
Ejecuta en CMD (Windows) desde:
`c:\Users\STB\Documents\GitHub\ProyectoPremezcladosManzanillo\PremezcladosManzanillo\Backend`

```cmd
cd /d c:\Users\STB\Documents\GitHub\ProyectoPremezcladosManzanillo\PremezcladosManzanillo\Backend
pnpm install
npx prisma generate
npx prisma migrate dev --name add-productprice-category
pnpm run start
```

Qué hará esto

- `pnpm install` instalará dependencias.
- `npx prisma generate` regenera `@prisma/client` para exponer `productPrice` en el cliente tipado.
- `npx prisma migrate dev --name add-productprice-category` creará/aplicará la migración que añade `ProductPrice` y las tablas asociadas (dev DB).
- `pnpm run start` iniciará el servidor backend.

Pasos posteriores (después de ejecutar los comandos)

1. Eliminar el shim: borrar `PremezcladosManzanillo/Backend/src/types/prisma-extensions.d.ts`.
2. Reemplazar/quitar casts: buscar y eliminar `(prisma as any)` y `(tx as any)` en los controladores; devolver llamadas a `prisma.productPrice` con tipado normal.
3. Compilar TypeScript y corregir errores menores si aparecen.
4. Ejecutar pruebas manuales (ver sección "Pruebas rápidas").

Pruebas rápidas y endpoints útiles

- Publicar un precio (restringido a roles `Contable`/`Administrador`):

```bash
curl -X POST "http://localhost:PORT/api/products/123/prices" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"currency":"USD","date":"2025-12-01","grossPrice":100.0}'
```

- Obtener precio vigente para una fecha:

```bash
curl "http://localhost:PORT/api/products/123/prices?date=2025-12-01" -H "Authorization: Bearer <TOKEN>"
```

- Crear presupuesto (cuando `Usuario` no puede fijar `unitPrice`): incluir items sin `unitPrice` y backend aplicará precio vigente:

```bash
curl -X POST "http://localhost:PORT/api/budgets" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"clientId":1,"deliveryDate":"2025-12-10","items":[{"productId":123,"quantity":10}]}'
```

- Crear presupuesto con `unitPrice` (debe ser enviado sólo por `Contable`/`Administrador`):

```bash
curl -X POST "http://localhost:PORT/api/budgets" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"clientId":1,"deliveryDate":"2025-12-10","items":[{"productId":123,"quantity":10,"unitPrice":95.0}]}'
```

Variables de entorno relevantes

- `DATABASE_URL` (prisma)
- `AUTH0_ISSUER_BASE_URL` (Auth0 issuer)
- `AUTH0_AUDIENCE` (API identifier)
- `PORT` (opcional para servidor)

Cómo continuar si no puedes ejecutar migraciones

- Opción A (recomendada): ejecutar `npx prisma migrate dev` como se indicó arriba.
- Opción B (temporal): crear manualmente la tabla `ProductPrice` en la DB (SQL) y ajustar el código para leerla mediante consultas crudas; no recomendado a largo plazo.
- Si la red bloquea Auth0 metadata: verificar conectividad y DNS, o usar un token válido y temporalmente deshabilitar validación durante diagnóstico (NO para producción).

Checklist de limpieza después de migración

- [ ] Eliminar `src/types/prisma-extensions.d.ts`.
- [ ] Quitar todos los casts `(prisma as any)` y `(tx as any)`.
- [ ] Ejecutar `pnpm run build` (si existe) y corregir errores TS.
- [ ] Ejecutar tests (cuando estén añadidos).

Tareas pendientes de desarrollo (alta prioridad)

- Regenerar Prisma client y aplicar migración.
- Quitar shims/casts y validar tipado.
- Añadir UI para gestión de precios (página para publicar precios por producto/fecha/moneda).
- Añadir tests unitarios e integraciones para `ProductPrice` y creación de presupuestos.
- Validar roles en Auth0 y el claim `https://premezcladomanzanillo.com/roles`.
  Validar roles en Auth0 y the claim `https://premezcladomanzanillo.com/roles`.

**Cambios solicitados por el usuario (prioritarios)**

- **Quitar/ocultar la sección `Productos y Servicios` del formulario de presupuesto**

  - Archivos a revisar/modificar:
    - `PremezcladosManzanillo/Frontend/src/sections/dashboard/BudgetForm.jsx` — eliminar o comentar el bloque que renderiza el selector de productos y la lista de items.
    - `PremezcladosManzanillo/Frontend/src/sections/dashboard/BudgetList.jsx` y `BudgetTable.jsx` — adaptar para que manejar presupuestos sin items (aceptar items vacíos o `[]`).
  - Backend:
    - `PremezcladosManzanillo/Backend/src/controllers/budgetController.ts` — permitir crear presupuestos sin `items` (si el frontend ya no envía `items`) o llenar `products` vacío. Asegúrate que `calculateTotal` tolera `items?.length === 0`.
  - Pruebas rápidas:
    - Crear un presupuesto desde UI sin añadir productos y verificar que el backend lo persiste y que la UI muestra `total` = 0 o `—` según negocio.

- **Habilitar el botón `Comprobantes` para el usuario cuando su pago sea `VALIDATED`**

  - Comportamiento esperado: cuando un pago pasa a estado `VALIDATED`, el usuario que realizó el pago debe poder ver y descargar comprobantes (factura, órdenes) desde el botón `Comprobantes` en su UI.
  - Backend (implementación recomendada):
    - Archivo: `PremezcladosManzanillo/Backend/src/controllers/paymentController.ts` (o donde se valide el pago).
    - Al cambiar `payment.status` a `VALIDATED`, crear/adjuntar `Invoice` (si aplica) y marcar el pago con un flag `hasReceipts = true` (puedes añadir campo opcional `hasReceipts Boolean @default(false)` en el modelo `Payment`), o asegurarte que `Invoice` existe y enlaza con `paymentId`.
    - Notificar al usuario (crear Notification) con mensaje tipo "El pago de tu presupuesto \"<title>\" ha sido VALIDADO." y opcionalmente incluir links a comprobantes.
  - Frontend:
    - Archivo(s): componente del header/usuario donde esté el botón `Comprobantes` (por ejemplo `Frontend/src/components/Header.jsx` o el componente de `Profile`), y la página `Frontend/src/pages/Payments.jsx` o similar.
    - Lógica: consultar `GET /api/payments?userId=<me>&status=VALIDATED` o `GET /api/users/me` que incluya `hasReceipts` e, si hay resultados, habilitar el botón `Comprobantes` para ese usuario.

- **Eliminar carga de `Factura Proforma` cuando `Contable`/`Administrador` validan el pago**
  - Requisito: Si un pago es validado por un rol privilegiado (`Contable` o `Administrador`), no debe solicitarse ni guardarse la `Factura Proforma` en ese flujo — se deben aceptar sólo `Factura Fiscal` y `Orden de Entrega`.
  - Frontend:
    - Archivo: `PremezcladosManzanillo/Frontend/src/components/PaymentValidationModal.jsx` (o donde esté el modal de validación de pagos).
    - Cambia la UI para que el input de upload de `Factura Proforma` no se muestre cuando el usuario autenticado tenga rol `Contable` o `Administrador`.
    - Ejemplo (pseudo-código):
      ```jsx
      const canManageInvoices =
        userRoles.includes("Contable") || userRoles.includes("Administrador");
      // en el JSX, renderizar Proforma sólo si !canManageInvoices
      {
        !canManageInvoices && <FileUpload name="proforma" />;
      }
      ```
  - Backend:
    - Archivo: `PremezcladosManzanillo/Backend/src/controllers/paymentController.ts` (o `invoiceController.ts`).
    - En la ruta que procesa la validación de pago, ignorar/descartar campos `proformaUrl` si el validador tiene rol `Contable`/`Administrador`. Asegúrate de no requerir `proforma` como condición para completar la validación.

**Puntos técnicos y archivos a editar (resumen rápido)**

- Frontend:
  - `Frontend/src/sections/dashboard/BudgetForm.jsx` — quitar/ocultar sección Productos y Servicios.
  - `Frontend/src/components/PaymentValidationModal.jsx` (o similar) — condicionar uploads según rol; ocultar `Factura Proforma` para `Contable`/`Administrador`.
  - `Frontend/src/components/Header.jsx` / `Frontend/src/pages/Payments.jsx` — habilitar `Comprobantes` si existen pagos validados o invoices.
- Backend:
  - `Backend/src/controllers/budgetController.ts` — aceptar presupuestos sin items.
  - `Backend/src/controllers/paymentController.ts` — al validar pago: crear `Invoice`, marcar `Payment.hasReceipts = true` o persistir `Invoice`, crear `Notification` para el usuario; ignorar `proforma` upload cuando sea validado por rol privilegiado.
  - (Opcional DB change) `prisma/schema.prisma` — añadir `hasReceipts Boolean @default(false)` a `Payment` si quieres un flag simple para frontend.

**Pruebas y validación**

- Flujo 1 (usuario paga):

  1. Usuario crea presupuesto (sin productos si se aplica).
  2. Usuario realiza pago → `Payment` creado con `status: PENDING`.
  3. Validador (`Contable`) aprueba pago → backend cambia `status` a `VALIDATED`, crea `Invoice`, marca `hasReceipts` o enlaza `Invoice`.
  4. Notificación enviada al usuario y `Comprobantes` aparece habilitado en su UI.

- Flujo 2 (usuario con rol no privilegiado):
  - Si el pago lo valida un rol no privilegiado, la UI debe seguir permitiendo la carga de proforma si así lo define la política; pero para `Contable`/`Administrador` la carga de proforma debe omitirse.

Si quieres, puedo generar los parches sugeridos (frontend y backend) y un pequeño test de integración para validar el comportamiento; dime si prefieres que los aplique aquí y los pruebe localmente, o si prefieres aplicar los cambios manualmente.

Notas para Gemini (contexto interno)

- Diseño esencial: el backend es la autoridad del total del presupuesto. El frontend puede mostrar valores de preview, pero el server siempre calcula y persiste `total` usando la prioridad: 1) `unitPrice` enviado por rol privilegiado, 2) `ProductPrice` vigente para `deliveryDate` y `currency`, 3) `product.price` fallback.
- Roles clave: `Usuario` (no editar precios), `Comercial` (ver precios), `Contable` y `Administrador` (editar/fijar precios).
- Localizaciones de interés para búsquedas rápidas: `budgetController.ts`, `productPriceController.ts`, `schema.prisma`, `BudgetForm.jsx`, `ClientFormModal.jsx`.

Contacto / siguiente paso sugerido

- Si puedes ejecutar los comandos indicados, ejecútalos y pega errores aquí para que te guíe con correcciones.
- Si quieres que yo genere la migración SQL en el repo en vez de usar `migrate dev`, indícalo y la crearé (pero preferible usar Prisma migrate en entorno de desarrollo).

---

Documento generado automáticamente para transferir contexto a Gemini o a otro asistente humano.
