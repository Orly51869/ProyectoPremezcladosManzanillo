import React from 'react';
import { formatCurrency } from "../../utils/helpers";
import { Download } from 'lucide-react';

const PaymentCard = ({ payment, onOpenValidationModal, onResend, onDownloadReceipt, canValidatePayment, onPayPending = () => {}, budgetRemainingDebt = 0 }) => {
  return (
    <div className="bg-white dark:bg-dark-surface rounded-lg shadow-md p-4 border border-brand-light dark:border-gray-700">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-semibold text-brand-primary dark:text-green-400">{payment.budget?.title || payment.budgetId}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Cliente: {payment.budget?.client?.name || 'N/A'}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">ID Pago: {payment.id}</p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            payment.status === "PENDING"
              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300"
              : payment.status === "VALIDATED"
              ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300"
              : "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300"
          }`}
        >
          {payment.status || "PENDING"}
        </span>
      </div>
      <div className="mt-4">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <p className="text-xl font-bold text-gray-800 dark:text-gray-100">{formatCurrency(payment.paidAmount)}</p>
            {payment.igtfAmount > 0 && (
              <span className="text-[10px] font-bold text-orange-600 bg-orange-100 dark:bg-orange-900/30 px-2 py-0.5 rounded-full">
                + IGTF: ${payment.igtfAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            )}
          </div>
          {payment.currency === 'VES' && payment.amountInCurrency && (
            <p className="text-xs text-gray-500 font-medium">
              Equivalente de {payment.amountInCurrency.toLocaleString('es-VE')} Bs. (Tasa: {payment.exchangeRate?.toFixed(2)})
            </p>
          )}
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Pendiente: {formatCurrency(payment.pending)}</p>
        <p className="text-sm text-gray-600 dark:text-gray-400">Fecha Pago: {payment.date ? new Date(payment.date).toLocaleDateString() : 'N/A'}</p>
        <p className="text-sm text-gray-600 dark:text-gray-400">Método: {payment.method || "-"}</p>
        {payment.validator && (
            <p className="text-sm text-gray-500 dark:text-gray-400">Validado por: {payment.validator.name} el {payment.validatedAt ? new Date(payment.validatedAt).toLocaleDateString() : 'N/A'}</p>
        )}
        {payment.observations && (
            <p className="text-sm text-red-500 dark:text-red-400">Observaciones: {payment.observations}</p>
        )}
      </div>
      <div className="mt-4 border-t border-brand-light dark:border-gray-700 pt-3">
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Documentos:</p>
        <div className="flex flex-col gap-2 text-sm">
          {payment.receiptUrl ? (
            <a href={payment.receiptUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline flex items-center gap-1">
              <Download size={16} /> Recibo de Pago
            </a>
          ) : (
            <span className="text-gray-500">Recibo no disponible</span>
          )}
          {payment.proFormaInvoiceUrl ? (
            <a href={payment.proFormaInvoiceUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline flex items-center gap-1">
              <Download size={16} /> Factura Proforma
            </a>
          ) : (
            <span className="text-gray-500">Proforma no disponible</span>
          )}
          {payment.fiscalInvoiceUrl ? (
            <a href={payment.fiscalInvoiceUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline flex items-center gap-1">
              <Download size={16} /> Factura Fiscal
            </a>
          ) : (
            <span className="text-gray-500">Factura Fiscal no disponible</span>
          )}
          {payment.deliveryOrderUrl ? (
            <a href={payment.deliveryOrderUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline flex items-center gap-1">
              <Download size={16} /> Orden de Entrega
            </a>
          ) : (
            <span className="text-gray-500">Orden de Entrega no disponible</span>
          )}
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        {canValidatePayment(payment) && (
          <button
            onClick={() => onOpenValidationModal(payment)}
            title="Validar pago"
            className="flex-1 px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm flex items-center justify-center gap-2"
          >
            ✅
            <span>Validar</span>
          </button>
        )}
        {payment.status === "REJECTED" && (
          <button
            onClick={() => onResend(payment.id)}
            className="flex-1 px-2 py-1 bg-brand-primary text-white rounded-lg text-sm"
          >
            Reenviar
          </button>
        )}
        {budgetRemainingDebt > 0.01 && (
          <button
             onClick={() => onPayPending(payment)}
             className="flex-1 px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm flex items-center justify-center gap-2"
          >
            Abonar
          </button>
        )}
      </div>
    </div>
  );
};

export default PaymentCard;
