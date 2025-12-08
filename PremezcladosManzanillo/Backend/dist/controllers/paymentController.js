"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePayment = exports.updatePayment = exports.getPaymentById = exports.getPayments = exports.createPayment = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// Create a new payment
const createPayment = async (req, res) => {
    // `req.body` contendrá los campos de texto del formulario
    // `req.file` contendrá la información del archivo subido por uploadReceipt
    const { budgetId, paidAmount, method, reference, bankFrom, bankTo } = req.body; // receiptUrl ya no se lee del body
    const authUserId = req.auth?.payload.sub;
    const receiptFile = req.file; // Acceder al archivo subido
    if (!authUserId) {
        return res.status(401).json({ error: 'Authenticated user ID not found.' });
    }
    if (!budgetId || !paidAmount || !method) {
        return res.status(400).json({ error: 'Budget ID, paid amount, and method are required to create a payment.' });
    }
    try {
        const budget = await prisma.budget.findUnique({
            where: { id: budgetId },
            include: { payments: true }
        });
        if (!budget) {
            return res.status(404).json({ error: 'Budget not found.' });
        }
        if (budget.status !== 'APPROVED') {
            return res.status(400).json({ error: 'Payments can only be registered for APPROVED budgets.' });
        }
        const currentPaidAmount = budget.payments.reduce((sum, p) => sum + p.paidAmount, 0);
        const newPaidAmount = parseFloat(paidAmount);
        const totalPending = budget.total - currentPaidAmount;
        if (newPaidAmount > totalPending) {
            return res.status(400).json({ error: `Payment amount exceeds remaining pending amount. Pending: ${totalPending}` });
        }
        // Convert local file path to accessible URL
        const receiptPath = receiptFile ? receiptFile.path : undefined;
        // Base URL for serving static files, replacing backslashes for URL compatibility
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const fullReceiptUrl = receiptPath ? `${baseUrl}/${receiptPath.replace(/\\/g, '/')}` : undefined;
        const newPayment = await prisma.payment.create({
            data: {
                budgetId,
                amount: budget.total, // Total budget amount
                paidAmount: newPaidAmount,
                pending: totalPending - newPaidAmount, // Remaining after this payment
                method,
                reference,
                bankFrom,
                bankTo,
                receiptUrl: fullReceiptUrl, // Usar la URL del archivo subido
                status: 'PENDING', // Payment starts as PENDING until validated
                observations: '',
                // validator, validatedAt, proFormaInvoiceUrl, fiscalInvoiceUrl, deliveryOrderUrl will be set on validation
            },
        });
        res.status(201).json(newPayment);
    }
    catch (error) {
        console.error('Error creating payment:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.createPayment = createPayment;
// Get payments (possibly filtered by budgetId, status, etc.)
const getPayments = async (req, res) => {
    const { budgetId, status } = req.query;
    try {
        const payments = await prisma.payment.findMany({
            where: {
                budgetId: budgetId ? String(budgetId) : undefined,
                status: status ? String(status) : undefined,
            },
            include: {
                budget: {
                    include: {
                        client: true, // Include client details with budget
                        creator: true, // Include budget creator
                    },
                },
                validator: true, // Include validator user details
            },
            orderBy: { createdAt: 'desc' },
        });
        res.status(200).json(payments);
    }
    catch (error) {
        console.error('Error fetching payments:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getPayments = getPayments;
// Get a single payment by ID
const getPaymentById = async (req, res) => {
    const { id } = req.params;
    try {
        const payment = await prisma.payment.findUnique({
            where: { id: id },
            include: {
                budget: {
                    include: {
                        client: true,
                        creator: true,
                    },
                },
                validator: true,
            },
        });
        if (payment) {
            res.status(200).json(payment);
        }
        else {
            res.status(404).json({ error: 'Payment not found' });
        }
    }
    catch (error) {
        console.error(`Error fetching payment with ID ${id}:`, error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getPaymentById = getPaymentById;
// Update a payment (e.g., for validation)
const updatePayment = async (req, res) => {
    const { id } = req.params;
    const { status, observations } = req.body; // Document URLs will come from req.files
    const authUserId = req.auth?.payload.sub;
    const roles = req.auth?.payload['https://premezcladomanzanillo.com/roles'] || [];
    if (!authUserId) {
        return res.status(401).json({ error: 'Authenticated user ID not found.' });
    }
    if (!roles.includes('Administrador') && !roles.includes('Contable')) {
        return res.status(403).json({ error: 'Forbidden: Only administrators and accountants can validate payments.' });
    }
    // Type assertion to access files from multer
    const files = req.files;
    const proFormaInvoicePath = files?.proFormaInvoice?.[0]?.path;
    const fiscalInvoicePath = files?.fiscalInvoice?.[0]?.path;
    const deliveryOrderPath = files?.deliveryOrder?.[0]?.path;
    try {
        const existingPayment = await prisma.payment.findUnique({ where: { id: id } });
        if (!existingPayment) {
            return res.status(404).json({ error: 'Payment not found.' });
        }
        // Only allow status change from PENDING
        if (existingPayment.status !== 'PENDING') {
            return res.status(400).json({ error: 'Only PENDING payments can be updated.' });
        }
        const updatedPayment = await prisma.payment.update({
            where: { id: id },
            data: {
                status: status || existingPayment.status,
                observations,
                validator: { connect: { id: authUserId } },
                validatedAt: new Date(),
                // Update URLs only if new files were uploaded
                // These fields are now on the Invoice model
            },
            include: {
                budget: {
                    include: {
                        client: true,
                        creator: true,
                    },
                },
                validator: true,
            },
        });
        if (updatedPayment.status === 'VALIDATED') {
            // 1. Create a notification for the budget creator
            await prisma.notification.create({
                data: {
                    userId: updatedPayment.budget.creatorId,
                    message: `El pago de tu presupuesto "${updatedPayment.budget.title}" ha sido VALIDADO.`,
                },
            });
            // 2. Create a Proforma Invoice
            const invoiceNumber = `INV-${Date.now()}`; // Simple unique number for now
            await prisma.invoice.create({
                data: {
                    invoiceNumber: invoiceNumber,
                    status: 'PROFORMA',
                    paymentId: updatedPayment.id,
                },
            });
        }
        res.status(200).json(updatedPayment);
    }
    catch (error) {
        console.error(`Error updating payment with ID ${id}:`, error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.updatePayment = updatePayment;
// Delete a payment
const deletePayment = async (req, res) => {
    const { id } = req.params;
    const authUserId = req.auth?.payload.sub;
    const roles = req.auth?.payload['https://premezcladomanzanillo.com/roles'] || [];
    if (!authUserId) {
        return res.status(401).json({ error: 'Authenticated user ID not found.' });
    }
    if (!roles.includes('Administrador')) { // Only admin can delete payments for now
        return res.status(403).json({ error: 'Forbidden: Only administrators can delete payments.' });
    }
    try {
        const existingPayment = await prisma.payment.findUnique({ where: { id: id } });
        if (!existingPayment) {
            return res.status(404).json({ error: 'Payment not found.' });
        }
        await prisma.payment.delete({
            where: { id: id },
        });
        res.status(204).send();
    }
    catch (error) {
        console.error(`Error deleting payment with ID ${id}:`, error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.deletePayment = deletePayment;
