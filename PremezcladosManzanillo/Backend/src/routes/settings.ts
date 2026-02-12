import { Router } from 'express';
import { getSettings, getSettingByKey, updateSetting, uploadSettingAsset } from '../controllers/settingController';
import { jwtCheck } from '../middleware/jwtCheck';
import { userProvisioningMiddleware } from '../middleware/userProvisioningMiddleware';
import { checkRole } from '../middleware/checkRole';
import { uploadAssets } from '../middleware/uploadMiddleware';

const router = Router();

// Lectura pública para la landing page
router.get('/', getSettings);
router.get('/:key', getSettingByKey);

// Escritura protegida para Administrador y Comercial
router.post('/', jwtCheck, userProvisioningMiddleware, checkRole(['Administrador']), updateSetting);
router.put('/', jwtCheck, userProvisioningMiddleware, checkRole(['Administrador']), updateSetting);

// Subida de archivos (assets)
router.post('/upload', jwtCheck, userProvisioningMiddleware, checkRole(['Administrador']), uploadAssets, uploadSettingAsset);

export default router;
