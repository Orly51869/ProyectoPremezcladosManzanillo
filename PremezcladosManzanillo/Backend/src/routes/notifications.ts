import { Router } from 'express';
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from '../controllers/notificationController';
import { jwtCheck } from '../middleware/jwtCheck'; // Assuming jwtCheck is used for auth

const router = Router();

// All notification routes require authentication
router.use(jwtCheck);

// GET /api/notifications - Get all notifications for the authenticated user
router.get('/', getNotifications);

// PATCH /api/notifications/:id/read - Mark a specific notification as read
router.patch('/:id/read', markNotificationAsRead);

// PATCH /api/notifications/read-all - Mark all notifications for the user as read
router.patch('/read-all', markAllNotificationsAsRead);

// DELETE /api/notifications/:id - Delete a specific notification
router.delete('/:id', deleteNotification);

export default router;
