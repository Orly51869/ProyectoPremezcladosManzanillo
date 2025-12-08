"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateInvoice = exports.getInvoiceById = exports.getInvoices = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// Get all invoices for the authenticated user (or all if admin)
const getInvoices = async (req, res) => {
    const authUserId = req.auth?.payload.sub;
    const roles = req.auth?.payload['https://premezcladomanzanillo.com/roles'] || [];
    if (!authUserId) {
        return res.status(401).json({ error: 'Authenticated user ID not found.' });
    }
    try {
        let invoices;
        if (roles.includes('Administrador') || roles.includes('Contable')) {
            // Admins and Accountants can see all invoices
            invoices = await prisma.invoice.findMany({
                include: {
                    payment: {
                        include: {
                            budget: {
                                include: {
                                    creator: true, // Include budget creator for filtering
                                    client: true,
                                },
                            },
                        },
                    },
                },
                orderBy: { proformaGeneratedAt: 'desc' },
            });
        }
        else {
            // Regular users only see invoices related to their budgets
            invoices = await prisma.invoice.findMany({
                where: {
                    payment: {
                        budget: {
                            creatorId: authUserId,
                        },
                    },
                },
                include: {
                    payment: {
                        include: {
                            budget: {
                                include: {
                                    creator: true,
                                    client: true,
                                },
                            },
                        },
                    },
                },
                orderBy: { proformaGeneratedAt: 'desc' },
            });
        }
        res.status(200).json(invoices);
    }
    catch (error) {
        console.error('Error fetching invoices:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getInvoices = getInvoices;
// Get a single invoice by ID
const getInvoiceById = async (req, res) => {
    const { id } = req.params;
    const authUserId = req.auth?.payload.sub;
    const roles = req.auth?.payload['https://premezcladomanzanillo.com/roles'] || [];
    if (!authUserId) {
        return res.status(401).json({ error: 'Authenticated user ID not found.' });
    }
    try {
        const invoice = await prisma.invoice.findUnique({
            where: { id: id },
            include: {
                payment: {
                    include: {
                        budget: {
                            include: {
                                creator: true,
                                client: true,
                            },
                        },
                    },
                },
            },
        });
        if (!invoice) {
            return res.status(404).json({ error: 'Invoice not found.' });
        }
        // Authorization check
        const isOwner = invoice.payment.budget.creatorId === authUserId;
        const isAdminOrAccountant = roles.includes('Administrador') || roles.includes('Contable');
        if (!isOwner && !isAdminOrAccountant) {
            return res.status(403).json({ error: 'Forbidden: You do not have permission to view this invoice.' });
        }
        res.status(200).json(invoice);
    }
    catch (error) {
        console.error(`Error fetching invoice with ID ${id}:`, error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getInvoiceById = getInvoiceById;
// Update an invoice (e.g., upload fiscal invoice or delivery order)
const updateInvoice = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body; // Can update status to FISCAL_ISSUED
    const roles = req.auth?.payload['https://premezcladomanzanillo.com/roles'] || [];
    // Only Admin or Accountant can update invoices (upload documents)
    if (!roles.includes('Administrador') && !roles.includes('Contable')) {
        return res.status(403).json({ error: 'Forbidden: Only administrators and accountants can update invoices.' });
    }
    // Type assertion to access files from multer
    const files = req.files;
    const fiscalInvoicePath = files?.fiscalInvoice?.[0]?.path;
    const deliveryOrderPath = files?.deliveryOrder?.[0]?.path;
    // Base URL for serving static files
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const fullFiscalInvoiceUrl = fiscalInvoicePath ? `${baseUrl}/${fiscalInvoicePath.replace(/\\/g, '/')}` : undefined;
    const fullDeliveryOrderUrl = deliveryOrderPath ? `${baseUrl}/${deliveryOrderPath.replace(/\\/g, '/')}` : undefined;
    try {
        const existingInvoice = await prisma.invoice.findUnique({ where: { id: id } });
        if (!existingInvoice) {
            return res.status(404).json({ error: 'Invoice not found.' });
        }
        const updatedInvoice = await prisma.invoice.update({
            where: { id: id },
            data: {
                status: status || existingInvoice.status,
                fiscalInvoiceUrl: fullFiscalInvoiceUrl || existingInvoice.fiscalInvoiceUrl,
                deliveryOrderUrl: fullDeliveryOrderUrl || existingInvoice.deliveryOrderUrl,
            },
            include: {
                payment: {
                    include: {
                        budget: {
                            include: {
                                creator: true,
                            },
                        },
                    },
                },
            },
        });
        // If fiscal invoice or delivery order are uploaded, create notifications
        if (fullFiscalInvoiceUrl || fullDeliveryOrderUrl) {
            await prisma.notification.create({
                data: {
                    userId: updatedInvoice.payment.budget.creatorId,
                    message: `La factura ${updatedInvoice.invoiceNumber} ha sido actualizada con la Factura Fiscal y/o Orden de Entrega.`,
                },
            });
        }
        res.status(200).json(updatedInvoice);
    }
    catch (error) {
        console.error(`Error updating invoice with ID ${id}:`, error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.updateInvoice = updateInvoice;
