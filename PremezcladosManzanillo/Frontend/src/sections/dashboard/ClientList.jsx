import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Search, Edit, Trash, List, LayoutGrid } from 'lucide-react';
import { Link } from 'react-router-dom';
import { mockClients } from '../../mock/data';
import { filterClients } from '../../utils/helpers';
import ClientDetail from './ClientDetail';
import ClientTable from './ClientTable.jsx';

const ClientList = () => {
  const [search, setSearch] = useState('');
  const [clients, setClients] = useState(mockClients || []);
  const [selectedClient, setSelectedClient] = useState(null);
  const [viewMode, setViewMode] = useState('canvas'); // 'canvas' or 'list'
  const filteredClients = filterClients(clients, search);

  const handleView = (client) => {
    if (!client || !client.id) {
      alert('Cliente inválido.');
      return;
    }
    const found = clients.find((c) => c.id === client.id);
    if (!found) {
      alert('Cliente no encontrado.');
      return;
    }
    setSelectedClient(found);
  };

  const handleDelete = async (client) => {
    try {
      if (!client || !client.id) {
        alert('ID de cliente inválido.');
        return;
      }

      const confirmed = confirm('¿Seguro que deseas eliminar este cliente?');
      if (!confirmed) return;

      const res = await simulateDeleteClient(client.id);
      if (!res || !res.ok) throw new Error('Error al eliminar el cliente');

      setClients((prev) => prev.filter((c) => c.id !== client.id));
      if (selectedClient && selectedClient.id === client.id) setSelectedClient(null);
    } catch (err) {
      console.error('Delete client error', err);
      alert('No fue posible eliminar el cliente. Intenta nuevamente.');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4 mb-8">
        <Users className="w-8 h-8 text-brand-mid dark:text-green-400" />
        <h1 className="text-3xl font-bold text-brand-primary dark:text-dark-primary">Gestión de Clientes</h1>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-dark-primary rounded-2xl p-6 shadow-lg border border-brand-light dark:border-dark-surface mb-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 flex items-center gap-3">
            <Search className="w-5 h-5 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Buscar por nombre o RIF..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 p-3 border border-brand-light dark:border-dark-surface rounded-xl dark:bg-dark-surface focus:outline-none focus:ring-2 focus:ring-brand-mid dark:text-gray-200"
            />
          </div>
          <div className="flex gap-2">
            <button onClick={() => setViewMode('canvas')} className={`p-2 rounded-lg ${viewMode === 'canvas' ? 'bg-brand-primary text-white' : 'bg-gray-200 dark:bg-dark-surface text-gray-600 dark:text-gray-300'}`}>
              <LayoutGrid className="w-5 h-5" />
            </button>
            <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-brand-primary text-white' : 'bg-gray-200 dark:bg-dark-surface text-gray-600 dark:text-gray-300'}`}>
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>
      </motion.div>

      {viewMode === 'canvas' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients.map((client) => (
            <motion.div
              key={client.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-dark-primary rounded-2xl p-6 shadow-md border border-brand-light dark:border-dark-surface hover:shadow-lg transition-shadow"
            >
              <h3 className="text-lg font-bold text-brand-primary dark:text-gray-100 mb-2">{client.name}</h3>
              <p className="text-brand-text dark:text-gray-300 mb-1">RIF: <span className="font-medium">{client.rif}</span></p>
              <p className="text-brand-text dark:text-gray-400 mb-4">{client.address}</p>
              <p className="text-sm text-brand-text dark:text-gray-400 mb-4">Transacciones: {client.transactions} | Balance: ${(client.balance || 0).toFixed(2)}</p>
              <div className="flex gap-2">
                <button onClick={() => handleView(client)} className="flex-1 bg-brand-primary text-white py-2 px-4 rounded-lg text-center hover:bg-brand-mid flex items-center justify-center gap-2">
                  <Edit className="w-4 h-4" /> Ver Detalles
                </button>
                <button onClick={() => handleDelete(client)} className="bg-red-50 dark:bg-red-900/50 text-red-600 dark:text-red-400 py-2 px-4 rounded-lg hover:bg-red-100 dark:hover:bg-red-900 flex items-center justify-center gap-2">
                  <Trash className="w-4 h-4" /> Eliminar
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <ClientTable clients={filteredClients} onView={handleView} onDelete={handleDelete} />
      )}

      {filteredClients.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Users className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No hay clientes que coincidan con la búsqueda. ¡Agrega uno nuevo!</p>
        </motion.div>
      )}

      {selectedClient && (
        <ClientDetail client={selectedClient} onClose={() => setSelectedClient(null)} />
      )}
    </div>
  );
};

export default ClientList;