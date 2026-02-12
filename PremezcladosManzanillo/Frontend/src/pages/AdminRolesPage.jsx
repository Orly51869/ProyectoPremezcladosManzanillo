import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import api from '../utils/api';
import { UserCog, ShieldAlert, Trash2, FileDown, Edit2, Check, X } from 'lucide-react';

const UserAvatar = ({ user }) => {
  const [imgError, setImgError] = useState(false);

  if (user.picture && !imgError) {
    return (
      <img
        className="h-10 w-10 rounded-full object-cover border border-gray-200 dark:border-gray-700 shadow-sm"
        src={user.picture}
        alt={user.name}
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <div className="h-10 w-10 rounded-full bg-brand-primary flex items-center justify-center text-white font-bold border-2 border-white dark:border-gray-700 shadow-sm">
      {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
    </div>
  );
};

const AdminRolesPage = () => {
  const { user } = useAuth0();

  // DEBUG: Check user payload in frontend
  console.log('AdminRolesPage User:', user);
  const roles = user?.['https://premezcladomanzanillo.com/roles'] || [];
  console.log('AdminRolesPage Roles:', roles);

  const [users, setUsers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [updating, setUpdating] = useState(null);

  const [filters, setFilters] = useState({ action: '', entity: '', userName: '' });
  const [editingNameId, setEditingNameId] = useState(null);
  const [newNameValue, setNewNameValue] = useState('');

  useEffect(() => {
    fetchUsers();
    fetchAuditLogs();
  }, [filters]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/users');
      setUsers(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching users:', err);
      if (users.length === 0) {
        setError('No se pudieron cargar los usuarios. Asegúrate de tener permisos de administrador.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      setLoadingLogs(true);
      const params = new URLSearchParams();
      if (filters.action) params.append('action', filters.action);
      if (filters.entity) params.append('entity', filters.entity);
      if (filters.userName) params.append('userName', filters.userName);

      const response = await api.get(`/api/audit?${params.toString()}`);
      setAuditLogs(response.data);
    } catch (err) {
      console.error('Error fetching audit logs:', err);
    } finally {
      setLoadingLogs(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      setUpdating(userId);
      setError(null);
      setSuccess(null);

      const roles = [newRole];
      await api.put(`/api/users/${userId}/roles`, { roles });

      setUsers(prevUsers => prevUsers.map(u =>
        u.user_id === userId ? { ...u, roles: [newRole] } : u
      ));
      setSuccess('Rol actualizado correctamente.');
      fetchAuditLogs();
    } catch (err) {
      console.error('Error updating role:', err);
      setError('Error al actualizar el rol.');
    } finally {
      setUpdating(null);
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`¿Estás COMPLETAMENTE SEGURO de eliminar a "${userName}"? Esta acción lo borrará de Auth0 y del sistema. No se puede deshacer.`)) {
      return;
    }

    try {
      setUpdating(userId);
      setError(null);
      setSuccess(null);

      await api.delete(`/api/users/${userId}`);

      setUsers(prevUsers => prevUsers.filter(u => u.user_id !== userId));
      setSuccess(`Usuario "${userName}" eliminado correctamente.`);
      fetchAuditLogs();
    } catch (err) {
      console.error('Error deleting user:', err);
      setError(err.response?.data?.error || 'Error al eliminar el usuario.');
    } finally {
      setUpdating(null);
    }
  };

  const handleUpdateName = async (userId) => {
    if (!newNameValue.trim()) return;
    try {
      setUpdating(userId);
      await api.put(`/api/users/${userId}`, { name: newNameValue });

      setUsers(prevUsers => prevUsers.map(u =>
        u.user_id === userId ? { ...u, name: newNameValue } : u
      ));
      setSuccess('Nombre de usuario actualizado correctamente.');
      setEditingNameId(null);
      fetchAuditLogs();
    } catch (err) {
      console.error('Error updating name:', err);
      setError('Error al actualizar el nombre.');
    } finally {
      setUpdating(null);
    }
  };

  const exportUsersCSV = () => {
    const headers = ["ID", "Nombre", "Email", "Roles"];
    const rows = users.map(u => [
      u.user_id,
      u.name || 'Sin nombre',
      u.email,
      (u.roles || []).join(' | ')
    ]);
    generateCSV(`reporte-usuarios-${new Date().toISOString().split('T')[0]}`, headers, rows);
  };

  const exportAuditCSV = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.action) params.append('action', filters.action);
      if (filters.entity) params.append('entity', filters.entity);
      if (filters.userName) params.append('userName', filters.userName);
      params.append('all', 'true'); // Pedir todos los registros para el reporte

      const response = await api.get(`/api/audit?${params.toString()}`);
      const logsToExport = response.data;

      const headers = ["Fecha", "Usuario", "Acción", "Entidad", "Detalles"];
      const rows = logsToExport.map(log => [
        new Date(log.createdAt).toLocaleString(),
        log.userName || 'Sistema',
        log.action,
        log.entity,
        log.details || ''
      ]);
      generateCSV(`auditoria-${new Date().toISOString().split('T')[0]}`, headers, rows);
    } catch (err) {
      console.error('Error al exportar auditoría:', err);
      alert('Error al generar el reporte de auditoría.');
    }
  };

  const generateCSV = (filename, headers, rows) => {
    const escape = (val) => `"${String(val).replace(/"/g, '""')}"`;
    const csvContent = [
      headers.map(escape).join(','),
      ...rows.map(row => row.map(escape).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <div className="p-8 text-center text-gray-600 dark:text-gray-300">Cargando usuarios...</div>;

  return (
    <div className="w-full p-6 dark:bg-dark-primary min-h-screen">
      <div className="flex items-center gap-4 mb-6">
        <div className="p-3 bg-white dark:bg-dark-surface rounded-xl shadow-sm">
          <UserCog className="w-8 h-8 text-brand-primary dark:text-green-400" />
        </div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
          Gestión de Usuarios y Roles
        </h1>
        <button
          onClick={exportUsersCSV}
          className="ml-auto flex items-center gap-2 px-4 py-2 bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-dark-primary transition-all shadow-sm"
        >
          <FileDown className="w-4 h-4 text-brand-primary" />
          Reporte de Usuarios
        </button>
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

      {/* User Table */}
      <div className="bg-white dark:bg-dark-surface rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800 overflow-hidden mb-12">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
            <thead className="bg-gray-50 dark:bg-dark-primary">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Usuario
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Email
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Rol Actual
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-dark-surface divide-y divide-gray-100 dark:divide-gray-800">
              {users.map((u) => (
                <tr key={u.user_id} className="hover:bg-gray-50 dark:hover:bg-dark-primary transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <UserAvatar user={u} />
                      </div>
                      <div className="ml-4 flex items-center gap-2">
                        {editingNameId === u.user_id ? (
                          <>
                            <input
                              type="text"
                              value={newNameValue}
                              onChange={(e) => setNewNameValue(e.target.value)}
                              className="text-sm font-bold text-gray-900 dark:text-white bg-gray-100 dark:bg-dark-primary border-b border-brand-primary focus:outline-none px-1"
                              autoFocus
                            />
                            <button onClick={() => handleUpdateName(u.user_id)} className="text-green-600 hover:text-green-700">
                              <Check size={16} />
                            </button>
                            <button onClick={() => setEditingNameId(null)} className="text-red-600 hover:text-red-700">
                              <X size={16} />
                            </button>
                          </>
                        ) : (
                          <>
                            <div className="text-sm font-bold text-gray-900 dark:text-white">{u.name || 'Sin nombre'}</div>
                            <button
                              onClick={() => {
                                setEditingNameId(u.user_id);
                                setNewNameValue(u.name || '');
                              }}
                              className="text-gray-400 hover:text-brand-primary"
                              title="Editar nombre"
                            >
                              <Edit2 size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600 dark:text-gray-400">{u.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${u.roles && u.roles.length > 0
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                      }`}>
                      {u.roles && u.roles.length > 0 ? u.roles.join(', ') : 'Sin rol'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center gap-3">
                      <select
                        disabled={updating === u.user_id}
                        className="block w-full pl-3 pr-10 py-2 text-sm font-medium border-gray-200 focus:outline-none focus:ring-brand-primary focus:border-brand-primary rounded-lg dark:bg-dark-primary dark:border-gray-700 dark:text-white transition-shadow shadow-sm"
                        value={u.roles && u.roles.length > 0 ? u.roles[0] : ''}
                        onChange={(e) => {
                          const newRole = e.target.value;
                          if (window.confirm(`¿Estás seguro de asignar el rol ${newRole} a ${u.name}?`)) {
                            handleRoleChange(u.user_id, newRole);
                          }
                        }}
                      >
                        <option value="" disabled>Seleccionar Rol</option>
                        <option value="">Sin rol (Ninguno)</option>
                        <option value="Administrador">Administrador</option>
                        <option value="Contable">Contable</option>

                        <option value="Comercial">Comercial</option>
                        <option value="Usuario">Usuario</option>
                      </select>

                      <button
                        onClick={() => handleDeleteUser(u.user_id, u.name)}
                        disabled={updating === u.user_id || u.email === user.email}
                        className={`p-2 rounded-lg transition-colors ${u.email === user.email
                          ? 'text-gray-300 cursor-not-allowed'
                          : 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
                          }`}
                        title={u.email === user.email ? "No puedes eliminarte a ti mismo" : "Eliminar usuario definitivamente"}
                      >
                        <Trash2 size={18} />
                      </button>

                      {updating === u.user_id && (
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-brand-primary border-t-transparent"></div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="mt-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-brand-primary" />
            Historial de Actividad
          </h2>
          <div className="flex items-center gap-4">
            <button
              onClick={exportAuditCSV}
              className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-xl text-sm font-bold hover:bg-brand-mid transition-all shadow-md"
            >
              <FileDown className="w-4 h-4" />
              Exportar Auditoría
            </button>
            <button
              onClick={() => { setFilters({ action: '', entity: '', userName: '' }); fetchAuditLogs(); }}
              className="text-sm font-semibold text-brand-primary hover:underline"
            >
              Limpiar Filtros
            </button>
          </div>
        </div>

        {/* Filters Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 bg-white dark:bg-dark-surface p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Acción</label>
            <select
              value={filters.action}
              onChange={(e) => setFilters({ ...filters, action: e.target.value })}
              className="w-full rounded-lg border-gray-200 dark:bg-dark-primary dark:border-gray-700 text-sm"
            >
              <option value="">Todas las acciones</option>
              <option value="CREATE">CREATE (Creación)</option>
              <option value="UPDATE">UPDATE (Edición)</option>
              <option value="DELETE">DELETE (Eliminación)</option>
              <option value="APPROVE">APPROVE (Aprobación)</option>
              <option value="REJECT">REJECT (Rechazo)</option>
              <option value="VALIDATE">VALIDATE (Validación)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Entidad</label>
            <select
              value={filters.entity}
              onChange={(e) => setFilters({ ...filters, entity: e.target.value })}
              className="w-full rounded-lg border-gray-200 dark:bg-dark-primary dark:border-gray-700 text-sm"
            >
              <option value="">Todas las entidades</option>
              <option value="CLIENT">CLIENT (Clientes)</option>
              <option value="BUDGET">BUDGET (Presupuestos)</option>
              <option value="PAYMENT">PAYMENT (Pagos)</option>
              <option value="USER_ROLE">USER_ROLE (Roles)</option>
              <option value="USER">USER (Usuarios)</option>
              <option value="PRODUCT">PRODUCT (Productos)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Buscar Usuario</label>
            <input
              type="text"
              placeholder="Ej: Juan Perez..."
              value={filters.userName}
              onChange={(e) => setFilters({ ...filters, userName: e.target.value })}
              className="w-full rounded-lg border-gray-200 dark:bg-dark-primary dark:border-gray-700 text-sm"
            />
          </div>
        </div>

        <div className="bg-white dark:bg-dark-surface rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
              <thead className="bg-gray-50 dark:bg-dark-primary">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Fecha</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Usuario</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Acción</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Entidad</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Detalles</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {auditLogs.length > 0 ? (
                  auditLogs.map((log) => (
                    <tr key={log.id} className="text-sm hover:bg-gray-50 dark:hover:bg-dark-primary/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-bold text-gray-900 dark:text-white">
                        {log.userName || 'Sistema'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${log.action === 'DELETE' || log.action === 'REJECT' ? 'bg-red-100 text-red-700' :
                          log.action === 'CREATE' || log.action === 'APPROVE' || log.action === 'VALIDATE' ? 'bg-green-100 text-green-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">
                        {log.entity}
                      </td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                        {log.details}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-10 text-center text-gray-500">
                      {loadingLogs ? 'Buscando registros...' : 'No se encontraron registros con estos filtros.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminRolesPage;
