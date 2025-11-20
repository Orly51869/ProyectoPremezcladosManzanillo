import React, { useState, useMemo } from "react";
import * as XLSX from 'xlsx-js-style';
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';
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

  const handleExportXLSX = () => {
    const headers = ["ID", "Presupuesto", "Fecha", "Monto", "Método", "Estado"];
    const data = filteredPayments.map(payment => ({
      ID: payment.id,
      Presupuesto: payment.budgetId,
      Fecha: new Date(payment.date).toLocaleDateString(),
      Monto: payment.amount || payment.paidAmount || 0,
      'Método': payment.metodo || "-",
      Estado: payment.status || "Sin estado",
    }));

    const ws = XLSX.utils.json_to_sheet(data, { header: headers });

    const cellStyle = {
      alignment: {
        horizontal: "center",
        vertical: "center"
      }
    };

    const range = XLSX.utils.decode_range(ws['!ref']);
    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cell_address = { c: C, r: R };
        const cell_ref = XLSX.utils.encode_cell(cell_address);
        if (ws[cell_ref]) {
          ws[cell_ref].s = cellStyle;
        }
      }
    }
    
    const colWidths = headers.map(header => ({ wch: Math.max(header.length, 13) }));
    ws['!cols'] = colWidths;

    // Configurar para ajustar a una página de ancho
    if (!ws['!pageSetup']) ws['!pageSetup'] = {};
    ws['!pageSetup'].fitToPage = true;
    ws['!pageSetup'].fitToWidth = 1;
    ws['!pageSetup'].fitToHeight = 0; // 0 permite que se extienda a varias páginas de largo

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Pagos");

    XLSX.writeFile(wb, "Pagos.xlsx");
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const tableColumn = ["ID", "Presupuesto", "Fecha", "Monto", "Método", "Estado"];
    const tableRows = [];

    filteredPayments.forEach(payment => {
      const paymentData = [
        payment.id,
        payment.budgetId,
        new Date(payment.date).toLocaleDateString(),
        formatCurrency(payment.amount || payment.paidAmount || 0),
        payment.metodo || "-",
        payment.status || "Sin estado",
      ];
      tableRows.push(paymentData);
    });

    doc.text("Lista de Pagos", 14, 15);
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });
    doc.save("Pagos.pdf");
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
    <div className="overflow-x-auto bg-white dark:bg-dark-primary rounded-2xl p-5 shadow-lg border border-gray-200 dark:border-dark-surface">
      <table className="w-full text-sm text-left text-gray-600 dark:text-gray-400">
        <thead className="text-xs text-gray-700 uppercase bg-gray-100 dark:bg-gray-700 dark:text-gray-300">
          <tr>
            <th scope="col" className="px-8 py-4 font-semibold cell-center">ID</th>
            <th scope="col" className="px-8 py-4 font-semibold cell-center">Presupuesto</th>
            <th scope="col" className="px-8 py-4 font-semibold cell-center">Fecha</th>
            <th scope="col" className="px-8 py-4 font-semibold cell-center">Monto</th>
            <th scope="col" className="px-8 py-4 font-semibold cell-center">Método</th>
            <th scope="col" className="px-8 py-4 font-semibold cell-center">Estado</th>
            <th scope="col" className="px-8 py-4 font-semibold cell-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filteredPayments.map((p) => (
            <tr key={p.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200">
              <th scope="row" className="px-8 py-5 font-medium text-gray-900 whitespace-nowrap dark:text-white cell-center">{p.id}</th>
              <td className="px-8 py-5 cell-center">{p.budgetId}</td>
              <td className="px-8 py-5 cell-center">
                {new Date(p.date).toLocaleDateString('es-VE', { day: '2-digit', month: '2-digit', year: 'numeric' })}
              </td>
              <td className="px-8 py-5 font-semibold text-gray-800 dark:text-white cell-center">
                {formatCurrency(p.amount || p.paidAmount || 0)}
              </td>
              <td className="px-8 py-5 cell-center">{p.metodo || "-"}</td>
              <td className="px-8 py-5 cell-center">
                <span
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold tracking-wider ${
                    p.status === "Pendiente"
                      ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/60 dark:text-yellow-200"
                      : p.status === "Validado"
                      ? "bg-green-100 text-green-800 dark:bg-green-900/60 dark:text-green-200"
                      : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                  }`}
                >
                  {p.status || "Sin estado"}
                </span>
              </td>
              <td className="px-8 py-5 cell-center">
                <div className="flex items-center justify-center gap-4">
                  {p.status === 'Validado' && (
                    <button onClick={() => onViewReceipt(p)} className="font-semibold text-blue-600 dark:text-blue-500 hover:text-blue-800">Ver Recibo</button>
                  )}
                  {p.status === 'Pendiente' && (
                    <button onClick={() => onValidate(p.id)} className="font-semibold text-emerald-600 dark:text-emerald-500 hover:text-emerald-800">Validar</button>
                  )}
                  {p.status === 'Rechazado' && (
                    <button onClick={() => onResend(p.id)} className="font-semibold text-gray-600 dark:text-gray-500 hover:text-gray-800">Reenviar</button>
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
            onClick={handleExportXLSX}
            className="px-3 py-2 bg-gray-100 dark:bg-dark-surface dark:text-gray-200 rounded-lg text-sm"
          >
            Exportar XLSX
          </button>
          <button
            onClick={handleExportPDF}
            className="px-3 py-2 bg-gray-100 dark:bg-dark-surface dark:text-gray-200 rounded-lg text-sm"
          >
            Exportar PDF
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
