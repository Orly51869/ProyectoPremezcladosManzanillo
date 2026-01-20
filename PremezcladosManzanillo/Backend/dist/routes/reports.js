"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const reportsController_1 = require("../controllers/reportsController");
const jwtCheck_1 = require("../middleware/jwtCheck");
const userProvisioningMiddleware_1 = require("../middleware/userProvisioningMiddleware");
const router = express_1.default.Router();
router.use(jwtCheck_1.jwtCheck);
router.use(userProvisioningMiddleware_1.userProvisioningMiddleware);
router.get('/commercial', reportsController_1.getCommercialReports);
router.get('/accounting', reportsController_1.getAccountingReports);
router.get('/operational', reportsController_1.getOperationalReports);
exports.default = router;
