import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import React from 'react';
import { Download, FileText } from 'lucide-react';
import { getLogoDataUrl, addCompanyHeader } from '../../utils/pdfHelpers';
import { useSettings } from '../../context/SettingsContext';
import { useCurrency } from '../../context/CurrencyContext';

const formatDate = (value) => {
    if (!value) return '';
    try {
        const d = new Date(value);
        if (!isNaN(d)) return d.toLocaleDateString('es-VE', { year: 'numeric', month: '2-digit', day: '2-digit' });
    } catch (e) { }
    return value;
};

// Formateador específico para Bs (mostrando 2 decimales fijos)
const formatBs = (amount) => {
    return amount.toLocaleString('es-VE', { style: 'currency', currency: 'VES', minimumFractionDigits: 2 });
};

const InvoicePDF = ({ invoice, className = '', small = false }) => {
    const { settings } = useSettings();
    const { formatPrice, currency } = useCurrency();

    // Extraer datos de la factura anidada
    const payment = invoice?.payment || {};
    const budget = payment.budget || {};
    const client = budget.client || {};
    const creator = budget.creator || {};

    // Determinar IVA e IGTF desde settings o usar defaults legales
    const ivaRate = parseFloat(settings?.company_iva || "16") / 100;
    const igtfRate = parseFloat(settings?.company_igtf || "3") / 100;

    const generatePDF = async () => {
        const doc = new jsPDF();
        const logoDataUrl = await getLogoDataUrl(settings?.company_logo);

        // --- 1. Encabezado Corporativo ---
        let y = addCompanyHeader(doc, logoDataUrl, {
            name: settings?.company_name,
            rif: settings?.company_rif,
            phone: settings?.company_phone,
            address: settings?.company_address
        });

        // --- 2. Título de Factura y Control (Derecha) ---
        // --- 2. Título de Factura y Control (Derecha) ---
        // Ajustamos coordenadas para evitar superposición con logo/encabezado
        doc.setFontSize(14);
        doc.setTextColor(220, 38, 38); // Rojo fiscal
        doc.setFont('helvetica', 'bold');
        doc.text(`FACTURA N°: ${invoice.invoiceNumber || 'POR ASIGNAR'}`, 196, 20, { align: 'right' });

        doc.setFontSize(10);
        doc.setTextColor(0);
        doc.setFont('helvetica', 'bold');
        doc.text(`N° CONTROL: 00-00-${invoice.id ? invoice.id.slice(-6).toUpperCase() : '000000'}`, 196, 26, { align: 'right' });

        doc.setFont('helvetica', 'normal');
        doc.text(`Fecha de Emisión: ${formatDate(invoice.proformaGeneratedAt)}`, 196, 32, { align: 'right' });

        // Espaciado extra antes de datos cliente
        y = Math.max(y, 45) + 5; // Asegurar que 'y' baje lo suficiente si el header es grande

        // --- 3. Datos del Cliente (Fiscalmente Obligatorios) ---
        y += 5;
        doc.setDrawColor(0);
        doc.setFillColor(245, 245, 245);
        doc.rect(14, y, 182, 25, 'F');
        doc.rect(14, y, 182, 25, 'S'); // Borde

        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text("DATOS DEL CLIENTE (RAZÓN SOCIAL):", 18, y + 6);

        doc.setFont('helvetica', 'normal');
        doc.text((client.name || 'CONTADO').toUpperCase(), 18, y + 12);

        doc.setFont('helvetica', 'bold');
        doc.text("RIF / C.I.:", 120, y + 6);
        doc.setFont('helvetica', 'normal');
        doc.text(client.rif || 'NO INDICA', 120, y + 12);

        doc.setFont('helvetica', 'bold');
        doc.text("DIRECCIÓN FISCAL:", 18, y + 18);
        doc.setFont('helvetica', 'normal');
        doc.text(client.address || 'No especificada', 55, y + 18);

        y += 35;

        // --- 4. Tabla de Items ---
        const tableColumn = ["Cant.", "Descripción / Concepto", "Precio Unit.", "Total"];

        // Calcular items y totales
        // Intentar obtener items de multiple fuentes posibles (budget.items, budget.products, o simulated products)
        const items = budget.products || budget.items || [];

        console.log("Items encontrados para PDF:", items); // Debug

        const tableRows = items.map(item => {
            // Manejar estructura anidada item.product o estructura plana item
            const productData = item.product || {};
            const desc = item.description || productData.name || item.name || 'Producto';
            const quantity = item.quantity || item.volume || 0;
            const price = item.unitPrice || item.price || productData.price || 0;
            const totalItem = item.totalPrice || item.total || (quantity * price) || 0;

            return [
                quantity.toLocaleString('es-VE', { minimumFractionDigits: 2 }),
                desc,
                formatPrice(price),
                formatPrice(totalItem)
            ];
        });

        autoTable(doc, {
            startY: y,
            head: [tableColumn],
            body: tableRows,
            theme: 'plain',
            styles: { fontSize: 9, cellPadding: 2, textColor: [0, 0, 0], lineColor: [0, 0, 0], lineWidth: 0.1 },
            headStyles: { fillColor: [220, 220, 220], textColor: [0, 0, 0], fontStyle: 'bold' },
            columnStyles: {
                0: { halign: 'center', cellWidth: 20 },
                2: { halign: 'right', cellWidth: 35 },
                3: { halign: 'right', cellWidth: 35 },
            },
            didDrawPage: (data) => { y = data.cursor.y; }
        });

        // --- 5. Totales Fiscales ---
        y += 10;

        // Re-calcular totales basados en los items (para asegurar consistencia)
        const subtotal = items.reduce((acc, item) => {
            const quantity = item.quantity || item.volume || 0;
            const price = item.unitPrice || item.price || (item.product?.price) || 0;
            const totalItem = item.totalPrice || item.total || (quantity * price) || 0;
            return acc + totalItem;
        }, 0);

        // Detectar IVA desde las observaciones del presupuesto original
        const ivaMatch = (budget.observations || "").match(/\[IVA_APLICADO:([\d.]+)%\]/);
        const appliedIvaRate = ivaMatch ? parseFloat(ivaMatch[1]) : 0;

        let ivaAmount = 0;
        if (appliedIvaRate > 0) {
            ivaAmount = subtotal * (appliedIvaRate / 100);
        }

        let total = subtotal + ivaAmount;

        // Verificar si aplica IGTF (Si el pago tiene igtfAmount > 0)
        let igtfAmount = 0;
        if (payment.igtfAmount && payment.igtfAmount > 0) {
            igtfAmount = payment.igtfAmount;
            total += igtfAmount;
        }

        const totalsData = [
            ['SUBTOTAL:', formatPrice(subtotal)],
        ];

        // Solo mostrar IVA si fue aplicado
        if (appliedIvaRate > 0) {
            totalsData.push([`IVA (${appliedIvaRate}%):`, formatPrice(ivaAmount)]);
        }

        if (igtfAmount > 0) {
            totalsData.push([`IGTF (${settings?.company_igtf || 3}%):`, formatPrice(igtfAmount)]);
        }

        totalsData.push(['TOTAL A PAGAR:', formatPrice(total)]);

        // Verificar espacio para totales
        // pageHeight se usa mas abajo, lo declaramos antes
        const pageHeight = doc.internal.pageSize.height;
        if (y + 40 > pageHeight - 40) { // 40mm approx for totals + footer margin
            doc.addPage();
            y = 20;
        }

        // Renderizado manual de totales para alineación estricta
        doc.setFontSize(10);
        doc.setTextColor(0);
        doc.setFont('helvetica', 'bold');

        // Coordenadas:
        // Columna 3 (Total) termina en 196 y tiene ancho 35 -> Empieza en 161.
        // Columna 2 (Precio) termina en 161.
        // Alineamos las etiquetas a la derecha de la Columna 2 (x=161)
        // Alineamos los montos a la derecha de la Columna 3 (x=196)

        totalsData.forEach(([label, value]) => {
            doc.text(label, 161, y + 4, { align: 'right' });
            doc.text(value, 196, y + 4, { align: 'right' });
            y += 6;
        });

        // --- 6. Footer Legal (Conversion a Bs) ---
        // Según providencia del SENIAT, si se factura en divisas debe mostrarse el contravalor en Bs.
        // Usamos la tasa guardada en el pago (histórico) o la tasa del día si es proforma
        const tasaCambio = payment.exchangeRate || 1; // Default a 1 si error
        const totalBs = total * tasaCambio;

        // Recuperamos pageHeight ya declarado
        doc.setFontSize(8);
        doc.setTextColor(80);

        let footerY = pageHeight - 30;

        doc.setLineWidth(0.5);
        doc.line(14, footerY, 196, footerY);
        footerY += 5;

        doc.text(`TASA DE CAMBIO REF. (BCV): ${tasaCambio.toLocaleString('es-VE', { minimumFractionDigits: 2 })} Bs/USD`, 14, footerY);
        doc.setFont('helvetica', 'bold');
        doc.text(`TOTAL OPERACIÓN EN BOLÍVARES: ${formatBs(totalBs)}`, 14, footerY + 5);

        // Texto legal eliminado a peticion del usuario
        // doc.setFont('helvetica', 'normal');
        // doc.text("Esta factura debe ser emitida en cumplimiento con la Providencia Administrativa SNAT/2011/0071 del SENIAT.", 14, footerY + 15);
        // doc.text(`Emitido por sistema: Premezclado Manzanillo - Usuario: ${creator.name || 'Sistema'}`, 196, footerY + 15, { align: 'right' });

        doc.save(`Factura_Fiscal_${invoice.invoiceNumber}.pdf`);
    };

    return (
        <button
            onClick={generatePDF}
            title="Descargar Factura Fiscal PDF"
            className={`flex items-center gap-1 text-red-600 hover:text-red-700 hover:bg-red-50 p-1 rounded transition-colors ${className}`}
        >
            {small ? <FileText className="w-4 h-4" /> : <><FileText className="w-4 h-4" /> <span>PDF Fiscal</span></>}
        </button>
    );
};

export default InvoicePDF;
