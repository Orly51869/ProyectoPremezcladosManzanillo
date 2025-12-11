import { Router } from 'express';
import { getAuth0Users, updateAuth0UserRole } from '../controllers/userController';
import { requireAdmin } from '../middleware/requireAdmin';
import { jwtCheck } from '../middleware/jwtCheck';
import { userProvisioningMiddleware } from '../middleware/userProvisioningMiddleware';

const usersRouter = Router();

// Aplicar jwtCheck y userProvisioningMiddleware a todas las rutas de usuario
usersRouter.use(jwtCheck);
usersRouter.use(userProvisioningMiddleware);

// Ruta para obtener todos los usuarios desde Auth0 (solo Admin)
usersRouter.get('/', requireAdmin, getAuth0Users); // Cambiado de /users a / para seguir patrones REST comunes

// Ruta para actualizar el rol de un usuario en Auth0 (solo Admin)
usersRouter.put('/:id/role', requireAdmin, updateAuth0UserRole); // Cambiado de /users/:id/role a /:id/role

export default usersRouter;
