import React from 'react';
import { Trash2, Receipt, MapPin, User, ArrowRight } from 'lucide-react';
import { formatCurrency } from '../../utils/helpers';

const CurrentBudgetSidebar = ({ budget, items, onUpdateQuantity, onRemoveItem, onSaveBudget, userRoles }) => {
  const isPrivileged = userRoles.includes('Administrador') || userRoles.includes('Contable');

  const calculateTotal = () => {
    return items.reduce((total, item) => total + (item.quantity * item.unitPrice), 0);
  };

  return (
    <div className="bg-white dark:bg-dark-surface p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 h-full flex flex-col">
      {/* Header Info */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Receipt className="w-5 h-5 text-brand-primary" />
          <h2 className="text-lg font-black text-gray-800 dark:text-white uppercase tracking-tight">Resumen</h2>
        </div>
        
        {budget && (
          <div className="space-y-1.5 p-3 bg-gray-50 dark:bg-dark-primary/30 rounded-lg border border-gray-100 dark:border-gray-800">
            <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 leading-tight">{budget.title}</h3>
            <div className="flex items-center gap-2 text-[11px] text-gray-500 dark:text-gray-400">
              <User size={12} className="flex-shrink-0" />
              <span className="truncate">{budget.client?.name}</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-gray-500 dark:text-gray-400">
              <MapPin size={12} className="flex-shrink-0" />
              <span className="truncate">{budget.address}</span>
            </div>
          </div>
        )}
      </div>

      <div className="flex-grow overflow-y-auto space-y-2 pr-1 custom-scrollbar">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-gray-400">
            <p className="text-xs">El presupuesto está vacío.</p>
            <p className="text-[10px]">Añade productos del catálogo.</p>
          </div>
        ) : (
          items.map((item) => (
            <div key={item.productId} className="group relative flex items-center justify-between bg-white dark:bg-dark-primary/60 p-2 rounded-lg border border-gray-100 dark:border-gray-800 hover:border-brand-primary/20 transition-all">
              <div className="flex-1 min-w-0 pr-2">
                <p className="text-xs font-bold text-gray-800 dark:text-gray-100 truncate">{item.name}</p>
                {isPrivileged && (
                  <p className="text-[10px] text-gray-500 font-medium">{formatCurrency(item.unitPrice)} c/u</p>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => onUpdateQuantity(item.productId, parseInt(e.target.value, 10) || 1)}
                  className="w-12 h-7 text-[11px] font-bold rounded-md border-gray-200 dark:bg-dark-surface dark:border-gray-700 text-center focus:ring-1 focus:ring-brand-primary p-0"
                />
                <button 
                  onClick={() => onRemoveItem(item.productId)}
                  className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-all"
                  title="Eliminar item"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {items.length > 0 && (
        <div className="mt-4 space-y-3">
          {isPrivileged && (
            <div className="flex justify-between items-end p-3 bg-brand-primary/5 dark:bg-brand-primary/10 rounded-xl border border-brand-primary/10">
              <span className="text-[10px] font-black text-brand-primary uppercase tracking-widest">Total Estimado</span>
              <span className="text-xl font-black text-gray-900 dark:text-white leading-none">
                {formatCurrency(calculateTotal())}
              </span>
            </div>
          )}
          
          <button
            onClick={onSaveBudget}
            className="w-full h-12 flex items-center justify-center gap-2 bg-brand-primary text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-brand-mid transition-all shadow-md transform active:scale-[0.98]"
          >
            Guardar y Continuar
            <ArrowRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
};

export default CurrentBudgetSidebar;
