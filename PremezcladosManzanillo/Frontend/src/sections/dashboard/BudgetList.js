import React, { useState, useMemo } from 'react';
import { mockClients } from '../../mock/data';
import { LayoutGrid, List } from 'lucide-react';

const BudgetList = ({
  budgets = [],
  onView = () => {},
  onEdit = () => {},
  onDelete = () => {},
  onNewForClient = () => {},
}) => {
  const [clientFilter, setClientFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' o 'list'

  const clientsById = useMemo(() => {
    const map = new Map();
    (mockClients || []).forEach((c) => map.set(String(c.id), c));
    return map;
  }, []);

  const safeDate = (val) => {
    if (!val) return '';
    try {
      const d = new Date(val);
      if (!isNaN(d)) return d.toISOString().slice(0, 10);
    } catch (e) {}
    return '';
  };

  const normalizedBudgets = useMemo(() => {
    return (budgets || []).map((b) => {
      const c = b.clientId ? clientsById.get(String(b.clientId)) : null;
      return {
        ...b,
        clientId: b.clientId || c?.id || null,
        clientName: b.clientName || c?.name || 'Cliente desconocido',
        clientRif: b.clientRif || c?.rif || '-',
        clientAddress: b.clientAddress || c?.address || '',
        createdDateStr: safeDate(b.fechaColado || b.createdAt || b.date),
      };
    });
  }, [budgets, clientsById]);

  const groups = useMemo(() => {
    const map = new Map();
    normalizedBudgets.forEach((b) => {
      const key = b.clientId || b.clientName || 'unknown';
      if (!map.has(key)) {
        map.set(key, {
          clientId: b.clientId || null,
          clientName: b.clientName || 'Cliente desconocido',
          clientRif: b.clientRif || '-',
          clientAddress: b.clientAddress || '',
          items: [],
        });
      }
      map.get(key).items.push(b);
    });
    return Array.from(map.values());
  }, [normalizedBudgets]);

  const clientOptions = useMemo(() => {
    const ids = new Set();
    groups.forEach((g) => {
      if (g.clientId) ids.add(String(g.clientId));
    });
    const opts = [{ value: 'all', label: 'Todos los clientes' }];
    (mockClients || []).forEach((c) => {
      if (ids.size === 0 || ids.has(String(c.id))) {
        opts.push({ value: String(c.id), label: c.name });
      }
    });
    return opts;
  }, [groups]);

  const matchesFilter = (b) => {
    if (clientFilter !== 'all') {
      const bid = b.clientId ? String(b.clientId) : '';
      if (bid !== clientFilter) return false;
    }
    if (statusFilter !== 'all') {
      if ((b.status || '').toLowerCase() !== statusFilter.toLowerCase()) return false;
    }
    if (dateFilter) {
      if (b.createdDateStr !== dateFilter) return false;
    }
    return true;
  };

  const formatMoney = (n) => {
    if (n == null || isNaN(Number(n))) return '$0.00';
    try {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(n));
    } catch {
      return `${Number(n).toFixed(2)}`;
    }
  };

  const filteredBudgets = useMemo(() => {
    return normalizedBudgets.filter(matchesFilter);
  }, [normalizedBudgets, clientFilter, statusFilter, dateFilter]);


  const KanbanView = () => (
    <div className="space-y-6">
        {groups.map((group) => {
            const visible = group.items.filter(matchesFilter);
            if (visible.length === 0) return null;

            return (
            <div key={`${group.clientId || group.clientName}`} className="bg-white dark:bg-dark-primary rounded-2xl p-5 shadow-sm border border-gray-200 dark:border-dark-surface">
                <div className="flex justify-between items-start">
                <div className="mb-3">
                    <h4 className="text-emerald-800 dark:text-green-300 font-semibold">{group.clientName}</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                    RIF: {group.clientRif} {group.clientAddress ? `• ${group.clientAddress}` : ''}
                    </p>
                </div>

                <button
                    onClick={() => onNewForClient && onNewForClient({ id: group.clientId || null, name: group.clientName })}
                    className="px-4 py-2 bg-green-800 text-white rounded-lg shadow-sm hover:bg-green-900"
                >
                    Nuevo Presupuesto para este Cliente
                </button>
                </div>

                <div className="space-y-4">
                {visible.map((b) => (
                    <div key={b.id} className="rounded-xl p-4 border border-gray-100 dark:border-dark-surface/50 bg-white dark:bg-dark-surface/30">
                    <div className="flex items-start justify-between">
                        <div>
                        <div className="text-sm font-medium text-emerald-800 dark:text-green-300">{b.title || 'Presupuesto'}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{b.createdDateStr || ''}</div>
                        </div>

                        <div className="text-lg font-semibold text-gray-800 dark:text-gray-100">{formatMoney(b.total ?? b.amount ?? 0)}</div>
                        {b.status && (
                        <span className="inline-block mt-1 text-[11px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                            {String(b.status)}
                        </span>
                        )}
                    </div>

                    <div className="mt-3 grid grid-cols-3 gap-0 md:max-w-md">
                        <button
                        onClick={() => onView && onView(b)}
                        className="px-3 py-2 bg-white dark:bg-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 text-sm rounded-l-lg hover:bg-gray-50 dark:hover:bg-gray-600"
                        >
                        Ver
                        </button>
                        <button
                        onClick={() => onEdit && onEdit(b)}
                        className="px-3 py-2 bg-emerald-600 text-white text-sm hover:bg-emerald-700"
                        >
                        Editar
                        </button>
                        <button
                        onClick={() => onDelete && onDelete(b)}
                        className="px-3 py-2 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 text-sm rounded-r-lg hover:bg-red-200 dark:hover:bg-red-900"
                        >
                        Eliminar
                        </button>
                    </div>
                    </div>
                ))}
                </div>
            </div>
            );
        })}
    </div>
  );

  const ListView = () => (
    <div className="bg-white dark:bg-dark-primary rounded-2xl p-5 shadow-sm border border-gray-200 dark:border-dark-surface overflow-x-auto">
      <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
          <tr>
            <th scope="col" className="px-6 py-3">Presupuesto</th>
            <th scope="col" className="px-6 py-3">Cliente</th>
            <th scope="col" className="px-6 py-3">Fecha</th>
            <th scope="col" className="px-6 py-3">Total</th>
            <th scope="col" className="px-6 py-3">Estado</th>
            <th scope="col" className="px-6 py-3">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filteredBudgets.map((b) => (
            <tr key={b.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
              <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                {b.title || 'Presupuesto'}
              </th>
              <td className="px-6 py-4">{b.clientName}</td>
              <td className="px-6 py-4">{b.createdDateStr || ''}</td>
              <td className="px-6 py-4">{formatMoney(b.total ?? b.amount ?? 0)}</td>
              <td className="px-6 py-4">
                <span className="inline-block text-[11px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                  {String(b.status)}
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <button onClick={() => onView && onView(b)} className="font-medium text-blue-600 dark:text-blue-500 hover:underline">Ver</button>
                  <button onClick={() => onEdit && onEdit(b)} className="font-medium text-emerald-600 dark:text-emerald-500 hover:underline">Editar</button>
                  <button onClick={() => onDelete && onDelete(b)} className="font-medium text-red-600 dark:text-red-500 hover:underline">Eliminar</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="border border-gray-200 dark:border-dark-surface rounded-xl p-3 flex flex-col sm:flex-row gap-3 items-center">
        <select
          value={clientFilter}
          onChange={(e) => setClientFilter(e.target.value)}
          className="px-3 py-2 bg-white dark:bg-dark-surface dark:text-gray-200 border border-gray-200 dark:border-gray-600 rounded-lg text-sm flex-1"
        >
          {clientOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-white dark:bg-dark-surface dark:text-gray-200 border border-gray-200 dark:border-gray-600 rounded-lg text-sm flex-1 sm:flex-none"
        >
          <option value="all">Todos los estados</option>
          <option value="pending">Pendiente</option>
          <option value="approved">Aprobado</option>
          <option value="pagado">Pagado</option>
        </select>

        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="px-3 py-2 bg-white dark:bg-dark-surface dark:text-gray-200 border border-gray-200 dark:border-gray-600 rounded-lg text-sm flex-1 sm:flex-none"
          placeholder="dd/mm/aaaa"
        />
        <div className="flex items-center gap-2">
            <button onClick={() => setViewMode('kanban')} className={`p-2 rounded-lg ${viewMode === 'kanban' ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-600 dark:bg-dark-surface'}`}>
                <LayoutGrid size={20} />
            </button>
            <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-600 dark:bg-dark-surface'}`}>
                <List size={20} />
            </button>
        </div>
      </div>

      {viewMode === 'kanban' ? <KanbanView /> : <ListView />}
    </div>
  );
};

export default BudgetList;
