const fs = require('fs');
const path = require('path');
const Papa = require('papaparse');

// Reutilizar lógica similar al parseo en Settings.jsx; no importar código React para mantener compatibilidad con Node
const normalizeHeader = (h) => String(h || '')
  .toLowerCase()
  .trim()
  .normalize('NFD')
  .replace(/\p{Diacritic}/gu, '')
  .replace(/\s+/g, ' ');

const findField = (row, candidates = []) => {
  const keys = Object.keys(row || {});
  const normalizedMap = keys.map(k => ({ k, nk: normalizeHeader(k) }));
  for (let cand of candidates) {
    const nc = normalizeHeader(cand);
    const f = normalizedMap.find(x => x.nk === nc);
    if (f) return row[f.k];
  }
  for (let key of keys) {
    if (normalizeHeader(key) === normalizeHeader(candidates[0])) return row[key];
  }
  return undefined;
};

const slugify = (str) => String(str || '').toLowerCase().trim().normalize('NFD').replace(/\p{Diacritic}/gu, '').replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');

const filePath = 'c:/Users/orlan/OneDrive/Escritorio/Productos2025Manzanillo.csv';
const fileData = fs.readFileSync(filePath, 'utf8');

function processRows(rows) {
  let addedCount = 0;
  let updatedCount = 0;
  let skippedCount = 0;
  const errors = [];
  const existingIds = new Set(); // No importamos mockProducts en esta prueba; solo imprimir lo que se añadiría
  const addedIds = [];

  rows.forEach((r, idx) => {
    let baseId = findField(r, ['id', 'ID', 'key', 'Key', 'codigo', 'codigos', 'code', 'codigo']) || '';
    if (!baseId) {
      const titleFromRow = findField(r, ['title', 'Title', 'name', 'Name', 'titulo', 'Titulo', 'nombre', 'Nombre', 'título', 'Título', 'producto', 'productos']) || '';
      baseId = titleFromRow ? slugify(titleFromRow) : `prod-${Date.now()}-${idx}`;
    }

    let id = String(baseId);
    let suffix = 1;
    while (existingIds.has(id)) {
      id = `${baseId}-${suffix++}`;
    }

    const titleVal = findField(r, ['title', 'Title', 'name', 'Name', 'titulo', 'Titulo', 'nombre', 'Nombre', 'título', 'Título', 'producto', 'productos']) || '';
    if (!titleVal) {
      skippedCount++;
      errors.push({ row: idx + 1, reason: 'Falta el campo title' });
      return;
    }

    const subtitle = findField(r, ['subtitle', 'Subtitle', 'precios', 'precio', 'price']) || '';

    const product = {
      id: id,
      title: titleVal || id,
      subtitle,
      price: findField(r, ['precios', 'precio', 'price', 'Price']) || ''
    };

    // Simular adición
    if (!existingIds.has(id)) {
      existingIds.add(id);
      addedCount += 1;
      addedIds.push(id);
    } else {
      updatedCount += 1;
    }
  });

  return { addedCount, updatedCount, skippedCount, errors, addedIds };
}

let parsed = Papa.parse(fileData, { header: true, skipEmptyLines: true });
let rows = parsed.data || [];

// Si se parseó en una sola columna con punto y coma, volver a parsear usando el delimitador ';'
if (rows.length > 0 && Object.keys(rows[0]).length === 1 && Object.values(rows[0])[0] && String(Object.values(rows[0])[0]).includes(';')) {
  parsed = Papa.parse(fileData, { header: true, skipEmptyLines: true, delimiter: ';' });
  rows = parsed.data || [];
}

const report = processRows(rows);
console.log('Parsed rows count:', rows.length);
console.log('Report:', report);
console.log('Preview first rows:', rows.slice(0, 5));


