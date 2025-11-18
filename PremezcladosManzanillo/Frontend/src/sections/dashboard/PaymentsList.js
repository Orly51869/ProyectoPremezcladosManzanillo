import React, { useState, useMemo } from "react";
import { formatCurrency } from "../../utils/helpers";
import { LayoutGrid, List } from 'lucide-react';
import PaymentCard from "./PaymentCard";

const PaymentsList = ({
  payments = [],
  onValidate = () => {},
  onResend = () => {},
  onViewReceipt = () => {},
}) => {
  const [statusFilter, setStatusFilter] = useState("all");
  const [clientFilter, setClientFilter] = useState("");
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState('list'); // 'kanban' o 'list'

  const handleExportCSV = () => {
    const csvRows = [];
    const headers = ["ID", "Presupuesto", "Fecha", "Monto", "Método", "Estado"];
    csvRows.push(headers.join(","));

    for (const payment of filteredPayments) {
      const values = [
        payment.id,
        payment.budgetId,
        new Date(payment.date).toLocaleDateString(),
        payment.amount || payment.paidAmount || 0,
        payment.method || payment.metodo || "-",
        payment.status || "Sin estado",
      ];
      csvRows.push(values.join(","));
    }

    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "pagos.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      if (statusFilter !== "all" && p.status !== statusFilter) return false;
      if (clientFilter && p.clientId !== clientFilter) return false;
      if (
        search &&
        !(p.reference || "").toLowerCase().includes(search.toLowerCase())
      )
        return false;
      return true;
    });
  }, [payments, statusFilter, clientFilter, search]);

  const KanbanView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredPayments.map((p) => (
        <PaymentCard
          key={p.id}
          payment={p}
          onValidate={onValidate}
          onResend={onResend}
          onViewReceipt={onViewReceipt}
        />
      ))}
    </div>
  );

  const ListView = () => (
    <div className="overflow-x-auto bg-white dark:bg-dark-primary rounded-2xl p-5 shadow-sm border border-gray-200 dark:border-dark-surface">
      <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
          <tr>
            <th scope="col" className="px-6 py-3">ID</th>
            <th scope="col" className="px-6 py-3">Presupuesto</th>
            <th scope="col" className="px-6 py-3">Fecha</th>
            <th scope="col" className="px-6 py-3">Monto</th>
            <th scope="col" className="px-6 py-3">Método</th>
            <th scope="col" className="px-6 py-3">Estado</th>
            <th scope="col" className="px-6 py-3">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filteredPayments.map((p) => (
            <tr key={p.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
              <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">{p.id}</th>
              <td className="px-6 py-4">{p.budgetId || p.budgetId}</td>
              <td className="px-6 py-4">
                {new Date(p.date).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                {formatCurrency(p.amount || p.paidAmount || 0)}
              </td>
              <td className="px-6 py-4">{p.method || p.metodo || "-"}</td>
              <td className="px-6 py-4">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
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
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  {p.status === 'Validado' && (
                    <button onClick={() => onViewReceipt(p)} className="font-medium text-blue-600 dark:text-blue-500 hover:underline">Ver Recibo</button>
                  )}
                  {p.status === 'Pendiente' && (
                    <button onClick={() => onValidate(p.id)} className="font-medium text-emerald-600 dark:text-emerald-500 hover:underline">Validar</button>
                  )}
                  {p.status === 'Rechazado' && (
                    <button onClick={() => onResend(p.id)} className="font-medium text-gray-600 dark:text-gray-500 hover:underline">Reenviar</button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="border border-gray-200 dark:border-dark-surface rounded-xl p-3 flex flex-col sm:flex-row gap-3 items-center">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-white dark:bg-dark-surface dark:text-gray-200 border border-gray-200 dark:border-gray-600 rounded-lg text-sm flex-1"
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
          className="px-3 py-2 bg-white dark:bg-dark-surface dark:text-gray-200 border border-gray-200 dark:border-gray-600 rounded-lg text-sm flex-1"
        />
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3 py-2 bg-gray-100 dark:bg-dark-surface dark:text-gray-200 rounded-lg text-sm"
          >
            Exportar CSV
          </button>
          <button onClick={() => setViewMode('kanban')} className={`p-2 rounded-lg ${viewMode === 'kanban' ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-600 dark:bg-dark-surface'}`}>
              <LayoutGrid size={20} />
          </button>
          <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-600 dark:bg-dark-surface'}`}>
              <List size={20} />
          </button>
        </div>
      </div>

      {viewMode === 'kanban' ? <KanbanView /> : <ListView />}
    </div>
  );
};

export default PaymentsList;
