import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Edit, Trash2, CheckCircle, XCircle } from 'lucide-react'; // Added CheckCircle, XCircle
import { format } from 'date-fns';
import BudgetTable from './BudgetTable.jsx';
import Modal from '../../components/Modal.jsx'; // Assuming a generic Modal component

const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value || 0);
};

const BudgetList = ({ budgets = [], viewMode, onEdit, onDelete, onApprove, onReject, onViewDetail, userRoles, currentUserId, processingId }) => {
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [budgetToReject, setBudgetToReject] = useState(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');

  const canEditOrDeleteBudget = (budget) => {
    // Admin and Comercial can always edit/delete
    if (userRoles.includes('Administrador') || userRoles.includes('Comercial')) return true;

    // Contable can edit/delete APPROVED or PENDING budgets
    if (userRoles.includes('Contable') && (budget.status === 'APPROVED' || budget.status === 'PENDING')) return true;

    // Usuario can delete PENDING budgets they own created TODAY
    const isOwner = budget.creatorId === currentUserId;
    if (userRoles.includes('Usuario') && budget.status === 'PENDING' && isOwner) {
      const today = new Date().setHours(0, 0, 0, 0);
      const created = new Date(budget.createdAt).setHours(0, 0, 0, 0);
      return created === today;
    }

    return false;
  };

  const canApproveOrRejectBudget = (budget) => {
    // Admin AND Contable can approve/reject if budget is PENDING
    const isPrivileged = userRoles.includes('Administrador') || userRoles.includes('Contable') || userRoles.includes('Comercial');
    return isPrivileged && budget.status === 'PENDING';
  };

  const handleOpenRejectionModal = (budget) => {
    setBudgetToReject(budget);
    setShowRejectionModal(true);
  };

  const handleConfirmRejection = () => {
    if (budgetToReject && rejectionReasonInput.trim()) {
      onReject(budgetToReject.id, rejectionReasonInput.trim());
      setShowRejectionModal(false);
      setBudgetToReject(null);
      setRejectionReasonInput('');
    } else {
      alert('La razón de rechazo no puede estar vacía.');
    }
  };

  // Group by client for canvas view
  const groupedByClient = useMemo(() => {
    if (viewMode !== 'canvas') return [];
    const groups = new Map();
    budgets.forEach(b => {
      const clientName = b.client?.name || 'Cliente no asignado';
      if (!groups.has(clientName)) {
        groups.set(clientName, []);
      }
      groups.get(clientName).push(b);
    });
    return Array.from(groups.entries());
  }, [budgets, viewMode]);

  if (budgets.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500 dark:text-gray-400">No hay presupuestos que coincidan con la búsqueda.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {viewMode === 'canvas' ? (
        <div className="space-y-6">
          {groupedByClient.map(([clientName, clientBudgets]) => (
            <div key={clientName}>
              <h3 className="text-xl font-semibold text-brand-primary dark:text-white mb-3">{clientName}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {clientBudgets.map((budget, index) => (
                  <motion.div
                    key={budget.id}
                    onClick={() => onViewDetail(budget)}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white dark:bg-dark-primary rounded-2xl shadow-lg border border-brand-light dark:border-dark-surface flex flex-col justify-between p-5 cursor-pointer"
                  >
                    <div>
                      <div className="flex justify-between items-start">
                        <h4 className="text-lg font-semibold text-brand-primary dark:text-gray-100 mb-1 pr-2">{budget.title}</h4>
                        <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${budget.status === 'APPROVED' ? 'bg-green-100 text-green-800 dark:bg-green-900' :
                          budget.status === 'REJECTED' ? 'bg-red-100 text-red-800 dark:bg-red-900' :
                            budget.status === 'EXPIRED' ? 'bg-gray-100 text-gray-800 dark:bg-gray-900' :
                              'bg-yellow-100 text-yellow-800 dark:bg-yellow-900'
                          }`}>{budget.status === 'EXPIRED' ? 'VENCIDO' : budget.status}</span>
                      </div>
                      <p className="text-sm text-brand-text dark:text-gray-400">{format(new Date(budget.createdAt), 'dd/MM/yyyy')}</p>
                      {budget.processedBy && (
                        <p className="text-xs text-brand-text dark:text-gray-500 mt-1">
                          Procesado por: {budget.processedBy.name} el {format(new Date(budget.processedAt), 'dd/MM/yyyy')}
                        </p>
                      )}
                      {budget.rejectionReason && (
                        <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                          Motivo de rechazo: {budget.rejectionReason}
                        </p>
                      )}
                      {budget.observations && (
                        <p className="text-xs text-gray-500 mt-2 italic truncate" title={budget.observations}>
                          "{budget.observations}"
                        </p>
                      )}
                    </div>
                    <div className="mt-4 pt-4 border-t border-brand-light dark:border-dark-surface">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-sm text-brand-text dark:text-gray-300">{budget.products.length} items</span>
                        <span className="text-xl font-bold text-brand-primary dark:text-gray-100">{(budget.status === 'APPROVED' || userRoles.includes('Contable') || userRoles.includes('Comercial') || userRoles.includes('Administrador')) ? formatCurrency(budget.total) : '—'}</span>
                      </div>
                      <div className="flex justify-end gap-2">
                        {canApproveOrRejectBudget(budget) && (
                          <>
                            <button
                              onClick={(e) => { e.stopPropagation(); onApprove(budget.id); }}
                              disabled={processingId === budget.id}
                              title="Aprobar"
                              className={`text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 ${processingId === budget.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                              <CheckCircle className="w-5 h-5" />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleOpenRejectionModal(budget); }}
                              disabled={processingId === budget.id}
                              title="Rechazar"
                              className={`text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 ${processingId === budget.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                              <XCircle className="w-5 h-5" />
                            </button>
                          </>
                        )}
                        {canEditOrDeleteBudget(budget) && (
                          <>
                            <button
                              onClick={(e) => { e.stopPropagation(); onEdit(budget); }}
                              title="Editar"
                              className="text-brand-mid hover:text-brand-primary dark:text-green-400 dark:hover:text-green-300"
                            >
                              <Edit className="w-5 h-5" />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); onDelete(budget.id); }}
                              title="Eliminar"
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <BudgetTable
          budgets={budgets}
          onEdit={onEdit}
          onDelete={onDelete}
          onApprove={onApprove}
          onReject={handleOpenRejectionModal} // Pass function to open rejection modal
          onViewDetail={onViewDetail}
          userRoles={userRoles}
          currentUserId={currentUserId}
          canEditOrDeleteBudget={canEditOrDeleteBudget}

          canApproveOrRejectBudget={canApproveOrRejectBudget}
          processingId={processingId}
        />
      )}

      {showRejectionModal && (
        <Modal onClose={() => setShowRejectionModal(false)} title="Rechazar Presupuesto">
          <p className="mb-4 text-brand-text dark:text-gray-300">
            Estás a punto de rechazar el presupuesto: <span className="font-bold">{budgetToReject?.title}</span>.
            Por favor, introduce una razón para el rechazo.
          </p>
          <textarea
            value={rejectionReasonInput}
            onChange={(e) => setRejectionReasonInput(e.target.value)}
            className="w-full p-2 border rounded-lg dark:bg-dark-surface dark:text-gray-200"
            rows="4"
            placeholder="Razón de rechazo..."
          ></textarea>
          <div className="flex justify-end gap-3 mt-4">
            <button
              onClick={() => setShowRejectionModal(false)}
              className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-dark-surface text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirmRejection}
              className="px-5 py-2 rounded-lg bg-red-700 text-white hover:bg-red-600"
            >
              Confirmar Rechazo
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default BudgetList;
