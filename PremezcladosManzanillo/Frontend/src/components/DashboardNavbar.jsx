import React, { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard, 
  Users, 
  FileSpreadsheet, 
  Package, 
  CreditCard, 
  Receipt, 
  PieChart, 
  UserCog, 
  Settings, 
  Menu, 
  X, 
  Sun, 
  Moon, 
  LogOut, 
  Bell,
  ChevronDown,
  Palette
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const DashboardNavbar = () => {
  const { user, logout } = useAuth0();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [imgError, setImgError] = useState(false);

  // Obtener roles del usuario desde Auth0
  const userRoles = user?.['https://premezcladomanzanillo.com/roles'] || [];

  // Logic para modo oscuro
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
    { path: "/clients", icon: Users, label: "Clientes", requiredRoles: ["Administrador", "Comercial", "Contable"] },
    { path: "/budgets", icon: FileSpreadsheet, label: "Presupuestos", requiredRoles: ["Administrador", "Comercial", "Contable", "Usuario"] },
    { path: "/products-management", icon: Package, label: "Productos", requiredRoles: ["Administrador", "Comercial", "Contable"] },
    { path: "/payments", icon: CreditCard, label: "Comprobantes", requiredRoles: ["Administrador", "Contable", "Comercial", "Usuario"] },
    { path: "/invoices", icon: Receipt, label: "Facturas", requiredRoles: ["Administrador", "Contable", "Usuario"] },
    { path: "/customize", icon: Palette, label: "Personalizar", requiredRoles: ["Administrador", "Comercial"] },
    { path: "/reports", icon: PieChart, label: "Reportes", requiredRoles: ["Administrador", "Contable"] },
    { path: "/admin/roles", icon: UserCog, label: "Roles", requiredRoles: ["Administrador"] },
  ];

  const availableNavItems = navItems.filter(item => {
    if (!item.requiredRoles || item.requiredRoles.length === 0) return true;
    return userRoles.some(userRole => item.requiredRoles.includes(userRole));
  });

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed w-full top-0 z-50 bg-white/90 dark:bg-dark-primary backdrop-blur-md border-b border-gray-200 dark:border-gray-800 shadow-sm"
    >
      <div className="max-w-[1920px] mx-auto px-4 lg:px-6">
        <div className="flex items-center h-20 justify-between">
          
          {/* Logo */}
          <Link to="/" className="flex items-center flex-shrink-0 mr-4">
            <img
              src="/assets/LOGO_PREMEZCLADOS.svg"
              alt="Logo"
              className="w-14 h-14 md:w-16 md:h-16 object-contain"
            />
            <div className="hidden xl:block ml-2 leading-tight">
              <span className="text-base font-bold text-gray-900 dark:text-white block">Premezclado</span>
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 block">Manzanillo, C.A.</span>
            </div>
          </Link>

          {/* Nav Items */}
          <div className="hidden md:flex items-center gap-1 flex-1 justify-center">
            {availableNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 ${
                    isActive 
                      ? "bg-brand-primary text-white dark:bg-dark-btn dark:text-white" 
                      : "text-gray-600 dark:text-gray-300 hover:bg-brand-primary hover:text-white dark:hover:bg-dark-btn"
                  }`}
                  title={item.label}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm font-semibold whitespace-nowrap">{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Utilidades (Derecha) */}
          <div className="flex items-center gap-2 flex-shrink-0">
            
            {/* Dark Mode */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-primary transition-colors border border-transparent"
              title="Alternar Tema"
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>

            {/* Mobile menu trigger */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* User Dropdown (Plan B Agrupado) */}
            {user && (
              <div className="relative group ml-1">
                <button className="flex items-center p-1 rounded-full hover:bg-gray-100 dark:hover:bg-dark-primary border border-transparent transition-all">
                  {/* Foto de Perfil / Avatar con FIX */}
                  <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-700 bg-brand-light flex items-center justify-center shadow-sm">
                    {user.picture && !imgError ? (
                      <img 
                        src={user.picture} 
                        alt="" 
                        className="w-full h-full object-cover"
                        onError={() => setImgError(true)}
                      />
                    ) : (
                      <span className="text-brand-primary font-bold text-lg">
                        {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                      </span>
                    )}
                  </div>
                </button>

                {/* Dropdown Box */}
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-dark-surface rounded-xl shadow-2xl border border-gray-100 dark:border-gray-800 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 z-50">
                  
                  <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 mb-1">
                    <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{user.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                  </div>

                  <div className="px-1">
                    <Link to="/dashboard" className="flex items-center gap-3 px-3 py-2 text-sm font-bold text-gray-700 dark:text-gray-200 rounded-lg hover:bg-brand-primary hover:text-white dark:hover:bg-dark-btn transition-colors">
                      <LayoutDashboard className="w-4 h-4" />
                      <span>Panel Principal</span>
                    </Link>

                    {userRoles.includes("Administrador") && (
                      <Link to="/settings" className="flex items-center gap-3 px-3 py-2 text-sm font-bold text-gray-700 dark:text-gray-200 rounded-lg hover:bg-brand-primary hover:text-white dark:hover:bg-dark-btn transition-colors">
                        <Settings className="w-4 h-4" />
                        <span>Configuración</span>
                      </Link>
                    )}

                    <Link to="/notifications" className="flex items-center gap-3 px-3 py-2 text-sm font-bold text-gray-700 dark:text-gray-200 rounded-lg hover:bg-brand-primary hover:text-white dark:hover:bg-dark-btn transition-colors">
                      <Bell className="w-4 h-4" />
                      <span>Notificaciones</span>
                    </Link>
                  </div>

                  <div className="my-1 border-t border-gray-100 dark:border-gray-800"></div>

                  <div className="px-1">
                    <button
                      onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm font-bold text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded-lg transition-all"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Cerrar Sesión</span>
                    </button>
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isOpen && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden overflow-hidden bg-white dark:bg-dark-surface border-t border-gray-100 dark:border-gray-800"
            >
              <div className="flex flex-col p-4 space-y-1">
                {availableNavItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="flex items-center gap-4 p-4 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-primary font-bold"
                    onClick={() => setIsOpen(false)}
                  >
                    <item.icon className="w-6 h-6" />
                    <span>{item.label}</span>
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
};

export default DashboardNavbar;
