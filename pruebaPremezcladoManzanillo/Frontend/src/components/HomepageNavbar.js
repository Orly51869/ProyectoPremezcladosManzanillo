/*************************************/
/**       HomepageNavbar            **/
/*************************************/
// Archivo para renderizar el Menú de navegación en la página de inicio

// Librerías y módulos 
import React, { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Search, Sun, Moon, LogOut, LayoutDashboard, Home, Menu, X } from "lucide-react";
import { Link } from "react-router-dom";

// Componente principal
const HomepageNavbar = () => {
  const { isAuthenticated, loginWithRedirect, logout } = useAuth0();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Lógica del Dark Mode (sin cambios)
  const [theme, setTheme] = useState(
    localStorage.getItem('theme') ||
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
  );
  // Función para el uso de eventos en el dark mode y cambio de icono
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove(theme === 'dark' ? 'light' : 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  // Lista para los items de navegación
  const navigationItems = [
    { label: "Inicio", to: "/", icon: <Home className="w-4 h-4 mr-1" /> },
    { label: "Productos", to: { pathname: '/', hash: '#productos' } },
    { label: "Servicios", to: { pathname: '/', hash: '#servicios' } },
    { label: "Nosotros", to: "/nosotros" },
    { label: "Proyectos", to: "/proyectos" },
    { label: "Contactanos", to: "/contacto" },
  ];

  // Renderizado a través del DOM para elementos HTML de React
  return (
    <header className="w-full px-8 py-2 fixed top-0 bg-white dark:bg-dark-primary border-b border-gray-200 dark:border-gray-700 flex items-center z-50 shadow-md">
      {/* 1. Logo (Izquierda) */}
      <Link
        to="/"
        className="flex items-center flex-shrink-0"
        aria-label="Premezclados - Ir al inicio"
      >
        <div className="w-16 h-16 md:w-20 md:h-20 flex items-center justify-center">
          <img
            className="w-full h-full object-contain"
            alt="Logo PREMEZCLADOS"
            src={"/assets/LOGO_PREMEZCLADOS.svg"}
          />
        </div>
        <div className="ml-2 hidden md:block py-1">
          <span className="block text-lg font-bold text-gray-900 dark:text-gray-100">Premezclado</span>
          <span className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Manzanillo, C.A.</span>
        </div>
      </Link>

      {/* Contenedor para agrupar navegación y acciones a la derecha */}
      <div className="ml-auto flex items-center">
        {/* 2. Navegación */}
        <nav
          className="hidden lg:flex"
          aria-label="Navegación principal"
        >
          <div className="flex items-center gap-6">
            {navigationItems.map((item) => (
              <Link
                key={item.label}
                to={item.to || item.href}
                className="flex items-center px-3 py-2 rounded-md text-gray-600 dark:text-gray-300 transform transition-all duration-300 ease-in-out hover:bg-brand-primary hover:text-white hover:scale-105 active:bg-brand-primary active:text-white active:scale-100 dark:hover:bg-dark-btn dark:active:bg-dark-btn"
              >
                {item.icon}
                <span className="text-sm font-semibold">{item.label}</span>
              </Link>
            ))}
          </div>
        </nav>

        {/* 3. Acciones de Usuario, Buscador y Tema */}
        <div className="flex items-center gap-6 flex-shrink-0 ml-6">
          {/* Buscador */}
          {/* ... (código del buscador sin cambios) */}

          {/* Botones de Autenticación */}
          <div className="hidden lg:flex items-center gap-2"> {/* Ocultar en pantallas pequeñas */}
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="no-underline">
                  <button
                    type="button"
                    className="flex items-center justify-center w-32 text-center px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-transparent rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                  >
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    Dashboard
                  </button>
                </Link>
                <button
                  onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
                  type="button"
                  aria-label="Cerrar sesión"
                  className="p-2 rounded-full text-red-600 dark:text-red-500 hover:bg-red-100 dark:hover:bg-gray-800 transition"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => loginWithRedirect({ appState: { returnTo: '/dashboard' } })}
                  type="button"
                  className="w-32 text-center px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-transparent rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                >
                  Iniciar sesión
                </button>
                <button
                  onClick={() => loginWithRedirect({ appState: { returnTo: '/dashboard' }, authorizationParams: { screen_hint: 'signup' } })}
                  type="button"
                  className="w-32 text-center px-4 py-2 text-sm font-semibold text-white bg-green-700 rounded-md border border-green-800 hover:bg-green-800 transition shadow-md"
                >
                  Registro
                </button>
              </>
            )}
          </div>

          {/* Botón de Dark/Light Mode */}
          <button
            onClick={toggleTheme}
            aria-label={`Cambiar a modo ${theme === 'light' ? 'oscuro' : 'claro'}`}
            className="p-2 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition border-none"
          >
            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </button>

          {/* Botón de Menú Hamburguesa (visible en pantallas pequeñas) */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition border-none"
            aria-label="Abrir menú"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Menú Móvil (Panel) */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 top-[96px] bg-white dark:bg-dark-primary z-40 flex flex-col items-center py-8 lg:hidden">
          <nav className="flex flex-col items-center gap-6" aria-label="Navegación móvil">
            {navigationItems.map((item) => (
              <Link
                key={item.label}
                to={item.to || item.href}
                onClick={() => setIsMobileMenuOpen(false)} // Cerrar menú al hacer clic en un enlace
                className="flex items-center px-4 py-2 rounded-md text-gray-700 dark:text-gray-200 text-lg font-semibold hover:bg-brand-primary hover:text-white dark:hover:bg-dark-btn transition w-full justify-center"
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* Botones de Autenticación en el menú móvil */}
          <div className="flex flex-col items-center gap-4 mt-8 w-full px-4">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="no-underline w-full">
                  <button
                    type="button"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-center w-full text-center px-4 py-3 text-base font-semibold text-gray-700 dark:text-gray-300 bg-transparent rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                  >
                    <LayoutDashboard className="w-5 h-5 mr-2" />
                    Dashboard
                  </button>
                </Link>
                <button
                  onClick={() => {
                    logout({ logoutParams: { returnTo: window.location.origin } });
                    setIsMobileMenuOpen(false);
                  }}
                  type="button"
                  aria-label="Cerrar sesión"
                  className="flex items-center justify-center w-full px-4 py-3 text-base font-semibold text-red-600 dark:text-red-500 bg-transparent rounded-md border border-red-600 dark:border-red-500 hover:bg-red-100 dark:hover:bg-gray-800 transition"
                >
                  <LogOut className="w-5 h-5 mr-2" />
                  Cerrar sesión
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    loginWithRedirect({ appState: { returnTo: '/dashboard' } });
                    setIsMobileMenuOpen(false);
                  }}
                  type="button"
                  className="w-full text-center px-4 py-3 text-base font-semibold text-gray-700 dark:text-gray-300 bg-transparent rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                >
                  Iniciar sesión
                </button>
                <button
                  onClick={() => {
                    loginWithRedirect({ appState: { returnTo: '/dashboard' }, authorizationParams: { screen_hint: 'signup' } });
                    setIsMobileMenuOpen(false);
                  }}
                  type="button"
                  className="w-full text-center px-4 py-3 text-base font-semibold text-white bg-green-700 rounded-md border border-green-800 hover:bg-green-800 transition shadow-md"
                >
                  Registro
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default HomepageNavbar;
