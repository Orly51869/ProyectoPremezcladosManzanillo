import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import api from '../utils/api';
import { FileText, PlusCircle, List, LayoutGrid, Search } from 'lucide-react';
import BudgetForm from '../sections/dashboard/BudgetForm.jsx';
import BudgetList from '../sections/dashboard/BudgetList.jsx';
import BudgetDetail from '../sections/dashboard/BudgetDetail.jsx';
import { format } from 'date-fns';

const BudgetsPage = () => {
  const { user } = useAuth0();
  const userRoles = user?.['https://premezcladomanzanillo.com/roles'] || [];

  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [showForm, setShowForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [viewingBudget, setViewingBudget] = useState(null);

  const [viewMode, setViewMode] = useState('list'); // 'list' or 'canvas'
  const [search, setSearch] = useState('');
  const [clientFilter, setClientFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');

  const fetchBudgets = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/budgets');
      setBudgets(response.data);
    } catch (err) {
      setError('Failed to fetch budgets.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBudgets();
  }, [fetchBudgets]);

  // Get unique clients from budgets for the filter dropdown
  const clientOptions = useMemo(() => {
    const clients = new Map();
    budgets.forEach(b => {
      if (b.client) {
        clients.set(b.client.id, b.client.name);
      }
    });
    const options = Array.from(clients, ([id, name]) => ({ value: id, label: name }));
    return [{ value: 'all', label: 'Todos los Clientes' }, ...options];
  }, [budgets]);

  const filteredBudgets = useMemo(() => {
    return budgets.filter(b => {
      // Search filter
      const matchesSearch = b.title.toLowerCase().includes(search.toLowerCase()) ||
                            b.client?.name.toLowerCase().includes(search.toLowerCase());

      // Client filter
      const matchesClient = clientFilter === 'all' || b.clientId === clientFilter;

      // Status filter
      const matchesStatus = statusFilter === 'all' || b.status === statusFilter;

      // Date filter
      const matchesDate = !dateFilter || (b.createdAt && format(new Date(b.createdAt), 'yyyy-MM-dd') === dateFilter);

      return matchesSearch && matchesClient && matchesStatus && matchesDate;
    });
  }, [budgets, search, clientFilter, statusFilter, dateFilter]);

  const handleAddNew = () => {
    setEditingBudget(null);
    setShowForm(true);
  };

  const handleEdit = (budget) => {
    setEditingBudget(budget);
    setShowForm(true);
  };

  const handleViewDetail = (budget) => {
    setViewingBudget(budget);
  };

  const handleCloseDetail = () => {
    setViewingBudget(null);
  };

  const handleDelete = async (budgetId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este presupuesto?')) {
      try {
        await api.delete(`/api/budgets/${budgetId}`);
        fetchBudgets(); // Refresh the list
      } catch (err) {
        setError('Failed to delete budget.');
        console.error(err);
      }
    }
  };

  const handleSave = async (budgetData) => {
    try {
      if (editingBudget) {
        await api.put(`/api/budgets/${editingBudget.id}`, budgetData);
      } else {
        await api.post('/api/budgets', budgetData);
      }
      setShowForm(false);
      setEditingBudget(null);
      fetchBudgets(); // Refresh the list
    } catch (err) {
      setError('Failed to save budget.');
      console.error(err);
    }
  };

  const handleApproveBudget = async (budgetId) => {
    if (window.confirm('¿Estás seguro de que quieres aprobar este presupuesto?')) {
      try {
        await api.post(`/api/budgets/${budgetId}/approve`);
        fetchBudgets();
      } catch (err) {
        setError('Failed to approve budget.');
        console.error(err);
      }
    }
  };

  const handleRejectBudget = async (budgetId, rejectionReason) => {
    if (window.confirm('¿Estás seguro de que quieres rechazar este presupuesto?')) {
      try {
        await api.post(`/api/budgets/${budgetId}/reject`, { rejectionReason });
        fetchBudgets();
      } catch (err) {
        setError('Failed to reject budget.');
        console.error(err);
      }
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingBudget(null);
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
          <h1 className="text-3xl font-bold text-brand-primary dark:text-white">Presupuestos</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-2">
            <button onClick={() => setViewMode('canvas')} className={`p-2 rounded-lg ${viewMode === 'canvas' ? 'bg-brand-primary text-white' : 'bg-gray-200 dark:bg-dark-surface text-gray-600 dark:text-gray-300'}`}>
              <LayoutGrid size={20} />
            </button>
            <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-brand-primary text-white' : 'bg-gray-200 dark:bg-dark-surface text-gray-600 dark:text-gray-300'}`}>
              <List size={20} />
            </button>
          </div>
          {!showForm && (
            <button
              onClick={handleAddNew}
              className="bg-brand-primary text-white px-4 py-2 rounded-xl hover:bg-brand-mid transition duration-150 flex items-center gap-2"
            >
              <PlusCircle size={20} />
              Nuevo Presupuesto
            </button>
          )}
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
            <select value={clientFilter} onChange={e => setClientFilter(e.target.value)} className="p-3 border border-brand-light dark:border-dark-surface rounded-xl dark:bg-dark-surface text-sm dark:text-gray-200">
              {clientOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="p-3 border border-brand-light dark:border-dark-surface rounded-xl dark:bg-dark-surface text-sm dark:text-gray-200">
              <option value="all">Todos los Estados</option>
              <option value="PENDING">Pendiente</option>
              <option value="APPROVED">Aprobado</option>
              <option value="REJECTED">Rechazado</option>
            </select>
            <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)} className="p-3 border border-brand-light dark:border-dark-surface rounded-xl dark:bg-dark-surface text-sm dark:text-gray-200" />
          </div>
        </div>
      </div>


      {showForm ? (
        <BudgetForm
          initialValues={editingBudget || {}}
          onSave={handleSave}
          onCancel={handleCancel}
          userRoles={userRoles}
        />
      ) : (
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
        />
      )}

      {viewingBudget && (
        <BudgetDetail
          budget={viewingBudget}
          onClose={handleCloseDetail}
          onApprove={handleApproveBudget}
          userRoles={userRoles}
        />
      )}
    </div>
  );
};

export default BudgetsPage;