import { Request, Response } from 'express';
import { logActivity } from '../utils/auditLogger';
import prisma from '../lib/prisma';

// Helper to get Management API Token
const getManagementToken = async () => {
  const response = await fetch(`https://${process.env.AUTH0_DOMAIN}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: process.env.AUTH0_M2M_CLIENT_ID,
      client_secret: process.env.AUTH0_M2M_CLIENT_SECRET,
      audience: `https://${process.env.AUTH0_DOMAIN}/api/v2/`,
      grant_type: 'client_credentials',
    }),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error_description || 'Failed to get management token');
  return data.access_token;
};

// Get all users with roles efficiently
export const getUsers = async (req: Request, res: Response) => {
  try {
    const token = await getManagementToken();
    
    // 1. Obtener lista base de usuarios
    const usersResp = await fetch(`https://${process.env.AUTH0_DOMAIN}/api/v2/users?q=identities.connection:"Username-Password-Authentication" OR identities.connection:"google-oauth2"&search_engine=v3`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!usersResp.ok) throw new Error('Failed to fetch users from Auth0');
    const auth0Users = await usersResp.json();
    
    // 2. Obtener todos los roles disponibles
    const rolesResp = await fetch(`https://${process.env.AUTH0_DOMAIN}/api/v2/roles`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const allRoles = await rolesResp.json();

    // 3. Para cada rol, obtener sus integrantes (Esto es mucho más eficiente que ir usuario por usuario)
    const roleAssignments: { [key: string]: string[] } = {}; // { 'rol_id': ['user_id1', 'user_id2'] }
    
    await Promise.all(allRoles.map(async (role: any) => {
      const resp = await fetch(`https://${process.env.AUTH0_DOMAIN}/api/v2/roles/${role.id}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (resp.ok) {
        const usersInRole = await resp.json();
        roleAssignments[role.name] = usersInRole.map((u: any) => u.user_id);
      }
    }));

    // 4. Mapear los roles de vuelta a cada usuario
    const usersWithRoles = auth0Users.map((u: any) => {
      // Prioridad 1: app_metadata (es instantáneo)
      // Prioridad 2: Asignación por Rol (el mapeo que hicimos arriba)
      const rolesFromMetadata = u.app_metadata?.roles || [];
      const rolesFromMapping = allRoles
        .filter((role: any) => roleAssignments[role.name]?.includes(u.user_id))
        .map((role: any) => role.name);

      // Combinar y eliminar duplicados
      const userRoles = [...new Set([...rolesFromMetadata, ...rolesFromMapping])];

      return {
        user_id: u.user_id,
        email: u.email,
        name: u.name,
        picture: u.picture,
        logins_count: u.logins_count,
        last_login: u.last_login,
        roles: userRoles.length > 0 ? userRoles : [],
      };
    });

    res.json(usersWithRoles);
  } catch (error: any) {
    console.error('Error fetching users with robust roles mapping:', error);
    res.status(500).json({ error: error.message });
  }
};

// Update user role with high reliability
export const updateUserRole = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { roles: roleNames } = req.body; 
  const adminId = req.auth?.payload.sub as string;
  const adminName = (req as any).dbUser?.name || (req.auth?.payload as any)?.name || 'Administrador';

  if (!Array.isArray(roleNames)) {
    return res.status(400).json({ error: 'Roles must be an array of strings' });
  }

  try {
    const token = await getManagementToken();
    
    // 1. Obtener el catálogo oficial de roles de Auth0
    const allRolesResp = await fetch(`https://${process.env.AUTH0_DOMAIN}/api/v2/roles`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const auth0Catalog = await allRolesResp.json();

    // 2. Mapear nombres a IDs (Solo los que existan en Auth0)
    const roleIdsToAssign = auth0Catalog
      .filter((r: any) => roleNames.includes(r.name))
      .map((r: any) => r.id);

    console.log(`[Auth0 Sync] Asignando roles: ${roleNames.join(', ')} -> IDs: ${roleIdsToAssign.join(', ')}`);

    // 3. Obtener roles actuales del usuario para borrarlos
    const currentRolesResp = await fetch(`https://${process.env.AUTH0_DOMAIN}/api/v2/users/${id}/roles`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const currentRoles = await currentRolesResp.json();
    const roleIdsToDelete = currentRoles.map((r: any) => r.id);

    console.log(`[Auth0 Sync] Borrando ${roleIdsToDelete.length} roles previos.`);

    // 4. LIMPIEZA: Eliminar roles viejos
    if (roleIdsToDelete.length > 0) {
      const delResp = await fetch(`https://${process.env.AUTH0_DOMAIN}/api/v2/users/${id}/roles`, {
        method: 'DELETE',
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ roles: roleIdsToDelete }),
      });
      if (!delResp.ok) {
        const errData = await delResp.json();
        console.error('[Auth0 Error Delete]', errData);
        throw new Error('Error al limpiar roles previos en Auth0');
      }
    }

    // 5. ASIGNACIÓN: Poner los nuevos roles
    if (roleIdsToAssign.length > 0) {
      const addResp = await fetch(`https://${process.env.AUTH0_DOMAIN}/api/v2/users/${id}/roles`, {
        method: 'POST',
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ roles: roleIdsToAssign }),
      });
      if (!addResp.ok) {
        const errData = await addResp.json();
        console.error('[Auth0 Error Post]', errData);
        throw new Error('Error al asignar nuevos roles en Auth0');
      }
    }

    // 6. REDUNDANCIA: Guardar roles en app_metadata para acceso rápido e inmediato
    await fetch(`https://${process.env.AUTH0_DOMAIN}/api/v2/users/${id}`, {
      method: 'PATCH',
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        app_metadata: { roles: roleNames }
      }),
    });

    console.log('[Auth0 Sync] Operación completada con éxito (Roles + Metadata).');

    // --- REGISTRAR EN AUDITORÍA ---
    await logActivity({
      userId: adminId,
      userName: adminName,
      action: 'UPDATE',
      entity: 'USER_ROLE',
      entityId: id,
      details: `Rol actualizado a: ${roleNames.join(', ') || 'Sin rol'} (Force Sync OK)`
    });

    res.json({ message: 'Roles actualizados exitosamente en Auth0 y Auditoría.' });
  } catch (error: any) {
    console.error('Error crítico actualizando roles:', error);
    res.status(500).json({ error: `No se pudo sincronizar con Auth0: ${error.message}` });
  }
};

