import { Request, Response } from 'express';
import { notifyUserChange } from './eventsController';

// Variable global para invalidar caché al recibir webhooks
export let webhookCacheInvalidation = 0;

/**
 * Webhook Endpoint para recibir eventos de Auth0
 * Auth0 enviará notificaciones POST aquí cuando cambien roles
 */
export const handleAuth0Webhook = async (req: Request, res: Response) => {
    try {
        const event = req.body;

        console.log('[Auth0 Webhook] Evento recibido:', {
            type: event.type,
            log_id: event.log_id,
            date: event.date
        });

        // Procesar diferentes tipos de eventos de Auth0
        const eventType = event.type;

        // Eventos relacionados con roles y usuarios
        const roleEvents = [
            's', // Success events (generic)
            'sapi', // Success API Operation
            'admin_update_launch', // Admin action
            'ss', // Success Signup
            'scpn', // Success Change Password
            'fu', // Failed Login
            'fdeaz', // Failed device authorization
        ];

        // Si es un evento relacionado con cambios de usuario/rol
        if (eventType && (
            eventType.includes('role') ||
            eventType.includes('user') ||
            eventType === 's' ||
            eventType === 'sapi'
        )) {
            console.log('[Auth0 Webhook] ⚡ Cambio detectado - Invalidando caché y notificando clientes');

            // Invalidar caché global
            webhookCacheInvalidation = Date.now();

            // Notificar a todos los clientes SSE conectados
            notifyUserChange('user_updated', {
                source: 'auth0_webhook',
                eventType: eventType,
                userId: event.user_id || event.data?.user_id
            });
        }

        // Auth0 espera respuesta 200
        res.status(200).json({ received: true, timestamp: Date.now() });

    } catch (error) {
        console.error('[Auth0 Webhook] Error procesando webhook:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

/**
 * Verificación de salud del endpoint webhook
 */
export const webhookHealth = (req: Request, res: Response) => {
    res.json({
        status: 'ok',
        endpoint: 'auth0-webhook',
        lastInvalidation: webhookCacheInvalidation
    });
};
