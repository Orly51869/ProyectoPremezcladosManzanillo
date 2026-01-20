"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const currencyController_1 = require("../controllers/currencyController");
const router = (0, express_1.Router)();
// Ruta pública o protegida según necesidad. La hacemos pública para que el frontend pueda consultarla fácil.
// Si se requiere autenticación, añade el middleware requireAuth.
router.get('/rates', currencyController_1.getExchangeRates);
exports.default = router;
