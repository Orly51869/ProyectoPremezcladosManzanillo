import { Router } from 'express';
import { getExchangeRates } from '../controllers/currencyController';

const router = Router();

// Ruta pública o protegida según necesidad. La hacemos pública para que el frontend pueda consultarla fácil.
// Si se requiere autenticación, añade el middleware requireAuth.
router.get('/rates', getExchangeRates);

export default router;
