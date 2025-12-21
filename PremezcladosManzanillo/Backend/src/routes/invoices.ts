import { Router } from 'express';
import {
  getInvoices,
  getInvoiceById,
  updateInvoice,
  deleteInvoice,
} from '../controllers/invoiceController';
import { jwtCheck } from '../middleware/jwtCheck';
import { userProvisioningMiddleware } from '../middleware/userProvisioningMiddleware';
import { uploadInvoiceDocuments } from '../middleware/uploadMiddleware'; // Assuming this middleware exists or will be created

const router = Router();

// Todas las rutas de facturas requieren autenticación
router.use(jwtCheck, userProvisioningMiddleware);

// GET /api/invoices - Obtener todas las facturas para el usuario autenticado (o todas si es admin/contable)
router.get('/', getInvoices);

// GET /api/invoices/:id - Obtener una factura por su ID
router.get('/:id', getInvoiceById);

// PATCH /api/invoices/:id - Actualizar una factura (p. ej., subir factura fiscal u orden de entrega)
// Esta ruta usará un middleware multer específico para la carga de archivos
router.patch('/:id', uploadInvoiceDocuments, updateInvoice);

// DELETE /api/invoices/:id - Eliminar una factura (Solo Administradores)
router.delete('/:id', deleteInvoice);

export default router;
