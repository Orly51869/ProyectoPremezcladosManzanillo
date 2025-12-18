# Guía de Configuración: Panel de Roles de Administrador

Para que el módulo de "Gestión de Roles" funcione correctamente y permita al Administrador ver y cambiar roles de usuarios desde la aplicación, es necesario realizar configuraciones específicas en tu panel de **Auth0**.

## 1. Crear Aplicación Machine-to-Machine (M2M)

El backend necesita permisos para hablar con la API de Gestión de Auth0 ("Management API").

1. Ve a tu [Dashboard de Auth0](https://manage.auth0.com/).
2. Navega a **Applications** > **Applications**.
3. Haz clic en **Create Application**.
4. Nombre: `Backend Management API` (o similar).
5. Tipo: **Machine to Machine Applications**. Crea la app.
6. Se te pedirá seleccionar una API. Selecciona **Auth0 Management API**.
7. En permisos ("Scopes"), busca y selecciona los siguientes:
   - `read:users`
   - `update:users`
   - `read:roles`
   - `create:roles` (opcional)
   - `create:role_members`
   - `delete:role_members`
8. Haz clic en **Authorize**.

## 2. Obtener Credenciales M2M

Una vez creada la app M2M:

1. Ve a la pestaña **Settings** de la nueva aplicación `Backend Management API`.
2. Copia el **Client ID**.
3. Copia el **Client Secret**.
4. Abre tu archivo `.env` en la carpeta `Backend/` de tu proyecto.
5. Añade o actualiza las siguientes variables:

```env
AUTH0_M2M_CLIENT_ID=TU_CLIENT_ID_COPIADO
AUTH0_M2M_CLIENT_SECRET=TU_CLIENT_SECRET_COPIADO
AUTH0_DOMAIN=premezcladomanzanillo.us.auth0.com  <-- Tu dominio Auth0 actual
```

## 3. Crear Roles en Auth0

El sistema espera que existan roles con nombres específicos. Debes crearlos manualmente en Auth0 una única vez:

1. En el Dashboard de Auth0, ve a **User Management** > **Roles**.
2. Crea los siguientes roles (respetando mayúsculas/minúsculas):
   - `Administrador`
   - `Contable`
   - `Comercial`
   - `Usuario`
3. (Opcional) Puedes añadir descripciones si gustas.

## 4. Verificar la "Action" o "Rule" de Roles

Para que el frontend sepa qué rol tiene el usuario logueado (y ocultar/mostrar menús), necesitamos que los roles viajen en el Token ID.

Asegúrate de tener una **Action** en el flujo **Login** (Post Login) con el siguiente código (o similar a lo que ya tenías):

```javascript
exports.onExecutePostLogin = async (event, api) => {
  const namespace = 'https://premezcladomanzanillo.com';
  const roles = event.authorization ? event.authorization.roles : [];
  
  // Añadir roles al ID Token y Access Token
  api.idToken.setCustomClaim(`${namespace}/roles`, roles);
  api.accessToken.setCustomClaim(`${namespace}/roles`, roles);
};
```
*Recuerda desplegar ("Deploy") la acción y añadirla al flujo "Login".*

## 5. Probar el Panel

1. Reinicia tu servidor backend (`npm run dev` en la carpeta Backend) para que tome las nuevas variables de entorno.
2. Inicia sesión en el Frontend con un usuario que **YA** tenga el rol de `Administrador` (asígnalo manualmente desde el dashboard de Auth0 a tu propio usuario para empezar).
3. Ve a `Menú > Roles` (o `/admin/roles`).
4. Deberías ver la lista de usuarios.
5. Intenta cambiar el rol de otro usuario a "Contable".
6. Verifica en el Dashboard de Auth0 que el cambio se reflejó.

---

## Próximos Pasos (Definición de Vistas)

Una vez que los roles funcionan, definiremos qué ve cada uno:

- **Administrador**: Ve todo (ya configurado).
- **Contable**:
  - Ver/Editar Productos (Precios).
  - Ver/Gestionar Pagos y Recibos.
  - Ver Reportes Financieros.
  - *No ve*: Configuración técnica, Roles.
- **Comercial**:
  - Gestión de Clientes (Crear/Editar).
  - Gestión de Presupuestos (Crear/Enviar).
  - Ver Catálogo (solo lectura o edición limitada).
  - *No ve*: Validación financiera de pagos (solo ve estado).
- **Usuario (Cliente)**:
  - Ver sus Presupuestos.
  - Ver sus Pagos/Recibos.
  - Ver Catálogo.

Esta lógica de visualización se controlará principalmente en `DashboardNavbar.jsx` (ocultando menús) y en las rutas protegidas del Backend (middleware).
