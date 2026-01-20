"use strict";
/*************************************/
/**    notificationController.ts    **/
/*************************************/
// Archivo que permite definir controladores para la gestión de notificaciones
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteNotification = exports.markAllNotificationsAsRead = exports.markNotificationAsRead = exports.getUnreadCount = exports.getNotifications = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
// Obtener todas las notificaciones para el usuario autenticado
const getNotifications = async (req, res) => {
    const authUserId = req.auth?.payload.sub;
    if (!authUserId) {
        return res.status(401).json({ error: 'Authenticated user ID not found.' });
    }
    // Buscar notificaciones
    try {
        const notifications = await prisma_1.default.notification.findMany({
            where: { userId: authUserId },
            orderBy: { createdAt: 'desc' },
        });
        res.status(200).json(notifications);
    }
    catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getNotifications = getNotifications;
// Obtener el conteo de notificaciones no leídas
const getUnreadCount = async (req, res) => {
    const authUserId = req.auth?.payload.sub;
    if (!authUserId) {
        return res.status(401).json({ error: 'Authenticated user ID not found.' });
    }
    // Buscar cuentas
    try {
        const count = await prisma_1.default.notification.count({
            where: {
                userId: authUserId,
                read: false
            },
        });
        res.status(200).json({ count });
    }
    catch (error) {
        console.error('Error fetching unread count:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getUnreadCount = getUnreadCount;
// Marcar una notificación como leída
const markNotificationAsRead = async (req, res) => {
    const { id } = req.params;
    const authUserId = req.auth?.payload.sub;
    if (!authUserId) {
        return res.status(401).json({ error: 'Authenticated user ID not found.' });
    }
    // Buscar notificaciones por ID
    try {
        const notification = await prisma_1.default.notification.findUnique({ where: { id } });
        if (!notification || notification.userId !== authUserId) {
            return res.status(404).json({ error: 'Notification not found or not authorized.' });
        }
        const updatedNotification = await prisma_1.default.notification.update({
            where: { id },
            data: { read: true },
        });
        res.status(200).json(updatedNotification);
    }
    catch (error) {
        console.error(`Error marking notification ${id} as read:`, error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.markNotificationAsRead = markNotificationAsRead;
// Marcar todas las notificaciones como leídas para el usuario autenticado
const markAllNotificationsAsRead = async (req, res) => {
    const authUserId = req.auth?.payload.sub;
    if (!authUserId) {
        return res.status(401).json({ error: 'Authenticated user ID not found.' });
    }
    // Actualizar todas las notificaciones del usuario autenticado
    try {
        await prisma_1.default.notification.updateMany({
            where: { userId: authUserId, read: false },
            data: { read: true },
        });
        res.status(200).json({ message: 'All notifications marked as read.' });
    }
    catch (error) {
        console.error('Error marking all notifications as read:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.markAllNotificationsAsRead = markAllNotificationsAsRead;
// Eliminar una notificación
const deleteNotification = async (req, res) => {
    const { id } = req.params;
    const authUserId = req.auth?.payload.sub;
    if (!authUserId) {
        return res.status(401).json({ error: 'Authenticated user ID not found.' });
    }
    // Buscar notificación por ID
    try {
        const notification = await prisma_1.default.notification.findUnique({ where: { id } });
        if (!notification || notification.userId !== authUserId) {
            return res.status(404).json({ error: 'Notification not found or not authorized.' });
        }
        await prisma_1.default.notification.delete({ where: { id } });
        res.status(204).send();
    }
    catch (error) {
        console.error(`Error deleting notification ${id}:`, error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.deleteNotification = deleteNotification;
