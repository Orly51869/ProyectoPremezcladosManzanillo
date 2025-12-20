import { Router } from 'express';
import {
  getNotifications,
  getUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from '../controllers/notificationController';
import { jwtCheck } from '../middleware/jwtCheck'; // Asumimos que jwtCheck se usa para autenticación

const router = Router();

// Todas las rutas de notificaciones requieren autenticación
router.use(jwtCheck);

// GET /api/notifications - Obtener todas las notificaciones para el usuario autenticado
router.get('/', getNotifications);

// GET /api/notifications/unread-count - Obtener el conteo de notificaciones no leídas
router.get('/unread-count', getUnreadCount);

// PATCH /api/notifications/:id/read - Marcar una notificación específica como leída
router.patch('/:id/read', markNotificationAsRead);

// PATCH /api/notifications/read-all - Marcar todas las notificaciones del usuario como leídas
router.patch('/read-all', markAllNotificationsAsRead);

// DELETE /api/notifications/:id - Eliminar una notificación específica
router.delete('/:id', deleteNotification);

export default router;
