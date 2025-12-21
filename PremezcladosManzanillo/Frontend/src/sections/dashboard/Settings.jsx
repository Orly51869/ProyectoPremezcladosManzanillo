import React, { useState, useEffect } from "react";
import Papa from 'papaparse';
import { motion } from "framer-motion";
import { Settings as SettingsIcon, Save, Building2, Percent, Image as ImageIcon, FileSpreadsheet } from "lucide-react";
import { useSettings } from "../../context/SettingsContext";
import api from "../../utils/api";

const Settings = () => {
  const { settings, updateSetting, refreshSettings, loading: contextLoading } = useSettings();
  const [localSettings, setLocalSettings] = useState({});
  const [saving, setSaving] = useState(false);
  const [file, setFile] = useState(null);
  const [importReport, setImportReport] = useState(null);

  useEffect(() => {
    if (settings) {
      setLocalSettings({
        company_name: settings.company_name || "",
        company_rif: settings.company_rif || "",
        company_phone: settings.company_phone || "",
        company_address: settings.company_address || "",
        company_logo: settings.company_logo || "",
        company_iva: settings.company_iva || "16",
        company_igtf: settings.company_igtf || "3"
      });
    }
  }, [settings]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLocalSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      for (const key in localSettings) {
        if (localSettings[key] !== settings[key]) {
          await updateSetting(key, localSettings[key]);
        }
      }
      alert("Configuraciones guardadas con éxito!");
      refreshSettings();
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("Error al guardar las configuraciones.");
    } finally {
      setSaving(false);
    }
  };

  const handleImport = async () => {
    if (!file) {
      alert('Selecciona un archivo primero.');
      return;
    }

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (res) => {
        const rows = res.data || [];
        if (rows.length === 0) {
          alert('Archivo vacío.');
          return;
        }

        setSaving(true);
        let added = 0;
        let errors = 0;

        for (const row of rows) {
          try {
            // Normalización de campos comunes
            const rawType = (row.tipo || row.Tipo || row.type || row.Type || 'OTHER').toUpperCase();
            let resolvedType = 'OTHER';
            if (rawType.includes('CONCRE')) resolvedType = 'CONCRETE';
            else if (rawType.includes('BLOQU') || rawType.includes('BLOCK')) resolvedType = 'BLOCK';
            else if (rawType.includes('SERVIC')) resolvedType = 'SERVICE';

            const productData = {
              name: row.nombre || row.name || row.Nombre || row.Name,
              price: row.precio || row.price || row.Precio || row.Price,
              type: resolvedType,
              category: row.categoria || row.category || row.Categoria || row.Category,
              description: row.descripcion || row.description || row.Descripcion || row.Description || row.unidad || row.Unidad || ""
            };

            if (productData.name && productData.price) {
              await api.post('/api/products', productData);
              added++;
            } else {
              errors++;
            }
          } catch (err) {
            console.error("Error importando fila:", row, err);
            errors++;
          }
        }

        setImportReport({ added, updated: 0, skipped: errors });
        setSaving(false);
        alert(`Importación finalizada: ${added} productos añadidos, ${errors} fallidos o incompletos.`);
      }
    });
  };

  if (contextLoading) return <div className="p-8 text-center">Cargando configuración...</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4 mb-8"
      >
        <SettingsIcon className="w-10 h-10 text-brand-primary dark:text-green-400" />
        <h1 className="text-4xl font-bold text-gray-800 dark:text-white">Configuración del Sistema</h1>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Columna Izquierda: Identidad y Datos */}
        <div className="lg:col-span-2 space-y-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white dark:bg-dark-primary rounded-2xl p-8 shadow-lg border border-brand-light dark:border-dark-surface"
          >
            <h2 className="text-xl font-bold text-brand-primary mb-6 flex items-center gap-2">
              <Building2 size={24} /> Identidad Corporativa
            </h2>
            
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-600 dark:text-gray-400 mb-1">Nombre de la Empresa</label>
                  <input
                    type="text"
                    name="company_name"
                    value={localSettings.company_name}
                    onChange={handleChange}
                    className="w-full p-3 border rounded-xl dark:bg-dark-surface dark:text-white focus:ring-2 focus:ring-brand-primary"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-gray-600 dark:text-gray-400 mb-1">RIF / ID Fiscal</label>
                  <input
                    type="text"
                    name="company_rif"
                    value={localSettings.company_rif}
                    onChange={handleChange}
                    className="w-full p-3 border rounded-xl dark:bg-dark-surface dark:text-white focus:ring-2 focus:ring-brand-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-600 dark:text-gray-400 mb-1">Teléfono</label>
                  <input
                    type="text"
                    name="company_phone"
                    value={localSettings.company_phone}
                    onChange={handleChange}
                    className="w-full p-3 border rounded-xl dark:bg-dark-surface dark:text-white focus:ring-2 focus:ring-brand-primary"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-600 dark:text-gray-400 mb-1">Dirección Física</label>
                  <textarea
                    name="company_address"
                    value={localSettings.company_address}
                    onChange={handleChange}
                    rows="3"
                    className="w-full p-3 border rounded-xl dark:bg-dark-surface dark:text-white focus:ring-2 focus:ring-brand-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-600 dark:text-gray-400 mb-1 flex items-center gap-1">
                    <Percent size={14} /> Tasa de IVA (%)
                  </label>
                  <input
                    type="number"
                    name="company_iva"
                    value={localSettings.company_iva}
                    onChange={handleChange}
                    className="w-full p-3 border rounded-xl dark:bg-dark-surface dark:text-white focus:ring-2 focus:ring-brand-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-600 dark:text-gray-400 mb-1 flex items-center gap-1">
                    <Percent size={14} /> Tasa IGTF (%)
                  </label>
                  <input
                    type="number"
                    name="company_igtf"
                    value={localSettings.company_igtf}
                    onChange={handleChange}
                    className="w-full p-3 border rounded-xl dark:bg-dark-surface dark:text-white focus:ring-2 focus:ring-brand-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-600 dark:text-gray-400 mb-1 flex items-center gap-1">
                    <ImageIcon size={14} /> Logo de la Empresa
                  </label>
                  <div className="flex gap-4 items-center">
                    {localSettings.company_logo && (
                      <div className="w-16 h-16 rounded-lg border bg-gray-50 flex-shrink-0 overflow-hidden">
                        <img src={localSettings.company_logo} alt="Logo actual" className="w-full h-full object-contain" />
                      </div>
                    )}
                    <div className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files[0];
                          if (!file) return;
                          
                          setSaving(true);
                          try {
                            const formData = new FormData();
                            formData.append('asset', file);
                            const { data } = await api.post('/api/settings/upload', formData, {
                              headers: { 'Content-Type': 'multipart/form-data' }
                            });
                            setLocalSettings(prev => ({ ...prev, company_logo: data.url }));
                          } catch (error) {
                            alert("Error al subir el logo.");
                          } finally {
                            setSaving(false);
                          }
                        }}
                        className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-brand-primary file:text-white"
                      />
                      <p className="text-[10px] text-gray-400 mt-1 truncate max-w-xs">{localSettings.company_logo}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center justify-center gap-2 bg-brand-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-green-700 w-full transition-all disabled:opacity-50"
                >
                  <Save size={20} /> {saving ? "Guardando..." : "Guardar Cambios Corporativos"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>

        {/* Columna Derecha: Importación y Ayuda */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white dark:bg-dark-primary rounded-2xl p-8 shadow-lg border border-brand-light dark:border-dark-surface"
          >
            <h2 className="text-xl font-bold text-brand-primary mb-6 flex items-center gap-2">
              <FileSpreadsheet size={24} /> Importar Datos
            </h2>
            <div className="space-y-4">
              <p className="text-xs text-gray-500">Cargue masivamente sus productos desde un archivo CSV.</p>
              <input
                type="file"
                accept=".csv"
                onChange={(e) => setFile(e.target.files[0])}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-100 dark:file:bg-dark-surface file:text-brand-primary"
              />
              <button
                onClick={handleImport}
                className="w-full py-2 bg-gray-200 dark:bg-dark-surface dark:text-white rounded-xl font-bold hover:bg-gray-300 transition"
              >
                Procesar Archivo
              </button>
              {importReport && (
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-xs text-green-700 dark:text-green-300">
                  Importación exitosa: {importReport.added} productos detectados.
                </div>
              )}
            </div>
          </motion.div>

          <div className="bg-brand-soft-bg dark:bg-dark-surface/50 p-6 rounded-2xl border-2 border-brand-mid">
            <h3 className="font-bold text-brand-primary dark:text-green-300 mb-2">💡 Consejos</h3>
            <ul className="text-xs space-y-2 text-gray-600 dark:text-gray-400">
              <li>• El logo cargado aquí se reflejará en todos los PDFs.</li>
              <li>• Use la tasa de IVA actual (16% en Venezuela).</li>
              <li>• <strong>Importación CSV:</strong> El archivo debe tener estos encabezados para funcionar:
                <table className="mt-2 w-full border-collapse border border-gray-300 dark:border-gray-600">
                  <thead>
                    <tr className="bg-gray-100 dark:bg-dark-primary">
                      <th className="border p-1">Columna</th>
                      <th className="border p-1">Dato</th>
                    </tr>
                  </thead>
                  <tbody>
                     <tr><td className="border p-1">nombre</td><td className="border p-1">Ej: Concreto 250</td></tr>
                    <tr><td className="border p-1">precio</td><td className="border p-1">Ej: 145.50</td></tr>
                    <tr><td className="border p-1">tipo</td><td className="border p-1">Tipología (Concreto, Bloque, Servicio, Otro)</td></tr>
                    <tr><td className="border p-1">categoria</td><td className="border p-1">Ej: Estructurales</td></tr>
                  </tbody>
                </table>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
