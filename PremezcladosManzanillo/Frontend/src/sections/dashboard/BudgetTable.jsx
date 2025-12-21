import React from 'react';
import { format } from 'date-fns';
import { Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';

const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value || 0);
};

const BudgetTable = ({ budgets, onEdit, onDelete, onApprove, onReject, onViewDetail, canEditOrDeleteBudget, canApproveOrRejectBudget, userRoles = [] }) => (
  <div className="overflow-x-auto bg-white dark:bg-dark-primary rounded-2xl shadow-lg border border-brand-light dark:border-dark-surface">
    <table className="min-w-full divide-y divide-brand-light dark:divide-dark-surface">
      <thead className="dark:bg-dark-surface">
        <tr className="text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
          <th scope="col" className="px-6 py-3">Título</th>
          <th scope="col" className="px-6 py-3">Observaciones</th>
          <th scope="col" className="px-6 py-3">Cliente</th>
          <th scope="col" className="px-6 py-3">Fecha</th>
          <th scope="col" className="px-6 py-3">Fecha Entrega</th>
          <th scope="col" className="px-6 py-3">Volumen</th>
          <th scope="col" className="px-6 py-3">Total</th>
          <th scope="col" className="px-6 py-3">Estado</th>
          <th scope="col" className="px-6 py-3">Procesado Por</th>
          <th scope="col" className="px-6 py-3">Procesado El</th>
          <th scope="col" className="px-6 py-3">Razón Rechazo</th>
          <th scope="col" className="px-6 py-3 text-right">Acciones</th>
        </tr>
      </thead>
      <tbody className="bg-white dark:bg-dark-primary divide-y divide-brand-light dark:divide-dark-surface">
        {budgets.map((budget) => (
          <tr 
            key={budget.id} 
            className="hover:bg-brand-light/20 dark:hover:bg-dark-surface cursor-pointer transition-colors duration-150"
            onClick={() => onViewDetail(budget)}
          >
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-brand-primary dark:text-gray-100">{budget.title}</div>
                <div className="text-xs text-brand-text dark:text-gray-400">{budget.products.length} items</div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-xs truncate" title={budget.observations}>
              {budget.observations || 'N/A'}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-text dark:text-gray-300">{budget.client?.name || 'N/A'}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-text dark:text-gray-300">{format(new Date(budget.createdAt), 'dd/MM/yyyy')}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-text dark:text-gray-300">
                {budget.deliveryDate ? format(new Date(budget.deliveryDate), 'dd/MM/yyyy') : 'N/A'}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-text dark:text-gray-300">
                {budget.volume ? `${budget.volume} m³` : 'N/A'}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-brand-primary dark:text-gray-100">
              { (budget.status === 'APPROVED' || userRoles.includes('Contable') || userRoles.includes('Comercial') || userRoles.includes('Administrador')) ? formatCurrency(budget.total) : '—' }
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                budget.status === 'APPROVED' ? 'bg-green-100 text-green-800 dark:bg-green-900' :
                budget.status === 'REJECTED' ? 'bg-red-100 text-red-800 dark:bg-red-900' :
                budget.status === 'EXPIRED' ? 'bg-gray-100 text-gray-800 dark:bg-gray-900' :
                'bg-yellow-100 text-yellow-800 dark:bg-yellow-900'
              }`}>
                {budget.status === 'EXPIRED' ? 'VENCIDO' : budget.status}
              </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-text dark:text-gray-300">
              {(() => {
                const name = budget.processedBy?.name?.trim();
                const email = budget.processedBy?.email;
                const isGeneric = !name || 
                                 name.toLowerCase() === 'unnamed user' || 
                                 name.toLowerCase() === 'usuario';
                
                if (!isGeneric) return name;
                if (email) return email;
                return budget.status !== 'PENDING' ? 'Sistema' : 'N/A';
              })()}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-text dark:text-gray-300">
              {budget.processedAt ? format(new Date(budget.processedAt), 'dd/MM/yyyy') : 'N/A'}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 dark:text-red-400">
              {budget.rejectionReason || 'N/A'}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <div className="flex items-center justify-end gap-2">
                {canApproveOrRejectBudget(budget) && (
                    <>
                        <button 
                          onClick={(e) => { e.stopPropagation(); onApprove(budget.id); }} 
                          title="Aprobar" 
                          className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                        >
                            <CheckCircle className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); onReject(budget); }} 
                          title="Rechazar" 
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        >
                            <XCircle className="w-5 h-5" />
                        </button>
                    </>
                )}
                {canEditOrDeleteBudget(budget) && (
                    <>
                        <button 
                          onClick={(e) => { e.stopPropagation(); onEdit(budget); }} 
                          className="text-brand-mid hover:text-brand-primary dark:text-green-400 dark:hover:text-green-300" 
                          title="Editar"
                        >
                            <Edit className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); onDelete(budget.id); }} 
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300" 
                          title="Eliminar"
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>
                    </>
                )}
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default BudgetTable;
