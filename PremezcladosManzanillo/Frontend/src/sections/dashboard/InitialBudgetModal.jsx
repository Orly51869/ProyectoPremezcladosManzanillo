import React, { useState, useEffect } from 'react';
import Modal from '../../components/Modal';
import api from '../../utils/api';

const InitialBudgetModal = ({ onSave, onCancel }) => {
  const [clients, setClients] = useState([]);
  const [clientId, setClientId] = useState('');
  const [title, setTitle] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // Obtener clientes para el desplegable
    const fetchClients = async () => {
      try {
        const response = await api.get('/api/clients');
        setClients(response.data);
      } catch (err) {
        console.error("Failed to fetch clients", err);
        setError("No se pudieron cargar los clientes.");
      }
    };
    fetchClients();
  }, []);

  const handleSave = () => {
    if (!clientId || !title) {
      setError('El cliente y el título son obligatorios.');
      return;
    }
    onSave({ clientId, title, address });
  };

  return (
    <Modal title="Iniciar Nuevo Presupuesto" onClose={onCancel}>
      <div className="space-y-4">
        {error && <p className="text-sm text-red-500">{error}</p>}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Cliente
          </label>
          <select
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            className="mt-1 block w-full rounded-lg border-gray-300 dark:bg-dark-surface dark:border-gray-600 focus:border-brand-primary focus:ring-brand-primary"
          >
            <option value="">Seleccionar Cliente</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Título del Presupuesto
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full rounded-lg border-gray-300 dark:bg-dark-surface dark:border-gray-600 focus:border-brand-primary focus:ring-brand-primary"
            placeholder="Ej. Remodelación Cocina"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Dirección / Ubicación (Opcional)
          </label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="mt-1 block w-full rounded-lg border-gray-300 dark:bg-dark-surface dark:border-gray-600 focus:border-brand-primary focus:ring-brand-primary"
            placeholder="Calle, sector, ciudad"
          />
        </div>
        <div className="flex justify-end gap-4 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 hover:bg-gray-300"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2 rounded-lg text-white bg-brand-primary hover:bg-brand-mid"
          >
            Continuar
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default InitialBudgetModal;
