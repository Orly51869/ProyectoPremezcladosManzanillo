"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const clientController_1 = require("../controllers/clientController");
const router = (0, express_1.Router)();
// The base path /api/clients is handled in index.ts
router.get('/', clientController_1.getClientsByOwner);
router.post('/', clientController_1.createClient);
router.put('/:id', clientController_1.updateClient); // Add PUT route for updating a client
router.delete('/:id', clientController_1.deleteClient); // Add DELETE route for deleting a client
exports.default = router;
