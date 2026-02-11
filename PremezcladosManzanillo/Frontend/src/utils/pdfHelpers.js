/**
 * Carga el logo de la empresa y lo convierte a DataURL para jsPDF
 * @param {string} customLogoUrl - URL opcional del logo
 * @returns {Promise<string|null>} - DataURL de la imagen o null si falla
 */
export const getLogoDataUrl = (customLogoUrl) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const scale = 2;
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/png'));
      } else {
        resolve(null);
      }
    };
    img.onerror = () => {
      resolve(null);
    };
    img.src = customLogoUrl || '/assets/LOGO_PREMEZCLADOS.svg';
  });
};

/**
 * Añade el encabezado estándar de la empresa a un documento jsPDF
 * @param {jsPDF} doc - Instancia de jsPDF
 * @param {string|null} logoDataUrl - Logo en formato DataURL
 * @param {object} companyInfo - Objeto con name, rif, phone, address
 * @returns {number} - Nueva posición Y después del encabezado
 */
export const addCompanyHeader = (doc, logoDataUrl, companyInfo = {}) => {
  const {
    name = "PREMEZCLADOS MANZANILLO, C.A.",
    rif = "J-29762187-3",
    phone = "0295-8726210",
    address = "Av. 31 de Julio, Edif Cantera Manzanillo, Sector Guatamare"
  } = companyInfo;

  let y = 15;

  if (logoDataUrl) {
    doc.addImage(logoDataUrl, 'PNG', 14, 10, 30, 30);

    doc.setFontSize(14);
    doc.setTextColor(22, 163, 74);
    doc.setFont('helvetica', 'bold');
    // Name wrapped
    const nameLines = doc.splitTextToSize(name, 75);
    doc.text(nameLines, 48, 20);

    // Calculate new Y based on name lines
    // Line height factor for Helvetica is approx 1.15, fontSize 14. 
    // 14pt ~= 4.9mm. 
    // We can use a safer increment.
    let currentY = 20 + (nameLines.length * 6);

    doc.setFontSize(9);
    doc.setTextColor(80);
    doc.setFont('helvetica', 'normal');
    doc.text(`R.I.F. ${rif}`, 48, currentY);

    currentY += 5;
    doc.text(`Telf: ${phone}`, 48, currentY);

    currentY += 5;
    const addressLines = doc.splitTextToSize(address, 75);
    doc.text(addressLines, 48, currentY);

    // Ensure we return a Y that clears all this
    y = Math.max(45, currentY + (addressLines.length * 4) + 5);
    // y = 45; removed in favor of dynamic calc above
  } else {
    doc.setFontSize(16);
    doc.setTextColor(22, 163, 74);
    doc.setFont('helvetica', 'bold');
    doc.text(name, 14, 20);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.setFont('helvetica', 'normal');
    doc.text(`R.I.F. ${rif} | Telf: ${phone}`, 14, 27);
    y = 35;
  }

  doc.setDrawColor(22, 163, 74);
  doc.setLineWidth(0.5);
  doc.line(14, y, 196, y);

  return y + 10;
};

