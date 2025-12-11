import { Request, Response, NextFunction } from 'express';

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  // Asumimos que req.dbUser es poblado por userProvisioningMiddleware
  if (!(req as any).dbUser || (req as any).dbUser.role !== 'Administrador') {
    return res.status(403).json({ message: 'Access denied. Administrator privileges required.' });
  }
  next();
};
