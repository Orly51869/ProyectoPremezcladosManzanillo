import React from 'react';
import { Trash2 } from 'lucide-react';

const CurrentBudgetSidebar = ({ budget, items, onUpdateQuantity, onRemoveItem, onSaveBudget, userRoles }) => {
  const isPrivileged = userRoles.includes('Administrador') || userRoles.includes('Contable');

  const calculateTotal = () => {
    return items.reduce((total, item) => total + (item.quantity * item.unitPrice), 0);
  };

  return (
    <div className="bg-white dark:bg-dark-surface p-6 rounded-lg shadow-lg h-full flex flex-col">
      <h2 className="text-2xl font-bold text-brand-primary dark:text-white mb-4">Resumen de Presupuesto</h2>
      
      {budget && (
        <div className="mb-4">
          <h3 className="font-bold">{budget.title}</h3>
          <p className="text-sm text-gray-500">{budget.client?.name}</p>
          <p className="text-sm text-gray-500">{budget.address}</p>
        </div>
      )}

      <hr className="my-4 border-gray-200 dark:border-gray-700" />

      <div className="flex-grow overflow-y-auto space-y-3">
        {items.length === 0 ? (
          <p className="text-gray-500 text-center mt-8">Añade productos del catálogo.</p>
        ) : (
          items.map((item, index) => (
            <div key={item.productId} className="flex items-center justify-between bg-gray-50 dark:bg-dark-primary p-3 rounded-lg">
              <div>
                <p className="font-semibold">{item.name}</p>
                {isPrivileged && (
                  <p className="text-sm text-gray-500">${item.unitPrice.toFixed(2)} c/u</p>
                )}
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => onUpdateQuantity(item.productId, parseInt(e.target.value, 10) || 1)}
                  className="w-20 rounded-lg border-gray-300 dark:bg-dark-surface dark:border-gray-600 text-center"
                />
                <button onClick={() => onRemoveItem(item.productId)}>
                  <Trash2 className="h-5 w-5 text-red-500 hover:text-red-700" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {items.length > 0 && (
        <div className="mt-auto pt-4">
          <hr className="my-4 border-gray-200 dark:border-gray-700" />
          {isPrivileged && (
            <div className="text-right text-2xl font-bold text-gray-800 dark:text-white mb-4">
              Total: ${calculateTotal().toFixed(2)}
            </div>
          )}
          <button
            onClick={onSaveBudget}
            className="w-full bg-brand-primary text-white px-4 py-3 rounded-xl hover:bg-brand-mid transition duration-150 font-bold"
          >
            Guardar y Enviar para Aprobación
          </button>
        </div>
      )}
    </div>
  );
};

export default CurrentBudgetSidebar;
