# PRD: Validación de Trazabilidad de Usuarios en Logs de Auditoría

## 1. Contexto del Proyecto
El sistema es una aplicación de gestión para **Premezclado Manzanillo, C.A.** el cual utiliza:
- **Autenticación:** Auth0.
- **Backend:** Node.js con Express y TypeScript.
- **Base de Datos:** SQLite gestionada con Prisma ORM.

## 2. Descripción del Problema
Anteriormente, los logs de auditoría (registrados mediante la función `logActivity`) estaban guardando nombres genéricos como "Administrador" o "Usuario". Esto ocurría porque el sistema tomaba etiquetas de rol del token de Auth0 en lugar del nombre real corregido por el administrador en la base de datos local.

## 3. Objetivo de la Prueba
Verificar que el sistema registre EN TODAS las acciones críticas el nombre real del usuario almacenado en la tabla `User` de Prisma, priorizándolo sobre cualquier valor genérico de Auth0.

## 4. Flujo Técnico a Evaluar
1. **Identificación:** El `userProvisioningMiddleware` debe buscar al usuario por su `sub` (Auth0 ID) en la base de datos local y asignar el objeto resultante a `req.dbUser`.
2. **Acción de Ejemplo (Aprobación de Presupuesto):** 
   - Endpoint: `POST /api/budgets/:id/approve`
   - El controlador debe extraer `userName` preferentemente de `(req as any).dbUser.name`.
3. **Registro:** Se llama a `logActivity` pasando ese `userName`.
4. **Validación:** Se debe consultar la tabla `AuditLog` y confirmar que el registro más reciente para esa entidad tenga el nombre esperado (ej. "Oswaldo Bello").

## 5. Casos de Prueba (Escenarios)
- **Escenario 1:** Un administrador con nombre "Oswaldo Bello" en la base de datos local aprueba un presupuesto. El log debe decir "Oswaldo Bello".
- **Escenario 2:** Un usuario crea un cliente nuevo. El log de la entidad CLIENT debe tener el nombre real del usuario.
- **Escenario 3 (Fallback):** Si por alguna razón el usuario no tiene nombre en la DB local (caso raro), debe usar el nickname de Auth0, pero nunca un rol genérico si hay datos personales disponibles.

## 6. Configuración para TestSprite
- **Mode:** Backend
- **Port:** http://localhost:3001
- **Scope:** Codebase (o Code Diff para centrarse en los controladores de presupuestos y usuarios).
