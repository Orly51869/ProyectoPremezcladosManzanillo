import prisma from '../lib/prisma';

/**
 * Envía una notificación a todos los usuarios que posean uno de los roles especificados.
 * 
 * @param roles Lista de roles que deben recibir la notificación (ej: ['Administrador', 'Contable'])
 * @param message El mensaje de la notificación
 */
export const sendNotificationToRoles = async (roles: string[], message: string) => {
  try {
    // Buscar todos los usuarios que tengan alguno de los roles indicados
    const users = await prisma.user.findMany({
      where: {
        role: {
          in: roles,
        },
      },
      select: {
        id: true,
      },
    });

    if (users.length === 0) return;

    // Crear las notificaciones masivamente para todos esos usuarios
    await prisma.notification.createMany({
      data: users.map((user) => ({
        userId: user.id,
        message,
        read: false,
      })),
    });
    
    console.log(`Notificación enviada a ${users.length} usuarios con roles: ${roles.join(', ')}`);
  } catch (error) {
    console.error('Error enviando notificación por roles:', error);
  }
};
