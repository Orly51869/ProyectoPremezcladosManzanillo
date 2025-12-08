import { Router } from 'express';
import {
  getInvoices,
  getInvoiceById,
  updateInvoice,
} from '../controllers/invoiceController';
import { jwtCheck } from '../middleware/jwtCheck';
import { userProvisioningMiddleware } from '../middleware/userProvisioningMiddleware';
import { uploadInvoiceDocuments } from '../middleware/uploadMiddleware'; // Assuming this middleware exists or will be created

const router = Router();

// All invoice routes require authentication
router.use(jwtCheck, userProvisioningMiddleware);

// GET /api/invoices - Get all invoices for the authenticated user (or all if admin/accountant)
router.get('/', getInvoices);

// GET /api/invoices/:id - Get a single invoice by ID
router.get('/:id', getInvoiceById);

// PATCH /api/invoices/:id - Update an invoice (e.g., upload fiscal invoice or delivery order)
// This route will use a specific multer middleware for file uploads
router.patch('/:id', uploadInvoiceDocuments, updateInvoice);

export default router;
