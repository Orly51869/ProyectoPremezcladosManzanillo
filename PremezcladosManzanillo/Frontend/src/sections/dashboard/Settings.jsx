import React, { useState } from "react";
import { motion } from "framer-motion";
import { Settings as SettingsIcon, Save } from "lucide-react";

const Settings = () => {
  const [ivaRate, setIvaRate] = useState(16);
  const [companyName, setCompanyName] = useState(
    "Premezclados Manzanillo C.A."
  );
  const [logo, setLogo] = useState(null);

  const handleSave = () => {
    alert("Configuraciones guardadas (simulado)!");
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
