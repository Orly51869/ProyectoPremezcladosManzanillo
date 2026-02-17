import { Request, Response } from 'express';
import { logActivity } from '../utils/auditLogger';
import { notifyUserChange } from './eventsController';
import prisma from '../lib/prisma';

// --- SIMPLE CACHE SYSTEM ---
let cachedToken: string | null = null;
let tokenExpiry: number = 0;

let cachedRolesMapping: { [roleName: string]: string[] } | null = null;
let lastMappingFetch: number = 0;
const CACHE_DURATION = 2000; // 2 segundos - Modo ultra-rápido

// Helper to get Management API Token (With Cache)
const getManagementToken = async (): Promise<string> => {
  const now = Date.now();
  const domain = process.env.AUTH0_DOMAIN as string;
  const clientId = process.env.AUTH0_M2M_CLIENT_ID as string;
  const clientSecret = process.env.AUTH0_M2M_CLIENT_SECRET as string;

  if (!domain || !clientId || !clientSecret) {
    throw new Error('Auth0 configuration missing in environment variables');
  }

  if (cachedToken && now < tokenExpiry) {
    return cachedToken;
  }

  console.log('[Auth0] Solicitando nuevo Management Token...');
  const response = await fetch(`https://${domain}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      audience: `https://${domain}/api/v2/`,
      grant_type: 'client_credentials',
    }),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error_description || 'Failed to get management token');

  cachedToken = data.access_token;
  tokenExpiry = now + (data.expires_in * 1000) - 60000; // Expira 1 min antes de lo real por seguridad
  return cachedToken as string;
};

