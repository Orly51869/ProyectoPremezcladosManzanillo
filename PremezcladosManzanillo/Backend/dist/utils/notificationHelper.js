"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendNotificationToRoles = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
/**
 * Envía una notificación a todos los usuarios que posean uno de los roles especificados.
 *
 * @param roles Lista de roles que deben recibir la notificación (ej: ['Administrador', 'Contable'])
 * @param message El mensaje de la notificación
 */
const sendNotificationToRoles = async (roles, message) => {
    try {
        // Buscar todos los usuarios que tengan alguno de los roles indicados
        const users = await prisma_1.default.user.findMany({
            where: {
                role: {
                    in: roles,
                },
            },
            select: {
                id: true,
            },
        });
        if (users.length === 0)
            return;
        // Crear las notificaciones usando una transacción para asegurar consistencia
        await prisma_1.default.$transaction(users.map((user) => prisma_1.default.notification.create({
            data: {
                userId: user.id,
                message,
                read: false,
            },
        })));
        console.log(`Notificación enviada a ${users.length} usuarios con roles: ${roles.join(', ')}`);
    }
    catch (error) {
        console.error('Error enviando notificación por roles:', error);
    }
};
exports.sendNotificationToRoles = sendNotificationToRoles;
