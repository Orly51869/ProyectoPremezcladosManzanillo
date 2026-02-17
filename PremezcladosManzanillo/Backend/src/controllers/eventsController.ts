import { Request, Response } from 'express';

// Store active SSE connections
const sseClients = new Set<Response>();

/**
 * SSE Endpoint: Permite al frontend suscribirse a eventos en tiempo real
 * Los clientes se conectan a /api/events/users y reciben notificaciones push
 */
export const streamUserEvents = (req: Request, res: Response) => {
    // Configurar headers para SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Enviar comentario inicial para mantener la conexión
    res.write(': connected\n\n');

    // Agregar cliente a la lista
    sseClients.add(res);
    console.log(`[SSE] Cliente conectado. Total: ${sseClients.size}`);

    // Enviar evento de bienvenida
    res.write(`data: ${JSON.stringify({ type: 'connected', timestamp: Date.now() })}\n\n`);

    // Cleanup cuando el cliente se desconecta
    req.on('close', () => {
        sseClients.delete(res);
        console.log(`[SSE] Cliente desconectado. Total: ${sseClients.size}`);
    });
};

/**
 * Notifica a todos los clientes conectados sobre un cambio en usuarios
 */
export const notifyUserChange = (eventType: string, data?: any) => {
    const event = {
        type: eventType,
        data: data || {},
        timestamp: Date.now()
    };

    const message = `data: ${JSON.stringify(event)}\n\n`;

    console.log(`[SSE] Notificando a ${sseClients.size} clientes: ${eventType}`);

    sseClients.forEach(client => {
        try {
            client.write(message);
        } catch (error) {
            console.error('[SSE] Error enviando a cliente:', error);
            sseClients.delete(client);
        }
    });
};
