"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../app"));
const axios_1 = __importDefault(require("axios"));
const currencyController_1 = require("../controllers/currencyController");
// Mock de axios
vitest_1.vi.mock('axios');
const mockedAxios = vitest_1.vi.mocked(axios_1.default, { deep: true });
(0, vitest_1.describe)('Currency API - Functional Tests', () => {
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.clearAllMocks();
        (0, currencyController_1.clearCurrencyCache)();
    });
    (0, vitest_1.it)('GET /api/currency should return exchange rates from scraping', async () => {
        // Simulamos el HTML que devolvería el BCV
        const mockHtml = `
      <div id="dolar"><strong> 36,50 </strong></div>
      <div id="euro"><strong> 39,20 </strong></div>
    `;
        mockedAxios.get.mockResolvedValue({ data: mockHtml });
        const response = await (0, supertest_1.default)(app_1.default).get('/api/currency/rates');
        (0, vitest_1.expect)(response.status).toBe(200);
        (0, vitest_1.expect)(response.body).toEqual({
            USD: 36.5,
            EUR: 39.2
        });
    });
    (0, vitest_1.it)('Should handle BCV errors and return 500 if no cache', async () => {
        mockedAxios.get.mockRejectedValue(new Error('BCV Down'));
        const response = await (0, supertest_1.default)(app_1.default).get('/api/currency/rates');
        (0, vitest_1.expect)(response.status).toBe(500);
    });
});
