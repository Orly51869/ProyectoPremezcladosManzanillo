import React, { useState, useEffect } from "react";
import { useCurrency } from "../../context/CurrencyContext";
import { useSettings } from "../../context/SettingsContext";
import { useAuth0 } from "@auth0/auth0-react";

const PaymentForm = ({ onSubmit = () => { }, onCancel = () => { }, approvedBudgets = [], initialValues = null }) => {
  const { exchangeRate: currentExchangeRate } = useCurrency();
  const { settings } = useSettings();
  const { user } = useAuth0();
  const [budgetId, setBudgetId] = useState("");
  const [paymentDate, setPaymentDate] = useState("");
  const [paidAmount, setPaidAmount] = useState(""); // Este será el equivalente en USD
  const [currency, setCurrency] = useState("USD");
  const [applyIgtf, setApplyIgtf] = useState(false);
  const [amountInCurrency, setAmountInCurrency] = useState(""); // Monto en VES si aplica
  const [exchangeRate, setExchangeRate] = useState(currentExchangeRate || "");
  const [igtfRate, setIgtfRate] = useState(settings?.company_igtf || 3);

  // Efecto de actualización para sincronizar con configuraciones si se cargan después, pero respetar cambios manuales si la lógica implementada lo permite (aquí sincronización simple)
  useEffect(() => {
    if (settings?.company_igtf) setIgtfRate(settings.company_igtf);
  }, [settings]);

  const [method, setMethod] = useState("Transferencia");
  const [reference, setReference] = useState("");
  const [bankFrom, setBankFrom] = useState("");
  const [bankTo, setBankTo] = useState("");
  const [receiptFile, setReceiptFile] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  // Efecto para calcular el equivalente en USD cuando cambian los Bs. o la Tasa
  useEffect(() => {
    if (currency === 'VES' && amountInCurrency && exchangeRate) {
      const usdValue = (parseFloat(amountInCurrency) / parseFloat(exchangeRate)).toFixed(2);
      setPaidAmount(usdValue);
    }
  }, [currency, amountInCurrency, exchangeRate]);

  // Efecto para "Pre-llenar" los Bs. si ya hay un monto en USD y se cambia a VES
  useEffect(() => {
    if (currency === 'VES') {
      if (paidAmount && !amountInCurrency && exchangeRate) {
        const vesValue = (parseFloat(paidAmount) * parseFloat(exchangeRate)).toFixed(2);
        setAmountInCurrency(vesValue);
      }
      setApplyIgtf(false); // Nunca aplica en VES
    } else {
      setApplyIgtf(true); // Siempre aplica en USD
    }
  }, [currency, paidAmount, exchangeRate]);

  useEffect(() => {
    if (initialValues) {
      if (initialValues.budgetId) setBudgetId(initialValues.budgetId);
      if (initialValues.amount) setPaidAmount(initialValues.amount);
    } else if (approvedBudgets.length > 0 && !budgetId) {
      // Auto-seleccionar primero
      const firstBudget = approvedBudgets[0];
      setBudgetId(firstBudget.id);
    }
  }, [approvedBudgets, budgetId, initialValues]);

  // Nuevo Effect para auto-llenar el monto restante cuando se cambia el presupuesto
  useEffect(() => {
    if (budgetId && approvedBudgets.length > 0) {
      const selected = approvedBudgets.find(b => b.id === budgetId);
      if (selected) {
        // Calcular restante
        const total = selected.total || 0; // O la suma calculada si total no está actualizado
        const paid = (selected.payments || [])
          .filter(p => p.status === 'VALIDATED' || p.status === 'PENDING')
          .reduce((sum, p) => sum + (p.paidAmount || 0), 0);
        const remaining = Math.max(0, total - paid);

        // Si no hay monto escrito aún, sugerir el restante
        if (!paidAmount || paidAmount === '0') {
          setPaidAmount(remaining.toFixed(2));
        }
      }
    }
  }, [budgetId, approvedBudgets]);
  // Nota: Eliminamos paidAmount de deps para evitar loop infinito si el usuario edita

  const validateForm = () => {
    const errors = {};
    if (!budgetId) errors.budgetId = "Debe seleccionar un presupuesto.";

    if (currency === 'USD') {
      if (!paidAmount || parseFloat(paidAmount) <= 0) errors.paidAmount = "El monto debe ser mayor a 0.";
    } else {
      if (!amountInCurrency || parseFloat(amountInCurrency) <= 0) errors.amountInCurrency = "El monto en Bs. debe ser mayor a 0.";
      if (!exchangeRate || parseFloat(exchangeRate) <= 0) errors.exchangeRate = "La tasa de cambio debe ser válida.";
    }

    if (!method) errors.method = "Debe seleccionar un método de pago.";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Helper para formatear siempre en USD
  const formatPriceUSD = (val) => {
    return parseFloat(val || 0).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    const formData = new FormData();
    formData.append('budgetId', budgetId);
    formData.append('paidAmount', paidAmount); // Enviando paidAmount correctamente tal como fue ingresado
    formData.append('date', paymentDate || new Date().toISOString());
    formData.append('method', method);
    formData.append('currency', currency);
    if (currency === 'VES') {
      formData.append('exchangeRate', exchangeRate);
      formData.append('amountInCurrency', amountInCurrency);
    }

    // En Venezuela, el IGTF es el 3% (o lo configurado) sobre el monto pagado
    if (applyIgtf) {
      const igtfCalculated = parseFloat(paidAmount || 0) * (parseFloat(igtfRate || 0) / 100);
      formData.append('igtfAmount', igtfCalculated.toFixed(2));
    }

    if (reference) formData.append('reference', reference);
    if (bankFrom) formData.append('bankFrom', bankFrom);
    if (bankTo) formData.append('bankTo', bankTo);
    if (receiptFile) formData.append('receipt', receiptFile);

    onSubmit(formData);
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
              approvedBudgets.map((budget) => {
                // Calcular Total (Libre de Impuestos para Puerto Libre)
                // Solo suma de productos, sin lógica de IVA.
                let calculatedTotal = 0;

                const products = budget.products || [];
                products.forEach(p => {
                  const qty = p.quantity || 0;
                  const price = p.unitPrice || 0;
                  calculatedTotal += qty * price;
                });

                // Si el backend ya está actualizado, budget.total debería coincidir con calculatedTotal
                // Usamos calculatedTotal para estar seguros en caso de que la página no haya actualizado datos del servidor aún
                const finalTotal = calculatedTotal;

                const paid = (budget.payments || [])
                  .filter(p => p.status === 'VALIDATED' || p.status === 'PENDING')
                  .reduce((sum, p) => sum + (p.paidAmount || 0), 0);

                const remaining = Math.max(0, finalTotal - paid);

                return (
                  <option key={budget.id} value={budget.id}>
                    {budget.title} (Restante: ${remaining.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})
                  </option>
                );
              })
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

        <div className="flex flex-col gap-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-sm text-brand-text dark:text-gray-300 mb-1">Moneda del Pago</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full p-3 border border-brand-light dark:border-gray-600 bg-white dark:bg-dark-surface dark:text-gray-200 rounded-lg"
              >
                <option value="USD">Dólares ($)</option>
                <option value="VES">Bolívares (Bs.)</option>
              </select>
            </div>
            <div className="flex-[2]">
              <label className="block text-sm text-brand-text dark:text-gray-300 mb-1">
                {currency === 'USD' ? 'Monto a Abonar a Deuda ($)' : 'Monto en Bolívares (Bs.)'}
              </label>
              <input
                type="number"
                step="0.01"
                value={currency === 'USD' ? paidAmount : amountInCurrency}
                onChange={(e) => currency === 'USD' ? setPaidAmount(e.target.value) : setAmountInCurrency(e.target.value)}
                className="w-full p-3 border border-brand-light dark:border-gray-600 bg-white dark:bg-dark-surface dark:text-gray-200 rounded-lg font-bold"
                placeholder="0.00"
              />
              {formErrors.paidAmount && <p className="text-red-500 text-xs mt-1">{formErrors.paidAmount}</p>}
              {formErrors.amountInCurrency && <p className="text-red-500 text-xs mt-1">{formErrors.amountInCurrency}</p>}
            </div>
          </div>

          {/* Sección de IGTF - Solo visible en USD */}
          {currency === 'USD' && (
            <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-100 dark:border-orange-800 transition-all">

              <div className="space-y-2">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-orange-800 dark:text-orange-300">
                      Base (Abono)
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="block text-sm font-bold text-gray-700 dark:text-gray-300">
                      {formatPriceUSD(parseFloat(paidAmount || 0))}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-orange-800 dark:text-orange-300">
                      + IGTF ({igtfRate}%)
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="block text-sm font-bold text-orange-700 dark:text-orange-400">
                      {formatPriceUSD(parseFloat(paidAmount || 0) * (parseFloat(igtfRate || 0) / 100))}
                    </span>
                  </div>
                </div>

                <div className="mt-2 pt-2 border-t border-orange-200 dark:border-orange-700 flex justify-between items-center text-orange-900 dark:text-orange-100">
                  <span className="font-bold">Total a Transferir:</span>
                  <span className="font-extrabold text-lg">
                    {formatPriceUSD(parseFloat(paidAmount || 0) + (parseFloat(paidAmount || 0) * (parseFloat(igtfRate || 0) / 100)))}
                  </span>
                </div>
              </div>

              <p className="text-[10px] text-orange-600 dark:text-orange-400 mt-2">
                El IGTF es un impuesto adicional obligatorio para pagos en divisas. El monto total a transferir incluye este impuesto.
              </p>
            </div>
          )}

          {currency === 'VES' && (
            <div className="flex gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
              <div className="flex-1">
                <label className="block text-xs font-bold text-blue-700 dark:text-blue-300 mb-1">Tasa BCV del Pago</label>
                <input
                  type="number"
                  step="0.01"
                  value={exchangeRate}
                  onChange={(e) => setExchangeRate(e.target.value)}
                  className="w-full p-2 border border-blue-200 dark:border-blue-700 bg-white dark:bg-dark-primary dark:text-white rounded-lg text-sm"
                />
                {formErrors.exchangeRate && <p className="text-red-500 text-xs mt-1">{formErrors.exchangeRate}</p>}
              </div>
              <div className="flex-[1.5] flex flex-col justify-center">
                <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">Equivalente a abonar:</span>
                <span className="text-lg font-bold text-blue-800 dark:text-blue-200">
                  {paidAmount ? `$ ${parseFloat(paidAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '$ 0.00'}
                </span>
              </div>
            </div>
          )}
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
    </form >
  );
};

export default PaymentForm;
