"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const settingController_1 = require("../controllers/settingController");
const jwtCheck_1 = require("../middleware/jwtCheck");
const userProvisioningMiddleware_1 = require("../middleware/userProvisioningMiddleware");
const uploadMiddleware_1 = require("../middleware/uploadMiddleware");
const router = (0, express_1.Router)();
// Lectura pública para la landing page
router.get('/', settingController_1.getSettings);
router.get('/:key', settingController_1.getSettingByKey);
// Escritura protegida para Administrador y Comercial
router.post('/', jwtCheck_1.jwtCheck, userProvisioningMiddleware_1.userProvisioningMiddleware, settingController_1.updateSetting);
router.put('/', jwtCheck_1.jwtCheck, userProvisioningMiddleware_1.userProvisioningMiddleware, settingController_1.updateSetting);
// Subida de archivos (assets)
router.post('/upload', jwtCheck_1.jwtCheck, userProvisioningMiddleware_1.userProvisioningMiddleware, uploadMiddleware_1.uploadAssets, settingController_1.uploadSettingAsset);
exports.default = router;
