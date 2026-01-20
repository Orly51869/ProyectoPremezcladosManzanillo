"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../app"));
// Mockeamos el middleware de Auth0 para que no intente validar tokens reales durante los tests básicos
// o simplemente probamos que sin cabecera falle.
(0, vitest_1.describe)('Security Tests - RBAC & Auth', () => {
    (0, vitest_1.it)('Should return 401 when accessing protected route without token', async () => {
        const response = await (0, supertest_1.default)(app_1.default).get('/api/budgets');
        if (response.status !== 401)
            console.log('Response Body:', response.body);
        (0, vitest_1.expect)(response.status).toBe(401);
    });
    (0, vitest_1.it)('Should return 401 when accessing clients without token', async () => {
        const response = await (0, supertest_1.default)(app_1.default).get('/api/clients');
        if (response.status !== 401)
            console.log('Response Body:', response.body);
        (0, vitest_1.expect)(response.status).toBe(401);
    });
    (0, vitest_1.it)('Public route /api/settings should be accessible (GET)', async () => {
        const response = await (0, supertest_1.default)(app_1.default).get('/api/settings');
        // Esperamos 200 porque es pública (o al menos no 401 por Auth0)
        (0, vitest_1.expect)([200, 404]).toContain(response.status);
    });
    (0, vitest_1.it)('Protected route /api/settings should return 401 on POST without token', async () => {
        const response = await (0, supertest_1.default)(app_1.default).post('/api/settings').send({ key: 'test', value: 'test' });
        if (response.status !== 401)
            console.log('Response Body:', response.body);
        (0, vitest_1.expect)(response.status).toBe(401);
    });
});
