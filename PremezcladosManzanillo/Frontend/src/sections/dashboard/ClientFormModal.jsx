import React, { useState, useEffect } from 'react';
import Modal from '../../components/Modal';

const ClientFormModal = ({ initialValues = {}, onSave, onCancel, isEditing, serverError }) => {
  // ... (form logic remains the same)
  const [form, setForm] = useState(() => ({
    name: (initialValues && initialValues.name) || '',
    email: (initialValues && initialValues.email) || '',
    address: (initialValues && initialValues.address) || '',
  }));
  const [rifPrefix, setRifPrefix] = useState(() => {
    if (initialValues && initialValues.rif) {
      const parts = String(initialValues.rif).split('-');
      return parts.length === 2 ? parts[0] : 'V';
    }
    return 'V';
  });
  const [rifNumber, setRifNumber] = useState(() => {
    if (initialValues && initialValues.rif) {
      const parts = String(initialValues.rif).split('-');
      return parts.length === 2 ? parts[1] : initialValues.rif || '';
    }
    return '';
  });
  const [phonePrefix, setPhonePrefix] = useState(() => {
    if (initialValues && initialValues.phone) {
      const p = String(initialValues.phone).trim();
      const m = p.match(/^(\+\d+)[\s-]?(\d+)$/);
      if (m) return m[1];
      if (p.startsWith('+')) return p.split(/\s|-/)[0];
    }
    return '+58';
  });
  const [phoneNumber, setPhoneNumber] = useState(() => {
    if (initialValues && initialValues.phone) {
      const p = String(initialValues.phone).trim();
      const m = p.match(/^(\+\d+)[\s-]?(\d+)$/);
      if (m) return m[2];
      if (p.startsWith('+')) return p.split(/\s|-/).slice(1).join('') || '';
      return p.replace(/[^0-9]/g, '');
    }
    return '';
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    if (serverError) {
      setApiError(serverError);
      if (serverError.toLowerCase().includes('email')) {
        setErrors(prev => ({ ...prev, email: serverError }));
      }
    } else {
      setApiError('');
    }
  }, [serverError]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (apiError) setApiError('');
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: undefined }));
  };

  const handleRifPrefixChange = (e) => {
    setRifPrefix(e.target.value);
    if (errors.rif) setErrors(prev => ({ ...prev, rif: undefined }));
  };

  const handleRifNumberChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setRifNumber(value);
    if (errors.rif) setErrors(prev => ({ ...prev, rif: undefined }));
  };

  const handlePhoneNumberChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setPhoneNumber(value);
    if (errors.phone) setErrors(prev => ({ ...prev, phone: undefined }));
  };

  const validate = () => {
    const err = {};
    if (!form.name || form.name.trim().length < 3) err.name = 'El nombre del cliente es requerido (mínimo 3 caracteres).';
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) err.email = 'El correo electrónico es requerido y debe ser válido.';
    
    if (!rifNumber.trim()) {
      err.rif = 'El número de RIF/Cédula es requerido.';
    } else {
      const rifLen = rifNumber.trim().length;
      if ((rifPrefix === 'J' || rifPrefix === 'G') && rifLen !== 9) {
        err.rif = `El RIF para ${rifPrefix === 'J' ? 'persona jurídica' : 'ente gubernamental'} debe tener exactamente 9 dígitos.`;
      } else if ((rifPrefix === 'V' || rifPrefix === 'E') && rifLen !== 8) {
        err.rif = `La cédula de ${rifPrefix === 'V' ? 'venezolano' : 'extranjero'} debe tener exactamente 8 dígitos.`;
      }
    }
    
    if (phoneNumber && phoneNumber.length < 7) {
      err.phone = 'Número de teléfono demasiado corto (mínimo 7 dígitos).';
    }
    return err;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const err = validate();
    setErrors(err);
    if (Object.keys(err).length > 0) return;

    const fullRif = rifNumber.trim() ? `${rifPrefix}-${rifNumber}` : '';
    const fullPhone = phoneNumber ? `${phonePrefix} ${phoneNumber}` : '';

    onSave({ ...form, rif: fullRif, phone: fullPhone });
  };

  const title = isEditing ? 'Editar Cliente' : 'Crear Nuevo Cliente';

  return (
    <Modal title={title} onClose={onCancel} zIndex="z-60">
      <form onSubmit={handleSubmit} className="space-y-4">
        {apiError && (
          <div className="bg-red-500 text-white px-4 py-3 rounded relative font-semibold text-lg mb-4" role="alert">
            <span className="block sm:inline">{apiError} Por favor, corrige los errores para continuar.</span>
          </div>
        )}
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">RIF / Cédula</label>
          <div className="mt-1 flex rounded-lg shadow-sm">
            <select
              value={rifPrefix}
              onChange={handleRifPrefixChange}
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
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Teléfono (Opcional)</label>
          <div className="mt-1 flex rounded-lg shadow-sm">
            <select
              value={phonePrefix}
              onChange={(e) => setPhonePrefix(e.target.value)}
              className="block rounded-l-lg border border-r-0 border-gray-200 dark:border-gray-600 bg-white dark:bg-dark-surface px-3 py-2 text-gray-900 dark:text-gray-200 focus:ring-2 focus:ring-green-200"
            >
              <option value="+58">+58 (VE)</option>
              <option value="+1">+1 (US/CAN)</option>
              <option value="+52">+52 (MX)</option>
              <option value="+34">+34 (ES)</option>
              <option value="+55">+55 (BR)</option>
            </select>
            <input
              name="phone"
              value={phoneNumber}
              onChange={handlePhoneNumberChange}
              className="block w-full rounded-r-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-dark-surface px-3 py-2 text-gray-900 dark:text-gray-200 focus:ring-2 focus:ring-green-200"
              placeholder="Ej. 4121234567"
            />
          </div>
          {errors.phone && <p className="text-sm text-red-500 mt-1">{errors.phone}</p>}
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
    </Modal>
  );
};

export default ClientFormModal;