import React, { useEffect } from 'react';
import { useAuth0 } from "@auth0/auth0-react";
import { useLocation } from 'react-router-dom';

const LoginPage = () => {
    const { loginWithRedirect, isAuthenticated, isLoading } = useAuth0();
    const location = useLocation();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            // Check if there's a returnTo param in the URL query string
            const params = new URLSearchParams(location.search);
            const returnTo = params.get('returnTo') || '/dashboard';

            loginWithRedirect({
                appState: { returnTo }
            });
        }
    }, [isLoading, isAuthenticated, loginWithRedirect, location]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
                <div className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                    Cargando autenticación...
                </div>
            </div>
        );
    }

    if (isAuthenticated) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
                <div className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                    Ya has iniciado sesión. Redirigiendo...
                </div>
            </div>
        );
    }

    return null;
};

export default LoginPage;
