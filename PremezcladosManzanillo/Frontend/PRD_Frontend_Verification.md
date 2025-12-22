# PRD: Verificación de Interfaz de Usuario y Auditoría Visual (Frontend)

## 1. Contexto de la Aplicación
Aplicación de gestión de presupuestos y clientes para **Premezclado Manzanillo**, construida en **React** y protegida por **Auth0**.

## 2. Objetivo de la Prueba (Frontend)
Navegar por la aplicación para validar que el nombre del usuario autenticado se muestre correctamente en la interfaz y que las acciones realizadas se reflejen en la tabla de auditoría con la identidad real corregida.

## 3. Flujo de Navegación Esperado
1. **Acceso:** Iniciar sesión en el portal de Auth0 (si es necesario) o acceder directamente al Dashboard mediante la URL del túnel.
2. **Módulo de Presupuestos:**
   - Navegar a la sección de "Presupuestos".
   - Abrir un presupuesto en estado "PENDIENTE".
   - Ejecutar la acción de "Aprobar" o "Rechazar".
3. **Módulo de Auditoría:**
   - Navegar a la sección de "Logs de Auditoría" o "Historial".
   - **Verificación Crítica:** Localizar la entrada recién creada y confirmar que en la columna "Usuario" aparezca un nombre real (ej: "Oswaldo Bello") y no el texto genérico "Administrador".

## 4. Criterios de Éxito Visual
- La tabla de presupuestos debe mostrar quién procesó el documento.
- El log de auditoría debe ser legible y mostrar nombres completos cargados desde la base de datos local.
- No deben aparecer errores 401/403 durante el flujo si se han proporcionado las credenciales correctas.

## 5. Instrucciones Complementarias
- La aplicación usa un diseño oscuro (Dark Mode).
- Si se encuentra una pantalla de bienvenida de Localtunnel, hacer clic en el botón de confirmación.
