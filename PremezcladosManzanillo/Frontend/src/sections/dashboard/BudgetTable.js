import React from 'react';
import { formatCurrency } from '../../utils/helpers';

const BudgetTable = ({ budgets, onView, onEdit, onDuplicate, onDelete }) => (
  <div className="overflow-x-auto bg-white dark:bg-dark-primary rounded-2xl p-5 shadow-sm border border-gray-200 dark:border-dark-surface">
    <table className="min-w-full">
      <thead>
        <tr className="text-left text-sm text-gray-500 dark:text-gray-400">
          <th className="p-3">Folio</th>
          <th className="p-3">Proyecto</th>
          <th className="p-3">Cliente</th>
          <th className="p-3">Fecha</th>
          <th className="p-3">Total</th>
          <th className="p-3">Estado</th>
          <th className="p-3">Acciones</th>
        </tr>
      </thead>
      <tbody>
        {budgets.map((b) => (
          <tr key={b.id} className="border-t border-gray-200 dark:border-dark-surface">
            <td className="p-3 text-gray-700 dark:text-gray-300">{b.folio}</td>
            <td className="p-3 font-semibold text-emerald-800 dark:text-green-300">{b.title}</td>
            <td className="p-3 text-gray-600 dark:text-gray-400">{b.clientName}</td>
            <td className="p-3 text-gray-500 dark:text-gray-400">{b.createdDateStr}</td>
            <td className="p-3 font-semibold text-gray-800 dark:text-gray-100">{formatCurrency(b.total ?? b.amount ?? 0)}</td>
            <td className="p-3">
              <span className="inline-block text-[11px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                {String(b.status)}
              </span>
            </td>
            <td className="p-3">
              <div className="flex gap-2">
                <button onClick={() => onView && onView(b)} className="text-gray-500 hover:text-emerald-600">Ver</button>
                <button onClick={() => onEdit && onEdit(b)} className="text-gray-500 hover:text-emerald-600">Editar</button>
                <button onClick={() => onDelete && onDelete(b)} className="text-gray-500 hover:text-red-600">Eliminar</button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default BudgetTable;
