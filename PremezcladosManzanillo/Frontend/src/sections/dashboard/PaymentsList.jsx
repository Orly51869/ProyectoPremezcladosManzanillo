import React, { useState } from "react";
import { formatCurrency } from "../../utils/helpers";
import PaymentCard from "./PaymentCard.jsx";
import PaymentValidationModal from "./PaymentValidationModal.jsx"; // Import the new modal
import { Download, Eye, Trash2 } from "lucide-react"; // For document downloads

const PaymentsList = ({
  payments = [],
  viewMode = 'list',
  onValidate = () => {},
  onResend = () => {},
  onDownloadReceipt = () => {}, // New prop for downloading receipt
  onPayPending = () => {},
  budgetDebtMap = {},
  userRoles = [],
  currentUserId = null,
}) => {
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [paymentToValidate, setPaymentToValidate] = useState(null);

  const canValidatePayment = (payment) => {
    // Only Admin or Contable can validate, and only if payment is PENDING
    return (userRoles.includes('Administrador') || userRoles.includes('Contable')) && payment.status === 'PENDING';
  };

  const handleOpenValidationModal = (payment) => {
    setPaymentToValidate(payment);
    setShowValidationModal(true);
  };

  const handleCloseValidationModal = () => {
    setShowValidationModal(false);
    setPaymentToValidate(null);
  };

  // Helper to call onValidate from parent, with FormData for file uploads
  const submitValidation = (paymentId, formData) => {
    onValidate(paymentId, formData);
  };

  const downloadCSV = () => {
    if (!Array.isArray(payments) || payments.length === 0) {
      alert('No hay pagos para exportar');
      return;
    }

    const rows = payments.map((p) => ({
      ID: p.id,
      Presupuesto: p.budgetId || '',
      Fecha: p.date ? new Date(p.date).toLocaleDateString() : '',
      Monto: (p.amount || p.paidAmount || 0),
      Metodo: p.method || p.metodo || '',
      Estado: p.status || '',
      Referencia: p.reference || '',
      Cliente: p.budget?.client?.name || '', // Access client name through budget
      ProcesadoPor: p.validator?.name || '',
      FechaValidacion: p.validatedAt ? new Date(p.validatedAt).toLocaleDateString() : '',
    }));

    const headers = Object.keys(rows[0]);
    const escapeCell = (value) => {
      if (value === null || value === undefined) return '';
      const str = String(value);
      return `"${str.replace(/"/g, '""')}"`;
    };

    const csv = [headers.join(',')]
      .concat(rows.map(r => headers.map(h => escapeCell(r[h])).join(',')))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const filename = `pagos-${new Date().toISOString().slice(0,19).replace(/[:T]/g, '-')}.csv`;

    if (navigator.msSaveBlob) { // IE 10+
      navigator.msSaveBlob(blob, filename);
    } else {
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="bg-white dark:bg-dark-primary rounded-2xl p-4 shadow-lg border border-brand-light dark:border-dark-surface">
      <div className="flex items-center justify-end mb-4"> {/* Removed internal filters */}
        <div>
          <button
            onClick={downloadCSV}
            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-dark-surface dark:text-gray-200 rounded-lg"
          >
            Exportar CSV
          </button>
        </div>
      </div>

      {viewMode === 'list' ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-sm text-brand-text dark:text-gray-400">
                <th className="p-2 font-semibold">ID</th>
                <th className="p-2 font-semibold">Presupuesto</th>
                <th className="p-2 font-semibold">Cliente</th>
                <th className="p-2 font-semibold">Monto Pagado</th>
                <th className="p-2 font-semibold">Monto Pendiente</th>
                <th className="p-2 font-semibold">Fecha Pago</th>
                <th className="p-2 font-semibold">Método</th>
                <th className="p-2 font-semibold">Estado</th>
                <th className="p-2 font-semibold">Procesado Por</th>
                <th className="p-2 font-semibold">Fecha Procesado</th>
                <th className="p-2 font-semibold">Archivos</th>
                <th className="p-2 font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id} className="border-t dark:border-dark-surface">
                  <td className="p-2 text-sm text-gray-700 dark:text-gray-300">{p.id}</td>
                  <td className="p-2 text-sm text-gray-700 dark:text-gray-300">{p.budget?.title || p.budgetId}</td>
                  <td className="p-2 text-sm text-gray-700 dark:text-gray-300">{p.budget?.client?.name || 'N/A'}</td>
                  <td className="p-2 text-sm">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1">
                        <span className="text-gray-900 dark:text-gray-100 font-bold">{formatCurrency(p.paidAmount)}</span>
                        {p.igtfAmount > 0 && (
                          <span className="text-[9px] font-bold text-orange-600 bg-orange-100 dark:bg-orange-900/30 px-1.5 py-0.5 rounded-full" title="IGTF Aplicado">
                            +IGTF
                          </span>
                        )}
                      </div>
                      {p.currency === 'VES' && p.amountInCurrency && (
                        <span className="text-[10px] text-gray-500 dark:text-gray-400">
                          Original: {p.amountInCurrency.toLocaleString('es-VE')} Bs.
                          <br />
                          (Tasa: {p.exchangeRate?.toFixed(2)})
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-2 text-sm text-gray-700 dark:text-gray-100 font-medium">{formatCurrency(p.pending)}</td>
                  <td className="p-2 text-sm text-gray-700 dark:text-gray-300">
                    {p.date ? new Date(p.date).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="p-2 text-sm text-gray-700 dark:text-gray-300">{p.method || "-"}</td>
                  <td className="p-2 text-sm">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        p.status === "PENDING"
                          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300"
                          : p.status === "VALIDATED"
                          ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300"
                          : "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300"
                      }`}
                    >
                      {p.status || "PENDING"}
                    </span>
                  </td>
                  <td className="p-2 text-sm text-gray-700 dark:text-gray-300">{p.validator?.name || 'N/A'}</td>
                  <td className="p-2 text-sm text-gray-700 dark:text-gray-300">
                    {p.validatedAt ? new Date(p.validatedAt).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="p-2 text-sm">
                    <div className="flex flex-col gap-2">
                      {[
                        { url: p.receiptUrl, label: "Recibo" },
                        { url: p.proFormaInvoiceUrl, label: "Proforma" },
                        { url: p.fiscalInvoiceUrl, label: "F. Fiscal" },
                        { url: p.deliveryOrderUrl, label: "O. Entrega" }
                      ].filter(doc => doc.url).map((doc, idx) => (
                        <div key={idx} className="flex items-center gap-2 group">
                          <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 w-16 truncate">{doc.label}</span>
                          <div className="flex gap-1">
                            <a 
                              href={doc.url} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="p-1 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"
                              title={`Ver ${doc.label}`}
                            >
                              <Eye size={14} />
                            </a>
                            <a 
                              href={doc.url} 
                              download
                              className="p-1 text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-md transition-colors"
                              title={`Descargar ${doc.label}`}
                            >
                              <Download size={14} />
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="p-2 text-sm">
                      <div className="flex gap-2">
                        {canValidatePayment(p) && (
                          <button
                            onClick={() => handleOpenValidationModal(p)}
                            title="Validar pago"
                            className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg"
                          >
                            Validar
                          </button>
                        )}
                        {p.status === "REJECTED" && (
                          <button
                            onClick={() => onResend(p.id)}
                            className="px-2 py-1 bg-brand-primary text-white rounded-lg"
                          >
                            Reenviar
                          </button>
                        )}
                        {budgetDebtMap[p.budgetId] > 0.01 && (
                          <button
                            onClick={() => onPayPending(p)}
                            className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-1"
                            title="Registrar abono"
                          >
                             Abonar
                          </button>
                        )}
                        {userRoles.includes('Administrador') && (
                          <button
                            onClick={async () => {
                              if (window.confirm("¿Estás 100% seguro de ELIMINAR este pago? Esta acción es irreversible y también borrará la factura asociada.")) {
                                try {
                                  await api.delete(`/api/payments/${p.id}`);
                                  window.location.reload(); // Recarga simple para ver cambios
                                } catch (err) {
                                  alert("Error al eliminar el pago.");
                                }
                              }
                            }}
                            className="p-1 px-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            title="ELIMINAR PAGO (Admin)"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {payments.map((p) => (
            <PaymentCard
              key={p.id}
              payment={p}
              onOpenValidationModal={handleOpenValidationModal} // Pass function to open validation modal
              onResend={onResend}
              onDownloadReceipt={onDownloadReceipt} // Pass download receipt handler
              onPayPending={onPayPending}
              budgetRemainingDebt={budgetDebtMap[p.budgetId]}
              canValidatePayment={canValidatePayment}
            />
          ))}
        </div>
      )}

      {showValidationModal && (
        <PaymentValidationModal
          onClose={handleCloseValidationModal}
          onSubmit={submitValidation}
          payment={paymentToValidate}
        />
      )}
    </div>
  );
};

export default PaymentsList;
