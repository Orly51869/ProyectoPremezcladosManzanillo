import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get all invoices for the authenticated user (or all if admin)
export const getInvoices = async (req: Request, res: Response) => {
  const authUserId = req.auth?.payload.sub;
  const roles = req.auth?.payload['https://premezcladomanzanillo.com/roles'] as string[] || [];

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
    } else {
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
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get a single invoice by ID
export const getInvoiceById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const authUserId = req.auth?.payload.sub;
  const roles = req.auth?.payload['https://premezcladomanzanillo.com/roles'] as string[] || [];

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
  } catch (error) {
    console.error(`Error fetching invoice with ID ${id}:`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update an invoice (e.g., upload fiscal invoice or delivery order)
export const updateInvoice = async (req: Request, res: Response) => {
  const { id } = req.params;
  const roles = req.auth?.payload['https://premezcladomanzanillo.com/roles'] as string[] || [];

  // Only Admin or Accountant can update invoices (upload documents)
  if (!roles.includes('Administrador') && !roles.includes('Contable')) {
    return res.status(403).json({ error: 'Forbidden: Solo los administradores y contables pueden actualizar facturas.' });
  }

  // Type assertion to access files from multer
  const files = req.files as { 
    fiscalInvoice?: Express.Multer.File[], 
    deliveryOrder?: Express.Multer.File[] 
  };

  const fiscalInvoiceFile = files?.fiscalInvoice?.[0];
  const deliveryOrderFile = files?.deliveryOrder?.[0];

  // Base URL for serving static files
  const baseUrl = `${req.protocol}://${req.get('host')}`;

  // Extract relative path from absolute path (e.g., "uploads/invoices/filename.pdf")
  const getRelativePath = (filePath: string): string => {
    const normalizedPath = filePath.replace(/\\/g, '/');
    const uploadsIndex = normalizedPath.indexOf('uploads/');
    if (uploadsIndex !== -1) {
      return normalizedPath.substring(uploadsIndex);
    }
    return normalizedPath;
  };

  const fullFiscalInvoiceUrl = fiscalInvoiceFile ? `${baseUrl}/${getRelativePath(fiscalInvoiceFile.path)}` : undefined;
  const fullDeliveryOrderUrl = deliveryOrderFile ? `${baseUrl}/${getRelativePath(deliveryOrderFile.path)}` : undefined;

  try {
    const existingInvoice = await prisma.invoice.findUnique({ where: { id: id } });
    if (!existingInvoice) {
      return res.status(404).json({ error: 'Factura no encontrada.' });
    }

    // Validation: For Contable role, both documents are required
    const isContable = roles.includes('Contable');
    
    // Check if we're uploading new files or if existing ones are already present
    const willHaveFiscalInvoice = fullFiscalInvoiceUrl || existingInvoice.fiscalInvoiceUrl;
    const willHaveDeliveryOrder = fullDeliveryOrderUrl || existingInvoice.deliveryOrderUrl;
    
    if (isContable && (!willHaveFiscalInvoice || !willHaveDeliveryOrder)) {
      return res.status(400).json({ 
        error: 'Para el rol Contable, tanto la Factura Fiscal como la Orden de Entrega son obligatorias. Por favor, sube ambos documentos.' 
      });
    }

    // If both documents are uploaded, automatically change status to FISCAL_ISSUED
    const hasBothDocuments = (fullFiscalInvoiceUrl || existingInvoice.fiscalInvoiceUrl) && 
                             (fullDeliveryOrderUrl || existingInvoice.deliveryOrderUrl);
    
    const newStatus = hasBothDocuments ? 'FISCAL_ISSUED' : existingInvoice.status;

    const updatedInvoice = await prisma.invoice.update({
      where: { id: id },
      data: {
        status: newStatus,
        fiscalInvoiceUrl: fullFiscalInvoiceUrl || existingInvoice.fiscalInvoiceUrl,
        deliveryOrderUrl: fullDeliveryOrderUrl || existingInvoice.deliveryOrderUrl,
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
    });

    // Create notification when documents are uploaded
    if (fullFiscalInvoiceUrl || fullDeliveryOrderUrl) {
      const documentsUploaded = [];
      if (fullFiscalInvoiceUrl) documentsUploaded.push('Factura Fiscal');
      if (fullDeliveryOrderUrl) documentsUploaded.push('Orden de Entrega');
      
      await prisma.notification.create({
        data: {
          userId: updatedInvoice.payment.budget.creatorId,
          message: `La factura ${updatedInvoice.invoiceNumber} ha sido actualizada con ${documentsUploaded.join(' y ')}.`, 
        },
      });
    }

    res.status(200).json(updatedInvoice);
  } catch (error) {
    console.error(`Error updating invoice with ID ${id}:`, error);
    res.status(500).json({ error: 'Error interno del servidor al actualizar la factura.' });
  }
};
