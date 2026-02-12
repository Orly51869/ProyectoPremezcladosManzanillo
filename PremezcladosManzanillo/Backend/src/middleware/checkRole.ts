
import { Request, Response, NextFunction } from 'express';

export const checkRole = (allowedRoles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const dbUser = (req as any).dbUser;

        // Check DB role
        if (dbUser && allowedRoles.includes(dbUser.role)) {
            return next();
        }

        // Check Token roles (fallback)
        const tokenRoles = (req as any).auth?.payload['https://premezcladomanzanillo.com/roles'] as string[] || [];
        const hasTokenRole = tokenRoles.some(r => allowedRoles.includes(r));

        if (hasTokenRole) {
            return next();
        }

        console.warn(`[checkRole] Access denied. User: ${dbUser?.email}, Role: ${dbUser?.role}. Required: ${allowedRoles.join(', ')}`);
        res.status(403).json({
            message: 'Acceso denegado. No tienes permisos para esta sección.',
            requiredRoles: allowedRoles
        });
    };
};
