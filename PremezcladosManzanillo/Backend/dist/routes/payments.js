"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const paymentController_1 = require("../controllers/paymentController");
const uploadMiddleware_1 = require("../middleware/uploadMiddleware"); // Import uploadReceipt
const router = (0, express_1.Router)();
router.post('/', uploadMiddleware_1.uploadReceipt, paymentController_1.createPayment); // Apply uploadReceipt middleware
router.get('/', paymentController_1.getPayments);
router.get('/:id', paymentController_1.getPaymentById);
router.put('/:id', uploadMiddleware_1.uploadPaymentDocuments, paymentController_1.updatePayment); // Add middleware here
router.delete('/:id', paymentController_1.deletePayment);
exports.default = router;
