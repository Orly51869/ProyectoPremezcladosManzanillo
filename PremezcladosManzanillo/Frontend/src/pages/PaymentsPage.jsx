import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import useUserRoles from "../hooks/useUserRoles";
import api from "../utils/api";
import { FileText, List, LayoutGrid, Search } from "lucide-react";
import PaymentsList from "../sections/dashboard/PaymentsList.jsx";
import PaymentForm from "../sections/dashboard/PaymentForm.jsx";
import ReceiptModal from "../sections/dashboard/ReceiptModal.jsx";

const PaymentsPage = () => {
  const { user } = useAuth0();
  const { rawRoles: userRoles } = useUserRoles();
  const currentUserId = user?.sub;

  const [payments, setPayments] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const [viewMode, setViewMode] = useState('list');
  const [search, setSearch] = useState('');

  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/payments');
      setPayments(response.data);
    } catch (err) {
      setError('Error al cargar pagos.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchBudgets = useCallback(async () => {
    try {
      const response = await api.get('/api/budgets');
      setBudgets(response.data);
    } catch (err) {
      console.error('Error al cargar presupuestos:', err);
      // No establecer error global, ya que los pagos podr\u00edan a\u00fan cargarse
    }
  }, []);

  useEffect(() => {
    fetchPayments();
    fetchBudgets();
  }, [fetchPayments, fetchBudgets]);

  const approvedBudgets = useMemo(() => {
    return budgets.filter(budget => {
      // Filtrar solo presupuestos aprobados
      if (budget.status !== 'APPROVED') return false;

      // Calcular el monto pagado (incluyendo pagos validados y pendientes)
      // Nota: Si el usuario tiene pagos pendientes que cubren el total, también lo ocultamos para prevenir sobrepagos
      const totalPaidOrPending = (budget.payments || [])
        .filter(p => p.status === 'VALIDATED' || p.status === 'PENDING')
        .reduce((sum, p) => sum + (p.paidAmount || 0), 0);

      // Si el monto pagado/pendiente cubre el total (con margen de error de 0.50 USD), no mostrar
      return totalPaidOrPending < (budget.total - 0.50);
    });
  }, [budgets]);

  const filteredPayments = useMemo(() => {
    return payments.filter(payment =>
      payment.budgetId.toLowerCase().includes(search.toLowerCase()) ||
      payment.reference?.toLowerCase().includes(search.toLowerCase()) ||
      payment.method.toLowerCase().includes(search.toLowerCase())
    );
  }, [payments, search]);

  const [initialPaymentValues, setInitialPaymentValues] = useState(null);

  const handlePayPending = (payment) => {
    setInitialPaymentValues({
      budgetId: payment.budgetId,
      amount: payment.pending, // Sugerir el monto pendiente como abono
    });
    setShowForm(true);
  };

  const handleRegisterPayment = async (formData) => { // Aceptar formData
    try {
      // El backend valida el estado del presupuesto y el monto
      await api.post('/api/payments', formData); // Enviar formData directamente
      setShowForm(false);
      setInitialPaymentValues(null); // Reiniciar valores iniciales
      fetchPayments(); // Actualizar lista de pagos
      alert("Pago registrado con éxito. Pendiente de validación.");
    } catch (err) {
      console.error('Error al registrar pago:', err);
      // Muestra un mensaje de error más específico si el backend lo proporciona
      setError(err.response?.data?.error || 'Error al registrar pago.');
    }
  };

  const handleValidatePayment = async (paymentId, validationData) => {
    try {
      await api.put(`/api/payments/${paymentId}`, validationData);
      fetchPayments(); // Actualizar lista de pagos
      alert("Pago procesado con éxito.");
    } catch (err) {
      console.error('Error al validar pago:', err);
      setError(err.response?.data?.error || 'Error al validar pago.');
    }
  };

  const handleDownloadReceipt = (payment) => {
    if (payment.paymentReceiptUrl) {
      window.open(payment.paymentReceiptUrl, '_blank');
    } else {
      alert("No hay comprobante de pago disponible para descargar.");
    }
  };

  const handleResendForValidation = async (paymentId) => {
    // Esta funcionalidad aún no está implementada en el backend como un endpoint separado.
    // Por ahora, podría ser una actualización de estado o una acción personalizada.
    // Marcador de posici\u00f3n para implementaci\u00f3n futura.
    alert(`Reenviar para validación ${paymentId} (funcionalidad pendiente de implementar)`);
  };

  // if (loading) return ... (Moved inside layout)
  // if (error) return ... (Moved inside layout)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <FileText className="w-8 h-8 text-black dark:text-green-400" />
          <h1 className="text-3xl font-bold text-brand-primary dark:text-white">Pagos</h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-2">
            <button onClick={() => setViewMode('canvas')} className={`p-2 rounded-lg ${viewMode === 'canvas' ? 'bg-brand-primary text-white' : 'bg-gray-200 dark:bg-dark-surface text-gray-600 dark:text-gray-300'}`}>
              <LayoutGrid className="w-5 h-5" />
            </button>
            <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-brand-primary text-white' : 'bg-gray-200 dark:bg-dark-surface text-gray-600 dark:text-gray-300'}`}>
              <List className="w-5 h-5" />
            </button>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-brand-primary text-white px-4 py-2 rounded-xl hover:bg-brand-mid"
          >
            Registrar Pago
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-dark-primary rounded-2xl p-6 shadow-lg border border-brand-light dark:border-dark-surface mb-6">
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="flex-1 flex items-center gap-3 w-full md:w-auto">
            <Search className="w-5 h-5 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Buscar por ID de presupuesto o referencia..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 p-3 border border-brand-light dark:border-dark-surface rounded-xl dark:bg-dark-surface focus:outline-none focus:ring-2 focus:ring-brand-mid dark:text-gray-200"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary dark:border-green-400"></div>
          <span className="mt-4 text-brand-primary dark:text-green-400 font-medium">Cargando pagos...</span>
        </div>
      ) : error ? (
        <div className="p-8 text-center text-red-500 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-200 dark:border-red-800">
          <p className="font-bold text-lg mb-2">Error al cargar pagos</p>
          <p className="mb-4">{error}</p>
          <button
            onClick={() => { fetchPayments(); fetchBudgets(); }}
            className="px-4 py-2 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-lg hover:bg-red-200 transition-colors"
          >
            Reintentar
          </button>
        </div>
      ) : (
        <>
          {showForm && (
            <div className="mb-6">
              <PaymentForm
                onCancel={() => setShowForm(false)}
                onSubmit={handleRegisterPayment}
                approvedBudgets={approvedBudgets}
              />
            </div>
          )}

          <PaymentsList
            payments={filteredPayments}
            viewMode={viewMode}
            onValidate={handleValidatePayment}
            onResend={handleResendForValidation}
            onDownloadReceipt={handleDownloadReceipt}
            onPayPending={handlePayPending}
            userRoles={userRoles}
            currentUserId={currentUserId}
          />

          {receipt && (
            <ReceiptModal
              receipt={receipt}
              onClose={() => setReceipt(null)}
              onDownload={handleDownloadReceipt}
            />
          )}
        </>
      )}
    </div>
  );
};

export default PaymentsPage;
