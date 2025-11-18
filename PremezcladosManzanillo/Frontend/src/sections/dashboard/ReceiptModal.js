import React from "react";
import { X, Download } from "lucide-react";
import { formatCurrency } from "../../utils/helpers";

const ReceiptModal = ({
  receipt,
  onClose = () => {},
  onDownload = () => {},
  bgColor = "bg-white dark:bg-dark-primary",
  textColor = "text-brand-text dark:text-gray-400",
  title = "Comprobante de Pago",
}) => {
  if (!receipt) return null;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className={`${bgColor} rounded-2xl w-full max-w-2xl p-4 shadow-lg border border-brand-light dark:border-dark-surface`}>
        <div className="flex items-start justify-between mb-1">
          <div>
            <h3 className={`text-xl font-bold text-brand-primary dark:text-gray-100`}>
              {title}
            </h3>
            <p className={`${textColor}`}>ID: {receipt.id}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-md bg-gray-100 dark:bg-dark-surface hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            <X className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-1">
          <div>
            <p className={`${textColor}`}>Cliente</p>
            <p className={`font-medium text-gray-800 dark:text-gray-100`}>{receipt.clientName || "—"}</p>
          </div>
          <div>
            <p className={`${textColor}`}>Fecha</p>
            <p className={`font-medium text-gray-800 dark:text-gray-100`}>
              {new Date(receipt.date).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="mb-1 bg-gray-50 dark:bg-dark-surface/50 p-2 rounded-lg">
          <p className={`${textColor}`}>Presupuesto</p>
          <p className={`font-medium text-gray-800 dark:text-gray-100`}>
            {receipt.budgetTitle || receipt.budgetId}
          </p>
          <p className={`${textColor} mt-1`}>Monto</p>
          <p className={`font-bold text-brand-dark dark:text-gray-100`}>
            {formatCurrency(receipt.amount)}
          </p>
        </div>

        <div className="flex gap-2 justify-end">
          <button
            onClick={() => onDownload(receipt)}
            className="flex items-center gap-2 bg-brand-primary text-white px-4 py-2 rounded-lg hover:bg-brand-mid"
          >
            <Download className="w-4 h-4" /> Descargar PDF (simulado)
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-dark-surface dark:text-gray-200"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReceiptModal;
