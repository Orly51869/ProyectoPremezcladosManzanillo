"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prismaMock_1 = require("./helpers/prismaMock");
const vitest_1 = require("vitest");
const supertest_1 = __importDefault(require("supertest"));
vitest_1.vi.mock('../middleware/jwtCheck', () => ({
    jwtCheck: (req, res, next) => {
        req.auth = { payload: { sub: 'auth0|admin-user' } };
        next();
    }
}));
vitest_1.vi.mock('../middleware/userProvisioningMiddleware', () => ({
    userProvisioningMiddleware: (req, res, next) => {
        req.dbUser = { id: 'auth0|admin-user', role: req.headers['test-role'] || 'Administrador' };
        req.auth.payload['https://premezcladomanzanillo.com/roles'] = [req.headers['test-role'] || 'Administrador'];
        next();
    }
}));
const app_1 = __importDefault(require("../app"));
(0, vitest_1.describe)('Audit API - Functional Tests', () => {
    (0, vitest_1.it)('GET /api/audit should be restricted to Administrators', async () => {
        const response = await (0, supertest_1.default)(app_1.default)
            .get('/api/audit')
            .set('test-role', 'Usuario');
        (0, vitest_1.expect)(response.status).toBe(403);
    });
    (0, vitest_1.it)('GET /api/audit should return logs for Administrator', async () => {
        prismaMock_1.prismaMock.auditLog.findMany.mockResolvedValue([
            { id: '1', action: 'CREATE', entity: 'BUDGET', userName: 'Test User', createdAt: new Date() }
        ]);
        const response = await (0, supertest_1.default)(app_1.default)
            .get('/api/audit')
            .set('test-role', 'Administrador');
        (0, vitest_1.expect)(response.status).toBe(200);
        (0, vitest_1.expect)(response.body).toHaveLength(1);
        (0, vitest_1.expect)(response.body[0].action).toBe('CREATE');
    });
});
