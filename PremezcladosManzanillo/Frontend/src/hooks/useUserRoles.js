import { useAuth0 } from '@auth0/auth0-react';

/**
 * Hook centralizado para obtener los roles del usuario.
 * 
 * Estrategia de resolución (sincronizada con el backend):
 * 1. Lee los roles del token JWT (inyectados por la Auth0 Action)
 * 2. Si no hay roles en el token, aplica fallback a ['Usuario']
 *    para garantizar acceso mínimo al sistema.
 *
 * @returns {{ userRoles: string[], rawRoles: string[], isAdmin: boolean, isOnlyUsuario: boolean }}
 */
const useUserRoles = () => {
    const { user } = useAuth0();

    const ROLES_NAMESPACE = 'https://premezcladomanzanillo.com/roles';
    const DEFAULT_ROLE = 'Usuario';

    // Roles directamente del token de Auth0 (sin modificar)
    const tokenRoles = user?.[ROLES_NAMESPACE] || [];

    // Roles con fallback a 'Usuario' si no hay roles en el token
    // (sincronizado con la estrategia del backend)
    const rawRoles = tokenRoles.length > 0
        ? tokenRoles
        : [DEFAULT_ROLE];

    // Roles normalizados a minúsculas (para comparaciones case-insensitive)
    const userRoles = rawRoles.map(r => r.toLowerCase());

    // Helpers comunes
    const isAdmin = userRoles.includes('administrador');
    const isOnlyUsuario = userRoles.includes('usuario') &&
        !isAdmin &&
        !userRoles.includes('comercial') &&
        !userRoles.includes('contable');

    return { userRoles, rawRoles, tokenRoles, isAdmin, isOnlyUsuario };
};

export default useUserRoles;
