import React from 'react';
import { X } from 'lucide-react';
import { formatCurrency } from '../../utils/helpers';

const ClientDetail = ({ client, onClose = () => {} }) => {
  if (!client) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-dark-primary rounded-2xl w-full max-w-2xl p-6 shadow-lg border border-brand-light dark:border-dark-surface">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold text-brand-primary dark:text-gray-100">{client.name}</h2>
            <p className="text-sm text-brand-text dark:text-gray-300">RIF: {client.rif}</p>
            <p className="text-sm text-brand-text dark:text-gray-400">{client.address}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-md bg-gray-100 dark:bg-dark-surface hover:bg-gray-200 dark:hover:bg-gray-600">
            <X className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-brand-text dark:text-gray-400">Email</p>
            <p className="font-medium text-gray-800 dark:text-gray-100">{client.email || '—'}</p>
          </div>
          <div>
            <p className="text-sm text-brand-text dark:text-gray-400">Teléfono</p>
            <p className="font-medium text-gray-800 dark:text-gray-100">{client.phone || '—'}</p>
          </div>
        </div>

        <div className="mb-4 dark:bg-dark-surface/50 p-4 rounded-lg">
          <p className="text-sm text-brand-text dark:text-gray-400">Transacciones</p>
          <p className="font-medium text-gray-800 dark:text-gray-100">{client.transactions || 0}</p>
          <p className="text-sm text-brand-text dark:text-gray-400 mt-2">Balance</p>
          <p className="font-medium text-gray-800 dark:text-gray-100">{formatCurrency(client.balance || 0)}</p>
        </div>

        <div className="flex justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded-lg bg-brand-mid text-white hover:bg-brand-primary">Cerrar</button>
        </div>
      </div>
    </div>
  );
};

export default ClientDetail;
