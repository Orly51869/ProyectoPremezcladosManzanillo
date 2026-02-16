/********************************/
/**    dashboardController.ts  **/
/********************************/
// Archivo que permite definir controladores para la gestión del dashboard

// Importaciones
import { Request, Response } from 'express';
import prisma from '../lib/prisma';

// Extensión del tipo Request para incluir dbUser
interface AuthenticatedRequest extends Request {
  dbUser?: {
    id: string;
    email: string;
    name: string | null;
    role: string | null;
  };
}

// Obtener estadísticas para el dashboard
export const getDashboardStats = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.dbUser?.id;
    const userRole = req.dbUser?.role;

    console.log(`[DashboardStats] User ID: ${userId}, Role: ${userRole}`);

    if (!userId || !userRole) {
      console.error("[DashboardStats] Usuario no autenticado o rol no definido.");
      return res.status(401).json({ message: "Usuario no autenticado o rol no definido." });
    }

    const isAdminOrManager = ['Administrador', 'Comercial', 'Contable'].includes(userRole);

    let clientWhereClause: any = {};
    let budgetWhereClause: any = {};
    let paymentWhereClause: any = {};

    if (!isAdminOrManager) {
      // Para el rol 'Usuario', filtrar por clientes propiedad del usuario
      clientWhereClause = { ownerId: userId };
      budgetWhereClause = { client: { ownerId: userId } };
      paymentWhereClause = { budget: { client: { ownerId: userId } } };
    }

    // Date Filtering
    const { startDate, endDate } = req.query;
    let dateFilter: any = {};

    if (startDate && endDate) {
      dateFilter = {
        createdAt: {
          gte: new Date(startDate as string),
          lte: new Date(endDate as string)
        }
      };

      // Apply to clauses
      clientWhereClause = { ...clientWhereClause, ...dateFilter };
      budgetWhereClause = { ...budgetWhereClause, ...dateFilter };
      paymentWhereClause = { ...paymentWhereClause, ...dateFilter };
    }

    // 1. Métricas de tarjetas principales
    const totalClients = await prisma.client.count({ where: clientWhereClause });
    const totalBudgets = await prisma.budget.count({ where: budgetWhereClause });

    // INCOME Calculation: Strictly payments VALIDATED in the range (Cash Basis)
    let incomeWhereClause: any = { status: 'VALIDATED' };

    // Apply user ownership filter if not admin
    if (!isAdminOrManager) {
      incomeWhereClause.budget = { client: { ownerId: userId } };
    }

    // Apply Date Filter to 'validatedAt' if dates are provided
    if (startDate && endDate) {
      incomeWhereClause.validatedAt = {
        gte: new Date(startDate as string),
        lte: new Date(endDate as string)
      };
    }

    // Optimized: Use aggregate instead of findMany + reduce
    const incomeAgg = await prisma.payment.aggregate({
      _sum: { paidAmount: true },
      where: incomeWhereClause
    });
    const totalIncome = incomeAgg._sum.paidAmount || 0;

    // Calculate "Cuentas por Cobrar" (Accounts Receivable) based on Budgets in range
    // User request: "monto de los presupuesto aprobado que aun no han sido pagado"

    // A. Total Amount of Approved Budgets (in filter range)
    const approvedBudgetsAgg = await prisma.budget.aggregate({
      _sum: { total: true },
      where: { ...budgetWhereClause, status: 'APPROVED' }
    });
    const totalApprovedValues = approvedBudgetsAgg._sum.total || 0;

    // B. Total Paid Amount for THOSE Approved Budgets (Regardless of when payment happened)
    // We want the balance of the specific budgets found in 'A'.
    const paidForApprovedAgg = await prisma.payment.aggregate({
      _sum: { paidAmount: true },
      where: {
        budget: { ...budgetWhereClause, status: 'APPROVED' },
        status: 'VALIDATED'
      }
    });
    const totalPaidValues = paidForApprovedAgg._sum.paidAmount || 0;

    // Pending Amount = Total Value - Total Paid
    const pendingAmount = Math.max(0, totalApprovedValues - totalPaidValues);

    // 2. Resumen del gráfico y Alertas
    // Calculate precise metrics
    const activeBudgets = await prisma.budget.count({ where: { ...budgetWhereClause, status: 'APPROVED' } });
    const paidBudgetsCount = await prisma.budget.count({ where: { ...budgetWhereClause, status: 'PAID' } });
    const approvedBudgets = activeBudgets + paidBudgetsCount;

    const validatedPaymentsCount = await prisma.payment.count({ where: { ...paymentWhereClause, status: 'VALIDATED' } });
    const pendingPaymentsCount = await prisma.payment.count({ where: { ...paymentWhereClause, status: 'PENDING' } });
    const totalPayments = validatedPaymentsCount + pendingPaymentsCount;

    // --- ALERT LOGIC ---
    const now = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(now.getDate() + 7);

    // Alert 1: Overdue Budgets (Vencidos)
    // Status APPROVED (not paid) AND validUntil < now
    const overdueBudgetsCount = await prisma.budget.count({
      where: {
        ...budgetWhereClause,
        status: 'APPROVED',
        validUntil: {
          lt: now
        }
      }
    });

    // Alert 2: Upcoming Budgets (Próximos a vencer)
    // Status APPROVED AND validUntil > now AND validUntil < nextWeek
    const upcomingBudgetsCount = await prisma.budget.count({
      where: {
        ...budgetWhereClause,
        status: 'APPROVED',
        validUntil: {
          gte: now,
          lte: nextWeek
        }
      }
    });

    // Alert 3: Payments Pending Validation (Pagos por validar)
    // Useful for Admins/Accountants
    const pendingValidationPaymentsCount = await prisma.payment.count({
      where: {
        ...paymentWhereClause,
        status: 'PENDING'
      }
    });



    // 3. Datos del gráfico de líneas
    // Default: Last 6 months
    let chartStartDate = new Date();
    chartStartDate.setMonth(chartStartDate.getMonth() - 5);
    chartStartDate.setDate(1);
    chartStartDate.setHours(0, 0, 0, 0);

    let chartEndDate = new Date();
    chartEndDate.setHours(23, 59, 59, 999);

    if (startDate && endDate) {
      const parsedStart = new Date(startDate as string);
      const parsedEnd = new Date(endDate as string);

      if (!isNaN(parsedStart.getTime()) && !isNaN(parsedEnd.getTime())) {
        chartStartDate = parsedStart;
        chartEndDate = parsedEnd;
      }
    }

    // Generate array of months between start and end date
    const monthsToQuery: Date[] = [];
    const currentIter = new Date(chartStartDate);
    currentIter.setDate(1); // Normalize to start of month to iterate months safely

    // Loop condition: While start of currentIter month is <= end of chartEndDate month
    // We compare YYYY-MM
    while (true) {
      const currentYearMonth = currentIter.getFullYear() * 12 + currentIter.getMonth();
      const endYearMonth = chartEndDate.getFullYear() * 12 + chartEndDate.getMonth();

      if (currentYearMonth > endYearMonth) break;

      monthsToQuery.push(new Date(currentIter));
      currentIter.setMonth(currentIter.getMonth() + 1);
    }

    const monthlyIncomeData = await Promise.all(
      monthsToQuery.map(async (monthDate) => {
        const startOfMonth = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
        const endOfMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0, 23, 59, 59);

        const incomeResult = await prisma.payment.aggregate({
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

        const pendingResult = await prisma.payment.aggregate({
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
          month: monthDate.toLocaleString('es-ES', { month: 'short', year: '2-digit' }),
          income: incomeResult._sum.paidAmount ?? 0,
          pending: pendingResult._sum.pending ?? 0,
        };
      })
    );

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
      overdueBudgetsCount,
      upcomingBudgetsCount,
      pendingValidationPaymentsCount,
      chartData: {
        labels,
        ingresosSeries,
        pendientesSeries,
      },
    });

  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({ message: "Error al obtener las estadísticas del dashboard" });
  }
};

