import React, { useState } from "react";
import { formatCurrency } from "../../utils/helpers";

const PaymentCard = ({ payment, onValidate, onResend, onViewReceipt }) => {
  const { id, budgetId, amount, paidAmount, status, date, method, reference } = payment;
  const [validatingId, setValidatingId] = useState(null);

  const handleApprove = (paymentId) => {
    onValidate(paymentId, { approve: true });
    setValidatingId(null);
  };

  const handleReject = (paymentId) => {
    onValidate(paymentId, { approve: false });
    setValidatingId(null);
  };

  const handleValidateClick = (p) => {
    setValidatingId(p.id);
  };

  return (
    <div className="bg-white dark:bg-dark-primary rounded-2xl p-6 shadow-md border border-brand-light dark:border-dark-surface">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Presupuesto #{budgetId}</p>
          <p className="text-lg font-bold text-brand-primary dark:text-gray-100">
            {formatCurrency(amount || paidAmount || 0)}
          </p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            status === "Pendiente"
              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300"
              : status === "Validado"
              ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300"
              : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
          }`}
        >
          {status || "Sin estado"}
        </span>
      </div>
      <p className="text-brand-text dark:text-gray-300 mb-1">
        Fecha: <span className="font-medium">{new Date(date).toLocaleDateString()}</span>
      </p>
      <p className="text-brand-text dark:text-gray-300 mb-1">
        Método: <span className="font-medium">{method || "-"}</span>
      </p>
      <p className="text-brand-text dark:text-gray-400 mb-4">
        Ref: <span className="font-medium">{reference}</span>
      </p>
      <div className="flex flex-wrap items-center gap-2">
        {status === "Pendiente" ? (
          validatingId === id ? (
            <div className="flex gap-2">
              <button
                onClick={() => handleApprove(id)}
                className="bg-green-600 text-white py-1 px-2 rounded-md text-sm"
              >
                Aprobar
              </button>
              <button
                onClick={() => handleReject(id)}
                className="bg-red-600 text-white py-1 px-2 rounded-md text-sm"
              >
                Rechazar
              </button>
              <button
                onClick={() => setValidatingId(null)}
                className="bg-gray-200 dark:bg-gray-600 py-1 px-2 rounded-md text-sm"
              >
                Cancelar
              </button>
            </div>
          ) : (
            <button
              onClick={() => handleValidateClick(payment)}
              className="bg-brand-mid text-white py-2 px-4 rounded-lg text-center hover:bg-brand-dark"
            >
              Validar
            </button>
          )
        ) : null}
        {status === "Rechazado" && (
          <button
            onClick={() => onResend(id)}
            className="bg-brand-primary text-white py-2 px-4 rounded-lg text-center hover:bg-brand-dark"
          >
            Reenviar
          </button>
        )}
        {status === "Validado" && (
          <button
            onClick={() => onViewReceipt(payment)}
            className="bg-white dark:bg-dark-surface dark:text-gray-200 border border-brand-light dark:border-gray-600 py-2 px-4 rounded-lg text-center hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Ver
          </button>
        )}
      </div>
    </div>
  );
};

export default PaymentCard;
