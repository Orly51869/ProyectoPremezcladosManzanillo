# Guía de Configuración: Sistema de Roles y Auth0

> **Documento técnico** — Premezclados Manzanillo C.A.  
> Última actualización: Febrero 2026

---

## Arquitectura de Asignación de Roles

El sistema implementa una **estrategia de 3 capas** para la gestión de roles, garantizando que todo usuario registrado tenga siempre un rol válido asignado:

```
┌─────────────────────────────────────────────────────────┐
│                    FLUJO DE LOGIN                        │
│                                                         │
│  1. Usuario se registra/inicia sesión en Auth0          │
│                     ↓                                   │
│  2. Auth0 Action (Post Login) verifica roles:           │
│     ├─ ¿Tiene roles? → Inyecta en token JWT             │
│     └─ ¿Sin roles?  → Asigna "Usuario" automáticamente  │
│                     ↓                                   │
│  3. Backend (userProvisioningMiddleware):                │
│     ├─ Prioridad 1: Lee rol del token JWT               │
│     ├─ Prioridad 2: Consulta Auth0 Management API       │
│     ├─ Prioridad 3: Usa rol existente en BD local       │
│     └─ Prioridad 4: Fallback → "Usuario"                │
│                     ↓                                   │
│  4. Frontend: Muestra menús según rol del usuario       │
└─────────────────────────────────────────────────────────┘
```

### Roles del Sistema

| Rol             | Descripción                                  | Asignación       |
|-----------------|----------------------------------------------|-------------------|
| `Administrador` | Acceso total al sistema                      | Manual (Admin)    |
| `Contable`      | Productos, pagos, reportes financieros       | Manual (Admin)    |
| `Comercial`     | Clientes, presupuestos, catálogo             | Manual (Admin)    |
| `Usuario`       | Acceso básico: sus presupuestos y pagos      | **Automático**    |

> ⚡ **Rol por defecto**: Todo usuario nuevo que se registre a través de Auth0 recibe automáticamente el rol `"Usuario"`. Solo un Administrador puede promover a roles superiores desde el panel de Gestión de Roles (`/admin/roles`).

---

## 1. Crear Aplicación Machine-to-Machine (M2M)

El backend necesita permisos para comunicarse con la API de Gestión de Auth0 ("Management API").

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
   - `create:roles` (opcional, para futuras expansiones)
   - `create:role_members`
   - `delete:role_members`
8. Haz clic en **Authorize**.

## 2. Obtener Credenciales M2M

Una vez creada la app M2M:

1. Ve a la pestaña **Settings** de la nueva aplicación `Backend Management API`.
2. Copia el **Client ID** y el **Client Secret**.
3. Configúralos en las variables de entorno del backend:

```env
AUTH0_M2M_CLIENT_ID=<Client ID de la app M2M>
AUTH0_M2M_CLIENT_SECRET=<Client Secret de la app M2M>
AUTH0_DOMAIN=<tu-dominio>.us.auth0.com
```

## 3. Crear Roles en Auth0

El sistema espera que existan roles con nombres específicos. Deben crearse manualmente en Auth0 una única vez:

1. En el Dashboard de Auth0, ve a **User Management** > **Roles**.
2. Crea los siguientes roles (**respetando mayúsculas/minúsculas**):
   - `Administrador` — Acceso completo al sistema
   - `Contable` — Gestión financiera (productos, pagos, reportes)
   - `Comercial` — Gestión comercial (clientes, presupuestos)
   - `Usuario` — Acceso básico (consulta de sus propios datos)

## 4. Configurar la Action de Asignación Automática de Roles

Esta es la pieza clave. La **Auth0 Action** se ejecuta en cada inicio de sesión y cumple dos funciones:

1. **Asignar automáticamente** el rol `"Usuario"` a nuevos registros que no tienen rol
2. **Inyectar los roles** en los tokens JWT para que el frontend y backend los utilicen

### Configuración en Auth0 Dashboard:

1. Ve a **Actions** > **Flows** > **Login**
2. Crea una nueva Action personalizada (o edita la existente)
3. En la pestaña **Dependencies**, agrega: `auth0` (versión `4.x.x`)
4. En la pestaña **Secrets**, agrega:
   - `AUTH0_DOMAIN` → Tu dominio Auth0
   - `AUTH0_M2M_CLIENT_ID` → Client ID de la app M2M
   - `AUTH0_M2M_CLIENT_SECRET` → Client Secret de la app M2M
