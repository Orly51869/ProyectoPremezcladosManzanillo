import React, { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react'; // Assuming Auth0 React SDK is used
import api from '../utils/api'; // Assuming a pre-configured axios instance
import { toast } from 'react-toastify'; // For notifications, assuming react-toastify

const AdminRolesPage = () => {
  const { getAccessTokenSilently } = useAuth0();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const roles = ['Administrador', 'Comercial', 'Contable', 'Usuario']; // Define available roles

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = await getAccessTokenSilently();
        const response = await api.get('/users', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUsers(response.data);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError(err);
        toast.error('Error al cargar usuarios.');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [getAccessTokenSilently]);

  const handleRoleChange = async (userId, newRole) => {
    try {
      const token = await getAccessTokenSilently();
      await api.put(`/users/${userId}/role`, { role: newRole }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUsers(users.map(user => (user.user_id === userId ? { ...user, app_metadata: { ...user.app_metadata, roles: [newRole] } } : user)));
      toast.success(`Rol de ${userId} actualizado a ${newRole}.`);
    } catch (err) {
      console.error('Error updating user role:', err);
      toast.error('Error al actualizar el rol del usuario.');
    }
  };

  if (loading) {
    return <div className="text-center mt-8">Cargando usuarios...</div>;
  }

  if (error) {
    return <div className="text-center mt-8 text-red-500">Error: {error.message || 'No se pudieron cargar los usuarios.'}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Gestión de Roles de Usuario</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
          <thead className="bg-gray-200 dark:bg-gray-700">
            <tr>
              <th className="py-2 px-4 text-left text-gray-600 dark:text-gray-200 font-semibold">Email</th>
              <th className="py-2 px-4 text-left text-gray-600 dark:text-gray-200 font-semibold">Nombre</th>
              <th className="py-2 px-4 text-left text-gray-600 dark:text-gray-200 font-semibold">Rol Actual</th>
              <th className="py-2 px-4 text-left text-gray-600 dark:text-gray-200 font-semibold">Cambiar Rol</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.user_id} className="border-b last:border-b-0 dark:border-gray-700">
                <td className="py-2 px-4">{user.email}</td>
                <td className="py-2 px-4">{user.name || 'N/A'}</td>
                <td className="py-2 px-4">{user.app_metadata?.roles?.[0] || 'Usuario'}</td>
                <td className="py-2 px-4">
                  <select
                    value={user.app_metadata?.roles?.[0] || 'Usuario'}
                    onChange={(e) => handleRoleChange(user.user_id, e.target.value)}
                    className="p-1 border rounded bg-gray-50 dark:bg-gray-700 dark:text-white"
                  >
                    {roles.map((roleOpt) => (
                      <option key={roleOpt} value={roleOpt}>
                        {roleOpt}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminRolesPage;
