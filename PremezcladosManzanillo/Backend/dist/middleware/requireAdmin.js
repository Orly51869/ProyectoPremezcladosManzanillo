"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAdmin = void 0;
const requireAdmin = (req, res, next) => {
    const user = req.auth?.payload;
    const roles = user?.['https://premezcladomanzanillo.com/roles'] || [];
    // Also check the user object populated by userProvisioningMiddleware
    const dbUser = req.dbUser;
    if (roles.includes('Administrador') || dbUser?.role === 'Administrador') {
        next();
    }
    else {
        res.status(403).json({ message: 'Acceso denegado. Se requiere rol de Administrador.' });
    }
};
exports.requireAdmin = requireAdmin;
