"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prismaMock_1 = require("./helpers/prismaMock");
const vitest_1 = require("vitest");
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../app"));
(0, vitest_1.describe)('Settings API - Functional Tests', () => {
    (0, vitest_1.it)('GET /api/settings should return a map of settings', async () => {
        // Definimos el comportamiento del mock
        const mockSettings = [
            { key: 'companyName', value: 'Premezclados Manzanillo', type: 'text', createdAt: new Date(), updatedAt: new Date() },
            { key: 'ivaRate', value: '16', type: 'number', createdAt: new Date(), updatedAt: new Date() }
        ];
        prismaMock_1.prismaMock.setting.findMany.mockResolvedValue(mockSettings);
        const response = await (0, supertest_1.default)(app_1.default).get('/api/settings');
        (0, vitest_1.expect)(response.status).toBe(200);
        (0, vitest_1.expect)(response.body).toEqual({
            companyName: 'Premezclados Manzanillo',
            ivaRate: '16'
        });
        // Verificamos que se llamó a Prisma
        (0, vitest_1.expect)(prismaMock_1.prismaMock.setting.findMany).toHaveBeenCalled();
    });
    (0, vitest_1.it)('GET /api/settings/:key should return a specific setting', async () => {
        const mockSetting = { key: 'testKey', value: 'testValue', type: 'text', createdAt: new Date(), updatedAt: new Date() };
        prismaMock_1.prismaMock.setting.findUnique.mockResolvedValue(mockSetting);
        const response = await (0, supertest_1.default)(app_1.default).get('/api/settings/testKey');
        (0, vitest_1.expect)(response.status).toBe(200);
        (0, vitest_1.expect)(response.body.value).toBe('testValue');
        (0, vitest_1.expect)(prismaMock_1.prismaMock.setting.findUnique).toHaveBeenCalledWith({
            where: { key: 'testKey' }
        });
    });
    (0, vitest_1.it)('GET /api/settings/:key should return 404 if not found', async () => {
        prismaMock_1.prismaMock.setting.findUnique.mockResolvedValue(null);
        const response = await (0, supertest_1.default)(app_1.default).get('/api/settings/nonExistent');
        (0, vitest_1.expect)(response.status).toBe(404);
        (0, vitest_1.expect)(response.body.error).toBeDefined();
    });
});
