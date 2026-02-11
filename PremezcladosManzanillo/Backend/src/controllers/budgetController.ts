import { Request, Response } from 'express';
import { logActivity } from '../utils/auditLogger';
import prisma from '../lib/prisma';
import { sendBudgetApprovedEmail } from '../services/emailService';

const calculateBusinessExpirationDate = (startDate: Date, days: number): Date => {
  let currentDate = new Date(startDate);
  // Reset hours to ensure clean date math
  currentDate.setHours(0, 0, 0, 0);

  // "desde dia siguiente de solicitado": Start counting from TOMORROW
  currentDate.setDate(currentDate.getDate() + 1);

  let businessDaysCount = 0;

  while (businessDaysCount < days) {
    const day = currentDate.getDay();
    // 0 = Sunday. Monday(1) to Saturday(6) are business days.
    if (day !== 0) {
      businessDaysCount++;
    }

    if (businessDaysCount === days) {
      break;
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return currentDate;
};

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
        validUntil: calculateBusinessExpirationDate(new Date(), 7), // Regla: 7 días hábiles
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
      payments: { // Include payments to calculate balance
        select: {
          paidAmount: true,
          status: true
        }
      }
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
  console.log('ApproveBudget: User roles:', roles, 'User ID:', authUserId);

  if (!authUserId) {
    return res.status(401).json({ error: 'Authenticated user ID not found.' });
  }
  if (!roles.some(role => ['Administrador', 'Contable', 'Comercial'].includes(role))) {
    return res.status(403).json({ error: 'Forbidden: Only administrators, accountants, or commercial agents can approve budgets.' });
  }

  try {
    const existingBudget = await prisma.budget.findUnique({ where: { id } });
    if (!existingBudget) return res.status(404).json({ error: 'Budget not found.' });
    if (existingBudget.status !== 'PENDING') {
      if (existingBudget.status === 'APPROVED') {
        return res.status(400).json({ error: 'El presupuesto ya se encuentra APROBADO.' });
      }
      return res.status(400).json({ error: `El presupuesto está en estado ${existingBudget.status}, solo se pueden aprobar presupuestos en estado PENDING.` });
    }

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

    // Send email notification to the client (Async - Fire and Forget)
    if (approvedBudget.client && approvedBudget.client.email && process.env.EMAIL_USER) {
      sendBudgetApprovedEmail(
        approvedBudget.client.email,
        approvedBudget.client.name,
        approvedBudget.title,
        approvedBudget.id
      ).catch(err => console.error('Error sending approval email (background):', err));
    }

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
  if (!roles.some(r => ['Administrador', 'Contable', 'Comercial'].includes(r))) return res.status(403).json({ error: 'Forbidden: Only privileged users can reject budgets.' });
  if (!rejectionReason || rejectionReason.trim().length === 0) return res.status(400).json({ error: 'Rejection reason is required.' });

  try {
    const existingBudget = await prisma.budget.findUnique({ where: { id } });
    if (!existingBudget) return res.status(404).json({ error: 'Budget not found.' });
    if (existingBudget.status !== 'PENDING') {
      if (existingBudget.status === 'APPROVED') {
        return res.status(400).json({ error: 'El presupuesto ya se encuentra APROBADO.' });
      }
      return res.status(400).json({ error: `El presupuesto está en estado ${existingBudget.status}, solo se pueden rechazar presupuestos en estado PENDING.` });
    }

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
  const authUserId = req.auth?.payload.sub;
  const userEmail = (req as any).dbUser?.email || (req.auth?.payload.email as string);
  const roles = req.auth?.payload['https://premezcladomanzanillo.com/roles'] as string[] || [];

  if (!authUserId) {
    return res.status(401).json({ error: 'Authenticated user ID not found.' });
  }

  try {
    const budget = await prisma.budget.findUnique({
      where: { id },
      include: {
        products: { include: { product: true } },
        client: true,
        processedBy: true,
      },
    });

    if (!budget) {
      return res.status(404).json({ error: 'Budget not found' });
    }

    // Security Check
    const isPrivileged = roles.some(r => ['Administrador', 'Contable', 'Comercial'].includes(r));
    const isOwner = budget.creatorId === authUserId;
    // Check if the user is the CREATOR of the client associated with this budget
    const isClientOwner = budget.client && budget.client.ownerId === authUserId;

    if (!isPrivileged && !isOwner && !isClientOwner) {
      return res.status(403).json({ error: 'Forbidden: You are not authorized to view this budget.' });
    }

    res.status(200).json(budget);
  } catch (error) {
    console.error(`Error fetching budget ${id}:`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const safeParseDate = (dateStr: string): Date => {
  let d = new Date(dateStr);
  if (isNaN(d.getTime())) {
    d = new Date(dateStr + 'T00:00:00');
  }
  if (isNaN(d.getTime())) {
    throw new Error(`Fecha inválida: ${dateStr}`);
  }
  return d;
};

// Función auxiliar para validar la deliveryDate
const validateDeliveryDate = (deliveryDate: string | undefined) => {
  if (deliveryDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const delivery = safeParseDate(deliveryDate);

    // Validar Domingo (0)
    // Usamos getUTCDay() para consistencia si viene en UTC
    if (delivery.getUTCDay() === 0) {
      throw new Error('No se pueden programar entregas o colocaciones los días Domingo.');
    }

    // Validar que sea fecha futura (al menos mañana)
    // Normalizamos 'today' y 'delivery' para comparar solo fecha (sin hora)
    // Pero como 'delivery' puede tener hora o UTC, simplificamos:
    // delivery debe ser >= today + 24h? O simplemente > today (mismo día no permitido si ya pasó hora de corte? O simplemente no hoy)

    // El requerimiento original era: "al menos un día después de la fecha actual"
    if (delivery < today) { // Si es fecha pasada
      throw new Error('La fecha de entrega no puede ser en el pasado.');
    }

    // Si es HOY, dependiendo de la hora o regla de negocio. 
    // Ajuste anterior: deliveryLocal <= today.
    // Repliquemos la lógica de comparación segura:
    const deliveryMidnight = new Date(delivery);
    deliveryMidnight.setHours(0, 0, 0, 0);

    if (deliveryMidnight.getTime() <= today.getTime()) {
      throw new Error('La fecha de entrega debe ser al menos un día después de la fecha actual.');
    }
  }
};

// Crear un nuevo presupuesto
export const createBudget = async (req: Request, res: Response) => {
  const { title, clientId, status, products, address, deliveryDate, workType, resistance, concreteType, element, observations, volume, validUntil } = req.body;
  const creatorId = req.auth?.payload.sub as string;
  const userName = (req as any).dbUser?.name || (req.auth?.payload as any)?.name || 'Usuario';
  const roles = req.auth?.payload['https://premezcladomanzanillo.com/roles'] as string[] || [];

  if (!creatorId) return res.status(401).json({ error: 'Authenticated user ID not found.' });
  if (!clientId) return res.status(400).json({ error: 'Client ID is required.' });
  if (!Array.isArray(products) || products.length === 0) return res.status(400).json({ error: 'At least one product is required.' });
  if (!observations || observations.trim() === '') return res.status(400).json({ error: 'Observations are required.' });

  try {
    validateDeliveryDate(deliveryDate);
    const isPrivileged = roles.some(r => ['Administrador', 'Contable', 'Comercial'].includes(r));
    const total = await calculateTotal(products, isPrivileged, deliveryDate);

    const newBudget = await prisma.budget.create({
      data: {
        title, address, deliveryDate: deliveryDate ? safeParseDate(deliveryDate) : undefined,
        validUntil: validUntil ? safeParseDate(validUntil) : calculateBusinessExpirationDate(new Date(), 7),
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
                where: { productId: p.productId, date: { lte: deliveryDate ? safeParseDate(deliveryDate) : new Date() } },
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
  const { title, clientId, status, products, address, deliveryDate, workType, resistance, concreteType, element, observations, volume, validUntil } = req.body;
  const authUserId = req.auth?.payload.sub as string;
  const userName = (req as any).dbUser?.name || (req.auth?.payload as any)?.name || 'Usuario';
  const roles = req.auth?.payload['https://premezcladomanzanillo.com/roles'] as string[] || [];

  if (!Array.isArray(products) || products.length === 0) return res.status(400).json({ error: 'At least one product is required.' });

  try {
    const existingBudget = await prisma.budget.findUnique({
      where: { id },
      include: { creator: { select: { email: true } } } // Fetch creator email
    });
    if (!existingBudget) return res.status(404).json({ error: 'Budget not found.' });

    const isPrivileged = roles.some(r => ['Administrador', 'Comercial'].includes(r));

    const userEmail = (req as any).dbUser?.email || (req.auth?.payload.email as string);
    // Check ownership by ID OR Email (robustness)
    const isOwner = existingBudget.creatorId === authUserId || (userEmail && existingBudget.creator?.email === userEmail);

    console.log('[DEBUG-UPDATE] Budget ID:', id);
    console.log('[DEBUG-UPDATE] Auth User ID:', authUserId);
    console.log('[DEBUG-UPDATE] User Email:', userEmail);
    console.log('[DEBUG-UPDATE] Budget Creator ID:', existingBudget.creatorId);
    console.log('[DEBUG-UPDATE] Budget Creator Email:', existingBudget.creator?.email);
    console.log('[DEBUG-UPDATE] Is Owner:', isOwner);
    console.log('[DEBUG-UPDATE] Roles:', roles);
    console.log('[DEBUG-UPDATE] Status:', existingBudget.status);

    // Logic:
    // 1. If PENDING -> Owner OR Privileged can edit.
    // 2. If APPROVED (or others) -> ONLY Privileged can edit.

    if (existingBudget.status === 'PENDING') {
      // If it's pending, allow owner or privileged users (Admin/Comercial/Contable technically, but primarily Admin/Comercial)
      // Note: 'Contable' usually doesn't edit budgets, but we'll stick to the requested logic:
      // "PENDING can be modified by user... if APPROVED only by Admin and Comercial"

      // Let's assume 'Contable' is also privileged generally, but based on specific request: 
      // "PENDING -> Users (owners) can modify"

      if (!isOwner && !isPrivileged && !roles.includes('Contable')) {
        return res.status(403).json({ error: 'Forbidden: You can only edit your own pending budgets.' });
      }
    } else {
      // Status is NOT PENDING (e.g. APPROVED, REJECTED, PAID)
      // "si ya estan aprobados solo puede modificarlos el administrador y el comercial"
      if (!isPrivileged) {
        return res.status(403).json({ error: 'Forbidden: Only Administrators or Commercial agents can edit approved/finalized budgets.' });
      }
    }

    // Recalculate 'isPrivileged' for pricing logic (include Contable if they exist in the broader privileged check usually, but for price override maybe keep strict)
    // The previous code had: includes('Administrador', 'Contable', 'Comercial')
    const hasPriceOverridePermission = roles.some(r => ['Administrador', 'Contable', 'Comercial'].includes(r));

    validateDeliveryDate(deliveryDate);
    const total = await calculateTotal(products, hasPriceOverridePermission, deliveryDate);

    const updatedBudget = await prisma.$transaction(async (tx) => {
      await tx.budgetProduct.deleteMany({ where: { budgetId: id } });
      return await tx.budget.update({
        where: { id },
        data: {
          title, address, deliveryDate: deliveryDate ? safeParseDate(deliveryDate) : undefined,
          validUntil: validUntil ? safeParseDate(validUntil) : undefined,
          workType, resistance, concreteType, element, observations,
          volume: volume ? parseFloat(volume) : undefined,
          total, status,
          client: clientId ? { connect: { id: clientId } } : undefined,
          products: {
            create: await Promise.all(products.map(async (p: any) => {
              const resolvedPrice = await (async () => {
                if (hasPriceOverridePermission && p.unitPrice != null) return Number(p.unitPrice);
                const pr = await (tx as any).productPrice.findFirst({
                  where: { productId: p.productId, date: { lte: deliveryDate ? safeParseDate(deliveryDate) : new Date() } },
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
      // Delete related records manually to avoiding foreign key constraints issues if cascade is not fully set at DB level
      // 1. Delete notifications related to this budget (if any logic links them directly, though currently they link to User).
      //    We skip direct notification deletion as they are user-centric, but we must delete payments.

      // 2. Delete related Invoice if exists (via Payment) - Find payments first
      const payments = await tx.payment.findMany({ where: { budgetId: id } });
      for (const payment of payments) {
        await tx.invoice.deleteMany({ where: { paymentId: payment.id } });
      }

      // 3. Delete payments
      await tx.payment.deleteMany({ where: { budgetId: id } });

      // 4. Delete budget items (already present)
      await tx.budgetProduct.deleteMany({ where: { budgetId: id } });

      // 5. Delete the budget
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
  isPrivileged: boolean, // if true, allows manual unitPrice override
  deliveryDate?: string
): Promise<number> => {
  let total = 0;

  for (const p of products) {
    let price = 0;

    // 1. Check if Privileged user override
    if (isPrivileged && p.unitPrice != null) {
      price = Number(p.unitPrice);
    } else {
      // 2. Check Historical Price
      const pr = await (prisma as any).productPrice.findFirst({
        where: { productId: p.productId, date: { lte: deliveryDate ? safeParseDate(deliveryDate) : new Date() } },
        orderBy: { date: 'desc' }
      });

      if (pr) {
        price = pr.price;
      } else {
        // 3. Fallback to Current Price
        const prod = await prisma.product.findUnique({ where: { id: p.productId } });
        if (!prod) throw new Error(`Product ${p.productId} not found.`);
        price = prod.price;
      }
    }

    total += p.quantity * price;
  }
  return total;
};
