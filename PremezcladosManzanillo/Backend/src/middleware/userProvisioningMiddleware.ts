import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { fetchAuth0User, fetchAuth0UserRoles } from '../utils/auth0Utils';

export const userProvisioningMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const authId = req.auth?.payload.sub;
  const authEmail = req.auth?.payload.email as string | undefined;

  if (!authId) {
    console.error('CRITICAL: Auth0 user ID (sub) missing in token payload.');
    return res.status(500).json({ error: 'User ID not found in authentication token.' });
  }

  try {
    let user = await prisma.user.findUnique({
      where: { id: authId },
    });

    const isGeneric = (name: string | null | undefined) =>
      !name || name === 'Usuario' || name === 'Administrador' || name === 'Unnamed User' || name.includes('@');

    // 1. Intentar obtener el nombre del token (rápido)
    let currentNameFromAuth = (
      req.auth?.payload.name ||
      req.auth?.payload.nickname ||
      (req.auth?.payload as any)?.user_metadata?.full_name ||
      (req.auth?.payload as any)?.given_name
    ) as string | undefined;

    // 2. Si es genérico, intentar obtenerlo de la API de Gestión (lento pero seguro)
    if (isGeneric(currentNameFromAuth) && isGeneric(user?.name)) {
      const auth0User = await fetchAuth0User(authId);
      if (auth0User) {
        currentNameFromAuth = auth0User.name || auth0User.nickname || auth0User.user_metadata?.full_name || currentNameFromAuth;
      }
    }

    // 3. Determinar rol del usuario
    // ──────────────────────────────────────────────────────────────────
    // Estrategia de resolución de rol (en orden de prioridad):
    //   1. Token JWT (claim personalizado inyectado por Auth0 Action)
    //   2. Auth0 Management API (consulta directa a los roles asignados)
    //   3. Rol existente en la base de datos local (si el usuario ya existe)
    //   4. Fallback por defecto: 'Usuario' (para nuevos registros)
    //
    // ⚡ Todos los usuarios nuevos que se registren a través de Auth0
    //    recibirán automáticamente el rol "Usuario" si no tienen roles
    //    asignados. Esto garantiza acceso mínimo al sistema desde el
    //    primer inicio de sesión.
    // ──────────────────────────────────────────────────────────────────
    const DEFAULT_ROLE = 'Usuario';
    const authRoles = req.auth?.payload['https://premezcladomanzanillo.com/roles'] as string[] | undefined;
    let determinedRole = user?.role || DEFAULT_ROLE;

    if (authRoles && authRoles.length > 0) {
      // Prioridad 1: Rol proveniente del token JWT (inyectado por Auth0 Action)
      determinedRole = authRoles[0];
    } else {
      // Prioridad 2: Consultar la API de gestión de Auth0
      const apiRoles = await fetchAuth0UserRoles(authId);

      if (apiRoles && apiRoles.length > 0) {
        determinedRole = apiRoles[0].name;
      }
      // Si no se encuentra ningún rol, se mantiene el fallback:
      // - Rol existente en BD para usuarios ya registrados
      // - 'Usuario' para usuarios nuevos (DEFAULT_ROLE)
    }

    const finalName = currentNameFromAuth || user?.name || (authEmail ? authEmail.split('@')[0] : 'Usuario');

    if (!user) {
      // User not found by authId.
      const userEmail = authEmail || `${authId}@placeholder.email`;

      // Check if a user with this email already exists but with a different authId.
      if (authEmail) {
        const existingUserByEmail = await prisma.user.findUnique({
          where: { email: authEmail },
        });

        if (existingUserByEmail) {
          console.log(`[Provisioning] Migrating user data for ${authEmail} to new authId ${authId}.`);
          try {
            await prisma.$transaction(async (tx) => {
              const oldUserId = existingUserByEmail.id;
              const newUser = await tx.user.create({
                data: {
                  id: authId,
                  email: authEmail,
                  name: finalName,
                  role: determinedRole,
                }
              });

              // Re-point all relations
              await tx.client.updateMany({ where: { ownerId: oldUserId }, data: { ownerId: newUser.id } });
              await tx.budget.updateMany({ where: { creatorId: oldUserId }, data: { creatorId: newUser.id } });
              await tx.budget.updateMany({ where: { processedById: oldUserId }, data: { processedById: newUser.id } });
              await tx.payment.updateMany({ where: { validatorId: oldUserId }, data: { validatorId: newUser.id } });
              await tx.notification.updateMany({ where: { userId: oldUserId }, data: { userId: newUser.id } });

              await tx.user.delete({ where: { id: oldUserId } });
              user = newUser;
            });

            console.log(`[Provisioning] Successfully migrated user ${authEmail}.`);
            (req as any).dbUser = user;
            return next();
          } catch (migrationError) {
            console.error(`[Provisioning] CRITICAL: Failed to migrate user ${authEmail}.`, migrationError);
            return res.status(500).json({ error: 'Failed to update user account.' });
          }
        }
      }

      // Create new user
      user = await prisma.user.create({
        data: {
          id: authId,
          email: userEmail,
          name: finalName,
          role: determinedRole,
        },
      });
      console.log(`[Provisioning] New user created: ${user.email} (Name: ${user.name}, Role: ${user.role})`);
    } else {
      // Sync their details.
      // Un nombre es genérico si es nulo, 'Usuario', 'Administrador', 'Unnamed User' o parece un correo
      const currentNameIsGeneric = !user.name ||
        user.name === 'Usuario' ||
        user.name === 'Unnamed User' ||
        user.name === 'Administrador' ||
        (user.name && user.name.includes('@'));

      const authResultIsBetter = currentNameFromAuth &&
        currentNameFromAuth !== user.name &&
        (currentNameIsGeneric || (user.name && currentNameFromAuth.length > user.name.length));

      const roleNeedsUpdate = user.role !== determinedRole;
      const emailNeedsUpdate = user.email.endsWith('@placeholder.email') && authEmail;

      if (authResultIsBetter || roleNeedsUpdate || emailNeedsUpdate) {
        const updateData: any = {};
        if (authResultIsBetter) updateData.name = currentNameFromAuth;
        if (roleNeedsUpdate) updateData.role = determinedRole;
        if (emailNeedsUpdate) {
          const conflict = await prisma.user.findFirst({ where: { email: authEmail, id: { not: user.id } } });
          if (!conflict) updateData.email = authEmail;
        }

        if (Object.keys(updateData).length > 0) {
          user = await prisma.user.update({
            where: { id: authId },
            data: updateData,
          });
          console.log(`[Provisioning] User synced: ${user.email} -> ${JSON.stringify(updateData)}`);
        }
      }
    }

    (req as any).dbUser = user;
    next();
  } catch (error) {
    console.error('Error in user provisioning middleware:', error);
    if ((error as any).code === 'P2002' && (error as any).meta?.target?.includes('email')) {
      return res.status(409).json({
        error: 'A user with this email already exists.',
        code: 'EMAIL_CONFLICT'
      });
    }
    res.status(500).json({ error: 'Internal server error during user provisioning' });
  }
};

