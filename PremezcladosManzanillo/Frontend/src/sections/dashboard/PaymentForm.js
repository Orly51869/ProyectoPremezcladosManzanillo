import React, { useState } from "react";
import { mockBudgets } from '../../mock/data';

const PaymentForm = ({ onSubmit = () => {}, onCancel = () => {} }) => {
  const [idPresupuesto, setIdPresupuesto] = useState("");
  const [fechaPago, setFechaPago] = useState("");
  const [monto, setMonto] = useState("");
  const [metodo, setMetodo] = useState("transferencia");
  const [referencia, setReferencia] = useState("");
  const [bancoEmisor, setBancoEmisor] = useState("");
  const [bancoReceptor, setBancoReceptor] = useState("");
  const [archivo, setArchivo] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!idPresupuesto || !monto) {
      alert("ID de presupuesto y monto son obligatorios.");
      return;
    }

    const budget = mockBudgets.find((b) => b.id === idPresupuesto);
    if (!budget) {
      alert("Presupuesto no encontrado.");
      return;
    }
    if (budget.status !== "approved") {
      alert("Solo se permiten pagos para presupuestos aprobados.");
      return;
    }

    const payload = {
      id_presupuesto: idPresupuesto,
      fecha_pago: fechaPago || new Date().toISOString(),
      monto_pago: parseFloat(monto),
      metodo_pago: metodo,
      referencia,
      banco_emisor: bancoEmisor,
      banco_receptor: bancoReceptor,
      comprobante_archivo: archivo ? archivo.name : null,
    };

    onSubmit(payload);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white dark:bg-dark-primary rounded-2xl p-6 shadow-md border border-brand-light dark:border-dark-surface"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-brand-text dark:text-gray-300 mb-1">
            ID del presupuesto
          </label>
          <input
            value={idPresupuesto}
            onChange={(e) => setIdPresupuesto(e.target.value)}
            className="w-full p-3 border border-brand-light dark:border-gray-600 bg-white dark:bg-dark-surface dark:text-gray-200 rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm text-brand-text dark:text-gray-300 mb-1">
            Fecha de pago
          </label>
          <input
            type="date"
            value={fechaPago}
            onChange={(e) => setFechaPago(e.target.value)}
            className="w-full p-3 border border-brand-light dark:border-gray-600 bg-white dark:bg-dark-surface dark:text-gray-200 rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm text-brand-text dark:text-gray-300 mb-1">Monto</label>
          <input
            type="number"
            step="0.01"
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
            className="w-full p-3 border border-brand-light dark:border-gray-600 bg-white dark:bg-dark-surface dark:text-gray-200 rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm text-brand-text dark:text-gray-300 mb-1">Método</label>
          <select
            value={metodo}
            onChange={(e) => setMetodo(e.target.value)}
            className="w-full p-3 border border-brand-light dark:border-gray-600 bg-white dark:bg-dark-surface dark:text-gray-200 rounded-lg"
          >
            <option value="transferencia">Transferencia</option>
            <option value="deposito">Depósito</option>
            <option value="cheque">Cheque</option>
            <option value="efectivo">Efectivo</option>
          </select>
        </div>

        <div>
          <label className="block text-sm text-brand-text dark:text-gray-300 mb-1">
            Referencia
          </label>
          <input
            value={referencia}
            onChange={(e) => setReferencia(e.target.value)}
            className="w-full p-3 border border-brand-light dark:border-gray-600 bg-white dark:bg-dark-surface dark:text-gray-200 rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm text-brand-text dark:text-gray-300 mb-1">
            Banco emisor
          </label>
          <input
            value={bancoEmisor}
            onChange={(e) => setBancoEmisor(e.target.value)}
            className="w-full p-3 border border-brand-light dark:border-gray-600 bg-white dark:bg-dark-surface dark:text-gray-200 rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm text-brand-text dark:text-gray-300 mb-1">
            Banco receptor
          </label>
          <input
            value={bancoReceptor}
            onChange={(e) => setBancoReceptor(e.target.value)}
            className="w-full p-3 border border-brand-light dark:border-gray-600 bg-white dark:bg-dark-surface dark:text-gray-200 rounded-lg"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm text-brand-text dark:text-gray-300 mb-1">
            Comprobante (PDF/Imagen)
          </label>
          <input
            type="file"
            accept="application/pdf,image/*"
            onChange={(e) => setArchivo(e.target.files[0])}
            className="w-full dark:text-gray-300"
          />
        </div>
      </div>

      <div className="mt-4 flex gap-2">
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
