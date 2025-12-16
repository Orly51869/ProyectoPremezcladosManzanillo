# 📘 Guía de Usuario - Premezclado Manzanillo

Bienvenido a la plataforma de gestión de Premezclado Manzanillo. Esta guía te ayudará a navegar y utilizar las funcionalidades principales del sistema según tu rol.

## 🚀 Inicio de Sesión
1. Dirígete a la página principal.
2. Haz clic en el botón **"Iniciar Sesión / Registro"** en la esquina superior derecha.
3. Ingresa tu correo electrónico y contraseña.

> [IMAGEN: Pantalla de Login]

---

## 👥 Gestión de Clientes
*(Disponible para todos los usuarios registrados)*

### Crear un Cliente
1. Ve a la sección **Clientes** en el menú superior.
2. Haz clic en el botón **"Nuevo Cliente"**.
3. Completa el formulario con los datos requeridos (Nombre, Email, RIF, Teléfono, Dirección).
4. Haz clic en **Guardar**.

> [IMAGEN: Modal de creación de cliente]

### Editar/Eliminar Cliente
- Solo puedes editar o eliminar clientes que hayas creado tú (si eres Usuario estándar).
- Los Administradores y Comerciales tienen permisos ampliados.

---

## 📝 Gestión de Presupuestos
*(Funcionalidad principal)*

### Crear un Presupuesto
1. Ve a la categoría **Presupuestos**.
2. Haz clic en **"Nuevo Presupuesto"**.
3. Selecciona un **Cliente** de la lista y asigna un **Título** al proyecto. Haz clic en "Continuar".
4. Serás redirigido al **Constructor de Presupuestos**.
5. En el panel izquierdo, selecciona los productos o servicios (Concreto, Bombeo, Aditivos).
6. Ajusta las cantidades y agrégalos al presupuesto.
7. Revisa el total y haz clic en **"Guardar Cambios"**.

> [IMAGEN: Constructor de Presupuestos]

### Aprobar/Rechazar Presupuesto
*(Solo Administradores y Contables)*
- En la lista de presupuestos, verás botones de ✅ (Aprobar) y ❌ (Rechazar) para los presupuestos pendientes.
- Al aprobar, el presupuesto pasa a estado `APPROVED`.
- Al rechazar, debes ingresar un motivo.

---

## 💳 Gestión de Pagos
1. Ve a la sección **Comprobantes**.
2. Los usuarios pueden registrar pagos asociados a presupuestos aprobados.
3. Sube el comprobante de transferencia (imagen o PDF).
4. El equipo de administración validará el pago.

> [IMAGEN: Formulario de registro de pago]

---

## 🛡️ Gestión de Roles (Solo Administradores)
Esta funcionalidad permite asignar roles a los usuarios (Administrador, Contable, Comercial, Usuario) para controlar su acceso.

1. Navega a **Roles** en el menú superior (icono de Usuarios).
2. Verás una lista de todos los usuarios registrados.
3. En la columna "Acciones", selecciona el nuevo rol en el menú desplegable.
4. Confirma la acción en la ventana emergente.

> [IMAGEN: Tabla de gestión de roles]

**Roles disponibles:**
- **Administrador:** Acceso total.
- **Contable:** Gestión de presupuestos, pagos y facturas.
- **Comercial:** Gestión de clientes y presupuestos.
- **Usuario:** Crear presupuestos y ver solo sus propios registros.

---

## ❓ Preguntas Frecuentes
- **¿Olvidaste tu contraseña?** Usa la opción "Recuperar contraseña" en la pantalla de login de Auth0.
- **¿No puedes ver un presupuesto?** Verifica que el presupuesto pertenezca a un cliente asignado a ti.
