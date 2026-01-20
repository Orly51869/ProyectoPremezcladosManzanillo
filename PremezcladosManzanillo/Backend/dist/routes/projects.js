"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const jwtCheck_1 = require("../middleware/jwtCheck");
const userProvisioningMiddleware_1 = require("../middleware/userProvisioningMiddleware");
const projectController_1 = require("../controllers/projectController");
const router = (0, express_1.Router)();
// Rutas públicas (lectura)
router.get('/', projectController_1.getProjects);
// Rutas protegidas (escritura) - Para Comercial y Administrador
router.post('/', jwtCheck_1.jwtCheck, userProvisioningMiddleware_1.userProvisioningMiddleware, projectController_1.createProject);
router.put('/:id', jwtCheck_1.jwtCheck, userProvisioningMiddleware_1.userProvisioningMiddleware, projectController_1.updateProject);
router.delete('/:id', jwtCheck_1.jwtCheck, userProvisioningMiddleware_1.userProvisioningMiddleware, projectController_1.deleteProject);
exports.default = router;
