"use strict";
/********************************/
/**    dashboardController.ts  **/
/********************************/
// Archivo que permite definir controladores para la gestión del dashboard
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRecentActivity = exports.getDashboardStats = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
// Obtener estadísticas para el dashboard
const getDashboardStats = async (req, res) => {
    try {
        const userId = req.dbUser?.id;
        const userRole = req.dbUser?.role;
        console.log(`[DashboardStats] User ID: ${userId}, Role: ${userRole}`);
        if (!userId || !userRole) {
            console.error("[DashboardStats] Usuario no autenticado o rol no definido.");
            return res.status(401).json({ message: "Usuario no autenticado o rol no definido." });
        }
        const isAdminOrManager = ['Administrador', 'Comercial', 'Contable'].includes(userRole);
        console.log(`[DashboardStats] isAdminOrManager: ${isAdminOrManager}`);
        let clientWhereClause = {};
        let budgetWhereClause = {};
        let paymentWhereClause = {};
        if (!isAdminOrManager) {
            // Para el rol 'Usuario', filtrar por clientes propiedad del usuario
            clientWhereClause = { ownerId: userId };
            budgetWhereClause = { client: { ownerId: userId } };
            paymentWhereClause = { budget: { client: { ownerId: userId } } };
            console.log(`[DashboardStats] Applying user-specific filters for role: ${userRole}`);
        }
        else {
            console.log(`[DashboardStats] No specific filters applied for role: ${userRole}`);
        }
        // 1. Métricas de tarjetas principales
        const totalClients = await prisma_1.default.client.count({ where: clientWhereClause });
        const totalBudgets = await prisma_1.default.budget.count({ where: budgetWhereClause });
        const validatedPayments = await prisma_1.default.payment.findMany({
            where: { ...paymentWhereClause, status: 'VALIDATED' },
        });
        const totalIncome = validatedPayments.reduce((sum, p) => sum + p.paidAmount, 0);
        const pendingPaymentsAggregate = await prisma_1.default.payment.aggregate({
            _sum: {
                pending: true, // Corregido de pendingAmount a pending
            },
            where: {
                ...paymentWhereClause,
                status: {
                    in: ['PENDING', 'REJECTED'],
                },
            },
        });
        const pendingAmount = pendingPaymentsAggregate._sum.pending ?? 0; // Corregido de pendingAmount a pending
        console.log(`[DashboardStats] totalClients: ${totalClients}, totalBudgets: ${totalBudgets}, totalIncome: ${totalIncome}, pendingAmount: ${pendingAmount}`);
        // 2. Resumen del gráfico
        const approvedBudgets = await prisma_1.default.budget.count({ where: { ...budgetWhereClause, status: 'APPROVED' } });
        const totalPayments = await prisma_1.default.payment.count({ where: paymentWhereClause });
        const pendingPaymentsCount = await prisma_1.default.payment.count({ where: { ...paymentWhereClause, pending: { gt: 0 } } });
        console.log(`[DashboardStats] approvedBudgets: ${approvedBudgets}, totalPayments: ${totalPayments}, pendingPaymentsCount: ${pendingPaymentsCount}`);
        // 3. Datos del gráfico de líneas (últimos 6 meses)
        const today = new Date();
        const last6Months = Array.from({ length: 6 }).map((_, i) => {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            return d;
        }).reverse();
        const monthlyIncomeData = await Promise.all(last6Months.map(async (monthDate) => {
            const startOfMonth = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
            const endOfMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0, 23, 59, 59);
            const incomeResult = await prisma_1.default.payment.aggregate({
                _sum: { paidAmount: true },
                where: {
                    ...paymentWhereClause,
                    status: 'VALIDATED',
                    validatedAt: {
                        gte: startOfMonth,
                        lte: endOfMonth,
                    },
                },
            });
            const pendingResult = await prisma_1.default.payment.aggregate({
                _sum: { pending: true },
                where: {
                    ...paymentWhereClause,
                    createdAt: {
                        gte: startOfMonth,
                        lte: endOfMonth,
                    },
                    status: {
                        in: ['PENDING', 'REJECTED']
                    }
                }
            });
            return {
                month: monthDate.toLocaleString('es-ES', { month: 'short' }),
                income: incomeResult._sum.paidAmount ?? 0,
                pending: pendingResult._sum.pending ?? 0,
            };
        }));
        const labels = monthlyIncomeData.map(d => d.month);
        const ingresosSeries = monthlyIncomeData.map(d => d.income);
        const pendientesSeries = monthlyIncomeData.map(d => d.pending);
        res.json({
            totalClients,
            totalBudgets,
            totalIncome,
            pendingAmount,
            approvedBudgets,
            totalPayments,
            pendingPaymentsCount,
            chartData: {
                labels,
                ingresosSeries,
                pendientesSeries,
            },
        });
    }
    catch (error) {
        console.error("Error fetching dashboard stats:", error);
        res.status(500).json({ message: "Error al obtener las estadísticas del dashboard" });
    }
};
exports.getDashboardStats = getDashboardStats;
// Función para obtener actividad reciente
const getRecentActivity = async (req, res) => {
    try {
        const userId = req.dbUser?.id;
        const userRole = req.dbUser?.role;
        console.log(`[RecentActivity] User ID: ${userId}, Role: ${userRole}`);
        if (!userId || !userRole) {
            console.error("[RecentActivity] Usuario no autenticado o rol no definido.");
            return res.status(401).json({ message: "Usuario no autenticado o rol no definido." });
        }
        const isAdminOrManager = ['Administrador', 'Comercial', 'Contable'].includes(userRole);
        console.log(`[RecentActivity] isAdminOrManager: ${isAdminOrManager}`);
        let budgetWhereClause = {};
        let paymentWhereClause = {};
        if (!isAdminOrManager) {
            budgetWhereClause = { creatorId: userId };
            paymentWhereClause = { budget: { client: { ownerId: userId } } };
            console.log(`[RecentActivity] Applying user-specific filters for role: ${userRole}`);
        }
        else {
            console.log(`[RecentActivity] No specific filters applied for role: ${userRole}`);
        }
        const recentBudgets = await prisma_1.default.budget.findMany({
            take: 3,
            orderBy: { createdAt: 'desc' },
            where: budgetWhereClause,
            include: { client: true, creator: true }
        });
        const recentPayments = await prisma_1.default.payment.findMany({
            take: 2,
            orderBy: { createdAt: 'desc' },
            where: paymentWhereClause,
            include: { budget: { include: { client: true } } }
        });
        console.log(`[RecentActivity] Found ${recentBudgets.length} recent budgets and ${recentPayments.length} recent payments.`);
        // Crear actividad
        const activity = [];
        for (const budget of recentBudgets) {
            activity.push({
                type: 'BUDGET',
                text: `${budget.client?.name || 'Cliente'} creó el presupuesto "${budget.title}"`,
                date: budget.createdAt
            });
        }
        for (const payment of recentPayments) {
            activity.push({
                type: 'PAYMENT',
                text: `${payment.budget.client?.name || 'Usuario'} registró un pago de ${payment.paidAmount}`, // Removed formatCurrency
                date: payment.createdAt
            });
        }
        // Ordenar por fecha y tomar los 5 más recientes
        const sortedActivity = activity.sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 5);
        console.log(`[RecentActivity] Returning ${sortedActivity.length} sorted activities.`);
        res.json(sortedActivity);
        // Devolver actividad reciente
    }
    catch (error) {
        console.error("Error fetching recent activity:", error);
        res.status(500).json({ message: "Error al obtener la actividad reciente" });
        // Devolver error
    }
};
exports.getRecentActivity = getRecentActivity;
