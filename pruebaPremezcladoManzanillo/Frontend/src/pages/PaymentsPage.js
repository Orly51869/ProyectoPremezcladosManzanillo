import React, { useState } from "react";
import { FileText } from "lucide-react";
import PaymentsList from "../sections/dashboard/PaymentsList";
import PaymentForm from "../sections/dashboard/PaymentForm";
import ReceiptModal from "../sections/dashboard/ReceiptModal";
import ValidationModal from "../sections/dashboard/ValidationModal"; // Importamos el nuevo modal
import { mockPayments, mockBudgets, mockClients } from "../mock/data"; // Consolidado en una línea
import { generateId } from "../utils/helpers";

// Usuario actual simulado (en una app real proviene del sistema de autenticación)
const currentUser = { username: "admin", role: "Tesorería" };

const PaymentsPage = () => {
  const [payments, setPayments] = useState(mockPayments || []);
  const [showForm, setShowForm] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const [paymentToValidate, setPaymentToValidate] = useState(null); // Estado para el modal

  const registerPayment = (payload) => {
    // Validar que el presupuesto exista y esté aprobado
    const budget = mockBudgets.find((b) => b.id === payload.id_presupuesto);
    if (!budget) {
      alert("Presupuesto no encontrado.");
      return;
    }
    if (budget.status !== "approved") {
      alert("El presupuesto no está aprobado. No se puede registrar el pago.");
      return;
    }

    const newPayment = {
      id: generateId(),
      budgetId: payload.id_presupuesto,
      amount: payload.monto_pago,
      paidAmount: payload.monto_pago,
      pending: Math.max(0, (budget.total || 0) - payload.monto_pago),
      date: payload.fecha_pago || new Date(),
      method: payload.metodo_pago,
      reference: payload.referencia,
      bankFrom: payload.banco_emisor,
      bankTo: payload.banco_receptor,
      receipt: payload.comprobante_archivo || null,
      status: "Pendiente",
      observations: "",
      validator: null,
      validatedAt: null,
    };

    setPayments((prev) => [newPayment, ...prev]);
    setShowForm(false);
    alert("Pago registrado (simulado). Queda pendiente de validación.");
  };

  const validatePayment = (paymentId, { approve, observations = "" }) => {
    // Solo roles autorizados (Tesorería o Administrador)
    if (!["Tesorería", "Administrador"].includes(currentUser.role)) {
      alert("No tiene permisos para validar pagos.");
      return;
    }

    setPayments((prev) =>
      prev.map((p) => {
        if (p.id !== paymentId) return p;
        if (approve) {
          const validated = {
            ...p,
            status: "Validado",
            validator: currentUser.username,
            validatedAt: new Date(),
            observations,
          };
          return validated;
        }
        return {
          ...p,
          status: "Rechazado",
          validator: currentUser.username,
          validatedAt: new Date(),
          observations,
        };
      })
    );
    setPaymentToValidate(null); // Cierra el modal después de la acción
  };

  const handleDownloadReceipt = (r) => {
    // Simulación de descarga de comprobante (PDF)
    alert(`Descargando comprobante ${r.id} (simulado)`);
  };

  const handleViewReceipt = (payment) => {
    const budget = mockBudgets.find((b) => b.id === payment.budgetId);
    const client = mockClients.find((c) => c.id === budget?.clientId);
    const receiptData = {
      id: payment.budgetId,
      paymentId: payment.id,
      budgetId: payment.budgetId,
      budgetTitle: budget?.title,
      clientName: client?.name,
      amount: payment.paidAmount || payment.amount,
      date: payment.validatedAt || payment.date,
    };
    setReceipt(receiptData);
  };

  const resendForValidation = (paymentId) => {
    setPayments((prev) =>
      prev.map((p) =>
        p.id === paymentId ? { ...p, status: "Pendiente", observations: "" } : p
      )
    );
  };

  // Abre el modal de validación en lugar de validar directamente
  const handleOpenValidationModal = (paymentId) => {
    setPaymentToValidate(payments.find(p => p.id === paymentId));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <FileText className="w-8 h-8 text-brand-mid dark:text-green-400" />
          <h1 className="text-3xl font-bold text-brand-primary dark:text-dark-primary">Pagos</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowForm(true)}
            className="bg-brand-primary text-white px-4 py-2 rounded-xl hover:bg-brand-mid"
          >
            Registrar Pago
          </button>
        </div>
      </div>

      {showForm && (
        <div className="mb-6">
          <PaymentForm
            onCancel={() => setShowForm(false)}
            onSubmit={registerPayment}
          />
        </div>
      )}

      <PaymentsList
        payments={payments}
        onValidate={(id) => handleOpenValidationModal(id)}
        currentUser={currentUser}
        onResend={(id) => resendForValidation(id)}
        onViewReceipt={handleViewReceipt}
      />

      {receipt && (
        <ReceiptModal
          receipt={receipt}
          onClose={() => setReceipt(null)}
          onDownload={handleDownloadReceipt}
        />
      )}

      <ValidationModal
        payment={paymentToValidate}
        onClose={() => setPaymentToValidate(null)}
        onConfirm={validatePayment}
      />
    </div>
  );
};

export default PaymentsPage;