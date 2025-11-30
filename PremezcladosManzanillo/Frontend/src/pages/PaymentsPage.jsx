import React, { useState } from "react";
import { FileText, List, LayoutGrid } from "lucide-react";
import PaymentsList from "../sections/dashboard/PaymentsList.jsx";
import PaymentForm from "../sections/dashboard/PaymentForm.jsx";
import ReceiptModal from "../sections/dashboard/ReceiptModal.jsx";
import { mockPayments, mockBudgets } from "../mock/data";
import { mockClients } from "../mock/data";
import { generateId } from "../utils/helpers";

// Usuario actual simulado (en una app real proviene del sistema de autenticación)
const currentUser = { username: "admin", role: "Tesorería" };

const PaymentsPage = () => {
  const [payments, setPayments] = useState(mockPayments || []);
  const [showForm, setShowForm] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'canvas'

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
          // Generar comprobante en memoria (simulado)
          const budget = mockBudgets.find((b) => b.id === validated.budgetId);
          const client = mockClients.find((c) => c.id === budget?.clientId);
          const newReceipt = {
            id: generateId(),
            paymentId: validated.id,
            budgetId: validated.budgetId,
            budgetTitle: budget?.title,
            clientName: client?.name,
            amount: validated.paidAmount || validated.amount,
            date: validated.validatedAt || new Date(),
          };
          setReceipt(newReceipt);
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
  };

  const handleDownloadReceipt = (r) => {
    // Simulación de descarga de comprobante (PDF)
    alert(`Descargando comprobante ${r.id} (simulado)`);
  };

  const resendForValidation = (paymentId) => {
    setPayments((prev) =>
      prev.map((p) =>
        p.id === paymentId ? { ...p, status: "Pendiente", observations: "" } : p
      )
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <FileText className="w-8 h-8 text-brand-mid dark:text-green-400" />
          <h1 className="text-3xl font-bold text-brand-primary dark:text-dark-primary">Pagos</h1>
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
        viewMode={viewMode}
        onValidate={(id, payload) => validatePayment(id, payload)}
        onResend={(id) => resendForValidation(id)}
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
