"use strict";
/***********************************************/
/**               index.ts                    **/
/***********************************************/
// Archivo de inicio del servidor
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const scheduler_1 = require("./lib/scheduler");
const port = 3002;
// Iniciar scheduler de vencimientos
(0, scheduler_1.startExpirationScheduler)();
// Manejadores globales de errores
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception thrown:', error);
    process.exit(1);
});
console.log('Backend: Attempting to start server...');
app_1.default.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
    console.log('Backend: Server started successfully and listening for requests.');
}).on('error', (err) => {
    console.error('Backend: Server failed to start or encountered an error:', err);
    process.exit(1);
});
