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

// Importación de páginas y componentes
import HomepageNavbar from "./components/HomepageNavbar";
import Dashboard from "./pages/Dashboard";
import ClientsPage from "./pages/ClientsPage";
import BudgetsPage from "./pages/BudgetsPage";
import PaymentsPage from "./pages/PaymentsPage";
import Reports from "./sections/dashboard/Reports";
import Settings from "./sections/dashboard/Settings";
import HomePage from "./pages/HomePage";
import ProductDetailPage from "./pages/ProductDetailPage";
import ProductsCatalogPage from "./pages/ProductsCatalogPage";
import StructuralConcretesPage from "./pages/StructuralConcretesPage";
import PavementConcretesPage from "./pages/PavementConcretesPage";
import SpecialConcretesPage from "./pages/SpecialConcretesPage";
import ServicesPage from "./pages/ServicesPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import ProjectsPage from "./pages/ProjectsPage";

import DashboardLayout from "./layouts/DashboardLayout";
import AuthenticatedApiProvider from "./components/AuthenticatedApiProvider"; // Importar el nuevo provider
import ChatWidget from "./components/ChatWidget";
import ScrollToTop from "./components/ScrollToTop";

// Componente para manejar el scroll a las anclas (sin cambios)
const ScrollToAnchor = () => {
  const location = useLocation();
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.substring(1);
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  }, [location]);
  return null;
};

// Componente para proteger rutas
const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuth0();

  // Log para depurar el estado de la ruta protegida
  console.log(`[ProtectedRoute] isLoading: ${isLoading}, isAuthenticated: ${isAuthenticated}`);

  if (isLoading) {
    return <div>Cargando...</div>; // O un spinner/componente de carga más elaborado
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

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
          <Route element={
            <AuthenticatedApiProvider>
              <DashboardLayout />
            </AuthenticatedApiProvider>
          }>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/clients" element={<ClientsPage />} />
            <Route path="/budgets/*" element={<BudgetsPage />} />
            <Route path="/payments" element={<PaymentsPage />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
};

export default App;