import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { logActivity } from '../utils/auditLogger';

const prisma = new PrismaClient();

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

// Get all users
export const getUsers = async (req: Request, res: Response) => {
  try {
    const token = await getManagementToken();
    const response = await fetch(`https://${process.env.AUTH0_DOMAIN}/api/v2/users?q=identities.connection:"Username-Password-Authentication" OR identities.connection:"google-oauth2"&search_engine=v3`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) throw new Error('Failed to fetch users from Auth0');
    const users = await response.json();
    
    // Simplificar respuesta
    const simplifiedUsers = users.map((u: any) => ({
      user_id: u.user_id,
      email: u.email,
      name: u.name,
      picture: u.picture,
      logins_count: u.logins_count,
      last_login: u.last_login,
      roles: [] // Los roles se obtienen por separado o s e asume que están en app_metadata. 
               // Nota: Auth0 no devuelve roles en la lista de usuarios por defecto sin una llamada extra o incluir 'app_metadata' si ahí se guardan.
               // Para obtener roles reales, habría que consultar /users/{id}/roles para cada uno, lo cual es lento.
               // Estrategia alternativa: Obtener todos los roles y sus usuarios asignados?
               // Por simplicidad inicial: Dejar roles vacíos o intentar leer de app_metadata si están ahí.
               // Si usamos la Authorization Core, necesitamos llamar a getUserRoles.
    }));

    // Optimización: Obtener roles para cada usuario (limitado a N usuarios o hacerlo en paralelo)
    // O mejor, dejemos que el frontend pida los detalles si es necesario, o carguemos roles aquí.
    // Para esta versión v1, vamos a intentar obtener los roles de un usuario específico cuando se edite,
    // pero para la lista, quizás sea pesado.
    // Vamos a intentar obtener los roles de cada usuario en paralelo (cuidado con rate limits).
    
    // Better approach for list: Just return users. Fetch roles on demand or assume standard roles management.
    // Let's attach roles for the list to make it useful.
    const usersWithRoles = await Promise.all(simplifiedUsers.map(async (user: any) => {
       try {
         const rolesResp = await fetch(`https://${process.env.AUTH0_DOMAIN}/api/v2/users/${user.user_id}/roles`, {
            headers: { Authorization: `Bearer ${token}` },
         });
         
         if (!rolesResp.ok) {
            console.error(`Failed to fetch roles for user ${user.user_id}: ${rolesResp.statusText}`);
            return { ...user, roles: [] };
         }

         const rolesData = await rolesResp.json();
         if (Array.isArray(rolesData)) {
            return { ...user, roles: Array.isArray(rolesData) ? rolesData.map((r: any) => r.name) : [] };
         } else {
             console.error(`Invalid roles data format for user ${user.user_id}`, rolesData);
             return { ...user, roles: [] };
         }
       } catch (err) {
         console.error(`Error fetching roles for user ${user.user_id}`, err);
         return { ...user, roles: [] };
       }
    }));

    res.json(usersWithRoles);
  } catch (error: any) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: error.message });
  }
};

// Update user role
export const updateUserRole = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { roles } = req.body; // Array of role names, e.g. ['Administrador']
  const adminId = req.auth?.payload.sub as string;
  // Auth0 no siempre envía el nombre en el token de la misma forma, intentamos obtenerlo
  const adminName = (req.auth?.payload as any)?.name || 'Administrador';

  if (!Array.isArray(roles)) {
    return res.status(400).json({ error: 'Roles must be an array of strings' });
  }

  try {
    const token = await getManagementToken();
    
    // 1. Get all available roles to map names to IDs
    const rolesResp = await fetch(`https://${process.env.AUTH0_DOMAIN}/api/v2/roles`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const allRoles = await rolesResp.json();
    const roleIdsToAdd = allRoles.filter((r: any) => roles.includes(r.name)).map((r: any) => r.id);

    // 2. Clear existing roles first (optional, but ensures strict set)
    // First get current user roles
    const currentRolesResp = await fetch(`https://${process.env.AUTH0_DOMAIN}/api/v2/users/${id}/roles`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    const currentRoles = await currentRolesResp.json();
    const roleIdsToRemove = currentRoles.map((r: any) => r.id);

    if (roleIdsToRemove.length > 0) {
        await fetch(`https://${process.env.AUTH0_DOMAIN}/api/v2/users/${id}/roles`, {
            method: 'DELETE',
            headers: { 
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ roles: roleIdsToRemove }),
        });
    }

    // 3. Assign new roles
    if (roleIdsToAdd.length > 0) {
        await fetch(`https://${process.env.AUTH0_DOMAIN}/api/v2/users/${id}/roles`, {
            method: 'POST',
            headers: { 
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ roles: roleIdsToAdd }),
        });
    }

    // --- REGISTRAR EN AUDITORÍA ---
    await logActivity({
      userId: adminId,
      userName: adminName,
      action: 'UPDATE',
      entity: 'USER_ROLE',
      entityId: id,
      details: `Rol cambiado a: ${roles.join(', ') || 'Sin rol'}`
    });

    res.json({ message: 'Roles updated successfully' });
  } catch (error: any) {
    console.error('Error updating user roles:', error);
    res.status(500).json({ error: error.message });
  }
};

// Delete user
export const deleteUser = async (req: Request, res: Response) => {
  const { id } = req.params; // ID del usuario a eliminar (sub de Auth0)
  const adminId = req.auth?.payload.sub as string;
  const adminName = (req.auth?.payload as any)?.name || 'Administrador';

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