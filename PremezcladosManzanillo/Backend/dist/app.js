"use strict";
/***********************************************/
/**               app.ts                      **/
/***********************************************/
// Configuración de la aplicación Express separada del servidor para facilitar tests
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const dotenv = __importStar(require("dotenv"));
const jwtCheck_1 = require("./middleware/jwtCheck");
const userProvisioningMiddleware_1 = require("./middleware/userProvisioningMiddleware");
// Enrutadores
const budgets_1 = __importDefault(require("./routes/budgets"));
const clients_1 = __importDefault(require("./routes/clients"));
const products_1 = __importDefault(require("./routes/products"));
const payments_1 = __importDefault(require("./routes/payments"));
const notifications_1 = __importDefault(require("./routes/notifications"));
const invoices_1 = __importDefault(require("./routes/invoices"));
const dashboard_1 = __importDefault(require("./routes/dashboard"));
const users_1 = __importDefault(require("./routes/users"));
const currency_1 = __importDefault(require("./routes/currency"));
const audit_1 = __importDefault(require("./routes/audit"));
const settings_1 = __importDefault(require("./routes/settings"));
const reports_1 = __importDefault(require("./routes/reports"));
const projects_1 = __importDefault(require("./routes/projects"));
dotenv.config();
const app = (0, express_1.default)();
const corsOptions = {
    origin: ['http://localhost:3000', 'http://localhost:5173'],
    credentials: true,
};
app.use((0, cors_1.default)(corsOptions));
app.use(express_1.default.json());
app.use('/uploads', express_1.default.static('uploads'));
// Rutas protegidas
app.use('/api/budgets', jwtCheck_1.jwtCheck, userProvisioningMiddleware_1.userProvisioningMiddleware, budgets_1.default);
app.use('/api/clients', jwtCheck_1.jwtCheck, userProvisioningMiddleware_1.userProvisioningMiddleware, clients_1.default);
app.use('/api/products', jwtCheck_1.jwtCheck, userProvisioningMiddleware_1.userProvisioningMiddleware, products_1.default);
app.use('/api/payments', jwtCheck_1.jwtCheck, userProvisioningMiddleware_1.userProvisioningMiddleware, payments_1.default);
app.use('/api/notifications', jwtCheck_1.jwtCheck, userProvisioningMiddleware_1.userProvisioningMiddleware, notifications_1.default);
app.use('/api/invoices', jwtCheck_1.jwtCheck, userProvisioningMiddleware_1.userProvisioningMiddleware, invoices_1.default);
app.use('/api/dashboard', jwtCheck_1.jwtCheck, userProvisioningMiddleware_1.userProvisioningMiddleware, dashboard_1.default);
app.use('/api/users', jwtCheck_1.jwtCheck, userProvisioningMiddleware_1.userProvisioningMiddleware, users_1.default);
app.use('/api/audit', jwtCheck_1.jwtCheck, userProvisioningMiddleware_1.userProvisioningMiddleware, audit_1.default);
app.use('/api/reports', jwtCheck_1.jwtCheck, userProvisioningMiddleware_1.userProvisioningMiddleware, reports_1.default);
// Rutas públicas o con protección interna
app.use('/api/settings', settings_1.default);
app.use('/api/projects', projects_1.default);
app.use('/api/currency', currency_1.default);
app.get('/', (req, res) => {
    res.send('Backend is running!');
});
// Proxy de Chat (Groq)
app.post('/api/chat', async (req, res) => {
    try {
        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: 'GROQ_API_KEY no configurada en el backend.' });
        }
        const { messages, model = 'llama-3.1-8b-instant', temperature = 0.3, max_tokens = 512 } = req.body || {};
        if (!Array.isArray(messages)) {
            return res.status(400).json({ error: 'Body inválido. Se espera { messages: ChatCompletionMessage[] }' });
        }
        const systemPrompt = {
            role: 'system',
            content: 'Eres el asistente virtual de Premezclado Manzanillo, C.A...'
        };
        const resp = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model,
                temperature,
                max_tokens,
                messages: [systemPrompt, ...messages],
            }),
        });
        if (!resp.ok) {
            const text = await resp.text();
            return res.status(502).json({ error: 'Error en Groq', detail: text });
        }
        const data = await resp.json();
        return res.json({ content: data?.choices?.[0]?.message?.content ?? '', raw: data });
    }
    catch (err) {
        return res.status(500).json({ error: 'Fallo interno del chat' });
    }
});
// Manejo de errores global
app.use((err, req, res, next) => {
    // Log detallado para depuración en tests (desactivado si todo va bien)
    /* if (process.env.NODE_ENV === 'test' && err.status !== 401) {
      console.error('DEBUG TEST ERROR:', {
        status: err.status,
        name: err.name,
        message: err.message,
        code: err.code
      });
    } */
    // Errores de Auth0 (express-oauth2-jwt-bearer)
    // Si no hay token, la librería suele lanzar InvalidRequestError o status 401/400
    if (err.status === 401 ||
        err.name === 'UnauthorizedError' ||
        err.name === 'InvalidRequestError' || // Capturar el error que vimos en los logs
        err.code === 'invalid_token' ||
        err.code === 'credentials_required') {
        return res.status(401).json({
            error: 'No autorizado',
            message: err.message || 'Token de autenticación faltante o inválido'
        });
    }
    // Errores de solicitud incorrecta genéricos
    if (err.status === 400 || err.name === 'BadRequestError') {
        return res.status(400).json({ error: 'Solicitud incorrecta', message: err.message });
    }
    console.error('Error no manejado:', err);
    res.status(err.status || 500).json({
        error: 'Error interno del servidor',
        message: err.message || 'Ocurrió un error inesperado'
    });
});
exports.default = app;
