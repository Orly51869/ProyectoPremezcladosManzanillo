import React from 'react';
import { motion } from 'framer-motion';
import { Users, Edit, Trash2 } from 'lucide-react';
import ClientTable from './ClientTable.jsx';

const ClientList = ({ clients = [], viewMode, onEdit, onDelete, userRoles, currentUserId }) => {
  const canEditOrDeleteClient = (client) => {
    // Check if the client has associated budgets
    const hasBudgets = client._count.budgets > 0;

    // Admin can always edit/delete
    if (userRoles.includes('Administrador')) {
      return true;
    }

    // Contable can edit/delete if client has budgets
    if (hasBudgets && userRoles.includes('Contable')) {
      return true;
    }
    
    // Comercial can edit/delete if client does not have budgets AND is the owner
    if (!hasBudgets && userRoles.includes('Comercial') && client.ownerId === currentUserId) {
      return true;
    }

    // If "Usuario" and client has no budgets and is owner
    // Assuming 'Usuario' role doesn't have an explicit permission check here,
    // as it's implied by the absence of other roles or specific client ownership logic.
    // However, the previous frontend code in ClientsPage.jsx for 'canEditOrDeleteClient'
    // only checked Admin or Commercial+owner. Let's stick to the user's explicit rule:
    // "Usuario" can modify it always and when it's not associated with a budget.
    // This implies that if it has no budgets, a 'Usuario' can modify it IF they are the owner.
    // The backend handles the final authorization. Frontend only controls UI visibility.
    if (!hasBudgets && userRoles.includes('Usuario') && client.ownerId === currentUserId) {
      return true;
    }


    return false;
  };

  return (
    <div>
      {clients.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="md:col-span-3 text-center py-12"
        >
          <Users className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No hay clientes que coincidan con la búsqueda.</p>
        </motion.div>
      ) : viewMode === 'canvas' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clients.map((client) => (
            <motion.div
              key={client.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-dark-surface rounded-2xl p-6 shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
            >
              <h3 className="text-lg font-bold text-brand-primary dark:text-gray-100 mb-2">{client.name}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">RIF: <span className="font-medium">{client.rif || 'N/A'}</span></p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Email: {client.email}</p>
              {client.phone && <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Teléfono: {client.phone}</p>}
              
              {canEditOrDeleteClient(client) && (
                <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button onClick={() => onEdit(client)} className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 py-2 px-4 rounded-lg text-center hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center justify-center gap-2">
                    <Edit className="w-4 h-4" /> Editar
                  </button>
                  <button onClick={() => onDelete(client.id)} className="bg-red-50 dark:bg-red-900/50 text-red-600 dark:text-red-400 py-2 px-4 rounded-lg hover:bg-red-100 dark:hover:bg-red-900 flex items-center justify-center gap-2">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      ) : (
        <ClientTable clients={clients} onEdit={onEdit} onDelete={onDelete} userRoles={userRoles} currentUserId={currentUserId} canEditOrDeleteClient={canEditOrDeleteClient} />
      )}
    </div>
  );
};

export default ClientList;