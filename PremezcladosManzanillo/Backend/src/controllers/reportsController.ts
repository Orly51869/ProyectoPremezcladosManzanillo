import { Request, Response } from 'express';
import prisma from '../lib/prisma';

interface AuthenticatedRequest extends Request {
  dbUser?: {
    id: string;
    email: string;
    name: string | null;
    role: string | null;
  };
}

// 1. REPORTES COMERCIALES
export const getCommercialReports = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userRole = req.dbUser?.role;
    const isRestricted = !['Administrador', 'Comercial', 'Contable'].includes(userRole || '');

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
    }

    let whereClause: any = {};
    if (isRestricted) {
      whereClause = { ownerId: req.dbUser?.id };
    }

    // A. Top Clientes (Filtered by budget date)
    // Correct approach using groupBy to find actual top clients by total amount
    const topBudgetsByClient = await prisma.budget.groupBy({
      by: ['clientId'],
      where: {
        ...dateFilter, // Filter budgets by date
        client: whereClause // Filter by client ownership
      },
      _sum: {
        total: true,
        volume: true
      },
      _count: {
        id: true
      },
      orderBy: {
        _sum: {
          total: 'desc'
        }
      },
      take: 10
    });

    const clientsData = await Promise.all(topBudgetsByClient.map(async (item) => {
      const client = await prisma.client.findUnique({
        where: { id: item.clientId }
      });

      return {
        id: item.clientId,
        name: client?.name || 'Cliente Desconocido',
        budgetCount: item._count.id,
        totalVolume: item._sum.volume || 0,
        totalAmount: item._sum.total || 0
      };
    }));

    // B. Productos más vendidos
    const productSales = await prisma.budgetProduct.groupBy({
      by: ['productId'],
      where: {
        budget: dateFilter // Filter by budget date
      },
      _sum: {
        quantity: true,
        totalPrice: true
      },
      orderBy: {
        _sum: {
          quantity: 'desc'
        }
      },
      take: 5
    });

    const detailedProductSales = await Promise.all(
      productSales.map(async (ps) => {
        const product = await prisma.product.findUnique({ where: { id: ps.productId }, select: { name: true } });
        return {
          name: product?.name || 'Producto Desconocido',
          quantity: ps._sum.quantity || 0,
          total: ps._sum.totalPrice || 0
        };
      })
    );

    res.json({
      topClients: clientsData,
      topProducts: detailedProductSales
    });
  } catch (error) {
    console.error('Error in commercial reports:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// 2. REPORTES CONTABLES
export const getAccountingReports = async (req: AuthenticatedRequest, res: Response) => {
  try {
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
    }

    // Ingresos por categoría de producto
    const validatedPayments = await prisma.payment.findMany({
      where: {
        status: 'VALIDATED',
        ...dateFilter
      },
      include: {
        budget: {
          include: {
            products: {
              include: {
                product: true
              }
            }
          }
        }
      }
    });

    const revenueByProductType: Record<string, number> = {};

    // Distribuir el pago proporcionalmente a los productos del presupuesto
    validatedPayments.forEach(payment => {
      const budget = payment.budget;
      const budgetTotal = budget.total;
      if (budgetTotal === 0) return;

      budget.products.forEach(bp => {
        const type = bp.product.type || 'Otros';
        const proportion = bp.totalPrice / budgetTotal;
        const allocatedRevenue = payment.paidAmount * proportion;

        revenueByProductType[type] = (revenueByProductType[type] || 0) + allocatedRevenue;
      });
    });

    const revenueData = Object.entries(revenueByProductType).map(([name, value]) => ({
      name,
      value
    })).sort((a, b) => b.value - a.value);

    // Análisis de mora (Pagos pendientes por antigüedad)
    const now = new Date();
    const pendingPayments = await prisma.payment.findMany({
      where: { status: 'PENDING' },
      select: { pending: true, createdAt: true }
    });

    const aging = {
      current: 0, // < 7 días
      overdue: 0, // 7-30 días
      critical: 0 // > 30 días
    };

    pendingPayments.forEach(p => {
      const diffDays = Math.floor((now.getTime() - p.createdAt.getTime()) / (1000 * 3600 * 24));
      if (diffDays < 7) aging.current += p.pending;
      else if (diffDays <= 30) aging.overdue += p.pending;
      else aging.critical += p.pending;
    });

    res.json({
      revenueByType: revenueData,
      agingAnalysis: [
        { label: '0-7 días', value: aging.current },
        { label: '7-30 días', value: aging.overdue },
        { label: '30+ días', value: aging.critical }
      ]
    });
  } catch (error) {
    console.error('Error in accounting reports:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// 3. REPORTES OPERATIVOS (Rutas y Entregas)
export const getOperationalReports = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const upcomingDeliveries = await prisma.budget.findMany({
      where: {
        status: 'APPROVED',
        deliveryDate: {
          not: null,
          gte: new Date()
        }
      },
      include: {
        client: true
      },
      orderBy: {
        deliveryDate: 'asc'
      },
      take: 15
    });

    const deliveries = upcomingDeliveries.map(d => ({
      id: d.id,
      date: d.deliveryDate,
      client: d.client.name,
      address: d.address,
      volume: d.volume,
      resistance: d.resistance,
      element: d.element
    }));

    // Agrupar por zona/dirección para "rutas sugeridas"
    const byZone: Record<string, number> = {};
    deliveries.forEach(d => {
      const zone = d.address?.split(',').pop()?.trim() || 'General';
      byZone[zone] = (byZone[zone] || 0) + 1;
    });

    res.json({
      deliveries,
      zones: Object.entries(byZone).map(([name, count]) => ({ name, count }))
    });
  } catch (error) {
    console.error('Error in operational reports:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
