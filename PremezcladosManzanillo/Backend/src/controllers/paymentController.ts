import { Request, Response } from 'express';
import { logActivity } from '../utils/auditLogger';
import prisma from '../lib/prisma';

// Crear un nuevo pago
export const createPayment = async (req: Request, res: Response) => {
  const { budgetId, paidAmount, method, reference, bankFrom, bankTo, currency, exchangeRate, amountInCurrency, igtfAmount } = req.body;
  const authUserId = req.auth?.payload.sub as string;
  const userName = (req.auth?.payload as any)?.name || 'Usuario';
  const receiptFile = req.file as Express.Multer.File | undefined;

  if (!authUserId) return res.status(401).json({ error: 'No se encontró el ID del usuario autenticado.' });
  if (!budgetId || !method) return res.status(400).json({ error: 'Faltan campos requeridos.' });

  try {
    const budget = await prisma.budget.findUnique({
      where: { id: budgetId },
      include: { payments: true }
    });

    if (!budget) return res.status(404).json({ error: 'Presupuesto no encontrado.' });
    if (budget.status !== 'APPROVED') return res.status(400).json({ error: 'Solo se pueden registrar pagos para presupuestos APROBADOS.' });

    const currentPaidAmount = budget.payments.reduce((sum, p) => sum + p.paidAmount, 0);
    
    // Calcular el monto en USD (que es la base de la contabilidad interna)
    let newAmountInUSD = parseFloat(paidAmount);
    
    // Si se proporciona moneda y tasa, validamos/calculamos
    if (currency === 'VES' && exchangeRate && amountInCurrency) {
      // Si recibimos Bs, el equivalente en USD es montoBs / tasa
      newAmountInUSD = parseFloat(amountInCurrency) / parseFloat(exchangeRate);
    }

    const totalPending = budget.total - currentPaidAmount;

    // Permitir un pequeño margen de error por decimales (0.01)
    if (newAmountInUSD > (totalPending + 0.01)) {
      return res.status(400).json({ error: `Excede el saldo pendiente. Pendiente: ${totalPending.toFixed(2)} USD` });
    }

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const fullReceiptUrl = receiptFile ? `${baseUrl}/${receiptFile.path.replace(/\\/g, '/')}` : undefined;
    
    const newPayment = await prisma.payment.create({
      data: {
        budgetId, 
        amount: budget.total, 
        paidAmount: newAmountInUSD, 
        pending: Math.max(0, totalPending - newAmountInUSD),
        method, 
        reference, 
        bankFrom, 
        bankTo, 
        receiptUrl: fullReceiptUrl, 
        status: 'PENDING',
        currency: currency || 'USD',
        exchangeRate: exchangeRate ? parseFloat(exchangeRate) : undefined,
        amountInCurrency: amountInCurrency ? parseFloat(amountInCurrency) : undefined,
        igtfAmount: igtfAmount ? parseFloat(igtfAmount) : 0
      },
    });

    await logActivity({
      userId: authUserId,
      userName,
      action: 'CREATE',
      entity: 'PAYMENT',
      entityId: newPayment.id,
      details: `Pago registrado (${currency || 'USD'}): ${budget.title} por ${amountInCurrency || paidAmount}`
    });

    res.status(201).json(newPayment);
  } catch (error) {
    console.error('Error creating payment:', error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

// Obtener pagos
export const getPayments = async (req: Request, res: Response) => {
    const { budgetId, status } = req.query;
    try {
        const payments = await prisma.payment.findMany({
            where: {
                budgetId: budgetId ? String(budgetId) : undefined,
                status: status ? String(status) : undefined,
            },
            include: {
                budget: { include: { client: true, creator: true } },
                validator: true,
            },
            orderBy: { createdAt: 'desc' },
        });
        res.json(payments);
    } catch (error) {
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

// Obtener un pago por su ID
export const getPaymentById = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const payment = await prisma.payment.findUnique({
            where: { id },
            include: { budget: { include: { client: true, creator: true } }, validator: true },
        });
        if (payment) res.json(payment);
        else res.status(404).json({ error: 'Pago no encontrado.' });
    } catch (error) {
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

// Actualizar un pago (validación)
export const updatePayment = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, observations } = req.body;
  const authUserId = req.auth?.payload.sub as string;
  const userName = (req.auth?.payload as any)?.name || 'Administrador';
  const roles = req.auth?.payload['https://premezcladomanzanillo.com/roles'] as string[] || [];

  if (!authUserId) return res.status(401).json({ error: 'No autenticado.' });
  if (!roles.includes('Administrador') && !roles.includes('Contable')) return res.status(403).json({ error: 'Acceso denegado.' });

  try {
    const existingPayment = await prisma.payment.findUnique({ where: { id }, include: { budget: true } });
    if (!existingPayment) return res.status(404).json({ error: 'Pago no encontrado.' });
    if (existingPayment.status !== 'PENDING') return res.status(400).json({ error: 'Solo pagos pendientes.' });

    const updatedPayment = await prisma.payment.update({
      where: { id },
      data: {
        status: status || existingPayment.status,
        observations,
        validator: { connect: { id: authUserId } },
        validatedAt: new Date(),
      },
      include: { budget: { include: { client: true, creator: true } }, validator: true },
    });

    if (updatedPayment.status === 'VALIDATED') {
        await prisma.notification.create({
            data: {
                userId: updatedPayment.budget.creatorId,
                message: `El pago de tu presupuesto "${updatedPayment.budget.title}" ha sido VALIDADO.`,
            },
        });
        await prisma.invoice.create({
            data: {
                invoiceNumber: `INV-${Date.now()}`,
                status: 'PROFORMA',
                paymentId: updatedPayment.id,
            },
        });
    }

    await logActivity({
      userId: authUserId,
      userName,
      action: status === 'VALIDATED' ? 'VALIDATE' : 'REJECT',
      entity: 'PAYMENT',
      entityId: id,
      details: `Pago ${status}: ${updatedPayment.budget.title} por ${updatedPayment.paidAmount}`
    });

    res.json(updatedPayment);
  } catch (error) {
    console.error('Error updating payment:', error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

// Eliminar un pago
export const deletePayment = async (req: Request, res: Response) => {
  const { id } = req.params;
  const authUserId = req.auth?.payload.sub as string;
  const userName = (req.auth?.payload as any)?.name || 'Usuario';
  const roles = req.auth?.payload['https://premezcladomanzanillo.com/roles'] as string[] || [];

  if (!authUserId) return res.status(401).json({ error: 'No autenticado.' });
  if (!roles.includes('Administrador')) return res.status(403).json({ error: 'Solo administradores.' });

  try {
    const payment = await prisma.payment.findUnique({ where: { id }, include: { budget: true } });
    if (!payment) return res.status(404).json({ error: 'Pago no encontrado.' });

    await prisma.payment.delete({ where: { id } });

    await logActivity({
      userId: authUserId,
      userName,
      action: 'DELETE',
      entity: 'PAYMENT',
      entityId: id,
      details: `Pago eliminado del presupuesto: ${payment.budget.title}`
    });

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};