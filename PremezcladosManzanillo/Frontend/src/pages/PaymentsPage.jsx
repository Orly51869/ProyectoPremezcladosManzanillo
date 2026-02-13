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
      // Don't set global error, as payments might still load
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
      // Backend validates budget status and amount
      await api.post('/api/payments', formData); // Enviar formData directamente
      setShowForm(false);
      setInitialPaymentValues(null); // Reset initial values
      fetchPayments(); // Refresh payments list
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
      fetchPayments(); // Refresh payments list
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
    // This functionality is not yet implemented in backend as a separate endpoint.
    // For now, it could be a status update or a custom action.
    // Placeholder for future implementation.
    alert(`Reenviar para validación ${paymentId} (funcionalidad pendiente de implementar)`);
  };

  if (loading) {
    return <div className="p-6 text-center">Cargando pagos...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-500">{error}</div>;
  }

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
    </div>
  );
};

export default PaymentsPage;
