/*************************************/
/**    notificationController.ts    **/
/*************************************/
// Archivo que permite definir controladores para la gestión de notificaciones

// Importaciones
import { Request, Response } from 'express';
import prisma from '../lib/prisma';

// Obtener todas las notificaciones para el usuario autenticado
export const getNotifications = async (req: Request, res: Response) => {
  const authUserId = req.auth?.payload.sub;

  if (!authUserId) {
    return res.status(401).json({ error: 'Authenticated user ID not found.' });
  }

  // Buscar notificaciones
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: authUserId },
      orderBy: { createdAt: 'desc' },
    });
    res.status(200).json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Obtener el conteo de notificaciones no leídas
export const getUnreadCount = async (req: Request, res: Response) => {
  const authUserId = req.auth?.payload.sub;

  if (!authUserId) {
    return res.status(401).json({ error: 'Authenticated user ID not found.' });
  }

  // Buscar cuentas
  try {
    const count = await prisma.notification.count({
      where: { 
        userId: authUserId,
        read: false
      },
    });
    res.status(200).json({ count });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Marcar una notificación como leída
export const markNotificationAsRead = async (req: Request, res: Response) => {
  const { id } = req.params;
  const authUserId = req.auth?.payload.sub;

  if (!authUserId) {
    return res.status(401).json({ error: 'Authenticated user ID not found.' });
  }

  // Buscar notificaciones por ID
  try {
    const notification = await prisma.notification.findUnique({ where: { id } });

    if (!notification || notification.userId !== authUserId) {
      return res.status(404).json({ error: 'Notification not found or not authorized.' });
    }

    const updatedNotification = await prisma.notification.update({
      where: { id },
      data: { read: true },
    });
    res.status(200).json(updatedNotification);
  } catch (error) {
    console.error(`Error marking notification ${id} as read:`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Marcar todas las notificaciones como leídas para el usuario autenticado
export const markAllNotificationsAsRead = async (req: Request, res: Response) => {
  const authUserId = req.auth?.payload.sub;

  if (!authUserId) {
    return res.status(401).json({ error: 'Authenticated user ID not found.' });
  }

  // Actualizar todas las notificaciones del usuario autenticado
  try {
    await prisma.notification.updateMany({
      where: { userId: authUserId, read: false },
      data: { read: true },
    });
    res.status(200).json({ message: 'All notifications marked as read.' });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Eliminar una notificación
export const deleteNotification = async (req: Request, res: Response) => {
  const { id } = req.params;
  const authUserId = req.auth?.payload.sub;

  if (!authUserId) {
    return res.status(401).json({ error: 'Authenticated user ID not found.' });
  }

  // Buscar notificación por ID
  try {
    const notification = await prisma.notification.findUnique({ where: { id } });

    if (!notification || notification.userId !== authUserId) {
      return res.status(404).json({ error: 'Notification not found or not authorized.' });
    }

    await prisma.notification.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    console.error(`Error deleting notification ${id}:`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
};