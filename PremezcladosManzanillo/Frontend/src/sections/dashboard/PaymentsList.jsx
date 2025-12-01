import React, { useState, useMemo } from "react";
import { formatCurrency } from "../../utils/helpers";
import PaymentCard from "./PaymentCard.jsx";

const PaymentsList = ({
  payments = [],
  viewMode = 'list',
  onValidate = () => {},
  onResend = () => {},
}) => {
  const [statusFilter, setStatusFilter] = useState("all");
  const [clientFilter, setClientFilter] = useState("");
  const [search, setSearch] = useState("");

  const filtered = useMemo(
    () =>
      payments.filter((p) => {
        if (statusFilter !== "all" && p.status !== statusFilter) return false;
        if (clientFilter && p.clientId !== clientFilter) return false;
        if (
          search &&
          !(p.reference || "").toLowerCase().includes(search.toLowerCase())
        )
          return false;
        return true;
      }),
    [payments, statusFilter, clientFilter, search]
  );

  const handleValidateClick = (p) => {
    const approve = confirm("¿Marcar pago como VALIDADO?");
    if (approve) {
      onValidate(p.id, { approve: true });
    } else {
      const motive = prompt("Ingrese motivo de rechazo:");
      if (motive) onValidate(p.id, { approve: false, observations: motive });
    }
  };

  const downloadCSV = () => {
    if (!Array.isArray(filtered) || filtered.length === 0) {
      alert('No hay pagos para exportar');
      return;
    }

    const rows = filtered.map((p) => ({
      ID: p.id,
      Presupuesto: p.budgetId || '',
      Fecha: p.date ? new Date(p.date).toLocaleDateString() : '',
      Monto: (p.amount || p.paidAmount || 0),
      Metodo: p.method || p.metodo || '',
      Estado: p.status || '',
      Referencia: p.reference || '',
      Cliente: p.clientName || '',
    }));

    const headers = Object.keys(rows[0]);
    const escapeCell = (value) => {
      if (value === null || value === undefined) return '';
      const str = String(value);
      // Escape double quotes
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
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface dark:text-gray-200"
          >
            <option value="all">Todos los estados</option>
            <option value="Pendiente">Pendiente</option>
            <option value="Validado">Validado</option>
            <option value="Rechazado">Rechazado</option>
          </select>
          <input
            placeholder="Buscar referencia"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-surface dark:text-gray-200"
          />
        </div>
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
                <th className="p-2 font-semibold">Fecha</th>
                <th className="p-2 font-semibold">Monto</th>
                <th className="p-2 font-semibold">Método</th>
                <th className="p-2 font-semibold">Estado</th>
                <th className="p-2 font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-t dark:border-dark-surface">
                  <td className="p-2 text-sm text-gray-700 dark:text-gray-300">{p.id}</td>
                  <td className="p-2 text-sm text-gray-700 dark:text-gray-300">{p.budgetId || p.budgetId}</td>
                  <td className="p-2 text-sm text-gray-700 dark:text-gray-300">
                    {new Date(p.date).toLocaleDateString()}
                  </td>
                  <td className="p-2 text-sm text-gray-700 dark:text-gray-100 font-medium">
                    {formatCurrency(p.amount || p.paidAmount || 0)}
                  </td>
                  <td className="p-2 text-sm text-gray-700 dark:text-gray-300">{p.method || p.metodo || "-"}</td>
                  <td className="p-2 text-sm">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        p.status === "Pendiente"
                          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300"
                          : p.status === "Validado"
                          ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300"
                          : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {p.status || "Sin estado"}
                    </span>
                  </td>
                  <td className="p-2 text-sm">
                    <div className="flex gap-2">
                      {(p.status === "Pendiente" || !p.status) && (
                        <button
                          onClick={() => handleValidateClick(p)}
                          title="Validar pago"
                          className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg"
                        >
                          ✅ Validar
                        </button>
                      )}
                      {p.status === "Rechazado" && (
                        <button
                          onClick={() => onResend(p.id)}
                          className="px-2 py-1 bg-brand-primary text-white rounded-lg"
                        >
                          Reenviar
                        </button>
                      )}
                      <button
                        onClick={() => alert("Ver detalles (simulado)")}
                        className="px-2 py-1 bg-white dark:bg-dark-surface dark:text-gray-200 border border-brand-light dark:border-gray-600 rounded-lg"
                      >
                        Ver
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p) => (
            <PaymentCard key={p.id} payment={p} onValidate={onValidate} onResend={onResend} />
          ))}
        </div>
      )}
    </div>
  );
};

export default PaymentsList;
