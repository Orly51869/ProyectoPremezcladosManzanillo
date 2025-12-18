import { Router } from 'express';
import { getSettings, getSettingByKey, updateSetting } from '../controllers/settingController';
import { jwtCheck } from '../middleware/jwtCheck';
import { userProvisioningMiddleware } from '../middleware/userProvisioningMiddleware';

const router = Router();

// Lectura pública para la landing page
router.get('/', getSettings);
router.get('/:key', getSettingByKey);

// Escritura protegida para Administrador y Comercial (la lógica de rol está en el controller)
router.post('/', jwtCheck, userProvisioningMiddleware, updateSetting);
router.put('/', jwtCheck, userProvisioningMiddleware, updateSetting);

export default router;