// Helper to fetch all items with pagination
const fetchAllAuth0Items = async (url: string, token: string) => {
  let allItems: any[] = [];
  let page = 0;
  const perPage = 100;
  let hasMore = true;

  while (hasMore) {
    const separator = url.includes('?') ? '&' : '?';
    const pagedUrl = `${url}${separator}per_page=${perPage}&page=${page}`;

    const res = await fetch(pagedUrl, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      if (res.status === 429) {
        console.error(`[Auth0 429] Rate limit hit on ${url}. Waiting 1s...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        continue; // Reintentar la misma página
      }
      console.error(`Error fetching page ${page} from ${url}:`, res.statusText);
      break;
    }

    const data = await res.json();
    if (!Array.isArray(data)) break;

    allItems = [...allItems, ...data];
    if (data.length < perPage) hasMore = false;
    else page++;

    if (page > 50) hasMore = false;
  }
  return allItems;
};

// Get all users with roles efficiently
export const getUsers = async (req: Request, res: Response) => {
  try {
    const domain = process.env.AUTH0_DOMAIN as string;
    if (!domain) throw new Error('AUTH0_DOMAIN not configured');

    const token = await getManagementToken();
    const now = Date.now();

    // 1. Obtener TODOS los usuarios
    const auth0Users = await fetchAllAuth0Items(
      `https://${domain}/api/v2/users`,
      token
    );

    const forceRefresh = req.query.refresh === 'true';
    if (forceRefresh) {
      console.log('[Auth0 Sync] Sincronización manual solicitada: Invalidando caché.');
    }

    // 2. Gestionar Cache de Roles (Bulk Strategy)
    if (forceRefresh || !cachedRolesMapping || (now - lastMappingFetch) > CACHE_DURATION) {
      console.log('[Auth0 Sync] Refrescando cache de roles...');
      try {
        const allRoles = await fetchAllAuth0Items(
          `https://${domain}/api/v2/roles`,
          token
        );

        console.log('[Auth0 Roles] Roles disponibles en Auth0:', allRoles.map((r: any) => `"${r.name}"`).join(', '));

        const newMapping: { [roleName: string]: string[] } = {};

        // SECUENCIAL para evitar 429
        for (const role of allRoles) {
          try {
            // Usar 'domain' local, que ya está verificado como string
            const usersInRole = await fetchAllAuth0Items(
              `https://${domain as string}/api/v2/roles/${role.id}/users`,
              token
            );
            // IMPORTANTE: Normalizamos nombres haciendo trim (ej: "Administrador " -> "Administrador")
            const cleanRoleName = role.name.trim();
            newMapping[cleanRoleName] = usersInRole.map((u: any) => u.user_id);
          } catch (roleErr) {
            console.error(`[Auth0 Error] Error en rol ${role.name}:`, roleErr);
          }
        }
        cachedRolesMapping = newMapping;
        lastMappingFetch = now;
      } catch (e) {
        console.error('Error refreshing roles cache:', e);
        // Do not clear cache if refresh fails, keep old one if exists
        if (!cachedRolesMapping) cachedRolesMapping = {};
      }
    }

    // 3. Procesar usuarios y aplicar "Self-Healing"
    const usersWithRoles = await Promise.all(auth0Users.map(async (u: any) => {
      let userRoles: string[] = [];

      let sourceOfTruth = 'METADATA';

      // 1. Verificar si tenemos un mapeo válido
      const mappingHasData = cachedRolesMapping && Object.keys(cachedRolesMapping).length > 0;

      if (mappingHasData) {
        // Paso A: Consultar Mapeo
        const rolesFromMappingRaw = Object.keys(cachedRolesMapping || {})
          .filter(roleName => cachedRolesMapping![roleName].includes(u.user_id));

        const rolesFromMapping = rolesFromMappingRaw.map(r => r.trim());

        // Paso B: Detección de LAG (Consistencia Eventual)
        // Si el Mapa dice "CERO ROLES", pero la Metadata dice "TENGO ROLES"...
        // Podría ser que Auth0 aun no actualizó la lista maestra. NO PODEMOS CONFIAR EN EL MAPA.
        const metaRoles = u.app_metadata?.roles || [];

        if (rolesFromMapping.length === 0 && metaRoles.length > 0) {
          // ---> TRIPLE VERIFICACIÓN (Directa al Usuario)
          console.log(`[Lag Check] 🕵️‍♂️ Verificando rol perdido para ${u.email}... Mapa=[], Meta=[${metaRoles}]`);
          try {
            const encodedId = encodeURIComponent(u.user_id);
            const directResp = await fetch(`https://${domain}/api/v2/users/${encodedId}/roles`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            if (directResp.ok) {
              const directRolesData = await directResp.json();
              const fetchedRoles = directRolesData.map((r: any) => r.name.trim());

              // CONFIANZA EN API DIRECTA:
              // Si la API directa responde OK, le creemos ciegamente. 
              userRoles = fetchedRoles;
              sourceOfTruth = 'DIRECT_API';
              console.log(`[Lag Check] ✅ Verificado Directo: [${userRoles.join(', ') || 'Sin rol'}]`);
            } else {
              // Si falla la directa, usamos metadata por seguridad
              userRoles = metaRoles.map((r: any) => r.trim());
              sourceOfTruth = 'METADATA_FALLBACK';
            }
          } catch (e) {
            userRoles = metaRoles.map((r: any) => r.trim());
            sourceOfTruth = 'METADATA_ERROR_FALLBACK';
          }

        } else {
          // Caso Normal: El mapa coincide o trae datos, o la metadata también está vacía. Confianza normal.
          userRoles = rolesFromMapping;
          sourceOfTruth = 'MAPPING';
        }

      } else {
        // FALLBACK: Solo si el mapeo falló globalmente o está vacío
        const rolesFromMetadata = u.app_metadata?.roles || [];
        userRoles = rolesFromMetadata.map((r: any) => r.trim());
      }

      // Limpieza final y deduplicación
      userRoles = [...new Set(userRoles)];

      // --- TIE-BREAKER HEALING (Desempate Inteligente) ---
      // Si Auth0 tiene múltiples roles (ej. error de acumulacion previo)
      // pero la metadata dice que solo debería tener UNO...
      if (mappingHasData && userRoles.length > 1) {
        const metaRoles = (u.app_metadata?.roles || []).map((r: any) => r.trim());

        // Si la intención clara era tener 1 solo rol, y ese rol está presente en los reales:
        if (metaRoles.length === 1 && userRoles.includes(metaRoles[0])) {
          const intendedRole = metaRoles[0];
          const rolesToRemoveNames = userRoles.filter(r => r !== intendedRole);

          console.log(`[Tie-Breaker Healing] 🚑 Corrigiendo roles duplicados para ${u.email}. Mantener: ${intendedRole}, Borrar: ${rolesToRemoveNames.join(', ')}`);

          // Ajuste visual inmediato
          userRoles = [intendedRole];

          // Corrección en Auth0 (Background)
          (async () => {
            try {
              // 1. Necesitamos los IDs de los roles a borrar 
              // (Usamos el endpoint de roles para mapear nombres a IDs)
              const allRolesRes = await fetch(`https://${domain}/api/v2/roles`, {
                headers: { Authorization: `Bearer ${token}` }
              });
              const allRoles = await allRolesRes.json();
              const idsToDelete = allRoles
                .filter((r: any) => rolesToRemoveNames.includes(r.name))
                .map((r: any) => r.id);

              if (idsToDelete.length > 0) {
                const encodedHealId = encodeURIComponent(u.user_id);
                await fetch(`https://${domain}/api/v2/users/${encodedHealId}/roles`, {
                  method: 'DELETE',
                  headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({ roles: idsToDelete })
                });
                console.log(`[Tie-Breaker Healing] ✅ Limpieza completada para ${u.email}`);
              }
            } catch (err) {
              console.error('[Tie-Breaker Healing Error]', err);
            }
          })();
        }
      }

      // --- LIMPIEZA ACTIVA (ACTIVE PURGE) ---
      // Si estamos confiando en el Mapeo (API real), y la metadata dice algo distinto...
      // SIGNIFICA QUE LA METADATA ESTÁ SUCIA. LA LIMPIAMOS.
      // REGLA:
      // 1. Si es MAPPING (Bulk), solo purgar si NO ES VACÍO (Protección contra lag).
      // 2. Si es DIRECT_API (Verificado), purgar SIEMPRE (Incluso si es vacío, significa que le quitaron el rol).
      const trustForPurge = (sourceOfTruth === 'MAPPING' && userRoles.length > 0) || (sourceOfTruth === 'DIRECT_API');
      if (trustForPurge) {
        const metaRoles = (u.app_metadata?.roles || []).map((r: any) => r.trim()).sort().join(',');
        const realRoles = userRoles.slice().sort().join(',');

        if (metaRoles !== realRoles) {
          console.log(`[Active Purge] 🧹 Limpiando roles fantasma para ${u.email}: Metadata[${metaRoles}] vs Real[${realRoles}]`);

          // Disparamos la limpieza (Fire & Forget)
          const encodedPurgeId = encodeURIComponent(u.user_id);
          fetch(`https://${domain}/api/v2/users/${encodedPurgeId}`, {
            method: 'PATCH',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ app_metadata: { roles: userRoles } }) // Sobrescribimos con la verdad
          }).catch(err => console.error('[Active Purge Error]', err));
        }
      }

      // DIAGNÓSTICO ESPECÍFICO PARA EL USUARIO DE GOOGLE
      const targetId = 'google-oauth2|110118533053339119181';
      if (u.user_id === targetId) {
        console.log(`[Diagnostic] Revisando usuario GOOGLE (${u.name}):`, {
          sourceOfTruth,
          finalRoles: userRoles
        });
      }

      return {
        user_id: u.user_id,
        email: u.email,
        name: u.name || u.nickname || u.email.split('@')[0],
        picture: u.picture,
        logins_count: u.logins_count,
        last_login: u.last_login,
        roles: userRoles.length > 0 ? userRoles : ['Sin rol'],
      };
    }));


    res.json(usersWithRoles);
  } catch (error: any) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: error.message });
  }
};


