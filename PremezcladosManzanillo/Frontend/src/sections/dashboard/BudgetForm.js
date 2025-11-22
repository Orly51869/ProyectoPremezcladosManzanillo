import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const defaultValues = {
  nombreProyecto: '',
  direccion: '',
  fechaColado: '',
  tipoObra: 'vivienda',
  resistencia: '150',
  tipoConcreto: 'convencional',
  volumen: '',
  elemento: 'losa',
  requiereBomba: 'No',
  observaciones: '',
};

const BudgetForm = ({ initialValues = {}, onSave = () => {}, onCancel = () => {} }) => {
  const [form, setForm] = useState({ ...defaultValues, ...initialValues });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setForm(prev => ({ ...prev, ...initialValues }));
  }, [initialValues]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (checked ? 'Sí' : 'No') : value,
    }));
  };

  const validate = () => {
    const err = {};
    if (!form.nombreProyecto || form.nombreProyecto.trim().length < 3) err.nombreProyecto = 'Nombre del proyecto requerido';
    if (!form.fechaColado) err.fechaColado = 'Fecha estimada requerida';
    if (!form.resistencia) err.resistencia = 'Selecciona la resistencia requerida';
    if (!form.tipoConcreto) err.tipoConcreto = 'Selecciona el tipo de concreto';
    if (!form.volumen || Number(form.volumen) <= 0) err.volumen = 'Ingresa un volumen válido (m³)';
    return err;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const err = validate();
    setErrors(err);
    if (Object.keys(err).length > 0) return;

    const payload = {
      ...form,
      volumen: Number(form.volumen),
      fechaColado: form.fechaColado,
      createdAt: new Date().toISOString(),
    };

    onSave(payload);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white dark:bg-dark-primary rounded-2xl p-6 shadow-lg border border-brand-light dark:border-dark-surface max-w-4xl mx-auto"
    >
      <h2 className="text-xl font-semibold text-green-800 dark:text-green-300 mb-4">Nuevo Presupuesto</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nombre del proyecto / referencia</label>
            <input
              name="nombreProyecto"
              value={form.nombreProyecto}
              onChange={handleChange}
              className="mt-1 block w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-dark-surface px-3 py-2 focus:ring-2 focus:ring-green-200 dark:text-gray-200"
              placeholder="Ej. Edificio A - Bloque 1"
            />
            {errors.nombreProyecto && <p className="text-sm text-red-500 mt-1">{errors.nombreProyecto}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Dirección / Ubicación</label>
            <input
              name="direccion"
              value={form.direccion}
              onChange={handleChange}
              className="mt-1 block w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-dark-surface px-3 py-2 dark:text-gray-200"
              placeholder="Calle, sector, ciudad"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Fecha estimada de colado</label>
            <input
              name="fechaColado"
              type="date"
              value={form.fechaColado}
              onChange={handleChange}
              className="mt-1 block w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-dark-surface px-3 py-2 dark:text-gray-200"
            />
            {errors.fechaColado && <p className="text-sm text-red-500 mt-1">{errors.fechaColado}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tipo de obra</label>
            <select
              name="tipoObra"
              value={form.tipoObra}
              onChange={handleChange}
              className="mt-1 block w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-dark-surface px-3 py-2 dark:text-gray-200"
            >
              <option value="vivienda">Vivienda</option>
              <option value="edificio">Edificio</option>
              <option value="pavimento">Pavimento</option>
              <option value="cimentacion">Cimentación</option>
              <option value="muro">Muro</option>
              <option value="otro">Otro</option>
            </select>
          </div>
        </div>

        <hr className="my-2 border-gray-200 dark:border-gray-700" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Resistencia requerida (f’c)</label>
            <select
              name="resistencia"
              value={form.resistencia}
              onChange={handleChange}
              className="mt-1 block w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-dark-surface px-3 py-2 dark:text-gray-200"
            >
              <option value="150">150 kg/cm²</option>
              <option value="200">200 kg/cm²</option>
              <option value="250">250 kg/cm²</option>
              <option value="300">300 kg/cm²</option>
              <option value="350">350 kg/cm²</option>
            </select>
            {errors.resistencia && <p className="text-sm text-red-500 mt-1">{errors.resistencia}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tipo de concreto</label>
            <select
              name="tipoConcreto"
              value={form.tipoConcreto}
              onChange={handleChange}
              className="mt-1 block w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-dark-surface px-3 py-2 dark:text-gray-200"
            >
              <option value="convencional">Convencional</option>
              <option value="bombeable">Bombeable</option>
              <option value="con_fibra">Con fibra</option>
              <option value="rapido_fraguado">Rápido fraguado</option>
            </select>
            {errors.tipoConcreto && <p className="text-sm text-red-500 mt-1">{errors.tipoConcreto}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Volumen estimado (m³)</label>
            <input
              name="volumen"
              type="number"
              step="0.01"
              min="0"
              value={form.volumen}
              onChange={handleChange}
              className="mt-1 block w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-dark-surface px-3 py-2 dark:text-gray-200"
              placeholder="Ej. 12.5"
            />
            {errors.volumen && <p className="text-sm text-red-500 mt-1">{errors.volumen}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Elemento a colar</label>
            <select
              name="elemento"
              value={form.elemento}
              onChange={handleChange}
              className="mt-1 block w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-dark-surface px-3 py-2 dark:text-gray-200"
            >
              <option value="losa">Losa</option>
              <option value="columna">Columna</option>
              <option value="zapata">Zapata</option>
              <option value="firme">Firme</option>
              <option value="otro">Otro</option>
            </select>
          </div>

          <div className="md:col-span-2 flex items-center gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">¿Requiere bomba?</label>
              <div className="mt-1 flex items-center gap-4">
                <label className={`inline-flex items-center px-3 py-1 rounded-lg cursor-pointer ${form.requiereBomba === 'Sí' ? 'bg-green-50 dark:bg-green-900/50 border border-green-200 dark:border-green-800' : 'dark:text-gray-300'}`}>
                  <input type="radio" name="requiereBomba" value="Sí" checked={form.requiereBomba === 'Sí'} onChange={handleChange} className="mr-2" />
                  Sí
                </label>
                <label className={`inline-flex items-center px-3 py-1 rounded-lg cursor-pointer ${form.requiereBomba === 'No' ? 'bg-green-50 dark:bg-green-900/50 border border-green-200 dark:border-green-800' : 'dark:text-gray-300'}`}>
                  <input type="radio" name="requiereBomba" value="No" checked={form.requiereBomba === 'No'} onChange={handleChange} className="mr-2" />
                  No
                </label>
              </div>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Observaciones técnicas</label>
          <textarea
            name="observaciones"
            value={form.observaciones}
            onChange={handleChange}
            rows="4"
            className="mt-1 block w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-dark-surface px-3 py-2 dark:text-gray-200"
            placeholder="Notas técnicas, referencias, restricciones de acceso, etc."
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-dark-surface text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600">
            Cancelar
          </button>
          <button type="submit" className="px-5 py-2 rounded-lg bg-green-700 text-white hover:bg-green-600">
            Guardar Presupuesto
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default BudgetForm;