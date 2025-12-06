import { Router } from 'express';
import {
  getBudgets,
  getBudgetById,
  createBudget,
  updateBudget,
  deleteBudget,
  approveBudget, // Import new function
  rejectBudget, // Import new function
} from '../controllers/budgetController';

const router = Router();

router.get('/', getBudgets);
router.get('/:id', getBudgetById);
router.post('/', createBudget);
router.put('/:id', updateBudget);
router.delete('/:id', deleteBudget);
router.post('/:id/approve', approveBudget); // New route
router.post('/:id/reject', rejectBudget);   // New route

export default router;
