/********************************/
/**    invoiceController.ts    **/
/********************************/
// Archivo que permite definir controladores para la gestión de facturas

// Importaciones
import { Request, Response } from 'express';
import { logActivity } from '../utils/auditLogger';
import prisma from '../lib/prisma';

// Obtener todas las facturas para el usuario autenticado (o todas si es admin)
export const getInvoices = async (req: Request, res: Response) => {
  const authUserId = req.auth?.payload.sub;
  const roles = req.auth?.payload['https://premezcladomanzanillo.com/roles'] as string[] || [];

  if (!authUserId) {
    return res.status(401).json({ error: 'Authenticated user ID not found.' });
  }

  // Buscar facturas
  try {
    let invoices;
    if (roles.includes('Administrador') || roles.includes('Contable')) {
      // Administradores and Contables pueden ver todas las facturas
      invoices = await prisma.invoice.findMany({
        include: {
          payment: {
            include: {
              budget: {
                include: {
                  creator: true, // Incluir el creador del presupuesto para filtrado
                  client: true,
                  products: {
                    include: {
                      product: true,
                    }
                  }
                },
              },
            },
          },
        },
        orderBy: { proformaGeneratedAt: 'desc' },
      });
    } else {
      // Usuarios pueden ver solo las facturas relacionadas con sus presupuestos
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
                  products: {
                    include: {
                      product: true,
                    }
                  }
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

// Obtener una factura por su ID
export const getInvoiceById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const authUserId = req.auth?.payload.sub;
  const roles = req.auth?.payload['https://premezcladomanzanillo.com/roles'] as string[] || [];

  if (!authUserId) {
    return res.status(401).json({ error: 'Authenticated user ID not found.' });
  }

  // Buscar factura
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

    // Comprobación de autorización
    const userEmail = (req as any).dbUser?.email || (req.auth?.payload.email as string);
    const isOwner = invoice.payment.budget.creatorId === authUserId;
    // Check if user created the client associated with the budget of this invoice
    const isClientOwner = invoice.payment.budget.client && invoice.payment.budget.client.ownerId === authUserId;
    const isAdminOrAccountant = roles.includes('Administrador') || roles.includes('Contable');

    if (!isOwner && !isClientOwner && !isAdminOrAccountant) {
      return res.status(403).json({ error: 'Forbidden: You do not have permission to view this invoice.' });
    }

    res.status(200).json(invoice);
  } catch (error) {
    console.error(`Error fetching invoice with ID ${id}:`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Actualizar una factura (p. ej., subir factura fiscal u orden de entrega)
export const updateInvoice = async (req: Request, res: Response) => {
  const { id } = req.params;
  const roles = req.auth?.payload['https://premezcladomanzanillo.com/roles'] as string[] || [];

  // Admin, Contable pueden actualizar facturas (subir documentos)
  if (!roles.includes('Administrador') && !roles.includes('Contable')) {
    return res.status(403).json({ error: 'Forbidden: Solo personal autorizado (Admin/Contable) puede actualizar documentos.' });
  }

  // Aserción de tipos para acceder a archivos desde multer
  const files = req.files as {
    fiscalInvoice?: Express.Multer.File[],
    deliveryOrder?: Express.Multer.File[]
  };

  const fiscalInvoiceFile = files?.fiscalInvoice?.[0];
  const deliveryOrderFile = files?.deliveryOrder?.[0];

  // URL base para servir archivos estáticos
  const baseUrl = `${req.protocol}://${req.get('host')}`;

  // Extraer ruta relativa desde la ruta absoluta (p. ej., "uploads/invoices/archivo.pdf")
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

  // Buscar factura
  try {
    const existingInvoice = await prisma.invoice.findUnique({ where: { id: id } });
    if (!existingInvoice) {
      return res.status(404).json({ error: 'Factura no encontrada.' });
    }

    // Validación: para el rol Contable, ambos documentos son requeridos
    const isContable = roles.includes('Contable');

    // Verificar si estamos subiendo nuevos archivos o si ya existen en la factura
    const willHaveFiscalInvoice = fullFiscalInvoiceUrl || existingInvoice.fiscalInvoiceUrl;
    const willHaveDeliveryOrder = fullDeliveryOrderUrl || existingInvoice.deliveryOrderUrl;

    if (isContable && (!willHaveFiscalInvoice || !willHaveDeliveryOrder)) {
      return res.status(400).json({
        error: 'Para el rol Contable, tanto la Factura Fiscal como la Orden de Entrega son obligatorias. Por favor, sube ambos documentos.'
      });
    }

    // Si ambos documentos están subidos, cambiar automáticamente el estado a FISCAL_ISSUED
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
                products: {
                  include: {
                    product: true,
                  }
                }
              },
            },
          },
        },
      },
    });

    // Crear notificación cuando se suben documentos
    if (fullFiscalInvoiceUrl || fullDeliveryOrderUrl) {
      const documentsUploaded = [];
      if (fullFiscalInvoiceUrl) documentsUploaded.push('Factura Fiscal');
      if (fullDeliveryOrderUrl) documentsUploaded.push('Orden de Entrega');

      // Crear notificación
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

// Eliminar una factura (Solo Administradores)
export const deleteInvoice = async (req: Request, res: Response) => {
  const { id } = req.params;
  const roles = req.auth?.payload['https://premezcladomanzanillo.com/roles'] as string[] || [];
  const authUserId = req.auth?.payload.sub as string;
  const userName = (req as any).dbUser?.name || (req.auth?.payload as any)?.name || 'Administrador';

  if (!roles.includes('Administrador') && !roles.includes('Contable')) {
    return res.status(403).json({ error: 'Acceso denegado: Solo administradores y contables pueden eliminar facturas.' });
  }

  // Buscar factura
  try {
    const invoice = await prisma.invoice.findUnique({ where: { id } });
    if (!invoice) return res.status(404).json({ error: 'Factura no encontrada.' });

    await prisma.invoice.delete({ where: { id } });

    await logActivity({
      userId: authUserId,
      userName,
      action: 'DELETE',
      entity: 'INVOICE',
      entityId: id,
      details: `FACTURA ELIMINADA: Número ${invoice.invoiceNumber}.`
    });

    res.status(204).send();
    // Devolver notificación    
  } catch (error) {
    console.error(`Error deleting invoice ${id}:`, error);
    res.status(500).json({ error: 'Error interno al intentar eliminar la factura.' });
    // Devolver error
  }
};
