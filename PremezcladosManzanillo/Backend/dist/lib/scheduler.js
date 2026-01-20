"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startExpirationScheduler = void 0;
const prisma_1 = __importDefault(require("./prisma"));
/**
 * Servicio encargado de verificar presupuestos próximos a vencer o ya vencidos.
 */
const startExpirationScheduler = () => {
    console.log('Scheduler: Servicio de vencimientos iniciado.');
    // Ejecutar cada 12 horas (o una frecuencia razonable)
    setInterval(async () => {
        try {
            await checkBudgetsExpiration();
        }
        catch (error) {
            console.error('Scheduler Error:', error);
        }
    }, 12 * 60 * 60 * 1000); // 12 horas
    // Ejecución inicial después de 30 segundos
    setTimeout(checkBudgetsExpiration, 30000);
};
exports.startExpirationScheduler = startExpirationScheduler;
const checkBudgetsExpiration = async () => {
    const now = new Date();
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    console.log('Scheduler: Verificando vencimientos de presupuestos...');
    // 1. Notificar presupuestos que vencen mañana (1 día antes)
    // Buscamos PENDING o APPROVED que venzan en el rango de mañana
    const warningRangeStart = new Date(tomorrow);
    warningRangeStart.setHours(0, 0, 0, 0);
    const warningRangeEnd = new Date(tomorrow);
    warningRangeEnd.setHours(23, 59, 59, 999);
    const expiringSoon = await prisma_1.default.budget.findMany({
        where: {
            status: { in: ['PENDING', 'APPROVED'] },
            validUntil: {
                gte: warningRangeStart,
                lte: warningRangeEnd
            }
        },
        include: { creator: true }
    });
    for (const b of expiringSoon) {
        // Evitar duplicar notificaciones (podríamos añadir un flag en el modelo, 
        // pero por ahora simplemente enviamos si no hay una notificación idéntica reciente o similar)
        // Para simplificar, creamos la notificación. El sistema de notificaciones del front mostrará las nuevas.
        await prisma_1.default.notification.create({
            data: {
                userId: b.creatorId,
                message: `⚠️ Tu presupuesto "${b.title}" vence mañana. Asegúrate de registrar el pago pronto.`
            }
        });
    }
    // 2. Anular presupuestos vencidos (sin pago registrado)
    // Buscamos presupuestos cuya fecha validUntil sea menor a 'now' y no estén ya vencidos/pagados
    const expiredBudgets = await prisma_1.default.budget.findMany({
        where: {
            status: { in: ['PENDING', 'APPROVED'] },
            validUntil: { lt: now },
            payments: { none: { status: 'VALIDATED' } } // Si no tiene ningún pago validado
        }
    });
    for (const b of expiredBudgets) {
        await prisma_1.default.budget.update({
            where: { id: b.id },
            data: { status: 'EXPIRED' }
        });
        await prisma_1.default.notification.create({
            data: {
                userId: b.creatorId,
                message: `🚫 El presupuesto "${b.title}" ha sido ANULADO automáticamente por vencimiento.`
            }
        });
        console.log(`Scheduler: Presupuesto ${b.id} marcado como EXPIRED.`);
    }
};
