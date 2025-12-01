import React, { useState, useEffect } from 'react';
import { FileText, List, LayoutGrid } from 'lucide-react'; // 💥 ÍCONOS AÑADIDOS 💥
import BudgetForm from '../sections/dashboard/BudgetForm.jsx';
import BudgetList from '../sections/dashboard/BudgetList.jsx';
import BudgetDetail from '../sections/dashboard/BudgetDetail.jsx';
import { mockBudgets } from '../mock/data';
import { generateId } from '../utils/helpers'; // Asumo que esta función existe o la creaste

const BudgetsPage = () => {
  const [budgets, setBudgets] = useState(() => Array.isArray(mockBudgets) ? [...mockBudgets] : []);
  const [showBudgetForm, setShowBudgetForm] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [viewBudget, setViewBudget] = useState(null);
  const [editBudget, setEditBudget] = useState(null);
  const [viewMode, setViewMode] = useState('canvas'); // 'canvas' or 'list'

  useEffect(() => {
    if (Array.isArray(mockBudgets)) setBudgets([...mockBudgets]);
  }, []);

  const openNewBudgetForClient = (client) => {
    setEditingClient(client || null);
    setEditBudget(null);
    setShowBudgetForm(true);
  };

  const openNewBudget = () => openNewBudgetForClient(null);

  // Guardar: crea o actualiza según exista editBudget
  const handleSaveBudget = (formData) => {
    if (editBudget) {
      // actualizar existente
      const updated = {
        ...editBudget,
        ...formData,
        title: formData.nombreProyecto || editBudget.title,
        clientId: editingClient?.id || formData.clientId || editBudget.clientId,
        clientName: editingClient?.name || formData.clientName || editBudget.clientName,
      };

      // actualizar mockBudgets in-memory
      if (Array.isArray(mockBudgets)) {
        const idx = mockBudgets.findIndex(b => b.id === editBudget.id);
        if (idx >= 0) mockBudgets[idx] = { ...mockBudgets[idx], ...updated };
      }

      setBudgets(prev => prev.map(b => b.id === editBudget.id ? updated : b));
      setEditBudget(null);
      setEditingClient(null);
      setShowBudgetForm(false);
      alert(`Presupuesto actualizado — Folio: ${updated.folio || updated.id}`);
      return;
    }

    // crear nuevo
    const id = (typeof generateId === 'function') ? generateId() : String(Date.now());
    const folio = `P-${id}`;

    const newBudget = {
      id: folio,
      folio,
      title: formData.nombreProyecto || `Presupuesto ${folio}`,
      clientId: editingClient?.id || formData.clientId || null,
      clientName: editingClient?.name || formData.clientName || 'Cliente desconocido',
      ...formData,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    if (Array.isArray(mockBudgets)) mockBudgets.unshift(newBudget);
    setBudgets(prev => [newBudget, ...prev]);

    setShowBudgetForm(false);
    setEditingClient(null);
    alert(`Presupuesto guardado — Folio: ${folio}`);
  };

  const handleView = (b) => {
    setViewBudget(b);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEdit = (b) => {
    setEditBudget(b);
    setEditingClient({ id: b.clientId, name: b.clientName });
    setShowBudgetForm(true);
  };

  const handleDuplicate = (b) => {
    const id = (typeof generateId === 'function') ? generateId() : String(Date.now());
    const folio = `P-${id}`;
    const copy = { ...b, id: folio, folio, title: `${b.title} (Copia)`, createdAt: new Date().toISOString() };
    if (Array.isArray(mockBudgets)) mockBudgets.unshift(copy);
    setBudgets(prev => [copy, ...prev]);
    alert(`Presupuesto duplicado — Folio: ${folio}`);
  };

  const handleDelete = (b) => {
    if (!confirm('¿Eliminar presupuesto?')) return;
    // eliminar de mock
    if (Array.isArray(mockBudgets)) {
      const idx = mockBudgets.findIndex(x => x.id === b.id);
      if (idx >= 0) mockBudgets.splice(idx, 1);
    }
    // actualizar estado
    setBudgets(prev => prev.filter(x => x.id !== b.id));
    // si estaba abierto en vista o editando, cerrar
    if (viewBudget?.id === b.id) setViewBudget(null);
    if (editBudget?.id === b.id) { setEditBudget(null); setShowBudgetForm(false); }
  };

  return (
    // Aseguramos que el contenido use la pantalla completa y padding
    <div className="w-full p-6 dark:bg-dark-primary"> 
      
      {/* 💥 ENCABEZADO CORREGIDO CON ÍCONO Y DARK MODE 💥 */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          {/* Ícono: Verde oscuro en modo claro, verde más brillante en modo oscuro */}
          <FileText className="w-8 h-8 text-brand-primary dark:text-green-400" /> 
          {/* Título: Usa color primario en modo claro y un color de texto principal en modo oscuro */}
          <h1 className="text-3xl font-bold text-brand-primary dark:text-white">Presupuestos</h1> 
        </div>
        <div className="flex items-center gap-2">
          {/* Botón: Sigue el estilo primario */}
          <div className="flex gap-2">
            <button onClick={() => setViewMode('canvas')} className={`p-2 rounded-lg ${viewMode === 'canvas' ? 'bg-brand-primary text-white' : 'bg-gray-200 dark:bg-dark-surface text-gray-600 dark:text-gray-300'}`}>
              <LayoutGrid className="w-5 h-5" />
            </button>
            <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-brand-primary text-white' : 'bg-gray-200 dark:bg-dark-surface text-gray-600 dark:text-gray-300'}`}>
              <List className="w-5 h-5" />
            </button>
          </div>
          <button onClick={openNewBudget} className="bg-brand-primary text-white px-4 py-2 rounded-xl hover:bg-brand-mid transition duration-150">
            Nuevo Presupuesto
          </button>
        </div>
      </div>
      {/* ---------------------------------------------------- */}

      {showBudgetForm ? (
        <div className="mb-6">
          <BudgetForm
            initialValues={{
              clientId: editingClient?.id || '',
              clientName: editingClient?.name || '',
              ...(editBudget || {}),
            }}
            onSave={handleSaveBudget}
            onCancel={() => { setShowBudgetForm(false); setEditingClient(null); setEditBudget(null); }}
          />
        </div>
      ) : (
        <>
          <BudgetList
            budgets={budgets}
            viewMode={viewMode}
            onView={handleView}
            onEdit={handleEdit}
            onDuplicate={handleDuplicate}
            onDelete={handleDelete}
            onNewForClient={openNewBudgetForClient}
          />

          {viewBudget && (
            <div className="mt-4">
              <BudgetDetail
                budget={viewBudget}
                onClose={() => setViewBudget(null)}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BudgetsPage;