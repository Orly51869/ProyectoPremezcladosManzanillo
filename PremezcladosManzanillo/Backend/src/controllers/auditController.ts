/********************************/
/**     auditController.ts     **/
/********************************/
// Archivo que permite definir controladores para la auditoría

// Importaciones
import { Request, Response } from 'express';
import prisma from '../lib/prisma';

// Controlador para obtener logs de auditoría
export const getAuditLogs = async (req: Request, res: Response) => {
  const roles = req.auth?.payload['https://premezcladomanzanillo.com/roles'] as string[] || [];
  const { action, entity, userName } = req.query;

  if (!roles.includes('Administrador')) {
    return res.status(403).json({ error: 'Only administrators can access audit logs.' });
  }

  // Extraer parámetros de la consulta
  try {
    const where: any = {};
    if (action) where.action = action;
    if (entity) where.entity = entity;
    if (userName) {
      where.userName = {
        contains: String(userName)
      };
    }

    const limit = req.query.limit ? parseInt(String(req.query.limit)) : (req.query.all === 'true' ? undefined : 100);

    const logs = await prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit
    });
    res.json(logs);
    // Devolver logs
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
