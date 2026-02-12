import { Request, Response, NextFunction } from 'express';

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).auth?.payload;
  const roles = user?.['https://premezcladomanzanillo.com/roles'] as string[] || [];
  const dbUser = (req as any).dbUser;

  if (roles.includes('Administrador') || dbUser?.role === 'Administrador') {
    next();
  } else {
    res.status(403).json({
      message: 'Acceso denegado. Se requiere rol de Administrador.',
    });
  }
};
