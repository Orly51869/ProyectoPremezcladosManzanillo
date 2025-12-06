import React from 'react';
import { format } from 'date-fns';
import { Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';

const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value || 0);
};

const BudgetTable = ({ budgets, onEdit, onDelete, onApprove, onReject, canEditOrDeleteBudget, canApproveOrRejectBudget }) => (
  <div className="overflow-x-auto bg-white dark:bg-dark-surface rounded-lg shadow-md border dark:border-gray-700">
    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
      <thead className="bg-gray-50 dark:bg-gray-800">
        <tr className="text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
          <th scope="col" className="px-6 py-3">Título</th>
          <th scope="col" className="px-6 py-3">Cliente</th>
          <th scope="col" className="px-6 py-3">Fecha Creación</th>
          <th scope="col" className="px-6 py-3">Fecha Entrega</th>
          <th scope="col" className="px-6 py-3">Volumen (m³)</th>
          <th scope="col" className="px-6 py-3">Total</th>
          <th scope="col" className="px-6 py-3">Estado</th>
          <th scope="col" className="px-6 py-3">Procesado Por</th>
          <th scope="col" className="px-6 py-3">Fecha Proceso</th>
          <th scope="col" className="px-6 py-3">Motivo Rechazo</th>
          <th scope="col" className="relative px-6 py-3"><span className="sr-only">Acciones</span></th>
        </tr>
      </thead>
      <tbody className="bg-white dark:bg-dark-surface divide-y divide-gray-200 dark:divide-gray-700">
        {budgets.map((budget) => (
          <tr key={budget.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900 dark:text-white">{budget.title}</div>
                <div className="text-xs text-gray-500">{budget.products.length} items</div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{budget.client?.name || 'N/A'}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{format(new Date(budget.createdAt), 'dd/MM/yyyy')}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                {budget.deliveryDate ? format(new Date(budget.deliveryDate), 'dd/MM/yyyy') : 'N/A'}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                {budget.volume ? `${budget.volume} m³` : 'N/A'}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white">{formatCurrency(budget.total)}</td>
            <td className="px-6 py-4 whitespace-nowrap">
              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                budget.status === 'APPROVED' ? 'bg-green-100 text-green-800 dark:bg-green-900' :
                budget.status === 'REJECTED' ? 'bg-red-100 text-red-800 dark:bg-red-900' :
                'bg-yellow-100 text-yellow-800 dark:bg-yellow-900'
              }`}>
                {budget.status}
              </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
              {budget.processedBy?.name || 'N/A'}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
              {budget.processedAt ? format(new Date(budget.processedAt), 'dd/MM/yyyy') : 'N/A'}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-red-500 dark:text-red-400">
              {budget.rejectionReason || 'N/A'}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <div className="flex items-center justify-end gap-2">
                {canApproveOrRejectBudget(budget) && (
                    <>
                        <button onClick={() => onApprove(budget.id)} title="Aprobar" className="p-2 rounded-lg text-green-600 hover:bg-green-100 dark:hover:bg-green-900">
                            <CheckCircle className="w-5 h-5" />
                        </button>
                        <button onClick={() => onReject(budget)} title="Rechazar" className="p-2 rounded-lg text-red-600 hover:bg-red-100 dark:hover:bg-red-900">
                            <XCircle className="w-5 h-5" />
                        </button>
                    </>
                )}
                {canEditOrDeleteBudget(budget) && (
                    <>
                        <button onClick={() => onEdit(budget)} className="text-blue-600 hover:text-blue-900" title="Editar">
                        <Edit size={18} />
                        </button>
                        <button onClick={() => onDelete(budget.id)} className="text-red-600 hover:text-red-900" title="Eliminar">
                        <Trash2 size={18} />
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
