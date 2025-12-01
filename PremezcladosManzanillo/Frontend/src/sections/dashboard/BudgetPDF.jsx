import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import React from 'react'; // Import React
import { Download } from 'lucide-react';

const formatDate = (value) => {
  if (!value) return '';
  try {
    const d = new Date(value);
    if (!isNaN(d)) return d.toLocaleDateString('es-VE', { year: 'numeric', month: 'long', day: 'numeric' });
  } catch (e) {}
  return value;
};

const BudgetPDF = ({ budget, client, small = false, className = '' }) => {
  if (!budget) return null;

  const generatePDF = () => {
    const doc = new jsPDF();
    let y = 15; // Initial Y position

    // --- Company Header (Hardcoded for now, ideally from config) ---
    doc.setFontSize(10);
    doc.text("PREMEZCLADOS MANZANILLO, C.A.", 14, y);
    y += 5;
    doc.text("R.IF.J-29762187-3", 14, y);
    y += 5;
    doc.text("0295-8726210", 14, y);
    y += 5;
    doc.text("AV. 31 DE JULIO, EDIF CANTERA MANZANILLO, C.A PISO P.8. OF. ADMINISTRACION SECTOR GUATAMARE", 14, y);
    y += 5;
    doc.text("ZONA POSTAL 6304", 14, y);
    // y += 10; // This will be handled by the new lines

    // Add Cotización N° and Fecha to the right side of the header
    // We need to reset y to an appropriate position for the right-aligned text
    // Let's use a fixed y for these, relative to the top of the page,
    // to align them with the company header lines.
    let rightHeaderY = 15; // Start at the same y as the company name

    doc.text(`Cotización N°: ${budget.folio || budget.id}`, 196, rightHeaderY, { align: 'right' });
    rightHeaderY += 5;
    doc.text(`Fecha: ${formatDate(budget.createdAt)}`, 196, rightHeaderY, { align: 'right' });
    rightHeaderY += 5;

    // Now, ensure the main 'y' for the rest of the document continues correctly.
    // The maximum y from the left header is after "ZONA POSTAL 6304" which is current 'y'.
    // The maximum y from the right header is 'rightHeaderY'.
    // The separator line should start after the maximum of these two.
    y = Math.max(y, rightHeaderY);
    y += 5; // Add a small buffer

    // --- Separator Line ---
    doc.line(14, y, 196, y); // x1, y1, x2, y2
    y += 10;

    // --- Client / Quotation Details ---
    doc.setFontSize(10);
    doc.text(`Cliente: ${client?.name || budget.clientName || 'N/A'}`, 14, y);
    y += 5;
    doc.text(`RIF: ${client?.rif || 'N/A'}`, 14, y); // Assuming client has a RIF property
    y += 5;

    doc.text(`Atención: ${client?.contactPerson || 'JESUS VARELA'}`, 14, y); // Assuming client has contactPerson
    y += 10;

    // --- Product Table ---
    const tableColumn = ["Descripción", "Unidad", "Cantidad", "Precio Unitario", "Total"];
      const tableRows = budget.items?.map(item => {
      const description = item.tipoConcreto && item.resistencia
        ? `${item.tipoConcreto} ${item.resistencia}`
        : item.description || 'N/A';
      return [
        description,
      item.unit || 'N/A',
      ((item.volume || item.quantity) || 0).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      (item.unitPrice || 0).toLocaleString('es-VE', { style: 'currency', currency: 'USD' }), // Assuming USD
      (item.total || 0).toLocaleString('es-VE', { style: 'currency', currency: 'USD' }), // Assuming USD
    ]});

    autoTable(doc, {
      startY: y,
      head: [tableColumn],
      body: tableRows,
      theme: 'grid',
      styles: { fontSize: 9, cellPadding: 2, textColor: [0, 0, 0] },
      headStyles: { fillColor: [200, 200, 200], textColor: [0, 0, 0], fontStyle: 'bold' },
      columnStyles: {
        2: { halign: 'right' }, // Quantity
        3: { halign: 'right' }, // Unit Price
        4: { halign: 'right' }, // Total
      },
      didDrawPage: function (data) {
        y = data.cursor.y; // Update y position after table
      }
    });
    y += 10; // Add some space after the table

    // --- Totals and Notes ---
    doc.setFontSize(10);

    // Totals table (aligned right)
    const totalsTableRows = [
      ['Subtotal:', (budget.subtotal || 0).toLocaleString('es-VE', { style: 'currency', currency: 'USD' })],
      ['Descuento Especial:', (budget.specialDiscount || 0).toLocaleString('es-VE', { style: 'currency', currency: 'USD' })],
      ['Monto Descuento:', (budget.discountAmount || 0).toLocaleString('es-VE', { style: 'currency', currency: 'USD' })],
      ['Total a Pagar:', (budget.total || 0).toLocaleString('es-VE', { style: 'currency', currency: 'USD' })],
    ];

    autoTable(doc, {
      startY: y,
      body: totalsTableRows,
      theme: 'plain', // No borders for totals table
      styles: { fontSize: 10, cellPadding: 1, textColor: [0, 0, 0] },
      columnStyles: {
        0: { fontStyle: 'bold' }, // Label column
        1: { halign: 'right' }, // Value column
      },
      margin: { left: 120 }, // Align to the right side of the page
      tableWidth: 70, // Adjust width as needed
      didDrawPage: function (data) {
        y = data.cursor.y; // Update y position after totals table
      }
    });
    y += 10;

    // Notes
    doc.setFontSize(9);
    doc.text("Notas:", 14, y);
    y += 5;
    doc.text("1. Todos los productos ofertados están sujetos a cambios de precio antes de realizada la venta.", 14, y);
    y += 4;
    doc.text("2. La resistencia del concreto premezclado que suministra la empresa, al ser descargado del camión mezclador, estará", 14, y);
    y += 4;
    doc.text("condicionada a que los cilindros de muestras en todo lo concerniente a su toma, curado, manipulación, ensayo e", 14, y);
    y += 4;
    doc.text("interpretación de resultados cumplan estrictamente con las normas COVENIN 338,339,344,633,1976 y COVENIN-MINDUR 1753.", 14, y);
    y += 4;
    doc.text("Fractil 10%.", 14, y);
    y += 4;
    doc.text("3. Favor hacer depósitos ó transferencia al Banco en la cuenta número", 14, y);

    // Save the PDF
    doc.save(`presupuesto-${budget.folio || budget.id}.pdf`);
  };

  return (
    <div>
      <button
        onClick={generatePDF}
        aria-label="Generar Presupuesto"
        title="Generar Presupuesto"
        className={`${small ? 'px-3 py-1 text-sm rounded-md' : 'px-4 py-2 text-base rounded-md'} bg-green-700 text-white hover:bg-green-600 flex items-center gap-2 ${className}`}
      >
        <Download className={`${small ? 'w-3 h-3' : 'w-5 h-5'}`} />
        {small ? 'Generar' : 'Generar Presupuesto'}
      </button>
    </div>
  );
};

export default BudgetPDF;
