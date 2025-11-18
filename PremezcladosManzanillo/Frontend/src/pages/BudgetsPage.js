//--- file src/pages/BudgetsPage.js ---
import React, { useState, useEffect } from 'react';
import { FileText } from 'lucide-react'; // 💥 ÍCONO AÑADIDO 💥
import BudgetForm from '../sections/dashboard/BudgetForm';
import BudgetList from '../sections/dashboard/BudgetList';
import BudgetDetail from '../sections/dashboard/BudgetDetail';
import { mockBudgets } from '../mock/data';
import { generateId } from '../utils/helpers'; // Asumo que esta función existe o la creaste

const BudgetsPage = () => {
  const [budgets, setBudgets] = useState(() => Array.isArray(mockBudgets) ? [...mockBudgets] : []);
  const [showBudgetForm, setShowBudgetForm] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [viewBudget, setViewBudget] = useState(null);
  const [editBudget, setEditBudget] = useState(null);

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

      setBudgets(prev => prev.map(b => b.id === editBudget.id ? updated : b));
      setEditBudget(null);
      setEditingClient(null);
      setShowBudgetForm(false);
      alert(`Presupuesto actualizado — Folio: ${updated.folio || updated.id}`);
      return;
    }

    const year = new Date().getFullYear();
    const lastBudgetForYear = budgets
      .filter(b => b.id.startsWith(`P-${year}`))
      .map(b => parseInt(b.id.split('-')[2])) // Assuming format P-YYYY-NNN
      .sort((a, b) => b - a)[0] || 0;
    const newId = (lastBudgetForYear + 1).toString().padStart(3, '0');
    const folio = `P-${year}-${newId}`;

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
    setBudgets(prev => [copy, ...prev]);
    alert(`Presupuesto duplicado — Folio: ${folio}`);
  };

  const handleDelete = (b) => {
    if (!confirm('¿Eliminar presupuesto?')) return;
    // actualizar estado
    setBudgets(prev => prev.filter(x => x.id !== b.id));
    // si estaba abierto en vista o editando, cerrar
    if (viewBudget?.id === b.id) setViewBudget(null);
    if (editBudget?.id === b.id) { setEditBudget(null); setShowBudgetForm(false); }
  };

  return (
    // Aseguramos que el contenido use la pantalla completa y padding
    <div className="w-full p-6"> 
      
      {/* 💥 ENCABEZADO CORREGIDO CON ÍCONO Y DARK MODE 💥 */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          {/* Ícono: Verde oscuro en modo claro, verde más brillante en modo oscuro */}
          <FileText className="w-8 h-8 text-brand-primary dark:text-green-400" /> 
          {/* Título: Usa color primario en ambos modos, pero debe contrastar si se cambia el fondo */}
          <h1 className="text-3xl font-bold text-brand-primary dark:text-dark-primary">Presupuestos</h1> 
        </div>
        <div className="flex items-center gap-2">
          {/* Botón: Sigue el estilo primario */}
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
                onDuplicate={handleDuplicate}
                onConvert={() => alert('Convertir a comprobante (simulado)')}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BudgetsPage;