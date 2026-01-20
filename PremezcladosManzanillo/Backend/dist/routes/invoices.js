"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const invoiceController_1 = require("../controllers/invoiceController");
const jwtCheck_1 = require("../middleware/jwtCheck");
const userProvisioningMiddleware_1 = require("../middleware/userProvisioningMiddleware");
const uploadMiddleware_1 = require("../middleware/uploadMiddleware"); // Assuming this middleware exists or will be created
const router = (0, express_1.Router)();
// Todas las rutas de facturas requieren autenticación
router.use(jwtCheck_1.jwtCheck, userProvisioningMiddleware_1.userProvisioningMiddleware);
// GET /api/invoices - Obtener todas las facturas para el usuario autenticado (o todas si es admin/contable)
router.get('/', invoiceController_1.getInvoices);
// GET /api/invoices/:id - Obtener una factura por su ID
router.get('/:id', invoiceController_1.getInvoiceById);
// PATCH /api/invoices/:id - Actualizar una factura (p. ej., subir factura fiscal u orden de entrega)
// Esta ruta usará un middleware multer específico para la carga de archivos
router.patch('/:id', uploadMiddleware_1.uploadInvoiceDocuments, invoiceController_1.updateInvoice);
// DELETE /api/invoices/:id - Eliminar una factura (Solo Administradores)
router.delete('/:id', invoiceController_1.deleteInvoice);
exports.default = router;
