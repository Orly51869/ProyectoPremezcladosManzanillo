import express from 'express';
import { getCommercialReports, getAccountingReports, getOperationalReports } from '../controllers/reportsController';
import { jwtCheck } from '../middleware/jwtCheck';
import { userProvisioningMiddleware } from '../middleware/userProvisioningMiddleware';

const router = express.Router();

router.use(jwtCheck);
router.use(userProvisioningMiddleware);

router.get('/commercial', getCommercialReports);
router.get('/accounting', getAccountingReports);
router.get('/operational', getOperationalReports);

export default router;
