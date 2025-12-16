import React, { useState, useEffect } from "react";
// import { mockBudgets } from '../../mock/data'; // No longer needed

const PaymentForm = ({ onSubmit = () => {}, onCancel = () => {}, approvedBudgets = [], initialValues = null }) => {
  const [budgetId, setBudgetId] = useState("");
  const [paymentDate, setPaymentDate] = useState("");
  const [paidAmount, setPaidAmount] = useState("");
  const [method, setMethod] = useState("Transferencia");
  const [reference, setReference] = useState("");
  const [bankFrom, setBankFrom] = useState("");
  const [bankTo, setBankTo] = useState("");
  const [receiptFile, setReceiptFile] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (initialValues) {
      if (initialValues.budgetId) setBudgetId(initialValues.budgetId);
      if (initialValues.amount) setPaidAmount(initialValues.amount);
    } else if (approvedBudgets.length > 0 && !budgetId) {
      setBudgetId(approvedBudgets[0].id);
    }
  }, [approvedBudgets, budgetId, initialValues]);

  const validateForm = () => {
    const errors = {};
    if (!budgetId) errors.budgetId = "Debe seleccionar un presupuesto.";
    if (!paidAmount || parseFloat(paidAmount) <= 0) errors.paidAmount = "El monto pagado debe ser mayor a 0.";
    if (!method) errors.method = "Debe seleccionar un método de pago.";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    const formData = new FormData();
    formData.append('budgetId', budgetId);
    formData.append('paidAmount', paidAmount); // Correctly sending paidAmount
    formData.append('date', paymentDate || new Date().toISOString());
    formData.append('method', method);
    if (reference) formData.append('reference', reference);
    if (bankFrom) formData.append('bankFrom', bankFrom);
    if (bankTo) formData.append('bankTo', bankTo);
    if (receiptFile) formData.append('receipt', receiptFile); // 'receipt' is the field name for multer.single('receipt')

    onSubmit(formData); // Send FormData to parent component
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white dark:bg-dark-primary rounded-2xl p-6 shadow-md border border-brand-light dark:border-dark-surface"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-brand-text dark:text-gray-300 mb-1">
            Presupuesto Asociado
          </label>
          <select
            value={budgetId}
            onChange={(e) => setBudgetId(e.target.value)}
            className="w-full p-3 border border-brand-light dark:border-gray-600 bg-white dark:bg-dark-surface dark:text-gray-200 rounded-lg"
          >
            {approvedBudgets.length === 0 ? (
              <option value="">No hay presupuestos aprobados</option>
            ) : (
              approvedBudgets.map((budget) => (
                <option key={budget.id} value={budget.id}>
                  {budget.title} (Total: ${budget.total.toFixed(2)})
                </option>
              ))
            )}
          </select>
          {formErrors.budgetId && <p className="text-red-500 text-xs mt-1">{formErrors.budgetId}</p>}
        </div>
        <div>
          <label className="block text-sm text-brand-text dark:text-gray-300 mb-1">
            Fecha de pago
          </label>
          <input
            type="date"
            value={paymentDate}
            onChange={(e) => setPaymentDate(e.target.value)}
            className="w-full p-3 border border-brand-light dark:border-gray-600 bg-white dark:bg-dark-surface dark:text-gray-200 rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm text-brand-text dark:text-gray-300 mb-1">Monto Pagado</label>
          <input
            type="number"
            step="0.01"
            value={paidAmount}
            onChange={(e) => setPaidAmount(e.target.value)}
            className="w-full p-3 border border-brand-light dark:border-gray-600 bg-white dark:bg-dark-surface dark:text-gray-200 rounded-lg"
          />
          {formErrors.paidAmount && <p className="text-red-500 text-xs mt-1">{formErrors.paidAmount}</p>}
        </div>

        <div>
          <label className="block text-sm text-brand-text dark:text-gray-300 mb-1">Método</label>
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            className="w-full p-3 border border-brand-light dark:border-gray-600 bg-white dark:bg-dark-surface dark:text-gray-200 rounded-lg"
          >
            <option value="Transferencia">Transferencia</option>
            <option value="Depósito">Depósito</option>
            <option value="Cheque">Cheque</option>
            <option value="Efectivo">Efectivo</option>
            <option value="Punto de Venta">Punto de Venta</option>
          </select>
          {formErrors.method && <p className="text-red-500 text-xs mt-1">{formErrors.method}</p>}
        </div>

        <div>
          <label className="block text-sm text-brand-text dark:text-gray-300 mb-1">
            Referencia (Opcional)
          </label>
          <input
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            className="w-full p-3 border border-brand-light dark:border-gray-600 bg-white dark:bg-dark-surface dark:text-gray-200 rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm text-brand-text dark:text-gray-300 mb-1">
            Banco emisor (Opcional)
          </label>
          <input
            value={bankFrom}
            onChange={(e) => setBankFrom(e.target.value)}
            className="w-full p-3 border border-brand-light dark:border-gray-600 bg-white dark:bg-dark-surface dark:text-gray-200 rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm text-brand-text dark:text-gray-300 mb-1">
            Banco receptor (Opcional)
          </label>
          <input
            value={bankTo}
            onChange={(e) => setBankTo(e.target.value)}
            className="w-full p-3 border border-brand-light dark:border-gray-600 bg-white dark:bg-dark-surface dark:text-gray-200 rounded-lg"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm text-brand-text dark:text-gray-300 mb-1">
            Comprobante (PDF/Imagen) (Opcional)
          </label>
          <input
            type="file"
            accept="application/pdf,image/*"
            onChange={(e) => setReceiptFile(e.target.files[0])}
            className="w-full dark:text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-primary file:text-white hover:file:bg-brand-mid"
          />
        </div>
      </div>

      <div className="mt-4 flex gap-2 justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-dark-surface dark:text-gray-200"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 rounded-lg bg-brand-primary text-white"
        >
          Registrar Pago
        </button>
      </div>
    </form>
  );
};

export default PaymentForm;
