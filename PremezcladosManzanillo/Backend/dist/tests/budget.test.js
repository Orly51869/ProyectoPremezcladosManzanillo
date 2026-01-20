"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prismaMock_1 = require("./helpers/prismaMock");
const vitest_1 = require("vitest");
const supertest_1 = __importDefault(require("supertest"));
// IMPORTANTE: Mockeamos los middlewares ANTES de importar app
vitest_1.vi.mock('../middleware/jwtCheck', () => ({
    jwtCheck: (req, res, next) => {
        // Simulamos un usuario autenticado por defecto
        req.auth = { payload: { sub: 'auth0|test-user-123' } };
        next();
    }
}));
vitest_1.vi.mock('../middleware/userProvisioningMiddleware', () => ({
    userProvisioningMiddleware: (req, res, next) => {
        req.dbUser = { id: 'auth0|test-user-123', role: req.headers['test-role'] || 'Usuario' };
        // Inyectamos el payload para el controlador que busca roles ahí
        req.auth.payload['https://premezcladomanzanillo.com/roles'] = [req.headers['test-role'] || 'Usuario'];
        next();
    }
}));
const app_1 = __importDefault(require("../app"));
(0, vitest_1.describe)('Budgets API - Business Logic Tests', () => {
    (0, vitest_1.it)('GET /api/budgets should filter budgets by user owner (Role: Usuario)', async () => {
        const mockBudgets = [
            { id: 'b1', title: 'Mi Presupuesto', creatorId: 'auth0|test-user-123' }
        ];
        prismaMock_1.prismaMock.budget.findMany.mockResolvedValue(mockBudgets);
        const response = await (0, supertest_1.default)(app_1.default)
            .get('/api/budgets')
            .set('test-role', 'Usuario');
        (0, vitest_1.expect)(response.status).toBe(200);
        (0, vitest_1.expect)(response.body).toHaveLength(1);
        // Verificamos que Prisma recibió el filtro de creatorId
        (0, vitest_1.expect)(prismaMock_1.prismaMock.budget.findMany).toHaveBeenCalledWith(vitest_1.expect.objectContaining({
            where: { creatorId: 'auth0|test-user-123' }
        }));
    });
    (0, vitest_1.it)('GET /api/budgets should show all budgets for Administrator', async () => {
        prismaMock_1.prismaMock.budget.findMany.mockResolvedValue([]);
        await (0, supertest_1.default)(app_1.default)
            .get('/api/budgets')
            .set('test-role', 'Administrador');
        // Verificamos que para Admin NO se envió el filtro de creatorId (ve todos)
        const callArgs = prismaMock_1.prismaMock.budget.findMany.mock.calls.find((call) => !call[0].where);
        (0, vitest_1.expect)(callArgs).toBeDefined();
    });
    (0, vitest_1.it)('POST /api/budgets should calculate total correctly', async () => {
        const mockProduct = { id: 'p1', price: 100 };
        const budgetData = {
            title: 'Obra 1',
            clientId: 'c1',
            observations: 'Test',
            products: [{ productId: 'p1', quantity: 5 }]
        };
        // Simulaciones necesarias para el controlador
        prismaMock_1.prismaMock.product.findUnique.mockResolvedValue(mockProduct);
        prismaMock_1.prismaMock.budget.create.mockResolvedValue({ id: 'new-b', total: 500 });
        const response = await (0, supertest_1.default)(app_1.default)
            .post('/api/budgets')
            .send(budgetData)
            .set('test-role', 'Usuario');
        (0, vitest_1.expect)(response.status).toBe(201);
        // 5 unidades * 100 precio = 500 total
        (0, vitest_1.expect)(prismaMock_1.prismaMock.budget.create).toHaveBeenCalledWith(vitest_1.expect.objectContaining({
            data: vitest_1.expect.objectContaining({
                total: 500
            })
        }));
    });
});
