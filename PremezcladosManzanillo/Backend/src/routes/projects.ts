import { Router } from 'express';
import { jwtCheck } from '../middleware/jwtCheck';
import { userProvisioningMiddleware } from '../middleware/userProvisioningMiddleware';
import { checkRole } from '../middleware/checkRole';
import {
  getProjects,
  createProject,
  updateProject,
  deleteProject
} from '../controllers/projectController';

const router = Router();

// Rutas públicas (lectura)
router.get('/', getProjects);

// Rutas protegidas (escritura) - Para Comercial y Administrador
router.post('/', jwtCheck, userProvisioningMiddleware, checkRole(["Administrador", "Comercial"]), createProject);
router.put('/:id', jwtCheck, userProvisioningMiddleware, checkRole(["Administrador", "Comercial"]), updateProject);
router.delete('/:id', jwtCheck, userProvisioningMiddleware, checkRole(["Administrador", "Comercial"]), deleteProject);

export default router;
