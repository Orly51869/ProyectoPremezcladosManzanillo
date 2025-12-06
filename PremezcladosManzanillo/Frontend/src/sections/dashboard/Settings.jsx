import React, { useState } from "react";
import Papa from 'papaparse';
import { mockProducts, productCategories } from '../../mock/data';
import { motion } from "framer-motion";
import { Settings as SettingsIcon, Save } from "lucide-react";

const Settings = () => {
  const [ivaRate, setIvaRate] = useState(16);
  const [companyName, setCompanyName] = useState(
    "Premezclados Manzanillo C.A."
  );
  const [logo, setLogo] = useState(null);
  const [file, setFile] = useState(null);
  const [importPreview, setImportPreview] = useState(null);
  const [importCount, setImportCount] = useState(0);
  const [importReport, setImportReport] = useState(null);

  const handleSave = () => {
    alert("Configuraciones guardadas (simulado)!");
  };

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
    // fallback: try direct keys that match ignoring case/accents/spaces
    for (let key of keys) {
      if (normalizeHeader(key) === normalizeHeader(candidates[0])) return row[key];
    }
    return undefined;
  };

  const buildPreview = (r) => ({
    id: findField(r, ['id', 'ID', 'key', 'Key', 'codigo', 'codigos', 'code', 'codigo']) || '',
    title: findField(r, ['title', 'Title', 'name', 'Name', 'titulo', 'Titulo', 'nombre', 'Nombre', 'título', 'Título', 'producto', 'productos', 'producto']) || '',
    subtitle: findField(r, ['subtitle', 'Subtitle']) || '',
    categories: (findField(r, ['category', 'categories', 'Category', 'Categories', 'categoria', 'categorias']) ? (Array.isArray(findField(r, ['category', 'categories'])) ? findField(r, ['category', 'categories']) : String(findField(r, ['category', 'categories'])).split(';').map(s => s.trim())) : []),
    imageSrc: findField(r, ['imageSrc', 'Image', 'image', 'ImageSrc', 'Image src', 'imagen']) || '',
    price: findField(r, ['precios', 'precio', 'price', 'Price', 'precio']) || ''
  });

  const handleImport = () => {
    if (!file) {
      alert('Selecciona un archivo primero.');
      return;
    }

    if (!file.name.toLowerCase().endsWith('.csv')) {
      alert('Por seguridad solo se permite importar archivos CSV. Convierte tu Excel a CSV y vuelve a intentarlo.');
      return;
    }
    // Use PapaParse to read CSV client-side
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => String(h || '').trim(),
      complete: (res) => {
        const rows = res.data || [];
        const processParsedRows = (parsedRows) => {
          const rows = parsedRows || [];
        if (!rows || rows.length === 0) {
          alert('Archivo vacío o no se pudo leer.');
          return;
        }

          // Map rows to product objects. We expect headers like: id, title, subtitle, description, imageSrc, f_c, category
          let addedCount = 0;
          let updatedCount = 0;
          let skippedCount = 0;
          const errors = [];
          const addedIds = [];
          const existingIds = new Set(Object.keys(mockProducts || {}));
          const slugify = (str) => String(str || '').toLowerCase().trim().normalize('NFD').replace(/\p{Diacritic}/gu, '').replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');

          // Use the component-level helper findField/normalizeHeader

          rows.forEach((r, idx) => {
          let baseId = findField(r, ['id', 'ID', 'key', 'Key', 'codigo', 'codigos', 'code', 'codigo']) || '';
          if (!baseId) {
            const titleFromRow = findField(r, ['title', 'Title', 'name', 'Name', 'titulo', 'Titulo', 'nombre', 'Nombre', 'título', 'Título']) || '';
            baseId = titleFromRow ? slugify(titleFromRow) : `prod-${Date.now()}-${idx}`;
          }
          // Ensure unique id
          let id = String(baseId);
          let suffix = 1;
          while (existingIds.has(id)) {
            id = `${baseId}-${suffix++}`;
          }
          // Basic validations: require a title
          const titleVal = findField(r, ['title', 'Title', 'name', 'Name', 'titulo', 'Titulo', 'nombre', 'Nombre', 'título', 'Título', 'producto', 'productos']) || '';
          if (!titleVal) {
            skippedCount++;
            errors.push({ row: idx + 1, reason: 'Falta el campo title' });
            return; // skip this row
          }

          const product = {
            id: id,
            title: titleVal || id,
            subtitle: findField(r, ['subtitle', 'Subtitle', 'precios', 'precio', 'price']) || '',
            description: findField(r, ['description', 'Description', 'desc', 'Desc', 'descripcion', 'Descripcion']) || '',
            imageSrc: findField(r, ['imageSrc', 'Image', 'image', 'ImageSrc', 'Image src', 'imagen']) || '',
            benefits: (findField(r, ['benefits', 'beneficio', 'beneficios']) ? String(findField(r, ['benefits', 'beneficio', 'beneficios'])).split(';').map(s => s.trim()) : []),
            categories: (findField(r, ['category', 'categories', 'Category', 'Categories', 'categoria', 'categorias']) ? (Array.isArray(findField(r, ['category', 'categories'])) ? findField(r, ['category', 'categories']) : String(findField(r, ['category', 'categories'])).split(';').map(s => s.trim())) : []),
            relatedProducts: []
          };
          // Save into mockProducts (mutate the exported object)
          if (!mockProducts[id]) {
            mockProducts[id] = product;
            existingIds.add(id);
            addedCount += 1;
            addedIds.push(id);
          } else {
            // update existing product fields
            Object.assign(mockProducts[id], product);
            updatedCount += 1;
          }

          // add to categories list if provided
          if (product.categories && product.categories.length > 0) {
            product.categories.forEach((cat) => {
              let catEntry = productCategories.find((c) => c.id === cat || c.title === cat);
              if (!catEntry) {
                // create a new category with a generated id
                const catId = cat.toLowerCase().replace(/\s+/g, '-');
                productCategories.push({ id: catId, title: cat, subtitle: '', description: '', heroImageSrc: '', products: [{ id: product.id, title: product.title }] });
              } else {
                // add to existing category product list if not present
                if (!catEntry.products.find(p => p.id === product.id)) {
                  catEntry.products.push({ id: product.id, title: product.title });
                }
              }
            });
          }
        });

        // Finalize report and update UI
        setImportPreview(null);
        setImportCount(0);
        setFile(null);
        const report = { added: addedCount, updated: updatedCount, skipped: skippedCount, errors, addedIds };
        setImportReport(report);
        alert(`Importación finalizada: ${report.added} añadidos, ${report.updated} actualizados, ${report.skipped} ignorados.`);
        };

        // If parsed with comma delimiter and rows are single-column with semicolons, try semicolon delimiter
        if (rows && rows.length > 0 && Object.keys(rows[0]).length === 1 && Object.values(rows[0])[0] && String(Object.values(rows[0])[0]).includes(';')) {
          // reparse using semicolon as delimiter
          Papa.parse(file, { header: true, skipEmptyLines: true, delimiter: ';', complete: (r2) => { processParsedRows(r2.data || []); }, error: (e) => { alert('Error importando productos (reparsing): ' + (e.message || e)); } });
          return;
        }

        processParsedRows(rows);
      },
      error: (e) => { alert('Error importando productos: ' + (e.message || e)); }
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4 mb-8"
      >
        <SettingsIcon className="w-10 h-10 text-black dark:text-green-400 transform hover:scale-110 transition-transform" />
        <h1 className="text-4xl font-bold text-brand-primary dark:text-white">Configuración</h1>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-dark-primary rounded-2xl p-8 shadow-lg border border-brand-light dark:border-dark-surface max-w-2xl mx-auto"
      >
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-brand-text dark:text-gray-300 mb-2">
              Nombre de la Empresa
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full p-3 border-2 border-brand-mid rounded-xl dark:bg-dark-surface dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-brand-text dark:text-gray-300 mb-2">
              Tasa de IVA (%)
            </label>
            <input
              type="number"
              value={ivaRate}
              onChange={(e) => setIvaRate(parseFloat(e.target.value))}
              className="w-full p-3 border-2 border-brand-mid rounded-xl dark:bg-dark-surface dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-primary"
              step="0.01"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-brand-text dark:text-gray-300 mb-2">
              Logo de la Empresa
            </label>
            <input
              type="file"
              onChange={(e) => setLogo(e.target.files[0])}
              className="w-full p-3 border-2 border-brand-mid rounded-xl dark:bg-dark-surface dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-primary"
              accept="image/*"
              aria-label="Subir logo de la empresa"
            />
            {logo && (
              <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                Logo seleccionado: {logo.name}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-brand-text dark:text-gray-300 mb-2">
              Importar Productos (Excel / CSV)
            </label>
            <input
              type="file"
              accept=".csv"
              onChange={(e) => {
                const f = e.target.files?.[0];
                setFile(f || null);
                setImportPreview(null);
                setImportCount(0);
                if (f) {
                  // Only CSV files are supported client-side for security reasons (avoid vulnerable xlsx libs)
                  if (!f.name.toLowerCase().endsWith('.csv')) {
                    alert('Por seguridad solo se permite importar archivos CSV. Convierte tu Excel a CSV y vuelve a intentarlo.');
                    setFile(null);
                    return;
                  }
                  Papa.parse(f, {
                    header: true,
                    skipEmptyLines: true,
                    complete: (results) => {
                      const rows = results.data || [];
                      setImportPreview(rows.slice(0, 5).map(buildPreview));
                      setImportCount(rows.length);
                    },
                    error: (err) => {
                      alert('Error leyendo el CSV: ' + err.message);
                      setFile(null);
                    }
                  });
                }
              }}
              className="w-full p-3 border-2 border-brand-mid rounded-xl dark:bg-dark-surface dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
            {importPreview && (
              <div className="mt-2 text-sm">
                <p className="text-xs text-gray-600">Vista previa (primeras 5 filas):</p>
                <pre className="text-xs bg-gray-100 dark:bg-dark-surface p-2 rounded-md overflow-auto">{JSON.stringify(importPreview, null, 2)}</pre>
                <p className="text-xs mt-2">Total de filas detectadas: {importCount}</p>
                <div className="mt-2">
                  <button className="px-3 py-2 bg-emerald-600 text-white rounded-lg" onClick={(e) => { e.preventDefault(); handleImport(); }}>Importar Productos</button>
                </div>
              </div>
            )}
            {importReport && (
              <div className="mt-3 p-3 dark:bg-dark-surface rounded-md">
                <p className="font-medium">Resultado de importación</p>
                <p className="text-sm">Añadidos: {importReport.added} — Actualizados: {importReport.updated} — Ignorados: {importReport.skipped}</p>
                {importReport.errors && importReport.errors.length > 0 && (
                  <details className="mt-2 text-xs text-red-600">
                    <summary>Ver errores ({importReport.errors.length})</summary>
                    <ul className="pl-4 list-disc">
                      {importReport.errors.map((err, i) => (
                        <li key={i}>Fila {err.row}: {err.reason}</li>
                      ))}
                    </ul>
                  </details>
                )}
                {importReport.addedIds && importReport.addedIds.length > 0 && (
                  <details className="mt-2 text-xs text-green-700">
                    <summary>Ver IDs añadidos ({importReport.addedIds.length})</summary>
                    <ul className="pl-4 list-disc">
                      {importReport.addedIds.map((id, i) => (
                        <li key={i}>{id}</li>
                      ))}
                    </ul>
                  </details>
                )}
              </div>
            )}
          </div>

          <div className="pt-4">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 bg-brand-mid text-white px-8 py-3 rounded-full text-lg hover:bg-brand-primary font-semibold transition-all transform hover:scale-105"
            >
              <Save className="w-5 h-5" /> Guardar Configuraciones
            </button>
          </div>
        </div>

        <div className="mt-8 p-6 dark:bg-dark-surface/50 rounded-xl bg-brand-soft-bg border-2 border-brand-mid">
          <h3 className="font-semibold text-brand-primary dark:text-green-300 mb-2">
            Roles de Usuario
          </h3>
          <p className="text-sm text-brand-text dark:text-gray-300">
            Admin: Acceso total | Contable: Reportes y pagos | Vendedor:
            Presupuestos y clientes (configuración simulada).
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Settings;
