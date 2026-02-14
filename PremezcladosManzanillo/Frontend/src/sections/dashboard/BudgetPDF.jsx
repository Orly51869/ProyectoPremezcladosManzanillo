import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import React from 'react';
import { Download } from 'lucide-react';
import { useAuth0 } from '@auth0/auth0-react';
import { getLogoDataUrl, addCompanyHeader } from '../../utils/pdfHelpers';
import { useSettings } from '../../context/SettingsContext';
import { useCurrency } from '../../context/CurrencyContext';

const formatDate = (value) => {
  if (!value) return '';
  try {
    const d = new Date(value);
    if (!isNaN(d)) {
      // Usar UTC para prevenir desplazamientos de zona horaria (ej. día anterior)
      const day = d.getUTCDate(); // d\u00eda num\u00e9rico
      const month = d.toLocaleString('es-VE', { month: 'long', timeZone: 'UTC' });
      const year = d.getUTCFullYear();
      return `${day} de ${month} de ${year}`;
    }
  } catch (e) { }
  return value;
};

const BudgetPDF = ({ budget, client, small = false, className = '' }) => {
  const { settings } = useSettings();
  const { formatPrice, currency, exchangeRate } = useCurrency();
  const { user } = useAuth0();

  const userRoles = (user?.['https://premezcladomanzanillo.com/roles'] || []).map(r => r.toLowerCase());
  const hidePrices = false;

  if (!budget) return null;

  const generatePDF = async () => {
    const doc = new jsPDF();
    const logoDataUrl = await getLogoDataUrl(settings?.company_logo);

    // --- Header Corporativo Dinámico ---
    let y = addCompanyHeader(doc, logoDataUrl, {
      name: settings?.company_name,
      rif: settings?.company_rif,
      phone: settings?.company_phone,
      address: settings?.company_address
    });

    // --- Info de Cotización (Derecha superior) ---
    doc.setFontSize(10);
    doc.setTextColor(0);
    doc.setFont('helvetica', 'bold');
    doc.text(`Cotización N°: ${budget.folio || budget.id.slice(-6).toUpperCase()}`, 196, 20, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    doc.text(`Fecha: ${formatDate(budget.createdAt)}`, 196, 26, { align: 'right' });
    if (budget.validUntil) {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(180, 0, 0); // Rojo suave para resaltar vencimiento
      doc.text(`Válido hasta: ${formatDate(budget.validUntil)}`, 196, 32, { align: 'right' });
      doc.setTextColor(0);
      doc.setFont('helvetica', 'normal');
    }

    // --- Detalles del Cliente ---
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text("DATOS DEL CLIENTE", 14, y);
    y += 7;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Cliente: ${client?.name || budget.clientName || 'N/A'}`, 14, y);
    y += 5;
    const clientDoc = client?.rif || '';
    const isRif = /^[JGPC]/i.test(clientDoc) || (clientDoc.includes('-') && clientDoc.split('-').length > 2);
    const docLabel = clientDoc ? (isRif ? 'RIF' : 'C.I.') : 'RIF / C.I.';
    doc.text(`${docLabel}: ${clientDoc || 'N/A'}`, 14, y);
    y += 5;
    doc.text(`Teléfono: ${client?.phone || 'N/A'}`, 14, y);
    y += 10;

    // --- FICHA TÉCNICA DE OBRA (Operativo) ---
    doc.setFillColor(240, 240, 240);
    doc.rect(14, y, 182, 35, 'F');
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text("FICHA TÉCNICA DE OBRA / DESPACHO", 18, y + 7);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Ubiciación: ${budget.address || 'No especificada'}`, 18, y + 14);
    doc.text(`Tipo de Obra: ${budget.workType || 'No especificado'}`, 18, y + 19);
    doc.text(`Resistencia (f'c): ${budget.resistance || 'N/A'} kg/cm²`, 18, y + 24);
    doc.text(`Tipo Concreto: ${budget.concreteType || 'N/A'}`, 100, y + 24);
    doc.text(`Volumen Est.: ${budget.volume || 0} m³`, 18, y + 29);
    doc.text(`Fecha Colado: ${formatDate(budget.deliveryDate)}`, 100, y + 29);

    y += 45;

    // --- DETALLES DE PRODUCTOS ---
    const tableColumn = hidePrices
      ? ["Descripción", "Unidad", "Cantidad"]
      : ["Descripción", "Unidad", "Cantidad", "Precio Unitario", "Total"];

    // El backend usa 'products', el frontend a veces usa 'items'. Normalizamos:
    const rawItems = budget.products || budget.items || [];

    const tableRows = rawItems.map(item => {
      const productData = item.product || {};
      const description = item.tipoConcreto && item.resistencia
        ? `${item.tipoConcreto} ${item.resistencia}`
        : (productData.name || item.description || 'N/A');

      const row = [
        description,
        // Determinar unidad basada en el tipo (Concreto = m³)
        (() => {
          // Si ya existe una unidad definida manual, usarla. Si no, inferir del tipo.
          const rawType = (item.unit || productData.type || '').toUpperCase();
          if (rawType.includes('CONCRET')) return 'm³';
          if (rawType.includes('PAVIMENT')) return 'm³';
          if (rawType.includes('MORTER')) return 'm³';
          if (rawType.includes('SERV')) return 'Glb'; // Global o Servicio
          return 'Und'; // Default para otros items genéricos
        })(),
        (item.quantity || item.volume || 0).toLocaleString('es-VE', { minimumFractionDigits: 2 }),
      ];

      if (!hidePrices) {
        row.push(formatPrice(item.unitPrice || 0));
        row.push(formatPrice(item.totalPrice || item.total || 0));
      }

      return row;
    });

    autoTable(doc, {
      startY: y,
      head: [tableColumn],
      body: tableRows,
      theme: 'grid',
      styles: { fontSize: 9, cellPadding: 2, textColor: [0, 0, 0] },
      headStyles: { fillColor: [22, 163, 74], textColor: [255, 255, 255], fontStyle: 'bold' },
      columnStyles: {
        2: { halign: 'right' },
        3: { halign: 'right' },
        4: { halign: 'right' },
      },
      didDrawPage: (data) => { y = data.cursor.y; }
    });
    y += 10;

    // --- TOTALES ---
    if (!hidePrices) {
      const igtfPercentage = parseFloat(settings?.company_igtf || "3") / 100;

      // Extraer lógica de IVA de las notas (guardado como hack en BudgetForm)
      const ivaMatch = (budget.observations || "").match(/\[IVA_APLICADO:([\d.]+)%\]/);
      const appliedIvaRate = ivaMatch ? parseFloat(ivaMatch[1]) : 0;
      const appliedIvaPct = appliedIvaRate / 100;

      // Calcular Subtotal (suma de ítems)
      const calculatedSubtotal = rawItems.reduce((acc, item) => acc + (item.totalPrice || item.total || 0), 0);

      const totalsTableRows = [
        ['Subtotal:', formatPrice(budget.subtotal || calculatedSubtotal)],
      ];

      let runningTotal = calculatedSubtotal;

      // Agregar fila de IVA si fue aplicado
      if (appliedIvaPct > 0) {
        const ivaAmount = calculatedSubtotal * appliedIvaPct;
        totalsTableRows.push([`IVA (${appliedIvaRate}%):`, formatPrice(ivaAmount)]);
        runningTotal += ivaAmount;
      }

      // Agregar lógica de IGTF (si asumimos que IGTF se aplica sobre el Total incluyendo IVA, o base? usualmente base en Venezuela pero mantengamos base por ahora o práctica estándar)
      // En realidad el usuario pidió IVA específicamente.
      // Si el pago es en moneda extranjera, IGTF aplica. Como esto es presupuesto, podríamos solo mostrar el Total.
      // Mantengamos IGTF condicional al contexto de configuraciones/pago, pero para el PDF de Presupuesto usualmente solo mostramos el Total a pagar.
      // Sin embargo, el código anterior tenía IGTF. Dejaré la lógica de IGTF como está, pero aplicada al total acumulado si es necesario?
      // Usualmente IGTF es al momento del PAGO, no del Presupuesto. Pero el código anterior lo tenía. Lo mantendré simple: Solo IVA por ahora como fue solicitado.

      /* 
         El código anterior tenía lógica de IGTF basada en configuraciones. Lo re-agregaré cuidadosamente:
         Si el PDF del presupuesto implica "Esto es lo que pagas en USD", IGTF podría ser relevante.
         Pero usualmente los presupuestos son Neto + IVA. IGTF es un impuesto sobre la transacción de pago.
         Me quedo con: Subtotal + IVA = Total.
      */

      totalsTableRows.push(['Total:', formatPrice(runningTotal)]);

      autoTable(doc, {
        startY: y,
        body: totalsTableRows,
        theme: 'plain',
        styles: { fontSize: 10, cellPadding: 1, textColor: [0, 0, 0] },
        columnStyles: {
          0: { fontStyle: 'bold', halign: 'right' },
          1: { halign: 'right', fontStyle: 'bold' },
        },
        margin: { left: 100 },
        tableWidth: 90,
        didDrawPage: (data) => { y = data.cursor.y; }
      });
      y += 5;

      // Si la moneda es Bolívares, mostrar la tasa de cambio de referencia
      if (currency === 'VES' && exchangeRate) {
        doc.setFontSize(8);
        doc.setTextColor(100);
        doc.text(`Tasa de cambio de referencia (BCV): ${exchangeRate.toLocaleString('es-VE', { minimumFractionDigits: 2 })} Bs./USD`, 196, y, { align: 'right' });
        y += 5;
      }
    }

    y += 5;

    // Notas
    doc.setFontSize(9);
    doc.text("Notas:", 14, y);
    y += 5;
    doc.text("1. Todos los productos ofertados están sujetos a cambios de precio antes de realizada la venta.", 14, y);
    y += 4;
    doc.text(`2. Los pagos en divisas (USD/Efectivo/Transferencia) están sujetos al IGTF (${settings?.company_igtf || 3}%) según ley vigente.`, 14, y);
    y += 4;
    doc.text("3. La resistencia del concreto premezclado que suministra la empresa, al ser descargado del camión mezclador, estará", 14, y);
    y += 4;
    doc.text("condicionada a que los cilindros de muestras en todo lo concerniente a su toma, curado, manipulación, ensayo e", 14, y);
    y += 4;
    doc.text("interpretación de resultados cumplan estrictamente con las normas COVENIN 338,339,344,633,1976 y COVENIN-MINDUR 1753.", 14, y);
    y += 4;
    doc.text("Fractil 10%.", 14, y);
    y += 4;
    doc.text("3. Favor hacer depósitos ó transferencia al Banco en la cuenta número", 14, y);

    // Guardar el PDF
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
