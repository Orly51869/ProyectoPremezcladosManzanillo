import React, { useState } from "react";
import { motion } from "framer-motion";
import { Settings as SettingsIcon, Save } from "lucide-react";
import * as XLSX from 'xlsx'; // Importar la librería para leer Excel

const Settings = () => {
  const [ivaRate, setIvaRate] = useState(16);
  const [companyName, setCompanyName] = useState(
    "Premezclados Manzanillo C.A."
  );
  const [logo, setLogo] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');

  const handleSave = () => {
    alert("Configuraciones guardadas (simulado)!");
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadStatus(`Leyendo archivo "${file.name}"...`);
    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(worksheet);

      // --- SIMULACIÓN ---
      // En una app real, aquí enviarías 'json' al estado global (Context/Redux)
      // o al backend. Por ahora, lo mostramos en una alerta.
      console.log("Productos leídos desde Excel:", json);
      alert(`¡Simulación exitosa! Se leyeron ${json.length} productos. Revisa la consola del navegador para ver los datos.`);
      setUploadStatus(`¡Éxito! Se cargaron ${json.length} productos desde ${file.name}.`);
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4 mb-8"
      >
        <SettingsIcon className="w-8 h-8 text-brand-mid dark:text-green-400" />
        <h1 className="text-3xl font-bold text-brand-primary dark:text-dark-primary">Configuración</h1>
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
              className="w-full p-3 border border-brand-light dark:border-gray-600 rounded-xl bg-brand-soft-bg dark:bg-dark-surface dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-mid"
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
              className="w-full p-3 border border-brand-light dark:border-gray-600 rounded-xl bg-brand-soft-bg dark:bg-dark-surface dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-mid"
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
              className="w-full p-3 border border-brand-light dark:border-gray-600 rounded-xl bg-brand-soft-bg dark:bg-dark-surface dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-mid"
              accept="image/*"
              aria-label="Subir logo de la empresa"
            />
            {logo && (
              <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                Logo seleccionado: {logo.name}
              </p>
            )}
          </div>

          <hr className="my-2 border-gray-200 dark:border-gray-700" />

          <div>
            <label className="block text-sm font-medium text-brand-text dark:text-gray-300 mb-2">
              Cargar Productos desde Excel (Simulación)
            </label>
            <input
              type="file"
              onChange={handleFileUpload}
              className="w-full p-3 border border-brand-light dark:border-gray-600 rounded-xl bg-brand-soft-bg dark:bg-dark-surface dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-mid"
              accept=".xlsx, .xls"
              aria-label="Cargar productos desde archivo Excel"
            />
            {uploadStatus && (
              <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                {uploadStatus}
              </p>
            )}
          </div>

          <div className="pt-4">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 bg-brand-primary text-white px-8 py-3 rounded-xl hover:bg-brand-mid font-semibold"
            >
              <Save className="w-5 h-5" /> Guardar Configuraciones
            </button>
          </div>
        </div>

        <div className="mt-8 p-4 bg-brand-soft-bg dark:bg-dark-surface/50 rounded-xl">
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
