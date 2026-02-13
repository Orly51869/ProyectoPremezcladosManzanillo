import React from 'react';

/**
 * Pantalla de carga profesional que reemplaza el texto plano "Cargando..."
 * Se usa durante la inicialización de Auth0 y transiciones de ruta.
 */
const LoadingScreen = ({ message = 'Cargando...' }) => {
    return (
        <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            <div className="flex flex-col items-center gap-6">
                {/* Logo */}
                <img
                    src="/assets/LOGO_PREMEZCLADOS.svg"
                    alt="Premezclado Manzanillo"
                    className="w-20 h-20 object-contain animate-pulse"
                />

                {/* Spinner */}
                <div className="relative">
                    <div className="w-10 h-10 border-4 border-gray-200 dark:border-gray-700 rounded-full"></div>
                    <div className="w-10 h-10 border-4 border-transparent border-t-green-600 rounded-full absolute top-0 left-0 animate-spin"></div>
                </div>

                {/* Mensaje */}
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {message}
                </p>
            </div>
        </div>
    );
};

export default LoadingScreen;
