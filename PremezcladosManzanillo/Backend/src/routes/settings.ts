import { Router } from 'express';
import { getSettings, getSettingByKey, updateSetting, uploadSettingAsset } from '../controllers/settingController';
import { jwtCheck } from '../middleware/jwtCheck';
import { userProvisioningMiddleware } from '../middleware/userProvisioningMiddleware';
import { uploadAssets } from '../middleware/uploadMiddleware';

const router = Router();

// Lectura pública para la landing page
router.get('/', getSettings);
router.get('/:key', getSettingByKey);

// Escritura protegida para Administrador y Comercial
router.post('/', jwtCheck, userProvisioningMiddleware, updateSetting);
router.put('/', jwtCheck, userProvisioningMiddleware, updateSetting);

// Subida de archivos (assets)
router.post('/upload', jwtCheck, userProvisioningMiddleware, uploadAssets, uploadSettingAsset);

export default router;
