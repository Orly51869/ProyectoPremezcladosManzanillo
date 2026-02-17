/***********************************************/
/**               app.ts                      **/
/***********************************************/
// Configuración de la aplicación Express separada del servidor para facilitar tests

import cors from 'cors';
import express from 'express';
import * as dotenv from 'dotenv';
import { jwtCheck } from './middleware/jwtCheck';
import { userProvisioningMiddleware } from './middleware/userProvisioningMiddleware';

// Enrutadores
import budgetsRouter from './routes/budgets';
import clientsRouter from './routes/clients';
import productsRouter from './routes/products';
import paymentsRouter from './routes/payments';
import notificationsRouter from './routes/notifications';
import invoicesRouter from './routes/invoices';
import dashboardRouter from './routes/dashboard';
import usersRouter from './routes/users';
import currencyRoutes from './routes/currency';
import auditRouter from './routes/audit';
import settingsRouter from './routes/settings';
import reportsRouter from './routes/reports';
import projectsRouter from './routes/projects';

dotenv.config();

const app = express();

const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://starlit-pika-2ba116.netlify.app',
    process.env.FRONTEND_URL
  ].filter(Boolean) as string[],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Rutas protegidas
app.use('/api/budgets', jwtCheck, userProvisioningMiddleware, budgetsRouter);
app.use('/api/clients', jwtCheck, userProvisioningMiddleware, clientsRouter);
app.use('/api/products', jwtCheck, userProvisioningMiddleware, productsRouter);
app.use('/api/payments', jwtCheck, userProvisioningMiddleware, paymentsRouter);
app.use('/api/notifications', jwtCheck, userProvisioningMiddleware, notificationsRouter);
app.use('/api/invoices', jwtCheck, userProvisioningMiddleware, invoicesRouter);
app.use('/api/dashboard', jwtCheck, userProvisioningMiddleware, dashboardRouter);
app.use('/api/users', jwtCheck, userProvisioningMiddleware, usersRouter);
app.use('/api/audit', jwtCheck, userProvisioningMiddleware, auditRouter);
app.use('/api/reports', jwtCheck, userProvisioningMiddleware, reportsRouter);

// Rutas públicas o con protección interna
app.use('/api/settings', settingsRouter);
app.use('/api/projects', projectsRouter);
app.use('/api/currency', currencyRoutes);

// ⚡ Rutas de Tiempo Real (SSE + Webhooks)
import { streamUserEvents } from './controllers/eventsController';
import { handleAuth0Webhook, webhookHealth } from './controllers/webhookController';

// SSE: Stream de eventos en tiempo real (Frontend escucha aquí)
app.get('/api/events/users', streamUserEvents);

// Webhook: Auth0 envía notificaciones aquí
app.post('/api/webhooks/auth0', handleAuth0Webhook);
app.get('/api/webhooks/auth0/health', webhookHealth);

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
  } catch (err) {
    return res.status(500).json({ error: 'Fallo interno del chat' });
  }
});

// Manejo de errores global
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
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
  if (
    err.status === 401 ||
    err.name === 'UnauthorizedError' ||
    err.name === 'InvalidRequestError' || // Capturar el error que vimos en los logs
    err.code === 'invalid_token' ||
    err.code === 'credentials_required'
  ) {
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

export default app;
