// Archivo: src/App.js
// Propósito: Ruteo principal de la aplicación y layout del panel.
import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Outlet,
  useLocation,
  Navigate,
} from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { CurrencyProvider } from "./context/CurrencyContext";
import { SettingsProvider } from "./context/SettingsContext";

// Importación de páginas y componentes
import HomepageNavbar from "./components/HomepageNavbar.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import ClientsPage from "./pages/ClientsPage.jsx";
import BudgetsPage from "./pages/BudgetsPage.jsx";
import ProductsPage from "./pages/ProductsPage.jsx"; // Importar la nueva página
import PaymentsPage from "./pages/PaymentsPage.jsx";
import InvoicesPage from "./pages/InvoicesPage.jsx"; // Importar la nueva página de facturas
import AdminRolesPage from "./pages/AdminRolesPage.jsx"; // Importar la nueva página de gestión de roles
import NotificationsPage from "./pages/NotificationsPage.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import Reports from "./sections/dashboard/Reports.jsx";
import Settings from "./sections/dashboard/Settings.jsx";
import HomePage from "./pages/HomePage.jsx";
import ProductDetailPage from "./pages/ProductDetailPage.jsx";
import ProductsCatalogPage from "./pages/ProductsCatalogPage.jsx";
import StructuralConcretesPage from "./pages/StructuralConcretesPage.jsx";
import PavementConcretesPage from "./pages/PavementConcretesPage.jsx";
import SpecialConcretesPage from "./pages/SpecialConcretesPage.jsx";
import ServicesPage from "./pages/ServicesPage.jsx";
import AboutPage from "./pages/AboutPage.jsx";
import ContactPage from "./pages/ContactPage.jsx";
import ProjectsPage from "./pages/ProjectsPage.jsx";
import BudgetBuilderPage from "./pages/BudgetBuilderPage.jsx";

import DashboardLayout from "./layouts/DashboardLayout.jsx";
import AuthenticatedApiProvider from "./components/AuthenticatedApiProvider.jsx"; // Importar el nuevo provider
import ChatWidget from "./components/ChatWidget.jsx";
import ScrollToTop from "./components/ScrollToTop";
import CustomizationPage from "./pages/CustomizationPage.jsx";

// Componente para manejar el scroll a las anclas (sin cambios)
const ScrollToAnchor = () => {
  const location = useLocation();
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.substring(1);
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'auto' });
      }
    }
  }, [location]);
  return null;
};

// Componente para proteger rutas
const ProtectedRoute = () => {
  const { isAuthenticated, isLoading, user } = useAuth0();
  const location = useLocation();

  // Obtener roles del usuario desde Auth0
  const userRoles = user?.['https://premezcladomanzanillo.com/roles'] || [];

  // Log para depurar el estado de la ruta protegida
  console.log(`[ProtectedRoute] isLoading: ${isLoading}, isAuthenticated: ${isAuthenticated}, userRoles: ${userRoles}`);

  if (isLoading) {
    return <div>Cargando...</div>; // O un spinner/componente de carga más elaborado
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Redirigir a usuarios con rol "Usuario" de /dashboard a /budgets
  // if (userRoles.includes("Usuario") && location.pathname === "/dashboard") {
  //   console.log("[ProtectedRoute] Usuario role detected, redirecting from /dashboard to /budgets");
  //   return <Navigate to="/budgets" replace />;
  // }

  return <Outlet />;
};

const App = () => {
  const { isLoading } = useAuth0();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
        <div className="text-xl font-semibold text-gray-800 dark:text-gray-200">Cargando...</div>
      </div>
    );
  }

  return (
    <SettingsProvider>
      <CurrencyProvider>
        <Router>
          <ScrollToTop />
          <ScrollToAnchor />
          <ChatWidget />
          <Routes>
            {/* Rutas Públicas */}
            <Route path="/" element={<HomePage />} />
            <Route path="/productos" element={<ProductsCatalogPage />} />
            <Route path="/productos/estructurales" element={<StructuralConcretesPage />} />
            <Route path="/productos/pavimentos" element={<PavementConcretesPage />} />
            <Route path="/productos/especiales" element={<SpecialConcretesPage />} />
            <Route path="/productos/:productId" element={<ProductDetailPage />} />
            <Route path="/servicios" element={<ServicesPage />} />
            <Route path="/nosotros" element={<AboutPage />} />
            <Route path="/contacto" element={<ContactPage />} />
            <Route path="/proyectos" element={<ProjectsPage />} />


            {/* Rutas Protegidas */}
            <Route element={<ProtectedRoute />}>
              <Route element={<AuthenticatedApiProvider />}> {/* AuthenticatedApiProvider ahora renderiza un Outlet */}
                <Route element={<DashboardLayout />}> {/* DashboardLayout envuelve las páginas del dashboard */}
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/clients" element={<ClientsPage />} />
                  <Route path="/notifications" element={<NotificationsPage />} />
                  <Route path="/budgets/*" element={<BudgetsPage />} />
                  <Route path="/dashboard/budgets/build/:id" element={<BudgetBuilderPage />} />
                  <Route path="/products-management" element={<ProductsPage />} />
                  <Route path="/payments" element={<PaymentsPage />} />
                  <Route path="/invoices" element={<InvoicesPage />} /> {/* Nueva ruta para la página de facturas */}
                  <Route path="/admin/roles" element={<AdminRolesPage />} />
                  <Route path="/customize" element={<CustomizationPage />} />
                  <Route path="/reports" element={<Reports />} />
                  <Route path="/settings" element={<Settings />} />
                </Route>
              </Route>
            </Route>
          </Routes>
        </Router>
      </CurrencyProvider>
    </SettingsProvider>
  );
};

export default App;