// Función para obtener actividad reciente
export const getRecentActivity = async (req: AuthenticatedRequest, res: Response) => {
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


    let budgetWhereClause: any = {};
    let paymentWhereClause: any = {};

    if (!isAdminOrManager) {
      budgetWhereClause = { creatorId: userId };
      paymentWhereClause = { budget: { client: { ownerId: userId } } };
      console.log(`[RecentActivity] Applying user-specific filters for role: ${userRole}`);
    } else {
      console.log(`[RecentActivity] No specific filters applied for role: ${userRole}`);
    }

    const recentBudgets = await prisma.budget.findMany({
      take: 3,
      orderBy: { createdAt: 'desc' },
      where: budgetWhereClause,
      include: { client: true, creator: true }
    });

    const recentPayments = await prisma.payment.findMany({
      take: 2,
      orderBy: { createdAt: 'desc' },
      where: paymentWhereClause,
      include: { budget: { include: { client: true } } }
    });

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
        text: `${payment.budget.client?.name || 'Usuario'} registró un pago de ${payment.paidAmount}`,
        date: payment.createdAt
      });
    }

    const sortedActivity = activity.sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 5);

    res.json(sortedActivity);

  } catch (error) {
    console.error("Error fetching recent activity:", error);
    res.status(500).json({ message: "Error al obtener la actividad reciente" });
  }
};
