import { Request, Response } from 'express';
import { logActivity } from '../utils/auditLogger';
import prisma from '../lib/prisma';

// Inicializar un presupuesto (esqueleto)
export const initBudget = async (req: Request, res: Response) => {
  const { title, clientId, address } = req.body;
  const creatorId = req.auth?.payload.sub;
  const userName = (req as any).dbUser?.name || (req.auth?.payload as any)?.name || 'Usuario';

  if (!creatorId) {
    return res.status(401).json({ error: 'Authenticated user ID not found.' });
  }
  if (!clientId) {
    return res.status(400).json({ error: 'Client ID is required.' });
  }
  if (!title) {
    return res.status(400).json({ error: 'Title is required.' });
  }

  try {
    const newBudget = await prisma.budget.create({
      data: {
        title,
        address,
        total: 0,
        status: 'PENDING',
        creator: { connect: { id: creatorId } },
        client: { connect: { id: clientId } },
      },
      include: {
        client: true,
      },
    });

    await logActivity({
      userId: creatorId,
      userName,
      action: 'INIT',
      entity: 'BUDGET',
      entityId: newBudget.id,
      details: `Presupuesto inicializado: ${title}`
    });

    res.status(201).json(newBudget);
  } catch (error: any) {
    console.error('Error initializing budget:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

// Obtener todos los presupuestos, filtrados por rol de usuario
export const getBudgets = async (req: Request, res: Response) => {
  try {
    const auth = req.auth;
    const roles = auth?.payload['https://premezcladomanzanillo.com/roles'] as string[];
    const userId = auth?.payload.sub;

    const includeProducts = {
      products: {
        include: {
              product: true,
        },
      },
      client: true,
      processedBy: true,
    };

    let budgets;

    if (roles && roles.includes('Usuario')) {
      budgets = await prisma.budget.findMany({
        where: { creatorId: userId },
        include: includeProducts,
        orderBy: { createdAt: 'desc' },
      });
    } else {
      budgets = await prisma.budget.findMany({
        include: includeProducts,
        orderBy: { createdAt: 'desc' },
      });
    }

    res.status(200).json(budgets);
  } catch (error) {
    console.error('Error fetching budgets:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Aprobar un presupuesto
export const approveBudget = async (req: Request, res: Response) => {
  const { id } = req.params;
  const authUserId = req.auth?.payload.sub as string;
  const userName = (req as any).dbUser?.name || (req.auth?.payload as any)?.name || 'Administrador';
  const roles = req.auth?.payload['https://premezcladomanzanillo.com/roles'] as string[] || [];

  if (!authUserId) {
    return res.status(401).json({ error: 'Authenticated user ID not found.' });
  }
  if (!roles.some(role => ['Administrador', 'Contable'].includes(role))) {
    return res.status(403).json({ error: 'Forbidden: Only administrators or accountants can approve budgets.' });
  }

  try {
    const existingBudget = await prisma.budget.findUnique({ where: { id } });
    if (!existingBudget) return res.status(404).json({ error: 'Budget not found.' });
    if (existingBudget.status !== 'PENDING') return res.status(400).json({ error: 'Budget is not in PENDING status.' });

    const approvedBudget = await prisma.budget.update({
      where: { id },
      data: {
        status: 'APPROVED',
        processedById: authUserId,
        processedAt: new Date(),
        rejectionReason: null,
      },
      include: {
        products: { include: { product: true } },
        client: true,
        processedBy: true,
        creator: true,
      },
    });

    await prisma.notification.create({
      data: {
        userId: approvedBudget.creatorId,
        message: `Tu presupuesto "${approvedBudget.title}" ha sido APROBADO.`,
      },
    });

    await logActivity({
      userId: authUserId,
      userName,
      action: 'APPROVE',
      entity: 'BUDGET',
      entityId: id,
      details: `Presupuesto aprobado: ${approvedBudget.title}`
    });

    res.json(approvedBudget);
  } catch (error) {
    console.error(`Error approving budget ${id}:`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Rechazar un presupuesto
export const rejectBudget = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { rejectionReason } = req.body;
  const authUserId = req.auth?.payload.sub as string;
  const userName = (req as any).dbUser?.name || (req.auth?.payload as any)?.name || 'Administrador';
  const roles = req.auth?.payload['https://premezcladomanzanillo.com/roles'] as string[] || [];

  if (!authUserId) return res.status(401).json({ error: 'Authenticated user ID not found.' });
  if (!roles.includes('Administrador')) return res.status(403).json({ error: 'Forbidden: Only administrators can reject budgets.' });
  if (!rejectionReason || rejectionReason.trim().length === 0) return res.status(400).json({ error: 'Rejection reason is required.' });

  try {
    const existingBudget = await prisma.budget.findUnique({ where: { id } });
    if (!existingBudget) return res.status(404).json({ error: 'Budget not found.' });
    if (existingBudget.status !== 'PENDING') return res.status(400).json({ error: 'Budget is not in PENDING status.' });

    const rejectedBudget = await prisma.budget.update({
      where: { id },
      data: {
        status: 'REJECTED',
        rejectionReason: rejectionReason.trim(),
        processedById: authUserId,
        processedAt: new Date(),
      },
      include: {
        products: { include: { product: true } },
        client: true,
        processedBy: true,
        creator: true,
      },
    });

    await prisma.notification.create({
      data: {
        userId: rejectedBudget.creatorId,
        message: `Tu presupuesto "${rejectedBudget.title}" ha sido RECHAZADO. Motivo: ${rejectionReason.trim()}`,
      },
    });

    await logActivity({
      userId: authUserId,
      userName,
      action: 'REJECT',
      entity: 'BUDGET',
      entityId: id,
      details: `Presupuesto rechazado: ${rejectedBudget.title}. Razón: ${rejectionReason}`
    });

    res.json(rejectedBudget);
  } catch (error) {
    console.error(`Error rejecting budget ${id}:`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Obtener un presupuesto por su ID
export const getBudgetById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const budget = await prisma.budget.findUnique({
      where: { id },
      include: {
        products: { include: { product: true } },
        client: true,
        processedBy: true,
      },
    });
    if (budget) res.status(200).json(budget);
    else res.status(404).json({ error: 'Budget not found' });
  } catch (error) {
    console.error(`Error fetching budget ${id}:`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Función auxiliar para validar la deliveryDate
const validateDeliveryDate = (deliveryDate: string | undefined) => {
  if (deliveryDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const delivery = new Date(deliveryDate);
    delivery.setHours(0, 0, 0, 0);
    if (delivery <= today) {
      throw new Error('Delivery date must be at least one day after the current date.');
    }
  }
};

// Crear un nuevo presupuesto
export const createBudget = async (req: Request, res: Response) => {
  const { title, clientId, status, products, address, deliveryDate, workType, resistance, concreteType, element, observations, volume } = req.body;
  const creatorId = req.auth?.payload.sub as string;
  const userName = (req as any).dbUser?.name || (req.auth?.payload as any)?.name || 'Usuario';
  const roles = req.auth?.payload['https://premezcladomanzanillo.com/roles'] as string[] || [];

  if (!creatorId) return res.status(401).json({ error: 'Authenticated user ID not found.' });
  if (!clientId) return res.status(400).json({ error: 'Client ID is required.' });
  if (!Array.isArray(products) || products.length === 0) return res.status(400).json({ error: 'At least one product is required.' });
  if (!observations || observations.trim() === '') return res.status(400).json({ error: 'Observations are required.' });

  try {
    validateDeliveryDate(deliveryDate);
    const isPrivileged = roles.some(r => ['Administrador', 'Contable'].includes(r));
    const total = await calculateTotal(products, isPrivileged, deliveryDate);

    const newBudget = await prisma.budget.create({
      data: {
        title, address, deliveryDate: deliveryDate ? new Date(deliveryDate) : undefined,
        workType, resistance, concreteType, element, observations,
        volume: volume ? parseFloat(volume) : undefined,
        total, status: status || 'PENDING',
        creator: { connect: { id: creatorId } },
        client: { connect: { id: clientId } },
        products: {
          create: await Promise.all(products.map(async (p: any) => {
              const resolvedPrice = await (async () => {
                if (isPrivileged && p.unitPrice != null) return Number(p.unitPrice);
                const priceRecord = await (prisma as any).productPrice.findFirst({
                  where: { productId: p.productId, date: { lte: deliveryDate ? new Date(deliveryDate) : new Date() } },
                  orderBy: { date: 'desc' }
                });
                if (priceRecord) return priceRecord.price;
                const product = await prisma.product.findUnique({ where: { id: p.productId } });
                if (!product) throw new Error(`Product ${p.productId} not found.`);
                return product.price;
              })();
              return { quantity: p.quantity, unitPrice: resolvedPrice, totalPrice: p.quantity * resolvedPrice, product: { connect: { id: p.productId } } };
          })),
        },
      },
      include: { products: { include: { product: true } }, client: true },
    });

    await logActivity({
      userId: creatorId,
      userName,
      action: 'CREATE',
      entity: 'BUDGET',
      entityId: newBudget.id,
      details: `Presupuesto creado: ${newBudget.title}`
    });

    res.status(201).json(newBudget);
  } catch (error: any) {
    console.error('Error creating budget:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

// Actualizar un presupuesto existente
export const updateBudget = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, clientId, status, products, address, deliveryDate, workType, resistance, concreteType, element, observations, volume } = req.body;
  const authUserId = req.auth?.payload.sub as string;
  const userName = (req.auth?.payload as any)?.name || 'Usuario';
  const roles = req.auth?.payload['https://premezcladomanzanillo.com/roles'] as string[] || [];

  if (!Array.isArray(products) || products.length === 0) return res.status(400).json({ error: 'At least one product is required.' });

  try {
    const isPrivileged = roles.some(r => ['Administrador', 'Contable'].includes(r));
    validateDeliveryDate(deliveryDate);
    const total = await calculateTotal(products, isPrivileged, deliveryDate);

    const updatedBudget = await prisma.$transaction(async (tx) => {
      await tx.budgetProduct.deleteMany({ where: { budgetId: id } });
      return await tx.budget.update({
        where: { id },
        data: {
          title, address, deliveryDate: deliveryDate ? new Date(deliveryDate) : undefined,
          workType, resistance, concreteType, element, observations,
          volume: volume ? parseFloat(volume) : undefined,
          total, status,
          client: clientId ? { connect: { id: clientId } } : undefined,
          products: {
            create: await Promise.all(products.map(async (p: any) => {
                const resolvedPrice = await (async () => {
                  if (isPrivileged && p.unitPrice != null) return Number(p.unitPrice);
                  const pr = await (tx as any).productPrice.findFirst({
                      where: { productId: p.productId, date: { lte: deliveryDate ? new Date(deliveryDate) : new Date() } },
                      orderBy: { date: 'desc' }
                  });
                  if (pr) return pr.price;
                  const prod = await tx.product.findUnique({ where: { id: p.productId } });
                  if (!prod) throw new Error(`Product ${p.productId} not found.`);
                  return prod.price;
                })();
                return { quantity: p.quantity, unitPrice: resolvedPrice, totalPrice: p.quantity * resolvedPrice, product: { connect: { id: p.productId } } };
            })),
          },
        },
        include: { products: { include: { product: true } }, client: true },
      });
    });

    await logActivity({
      userId: authUserId,
      userName,
      action: 'UPDATE',
      entity: 'BUDGET',
      entityId: id,
      details: `Presupuesto actualizado: ${updatedBudget.title}`
    });

    res.status(200).json(updatedBudget);
  } catch (error: any) {
    console.error(`Error updating budget ${id}:`, error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

// Eliminar un presupuesto
export const deleteBudget = async (req: Request, res: Response) => {
  const { id } = req.params;
  const authUserId = req.auth?.payload.sub as string;
  const userName = (req as any).dbUser?.name || (req.auth?.payload as any)?.name || 'Usuario';
  try {
    const budgetToDelete = await prisma.budget.findUnique({ where: { id } });
    if (!budgetToDelete) return res.status(404).json({ error: 'Budget not found' });

    await prisma.$transaction(async (tx) => {
        await tx.budgetProduct.deleteMany({ where: { budgetId: id } });
        await tx.budget.delete({ where: { id } });
    });

    await logActivity({
      userId: authUserId,
      userName,
      action: 'DELETE',
      entity: 'BUDGET',
      entityId: id,
      details: `Presupuesto eliminado: ${budgetToDelete.title}`
    });

    res.status(204).send();
  } catch (error) {
    console.error(`Error deleting budget ${id}:`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Auxiliar para calcular el precio total
const calculateTotal = async (
  products: { productId: string; quantity: number; unitPrice?: number }[],
  isPrivileged: boolean,
  deliveryDate?: string
): Promise<number> => {
  let total = 0;
  for (const p of products) {
    if (isPrivileged && p.unitPrice != null) {
      total += p.quantity * Number(p.unitPrice);
      continue;
    }
    const pr = await (prisma as any).productPrice.findFirst({
      where: { productId: p.productId, date: { lte: deliveryDate ? new Date(deliveryDate) : new Date() } },
      orderBy: { date: 'desc' }
    });
    if (pr) {
      total += p.quantity * pr.price;
      continue;
    }
    const prod = await prisma.product.findUnique({ where: { id: p.productId } });
    if (!prod) throw new Error(`Product ${p.productId} not found.`);
    total += p.quantity * prod.price;
  }
  return total;
};
