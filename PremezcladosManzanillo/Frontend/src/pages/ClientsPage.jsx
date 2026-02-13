import React, { useState, useEffect, useMemo } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import useUserRoles from '../hooks/useUserRoles';
import api from '../utils/api';
import { PlusCircle, Users, List, LayoutGrid, Search } from 'lucide-react';
import ClientFormModal from "../sections/dashboard/ClientFormModal";
import ClientList from '../sections/dashboard/ClientList.jsx';

const ClientsPage = () => {
  const { user } = useAuth0();
  const { rawRoles: userRoles } = useUserRoles();

  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showClientFormModal, setShowClientFormModal] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [serverError, setServerError] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' o 'canvas'
  const [search, setSearch] = useState('');
  const [ownerFilter, setOwnerFilter] = useState('all');

  useEffect(() => {
    fetchClients();
  }, [userRoles]);

  const fetchClients = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/api/clients');
      setClients(response.data);
    } catch (err) {
      console.error('Error fetching clients:', err);
      setError('Error al cargar clientes. Por favor, inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const ownerOptions = useMemo(() => {
    const owners = new Map();
    clients.forEach(c => {
      if (c.owner) {
        owners.set(c.owner.id, c.owner.name);
      }
    });
    const options = Array.from(owners, ([id, name]) => ({ value: id, label: name }));
    return [{ value: 'all', label: 'Todos los Responsables' }, ...options];
  }, [clients]);

  const filteredClients = useMemo(() => {
    return clients.filter(client => {
      const matchesSearch = client.name.toLowerCase().includes(search.toLowerCase()) ||
        (client.rif && client.rif.toLowerCase().includes(search.toLowerCase())) ||
        (client.email && client.email.toLowerCase().includes(search.toLowerCase()));

      const matchesOwner = ownerFilter === 'all' || client.ownerId === ownerFilter;

      return matchesSearch && matchesOwner;
    });
  }, [clients, search, ownerFilter]);

  const handleOpenClientFormModal = (client = null) => {
    setEditingClient(client);
    setShowClientFormModal(true);
    setServerError(null); // Limpiar errores del servidor al abrir el modal
  };

  const handleCloseClientFormModal = () => {
    setEditingClient(null);
    setShowClientFormModal(false);
    setServerError(null); // Limpiar errores del servidor al cerrar el modal
  };

  const handleSaveClient = async (formData) => {
    setSuccessMessage(null);
    setServerError(null); // Limpiar error previo del servidor
    try {
      if (editingClient) {
        await api.put(`/api/clients/${editingClient.id}`, formData);
        setSuccessMessage(`Cliente "${formData.name}" actualizado con éxito.`);
      } else {
        await api.post('/api/clients', formData);
        setSuccessMessage(`Cliente "${formData.name}" creado con éxito.`);
      }
      handleCloseClientFormModal(); // Cerrar modal al guardarse correctamente
      fetchClients(); // Volver a obtener clientes al tener éxito
    } catch (err) {
      console.error('Error saving client:', err);
      if (err.response && err.response.status === 409) {
        setServerError(err.response.data.error); // Establecer error específico del servidor

      } else {
        setError('Error al guardar el cliente. Por favor, inténtalo de nuevo.');
      }
      // No cerrar modal ni volver a obtener clientes en caso de error
    }
  };

  const handleDeleteClient = async (clientId) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este cliente? Esta acción no se puede deshacer.')) {
      return;
    }
    setSuccessMessage(null);
    setError(null);
    try {
      await api.delete(`/api/clients/${clientId}`);
      setSuccessMessage('Cliente eliminado con éxito.');
      fetchClients();
    } catch (err) {
      console.error('Error deleting client:', err);
      // Mostrar mensaje de error específico del servidor si está disponible
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else if (err.response && err.response.status === 403) {
        setError('No tienes permiso para eliminar este cliente.');
      } else if (err.response && err.response.status === 404) {
        setError('El cliente no fue encontrado.');
      } else {
        setError('Error al eliminar el cliente. Por favor, inténtalo de nuevo.');
      }
    }
  };

  const canCreateClient = userRoles.includes('Administrador') || userRoles.includes('Comercial') || userRoles.includes('Usuario') || userRoles.includes('Contable');

  if (loading) {
    return (
      <div className="w-full p-6 dark:bg-dark-primary text-center text-xl dark:text-white">
        Cargando clientes...
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full p-6 dark:bg-dark-primary text-center text-xl text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="w-full p-6 dark:bg-dark-primary">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Users className="w-8 h-8 text-black dark:text-green-400" />
          <h1 className="text-3xl font-bold text-brand-primary dark:text-white">Clientes</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-2">
            <button onClick={() => setViewMode('canvas')} className={`p-2 rounded-lg ${viewMode === 'canvas' ? 'bg-brand-primary text-white' : 'bg-gray-200 dark:bg-dark-surface text-gray-600 dark:text-gray-300'}`}>
              <LayoutGrid className="w-5 h-5" />
            </button>
            <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-brand-primary text-white' : 'bg-gray-200 dark:bg-dark-surface text-gray-600 dark:text-gray-300'}`}>
              <List className="w-5 h-5" />
            </button>
          </div>
          {canCreateClient && (
            <button
              onClick={() => handleOpenClientFormModal()}
              className="bg-brand-primary text-white px-4 py-2 rounded-xl hover:bg-brand-mid transition duration-150 flex items-center gap-2"
            >
              <PlusCircle className="w-5 h-5" />
              Nuevo Cliente
            </button>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-dark-primary rounded-2xl p-6 shadow-lg border border-brand-light dark:border-dark-surface mb-6">
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="flex-1 flex items-center gap-3 w-full md:w-auto">
            <Search className="w-5 h-5 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Buscar por nombre, RIF o correo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 p-3 border border-brand-light dark:border-dark-surface rounded-xl dark:bg-dark-surface focus:outline-none focus:ring-2 focus:ring-brand-mid dark:text-gray-200"
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto justify-end">
            <select value={ownerFilter} onChange={e => setOwnerFilter(e.target.value)} className="p-3 border border-brand-light dark:border-dark-surface rounded-xl dark:bg-dark-surface text-sm dark:text-gray-200">
              {ownerOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>
        </div>
      </div>

      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{successMessage}</span>
          <span className="absolute top-0 bottom-0 right-0 px-4 py-3" onClick={() => setSuccessMessage(null)}>
            <svg className="fill-current h-6 w-6 text-green-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.15a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.15 2.758 3.15a1.2 1.2 0 0 1 0 1.698z" /></svg>
          </span>
        </div>
      )}

      {showClientFormModal && (
        <ClientFormModal
          initialValues={editingClient || {}}
          onSave={handleSaveClient}
          onCancel={handleCloseClientFormModal}
          isEditing={!!editingClient}
          serverError={serverError}
        />
      )}

      {!showClientFormModal && (
        <ClientList
          clients={filteredClients}
          viewMode={viewMode}
          onEdit={handleOpenClientFormModal}
          onDelete={handleDeleteClient}
          userRoles={userRoles}
          currentUserId={user?.sub}
        />
      )}
    </div>
  );
};

export default ClientsPage;