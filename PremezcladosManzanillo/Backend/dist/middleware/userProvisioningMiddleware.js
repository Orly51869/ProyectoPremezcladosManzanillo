"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userProvisioningMiddleware = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const auth0Utils_1 = require("../utils/auth0Utils");
const userProvisioningMiddleware = async (req, res, next) => {
    const authId = req.auth?.payload.sub;
    const authEmail = req.auth?.payload.email;
    if (!authId) {
        console.error('CRITICAL: Auth0 user ID (sub) missing in token payload.');
        return res.status(500).json({ error: 'User ID not found in authentication token.' });
    }
    try {
        let user = await prisma_1.default.user.findUnique({
            where: { id: authId },
        });
        const isGeneric = (name) => !name || name === 'Usuario' || name === 'Administrador' || name === 'Unnamed User' || name.includes('@');
        // 1. Intentar obtener el nombre del token (rápido)
        let currentNameFromAuth = (req.auth?.payload.name ||
            req.auth?.payload.nickname ||
            req.auth?.payload?.user_metadata?.full_name ||
            req.auth?.payload?.given_name);
        // 2. Si es genérico, intentar obtenerlo de la API de Gestión (lento pero seguro)
        if (isGeneric(currentNameFromAuth) && isGeneric(user?.name)) {
            const auth0User = await (0, auth0Utils_1.fetchAuth0User)(authId);
            if (auth0User) {
                currentNameFromAuth = auth0User.name || auth0User.nickname || auth0User.user_metadata?.full_name || currentNameFromAuth;
                console.log(`[Provisioning] Fetched better name from Auth0 API: ${currentNameFromAuth}`);
            }
        }
        const authRoles = req.auth?.payload['https://premezcladomanzanillo.com/roles'];
        // Determine role from Auth0, but fallback to existing DB role if Auth0 roles are empty/undefined
        let determinedRole = 'Usuario';
        if (authRoles && authRoles.length > 0) {
            determinedRole = authRoles[0];
        }
        else {
            // Try to fetch roles from API if missing in token
            const apiRoles = await (0, auth0Utils_1.fetchAuth0UserRoles)(authId);
            if (apiRoles && apiRoles.length > 0) {
                determinedRole = apiRoles[0].name;
                console.log(`[Provisioning] Fetched role from Auth0 API: ${determinedRole}`);
            }
            else if (user && user.role === 'Administrador') {
                // Fallback to existing DB role only if API didn't return anything (or failed silently) and user was Admin. 
                // Ideally we should trust API return of [] means no role aka Usuario. But for safety during migration:
                determinedRole = 'Administrador';
            }
        }
        const finalName = currentNameFromAuth || user?.name || (authEmail ? authEmail.split('@')[0] : 'Usuario');
        if (!user) {
            // User not found by authId.
            const userEmail = authEmail || `${authId}@placeholder.email`;
            // Check if a user with this email already exists but with a different authId.
            if (authEmail) {
                const existingUserByEmail = await prisma_1.default.user.findUnique({
                    where: { email: authEmail },
                });
                if (existingUserByEmail) {
                    console.log(`[Provisioning] Migrating user data for ${authEmail} to new authId ${authId}.`);
                    try {
                        await prisma_1.default.$transaction(async (tx) => {
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
                        req.dbUser = user;
                        return next();
                    }
                    catch (migrationError) {
                        console.error(`[Provisioning] CRITICAL: Failed to migrate user ${authEmail}.`, migrationError);
                        return res.status(500).json({ error: 'Failed to update user account.' });
                    }
                }
            }
            // Create new user
            user = await prisma_1.default.user.create({
                data: {
                    id: authId,
                    email: userEmail,
                    name: finalName,
                    role: determinedRole,
                },
            });
            console.log(`[Provisioning] New user created: ${user.email} (Name: ${user.name}, Role: ${user.role})`);
        }
        else {
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
                const updateData = {};
                if (authResultIsBetter)
                    updateData.name = currentNameFromAuth;
                if (roleNeedsUpdate)
                    updateData.role = determinedRole;
                if (emailNeedsUpdate) {
                    const conflict = await prisma_1.default.user.findFirst({ where: { email: authEmail, id: { not: user.id } } });
                    if (!conflict)
                        updateData.email = authEmail;
                }
                if (Object.keys(updateData).length > 0) {
                    user = await prisma_1.default.user.update({
                        where: { id: authId },
                        data: updateData,
                    });
                    console.log(`[Provisioning] User synced: ${user.email} -> ${JSON.stringify(updateData)}`);
                }
            }
        }
        req.dbUser = user;
        next();
    }
    catch (error) {
        console.error('Error in user provisioning middleware:', error);
        if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
            return res.status(409).json({
                error: 'A user with this email already exists.',
                code: 'EMAIL_CONFLICT'
            });
        }
        res.status(500).json({ error: 'Internal server error during user provisioning' });
    }
};
exports.userProvisioningMiddleware = userProvisioningMiddleware;
