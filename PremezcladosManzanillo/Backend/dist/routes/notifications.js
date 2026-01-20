"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const notificationController_1 = require("../controllers/notificationController");
const jwtCheck_1 = require("../middleware/jwtCheck"); // Asumimos que jwtCheck se usa para autenticación
const router = (0, express_1.Router)();
// Todas las rutas de notificaciones requieren autenticación
router.use(jwtCheck_1.jwtCheck);
// GET /api/notifications - Obtener todas las notificaciones para el usuario autenticado
router.get('/', notificationController_1.getNotifications);
// GET /api/notifications/unread-count - Obtener el conteo de notificaciones no leídas
router.get('/unread-count', notificationController_1.getUnreadCount);
// PATCH /api/notifications/:id/read - Marcar una notificación específica como leída
router.patch('/:id/read', notificationController_1.markNotificationAsRead);
// PATCH /api/notifications/read-all - Marcar todas las notificaciones del usuario como leídas
router.patch('/read-all', notificationController_1.markAllNotificationsAsRead);
// DELETE /api/notifications/:id - Eliminar una notificación específica
router.delete('/:id', notificationController_1.deleteNotification);
exports.default = router;
