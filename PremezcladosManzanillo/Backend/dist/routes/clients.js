"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const clientController_1 = require("../controllers/clientController");
const router = (0, express_1.Router)();
// La ruta base /api/clients se maneja en index.ts
router.get('/', clientController_1.getClientsByOwner);
router.post('/', clientController_1.createClient);
router.put('/:id', clientController_1.updateClient); // Añadir ruta PUT para actualizar un cliente
router.delete('/:id', clientController_1.deleteClient); // Añadir ruta DELETE para eliminar un cliente
exports.default = router;
