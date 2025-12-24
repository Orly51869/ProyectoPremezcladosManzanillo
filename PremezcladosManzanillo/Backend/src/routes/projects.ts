import { Router } from 'express';
import { jwtCheck } from '../middleware/jwtCheck';
import { userProvisioningMiddleware } from '../middleware/userProvisioningMiddleware';
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
router.post('/', jwtCheck, userProvisioningMiddleware, createProject);
router.put('/:id', jwtCheck, userProvisioningMiddleware, updateProject);
router.delete('/:id', jwtCheck, userProvisioningMiddleware, deleteProject);

export default router;
