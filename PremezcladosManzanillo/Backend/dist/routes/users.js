"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_1 = require("../controllers/userController");
const requireAdmin_1 = require("../middleware/requireAdmin");
const router = (0, express_1.Router)();
// Apply requireAdmin to all routes in this router
router.use(requireAdmin_1.requireAdmin);
router.get('/', userController_1.getUsers);
router.put('/:id', userController_1.updateUser);
router.put('/:id/roles', userController_1.updateUserRole);
router.delete('/:id', userController_1.deleteUser);
exports.default = router;
