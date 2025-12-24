import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';

export const userProvisioningMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const authId = req.auth?.payload.sub;
  const authEmail = req.auth?.payload.email as string | undefined;

  // Intentar obtener el nombre de varios campos comunes en OIDC/Auth0
  const authName = (req.auth?.payload.name ||
    req.auth?.payload.nickname ||
    (req.auth?.payload as any)?.user_metadata?.full_name ||
    req.auth?.payload.preferred_username ||
    (authEmail ? authEmail.split('@')[0] : undefined)) as string | undefined;

  const authRoles = req.auth?.payload['https://premezcladomanzanillo.com/roles'] as string[] | undefined;

  if (!authId) {
    console.error('CRITICAL: Auth0 user ID (sub) missing in token payload.');
    return res.status(500).json({ error: 'User ID not found in authentication token.' });
  }

  try {
    let user = await prisma.user.findUnique({
      where: { id: authId },
    });

    // Determine role from Auth0, but fallback to existing DB role if Auth0 roles are empty/undefined
    // This prevents accidental downgrade if the token is just missing the claim
    let determinedRole = authRoles && authRoles.length > 0 ? authRoles[0] : 'Usuario';

    if (user && user.role === 'Administrador' && (!authRoles || authRoles.length === 0)) {
      console.log(`Preserving 'Administrador' role for user ${user.id} despite missing Auth0 claim.`);
      determinedRole = 'Administrador';
    }
    const currentName = authName || 'Usuario';

    if (!user) {
      // User not found by authId.
      const userEmail = authEmail || `${authId}@placeholder.email`;

      // Check if a user with this email already exists but with a different authId.
      if (authEmail) {
        const existingUserByEmail = await prisma.user.findUnique({
          where: { email: authEmail },
        });

        if (existingUserByEmail) {
          // This is an authId mismatch. Migrate the old user's data to the new authId.
          console.log(`Migrating user data for email ${authEmail} from old ID ${existingUserByEmail.id} to new ID ${authId}.`);
          try {
            await prisma.$transaction(async (tx) => {
              const oldUserId = existingUserByEmail.id;

              // 1. Create a new user with the NEW authId.
              const newUser = await tx.user.create({
                data: {
                  id: authId,
                  email: authEmail,
                  name: currentName ?? 'Usuario',
                  role: determinedRole,
                }
              });

              // 2. Re-point all relations from old user to the new user.
              await tx.client.updateMany({ where: { ownerId: oldUserId }, data: { ownerId: newUser.id } });
              await tx.budget.updateMany({ where: { creatorId: oldUserId }, data: { creatorId: newUser.id } });
              await tx.budget.updateMany({ where: { processedById: oldUserId }, data: { processedById: newUser.id } });
              await tx.payment.updateMany({ where: { validatorId: oldUserId }, data: { validatorId: newUser.id } });
              await tx.notification.updateMany({ where: { userId: oldUserId }, data: { userId: newUser.id } });

              // 3. Delete the old user record.
              await tx.user.delete({ where: { id: oldUserId } });

              user = newUser;
            });

            console.log(`Successfully migrated user ${authEmail} to new authId ${authId}.`);
            (req as any).dbUser = user;
            return next();
          } catch (migrationError) {
            console.error(`CRITICAL: Failed to migrate user with email ${authEmail} to new authId ${authId}.`, migrationError);
            return res.status(500).json({ error: 'Failed to update user account. Please contact support.', code: 'USER_MIGRATION_FAILED' });
          }
        }
      }

      // If we are here, no conflict was found. Create the new user.
      user = await prisma.user.create({
        data: {
          id: authId,
          email: userEmail,
          name: currentName ?? 'Usuario',
          role: determinedRole,
        },
      });
      console.log(`New user provisioned: ${user.email} with ID: ${user.id}, Role: ${user.role}`);
    } else {
      // User found by authId. Sync their details.
      const isGenericName = !user.name || user.name === 'Unnamed User' || user.name === 'Usuario';
      const nameNeedsUpdate = isGenericName && authName && authName !== user.name;
      const roleNeedsUpdate = user.role !== determinedRole;
      const isPlaceholderEmail = user.email.endsWith('@placeholder.email');
      const emailNeedsUpdate = isPlaceholderEmail && authEmail;

      if (nameNeedsUpdate || roleNeedsUpdate || emailNeedsUpdate) {
        const updateData: { role: string; name: string; email?: string } = {
          role: determinedRole,
          name: nameNeedsUpdate ? (currentName ?? 'Usuario') : (user.name ?? 'Usuario'),
        };

        if (emailNeedsUpdate) {
          // Before updating to the new email, ensure it's not already taken by another user
          const conflictingUser = await prisma.user.findFirst({
            where: {
              email: authEmail,
              id: { not: user.id } // Exclude the current user
            }
          });

          if (conflictingUser) {
            console.error(`Conflict: Cannot update email for user ${user.id} to ${authEmail} because it's already in use by user ${conflictingUser.id}.`);
          } else {
            updateData.email = authEmail;
          }
        }

        if (Object.keys(updateData).length > 2 || nameNeedsUpdate || roleNeedsUpdate) {
          user = await prisma.user.update({
            where: { id: authId },
            data: updateData,
          });
          console.log(`User data synced for ${user.email}: Name=${user.name}, Role=${user.role}, Email updated: ${!!updateData.email}`);
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

