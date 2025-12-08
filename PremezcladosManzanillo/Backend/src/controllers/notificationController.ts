import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get all notifications for the authenticated user
export const getNotifications = async (req: Request, res: Response) => {
  const authUserId = req.auth?.payload.sub;

  if (!authUserId) {
    return res.status(401).json({ error: 'Authenticated user ID not found.' });
  }

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

// Mark a notification as read
export const markNotificationAsRead = async (req: Request, res: Response) => {
  const { id } = req.params;
  const authUserId = req.auth?.payload.sub;

  if (!authUserId) {
    return res.status(401).json({ error: 'Authenticated user ID not found.' });
  }

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

// Mark all notifications as read for the authenticated user
export const markAllNotificationsAsRead = async (req: Request, res: Response) => {
  const authUserId = req.auth?.payload.sub;

  if (!authUserId) {
    return res.status(401).json({ error: 'Authenticated user ID not found.' });
  }

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

// Delete a notification
export const deleteNotification = async (req: Request, res: Response) => {
  const { id } = req.params;
  const authUserId = req.auth?.payload.sub;

  if (!authUserId) {
    return res.status(401).json({ error: 'Authenticated user ID not found.' });
  }

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
