import { Router } from 'express';
import { getUsers, updateUserRole, deleteUser, updateUser } from '../controllers/userController';
import { requireAdmin } from '../middleware/requireAdmin';

const router = Router();

// Apply requireAdmin to all routes in this router
router.use(requireAdmin);

router.get('/', getUsers);
router.put('/:id', updateUser);
router.put('/:id/roles', updateUserRole);
router.delete('/:id', deleteUser);

export default router;
