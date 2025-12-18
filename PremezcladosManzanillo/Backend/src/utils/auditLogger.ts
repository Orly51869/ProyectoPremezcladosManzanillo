import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const logActivity = async ({
  userId,
  userName,
  action,
  entity,
  entityId,
  details,
  ipAddress
}: {
  userId: string;
  userName?: string;
  action: string;
  entity: string;
  entityId?: string;
  details?: string;
  ipAddress?: string;
}) => {
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
  } catch (error) {
    console.error('Failed to create audit log:', error);
  }
};
