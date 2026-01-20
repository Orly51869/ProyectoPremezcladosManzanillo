"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logActivity = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const logActivity = async ({ userId, userName, action, entity, entityId, details, ipAddress }) => {
    try {
        await prisma.auditLog.create({
            data: {
                userId,
                userName,
                action,
                entity,
                entityId,
                details,
                ipAddress
            }
        });
    }
    catch (error) {
        console.error('Failed to create audit log:', error);
    }
};
exports.logActivity = logActivity;
