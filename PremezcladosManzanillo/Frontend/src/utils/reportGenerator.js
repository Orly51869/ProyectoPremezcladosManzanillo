import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatCurrency } from './helpers';
import { getLogoDataUrl, addCompanyHeader } from './pdfHelpers';

export const generateReportPDF = async (data, stats, role, userName) => {
    const doc = new jsPDF();
    const logoDataUrl = await getLogoDataUrl();
    
    // --- Header Corporativo ---
    let y = addCompanyHeader(doc, logoDataUrl);

    // --- Title ---
    doc.setDrawColor(200);
    doc.line(14, y, 196, y);
    y += 10;
    
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text(`Reporte de Gestión - ${role}`, 14, y);
    
    doc.setFontSize(10);
    doc.text(`Generado por: ${userName}`, 196, y, { align: 'right' });
    y += 6;
    doc.text(`Fecha: ${new Date().toLocaleDateString('es-VE', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`, 196, y, { align: 'right' });
    
    y += 10;

    // --- Content based on Role ---
    
    // 1. Financial Summary (Admin/Contable)
    if (['Administrador', 'Contable'].includes(role)) {
        doc.setFontSize(12);
        doc.setTextColor(0);
        doc.text("Resumen Financiero", 14, y);
        y += 6;

        const summaryData = [
            ['Total Ingresos', formatCurrency(stats?.totalIncome || 0)],
            ['Total Pendiente por Cobrar', formatCurrency(stats?.pendingAmount || 0)],
            ['Total Presupuestos Aprobados', (stats?.approvedBudgets || 0).toString()],
            ['Total Pagos Procesados', (stats?.totalPayments || 0).toString()],
        ];

        autoTable(doc, {
            startY: y,
            head: [['Concepto', 'Valor']],
            body: summaryData,
            theme: 'striped',
            headStyles: { fillColor: [22, 163, 74] }, // Green
            columnStyles: { 1: { halign: 'right', fontStyle: 'bold' } },
        });

        y = doc.lastAutoTable.finalY + 15;
    }

    // 2. Monthly Evolution (Chart Data)
    if (stats?.chartData && ['Administrador', 'Contable'].includes(role)) {
        doc.setFontSize(12);
        doc.text("Evolución Mensual (Últimos 6 Meses)", 14, y);
        y += 6;

        const tableHead = [['Mes', 'Ingresos ($)', 'Pendiente ($)']];
        const tableBody = stats.chartData.labels.map((label, index) => [
            label,
            formatCurrency(stats.chartData.ingresosSeries[index]),
            formatCurrency(stats.chartData.pendientesSeries[index])
        ]);

        autoTable(doc, {
            startY: y,
            head: tableHead,
            body: tableBody,
            theme: 'grid',
            headStyles: { fillColor: [55, 65, 81] }, // Dark Gray
            columnStyles: { 
                1: { halign: 'right' },
                2: { halign: 'right', textColor: [220, 38, 38] } // Red for pending
            },
        });
        
        y = doc.lastAutoTable.finalY + 15;
    }

    // 3. Operational Summary (Admin/Comercial)
    if (['Administrador', 'Comercial'].includes(role)) {
        // If we are continuing on same page, check space
        if (y > 250) {
            doc.addPage();
            y = 20;
        }

        doc.setFontSize(12);
        doc.text("Resumen Operativo y Comercial", 14, y);
        y += 6;

        const operationalData = [
            ['Total Clientes Registrados', (stats?.totalClients || 0).toString()],
            ['Total Presupuestos Generados', (stats?.totalBudgets || 0).toString()],
            ['Presupuestos Aprobados', (stats?.approvedBudgets || 0).toString()],
            ['Tasa de Conversión (Aprox)', stats?.totalBudgets ? `${((stats.approvedBudgets / stats.totalBudgets) * 100).toFixed(1)}%` : '0%']
        ];

        autoTable(doc, {
            startY: y,
            head: [['Indicador', 'Valor']],
            body: operationalData,
            theme: 'striped',
            headStyles: { fillColor: [234, 88, 12] }, // Orange for Commercial
            columnStyles: { 1: { halign: 'right', fontStyle: 'bold' } },
        });
    }

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text('Premezclados Manzanillo, C.A. - Sistema de Gestión', 14, 285);
        doc.text(`Página ${i} de ${pageCount}`, 196, 285, { align: 'right' });
    }

    doc.save(`reporte-${role.toLowerCase()}-${new Date().toISOString().split('T')[0]}.pdf`);
};
