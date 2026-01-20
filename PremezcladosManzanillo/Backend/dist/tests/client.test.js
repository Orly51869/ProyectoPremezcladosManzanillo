"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prismaMock_1 = require("./helpers/prismaMock");
const vitest_1 = require("vitest");
const supertest_1 = __importDefault(require("supertest"));
// Mockeamos los middlewares
vitest_1.vi.mock('../middleware/jwtCheck', () => ({
    jwtCheck: (req, res, next) => {
        req.auth = { payload: { sub: 'auth0|test-user-1' } };
        next();
    }
}));
vitest_1.vi.mock('../middleware/userProvisioningMiddleware', () => ({
    userProvisioningMiddleware: (req, res, next) => {
        req.dbUser = { id: 'auth0|test-user-1', role: req.headers['test-role'] || 'Usuario' };
        req.auth.payload['https://premezcladomanzanillo.com/roles'] = [req.headers['test-role'] || 'Usuario'];
        next();
    }
}));
const app_1 = __importDefault(require("../app"));
(0, vitest_1.describe)('Clients API - Functional Tests', () => {
    (0, vitest_1.it)('GET /api/clients should return all clients for Admin', async () => {
        prismaMock_1.prismaMock.client.findMany.mockResolvedValue([
            { id: 'c1', name: 'Cliente A', ownerId: 'auth0|test-user-1' },
            { id: 'c2', name: 'Cliente B', ownerId: 'other-user' }
        ]);
        const response = await (0, supertest_1.default)(app_1.default)
            .get('/api/clients')
            .set('test-role', 'Administrador');
        (0, vitest_1.expect)(response.status).toBe(200);
        (0, vitest_1.expect)(response.body).toHaveLength(2);
    });
    (0, vitest_1.it)('GET /api/clients should return only owned clients for Usuario', async () => {
        prismaMock_1.prismaMock.client.findMany.mockResolvedValue([
            { id: 'c1', name: 'Cliente A', ownerId: 'auth0|test-user-1' }
        ]);
        const response = await (0, supertest_1.default)(app_1.default)
            .get('/api/clients')
            .set('test-role', 'Usuario');
        (0, vitest_1.expect)(response.status).toBe(200);
        (0, vitest_1.expect)(prismaMock_1.prismaMock.client.findMany).toHaveBeenCalledWith(vitest_1.expect.objectContaining({
            where: { ownerId: 'auth0|test-user-1' }
        }));
    });
    (0, vitest_1.it)('DELETE /api/clients/:id should fail for owner if client has budgets', async () => {
        const mockClientWithBudgets = {
            id: 'c1',
            ownerId: 'auth0|test-user-1',
            _count: { budgets: 5 }
        };
        prismaMock_1.prismaMock.client.findUnique.mockResolvedValue(mockClientWithBudgets);
        const response = await (0, supertest_1.default)(app_1.default)
            .delete('/api/clients/c1')
            .set('test-role', 'Usuario');
        (0, vitest_1.expect)(response.status).toBe(403);
        (0, vitest_1.expect)(response.body.error).toContain('tiene presupuestos asociados');
    });
    (0, vitest_1.it)('DELETE /api/clients/:id should allow Admin to delete even with budgets', async () => {
        const mockClientWithBudgets = {
            id: 'c1',
            name: 'Cliente Test',
            ownerId: 'auth0|test-user-1',
            budgets: [], // Simplificamos para el test
            _count: { budgets: 1 }
        };
        prismaMock_1.prismaMock.client.findUnique.mockResolvedValue(mockClientWithBudgets);
        // Simulamos éxito de la transacción
        prismaMock_1.prismaMock.$transaction.mockResolvedValue({});
        const response = await (0, supertest_1.default)(app_1.default)
            .delete('/api/clients/c1')
            .set('test-role', 'Administrador');
        (0, vitest_1.expect)(response.status).toBe(204);
    });
});