5. Pega el siguiente código:

```javascript
exports.onExecutePostLogin = async (event, api) => {
  const namespace = 'https://premezcladomanzanillo.com';
  
  // Obtener roles actuales del usuario en Auth0
  const assignedRoles = event.authorization?.roles || [];
  
  // Si el usuario no tiene roles asignados, asignar "Usuario" automáticamente
  if (assignedRoles.length === 0) {
    const ManagementClient = require('auth0').ManagementClient;
    
    const management = new ManagementClient({
      domain: event.secrets.AUTH0_DOMAIN,
      clientId: event.secrets.AUTH0_M2M_CLIENT_ID,
      clientSecret: event.secrets.AUTH0_M2M_CLIENT_SECRET,
    });
    
    try {
      // Buscar el ID del rol "Usuario" en el catálogo de Auth0
      const roles = await management.roles.getAll();
      const usuarioRole = roles.data.find(r => r.name === 'Usuario');
      
      if (usuarioRole) {
        // Asignar el rol "Usuario" al nuevo usuario
        await management.users.assignRoles(
          { id: event.user.user_id },
          { roles: [usuarioRole.id] }
        );
        
        // Inyectar el rol en los tokens de la sesión actual
        api.idToken.setCustomClaim(`${namespace}/roles`, ['Usuario']);
        api.accessToken.setCustomClaim(`${namespace}/roles`, ['Usuario']);
      }
    } catch (error) {
      // En caso de error, el backend tiene un fallback a 'Usuario'
      console.log('Error asignando rol por defecto:', error.message);
      api.idToken.setCustomClaim(`${namespace}/roles`, []);
      api.accessToken.setCustomClaim(`${namespace}/roles`, []);
    }
  } else {
    // El usuario ya tiene roles asignados, inyectarlos normalmente
    api.idToken.setCustomClaim(`${namespace}/roles`, assignedRoles);
    api.accessToken.setCustomClaim(`${namespace}/roles`, assignedRoles);
  }
};
```

6. Haz clic en **Deploy**
7. Arrastra la Action al flujo **Login** y guarda

## 5. Verificación del Sistema

### Probar la asignación automática:
1. Crea un usuario de prueba en Auth0 (sin asignarle rol manualmente)
2. Inicia sesión con ese usuario en el Frontend
3. Verifica en Auth0 Dashboard (**User Management** > **Users**) que el usuario recibió el rol `"Usuario"` automáticamente
4. Verifica que en la base de datos local el campo `role` del usuario sea `"Usuario"`

### Probar el panel de administración:
1. Inicia sesión con un usuario que tenga el rol `Administrador`
2. Ve a **Menú** > **Roles** (ruta: `/admin/roles`)
3. Deberías ver todos los usuarios con sus roles
4. Cambia el rol de un usuario y verifica que se refleje en Auth0

---

## Matriz de Acceso por Rol

| Módulo              | Administrador | Contable | Comercial | Usuario |
|---------------------|:---:|:---:|:---:|:---:|
| Panel Principal     | ✅ | ✅ | ✅ | ✅ |
| Clientes            | ✅ | ✅ | ✅ | ✅ |
| Presupuestos        | ✅ | ❌ | ✅ | ✅ |
| Productos           | ✅ | ✅ | ❌ | ❌ |
| Comprobantes/Pagos  | ✅ | ✅ | ❌ | ✅ |
| Facturas            | ✅ | ✅ | ❌ | ✅ |
| Reportes            | ✅ | ✅ | ✅ | ❌ |
| Personalización     | ✅ | ❌ | ❌ | ❌ |
| Configuración       | ✅ | ❌ | ❌ | ❌ |
| Gestión de Roles    | ✅ | ❌ | ❌ | ❌ |

> Esta lógica se controla a nivel de **Frontend** en `DashboardNavbar.jsx` (visibilidad de menús) y a nivel de **Backend** mediante el middleware `checkRole.ts` (protección de endpoints API).

---

## Seguridad y Consideraciones

- **El rol es inmutable por el propio usuario**: Solo un Administrador puede cambiar roles desde el panel de gestión
- **Doble verificación**: El backend verifica el rol tanto en el token JWT como en la base de datos local
- **Auditoría**: Todo cambio de rol queda registrado en el log de auditoría (`AuditLog`)
- **Fallback robusto**: Si Auth0 falla temporalmente, el backend mantiene el rol de la base de datos local
