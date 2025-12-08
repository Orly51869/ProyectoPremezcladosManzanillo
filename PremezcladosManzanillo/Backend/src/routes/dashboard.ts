import { Router } from 'express';
import { getDashboardStats, getRecentActivity } from '../controllers/dashboardController';
import { jwtCheck } from '../middleware/jwtCheck'; // Asegúrate que la ruta sea correcta

const router = Router();

// Proteger todas las rutas de dashboard
router.use(jwtCheck);

router.get('/stats', getDashboardStats);
router.get('/recent-activity', getRecentActivity);

export default router;
