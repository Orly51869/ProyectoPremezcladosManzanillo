import React, { useState } from "react";
import { X, Check, AlertTriangle } from "lucide-react";
import { formatCurrency } from "../../utils/helpers";

const ValidationModal = ({
  payment,
  onClose = () => {},
  onConfirm = () => {},
}) => {
  const [observations, setObservations] = useState("");
  const [action, setAction] = useState(null); // 'approve' or 'reject'

  if (!payment) return null;

  const handleConfirm = () => {
    if (action === null) return;
    onConfirm(payment.id, {
      approve: action === 'approve',
      observations,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-dark-primary rounded-2xl w-full max-w-2xl p-4 shadow-lg border border-brand-light dark:border-dark-surface">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="text-xl font-bold text-brand-primary dark:text-gray-100">
              Validar Pago
            </h3>
            <p className="text-sm text-brand-text dark:text-gray-400">
              ID del Pago: {payment.id}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-md bg-gray-100 dark:bg-dark-surface hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            <X className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>
        </div>

        <div className="bg-gray-50 dark:bg-dark-surface/50 p-2 rounded-lg mb-2">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-sm text-brand-text dark:text-gray-400">Monto</p>
              <p className="font-bold text-lg text-brand-dark dark:text-gray-100">
                {formatCurrency(payment.amount || payment.paidAmount || 0)}
              </p>
            </div>
            <div>
              <p className="text-sm text-brand-text dark:text-gray-400">Fecha</p>
              <p className="font-medium text-gray-800 dark:text-gray-100">
                {new Date(payment.date).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-brand-text dark:text-gray-400">Método</p>
              <p className="font-medium text-gray-800 dark:text-gray-100">
                {payment.method || payment.metodo || "-"}
              </p>
            </div>
            <div>
              <p className="text-sm text-brand-text dark:text-gray-400">Referencia</p>
              <p className="font-medium text-gray-800 dark:text-gray-100">
                {payment.reference || "-"}
              </p>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm text-brand-text dark:text-gray-300 mb-1">
            Observaciones (opcional para aprobación, requerido para rechazo)
          </label>
          <textarea
            value={observations}
            onChange={(e) => setObservations(e.target.value)}
            rows="3"
            className="w-full p-3 border border-brand-light dark:border-gray-600 bg-white dark:bg-dark-surface dark:text-gray-200 rounded-lg"
            placeholder="Ej: El monto no coincide con el comprobante..."
          />
        </div>

        <div className="mt-4 flex flex-col sm:flex-row gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-dark-surface dark:text-gray-200 order-last sm:order-first"
          >
            Cancelar
          </button>
          <button
            onClick={() => {
              setAction('reject');
              if (!observations) {
                alert("Por favor, añada observaciones para rechazar el pago.");
                return;
              }
              handleConfirm();
            }}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
          >
            <AlertTriangle className="w-4 h-4" /> Rechazar
          </button>
          <button
            onClick={() => {
              setAction('approve');
              handleConfirm();
            }}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
          >
            <Check className="w-4 h-4" /> Aprobar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ValidationModal;
