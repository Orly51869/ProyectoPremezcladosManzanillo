import { Router } from 'express';
import { getUsers, updateUserRole } from '../controllers/userController';
import { requireAdmin } from '../middleware/requireAdmin';

const router = Router();

// Apply requireAdmin to all routes in this router
router.use(requireAdmin);

router.get('/', getUsers);
router.put('/:id/roles', updateUserRole);

export default router;
