import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import api from '../utils/api';
import { Users, Save, ShieldAlert } from 'lucide-react';

const AdminRolesPage = () => {
  const { user } = useAuth0();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/users');
      setUsers(response.data);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('No se pudieron cargar los usuarios. Asegúrate de tener permisos de administrador.');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      setUpdating(userId);
      setError(null);
      setSuccess(null);
      
      const roles = [newRole]; // Enviar como array
      await api.put(`/api/users/${userId}/roles`, { roles });
      
      // Actualizar estado localmente
      setUsers(users.map(u => 
        u.user_id === userId ? { ...u, roles: [newRole] } : u
      ));
      setSuccess('Rol actualizado correctamente.');
    } catch (err) {
      console.error('Error updating role:', err);
      setError('Error al actualizar el rol.');
    } finally {
      setUpdating(null);
    }
  };

  if (loading) return <div className="p-8 text-center">Cargando usuarios...</div>;

  return (
    <div className="w-full p-6 dark:bg-dark-primary min-h-screen">
      <div className="flex items-center gap-4 mb-6">
        <Users className="w-8 h-8 text-brand-primary dark:text-green-400" />
        <h1 className="text-3xl font-bold text-brand-primary dark:text-white">
          Gestión de Roles de Usuario
        </h1>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 flex items-center gap-2">
            <ShieldAlert size={20} />
            <span>{error}</span>
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
            <span className="block sm:inline">{success}</span>
        </div>
      )}

      <div className="bg-white dark:bg-dark-surface rounded-2xl shadow-lg border border-brand-light dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Usuario
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Email
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Rol Actual
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-dark-surface divide-y divide-gray-200 dark:divide-gray-700">
              {users.map((u) => (
                <tr key={u.user_id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <img className="h-10 w-10 rounded-full" src={u.picture} alt="" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{u.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500 dark:text-gray-300">{u.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      {u.roles && u.roles.length > 0 ? u.roles.join(', ') : 'Sin rol'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <select
                      disabled={updating === u.user_id}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      defaultValue={u.roles && u.roles.length > 0 ? u.roles[0] : ''}
                      onChange={(e) => {
                          if (window.confirm(`¿Estás seguro de asignar el rol ${e.target.value} a ${u.name}?`)) {
                              handleRoleChange(u.user_id, e.target.value);
                          }
                      }}
                    >
                      <option value="" disabled>Seleccionar Rol</option>
                      <option value="Administrador">Administrador</option>
                      <option value="Contable">Contable</option>
                      <option value="Comercial">Comercial</option>
                      <option value="Usuario">Usuario</option>
                    </select>
                    {updating === u.user_id && <span className="text-xs text-brand-mid ml-2">Actualizando...</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminRolesPage;
