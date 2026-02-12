import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useSearchParams, Navigate, useParams, useNavigate } from "react-router-dom";
import api from "../utils/api";
import { FileText, PlusCircle, List, LayoutGrid, Search } from "lucide-react";
import BudgetList from "../sections/dashboard/BudgetList.jsx";
import BudgetDetail from "../sections/dashboard/BudgetDetail.jsx";
import BudgetFormModal from "../sections/dashboard/BudgetFormModal.jsx"; // Importar el modal completo
import { format } from "date-fns";

const BudgetsPage = () => {
  const { user } = useAuth0();
  const userRoles = user?.["https://premezcladomanzanillo.com/roles"] || [];

  if (userRoles.includes('Contable') && !userRoles.includes('Administrador')) {
    return <Navigate to="/dashboard" replace />;
  }

  // Estado para presupuestos
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingId, setProcessingId] = useState(null); // Evitar doble click

  // Estados para Modales
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null); // Si es null, es creación
  const [viewingBudget, setViewingBudget] = useState(null);

  // Filtros
  const [viewMode, setViewMode] = useState("list");
  const [search, setSearch] = useState("");
  const [clientFilter, setClientFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");

  const fetchBudgets = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/budgets");
      setBudgets(response.data);
    } catch (err) {
      setError("Failed to fetch budgets.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBudgets();
  }, [fetchBudgets]);

  // Sincronizar filtro de estado con URL parameters
  const [searchParams] = useSearchParams();
  const { id: paramId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const statusParam = searchParams.get("status");
    if (statusParam) {
      setStatusFilter(statusParam);
    }
  }, [searchParams]);

  // Deep linking for specific budget
  useEffect(() => {
    if (paramId && paramId !== 'new') {
      // Try to find in already loaded budgets first to avoid extra request
      const found = budgets.find(b => b.id === paramId);
      if (found) {
        setViewingBudget(found);
      } else {
        // If not found (or not loaded yet), fetch specific budget
        // This ensures the link works even if the list is empty or loading
        api.get(`/api/budgets/${paramId}`)
          .then(res => setViewingBudget(res.data))
          .catch(err => console.error("Could not load linked budget:", err));
      }
    } else if (!paramId) {
      // If no ID in URL, close modal (user navigated back/cleared url)
      setViewingBudget(null);
    }
  }, [paramId, budgets]);

  // Opciones de clientes para filtro
  const clientOptions = useMemo(() => {
    const clients = new Map();
    budgets.forEach((b) => {
      if (b.client) {
        clients.set(b.client.id, b.client.name);
      }
    });
    const options = Array.from(clients, ([id, name]) => ({
      value: id,
      label: name,
    }));
    return [{ value: "all", label: "Todos los Clientes" }, ...options];
  }, [budgets]);

  // Filtrado
  const filteredBudgets = useMemo(() => {
    return budgets.filter((b) => {
      const matchesSearch =
        b.title.toLowerCase().includes(search.toLowerCase()) ||
        b.client?.name.toLowerCase().includes(search.toLowerCase());
      const matchesClient =
        clientFilter === "all" || b.clientId === clientFilter;
      const matchesStatus = statusFilter === "all" || b.status === statusFilter;
      const matchesDate =
        !dateFilter ||
        (b.createdAt &&
          format(new Date(b.createdAt), "yyyy-MM-dd") === dateFilter);
      return matchesSearch && matchesClient && matchesStatus && matchesDate;
    });
  }, [budgets, search, clientFilter, statusFilter, dateFilter]);

  // --- Handlers para CRUD ---

  const handleOpenCreateModal = () => {
    setEditingBudget(null); // Modo creación
    setIsFormModalOpen(true);
  };

  const handleEdit = (budget) => {
    setEditingBudget(budget); // Modo edición
    setIsFormModalOpen(true);
  };

  const handleCloseFormModal = () => {
    setIsFormModalOpen(false);
    setEditingBudget(null);
  };

  const handleSaveBudget = async (budgetData) => {
    try {
      if (editingBudget) {
        // Actualizar
        await api.put(`/api/budgets/${editingBudget.id}`, budgetData);
      } else {
        // Crear
        await api.post("/api/budgets", budgetData);
      }
      handleCloseFormModal();
      fetchBudgets(); // Recargar lista
    } catch (err) {
      console.error("Error saving budget:", err);
      const serverMsg = err.response?.data?.error || err.message || "Error desconocido";
      alert(`Error al guardar el presupuesto: ${serverMsg}`);
    }
  };

  const handleDelete = async (budgetId) => {
    if (processingId === budgetId) return;
    if (window.confirm("¿Estás seguro de que quieres eliminar este presupuesto?")) {
      try {
        setProcessingId(budgetId);
        await api.delete(`/api/budgets/${budgetId}`);
        await fetchBudgets();
      } catch (err) {
        setError("Failed to delete budget.");
        console.error(err);
      } finally {
        setProcessingId(null);
      }
    }
  };

  const handleApproveBudget = async (budgetId) => {
    if (processingId === budgetId) return;
    if (window.confirm("¿Estás seguro de que quieres aprobar este presupuesto?")) {
      try {
        setProcessingId(budgetId);
        await api.post(`/api/budgets/${budgetId}/approve`);
        await fetchBudgets();
      } catch (err) {
        const errorMsg = err.response?.data?.error || err.message || "Failed to approve budget.";
        setError(errorMsg);
        alert(`Error: ${errorMsg}`);
        console.error(err);
      } finally {
        setProcessingId(null);
      }
    }
  };

  const handleRejectBudget = async (budgetId, rejectionReason) => {
    if (processingId === budgetId) return;
    if (window.confirm("¿Estás seguro de que quieres rechazar este presupuesto?")) {
      try {
        setProcessingId(budgetId);
        await api.post(`/api/budgets/${budgetId}/reject`, { rejectionReason });
        await fetchBudgets();
      } catch (err) {
        const errorMsg = err.response?.data?.error || err.message || "Failed to reject budget.";
        setError(errorMsg);
        alert(`Error: ${errorMsg}`);
        console.error(err);
      } finally {
        setProcessingId(null);
      }
    }
  };

  // --- Handlers para Detalles ---
  const handleViewDetail = (budget) => {
    setViewingBudget(budget);
  };

  const handleCloseDetail = () => {
    setViewingBudget(null);
    navigate('/budgets'); // Clear ID from URL
  };

  if (loading) {
    return <div className="p-6 text-center">Cargando presupuestos...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="w-full p-6 dark:bg-dark-primary">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <FileText className="w-8 h-8 text-black dark:text-green-400" />
          <h1 className="text-3xl font-bold text-brand-primary dark:text-white">
            Presupuestos
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode("canvas")}
              className={`p-2 rounded-lg ${viewMode === "canvas"
                ? "bg-brand-primary text-white"
                : "bg-gray-200 dark:bg-dark-surface text-gray-600 dark:text-gray-300"
                }`}
            >
              <LayoutGrid size={20} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-lg ${viewMode === "list"
                ? "bg-brand-primary text-white"
                : "bg-gray-200 dark:bg-dark-surface text-gray-600 dark:text-gray-300"
                }`}
            >
              <List size={20} />
            </button>
          </div>
          <button
            onClick={handleOpenCreateModal}
            className="bg-brand-primary text-white px-4 py-2 rounded-xl hover:bg-brand-mid transition duration-150 flex items-center gap-2"
          >
            <PlusCircle size={20} />
            Nuevo Presupuesto
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-dark-primary rounded-2xl p-6 shadow-lg border border-brand-light dark:border-dark-surface mb-6">
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="flex-1 flex items-center gap-3 w-full md:w-auto">
            <Search className="w-5 h-5 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Buscar por título o cliente..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 p-3 border border-brand-light dark:border-dark-surface rounded-xl dark:bg-dark-surface focus:outline-none focus:ring-2 focus:ring-brand-mid dark:text-gray-200"
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto justify-end">
            <select
              value={clientFilter}
              onChange={(e) => setClientFilter(e.target.value)}
              className="p-3 border border-brand-light dark:border-dark-surface rounded-xl dark:bg-dark-surface text-sm dark:text-gray-200"
            >
              {clientOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="p-3 border border-brand-light dark:border-dark-surface rounded-xl dark:bg-dark-surface text-sm dark:text-gray-200"
            >
              <option value="all">Todos los Estados</option>

              <option value="PENDING">Pendiente</option>
              <option value="APPROVED">Aprobado</option>
              <option value="REJECTED">Rechazado</option>
            </select>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="p-3 border border-brand-light dark:border-dark-surface rounded-xl dark:bg-dark-surface text-sm dark:text-gray-200"
            />
          </div>
        </div>
      </div>

      <BudgetList
        budgets={filteredBudgets}
        viewMode={viewMode}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onApprove={handleApproveBudget}
        onReject={handleRejectBudget}
        onViewDetail={handleViewDetail}
        userRoles={userRoles}
        currentUserId={user?.sub}
        processingId={processingId}
      />

      {isFormModalOpen && (
        <BudgetFormModal
          isEditing={!!editingBudget}
          initialValues={editingBudget || {}}
          onSave={handleSaveBudget}
          onCancel={handleCloseFormModal}
          userRoles={userRoles}
        />
      )}

      {viewingBudget && (
        <BudgetDetail
          budget={viewingBudget}
          onClose={handleCloseDetail}
          onApprove={handleApproveBudget}
          userRoles={userRoles}
          processingId={processingId}
        />
      )}
    </div>
  );
};

export default BudgetsPage;
