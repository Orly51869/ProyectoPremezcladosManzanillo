import React, { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { motion } from "framer-motion";
import { Home, Users, FileText, BarChart3, Settings, Menu, X, Sun, Moon, LogOut } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const DashboardNavbar = () => {
  const { user, logout } = useAuth0();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  // --- Dark Mode Logic (sin cambios) ---
  const [theme, setTheme] = useState(
    localStorage.getItem('theme') ||
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
  );

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove(theme === 'dark' ? 'light' : 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const navItems = [
    { path: "/dashboard", icon: Home, label: "Panel" },
    { path: "/clients", icon: Users, label: "Clientes" },
    { path: "/budgets", icon: FileText, label: "Presupuestos" },
    { path: "/payments", icon: FileText, label: "Comprobantes" },
    { path: "/reports", icon: BarChart3, label: "Reportes" },
    { path: "/settings", icon: Settings, label: "Configuración" },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed w-full top-0 z-50 bg-white/90 dark:bg-dark-surface backdrop-blur-md border-b border-gray-200 dark:border-gray-700 shadow-sm"
    >
      <div className="w-full px-4">
        <div className="flex items-center py-0 flex-wrap md:flex-nowrap">
          <Link to="/" className="flex items-center ml-0">
            <div className="w-20 h-20 md:w-20 md:h-20 flex items-center justify-center">
              <img
                src={"/assets/LOGO_PREMEZCLADOS.svg"}
                alt="Logo Premezclados"
                className="w-full h-full object-contain"
              />
            </div>
            <span className="ml-1 hidden md:block whitespace-nowrap leading-tight">
              <span className="text-base font-bold text-gray-900 dark:text-gray-100 block">Premezclado</span>
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300 block">Manzanillo, C.A.</span>
            </span>
          </Link>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-brand-soft-bg text-brand-mid"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Contenedor de Navegación */}
          <div
            className={`md:flex ${isOpen ? "flex" : "hidden"} md:items-center md:gap-2 md:ml-3 absolute md:static top-full left-0 w-full md:w-auto md:flex-1 md:min-w-0 md:justify-end bg-white md:bg-transparent md:border-none border-t md:shadow-none shadow-sm z-10 overflow-hidden`}
          >
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-3 py-2 md:px-4 md:py-2 rounded-lg transition-all duration-300 ease-in-out transform ${isActive ? "bg-brand-primary text-white dark:bg-dark-btn dark:text-white" : "text-brand-text dark:text-gray-300 hover:bg-brand-primary hover:text-white hover:scale-105 dark:hover:bg-dark-btn dark:hover:text-white dark:hover:scale-105"}`}
                  title={item.label}
                  onClick={() => setIsOpen(false)}
                >
                  <Icon className="w-4 h-4 md:w-5 md:h-5" />
                  <span className="hidden xl:inline text-xs md:text-sm font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Perfil de Usuario y Logout */}
          <div className="flex items-center gap-4 ml-auto flex-shrink-0">
            {user && (
              <div className="user-profile">
                {user.picture ? (
                  <img
                  src={user.picture}
                  alt={user.name ? user.name.split(' ')[0] : 'Usuario'}
                  className="user-avatar"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                ) : (
                  <div className="user-avatar-placeholder">
                    <span>{user.name ? user.name.split(' ')[0].charAt(0).toUpperCase() : 'U'}</span>
                  </div>
                )}
                <div className="hidden md:block">
                  <p className="user-name">{user.name ? user.name.split(' ')[0] : 'Usuario'}</p>
                  <p
                    className="hidden 2xl:block text-[11px] text-gray-500 dark:text-gray-400 max-w-[120px] truncate"
                    title={user.email}
                  >
                    {user.email}
                  </p>
                </div>
              </div>
            )}
            <button
              onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
              aria-label="Cerrar sesión"
              className="p-2 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>

          {/* Botón de Dark/Light Mode */}
          <button
            onClick={toggleTheme}
            aria-label={`Cambiar a modo ${theme === 'light' ? 'oscuro' : 'claro'}`}
            className="p-2 ml-4 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition border-none flex-shrink-0"
          >
            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </motion.nav>
  );
};

export default DashboardNavbar;
