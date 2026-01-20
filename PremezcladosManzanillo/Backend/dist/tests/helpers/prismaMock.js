"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prismaMock = void 0;
const vitest_1 = require("vitest");
const vitest_mock_extended_1 = require("vitest-mock-extended");
const prisma_1 = __importDefault(require("../../lib/prisma"));
vitest_1.vi.mock('../../lib/prisma', () => ({
    __esModule: true,
    default: (0, vitest_mock_extended_1.mockDeep)(),
}));
exports.prismaMock = prisma_1.default;
(0, vitest_1.beforeEach)(() => {
    (0, vitest_mock_extended_1.mockReset)(exports.prismaMock);
});
