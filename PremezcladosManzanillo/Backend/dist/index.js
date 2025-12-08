"use strict";
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
const express_1 = __importDefault(require("express"));
const dotenv = __importStar(require("dotenv"));
dotenv.config(); // Load environment variables
const app = (0, express_1.default)();
const port = 3001;
// Global error handlers for uncaught exceptions and unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1); // Exit with a failure code
});
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception thrown:', error);
    process.exit(1); // Exit with a failure code
});
const cors_1 = __importDefault(require("cors"));
// Configuración de CORS con el paquete `cors`
const corsOptions = {
    origin: 'http://localhost:3000', // El origen de tu frontend
    credentials: true, // Permitir cookies y cabeceras de autorización
};
console.log('Backend: Applying CORS middleware');
app.use((0, cors_1.default)(corsOptions));
const jwtCheck_1 = require("./middleware/jwtCheck");
const userProvisioningMiddleware_1 = require("./middleware/userProvisioningMiddleware");
// Routers
const budgets_1 = __importDefault(require("./routes/budgets"));
const clients_1 = __importDefault(require("./routes/clients"));
const products_1 = __importDefault(require("./routes/products"));
const payments_1 = __importDefault(require("./routes/payments"));
const notifications_1 = __importDefault(require("./routes/notifications"));
const invoices_1 = __importDefault(require("./routes/invoices")); // Import the new invoices router
console.log('Backend: Applying express.json middleware');
app.use(express_1.default.json());
console.log('Backend: Serving static files from /uploads');
app.use('/uploads', express_1.default.static('uploads'));
console.log('Backend: Applying Auth middleware to /api/budgets');
app.use('/api/budgets', jwtCheck_1.jwtCheck, userProvisioningMiddleware_1.userProvisioningMiddleware, budgets_1.default);
console.log('Backend: Applying Auth middleware to /api/clients');
app.use('/api/clients', jwtCheck_1.jwtCheck, userProvisioningMiddleware_1.userProvisioningMiddleware, clients_1.default);
console.log('Backend: Applying Auth middleware to /api/products');
app.use('/api/products', jwtCheck_1.jwtCheck, userProvisioningMiddleware_1.userProvisioningMiddleware, products_1.default);
console.log('Backend: Applying Auth middleware to /api/payments');
app.use('/api/payments', jwtCheck_1.jwtCheck, userProvisioningMiddleware_1.userProvisioningMiddleware, payments_1.default);
console.log('Backend: Applying Auth middleware to /api/notifications');
app.use('/api/notifications', jwtCheck_1.jwtCheck, userProvisioningMiddleware_1.userProvisioningMiddleware, notifications_1.default);
console.log('Backend: Applying Auth middleware to /api/invoices');
app.use('/api/invoices', jwtCheck_1.jwtCheck, userProvisioningMiddleware_1.userProvisioningMiddleware, invoices_1.default);
console.log('Backend: Registering public endpoint /');
app.get('/', (req, res) => {
    res.send('Backend is running!');
});
console.log('Backend: Registering chat proxy endpoint /api/chat');
app.post('/api/chat', async (req, res) => {
    try {
        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) {
            console.error('[CHAT] Falta GROQ_API_KEY en el backend');
            return res.status(500).json({ error: 'GROQ_API_KEY no configurada en el backend.' });
        }
        console.log(`[CHAT] Usando API Key que empieza con: ${apiKey.substring(0, 4)}...`);
        const { messages, model = 'llama-3.1-8b-instant', temperature = 0.3, max_tokens = 512 } = req.body || {};
        if (!Array.isArray(messages)) {
            console.error('[CHAT] Body inválido recibido:', req.body);
            return res.status(400).json({ error: 'Body inválido. Se espera { messages: ChatCompletionMessage[] }' });
        }
        const systemPrompt = {
            role: 'system',
            content: 'Eres el asistente virtual de Premezclado Manzanillo, C.A. Responde en español con tono profesional y cercano. ' +
                'Ayuda sobre productos de concreto, servicios de bombeo y entregas. Si no sabes algo, sé honesto y sugiere contactar al equipo. ' +
                'Importante: Si un usuario pide una cotización, explícale amablemente que para crearla necesita iniciar sesión o registrarse en la plataforma. ' +
                'Anímale a usar los botones de "Iniciar Sesión" o "Registro" del menú para continuar. ' +
                'No tienes permitido tomar acciones en nombre de la empresa ni del usuario (como modificar pedidos, cancelar servicios, etc.). ' +
                'Para cualquier solicitud de este tipo, indica al usuario que debe contactar a un representante humano escribiendo a ventas@premezcladomanzanillo.com.' +
                'Si el usuario desea realizar conversaciones fuera del tema de construcción o sobre materiales requeridos para una, informale amablemente que tu funcionas como asistente de información de la empresa he invitale a a consultar sus dudas en cualquier otro sistema de chat LLM, agradeciendo las molestias causadas y invitando a consultar cualquier tema referente a la compañía y materiales de construcción'
        };
        const requestBody = {
            model,
            temperature,
            max_tokens,
            messages: [systemPrompt, ...messages],
        };
        console.log('[CHAT] Enviando a Groq:', JSON.stringify(requestBody, null, 2));
        const resp = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify(requestBody),
        });
        const responseBodyText = await resp.text();
        console.log('[CHAT] Respuesta de Groq (status):', resp.status);
        console.log('[CHAT] Respuesta de Groq (body):', responseBodyText);
        if (!resp.ok) {
            console.error('[CHAT] Groq error', resp.status, resp.statusText, responseBodyText);
            return res.status(502).json({ error: 'Error en Groq', status: resp.status, statusText: resp.statusText, detail: responseBodyText });
        }
        try {
            const data = JSON.parse(responseBodyText);
            const content = data?.choices?.[0]?.message?.content ?? '';
            return res.json({ content, raw: data });
        }
        catch (e) {
            console.error('[CHAT] Respuesta no-JSON de Groq:', responseBodyText);
            return res.status(502).json({ error: 'Respuesta inválida de Groq (no es JSON)' });
        }
    }
    catch (err) {
        console.error('[CHAT] Error inesperado', err);
        return res.status(500).json({ error: 'Fallo interno del chat' });
    }
});
console.log('Backend: Attempting to start server...');
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
    console.log('Backend: Server started successfully and listening for requests.');
}).on('error', (err) => {
    console.error('Backend: Server failed to start or encountered an error:', err);
    process.exit(1); // Exit with a failure code if server fails
});
