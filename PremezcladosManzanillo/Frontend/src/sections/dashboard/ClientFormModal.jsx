import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const ClientFormModal = ({ initialValues = {}, onSave, onCancel, isEditing, serverError }) => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '' });
  const [rifPrefix, setRifPrefix] = useState('V'); // Default to 'V'
  const [rifNumber, setRifNumber] = useState('');
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    if (serverError) {
      setApiError(serverError);
      // If the error is about the email, also set it in the form errors
      if (serverError.toLowerCase().includes('email')) {
        setErrors(prev => ({ ...prev, email: serverError }));
      }
    } else {
      setApiError('');
    }
  }, [serverError]);

  useEffect(() => {
    // Reset apiError and form errors when initialValues change (modal is reopened)
    setApiError('');
    setErrors({});

    // Parse RIF for editing
    if (initialValues.rif) {
      const parts = initialValues.rif.split('-');
      if (parts.length === 2) {
        setRifPrefix(parts[0]);
        setRifNumber(parts[1]);
      } else {
        // Fallback if RIF is not in expected format
        setRifPrefix('V');
        setRifNumber(initialValues.rif);
      }
    } else {
      setRifPrefix('V');
      setRifNumber('');
    }

    setForm({
      name: initialValues.name || '',
      email: initialValues.email || '',
      phone: initialValues.phone || '',
      address: initialValues.address || '',
    });
  }, [initialValues]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    // Clear API error and validation error on change
    if (apiError) setApiError('');
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: undefined }));
  };

  const handleRifNumberChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, ''); // Only allow digits
    setRifNumber(value);
  };

  const validate = () => {
    const err = {};
    if (!form.name || form.name.trim().length < 3) err.name = 'El nombre del cliente es requerido.';
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) err.email = 'El correo electrónico es requerido y debe ser válido.';
    if (!rifNumber.trim()) err.rif = 'El número de RIF/Cédula es requerido.';
    return err;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const err = validate();
    setErrors(err);
    if (Object.keys(err).length > 0) return;

    const fullRif = rifNumber.trim() ? `${rifPrefix}-${rifNumber}` : '';

    onSave({ ...form, rif: fullRif });
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative max-w-lg mx-auto bg-white dark:bg-dark-primary p-6 rounded-2xl shadow-lg border border-brand-light dark:border-dark-surface"
      >
        <h2 className="text-xl font-semibold text-green-800 dark:text-green-300 mb-4">
          {isEditing ? 'Editar Cliente' : 'Crear Nuevo Cliente'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {apiError && (
            <div className="bg-red-500 text-white px-4 py-3 rounded relative font-semibold text-lg mb-4" role="alert">
              <span className="block sm:inline">{apiError} Por favor, corrige los errores para continuar.</span>
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nombre del Cliente</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-lg border ${errors.name ? 'border-red-500' : 'border-gray-200 dark:border-gray-600'} bg-white dark:bg-dark-surface px-3 py-2 focus:ring-2 focus:ring-green-200 dark:text-gray-200`}
              placeholder="Ej. Constructora ABC"
            />
            {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Correo Electrónico</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-lg border ${errors.email ? 'border-red-500' : 'border-gray-200 dark:border-gray-600'} bg-white dark:bg-dark-surface px-3 py-2 focus:ring-2 focus:ring-green-200 dark:text-gray-200`}
              placeholder="ejemplo@constructora.com"
            />
            {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">RIF / Cédula</label>
            <div className="mt-1 flex rounded-lg shadow-sm">
              <select
                value={rifPrefix}
                onChange={(e) => setRifPrefix(e.target.value)}
                className="block rounded-l-lg border border-r-0 border-gray-200 dark:border-gray-600 bg-white dark:bg-dark-surface px-3 py-2 text-gray-900 dark:text-gray-200 focus:ring-2 focus:ring-green-200"
              >
                <option value="V">V</option>
                <option value="E">E</option>
                <option value="J">J</option>
                <option value="G">G</option>
              </select>
              <input
                type="text"
                name="rif"
                value={rifNumber}
                onChange={handleRifNumberChange}
                className="block w-full rounded-r-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-dark-surface px-3 py-2 text-gray-900 dark:text-gray-200 focus:ring-2 focus:ring-green-200"
                placeholder="Ej. 12345678"
              />
            </div>
            {errors.rif && <p className="text-sm text-red-500 mt-1">{errors.rif}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Teléfono (Opcional)</label>
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              className="mt-1 block w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-dark-surface px-3 py-2 focus:ring-2 focus:ring-green-200 dark:text-gray-200"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Dirección (Opcional)</label>
            <input
              name="address"
              value={form.address}
              onChange={handleChange}
              className="mt-1 block w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-dark-surface px-3 py-2 focus:ring-2 focus:ring-green-200 dark:text-gray-200"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-dark-surface text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600"
            >
              Cancelar
            </button>
            <button type="submit" className="px-5 py-2 rounded-lg bg-green-700 text-white hover:bg-green-600">
              {isEditing ? 'Guardar Cambios' : 'Crear Cliente'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default ClientFormModal;