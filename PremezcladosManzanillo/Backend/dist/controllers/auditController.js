"use strict";
/********************************/
/**     auditController.ts     **/
/********************************/
// Archivo que permite definir controladores para la auditoría
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAuditLogs = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
// Controlador para obtener logs de auditoría
const getAuditLogs = async (req, res) => {
    const roles = req.auth?.payload['https://premezcladomanzanillo.com/roles'] || [];
    const { action, entity, userName } = req.query;
    if (!roles.includes('Administrador')) {
        return res.status(403).json({ error: 'Only administrators can access audit logs.' });
    }
    // Extraer parámetros de la consulta
    try {
        const where = {};
        if (action)
            where.action = action;
        if (entity)
            where.entity = entity;
        if (userName) {
            where.userName = {
                contains: String(userName)
            };
        }
        const limit = req.query.limit ? parseInt(String(req.query.limit)) : (req.query.all === 'true' ? undefined : 100);
        const logs = await prisma_1.default.auditLog.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: limit
        });
        res.json(logs);
        // Devolver logs
    }
    catch (error) {
        console.error('Error fetching audit logs:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getAuditLogs = getAuditLogs;
