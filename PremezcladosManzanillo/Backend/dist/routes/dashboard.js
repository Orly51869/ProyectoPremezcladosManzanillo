"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dashboardController_1 = require("../controllers/dashboardController");
const jwtCheck_1 = require("../middleware/jwtCheck"); // Asegúrate que la ruta sea correcta
const router = (0, express_1.Router)();
// Proteger todas las rutas de dashboard
router.use(jwtCheck_1.jwtCheck);
router.get('/stats', dashboardController_1.getDashboardStats);
router.get('/recent-activity', dashboardController_1.getRecentActivity);
exports.default = router;
