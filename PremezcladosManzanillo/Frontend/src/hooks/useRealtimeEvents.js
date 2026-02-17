import { useEffect, useRef } from 'react';

/**
 * Hook para escuchar eventos Server-Sent Events (SSE) en tiempo real
 * Conecta al backend y recibe notificaciones push cuando cambian usuario/roles
 */
export const useRealtimeEvents = (onEvent) => {
    const eventSourceRef = useRef(null);

    useEffect(() => {
        // URL del endpoint SSE
        const backendUrl = import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:3002';
        const eventsUrl = `${backendUrl}/api/events/users`;

        console.log('[Realtime] Conectando a SSE:', eventsUrl);

        // Crear conexión EventSource
        const eventSource = new EventSource(eventsUrl);
        eventSourceRef.current = eventSource;

        eventSource.onopen = () => {
            console.log('[Realtime] ✅ Conectado al stream SSE');
        };

        eventSource.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                console.log('[Realtime] ⚡ Evento recibido:', data.type);

                // Llamar callback con el evento
                if (onEvent) {
                    onEvent(data);
                }
            } catch (error) {
                console.error('[Realtime] Error parseando evento:', error);
            }
        };

        eventSource.onerror = (error) => {
            console.error('[Realtime] ❌ Error en SSE:', error);
            // EventSource automáticamente intenta reconectar
        };

        // Cleanup al desmontar
        return () => {
            console.log('[Realtime] Desconectando SSE');
            eventSource.close();
        };
    }, [onEvent]);

    return eventSourceRef;
};
