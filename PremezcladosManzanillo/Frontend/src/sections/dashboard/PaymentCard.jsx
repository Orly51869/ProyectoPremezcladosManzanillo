import React from 'react';
import { formatCurrency } from "../../utils/helpers";

const PaymentCard = ({ payment, onValidate, onResend }) => {
  const handleValidateClick = () => {
    const approve = confirm("¿Marcar pago como VALIDADO?");
    if (approve) {
      onValidate(payment.id, { approve: true });
    } else {
      const motive = prompt("Ingrese motivo de rechazo:");
      if (motive) onValidate(payment.id, { approve: false, observations: motive });
    }
  };

  return (
    <div className="bg-white dark:bg-dark-surface rounded-lg shadow-md p-4 border border-brand-light dark:border-gray-700">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-semibold text-brand-primary dark:text-green-400">{payment.budgetId}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">ID: {payment.id}</p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            payment.status === "Pendiente"
              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300"
              : payment.status === "Validado"
              ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300"
              : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
          }`}
        >
          {payment.status || "Sin estado"}
        </span>
      </div>
      <div className="mt-4">
        <p className="text-lg font-bold text-gray-800 dark:text-gray-100">{formatCurrency(payment.amount || payment.paidAmount || 0)}</p>
        <p className="text-sm text-gray-600 dark:text-gray-400">{new Date(payment.date).toLocaleDateString()}</p>
        <p className="text-sm text-gray-600 dark:text-gray-400">Método: {payment.method || payment.metodo || "-"}</p>
      </div>
      <div className="mt-4 flex gap-2">
        {(payment.status === "Pendiente" || !payment.status) && (
          <button
            onClick={handleValidateClick}
            title="Validar pago"
            className="flex-1 px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm flex items-center justify-center gap-2"
          >
            ✅
            <span>Validar</span>
          </button>
        )}
        {payment.status === "Rechazado" && (
          <button
            onClick={() => onResend(payment.id)}
            className="flex-1 px-2 py-1 bg-brand-primary text-white rounded-lg text-sm"
          >
            Reenviar
          </button>
        )}
        <button
          onClick={() => alert("Ver detalles (simulado)")}
          className="flex-1 px-2 py-1 bg-white dark:bg-dark-surface dark:text-gray-200 border border-brand-light dark:border-gray-600 rounded-lg text-sm"
        >
          Ver
        </button>
      </div>
    </div>
  );
};

export default PaymentCard;
