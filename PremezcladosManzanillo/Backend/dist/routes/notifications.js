"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const notificationController_1 = require("../controllers/notificationController");
const jwtCheck_1 = require("../middleware/jwtCheck"); // Assuming jwtCheck is used for auth
const router = (0, express_1.Router)();
// All notification routes require authentication
router.use(jwtCheck_1.jwtCheck);
// GET /api/notifications - Get all notifications for the authenticated user
router.get('/', notificationController_1.getNotifications);
// PATCH /api/notifications/:id/read - Mark a specific notification as read
router.patch('/:id/read', notificationController_1.markNotificationAsRead);
// PATCH /api/notifications/read-all - Mark all notifications for the user as read
router.patch('/read-all', notificationController_1.markAllNotificationsAsRead);
// DELETE /api/notifications/:id - Delete a specific notification
router.delete('/:id', notificationController_1.deleteNotification);
exports.default = router;