// Update user basic info (name, etc)
export const updateUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name } = req.body;
  const adminId = req.auth?.payload.sub as string;
  const adminName = (req as any).dbUser?.name || (req.auth?.payload as any)?.name || 'Administrador';

  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }

  try {
    const token = await getManagementToken();

    // 1. Intentar actualizar en Auth0 (usando user_metadata para evitar bloqueos de Google/Social)
    try {
      const auth0Resp = await fetch(`https://${process.env.AUTH0_DOMAIN}/api/v2/users/${id}`, {
        method: 'PATCH',
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          // Intentamos name, pero si falla Auth0 tirará error 400. 
          // Guardamos también en user_metadata como respaldo seguro.
          user_metadata: { full_name: name }
        }),
      });

      if (!auth0Resp.ok) {
        const errData = await auth0Resp.json();
        console.warn('Peligro al actualizar Auth0 (metadatos):', errData.message);
      }
    } catch (auth0Err) {
      console.error('Fallo de comunicación con Auth0:', auth0Err);
    }

    // 2. Sincronizar SIEMPRE con DB local (Prisma) - ESTO ES LO QUE VE EL SISTEMA
    await prisma.user.upsert({
      where: { id },
      update: { name },
      create: { 
        id, 
        name, 
        email: `${id}@placeholder.email`, 
        role: 'Usuario' 
      },
    });

    // 3. Registrar en auditoría
    await logActivity({
      userId: adminId,
      userName: adminName,
      action: 'UPDATE',
      entity: 'USER',
      entityId: id,
      details: `Datos de usuario actualizados localmente. Nuevo nombre: ${name}`
    });

    res.json({ message: 'Usuario actualizado localmente y sincronizado.' });
  } catch (error: any) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: error.message });
  }
};

// Delete user
export const deleteUser = async (req: Request, res: Response) => {
  const { id } = req.params; // ID del usuario a eliminar (sub de Auth0)
  const adminId = req.auth?.payload.sub as string;
  const adminName = (req as any).dbUser?.name || (req.auth?.payload as any)?.name || 'Administrador';

  try {
    const token = await getManagementToken();

    // 1. Eliminar de Auth0
    const auth0Resp = await fetch(`https://${process.env.AUTH0_DOMAIN}/api/v2/users/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!auth0Resp.ok && auth0Resp.status !== 404) {
      const errorData = await auth0Resp.json();
      throw new Error(errorData.message || 'Error al eliminar usuario de Auth0');
    }

    // 2. Eliminar de la base de datos local (Prisma)
    // Nota: Esto fallará si el usuario tiene registros vinculados (presupuestos, clientes, etc.)
    // debido a restricciones de integridad referencial.
    try {
      await (prisma as any).user.delete({
        where: { id: id },
      });
    } catch (prismaError: any) {
      console.warn(`Usuario eliminado de Auth0 pero no de Prisma (posiblemente tiene datos vinculados): ${prismaError.message}`);
      // No lanzamos error aquí para permitir que la eliminación de Auth0 se considere "exitosa" en cuanto a acceso
    }

    // 3. Registrar en auditoría
    await logActivity({
      userId: adminId,
      userName: adminName,
      action: 'DELETE',
      entity: 'USER',
      entityId: id,
      details: `Usuario eliminado del sistema definitivamente.`
    });

    res.json({ message: 'Usuario eliminado correctamente.' });
  } catch (error: any) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: error.message });
  }
};