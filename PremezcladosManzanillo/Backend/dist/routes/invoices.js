"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const invoiceController_1 = require("../controllers/invoiceController");
const jwtCheck_1 = require("../middleware/jwtCheck");
const userProvisioningMiddleware_1 = require("../middleware/userProvisioningMiddleware");
const uploadMiddleware_1 = require("../middleware/uploadMiddleware"); // Assuming this middleware exists or will be created
const router = (0, express_1.Router)();
// All invoice routes require authentication
router.use(jwtCheck_1.jwtCheck, userProvisioningMiddleware_1.userProvisioningMiddleware);
// GET /api/invoices - Get all invoices for the authenticated user (or all if admin/accountant)
router.get('/', invoiceController_1.getInvoices);
// GET /api/invoices/:id - Get a single invoice by ID
router.get('/:id', invoiceController_1.getInvoiceById);
// PATCH /api/invoices/:id - Update an invoice (e.g., upload fiscal invoice or delivery order)
// This route will use a specific multer middleware for file uploads
router.patch('/:id', uploadMiddleware_1.uploadInvoiceDocuments, invoiceController_1.updateInvoice);
exports.default = router;
