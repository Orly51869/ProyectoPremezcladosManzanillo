/********************************/
/**     auditController.ts     **/
/********************************/
// Archivo que permite definir 
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAuditLogs = async (req: Request, res: Response) => {
  const roles = req.auth?.payload['https://premezcladomanzanillo.com/roles'] as string[] || [];
  const { action, entity, userName } = req.query;

  if (!roles.includes('Administrador')) {
    return res.status(403).json({ error: 'Only administrators can access audit logs.' });
  }

  try {
    const where: any = {};
    if (action) where.action = action;
    if (entity) where.entity = entity;
    if (userName) {
      where.userName = {
        contains: String(userName)
      };
    }

    const logs = await prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100 
    });
    res.json(logs);
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
