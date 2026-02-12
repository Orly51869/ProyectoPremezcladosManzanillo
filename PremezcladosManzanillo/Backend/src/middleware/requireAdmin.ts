import { Request, Response, NextFunction } from 'express';

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).auth?.payload;
  const roles = user?.['https://premezcladomanzanillo.com/roles'] as string[] || [];

  // Also check the user object populated by userProvisioningMiddleware
  const dbUser = (req as any).dbUser;

  console.log('[requireAdmin] Checking access for:', user?.sub);
  console.log('[requireAdmin] Roles in Token:', roles);
  console.log('[requireAdmin] DB User Role:', dbUser?.role);

  if (roles.includes('Administrador') || dbUser?.role === 'Administrador') {
    next();
  } else {
    console.warn('[requireAdmin] Access DENIED. User is not Admin.');
    res.status(403).json({
      message: 'Acceso denegado. Se requiere rol de Administrador.',
      debug: {
        tokenRoles: roles,
        dbRole: dbUser?.role,
        sub: user?.sub
      }
    });
  }
};
