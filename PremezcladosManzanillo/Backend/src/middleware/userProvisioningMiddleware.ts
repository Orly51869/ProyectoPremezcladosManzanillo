import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';

export const userProvisioningMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const authId = req.auth?.payload.sub;
  const authEmail = req.auth?.payload.email as string | undefined;
  const authName = req.auth?.payload.name as string | undefined;
  const authRoles = req.auth?.payload['https://premezcladomanzanillo.com/roles'] as string[] | undefined;

  if (!authId) {
    console.error('CRITICAL: Auth0 user ID (sub) missing in token payload.');
    return res.status(500).json({ error: 'User ID not found in authentication token.' });
  }

  try {
    let user = await prisma.user.findUnique({
      where: { id: authId },
    });

    const determinedRole = authRoles && authRoles.length > 0 ? authRoles[0] : 'Usuario';
    const currentName = authName || 'Unnamed User';

    if (!user) {
      const userEmail = authEmail || `${authId}@placeholder.email`;
      
      user = await prisma.user.create({
        data: {
          id: authId,
          email: userEmail,
          name: currentName,
          role: determinedRole,
        },
      });
      console.log(`New user provisioned: ${user.email} with ID: ${user.id}, Role: ${user.role}`);
    } else {
      // Sincronizar nombre y rol si han cambiado o si el nombre era genérico
      const nameNeedsUpdate = user.name === 'Unnamed User' && currentName !== 'Unnamed User';
      const roleNeedsUpdate = user.role !== determinedRole;

      if (nameNeedsUpdate || roleNeedsUpdate) {
        user = await prisma.user.update({
          where: { id: authId },
          data: { 
            role: determinedRole,
            name: nameNeedsUpdate ? currentName : user.name
          },
        });
        console.log(`User data synced for ${user.email}: Name=${user.name}, Role=${user.role}`);
      }
    }

    (req as any).dbUser = user;
    next();
  } catch (error) {
    console.error('Error in user provisioning middleware:', error);
    res.status(500).json({ error: 'Internal server error during user provisioning' });
  }
};
