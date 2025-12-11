import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Obtener todos los presupuestos, filtrados por rol de usuario
export const getBudgets = async (req: Request, res: Response) => {
  try {
    const auth = req.auth;
    const roles = auth?.payload['https://premezcladomanzanillo.com/roles'] as string[];
    const userId = auth?.payload.sub;

    const includeProducts = {
      products: {
        include: {
              product: true, // Incluir los detalles completos del producto
        },
      },
      client: true, // También incluir detalles del cliente
      processedBy: true, // Incluir detalles del procesador
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
  const authUserId = req.auth?.payload.sub;
  const roles = req.auth?.payload['https://premezcladomanzanillo.com/roles'] as string[] || [];

  if (!authUserId) {
    return res.status(401).json({ error: 'Authenticated user ID not found.' });
  }
  if (!roles.some(role => ['Administrador', 'Contable'].includes(role))) {
    return res.status(403).json({ error: 'Forbidden: Only administrators or accountants can approve budgets.' });
  }

  try {
    const existingBudget = await prisma.budget.findUnique({ where: { id: id } });
    if (!existingBudget) {
      return res.status(404).json({ error: 'Budget not found.' });
    }
    if (existingBudget.status !== 'PENDING') {
      return res.status(400).json({ error: 'Budget is not in PENDING status and cannot be approved.' });
    }

    const approvedBudget = await prisma.budget.update({
      where: { id: id },
      data: {
        status: 'APPROVED',
        processedBy: { connect: { id: authUserId } },
        processedAt: new Date(),
        rejectionReason: null, // Limpiar cualquier razón de rechazo previa
      },
      include: {
        products: { include: { product: true } },
        client: true,
        processedBy: true, // Incluir detalles del procesador
        creator: true, // Incluir creador para obtener creatorId para notificación
      },
    });

    // Crear notificación para el creador del presupuesto
    await prisma.notification.create({
      data: {
        userId: approvedBudget.creatorId,
        message: `Tu presupuesto "${approvedBudget.title}" ha sido APROBADO.`,
      },
    });

    res.status(200).json(approvedBudget);
  } catch (error) {
    console.error(`Error approving budget with ID ${id}:`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Rechazar un presupuesto
export const rejectBudget = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { rejectionReason } = req.body;
  const authUserId = req.auth?.payload.sub;
  const roles = req.auth?.payload['https://premezcladomanzanillo.com/roles'] as string[] || [];

  if (!authUserId) {
    return res.status(401).json({ error: 'Authenticated user ID not found.' });
  }
  if (!roles.includes('Administrador')) {
    return res.status(403).json({ error: 'Forbidden: Only administrators can reject budgets.' });
  }
  if (!rejectionReason || rejectionReason.trim().length === 0) {
    return res.status(400).json({ error: 'Rejection reason is required to reject a budget.' });
  }

  try {
    const existingBudget = await prisma.budget.findUnique({ where: { id: id } });
    if (!existingBudget) {
      return res.status(404).json({ error: 'Budget not found.' });
    }
    if (existingBudget.status !== 'PENDING') {
      return res.status(400).json({ error: 'Budget is not in PENDING status and cannot be rejected.' });
    }

    const rejectedBudget = await prisma.budget.update({
      where: { id: id },
      data: {
        status: 'REJECTED',
        processedBy: { connect: { id: authUserId } },
        processedAt: new Date(),
        rejectionReason: rejectionReason.trim(),
      },
      include: {
        products: { include: { product: true } },
        client: true,
        processedBy: true, // Incluir detalles del procesador
        creator: true, // Incluir creador para obtener creatorId para notificación
      },
    });

    // Crear notificación para el creador del presupuesto
    await prisma.notification.create({
      data: {
        userId: rejectedBudget.creatorId,
        message: `Tu presupuesto "${rejectedBudget.title}" ha sido RECHAZADO. Motivo: ${rejectionReason.trim()}`,
      },
    });

    res.status(200).json(rejectedBudget);
  } catch (error) {
    console.error(`Error rejecting budget with ID ${id}:`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Obtener un presupuesto por su ID
export const getBudgetById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const budget = await prisma.budget.findUnique({
      where: { id: id },
      include: {
        products: {
          include: {
            product: true,
          },
        },
        client: true,
        processedBy: true, // Incluir detalles del procesador
      },
    });

    if (budget) {
      res.status(200).json(budget);
    } else {
      res.status(404).json({ error: 'Budget not found' });
    }
  } catch (error) {
    console.error(`Error fetching budget with ID ${id}:`, error);
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
  const creatorId = req.auth?.payload.sub;

  if (!creatorId) {
    return res.status(401).json({ error: 'Authenticated user ID not found.' });
  }
  if (!clientId) {
    return res.status(400).json({ error: 'Client ID is required.' });
  }
  if (!Array.isArray(products) || products.length === 0) {
    return res.status(400).json({ error: 'At least one product is required.' });
  }

  try {
    validateDeliveryDate(deliveryDate);
    const total = await calculateTotal(products);

    const newBudget = await prisma.budget.create({
      data: {
        title,
        address,
        deliveryDate: deliveryDate ? new Date(deliveryDate) : undefined,
        workType,
        resistance,
        concreteType,
        element,
        observations,
        volume: volume ? parseFloat(volume) : undefined,
        total,
        status: status || 'PENDING',
        creator: { connect: { id: creatorId } },
        client: { connect: { id: clientId } },
        products: {
          create: await Promise.all(
            products.map(async (p: { productId: string; quantity: number }) => {
              const product = await prisma.product.findUnique({ where: { id: p.productId } });
              if (!product) throw new Error(`Product with ID ${p.productId} not found.`);
              return {
                quantity: p.quantity,
                unitPrice: product.price, // Precio histórico
                totalPrice: p.quantity * product.price,
                product: { connect: { id: p.productId } },
              };
            })
          ),
        },
      },
      include: {
        products: { include: { product: true } },
        client: true,
      },
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

  if (!Array.isArray(products) || products.length === 0) {
    return res.status(400).json({ error: 'At least one product is required.' });
  }

  try {
    validateDeliveryDate(deliveryDate);
    const total = await calculateTotal(products);

    const updatedBudget = await prisma.$transaction(async (tx) => {
      // 1. Eliminar productos de presupuesto existentes
      await tx.budgetProduct.deleteMany({ where: { budgetId: id } });

      // 2. Actualizar el presupuesto y crear nuevos productos de presupuesto
      const budget = await tx.budget.update({
        where: { id: id },
        data: {
          title,
          address,
          deliveryDate: deliveryDate ? new Date(deliveryDate) : undefined,
          workType,
          resistance,
          concreteType,
          element,
          observations,
          volume: volume ? parseFloat(volume) : undefined,
          total,
          status,
          client: clientId ? { connect: { id: clientId } } : undefined,
          products: {
            create: await Promise.all(
              products.map(async (p: { productId: string; quantity: number }) => {
                const product = await tx.product.findUnique({ where: { id: p.productId } });
                if (!product) throw new Error(`Product with ID ${p.productId} not found.`);
                return {
                  quantity: p.quantity,
                  unitPrice: product.price,
                  totalPrice: p.quantity * product.price,
                  product: { connect: { id: p.productId } },
                };
              })
            ),
          },
        },
        include: {
          products: { include: { product: true } },
          client: true,
        },
      });
      return budget;
    });

    res.status(200).json(updatedBudget);
  } catch (error: any) {
    console.error(`Error updating budget with ID ${id}:`, error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

// Eliminar un presupuesto
export const deleteBudget = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    // El borrado en cascada de Prisma manejará las entradas de BudgetProduct
    await prisma.budget.delete({
      where: { id: id },
    });
    res.status(204).send();
  } catch (error) {
    console.error(`Error deleting budget with ID ${id}:`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Auxiliar para calcular el precio total
const calculateTotal = async (products: { productId: string; quantity: number }[]): Promise<number> => {
  let total = 0;
  for (const p of products) {
    const product = await prisma.product.findUnique({ where: { id: p.productId } });
    if (!product) throw new Error(`Product with ID ${p.productId} not found during calculation.`);
    total += p.quantity * product.price;
  }
  return total;
};
