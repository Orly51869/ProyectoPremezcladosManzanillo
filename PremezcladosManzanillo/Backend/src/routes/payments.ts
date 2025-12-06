import { Router } from 'express';
import {
  createPayment,
  getPayments,
  getPaymentById,
  updatePayment,
  deletePayment,
} from '../controllers/paymentController';
import { uploadPaymentDocuments, uploadReceipt } from '../middleware/uploadMiddleware'; // Import uploadReceipt

const router = Router();

router.post('/', uploadReceipt, createPayment); // Apply uploadReceipt middleware
router.get('/', getPayments);
router.get('/:id', getPaymentById);
router.put('/:id', uploadPaymentDocuments, updatePayment); // Add middleware here
router.delete('/:id', deletePayment);

export default router;
