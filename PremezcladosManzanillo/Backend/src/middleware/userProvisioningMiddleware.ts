import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const userProvisioningMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  console.log('req.auth in userProvisioningMiddleware:', req.auth);
  const authId = req.auth?.payload.sub;
  const authEmail = req.auth?.payload.email as string | undefined;
  const authName = req.auth?.payload.name as string | undefined;

  if (!authId) {
    // If there's no Auth0 ID, we cannot proceed.
    console.error('CRITICAL: Auth0 user ID (sub) missing in token payload.');
    // This is a server error because jwtCheck should have already validated the token.
    return res.status(500).json({ error: 'User ID not found in authentication token.' });
  }

  try {
    let user = await prisma.user.findUnique({
      where: { id: authId },
    });

    if (!user) {
      // User does not exist, create them.
      // Use a placeholder email if the real one is not in the token.
      const userEmail = authEmail || `${authId}@placeholder.email`;
      
      user = await prisma.user.create({
        data: {
          id: authId,
          email: userEmail,
          name: authName || 'Unnamed User', // Fallback if name is not present
          role: 'Usuario', // Default role
        },
      });
      console.log(`New user provisioned: ${user.email} with ID: ${user.id}`);
    }

    // Attach user to request
    (req as any).dbUser = user;

    next();
  } catch (error) {
    console.error('Error in user provisioning middleware:', error);
    res.status(500).json({ error: 'Internal server error during user provisioning' });
  }
};
