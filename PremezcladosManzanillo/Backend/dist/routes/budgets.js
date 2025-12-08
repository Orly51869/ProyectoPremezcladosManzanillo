"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const budgetController_1 = require("../controllers/budgetController");
const router = (0, express_1.Router)();
router.get('/', budgetController_1.getBudgets);
router.get('/:id', budgetController_1.getBudgetById);
router.post('/', budgetController_1.createBudget);
router.put('/:id', budgetController_1.updateBudget);
router.delete('/:id', budgetController_1.deleteBudget);
router.post('/:id/approve', budgetController_1.approveBudget); // New route
router.post('/:id/reject', budgetController_1.rejectBudget); // New route
exports.default = router;
