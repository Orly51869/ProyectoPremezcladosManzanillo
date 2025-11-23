import express from 'express';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const app = express();
const port = 3001;

// Other middleware like express.json() should be mounted AFTER the auth handler.
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Backend is running!');
});

// Minimal CORS for local development
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

// AI Chat proxy (Groq - OpenAI compatible)
app.post('/api/chat', async (req, res) => {
  try {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      console.error('[CHAT] Falta GROQ_API_KEY en el backend');
      return res.status(500).json({ error: 'GROQ_API_KEY no configurada en el backend.' });
    }
    // Log para verificar que la clave se está cargando
    console.log(`[CHAT] Usando API Key que empieza con: ${apiKey.substring(0, 4)}...`);

    const { messages, model = 'llama-3.1-8b-instant', temperature = 0.3, max_tokens = 512 } = req.body || {};
    if (!Array.isArray(messages)) {
      console.error('[CHAT] Body inválido recibido:', req.body);
      return res.status(400).json({ error: 'Body inválido. Se espera { messages: ChatCompletionMessage[] }' });
    }

    const systemPrompt = {
      role: 'system',
      content:
        'Eres el asistente virtual de Premezclado Manzanillo, C.A. Responde en español con tono profesional y cercano. ' +
        'Ayuda sobre productos de concreto, servicios de bombeo y entregas. Si no sabes algo, sé honesto y sugiere contactar al equipo. ' +
        'Importante: Si un usuario pide una cotización, explícale amablemente que para crearla necesita iniciar sesión o registrarse en la plataforma. ' +
        'Anímale a usar los botones de "Iniciar Sesión" o "Registro" del menú para continuar. ' +
        'No tienes permitido tomar acciones en nombre de la empresa ni del usuario (como modificar pedidos, cancelar servicios, etc.). ' +
        'Para cualquier solicitud de este tipo, indica al usuario que debe contactar a un representante humano escribiendo a ventas@premezcladomanzanillo.com.'+
        'Si el usuario desea realizar conversaciones fuera del tema de construcción o sobre materiales requeridos para una, informale amablemente que tu funcionas como asistente de información de la empresa he invitale a a consultar sus dudas en cualquier otro sistema de chat LLM, agradeciendo las molestias causadas y invitando a consultar cualquier tema referente a la compañía y materiales de construcción'
    };

    const requestBody = {
      model,
      temperature,
      max_tokens,
      messages: [systemPrompt, ...messages],
    };

    // Log del cuerpo de la petición que se enviará a Groq
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
    } catch (e) {
      console.error('[CHAT] Respuesta no-JSON de Groq:', responseBodyText);
      return res.status(502).json({ error: 'Respuesta inválida de Groq (no es JSON)' });
    }
  } catch (err) {
    console.error('[CHAT] Error inesperado', err);
    return res.status(500).json({ error: 'Fallo interno del chat' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});