// Update user role with high reliability
export const updateUserRole = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { roles: rawRoleNames } = req.body;
  const adminId = req.auth?.payload.sub as string;
  const adminName = (req as any).dbUser?.name || 'Administrador';

  if (!Array.isArray(rawRoleNames)) {
    return res.status(400).json({ error: 'Roles must be an array of strings' });
  }

  // Normalizar roles recibidos (trim)
  const roleNames = rawRoleNames.map((r: string) => r.trim());

  try {
    const token = await getManagementToken();
    const domain = process.env.AUTH0_DOMAIN as string;

    // 1. Obtener el catálogo oficial de roles de Auth0
    const allRolesResp = await fetch(`https://${domain}/api/v2/roles`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const auth0Catalog = await allRolesResp.json();

    // 2. Mapear nombres a IDs (Solo los que existan en Auth0)
    // Usamos trim() también en el catálogo para asegurar match
    const roleIdsToAssign = auth0Catalog
      .filter((r: any) => roleNames.includes(r.name.trim()))
      .map((r: any) => r.id);

    console.log(`[Auth0 Sync] Asignando roles: ${roleNames.join(', ')} -> IDs: ${roleIdsToAssign.join(', ')}`);

    // 3. ENCODEAR ID (CRÍTICO para ids con pipe | )
    const encodedId = encodeURIComponent(id);

    // 4. ESTRATEGIA "CLEAN & REPLACE":
    //    a) Obtener roles actuales
    const currentRolesResp = await fetch(`https://${domain}/api/v2/users/${encodedId}/roles`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!currentRolesResp.ok) throw new Error('Error fetching current roles');

    const currentRoles = await currentRolesResp.json();
    const roleIdsToDelete = currentRoles.map((r: any) => r.id);

    //    b) Borrar roles viejos (si existen)
    if (roleIdsToDelete.length > 0) {
      console.log(`[Auth0 Sync] Borrando ${roleIdsToDelete.length} roles previos.`);
      await fetch(`https://${domain}/api/v2/users/${encodedId}/roles`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ roles: roleIdsToDelete }),
      });
    }

    //    c) Asignar roles nuevos
    if (roleIdsToAssign.length > 0) {
      console.log(`[Auth0 Sync] Asignando nuevos roles.`);
      await fetch(`https://${domain}/api/v2/users/${encodedId}/roles`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ roles: roleIdsToAssign }),
      });
    }

    // 5. ACTUALIZAR METADATA (Para consistencia inmediata del fallback)
    await fetch(`https://${domain}/api/v2/users/${encodedId}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        app_metadata: { roles: roleNames }
      }),
    });

    // 6. INVALIDAR CACHÉ GLOBAL
    console.log('[Auth0 Sync] Invalidando cache local...');
    cachedRolesMapping = null;
    lastMappingFetch = 0;

    // 7. ⚡ NOTIFICAR A CLIENTES EN TIEMPO REAL (SSE)
    notifyUserChange('role_updated', {
      userId: id,
      newRoles: roleNames,
      source: 'manual_update'
    });

    console.log('[Auth0 Sync] Operación completada con éxito (Roles + Metadata + Cache Cleared + Notificados).');

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
  const adminName = (req as any).dbUser?.name || 'Administrador';


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
  const adminName = (req as any).dbUser?.name || 'Administrador';


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